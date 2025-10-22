"""
Utility functions for managing multiplayer game rooms
"""
import json
import os
from datetime import datetime, timedelta
import random
import string

ROOMS_FILE = '/tmp/raichu_rooms.json'

def generate_room_code():
    """Generate a unique 6-character room code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def load_rooms():
    """Load all rooms from storage"""
    if not os.path.exists(ROOMS_FILE):
        return []

    try:
        with open(ROOMS_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_rooms(rooms):
    """Save rooms to storage"""
    with open(ROOMS_FILE, 'w') as f:
        json.dump(rooms, f)

def cleanup_old_rooms(rooms):
    """Remove rooms older than 2 hours"""
    cutoff = datetime.now().timestamp() - (2 * 60 * 60)  # 2 hours
    return [r for r in rooms if r.get('lastActivity', 0) > cutoff]

def get_room_by_id(room_id):
    """Get a specific room by ID"""
    rooms = load_rooms()
    for room in rooms:
        if room['roomId'] == room_id:
            return room
    return None

def update_room(room_id, updates):
    """Update a specific room"""
    rooms = load_rooms()
    for i, room in enumerate(rooms):
        if room['roomId'] == room_id:
            room.update(updates)
            room['lastActivity'] = datetime.now().timestamp()
            rooms[i] = room
            save_rooms(rooms)
            return room
    return None

def create_room_data(room_id, player_name):
    """Create initial room data structure"""
    return {
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
