"""
Diagnostic endpoint to check multiplayer storage configuration
"""
from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Check what environment variables are set
            supabase_url = os.environ.get('SUPABASE_URL')
            supabase_key = os.environ.get('SUPABASE_KEY')
            jsonbin_id = os.environ.get('JSONBIN_ID')
            jsonbin_key = os.environ.get('JSONBIN_API_KEY')

            response = {
                'supabase': {
                    'url_configured': bool(supabase_url),
                    'url_preview': supabase_url[:30] + '...' if supabase_url else None,
                    'key_configured': bool(supabase_key),
                    'key_preview': supabase_key[:20] + '...' if supabase_key else None,
                },
                'jsonbin': {
                    'id_configured': bool(jsonbin_id),
                    'id_preview': jsonbin_id if jsonbin_id else None,
                    'key_configured': bool(jsonbin_key),
                    'key_preview': jsonbin_key[:20] + '...' if jsonbin_key else None,
                },
                'recommendation': ''
            }

            # Add recommendation
            if supabase_url and supabase_key:
                response['recommendation'] = 'Supabase appears configured - if room creation fails, check Supabase table setup and RLS policies'
            elif jsonbin_id and jsonbin_key:
                response['recommendation'] = 'JSONBin appears configured'
            elif supabase_url or supabase_key:
                response['recommendation'] = 'Supabase partially configured - missing URL or KEY'
            elif jsonbin_id or jsonbin_key:
                response['recommendation'] = 'JSONBin partially configured - missing ID or API_KEY'
            else:
                response['recommendation'] = 'No storage configured - please set environment variables in Vercel'

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response, indent=2).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
