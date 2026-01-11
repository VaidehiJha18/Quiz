from flask import Blueprint, request, jsonify, session
from ..services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

auth_service = AuthService()

@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200

    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        new_user_id = auth_service.register_user(name, email, password)
        return jsonify({
            "message": "User created successfully",
            "user_id": new_user_id
        }), 201
    except ValueError as e:
        return jsonify({"message": str(e)}), 409
    except Exception as e:
        print(f"Error during signup: {e}")
        return jsonify({"message": "An internal server error occurred"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"message": "Missing email or password"}), 400

    print(f"DEBUG: Login attempt for email: {email}")
    user = auth_service.authenticate_user(email, password)
    print(f"DEBUG: Auth service returned: {'user found' if user else 'no user / invalid credentials'}")

    if user:
        master_id = getattr(user, 'master_id', None)
        user_id = master_id if master_id else getattr(user, 'id', None)
        
        session['logged_in'] = True
        session['id'] = user_id
        session['role'] = getattr(user, 'role', 'student')

        #priyanka       
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user_id,
                "name": user.username,
                "role": session['role']
            }
        }), 200 #🍜🍜🍜
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    if session.get('logged_in'):
        user_id = session.get('id')
        if not user_id:
            return jsonify({"message": "User ID not found in session."}), 401
        
        user_details = auth_service.get_user_by_id(user_id)
        if user_details:
            return jsonify({
                "user_id": user_details.master_id, 
                "username": user_details.username,
                "email": user_details.email,
                "role": getattr(user_details, 'role', 'student'),
                "message": "User profile data retrieved."
            }), 200
        else:
            return jsonify({"message": "User not found"}), 404
    else:
        return jsonify({"message": "Unauthorized"}), 401

#priyanka
# from flask import Blueprint, request, jsonify
# from ..extensions import mysql
# import bcrypt
# from flask_cors import cross_origin 

# auth_bp = Blueprint('auth', __name__)

# @auth_bp.route('/login', methods=['POST'])
# @cross_origin(supports_credentials=True)
# def login():
#     data = request.get_json()
#     email = data.get('email')
#     password = data.get('password')

#     cur = mysql.connection.cursor()
#     # Ensure you are selecting the role column!
#     # Adjust column indices based on your actual database table
#     # This query assumes columns: id, name, email, password, role
#     cur.execute("SELECT id, name, email, password, role FROM users WHERE email = %s", (email,))
#     user = cur.fetchone()
#     cur.close()

#     if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
#         return jsonify({
#             "message": "Login successful",
#             "user_id": user[0],
#             "name": user[1],
#             "role": user[4]  # ✅ This sends 'student' or 'professor' to the frontend
#         }), 200
#     else:
#         return jsonify({"message": "Invalid email or password"}), 401

# @auth_bp.route('/signup', methods=['POST'])  # Changed from /register to match your frontend
# @cross_origin(supports_credentials=True)
# def signup():
#     data = request.get_json()
#     name = data.get('name')
#     email = data.get('email')
#     password = data.get('password')
#     role = data.get('role', 'student') # Default to student if not provided

#     # Basic Validation
#     if not name or not email or not password:
#         return jsonify({"message": "All fields are required"}), 400

#     hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

#     try:
#         cur = mysql.connection.cursor()
#         cur.execute("INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)", 
#                     (name, email, hashed_password, role))
#         mysql.connection.commit()
#         cur.close()
#         return jsonify({"message": "User registered successfully"}), 201
#     except Exception as e:
#         return jsonify({"message": "Email already exists or error occurred"}), 409
    
#     #priyanka