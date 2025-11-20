from backend import create_app

# Create the Flask app instance
app = create_app()

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Flask server...")
    print("=" * 60)
    
    # List all registered routes for debugging
    print("\n📋 Registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.endpoint}: {rule.rule} [{', '.join(rule.methods)}]")
    print("=" * 60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
# from backend.app import create_app
# from flask_cors import CORS

# app = create_app()


# CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"], supports_credentials=True)
# # Enable global CORS for React frontend
# # CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
# # CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# # CORS(app, origins=["http://localhost:3000"])

# if __name__ == "__main__":
#     app.run(debug=True, port=5001)
