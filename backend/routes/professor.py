import os
import pymysql
import traceback
from functools import wraps
from flask import Blueprint, session, request, jsonify, send_file
from werkzeug.utils import secure_filename

from ..extensions import get_db_connection
from ..services import quiz_service
from ..services.quiz_service import fetch_questions_by_course
from ..services.paper_parser_service import parse_and_save_docx, parse_and_save_pdf, parse_and_save_csv
from ..services.paper_generator_service import generate_exam_paper, get_paper_full_details
from ..services.paper_export_service import export_paper_to_docx

professor_bp = Blueprint('professor', __name__, url_prefix='/prof')

# -------------------------------------------------------------------------
# AUTH DECORATOR
# -------------------------------------------------------------------------
def professor_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        # ✅ Allow CORS preflight requests
        if request.method == "OPTIONS":
            return '', 200

        # 🔍 Extract session credentials with fallbacks
        current_role = session.get('role')
        user_id = session.get('id')
        print(f"DEBUG: Access Check -> User ID: {user_id} | Session Role: '{current_role}'")

        # ✅ Allow multiple valid formats for "Professor"
        # 2 = Database ID, 'professor' = Lowercase, 'Professor' = Title case
        valid_roles = ['professor', 'Professor', 2, '2']

        if current_role not in valid_roles:
            print(f"❌ DENIED: Role '{current_role}' is not in valid list {valid_roles}")
            return jsonify({"message": "Unauthorized"}), 403

        return f(*args, **kwargs)
    return wrap


# -------------------------------------------------------------------------
# 1. ACADEMIC STRUCTURE DROPDOWNS & METADATA
# -------------------------------------------------------------------------
@professor_bp.route('/schools', methods=['GET'])
@professor_required
def get_schools():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT id, school_name FROM school ORDER BY school_name ASC")
        data = cursor.fetchall()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error fetching schools: {e}")
        return jsonify({"message": "Database error fetching schools."}), 500
    finally:
        cursor.close()
        conn.close()


@professor_bp.route('/programs', methods=['GET'])
@professor_required
def get_programs():
    school_id = request.args.get('school_id')
    if not school_id:
        return jsonify([]), 200
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT id, program_name FROM program WHERE school_id = %s ORDER BY program_name ASC", (school_id,))
        data = cursor.fetchall()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error fetching programs: {e}")
        return jsonify({"message": "Database error fetching programs."}), 500
    finally:
        cursor.close()
        conn.close()


@professor_bp.route('/departments', methods=['GET'])
@professor_required
def fetch_departments_list_view():
    program_id_raw = request.args.get('program_id')
    if not program_id_raw:
        return jsonify([]), 200
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        sql = """
            SELECT DISTINCT d.id, d.dept_name
            FROM department d
            JOIN dept_program dp ON d.id = dp.dept_id
            WHERE dp.program_id = %s
            ORDER BY d.dept_name ASC
        """
        cursor.execute(sql, (int(program_id_raw),))
        data = cursor.fetchall()
        return jsonify(data), 200
    except Exception as e:
        print(f"Error fetching departments: {e}")
        return jsonify({"message": "Database error fetching departments."}), 500
    finally:
        cursor.close()
        conn.close()


@professor_bp.route('/courses', methods=['GET'])
@professor_required
def fetch_courses_list_view():
    dept_id_raw = request.args.get('dept_id')
    semester_id_raw = request.args.get('semester')
    teacher_id = session.get('user_id') or session.get('id')

    if not dept_id_raw or not semester_id_raw:
        return jsonify([]), 200

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        sql = """
            SELECT DISTINCT c.id, c.course_name
            FROM course c
            JOIN semester_course sc ON c.id = sc.course_id
            JOIN department_semester ds ON sc.semester_id = ds.semester_id
            JOIN teacher_course_division tcd ON c.id = tcd.course_id
            WHERE ds.dept_id = %s AND sc.semester_id = %s AND tcd.teacher_id = %s
            ORDER BY c.course_name ASC
        """
        cursor.execute(sql, (int(dept_id_raw), int(semester_id_raw), teacher_id))
        data = cursor.fetchall()
        return jsonify(data), 200
    except Exception as e:
        print(f"!!! SQL Error fetching assigned courses: {e}")
        return jsonify({"message": "Database query failed"}), 500
    finally:
        cursor.close()
        conn.close()


@professor_bp.route('/my-courses', methods=['GET'])
@professor_required
def get_my_courses_endpoint():
    teacher_id = session.get('user_id') or session.get('id')
    try:
        courses = quiz_service.get_courses_for_teacher(teacher_id)
        return jsonify(courses), 200
    except Exception as e:
        print(f"Error fetching teacher courses: {e}")
        return jsonify([]), 500


@professor_bp.route('/divisions', methods=['GET'])
@professor_required
def get_course_divisions():
    course_id = request.args.get('course_id')
    teacher_id = session.get('user_id') or session.get('id')

    if not course_id or course_id == 'undefined':
        return jsonify([]), 200

    try:
        divisions = quiz_service.get_divisions_for_course(teacher_id, int(course_id))
        return jsonify(divisions), 200
    except Exception as e:
        print(f"Error fetching divisions: {e}")
        return jsonify([]), 500


# -------------------------------------------------------------------------
# 2. QUESTION BANK CRUD
# -------------------------------------------------------------------------
@professor_bp.route('/questions', methods=['GET'])
@professor_required
def get_questions_api():
    try:
        employee_id = session.get('id')
        if not employee_id:
            return jsonify({"message": "User ID not found in session."}), 400

        # allow optional course filter via query param ?course_id=###
        course_id_raw = request.args.get('course_id')
        course_id = int(course_id_raw) if course_id_raw else None

        questions = quiz_service.fetch_questions(employee_id, fetch_scope='creator', course_id=course_id)
        if questions is None:
            print("WARNING: quiz_service.fetch_questions returned None. Returning empty object {}")
            questions = {}
             
        return jsonify(questions), 200
    except Exception as e:
        return jsonify({"message": f"Error fetching questions: {str(e)}"}), 500


@professor_bp.route('/questions/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@professor_required
def handle_single_question(id):
    if request.method == 'GET':
        try:
            question_data = quiz_service.get_question_by_id(id)
            if not question_data:
                return jsonify({'message': 'Question not found'}), 404
            return jsonify(question_data), 200
        except Exception as e:
            return jsonify({'message': f'Error fetching question: {str(e)}'}), 500

    elif request.method == 'PUT':
        try:
            data = request.get_json()
            success = quiz_service.update_question(id, data)
            if success:
                return jsonify({'message': 'Question updated successfully'}), 200
            return jsonify({'message': 'Failed to update question'}), 400
        except Exception as e:
            return jsonify({'message': f'Error updating question: {str(e)}'}), 500

    elif request.method == 'DELETE':
        try:
            success = quiz_service.delete_question(id)
            if success:
                return jsonify({'message': 'Question deleted successfully'}), 200
            return jsonify({'message': 'Failed to delete question'}), 400
        except Exception as e:
            return jsonify({'message': f'Error deleting question: {str(e)}'}), 500


@professor_bp.route('/questions/by_course/<int:course_id>', methods=['GET'])
@professor_required
def get_questions_by_course_api(course_id):
    try:
        questions_list = fetch_questions_by_course(course_id)
        return jsonify(questions_list or []), 200
    except Exception as e:
        print(f"Error fetching questions by course: {e}")
        return jsonify({"message": "Internal server error fetching questions."}), 500

@professor_bp.route('/add_questions', methods=['POST'])
@professor_required
def add_question_api():
    print("Received request to add question.")
    data = request.get_json() 
    print(f"Request data: {data}")    
    required_keys = ['text', 'options', 'correct_index', 'course_id']
    if not all(key in data for key in required_keys):
        return jsonify({"message": "Missing required fields"}), 400
    try:
        teacher_id = session.get('id')
        if not teacher_id:
            return jsonify({"message": "User ID not found in session. Please log in again."}), 400  
        if not data.get('course_id'):
            return jsonify({"message": "course_id is required"}), 400
        quiz_service.insert_question(data, teacher_id)
        return jsonify({"message": "Question added successfully!"}), 201    
    except ValueError as ve:
        print(f"Validation Error: {ve}")
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        print(f"Error during question insertion: {str(e)}")
        return jsonify({"message": "Internal server error during database operation."}), 500

@professor_bp.route('/delete_question/<int:question_id>', methods=['DELETE','OPTIONS'])
@professor_required
def delete_question_api(question_id):
    print(f"Received request to delete question ID: {question_id}.")
    try:
        teacher_id = session.get('id')
        if not teacher_id:
            return jsonify({"message": "User ID not found in session. Please log in again."}), 400
        
        quiz_service.delete_question(question_id)
        return jsonify({"message": "Question deleted successfully!"}), 200
        
    except Exception as e:
        print(f"Error during question deletion: {str(e)}")
        return jsonify({"message": "Internal server error during database operation."}), 500

# -------------------------------------------------------------------------
# 3. QUIZ GENERATION, PUBLISHING & PREVIEWS
# -------------------------------------------------------------------------
@professor_bp.route('/generate', methods=['POST'])
@professor_required
def generate_quiz_api():
    try:
        teacher_id = session.get('user_id') or session.get('id')
        teacher_name = session.get('username') or session.get('name') or "Professor"
        if not teacher_id:
                    return jsonify({"message": "User ID not found in session"}), 400
        
        data = request.get_json() or {}
        course_id = data.get('course_id')
        selected_units = data.get('units')

        if not course_id:
            return jsonify({"message": "Course ID is required to generate a quiz."}), 400

        quiz_data = quiz_service.generate_and_save_quiz(teacher_id, course_id, teacher_name, selected_units)
        if not quiz_data:
            return jsonify({"message": "No questions found for this course."}), 404

        return jsonify({
            "message": "Quiz generated successfully.",
            "quiz_id": quiz_data['id'],
            "quiz_link": quiz_data.get('quiz_link'),
            "token": quiz_data.get('token'),
            "question_count": quiz_data.get('question_count', 0)
        }), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({"message": f"Quiz generation failed: {str(e)}"}), 500


@professor_bp.route('/quizzes', methods=['GET'])
@professor_required
def get_quizzes_api():
    teacher_id = session.get('user_id') or session.get('id')
    try:
        quizzes = quiz_service.get_professor_quizzes(teacher_id)
        return jsonify(quizzes), 200
    except Exception as e:
        print(f"Error fetching quizzes: {e}")
        return jsonify([]), 500


@professor_bp.route('/quiz-preview/<token>', methods=['GET'])
@professor_required
def get_quiz_preview_endpoint(token):
    try:
        details = quiz_service.get_quiz_preview_details(token)
        if not details:
            return jsonify({"message": "Quiz not found"}), 404
        return jsonify(details), 200
    except Exception as e:
        print(f"Error getting quiz preview: {e}")
        return jsonify({"message": "Internal server error"}), 500


@professor_bp.route('/quizzes/<int:quiz_id>/publish', methods=['POST'])
@professor_bp.route('/publish-quiz', methods=['POST'])
@professor_required
def publish_quiz_api(quiz_id=None):
    data = request.get_json() or {}
    q_id = quiz_id or data.get('quiz_id')
    time_limit = data.get('time_limit') or data.get('duration')
    division_ids = data.get('division_ids', [])
    quiz_title = data.get('quiz_title')
    start_time = data.get('start_time')
    end_time = data.get('end_time')

    if not q_id or not division_ids:
        return jsonify({"message": "Quiz ID and target division(s) are required."}), 400

    success, message = quiz_service.publish_quiz_to_divisions(
        quiz_id=q_id, 
        time_limit=int(time_limit), 
        division_ids=division_ids, 
        quiz_title=quiz_title,
        start_time=start_time,
        end_time=end_time
    )

    if success:
        return jsonify({"message": "Quiz published successfully."}), 200
    return jsonify({"message": message or "Publish failed due to schedule conflict."}), 400


@professor_bp.route('/quizzes/<int:quiz_id>', methods=['DELETE'])
@professor_required
def delete_quiz_endpoint(quiz_id):
    try:
        success = quiz_service.delete_quiz(quiz_id)
        if success:
            return jsonify({"message": "Quiz deleted successfully"}), 200
        return jsonify({"message": "Failed to delete quiz"}), 400
    except Exception as e:
        return jsonify({"message": f"Error deleting quiz: {str(e)}"}), 500


# -------------------------------------------------------------------------
# 4. RESULTS & ANALYTICS
# -------------------------------------------------------------------------
@professor_bp.route('/analytics', methods=['GET'])
@professor_required
def get_professor_analytics():
    teacher_id = session.get('user_id') or session.get('id')
    try:
        data = quiz_service.get_dashboard_analytics(teacher_id)
        return jsonify(data), 200
    except Exception as e:
        print(f"Error fetching analytics: {e}")
        return jsonify({}), 500


@professor_bp.route('/quiz-results/<int:quiz_id>', methods=['GET'])
@professor_required
def get_quiz_results_table_endpoint(quiz_id):
    try:
        results = quiz_service.get_professor_results_table(quiz_id)
        return jsonify(results), 200
    except Exception as e:
        print(f"Error fetching quiz results: {e}")
        return jsonify([]), 500


@professor_bp.route('/publish-results', methods=['POST'])
@professor_required
def publish_results_endpoint():
    data = request.get_json() or {}
    attempt_ids = data.get('attempt_ids', [])
    try:
        success = quiz_service.publish_student_results(attempt_ids)
        if success:
            return jsonify({"message": "Results published successfully"}), 200
        return jsonify({"message": "Failed to publish results"}), 400
    except Exception as e:
        return jsonify({"message": f"Error publishing results: {str(e)}"}), 500


# -------------------------------------------------------------------------
# 5. STUDENT ROSTER & DRILL-DOWN MANAGEMENT
# -------------------------------------------------------------------------
@professor_bp.route('/course-roster', methods=['GET'])
@professor_required
def get_course_roster_endpoint():
    course_id = request.args.get('course_id')
    if not course_id:
        return jsonify([]), 200
    try:
        roster = quiz_service.get_professor_course_roster(int(course_id))
        return jsonify(roster), 200
    except Exception as e:
        print(f"Error loading course roster: {e}")
        return jsonify([]), 500


@professor_bp.route('/student-history', methods=['GET'])
@professor_required
def get_student_course_history_endpoint():
    student_id = request.args.get('student_id')
    course_id = request.args.get('course_id')
    if not student_id or not course_id:
        return jsonify([]), 200
    try:
        history = quiz_service.get_student_course_history(int(student_id), int(course_id))
        return jsonify(history), 200
    except Exception as e:
        print(f"Error loading student history: {e}")
        return jsonify([]), 500


@professor_bp.route('/override-grade', methods=['POST'])
@professor_required
def override_student_grade():
    data = request.get_json() or {}
    attempt_id = data.get('attempt_id')
    new_score = data.get('new_score')

    if attempt_id is None or new_score is None:
        return jsonify({"message": "Attempt ID and New Score are required"}), 400

    try:
        success = quiz_service.update_attempt_grade(int(attempt_id), float(new_score))
        if success:
            return jsonify({"message": "Grade updated successfully"}), 200
        return jsonify({"message": "Failed to update grade"}), 400
    except Exception as e:
        return jsonify({"message": f"Error updating grade: {str(e)}"}), 500


# -------------------------------------------------------------------------
# 6. EXAM PAPER GENERATION (PHASE 2)
# -------------------------------------------------------------------------
@professor_bp.route('/upload-paper-file', methods=['POST'])
@professor_required
def upload_paper_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    course_id = request.form.get('course_id')
    teacher_id = session.get('user_id') or session.get('id')

    if not course_id:
        return jsonify({"error": "Course ID is required"}), 400

    filename = secure_filename(file.filename)
    ext = filename.rsplit('.', 1)[-1].lower()

    upload_folder = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    temp_path = os.path.join(upload_folder, filename)
    file.save(temp_path)

    try:
        if ext == 'csv':
            res = parse_and_save_csv(temp_path, teacher_id, course_id)
        elif ext == 'docx':
            res = parse_and_save_docx(temp_path, teacher_id, course_id)
        elif ext == 'pdf':
            res = parse_and_save_pdf(temp_path, teacher_id, course_id)
        else:
            return jsonify({"error": "Unsupported file format. Use PDF, DOCX, or CSV."}), 400

        return jsonify(res), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@professor_bp.route('/generate-custom-paper', methods=['POST'])
@professor_required
def generate_custom_paper_endpoint():
    data = request.get_json()
    teacher_id = session.get('user_id') or session.get('id')

    print(f"DEBUG: Generate Paper Request by Teacher ID: {teacher_id}")
    print(f"DEBUG: Received Blueprint Data: {data}")

    if not data or not data.get('questions'):
        return jsonify({"error": "Invalid paper blueprint submitted"}), 400

    try:
        result = generate_exam_paper(teacher_id, data)
        return jsonify(result), 200
    except Exception as e:
        print(f"ERROR during paper generation: {str(e)}")
        return jsonify({"error": str(e)}), 400


@professor_bp.route('/past-papers', methods=['GET'])
@professor_required
def get_past_papers():
    course_id = request.args.get('course_id')
    teacher_id = session.get('user_id') or session.get('id')

    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        query = """
            SELECT p.id, p.paper_title, p.exam_type, p.total_marks, p.academic_year, p.created_at, c.course_name
            FROM generated_question_papers p
            JOIN course c ON p.course_id = c.id
            WHERE p.teacher_id = %s
        """
        params = [teacher_id]
        if course_id:
            query += " AND p.course_id = %s"
            params.append(course_id)

        query += " ORDER BY p.created_at DESC"
        cursor.execute(query, tuple(params))
        papers = cursor.fetchall()
        return jsonify(papers or []), 200
    finally:
        cursor.close()
        conn.close()


@professor_bp.route('/paper-details/<int:paper_id>', methods=['GET'])
@professor_required
def get_paper_details_endpoint(paper_id):
    paper = get_paper_full_details(paper_id)
    if not paper:
        return jsonify({"error": "Paper not found"}), 404
    return jsonify(paper), 200


@professor_bp.route('/export-paper-docx/<int:paper_id>', methods=['GET'])
@professor_required
def export_paper_docx_endpoint(paper_id):
    try:
        file_stream = export_paper_to_docx(paper_id)
        return send_file(
            file_stream,
            as_attachment=True,
            download_name=f"GSFC_Exam_Paper_{paper_id}.docx",
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------------------------------------------------------------
# 7. Replacemnt Question API
# -------------------------------------------------------------------------
@professor_bp.route("/get-replacement-question", methods=["POST"])
def get_replacement_question():
  data = request.json or {}
  exclude_ids = data.get("exclude_ids", [])
  subject = data.get("subject", None)

  db = None
  cursor = None
  try:
    db = get_db_connection()
    cursor = db.cursor()

    # 1. Fetch 1 random question from question_bank
    query = "SELECT * FROM question_bank WHERE 1=1"
    params = []

    if exclude_ids:
      format_strings = ",".join(["%s"] * len(exclude_ids))
      query += f" AND id NOT IN ({format_strings})"
      params.extend(exclude_ids)

    if subject:
      query += " AND subject = %s"
      params.append(subject)

    query += " ORDER BY RAND() LIMIT 1"

    cursor.execute(query, params)
    row = cursor.fetchone()

    if not row:
      return (
          jsonify({
              "success": False,
              "message": "No additional questions available in database.",
          }),
          404,
      )

    # --- SAFE DICTIONARY CONVERSION ---
    if isinstance(row, dict):
      q = row
    else:
      # Map tuple values to column names
      columns = [col[0] for col in cursor.description]
      q = dict(zip(columns, row))

    q_id = q.get("id")
    q_text = q.get("question_txt") or q.get("question_text")

    # 2. Fetch options from answer_map
    opt_query = "SELECT * FROM answer_map WHERE question_id = %s"
    cursor.execute(opt_query, (q_id,))
    opt_rows = cursor.fetchall()

    options = []
    if opt_rows:
      # Check if cursor returned dicts or tuples for answer_map
      if isinstance(opt_rows[0], dict):
        raw_options = opt_rows
      else:
        opt_cols = [col[0] for col in cursor.description]
        raw_options = [dict(zip(opt_cols, r)) for r in opt_rows]

      for opt in raw_options:
        options.append({
            "text": str(opt.get("option_text", "")),
            "is_correct": bool(opt.get("is_correct")),
        })

    # DEBUG CHECK
    print("=" * 50)
    print("REAL Q_ID:", q_id)
    print("REAL QUESTION TEXT:", q_text)
    print("REAL OPTIONS COUNT:", len(options))
    print("=" * 50)

    formatted_question = {
        "id": q_id,
        "text": q_text,
        "question_txt": q_text,
        "options": options,
    }

    return jsonify({"success": True, "question": formatted_question}), 200

  except Exception as e:
    print("Error replacing question:", str(e))
    return jsonify({"success": False, "message": str(e)}), 500

  finally:
    if cursor:
      cursor.close()
    if db:
      db.close()