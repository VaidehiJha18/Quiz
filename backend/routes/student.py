from flask import Blueprint, session, redirect, url_for, flash, render_template, request, jsonify
from ..services import quiz_service
from functools import wraps

student_bp = Blueprint('student', __name__, url_prefix='/student')

def student_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if session.get('role') != 'student':
            return jsonify({"message": "Unauthorized. Please log in as a student."}), 403
        return f(*args, **kwargs)
    wrap.__name__ = f.__name__
    return wrap

@student_bp.route('/')
@student_required
def home():
    return render_template('student_home.html')

# @student_bp.route('/take-quiz/<token>', methods=['GET'])
# @student_required
# def take_quiz(token):
#     try:
#         quiz_data = quiz_service.get_quiz_for_student(token)
#         if not quiz_data:
#             return jsonify({"message": "Quiz not found or invalid token"}), 404
#         return jsonify(quiz_data), 200
#     except Exception as e:
#         print(f"Take Quiz Error: {e}")
#         return jsonify({"message": "Internal Server Error"}), 500