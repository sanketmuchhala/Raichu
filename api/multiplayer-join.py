"""
API endpoint to join an existing multiplayer game room
"""
from http.server import BaseHTTPRequestHandler
import json
from room_utils import load_rooms, save_rooms, get_room_by_id, generate_room_code

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
