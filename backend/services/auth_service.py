import bcrypt 
from ..extensions import get_db_connection
from ..models.user import User 
from flask import flash
import pymysql.cursors
import re
import datetime

class AuthService:
    ROLE_MAPPING = {
        "student": 1,
        "professor": 2,
        "admin": 3,
    }
    
    def __init__(self):
        self.ADMIN_EMAIL_PATTERN = r'^(admin-\d+|[a-zA-Z0-9.]+admin)@gsfcuniversity\.ac\.in$'
        self.PROFESSOR_EMAIL_PATTERN = r'^[a-zA-Z0-9.]+@gsfcuniversity\.ac\.in$'
        self.STUDENT_EMAIL_PATTERN = r'^\d+@gsfcuniversity\.ac\.in$'

    def _determine_role(self, email):
        role_name = None
        if re.match(self.ADMIN_EMAIL_PATTERN, email):
            role_name = "admin"
        elif re.match(self.STUDENT_EMAIL_PATTERN, email):
            role_name = "student"
        elif re.match(self.PROFESSOR_EMAIL_PATTERN, email):
            role_name = "professor"
        else:
            raise ValueError("Invalid university email format")
        if role_name in self.ROLE_MAPPING:
            return self.ROLE_MAPPING[role_name]
        else:
            raise ValueError(f"Role '{role_name}' not mapped to an integer ID.")

    def _hash_password(self, password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def _check_password(self, stored_hash, password):
        try:
            return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
        except ValueError:
            return False
    # --- SIGNUP ---
    def register_user(self, user_name, email, password):
        password_hash = self._hash_password(password)      
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor) 

        try:
            cursor.execute("SELECT user_id FROM user_account WHERE email = %s", (email,))
            if cursor.fetchone():
                raise ValueError("User with this email already exists")       
            role_id = self._determine_role(email)
            sql = "INSERT INTO user_account (user_name, email, password_hash, role_id) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (user_name, email, password_hash, role_id)) 
            conn.commit()           
            return cursor.lastrowid
            
        finally:
            cursor.close()
            conn.close()
 # --- LOGIN ---
    def authenticate_user(self, email, password):
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor) 

        try:
            sql = "SELECT user_id, user_name, email, password_hash, role_id FROM user_account WHERE email = %s"
            cursor.execute(sql, (email,))
            user_record = cursor.fetchone()

            if user_record:
                password_hash = user_record.pop('password_hash')
                if not self._check_password(password_hash, password):
                    return None 
                db_role_id = user_record.pop('role_id')
                ROLE_NAME = {v: k for k, v in self.ROLE_MAPPING.items()}
                user_record['role'] = ROLE_NAME.get(db_role_id, 'unknown')
                user_record['username'] = user_record.pop('user_name')
                user_record['password_hash'] = password_hash 
                user = User.from_dict(user_record)
                return user            
            return None 
    
        finally:
            cursor.close()
            conn.close()

    def get_user_by_id(self, user_id):
        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor) 
        
        try:
            sql = "SELECT user_id, user_name, email, password_hash, role_id FROM user_account WHERE user_id = %s"
            cursor.execute(sql, (user_id,))
            user_record = cursor.fetchone()
            if user_record:
                password_hash = user_record.pop('password_hash')
                db_role_id = user_record.pop('role_id')
                ROLE_NAME = {v: k for k, v in self.ROLE_MAPPING.items()}
                user_record['role'] = ROLE_NAME.get(db_role_id, 'unknown')
                user_record['username'] = user_record.pop('user_name')
                user_record['password_hash'] = password_hash
                
                return User.from_dict(user_record)                 
            return None
        finally:
            cursor.close()
            conn.close()
