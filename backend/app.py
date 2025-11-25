from flask import Flask, request
from flask_cors import CORS  
from .config import Config
import os

def create_app(config_class=Config):
    app = Flask(__name__)

    app.config.from_object(config_class)  
    # DEBUG: Print what's in the config
    print("=" * 50)
    print("APP CONFIG:")
    print(f"DB_HOST: {app.config.get('DB_HOST')}")
    print(f"DB_USER: {app.config.get('DB_USER')}")
    print(f"DB_DATABASE: {app.config.get('DB_DATABASE')}")
    print(f"DB_PORT: {app.config.get('DB_PORT')}")
    print("=" * 50)
    app.config.update(
        SESSION_COOKIE_SECURE = False
        # SECRET_KEY=app.config.get('SECRET_KEY')
    )
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

    # Enable CORS for all routes
    CORS(app, 
         resources={r"/*": {"origins": FRONTEND_URL}}, 
         supports_credentials=True)
    # CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    
    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.professor import professor_bp
    from .routes.student import student_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(professor_bp, url_prefix='/prof')
    app.register_blueprint(student_bp, url_prefix='/student')
    
    return app
