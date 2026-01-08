from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS  
from .config import Config
import os

FRONTEND_BUILD_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'build'
)

def create_app(config_class=Config):
    app = Flask(
        __name__, 
        static_url_path='', 
        static_folder=FRONTEND_BUILD_DIR,
        template_folder=FRONTEND_BUILD_DIR
    )

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
        SESSION_COOKIE_SECURE = False,
        SESSION_COOKIE_SAMESITE = 'Lax',
        SESSION_COOKIE_HTTPONLY = True,
        SESSION_PERMANENT = False,
        SESSION_COOKIE_NAME = 'quiz_portal_session_new',
    )
    
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5000')
    ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5000',
        'https://quiz-frontend-bg5u.onrender.com',
        FRONTEND_URL,
    ]
    
    CORS(app, 
         origins=ALLOWED_ORIGINS, 
         supports_credentials=True)
    
    # Register Blueprints
    from .routes.auth import auth_bp
    # from .routes.professor import professor_bp
    from .routes.student import student_bp
    from backend.routes.professor import professor_bp #vaidehi changes
    app.register_blueprint(auth_bp)
    app.register_blueprint(professor_bp, url_prefix='/prof')
    app.register_blueprint(student_bp, url_prefix='/student')
    
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        # If the path starts with an API prefix, we should NOT serve index.html.
        # If it reached here, it means the specific Blueprint route doesn't exist.
        if path.startswith(('auth/', 'prof/', 'student/')):
            return jsonify({"message": f"API Route '/{path}' not found"}), 404
        
        # Otherwise, serve the React app
        return send_from_directory(app.template_folder, 'index.html')

    return app
