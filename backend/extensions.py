import pymysql
from flask import current_app
from.config import Config

def get_db_connection():
    # Fallback to Config values if current_app isn't fully ready or env vars are empty
    host = current_app.config.get('DB_HOST') or Config.DB_HOST
    user = current_app.config.get('DB_USER') or Config.DB_USER
    password = current_app.config.get('DB_PASSWORD') or Config.DB_PASSWORD
    db = current_app.config.get('DB_DATABASE') or Config.DB_DATABASE
    port = current_app.config.get('DB_PORT') or Config.DB_PORT
    
    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=db,
        port=int(port),
        cursorclass=pymysql.cursors.DictCursor,
        # ✅ CRITICAL: This fixes the "Packet sequence" and connection stability errors
        ssl={'fake_flag_to_force_ssl': True}
    )
