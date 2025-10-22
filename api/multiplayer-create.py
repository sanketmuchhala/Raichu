"""
API endpoint to create a new multiplayer game room
Uses Vercel KV (Redis) for shared storage across serverless functions
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

def load_rooms():
    """Load all rooms from Vercel KV or fallback"""
    # Try Vercel KV first
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
                return json.loads(data.get('result', '[]'))
        except:
            pass

    return []

def save_rooms(rooms):
    """Save rooms to Vercel KV or fallback"""
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
                raise Exception("Storage not configured. Please set up Vercel KV in your dashboard.")

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
