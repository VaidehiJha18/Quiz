from flask import Blueprint, jsonify, session, request
from ..services import quiz_service
from ..extensions import get_db_connection
import pymysql
from datetime import datetime  # 👈 Added datetime import

student_bp = Blueprint('student', __name__, url_prefix='/student')

# --- 1. Get Student Profile 
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
            return jsonify([]), 200 

        sem_id = student_info['semester_id']
        div_id = student_info['division_id']

        # 3. Fetch Quizzes (AND EXCLUDE COMPLETED ONES)
        # We added the "AND q.id NOT IN (...)" clause
        quiz_sql = """
            SELECT 
                 q.id, 
                 q.quiz_title, 
                 q.course, 
                 ua.user_name AS teacher, 
                 q.total_questions, 
                 q.time_limit, 
                 q.quiz_token,
                 q.quiz_status,
                 q.created_at,
                 q.start_time,
                 q.end_time
            FROM quizzes q
            JOIN quiz_semester_course_division qscd ON q.id = qscd.quiz_id
            LEFT JOIN user_account ua ON q.teacher_id = ua.user_id AND ua.role_id = 2
            WHERE 
                 q.quiz_status = 'Published'
                 AND qscd.semester_id = %s
                 AND qscd.division_id = %s
                 AND q.id NOT IN (
                     SELECT quiz_id FROM student_quiz_attempt WHERE student_id = %s
                 )
            ORDER BY q.start_time ASC
        """
        #  Pass student_id as the 3rd parameter
        cursor.execute(quiz_sql, (sem_id, div_id, student_id))
        quizzes = cursor.fetchall()

        now = datetime.now()
        active_quizzes = []

        for q in quizzes:
            start_val = q.get('start_time')
            end_val = q.get('end_time')

            if start_val and end_val:
                # Convert string to datetime object if MySQL returned a string
                if isinstance(start_val, str):
                    start_val = datetime.fromisoformat(start_val.replace('T', ' ').replace('Z', ''))
                if isinstance(end_val, str):
                    end_val = datetime.fromisoformat(end_val.replace('T', ' ').replace('Z', ''))
                
                # Drop the quiz ONLY if it has expired
                if now > end_val:
                    continue
                
                # Assign dynamic status for the frontend
                if now < start_val:
                    q['computed_status'] = 'upcoming'
                else:
                    q['computed_status'] = 'available'
            else:
                q['computed_status'] = 'available'

            # Format datetime objects back to ISO strings for React
            if isinstance(q.get('created_at'), datetime):
                q['created_at'] = q['created_at'].isoformat()
            if isinstance(q.get('start_time'), datetime):
                q['start_time'] = q['start_time'].isoformat()
            if isinstance(q.get('end_time'), datetime):
                q['end_time'] = q['end_time'].isoformat()

            active_quizzes.append(q)

        return jsonify(active_quizzes), 200

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
          
            q['text'] = q['question_txt'] 

          
            cursor.execute("SELECT id, option_text FROM answer_map WHERE question_id = %s ORDER BY id ASC", (q['id'],))
            opts = cursor.fetchall()
            
            
            formatted_opts = []
            for opt in opts:
                formatted_opts.append({
                    "id": opt['id'],           
                    "text": opt['option_text'] 
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

#  -- 4. Submit Quiz Answers ---
@student_bp.route('/submit-quiz', methods=['POST'])
def submit_student_quiz_route():
    data = request.get_json()
    token = data.get('token')
    answers = data.get('answers') 
    student_id = session.get('id')

    if not student_id or not token or not answers:
        return jsonify({"message": "Invalid data"}), 400

    try:
        result = quiz_service.submit_student_quiz(token, student_id, answers)
        return jsonify({"message": "Success", "result": result}), 200
    except Exception as e:
        print(f"Submission Error: {e}")
        return jsonify({"message": "Server Error"}), 500

@student_bp.route('/result/<int:attempt_id>', methods=['GET'])
def get_attempt_result(attempt_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        user_id = session.get('id')
        role = session.get('role')

        # 1. Check if the attempt exists and get its status
        cursor.execute("SELECT student_id, is_published FROM quiz_attempt qa JOIN student_quiz_attempt sqa ON qa.attempt_id = sqa.attempt_id WHERE qa.attempt_id = %s", (attempt_id,))
        attempt = cursor.fetchone()

        if not attempt:
            return jsonify({"message": "Result not found"}), 404

        # 2. SECURITY CHECK:
        # If user is a Student, they can ONLY see it if it belongs to them AND is published
        if role == 'student':
            if attempt['student_id'] != user_id:
                return jsonify({"message": "Unauthorized"}), 403
            if not attempt['is_published']:
                return jsonify({"message": "Results are not published yet."}), 403
        
        # If user is Professor, they skip the above checks and see everything.

        # 3. Fetch the full details (Green/Red logic)
        data = quiz_service.get_student_attempt_details(attempt_id)
        return jsonify(data), 200

    except Exception as e:
        print(f"Error fetching result: {e}")
        return jsonify({"message": "Server Error"}), 500
    finally:
        cursor.close()
        conn.close()

# --- History Route ---
from datetime import datetime

@student_bp.route('/my-history', methods=['GET'])
def get_student_quiz_history():
    student_id = session.get('id')
    if not student_id:
        return jsonify({"message": "Unauthorized"}), 401

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        info_sql = "SELECT semester_id, division_id FROM student_academic_info WHERE student_id = %s"
        cursor.execute(info_sql, (student_id,))
        student_info = cursor.fetchone()

        if not student_info:
            return jsonify([]), 200

        sem_id = student_info['semester_id']
        div_id = student_info['division_id']

        # 1. Fetch Completed Quizzes
        completed_sql = """
            SELECT 
                 sqa.attempt_id,
                 q.quiz_title,
                 q.teacher,
                 qa.submit_time AS submit_time,
                 COALESCE(qa.total_score, 0) AS total_score,
                 q.total_questions,
                 'Completed' AS status,
                 qa.is_published AS is_published 
            FROM student_quiz_attempt sqa
            JOIN quizzes q ON sqa.quiz_id = q.id
            JOIN quiz_attempt qa ON sqa.attempt_id = qa.attempt_id
            WHERE sqa.student_id = %s
        """
        cursor.execute(completed_sql, (student_id,))
        completed_quizzes = list(cursor.fetchall() or [])

        # 2. Fetch All Published Quizzes assigned to student's section
        published_sql = """
            SELECT 
                NULL AS attempt_id,
                q.id AS quiz_id,
                q.quiz_title,
                q.teacher,
                q.end_time AS submit_time,
                0 AS total_score,
                q.total_questions,
                'Missed' AS status,
                0 AS is_published,
                q.end_time
            FROM quizzes q
            JOIN quiz_semester_course_division qscd ON q.id = qscd.quiz_id
            WHERE q.quiz_status = 'Published'
              AND qscd.semester_id = %s
              AND qscd.division_id = %s
              AND q.id NOT IN (
                  SELECT quiz_id FROM student_quiz_attempt WHERE student_id = %s
              )
        """
        cursor.execute(published_sql, (sem_id, div_id, student_id))
        all_unattempted = list(cursor.fetchall() or [])

        now = datetime.now()
        missed_quizzes = []

        # 3. Filter unattempted quizzes in Python where end_time has passed
        for q in all_unattempted:
            end_val = q.get('end_time')
            if end_val:
                if isinstance(end_val, str):
                    end_val = datetime.fromisoformat(end_val.replace('T', ' ').replace('Z', ''))
                if end_val < now:
                    missed_quizzes.append(q)

        all_history = completed_quizzes + missed_quizzes

        for record in all_history:
            if record.get('submit_time') and not isinstance(record['submit_time'], str):
                record['submit_time'] = record['submit_time'].isoformat()

        all_history.sort(key=lambda x: str(x.get('submit_time') or ''), reverse=True)

        return jsonify(all_history), 200

    except Exception as e:
        print(f"Error fetching student quiz history: {e}")
        return jsonify({"message": "Server error fetching history"}), 500
    finally:
        cursor.close()
        conn.close()