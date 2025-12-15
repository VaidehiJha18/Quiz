from flask import Blueprint, session, redirect, url_for, flash, jsonify, request
from ..services import quiz_service
from ..services.auth_service import AuthService
from ..extensions import get_db_connection
from functools import wraps
import pymysql.cursors

professor_bp = Blueprint('professor', __name__, url_prefix='/prof')

def professor_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if session.get('role') != 'professor':
            return jsonify({"message": "Unauthorized"}), 403
        return f(*args, **kwargs)
    wrap.__name__ = f.__name__
    return wrap

@professor_bp.route('/data', methods=['GET'])
@professor_required
def get_professor_data():
    user_id = session.get('id')
    if not user_id:
        return jsonify({"message": "User ID not found in session."}), 401
    
    user_record = AuthService().get_user_by_id(user_id)
    
    if user_record:
        return jsonify({
            "isLoggedIn": True,
            "username": user_record.username,
            "email": user_record.email,
            "role": session.get('role'),
        }), 200
    
    return jsonify({"message": "User not found"}), 404

@professor_bp.route('/quizzes', methods=['GET'])
@professor_required
def get_quizzes_api():
    try:
        teacher_id = session.get('id')
        if not teacher_id:
            return jsonify({"message": "User ID not found in session. Please log in again."}), 400
        
        quizzes = quiz_service.get_professor_quizzes(teacher_id)
        return jsonify(quizzes), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching quizzes: {str(e)}"}), 500

@professor_bp.route('/add_questions', methods=['POST'])
@professor_required
def add_question_api():
    data = request.get_json()
    
    required_keys = ['text', 'options', 'correct_index']
    if not all(key in data for key in required_keys):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        teacher_id = session.get('id')
        if not teacher_id:
            return jsonify({"message": "User ID not found in session. Please log in again."}), 400
        
        quiz_service.insert_question(data, teacher_id)
        return jsonify({"message": "Question added successfully!"}), 201
        
    except Exception as e:
        print(f"Error during question insertion: {str(e)}")
        return jsonify({"message": "Internal server error during database operation."}), 500

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

@professor_bp.route('/questions', methods=['GET'])
@professor_required
def get_questions_api():
    try:
        employee_id = session.get('id')
        if not employee_id:
            return jsonify({"message": "User ID not found in session."}), 400

        course_id = request.args.get('course_id')
        if course_id:
            conn = get_db_connection()
            cur = conn.cursor(pymysql.cursors.DictCursor)
            try:
                query = "SELECT id, question_text, option_1, option_2, option_3, option_4, correct_answer FROM questions WHERE course_id = %s"
                cur.execute(query, (course_id,))
                data = cur.fetchall()
                
                questions_list = []
                for row in data:
                    questions_list.append({
                        'id': row['id'],
                        'text': row['question_text'],
                        'options': [row['option_1'], row['option_2'], row['option_3'], row['option_4']],
                        'correct': row['correct_answer']
                    })
                return jsonify(questions_list), 200
            finally:
                cur.close()
                conn.close()

        questions = quiz_service.fetch_questions(employee_id, fetch_scope='creator')
        if questions is None:
            questions = {}
            
        return jsonify(questions), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching questions: {str(e)}"}), 500

@professor_bp.route('/questions/<int:id>', methods=['GET', 'PUT'])
@professor_required
def handle_single_question(id):
    """Handles fetching (GET) and updating (PUT) a single question."""
    
    if request.method == 'GET':
        try:
            question_data = quiz_service.get_question_by_id(id)
            
            if not question_data:
                return jsonify({'message': 'Question not found'}), 404
                
            return jsonify(question_data), 200

        except Exception as e:
            print(f"ERROR during GET for ID {id}: {e}")
            return jsonify({'message': 'Internal Server Error during fetch.'}), 500

    elif request.method == 'PUT':
        try:
            data = request.get_json()
            
            updated_q = quiz_service.update_question(id, data)
            
            if not updated_q:
                return jsonify({'message': 'Question not found or update failed'}), 404
                
            return jsonify({'message': 'Question updated successfully', 'question': updated_q}), 200

        except Exception as e:
            print(f"ERROR during PUT for ID {id}: {e}")
            return jsonify({'message': 'Internal Server Error during update.'}), 500

    return jsonify({'message': 'Method not allowed'}), 405

@professor_bp.route('/schools', methods=['GET'])
@professor_required
def get_schools():
    conn = get_db_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cur.execute("SELECT id, school_name FROM schools")
        data = cur.fetchall()
        schools_list = [{'id': row['id'], 'school_name': row['school_name']} for row in data]
        return jsonify(schools_list)
    finally:
        cur.close()
        conn.close()

@professor_bp.route('/programs', methods=['GET'])
@professor_required
def get_programs():
    school_id = request.args.get('school_id')
    conn = get_db_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cur.execute("SELECT id, program_name FROM programs WHERE school_id = %s", (school_id,))
        data = cur.fetchall()
        programs_list = [{'id': row['id'], 'program_name': row['program_name']} for row in data]
        return jsonify(programs_list)
    finally:
        cur.close()
        conn.close()

@professor_bp.route('/departments', methods=['GET'])
@professor_required
def get_departments():
    program_id = request.args.get('program_id')
    conn = get_db_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cur.execute("SELECT id, name FROM departments WHERE program_id = %s", (program_id,))
        data = cur.fetchall()
        dept_list = [{'id': row['id'], 'name': row['name']} for row in data]
        return jsonify(dept_list)
    finally:
        cur.close()
        conn.close()

@professor_bp.route('/courses', methods=['GET'])
@professor_required
def get_courses():
    dept_id = request.args.get('dept_id')
    semester = request.args.get('semester')
    
    conn = get_db_connection()
    cur = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cur.execute("SELECT id, course_name FROM courses WHERE department_id = %s AND semester = %s", (dept_id, semester))
        data = cur.fetchall()
        course_list = [{'id': row['id'], 'course_name': row['course_name']} for row in data]
        return jsonify(course_list)
    finally:
        cur.close()
        conn.close()
