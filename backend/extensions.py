import pymysql
from flask import current_app

def get_db_connection():
    return pymysql.connect(
        host=current_app.config['host'],
        user=current_app.config['user'],
        password=current_app.config['password'],
        db=current_app.config['database'],
        port=current_app.config['port'],
        cursorclass=pymysql.cursors.DictCursor 
    )