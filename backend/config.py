import os
import pymysql
from dotenv import load_dotenv

# Load variables from .env in project root into os.environ
load_dotenv()

class Config:
    # Database
    DB_HOST = os.environ.get('DB_HOST', 'public-mysql-35ccb4d9-quizapplication.d.aivencloud.com')
    DB_USER = os.environ.get('DB_USER', 'avnadmin')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'AVNS_IGyQyvOs9EJELlKx9h4')
    DB_DATABASE = os.environ.get('DB_DATABASE', 'dbquiz')
    DB_PORT = int(os.environ.get('DB_PORT', 26056))

    # SQLALCHEMY_DATABASE_URI
    SQLALCHEMY_DATABASE_URI = (
        f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}'
    )
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a_new_secret_key_to_break_the_old_cookie_12345')
    DEBUG = True
    SESSION_COOKIE_SECURE = False  
    
# --- Google Gemini AI API Key ---
    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')