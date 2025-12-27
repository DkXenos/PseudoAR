from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

# Configure the models directory
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')

@app.route('/')
def index():
    """Render the main application page"""
    return render_template('index.html')

@app.route('/models/<path:filename>')
def serve_model(filename):
    """
    Serve 3D model files (.pmx, textures, etc.) from the models directory.
    This route handles CORS and allows Three.js to fetch model files.
    """
    return send_from_directory(MODELS_DIR, filename)

@app.after_request
def add_cors_headers(response):
    """Add CORS headers to allow Three.js to load resources"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

if __name__ == '__main__':
    # Run the Flask development server
    app.run(debug=True, host='127.0.0.1', port=5000)
