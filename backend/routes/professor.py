from flask import Blueprint, session, redirect, url_for, flash, jsonify, request
from ..services import quiz_service # Import the quiz logic
from ..services.auth_service import AuthService # Import to get user data if needed

professor_bp = Blueprint('professor', __name__, url_prefix='/prof') 

def professor_required(f):
    def wrap(*args, **kwargs):
        if session.get('role') != 'professor':
            return jsonify({"message": "Unauthorized"}), 403 # Return JSON for React
        return f(*args, **kwargs)
    wrap.__name__ = f.__name__
    return wrap

# --- API Endpoints for React ---
# 1. API to check session and get user data
@professor_bp.route('/data', methods=['GET'])
@professor_required
def get_professor_data():
    email = session.get('email')
    user_record = AuthService().get_user_by_email(email) 
    
    if user_record:
        return jsonify({
            "isLoggedIn": True,
            "username": user_record['user_name'], 
            "email": email,
            "role": session.get('role'),
            # "quizzes_count": len(quiz_service.get_professor_quizzes(email))
        }), 200
    
    return jsonify({"message": "User not found"}), 404

# 2. API to view all quizzes 
@professor_bp.route('/quizzes', methods=['GET'])
@professor_required
def get_quizzes_api():
    try:
        quizzes = quiz_service.get_professor_quizzes(session.get('email'))
        return jsonify(quizzes), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching quizzes: {str(e)}"}), 500

# 3. API to add a new question
@professor_bp.route('/question', methods=['POST'])
@professor_required
def create_question_api():
    # React sends JSON data:
    data = request.get_json() 
    # You should validate this data before passing it to the service
    if not all(key in data for key in ['question', 'option_a', 'answer']):
        return jsonify({"message": "Missing required question fields"}), 400

    try:
        quiz_service.insert_question(data, session.get('email'))
        return jsonify({"message": "Question added successfully!"}), 201
    except Exception as e:
        return jsonify({"message": f"Database error: {str(e)}"}), 500

# 4. API to generate a quiz
@professor_bp.route('/generate', methods=['POST'])
@professor_required
def generate_quiz_api():
    try:
        teacher_id = session.get('id')
        if not teacher_id:
            return jsonify({"message": "User ID not found in session. Please log in again."}), 400
        
        quiz_id = quiz_service.generate_and_save_quiz('teacher_id')
        return jsonify({
            "message": "Quiz generated and saved for review.",
            "quiz_id": quiz_id
        }), 201
    except Exception as e:
        return jsonify({"message": f"Quiz generation failed: {str(e)}"}), 500
