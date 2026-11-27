# ------------------TiDB Cloud Connection------------------
import os
import pymysql
import certifi
from flask import current_app

def get_db_connection():
    # 1. NEW Active Aiven Host Domain
    host = 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'
    
    # 2. Database User
    user = current_app.config.get('DB_USER', '28cPQL4bhapuvCC.root')
    
    # 3. Your Password
    password = current_app.config.get('DB_PASSWORD', '')
    
    # 4. Database Name
    database = current_app.config.get('DB_DATABASE', 'dbquiz')
    
    # 5. NEW Port from Dashboard
    port = 4000

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
        ssl={"ca": certifi.where()},
        cursorclass=pymysql.cursors.DictCursor
    )


# --------------------- Avien Connection ----------------------------------------------
# import os
# import pymysql
# from flask import current_app

# def get_db_connection():
#     # 1. NEW Active Aiven Host Domain
#     host = 'quiz-application-db-tanishkamaurya1407-1c1b.g.aivencloud.com'
    
#     # 2. Database User
#     user = current_app.config.get('MYSQL_USER', 'avnadmin')
    
#     # 3. Your Aiven Password
#     password = current_app.config.get('DB_PASSWORD', '')
    
#     # 4. Database Name
#     database = current_app.config.get('MYSQL_DB', 'dbquiz')
    
#     # 5. NEW Port from Aiven Dashboard
#     port = 20465

#     return pymysql.connect(
#         host=host,
#         user=user,
#         password=password,
#         database=database,
#         port=port,
#         connect_timeout=10,
#         read_timeout=10,
#         write_timeout=10,
#         autocommit=True,
#         cursorclass=pymysql.cursors.DictCursor
#     )

