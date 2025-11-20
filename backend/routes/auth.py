from flask import Blueprint, request, jsonify, session
from flask_cors import cross_origin
from ..services.auth_service import AuthService

# Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Service
auth_service = AuthService()

# ----------------- Signup -----------------
@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
@cross_origin(origin='http://localhost:3000', supports_credentials=True)
def signup():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200  # Handle preflight

    data = request.get_json()
    name = data.get('name')  # match frontend
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

# ----------------- Login -----------------
@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
@cross_origin(origin='http://localhost:3000', supports_credentials=True)
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200  # Handle preflight

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"message": "Missing email or password"}), 400

    user = auth_service.authenticate_user(email, password)

    if user:
        session['logged_in'] = True
        session['id'] = user.id
        session['user_id'] = user.id     # keeping here for backward compatibility if needed
        session['username'] = user.username
        session['role'] = getattr(user, 'role', 'student')  # default role
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "name": user.username,
                "role": session['role']
            }
        }), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

# ----------------- Logout -----------------
@auth_bp.route('/logout', methods=['POST', 'OPTIONS'])
@cross_origin(origin='http://localhost:3000', supports_credentials=True)
def logout():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200  # Handle preflight

    session.clear()
    return jsonify({"message": "Logout successful"}), 200

# ----------------- Get Profile -----------------
@auth_bp.route('/profile', methods=['GET', 'OPTIONS'])
@cross_origin(origin='http://localhost:3000', supports_credentials=True)
def get_profile():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'OK'}), 200  # Handle preflight

    if session.get('logged_in'):
        user_id = session.get('id')
        user_details = auth_service.get_user_by_id(user_id)
        return jsonify({
            "user_id": user_details.id,
            "username": user_details.username,
            "email": user_details.email,
            "role": getattr(user_details, 'role', 'student'),
            "message": "User profile data retrieved."
        }), 200
    else:
        return jsonify({"message": "Unauthorized"}), 401
