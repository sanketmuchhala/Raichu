"""
API endpoint to join an existing multiplayer game room
Uses Vercel KV (Redis) for shared storage
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

def load_rooms():
    """Load all rooms from Vercel KV"""
    kv_url = os.environ.get('KV_REST_API_URL')
    kv_token = os.environ.get('KV_REST_API_TOKEN')

    if kv_url and kv_token:
        try:
            req = urllib.request.Request(
                f"{kv_url}/get/raichu_rooms",
                headers={"Authorization": f"Bearer {kv_token}"}
            )
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                result = data.get('result')
                return json.loads(result) if result else []
        except:
            pass

    return []

def save_rooms(rooms):
    """Save rooms to Vercel KV"""
    kv_url = os.environ.get('KV_REST_API_URL')
    kv_token = os.environ.get('KV_REST_API_TOKEN')

    if kv_url and kv_token:
        try:
            data = json.dumps({"value": json.dumps(rooms)}).encode()
            req = urllib.request.Request(
                f"{kv_url}/set/raichu_rooms",
                data=data,
                headers={
                    "Authorization": f"Bearer {kv_token}",
                    "Content-Type": "application/json"
                },
                method='POST'
            )
            urllib.request.urlopen(req)
            return True
        except Exception as e:
            print(f"KV save error: {e}")
            return False

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
            save_rooms(rooms)

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
