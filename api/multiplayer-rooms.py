"""
API endpoint to list all available multiplayer game rooms
Uses Vercel KV (Redis) for shared storage
"""
from http.server import BaseHTTPRequestHandler
import json
import os
from datetime import datetime
import urllib.request
import urllib.error

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

def cleanup_old_rooms(rooms):
    """Remove rooms older than 2 hours"""
    cutoff = datetime.now().timestamp() - (2 * 60 * 60)
    return [r for r in rooms if r.get('lastActivity', 0) > cutoff]

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
