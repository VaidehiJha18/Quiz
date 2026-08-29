import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from .config import Config
from .routes.admin import admin_bp
from .routes.auth import auth_bp
from .routes.professor import professor_bp
from .routes.student import student_bp

FRONTEND_BUILD_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'build'
)


def create_app(config_class=Config):
  app = Flask(
      __name__,
      static_url_path='',
      static_folder=FRONTEND_BUILD_DIR,
      template_folder=FRONTEND_BUILD_DIR,
  )

  app.config.from_object(config_class)

  # Debug log config details
  print('=' * 50)
  print('APP CONFIG:')
  print(f"DB_HOST: {app.config.get('DB_HOST')}")
  print(f"DB_USER: {app.config.get('DB_USER')}")
  print(f"DB_DATABASE: {app.config.get('DB_DATABASE')}")
  print(f"DB_PORT: {app.config.get('DB_PORT')}")
  print('=' * 50)

  app.config.update(
      SESSION_COOKIE_SECURE=True,  # True for Render / HTTPS
      SESSION_COOKIE_SAMESITE='None',  # 'None' for cross-origin cookies
      SESSION_COOKIE_HTTPONLY=True,
      SESSION_PERMANENT=False,
      SESSION_COOKIE_NAME='quiz_portal_session_new',
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

  CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

  # Register Blueprints with explicit url_prefixes
  app.register_blueprint(auth_bp)
  app.register_blueprint(professor_bp, url_prefix='/prof')
  app.register_blueprint(student_bp, url_prefix='/student')
  app.register_blueprint(admin_bp, url_prefix='/admin')

  # Serve Frontend Static Build & handle API route fallbacks
  @app.route('/', defaults={'path': ''})
  @app.route('/<path:path>')
  def serve(path):
    if (
        path.startswith('prof/')
        or path.startswith('student/')
        or path.startswith('auth/')
        or path.startswith('admin/')
    ):
      return jsonify({'error': 'API Route Not Found'}), 404

    return send_from_directory(app.template_folder, 'index.html')

  return app