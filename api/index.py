import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    from query import set_race_context, process_query
    HAS_QUERY = True
except ImportError:
    HAS_QUERY = False
    print("Warning: query module not found")

app = Flask(__name__)
CORS(app)

@app.route('/api/setRace', methods=['POST'])
def set_race():
    if not HAS_QUERY:
        return jsonify({"error": "Query module not available"}), 500
    
    data = request.json
    race = data.get('race')
    if race:
        message = set_race_context(race)
        return jsonify({"message": message})
    else:
        return jsonify({"error": "No race specified"}), 400

@app.route('/api/query', methods=['POST', 'OPTIONS'])
def query():
    if request.method == 'OPTIONS':
        return '', 204
    
    if not HAS_QUERY:
        return jsonify({"error": "Query module not available"}), 500
    
    data = request.json
    query_text = data.get('query')
    if query_text:
        response = process_query(query_text)
        return jsonify({"response": response})
    else:
        return jsonify({"error": "No query specified"}), 400

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

# Vercel serverless handler
def handler(request):
    return app(request.environ, request.start_response)
