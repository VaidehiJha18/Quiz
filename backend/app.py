from flask import Flask, request
from flask_cors import CORS  
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)

    app.config.update(
        SESSION_COOKIE_SECURE=False,
        SECRET_KEY=app.config.get('SECRET_KEY')
    )

    # Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    
    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.professor import professor_bp
    from .routes.student import student_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(professor_bp, url_prefix='/prof')
    app.register_blueprint(student_bp, url_prefix='/student')
    
    return app
