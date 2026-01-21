"""
API endpoint to create a new multiplayer game room
Uses Supabase (free, simple setup) or JSONBin.io as fallback
"""
from http.server import BaseHTTPRequestHandler
import json
import os
from datetime import datetime
import random
import string
import urllib.request
import urllib.error

def generate_room_code():
    """Generate a unique 6-character room code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def load_rooms_supabase():
    """Load rooms from Supabase"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')

    if supabase_url and supabase_key:
        try:
            # Get all rooms from Supabase
            req = urllib.request.Request(
                f"{supabase_url}/rest/v1/rooms?select=*",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                }
            )
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                # Convert Supabase rows to room format
                rooms = [json.loads(row['data']) for row in data] if data else []
                return rooms
        except Exception as e:
            print(f"Supabase error: {e}")
    return None

def load_rooms_jsonbin():
    """Load rooms from JSONBin.io"""
    bin_id = os.environ.get('JSONBIN_ID')
    api_key = os.environ.get('JSONBIN_API_KEY', '$2a$10$samplekey')  # Public bin

    if bin_id:
        try:
            req = urllib.request.Request(
                f"https://api.jsonbin.io/v3/b/{bin_id}/latest",
                headers={"X-Master-Key": api_key}
            )
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                return data.get('record', {}).get('rooms', [])
        except:
            pass
    return None

def load_rooms():
    """Load all rooms with fallback chain"""
    # Try Supabase first (recommended)
    rooms = load_rooms_supabase()
    if rooms is not None:
        return rooms

    # Try JSONBin as fallback
    rooms = load_rooms_jsonbin()
    if rooms is not None:
        return rooms

    # Final fallback - return empty (will show error to user)
    return []

def save_rooms_supabase(rooms):
    """
    DEPRECATED/REMOVED: This function used to save all rooms at once.
    This caused massive duplication bugs because Supabase Upsert requires 
    unique constraints which might not be set, and rewriting the whole DB is bad.
    
    We now ONLY use atomic inserts/updates.
    """
    # Safety: Return False to force usage of atomic methods or fallback to JSONBin
    return False

def save_rooms_jsonbin(rooms):
    """Save rooms to JSONBin"""
    bin_id = os.environ.get('JSONBIN_ID')
    api_key = os.environ.get('JSONBIN_API_KEY')

    if bin_id and api_key:
        try:
            data = json.dumps({"rooms": rooms}).encode()
            req = urllib.request.Request(
                f"https://api.jsonbin.io/v3/b/{bin_id}",
                data=data,
                headers={
                    "X-Master-Key": api_key,
                    "Content-Type": "application/json"
                },
                method='PUT'
            )
            urllib.request.urlopen(req)
            return True
        except Exception as e:
            print(f"JSONBin save error: {e}")
    return False

def save_rooms(rooms):
    """Save rooms with fallback chain"""
    # Try Supabase first
    if save_rooms_supabase(rooms):
        return True

    # Try JSONBin as fallback
    if save_rooms_jsonbin(rooms):
        return True

    return False

def cleanup_old_rooms(rooms):
    """Remove rooms older than 2 hours"""
    cutoff = datetime.now().timestamp() - (2 * 60 * 60)
    return [r for r in rooms if r.get('lastActivity', 0) > cutoff]

def insert_room_supabase(room):
    """Insert a single room to Supabase"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')

    if supabase_url and supabase_key:
        try:
            data = json.dumps({
                "room_id": room['roomId'],
                "data": json.dumps(room)
            }).encode()

            req = urllib.request.Request(
                f"{supabase_url}/rest/v1/rooms",
                data=data,
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                method='POST'
            )
            try:
                urllib.request.urlopen(req)
                return True
            except urllib.error.HTTPError as e:
                # If room exists (unlikely with random ID), this might fail
                print(f"Supabase insert error: {e}")
                return False
        except Exception as e:
            print(f"Supabase insert exception: {e}")
            return False
    return False

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}

            player_name = data.get('playerName', 'Player')

            # Generate unique room ID
            room_id = f"GAME-{generate_room_code()}"

            # Create room data
            room = {
                'roomId': room_id,
                'roomName': f"{player_name}'s Game",
                'status': 'waiting',
                'board': 'wwwwwwww' + '.' * 48 + 'bbbbbbbb',
                'currentPlayer': 'w',
                'players': {
                    'white': {
                        'id': generate_room_code(),
                        'name': player_name,
                        'connected': True
                    },
                    'black': None
                },
                'createdAt': datetime.now().timestamp(),
                'lastActivity': datetime.now().timestamp(),
                'gameOver': False,
                'winner': None,
                'moveHistory': []
            }

            # FAST PATH: Try to insert directly to Supabase first
            if insert_room_supabase(room):
                # Success! No need to load old rooms or use fallbacks
                response = {
                    'success': True,
                    'roomId': room_id,
                    'playerId': room['players']['white']['id'],
                    'playerColor': 'white',
                    'room': room
                }
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())
                return

            # SLOW PATH / FALLBACK: Load all rooms (only needed for JSONBin or Supabase failure)
            rooms = load_rooms()
            rooms = cleanup_old_rooms(rooms)
            rooms.append(room)

            # Try to save with detailed error reporting for fallback
            supabase_url = os.environ.get('SUPABASE_URL')
            supabase_key = os.environ.get('SUPABASE_KEY')
            jsonbin_id = os.environ.get('JSONBIN_ID')
            jsonbin_key = os.environ.get('JSONBIN_API_KEY')

            if not save_rooms(rooms):
                # Build detailed error message
                error_parts = []
                if supabase_url and supabase_key:
                    error_parts.append(f"Supabase connection failed (URL: {supabase_url[:30]}...)")
                elif supabase_url or supabase_key:
                    error_parts.append("Supabase partially configured")

                if jsonbin_id and jsonbin_key:
                    error_parts.append("JSONBin save failed")
                else:
                    error_parts.append("No storage configured")

                raise Exception(" | ".join(error_parts))

            # Return room info
            response = {
                'success': True,
                'roomId': room_id,
                'playerId': room['players']['white']['id'],
                'playerColor': 'white',
                'room': room
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
