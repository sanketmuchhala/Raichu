"""
API endpoint to get current game state (polling endpoint)
"""
from http.server import BaseHTTPRequestHandler
import json
import os
from urllib.parse import urlparse, parse_qs

ROOMS_FILE = '/tmp/raichu_rooms.json'

def load_rooms():
    """Load all rooms from storage"""
    if not os.path.exists(ROOMS_FILE):
        return []
    try:
        with open(ROOMS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse query parameters
            query = urlparse(self.path).query
            params = parse_qs(query)

            room_id = params.get('roomId', [None])[0]
            player_id = params.get('playerId', [None])[0]

            if not room_id:
                raise ValueError('Room ID is required')

            # Get room
            rooms = load_rooms()
            room = None
            for r in rooms:
                if r['roomId'] == room_id:
                    room = r
                    break

            if not room:
                raise ValueError('Room not found')

            # Verify player is in room
            is_player = False
            player_color = None
            if room['players']['white'] and room['players']['white']['id'] == player_id:
                is_player = True
                player_color = 'white'
            elif room['players']['black'] and room['players']['black']['id'] == player_id:
                is_player = True
                player_color = 'black'

            response = {
                'success': True,
                'room': room,
                'isPlayer': is_player,
                'playerColor': player_color
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
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
