"""
API endpoint to list all available multiplayer game rooms
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

def save_rooms_supabase(rooms):
    """Save rooms to Supabase"""
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')

    if supabase_url and supabase_key:
        try:
            # Delete all existing rooms
            req = urllib.request.Request(
                f"{supabase_url}/rest/v1/rooms?select=*",
                headers={
                    "apikey": supabase_key,
                    "Authorization": f"Bearer {supabase_key}",
                    "Prefer": "return=minimal"
                },
                method='DELETE'
            )
            try:
                urllib.request.urlopen(req)
            except:
                pass

            # Insert new rooms
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
                        "Prefer": "return=minimal"
                    },
                    method='POST'
                )
                urllib.request.urlopen(req)
            return True
        except Exception as e:
            print(f"Supabase save error: {e}")
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
