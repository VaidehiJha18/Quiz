from backend.app import create_app
from flask_cors import CORS

app = create_app()

# Enable global CORS for React frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
