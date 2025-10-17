import os
import pymysql

# try:
#     connection = pymysql.connect(
#         host='public-mysql-35ccb4d9-quizapplication.d.aivencloud.com',
#         user='avnadmin',
#         password='AVNS_IGyQyvOs9EJELlKx9h4',
#         database='dbquiz',
#         port=26056
#     )
#     print("Successfully connected to the database using PyMySQL!")

# except pymysql.MySQLError as e:
#     print(f"Failed to connect to the database: {e}")
    
    

class Config:
    # Database
    DB_HOST = os.environ.get('DB_HOST', 'public-mysql-35ccb4d9-quizapplication.d.aivencloud.com')
    DB_USER = os.environ.get('DB_USER', 'avnadmin')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'AVNS_IGyQyvOs9EJELlKx9h4')
    DB_DATABASE = os.environ.get('DB_DATABASE', 'dbquiz')
    DB_PORT = int(os.environ.get('DB_PORT', 26056))
    
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-dev-secret-key')
    DEBUG = True

    # Session / CORS settings for cross-origin requests
    SESSION_COOKIE_SAMESITE = "None"     # Needed for cross-origin cookies
    SESSION_COOKIE_SECURE = False        # Set True only for HTTPS
