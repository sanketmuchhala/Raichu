"""
API endpoint to submit a move in a multiplayer game
"""
from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime
from room_utils import load_rooms, save_rooms, get_room_by_id

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

            # Get rooms
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

            # Save updated room
            rooms[room_index] = room
            save_rooms(rooms)

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
