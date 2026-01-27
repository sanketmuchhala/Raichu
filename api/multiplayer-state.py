"""
API endpoint to get current game state (polling endpoint)
Uses Supabase (free, simple setup) or JSONBin.io as fallback
"""
from http.server import BaseHTTPRequestHandler
import json
import os
from urllib.parse import urlparse, parse_qs
import urllib.request
import urllib.error

def load_single_room_supabase(room_id):
    """Load a single room by ID from Supabase (Robust against data types)"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')

    if supabase_url and supabase_key:
        try:
            # URL encode the room_id just in case
            safe_room_id = urllib.parse.quote(room_id)
            req = urllib.request.Request(
                f"{supabase_url}/rest/v1/rooms?room_id=eq.{safe_room_id}&select=data",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}"
                }
            )
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                if data and len(data) > 0:
                    raw_data = data[0]['data']
                    # Handle case where Supabase returns dict (jsonb) or string (double-encoded)
                    if isinstance(raw_data, str):
                        return json.loads(raw_data)
                    return raw_data
        except Exception as e:
            print(f"Supabase single load error: {e}")
    return None

def load_rooms_jsonbin():
    """Load rooms from JSONBin.io (Fallback)"""
    bin_id = os.environ.get('JSONBIN_ID')
    api_key = os.environ.get('JSONBIN_API_KEY')

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

            # 1. Try Fast Path (Supabase Atomic Load)
            room = load_single_room_supabase(room_id)
            
            # 2. Fallback to Slow Path (JSONBin) if not found in Supabase
            if not room:
                rooms = load_rooms_jsonbin()
                if rooms:
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
