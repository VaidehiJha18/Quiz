from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app(config_class=Config):
    app = Flask(__name__)

    CORS(app, 
         resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
         supports_credentials=True 
    )
    
    app.config.from_object(config_class)

    # Register Blueprints
    from .routes.auth import auth_bp
    from .routes.professor import professor_bp
    from .routes.student import student_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(professor_bp, url_prefix='/prof')
    app.register_blueprint(student_bp, url_prefix='/student')

    # ✅ Add after_request inside create_app
    # @app.after_request
    # def add_cors_headers(response):
    #     response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    #     response.headers.add("Access-Control-Allow-Credentials", "true")
    #     response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    #     response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE")
    #     return response

    return app
