"""
API endpoint to list all available multiplayer game rooms
"""
from http.server import BaseHTTPRequestHandler
import json
from room_utils import load_rooms, cleanup_old_rooms, save_rooms

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Load and cleanup rooms
            rooms = load_rooms()
            rooms = cleanup_old_rooms(rooms)
            save_rooms(rooms)

            # Filter and format rooms for display
            available_rooms = []
            for room in rooms:
                # Only show waiting or playing rooms
                if room['status'] in ['waiting', 'playing']:
                    room_info = {
                        'roomId': room['roomId'],
                        'roomName': room['roomName'],
                        'status': room['status'],
                        'playerCount': 1 if room['players']['black'] is None else 2,
                        'createdAt': room['createdAt'],
                        'canJoin': room['status'] == 'waiting' and room['players']['black'] is None
                    }
                    available_rooms.append(room_info)

            # Sort by creation time (newest first)
            available_rooms.sort(key=lambda x: x['createdAt'], reverse=True)

            response = {
                'success': True,
                'rooms': available_rooms,
                'count': len(available_rooms)
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
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
