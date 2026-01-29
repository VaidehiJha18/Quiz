from flask import Blueprint, jsonify, session, request
from ..services import quiz_service
from ..extensions import get_db_connection
import pymysql

student_bp = Blueprint('student', __name__, url_prefix='/student')

# --- 1. Get Student Profile 
@student_bp.route('/profile', methods=['GET'])
def get_student_profile():
    student_id = session.get('id')
    if not student_id:
        return jsonify({"message": "Unauthorized"}), 401
    
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Fetch name and email. 
        # If your table uses 'f_name', change 'name' to 'f_name' below.
        cursor.execute("SELECT id, f_name as name, email FROM student WHERE id = %s", (student_id,))
        student = cursor.fetchone()
        
        if student:
            return jsonify(student), 200
        return jsonify({"message": "Student not found"}), 404
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"message": "Server Error"}), 500
    finally:
        cursor.close()
        conn.close()

# --- 2. Student Dashboard (The "My Quizzes" Page) 
@student_bp.route('/dashboard', methods=['GET'])
def student_dashboard():
    # 1. Get Logged-in Student ID
    student_id = session.get('id')
    if not student_id:
        return jsonify({"message": "Unauthorized. Please log in."}), 401

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 2. Find out which Semester & Division this student is in
        info_sql = """
            SELECT semester_id, division_id 
            FROM student_academic_info 
            WHERE student_id = %s
        """
        cursor.execute(info_sql, (student_id,))
        student_info = cursor.fetchone()

        if not student_info:
            print(f"DEBUG: Student {student_id} has no academic info mapped.")
            # Return empty list so the frontend doesn't crash
            return jsonify([]), 200 

        sem_id = student_info['semester_id']
        div_id = student_info['division_id']

        print(f"DEBUG: Fetching quizzes for Student {student_id} (Sem {sem_id}, Div {div_id})")

        # 3. Fetch Quizzes published to this specific Semester & Division
        quiz_sql = """
            SELECT 
                q.id, 
                q.quiz_title, 
                q.course, 
                q.teacher, 
                q.total_questions, 
                q.duration, 
                q.quiz_token,
                q.quiz_status,
                q.created_at
            FROM quizzes q
            JOIN quiz_semester_course_division qscd ON q.id = qscd.quiz_id
            WHERE 
                q.quiz_status = 'Published'
                AND qscd.semester_id = %s
                AND qscd.division_id = %s
            ORDER BY q.created_at DESC
        """
        cursor.execute(quiz_sql, (sem_id, div_id))
        quizzes = cursor.fetchall()
        
        # Convert datetime objects to string for JSON
        for q in quizzes:
            if q['created_at']:
                q['created_at'] = q['created_at'].isoformat()

        return jsonify(quizzes), 200

    except Exception as e:
        print(f"Error fetching student dashboard: {e}")
        return jsonify({"message": "Server Error"}), 500
    finally:
        cursor.close()
        conn.close()

# --- 3. Take Quiz (Fetch Questions by Token) ---
@student_bp.route('/take-quiz/<token>', methods=['GET'])
def take_quiz_student_view(token):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Find the Quiz ID
        cursor.execute("SELECT id, quiz_title, time_limit FROM quizzes WHERE quiz_token = %s", (token,))
        quiz = cursor.fetchone()
        
        if not quiz:
            return jsonify({"message": "Invalid Quiz Token"}), 404

        quiz_id = quiz['id']
        
        # 2. Fetch Questions
        sql = """
            SELECT 
                q.id, 
                q.question_txt, 
                q.question_type, 
                q.marks
            FROM quiz_questions_generated qq
            JOIN question_bank q ON qq.question_id = q.id
            WHERE qq.quiz_id = %s
        """
        cursor.execute(sql, (quiz_id,))
        questions = cursor.fetchall()
        
        # 3. Fetch Options and Format them perfectly for React
        for q in questions:
            # A. Map 'question_txt' to 'text' (Required by Line 5 of QuizQCard.js)
            q['text'] = q['question_txt'] 

            # B. Fetch Options
            cursor.execute("SELECT id, option_text FROM answer_map WHERE question_id = %s ORDER BY id ASC", (q['id'],))
            opts = cursor.fetchall()
            
            # C. Format Options Array (Required by Line 15 of QuizQCard.js)
            formatted_opts = []
            for opt in opts:
                formatted_opts.append({
                    "id": opt['id'],           # Required by Line 17 (key={option.id})
                    "text": opt['option_text'] # Required by Line 25 ({option.text})
                })
            q['options'] = formatted_opts 

        return jsonify({
            "quiz": quiz,
            "questions": questions
        }), 200

    except Exception as e:
        print(f"Error fetching quiz by token: {e}")
        return jsonify({"message": "Server Error"}), 500
    finally:
        cursor.close()
        conn.close()