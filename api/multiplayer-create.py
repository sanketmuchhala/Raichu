"""
API endpoint to create a new multiplayer game room
"""
from http.server import BaseHTTPRequestHandler
import json
from room_utils import load_rooms, save_rooms, create_room_data, generate_room_code, cleanup_old_rooms

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
            room = create_room_data(room_id, player_name)

            # Load existing rooms and cleanup old ones
            rooms = load_rooms()
            rooms = cleanup_old_rooms(rooms)
            rooms.append(room)
            save_rooms(rooms)

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
