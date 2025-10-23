"""
API endpoint to join an existing multiplayer game room
Uses Supabase (free, simple setup) or JSONBin.io as fallback
"""
from http.server import BaseHTTPRequestHandler
import json
import os
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
            req = urllib.request.Request(
                f"{supabase_url}/rest/v1/rooms?select=*",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                }
            )
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                rooms = [json.loads(row['data']) for row in data] if data else []
                return rooms
        except Exception as e:
            print(f"Supabase error: {e}")
    return None

def load_rooms_jsonbin():
    """Load rooms from JSONBin.io"""
    bin_id = os.environ.get('JSONBIN_ID')
    api_key = os.environ.get('JSONBIN_API_KEY', '$2a$10$samplekey')

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
    rooms = load_rooms_supabase()
    if rooms is not None:
        return rooms

    rooms = load_rooms_jsonbin()
    if rooms is not None:
        return rooms

    return []

def save_rooms_supabase(rooms):
    """Save rooms to Supabase"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')

    if supabase_url and supabase_key:
        try:
            # Insert or update each room using upsert
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
                        "Prefer": "resolution=merge-duplicates,return=minimal"
                    },
                    method='POST'
                )
                response = urllib.request.urlopen(req)
                print(f"Supabase upsert success for room {room['roomId']}: {response.status}")
            return True
        except urllib.error.HTTPError as e:
            error_body = e.read().decode() if e.fp else "No error body"
            print(f"Supabase join save HTTP error {e.code}: {error_body}")
            return False
        except Exception as e:
            print(f"Supabase join save error: {type(e).__name__}: {e}")
            return False
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
    if save_rooms_supabase(rooms):
        return True

    if save_rooms_jsonbin(rooms):
        return True

    return False

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}

            room_id = data.get('roomId')
            player_name = data.get('playerName', 'Player 2')

            if not room_id:
                raise ValueError('Room ID is required')

            # Get room
            rooms = load_rooms()
            room = None
            room_index = None

            for i, r in enumerate(rooms):
                if r['roomId'] == room_id:
                    room = r
                    room_index = i
                    break

            if not room:
                raise ValueError('Room not found')

            if room['status'] != 'waiting':
                raise ValueError('Room is not available')

            if room['players']['black'] is not None:
                raise ValueError('Room is full')

            # Add player to room
            player_id = generate_room_code()
            room['players']['black'] = {
                'id': player_id,
                'name': player_name,
                'connected': True
            }
            room['status'] = 'playing'

            # Save updated room
            rooms[room_index] = room
            if not save_rooms(rooms):
                raise Exception("Failed to save room after join")

            response = {
                'success': True,
                'playerId': player_id,
                'playerColor': 'black',
                'room': room
            }

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except ValueError as e:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {'success': False, 'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())

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
