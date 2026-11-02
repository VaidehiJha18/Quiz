# import pymysql
# from flask import current_app
# from .config import Config

# def get_db_connection():
#     # Fallback to Config values if current_app isn't fully ready or env vars are empty
#     host = current_app.config.get('DB_HOST') or Config.DB_HOST
#     user = current_app.config.get('DB_USER') or Config.DB_USER
#     password = current_app.config.get('DB_PASSWORD') or Config.DB_PASSWORD
#     db = current_app.config.get('DB_DATABASE') or Config.DB_DATABASE
#     port = current_app.config.get('DB_PORT') or Config.DB_PORT
    
#     return pymysql.connect(
#         host=host,
#         user=user,
#         password=password,
#         database=db,
#         port=int(port),
#         cursorclass=pymysql.cursors.DictCursor,
#         # ✅ CRITICAL: This fixes the "Packet sequence" and connection stability errors
#         ssl={'fake_flag_to_force_ssl': True}
#     )


import os
import pymysql
from flask import current_app

def get_db_connection():
    # 1. NEW Active Aiven Host Domain
    host = 'quiz-application-db-tanishkamaurya1407-1c1b.g.aivencloud.com'
    
    # 2. Database User
    user = current_app.config.get('MYSQL_USER', 'avnadmin')
    
    # 3. Your Aiven Password
    password = current_app.config.get('MYSQL_PASSWORD', '')
    
    # 4. Database Name
    database = current_app.config.get('MYSQL_DB', 'dbquiz')
    
    # 5. NEW Port from Aiven Dashboard
    port = 20465

    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port,
        connect_timeout=10,
        read_timeout=10,
        write_timeout=10,
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor
    )