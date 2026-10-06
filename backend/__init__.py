import os
from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure GOOGLE_API_KEY is available in os.environ for LangChain / Gemini
    if app.config.get("GOOGLE_API_KEY"):
        os.environ["GOOGLE_API_KEY"] = app.config["GOOGLE_API_KEY"]

    # ✅ Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.admin import admin_bp
    from .routes.professor import professor_bp
    from .routes.student import student_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(professor_bp, url_prefix='/prof')
    app.register_blueprint(student_bp, url_prefix='/student')

    print("✅ Flask app created successfully with CORS enabled")
    
    return app
