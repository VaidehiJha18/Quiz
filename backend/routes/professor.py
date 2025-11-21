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
        teacher_id = session.get('id')
        if not teacher_id:
            return jsonify({"message": "User ID not found in session. Please log in again."}), 400
        
        quizzes = quiz_service.get_professor_quizzes(session.get(teacher_id))
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
        
        quiz_id = quiz_service.generate_and_save_quiz(teacher_id)
        return jsonify({
            "message": "Quiz generated and saved for review.",
            "quiz_id": quiz_id
        }), 201
    except Exception as e:
        return jsonify({"message": f"Quiz generation failed: {str(e)}"}), 500

# 5. API to fetch questions for quiz creation
@professor_bp.route('/questions', methods=['GET'])
@professor_required
def get_questions_api():
    try:
        employee_id = session.get('id')
        if not employee_id:
            return jsonify({"message": "User ID not found in session."}), 400

        questions = quiz_service.fetch_questions(employee_id, fetch_scope='creator')
        return jsonify(questions), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching questions: {str(e)}"}), 500
    
    #adding my code
    # --- PASTE THIS AT THE BOTTOM OF routes/professor.py ---

from flask import request, jsonify
# Make sure 'mysql' is imported at the top of your file. 
# If it's not, add: from ..extensions import mysql 
# (or however you import your db connection in this file)

@professor_bp.route('/schools', methods=['GET'])
def get_schools():
    cur = mysql.connection.cursor()
    cur.execute("SELECT id, school_name FROM schools") # Matches your image
    data = cur.fetchall()
    cur.close()
    
    # Convert to list
    schools_list = [{'id': row[0], 'school_name': row[1]} for row in data]
    return jsonify(schools_list)

@professor_bp.route('/programs', methods=['GET'])
def get_programs():
    school_id = request.args.get('school_id')
    cur = mysql.connection.cursor()
    # Matches your image: program_name
    cur.execute("SELECT id, program_name FROM programs WHERE school_id = %s", (school_id,))
    data = cur.fetchall()
    cur.close()
    
    programs_list = [{'id': row[0], 'program_name': row[1]} for row in data]
    return jsonify(programs_list)

@professor_bp.route('/departments', methods=['GET'])
def get_departments():
    program_id = request.args.get('program_id')
    cur = mysql.connection.cursor()
    # Matches your text: name
    cur.execute("SELECT id, name FROM departments WHERE program_id = %s", (program_id,))
    data = cur.fetchall()
    cur.close()
    
    dept_list = [{'id': row[0], 'name': row[1]} for row in data]
    return jsonify(dept_list)

@professor_bp.route('/courses', methods=['GET'])
def get_courses():
    dept_id = request.args.get('dept_id')
    semester = request.args.get('semester')
    
    cur = mysql.connection.cursor()
    # Matches your text: course_name
    cur.execute("SELECT id, course_name FROM courses WHERE department_id = %s AND semester = %s", (dept_id, semester))
    data = cur.fetchall()
    cur.close()
    
    course_list = [{'id': row[0], 'course_name': row[1]} for row in data]
    return jsonify(course_list)

@professor_bp.route('/questions', methods=['GET'])
def get_questions_by_course():
    course_id = request.args.get('course_id')
    
    cur = mysql.connection.cursor()
    query = "SELECT id, question_text, option_1, option_2, option_3, option_4, correct_answer FROM questions WHERE course_id = %s"
    cur.execute(query, (course_id,))
    data = cur.fetchall()
    cur.close()
    
    questions_list = []
    for row in data:
        questions_list.append({
            'id': row[0],
            'text': row[1],
            'options': [row[2], row[3], row[4], row[5]],
            'correct': row[6]
        })
        
    return jsonify(questions_list)

#pri
