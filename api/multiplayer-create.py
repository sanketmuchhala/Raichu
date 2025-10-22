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
    """Save rooms to Supabase"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')

    if supabase_url and supabase_key:
        try:
            # First, delete all existing rooms
            req = urllib.request.Request(
                f"{supabase_url}/rest/v1/rooms?select=*",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Prefer": "return=minimal"
                },
                method='DELETE'
            )
            try:
                urllib.request.urlopen(req)
            except:
                pass  # Table might be empty

            # Insert new rooms
            for room in rooms:
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
                urllib.request.urlopen(req)
            return True
        except Exception as e:
            print(f"Supabase save error: {e}")
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

            # Load existing rooms and cleanup old ones
            rooms = load_rooms()
            rooms = cleanup_old_rooms(rooms)
            rooms.append(room)

            if not save_rooms(rooms):
                raise Exception("Storage not configured. See MULTIPLAYER_SETUP.md for 2-minute setup instructions.")

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
