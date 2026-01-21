"""
API endpoint to submit a move in a multiplayer game
Uses Supabase (free, simple setup) or JSONBin.io as fallback
"""
from http.server import BaseHTTPRequestHandler
import json
import os
from datetime import datetime
import urllib.request
import urllib.error

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

def update_room_supabase(room):
    """Update a single room in Supabase"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')

    if supabase_url and supabase_key:
        try:
            data = json.dumps({
                "data": json.dumps(room)
            }).encode()

            req = urllib.request.Request(
                f"{supabase_url}/rest/v1/rooms?room_id=eq.{room['roomId']}",
                data=data,
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                method='PATCH'
            )
            response = urllib.request.urlopen(req)
            print(f"Supabase update success for room {room['roomId']}: {response.status}")
            return True
        except urllib.error.HTTPError as e:
            error_body = e.read().decode() if e.fp else "No error body"
            print(f"Supabase move update HTTP error {e.code}: {error_body}")
            return False
        except Exception as e:
            print(f"Supabase move update error: {type(e).__name__}: {e}")
            return False
    return False

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
            print(f"Supabase move HTTP error {e.code}: {error_body}")
            return False
        except Exception as e:
            print(f"Supabase move save error: {type(e).__name__}: {e}")
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

def load_single_room_supabase(room_id):
    """Load a single room by ID from Supabase"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')

    if supabase_url and supabase_key:
        try:
            req = urllib.request.Request(
                f"{supabase_url}/rest/v1/rooms?room_id=eq.{room_id}&select=data",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                }
            )
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                if data and len(data) > 0:
                    return json.loads(data[0]['data'])
        except Exception as e:
            print(f"Supabase single load error: {e}")
    return None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}

            room_id = data.get('roomId')
            player_id = data.get('playerId')
            new_board = data.get('board')
            move_data = data.get('move')  # Optional: move details

            if not all([room_id, player_id, new_board]):
                raise ValueError('Missing required fields')

            # FAST PATH: Try to load specific room from Supabase
            room = load_single_room_supabase(room_id)
            
            # Fallback to loading all rooms if single load failed
            rooms = None
            room_index = None
            
            if not room:
                rooms = load_rooms()
                for i, r in enumerate(rooms):
                    if r['roomId'] == room_id:
                        room = r
                        room_index = i
                        break

            if not room:
                raise ValueError('Room not found')

            # Verify it's player's turn
            current_player_color = room['currentPlayer']
            player_color = None

            if room['players']['white'] and room['players']['white']['id'] == player_id:
                player_color = 'w'
            elif room['players']['black'] and room['players']['black']['id'] == player_id:
                player_color = 'b'
            else:
                raise ValueError('Player not in room')

            if player_color != current_player_color:
                raise ValueError('Not your turn')

            # Update room state
            room['board'] = new_board
            room['currentPlayer'] = 'b' if current_player_color == 'w' else 'w'
            room['lastActivity'] = datetime.now().timestamp()

            # Add move to history if provided
            if move_data:
                room['moveHistory'].append({
                    'player': player_color,
                    'move': move_data,
                    'timestamp': datetime.now().timestamp()
                })

            # Try to update (Fast path -> Supabase PATCH, Slow path -> JSONBin Save All)
            success = False
            
            if update_room_supabase(room):
                success = True
            elif rooms is not None and room_index is not None:
                # If we loaded from legacy/JSONBin, update list and save back
                rooms[room_index] = room
                if save_rooms(rooms):
                     success = True
            
            if not success:
                 raise Exception("Failed to save room after move")

            response = {
                'success': True,
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
