from flask import Flask, request, jsonify
from flask_cors import CORS
from f1nab_hackumass.query import set_race_context, process_query

app = Flask(__name__)
CORS(app)

@app.route('/api/setRace', methods=['POST'])
def set_race():
    data = request.json
    race = data.get('race')
    if race:
        message = set_race_context(race)
        return jsonify({"message": message})
    else:
        return jsonify({"error": "No race specified"}), 400

@app.route('/api/query', methods=['POST'])
def query():
    data = request.json
    query_text = data.get('query')
    if query_text:
        response = process_query(query_text)
        return jsonify({"response": response})
    else:
        return jsonify({"error": "No query specified"}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
