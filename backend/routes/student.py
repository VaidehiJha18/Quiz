from flask import Blueprint, jsonify, session, request
from ..services import quiz_service
from ..extensions import get_db_connection
import pymysql
from datetime import datetime

student_bp = Blueprint('student', __name__, url_prefix='/student')

# --- 1. Get Student Profile & Active Quizzes ---
@student_bp.route('/dashboard', methods=['GET'])
def student_dashboard():
    student_id = session.get('id')
    if not student_id:
        return jsonify({"message": "Unauthorized. Please log in."}), 401

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
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
        cursor.execute(quiz_sql, (sem_id, div_id, student_id))
        quizzes = cursor.fetchall()

        now = datetime.now()
        active_quizzes = []

        for q in quizzes:
            start_val = q.get('start_time')
            end_val = q.get('end_time')

            if start_val and end_val:
                if isinstance(start_val, str):
                    start_val = datetime.fromisoformat(start_val.replace('T', ' ').replace('Z', ''))
                if isinstance(end_val, str):
                    end_val = datetime.fromisoformat(end_val.replace('T', ' ').replace('Z', ''))

                if now > end_val:
                    continue

                if now < start_val:
                    q['computed_status'] = 'upcoming'
                else:
                    q['computed_status'] = 'available'
            else:
                q['computed_status'] = 'available'

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

# --- 2. Take Quiz (Questions & Options) ---
@student_bp.route('/take-quiz/<token>', methods=['GET'])
def take_quiz_student_view(token):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT id, quiz_title, time_limit FROM quizzes WHERE quiz_token = %s", (token,))
        quiz = cursor.fetchone()

        if not quiz:
            return jsonify({"message": "Invalid Quiz Token"}), 404

        quiz_id = quiz['id']

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

# --- 3. Submit Quiz Answers ---
@student_bp.route('/submit-quiz', methods=['POST'])
def submit_student_quiz_route():
    data = request.get_json() or {}
    token = data.get('token') or data.get('quizId')
    answers = data.get('answers')
    student_id = session.get('id')
    auto_submitted = data.get('auto_submitted', False)

    if not student_id or not token or answers is None:
        return jsonify({"message": "Invalid data"}), 400

    try:
        result = quiz_service.submit_student_quiz(token, student_id, answers)
        return jsonify({"message": "Success", "result": result}), 200
    except Exception as e:
        print(f"Submission Error: {e}")
        return jsonify({"message": "Server Error"}), 500

# --- 4. Real-time Proctoring Violation Logger ---
@student_bp.route('/api/quiz/violation', methods=['POST'])
def record_violation():
    data = request.get_json() or {}
    quiz_id = data.get('quizId')
    violation_type = data.get('violationType')
    snapshot = data.get('snapshot')
    student_id = session.get('id') or data.get('studentId') or 0

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Save snapshot and violation
        cursor.execute(
            """
            INSERT INTO violations (quiz_id, student_id, violation_type, snapshot, timestamp)
            VALUES (%s, %s, %s, %s, NOW())
            """,
            (quiz_id, student_id, violation_type, snapshot)
        )
        conn.commit()

        # Count total violations for this student on this quiz
        cursor.execute(
            "SELECT COUNT(*) AS total FROM violations WHERE quiz_id = %s AND student_id = %s",
            (quiz_id, student_id)
        )
        row = cursor.fetchone()
        current_count = row['total'] if row else 1

        auto_submit = current_count >= 3

        return jsonify({
            'success': True,
            'violationCount': current_count,
            'autoSubmit': auto_submit
        }), 200
    except Exception as e:
        conn.rollback()
        print(f"Error recording violation: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@student_bp.route('/result/<int:attempt_id>', methods=['GET'])
def get_attempt_result(attempt_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        user_id = session.get('id')
        role = session.get('role')

        cursor.execute(
            """
            SELECT qa.attempt_id, sqa.student_id, qa.is_published 
            FROM quiz_attempt qa 
            JOIN student_quiz_attempt sqa ON qa.attempt_id = sqa.attempt_id 
            WHERE qa.attempt_id = %s
            """,
            (attempt_id,)
        )
        attempt = cursor.fetchone()

        if not attempt:
            return jsonify({"message": "Result not found"}), 404

        # Fetch detailed attempt breakdown
        data = quiz_service.get_student_attempt_details(attempt_id)
        if not data:
            return jsonify({"message": "Result data not found"}), 404

        return jsonify(data), 200

    except Exception as e:
        print(f"Error fetching result: {e}")
        return jsonify({"message": f"Server Error: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()