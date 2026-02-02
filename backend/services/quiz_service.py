from ..extensions import get_db_connection
from ..import create_app
import random
import pymysql
from flask import session
from datetime import datetime, timedelta
import uuid
import random
from wtforms import StringField, SelectField, SubmitField
from wtforms.validators import DataRequired 
import os

# 1. Fetch Teacher's Courses
def get_courses_for_teacher(teacher_id):
    """Fetches courses linked to the professor's department."""
    print(f"DEBUG: Fetching courses for Teacher ID: {teacher_id}") # 👈 Print ID
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        sql = """
            SELECT DISTINCT c.id, c.course_name
            FROM course c
            JOIN semester_course sc ON c.id = sc.course_id
            JOIN department_semester ds ON sc.semester_id = ds.semester_id
            JOIN employee_school_department esd ON ds.dept_id = esd.dept_id
            WHERE esd.employee_id = %s
            ORDER BY c.course_name
        """
        cursor.execute(sql, (teacher_id,))
        results = cursor.fetchall()
        print(f"DEBUG: Found {len(results)} courses: {results}") # 👈 Print Results
        return results
    except Exception as e:
        print(f"Error fetching teacher courses: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

# 2. Add a New Question           ❤️❤️❤️❤️❤️ 
def insert_question(form_data, teacher_id): 
    conn = get_db_connection()
    cursor = conn.cursor()

    DEFAULT_TYPE = "MCQ"
    DEFAULT_UNIT = 1
    DEFAULT_MARKS = int(form_data.get('marks', 1))

    course_id = form_data.get('course_id')
    if not course_id:
        raise ValueError("Course ID is required to add a question.")

    try:
        # Insert into Question Bank
        sql_insert_question = """
            INSERT INTO question_bank (question_txt, question_type, unit, marks)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql_insert_question, (
            form_data['text'], 
            DEFAULT_TYPE,  
            DEFAULT_UNIT,  
            DEFAULT_MARKS,
        ))
        new_question_id = cursor.lastrowid

        # Insert Options
        sql_insert_options = """
            INSERT INTO answer_map (question_id, option_text, is_correct)
            VALUES (%s, %s, %s)
        """
        
        # Handle options (flexible for list of dicts or list of strings)
        if 'options' in form_data and isinstance(form_data['options'][0], dict):
             for opt in form_data['options']:
                cursor.execute(sql_insert_options, (
                    new_question_id,
                    opt['text'],
                    1 if opt['isCorrect'] else 0
                ))
        else:
            correct_index = int(form_data.get('correct_index', -1))
            for index, option_text in enumerate(form_data.get('options', [])):
                is_correct_flag = 1 if index == correct_index else 0
                cursor.execute(sql_insert_options, (new_question_id, option_text, is_correct_flag))

        # Link Question to Teacher
        sql_link_creator = "INSERT INTO question_employee (question_id, employee_id) VALUES (%s, %s)"
        cursor.execute(sql_link_creator, (new_question_id, teacher_id))

        # Link Question to Course
        sql_link_course = "INSERT INTO question_course (question_id, course_id) VALUES (%s, %s)"
        cursor.execute(sql_link_course, (new_question_id, course_id))

        conn.commit() 
    except Exception as e:
        conn.rollback() 
        print(f"Database error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

# 3. Fetch All Questions (Creator Scope)
def fetch_questions(employee_id, fetch_scope='creator', course_id=None):
    """Fetches questions created by an employee. If course_id is provided, filters by course."""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    if not employee_id and fetch_scope == 'creator':
        return {}

    try:
        emp_id = employee_id
        if course_id:
            select_clause = """
                SELECT 
                    qb.id AS question_id,
                    qb.question_txt,
                    qb.unit, 
                    am.id AS option_id,
                    am.option_text,
                    am.is_correct
                FROM question_bank qb
                JOIN answer_map am ON qb.id = am.question_id
                JOIN question_employee qe ON qb.id = qe.question_id
                JOIN question_course qc ON qb.id = qc.question_id
                WHERE
                    qe.employee_id = %s 
                    AND qc.course_id = %s
            """
            cursor.execute(select_clause, (emp_id, course_id))
        else:
            select_clause = """
                SELECT 
                    qb.id AS question_id,
                    qb.question_txt,
                    qb.unit, 
                    am.id AS option_id,
                    am.option_text,
                    am.is_correct
                FROM
                    question_bank qb
                JOIN
                    answer_map am ON qb.id = am.question_id
                JOIN
                    question_employee qe ON qb.id = qe.question_id
                WHERE
                    qe.employee_id = %s
            """
            cursor.execute(select_clause, (emp_id,))
        results = cursor.fetchall()
    except Exception as e:
        print(f"Query failed to execute: {e}")
        return {}
    finally:
        cursor.close()
        conn.close()
    questions_with_options = {}
    for row in results:
        q_id = row['question_id']

        if q_id not in questions_with_options:
            questions_with_options[q_id] = {
                'question_id': q_id,
                'question_txt': row['question_txt'],
                'unit': row['unit'],
                'options': []
            }
        questions_with_options[q_id]['options'].append({
            'option_id': row['option_id'],
            'option_text': row['option_text'],
            'is_correct': row['is_correct']
        })
    print(questions_with_options)
    return questions_with_options

# 4. Update Question
def update_question(question_id, data):
    """Updates the question text and re-saves all options/answers in a transaction.
    Also updates the question->course mapping if 'course_id' is provided in the payload."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Update the question text in question_bank
    sql_update_question = """
        UPDATE question_bank SET question_txt = %s WHERE id = %s
    """
    
    # 2. Delete existing answers/options from answer_map
    sql_delete_options = """
        DELETE FROM answer_map WHERE question_id = %s
    """
    
    # 3. Insert the new/updated options into answer_map
    sql_insert_options = """
        INSERT INTO answer_map (question_id, option_text, is_correct)
        VALUES (%s, %s, %s)
    """

    # 4. SQL for updating course mapping
    sql_delete_qc = """
        DELETE FROM question_course WHERE question_id = %s
    """
    sql_insert_qc = """
        INSERT INTO question_course (question_id, course_id) VALUES (%s, %s)
    """

    try:
        # Start Transaction
        conn.begin()
        
        # --- Update Question Bank ---
        cursor.execute(sql_update_question, (data['text'], question_id))

        # --- Delete Old Options ---
        cursor.execute(sql_delete_options, (question_id,))

        # --- Insert New Options ---
        correct_index = int(data.get('correct_index', -1))
        
        # Note: We use data['options'] which includes the empty strings for up to 4 options
        for index, option_text in enumerate(data['options']):
            # Skip inserting empty options if they were not provided
            if not option_text.strip():
                continue
                
            is_correct_flag = 1 if index == correct_index else 0
            
            cursor.execute(sql_insert_options, (
                question_id,
                option_text,
                is_correct_flag,
            ))

        # --- Update course mapping if provided ---
        if 'course_id' in data and data['course_id']:
            cursor.execute(sql_delete_qc, (question_id,))
            cursor.execute(sql_insert_qc, (question_id, data['course_id']))
            
        # Commit all changes if successful
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback() # Revert all changes if any step failed
        print(f"Database error during question update: {e}")
        return False

    finally:
        cursor.close()
        conn.close()

# 6. Fetch Questions by Course ID
def fetch_questions_by_course(course_id):
    """Fetches full question details for a specific course ID.
    Returns list of objects: { question_id, question_txt, options: [{option_text,is_correct}, ...] }
    """
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # JOIN linking question text to their options and correct status
        sql = """
            SELECT 
                qb.id AS question_id,
                qb.question_txt,
                am.option_text,
                am.is_correct
            FROM question_bank qb
            JOIN answer_map am ON qb.id = am.question_id
            JOIN question_course qc ON qb.id = qc.question_id
            WHERE qc.course_id = %s
        """
        cursor.execute(sql, (course_id,))
        results = cursor.fetchall()

        # Restructure results into nested format for React
        questions = {}
        for row in results:
            q_id = row['question_id']
            if q_id not in questions:
                questions[q_id] = {
                    'question_id': q_id,
                    'question_txt': row['question_txt'],
                    'options': []
                }
            questions[q_id]['options'].append({
                'option_text': row['option_text'],
                'is_correct': row['is_correct']
            })
        return list(questions.values())
    except Exception as e:
        print(f"Database crash during question fetch: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

# 7. Delete Question
def delete_question(question_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    sql_delete_answer_map = "DELETE FROM answer_map WHERE question_id = %s"
    sql_delete_question_employee = "DELETE FROM question_employee WHERE question_id = %s"
    sql_delete_question_course = "DELETE FROM question_course WHERE question_id = %s"
    sql_delete_question_bank = "DELETE FROM question_bank WHERE id = %s"
    sql_delete_quiz_questions_generated = "DELETE FROM question_course WHERE question_id = %s"

    try:
        cursor.execute(sql_delete_answer_map, (question_id,))
        cursor.execute(sql_delete_question_employee, (question_id,))
        cursor.execute(sql_delete_question_course, (question_id,))
        cursor.execute(sql_delete_question_bank, (question_id,))
        cursor.execute(sql_delete_quiz_questions_generated, (question_id,))

        print(f"Deleted question ID: {question_id} and its related data.")
        conn.commit()
        return True 
        
    except Exception as e:
        conn.rollback()
        print(f"Delete error: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

# 8. Generate and Save Quiz ❤️❤️❤️❤️❤️
def generate_and_save_quiz(teacher_id, course_id, teacher_name):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        sql_context = """
            SELECT 
                s.school_name,
                p.program_name,
                d.dept_name,
                sc.semester_id,
                c.course_name
            FROM course c
            JOIN semester_course sc ON c.id = sc.course_id
            JOIN department_semester ds ON sc.semester_id = ds.semester_id
            JOIN department d ON ds.dept_id = d.id
            JOIN dept_program dp ON d.id = dp.dept_id
            JOIN program p ON dp.program_id = p.id
            JOIN school s ON p.school_id = s.id
            WHERE c.id = %s 
            LIMIT 1
        """
        
        cursor.execute(sql_context, (course_id))
        meta = cursor.fetchone()

        school_name = meta['school_name'] if meta else "N/A"
        dept_name = meta['dept_name'] if meta else "N/A"
        prog_name = meta['program_name'] if meta else "N/A"
        sem_name = f"Semester {meta['semester_id']}" if meta else "N/A"
        course_name = meta['course_name'] if meta else "N/A"
        print(f"DEBUG: Generating quiz for Course: {course_name}")

        query_q = """
            SELECT qb.id FROM question_bank qb
            JOIN question_employee qe ON qb.id = qe.question_id
            JOIN question_course qc ON qb.id = qc.question_id
            WHERE qe.employee_id = %s AND qc.course_id = %s
            ORDER BY RAND() LIMIT 10
        """
        cursor.execute(query_q, (teacher_id, course_id))
        selected_questions = cursor.fetchall()

        if not selected_questions: return None

        count = len(selected_questions)

        quiz_token = str(uuid.uuid4())[:12]
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        quiz_link = f"{frontend_url}/take-quiz/{quiz_token}"
        
        insert_quiz = """
            INSERT INTO quizzes (
                teacher_id, course_id, quiz_title, quiz_link, quiz_token, quiz_status, total_questions,
                teacher, school, department, program, semester, course
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_quiz, (
            teacher_id, 
            course_id, 
            f"Quiz: {course_name}", 
            quiz_link, 
            quiz_token, 
            "Active",
            count,
            teacher_name, 
            school_name,  
            dept_name,    
            prog_name,    
            sem_name,     
            course_name   
        ))
        quiz_id = cursor.lastrowid

        for q in selected_questions:
            # 🚀 LOWERCASE TABLE NAME HERE TO MATCH DB
            cursor.execute("INSERT INTO quiz_questions_generated (quiz_id, question_id) VALUES (%s, %s)", (quiz_id, q['id']))

        conn.commit()
        return {"id": quiz_id, "quiz_link": quiz_link, "token": quiz_token, "question_count": count}
    finally:
        conn.close()

# 9. Generate Quiz  ❤️❤️❤️❤️❤️
def get_professor_quizzes(teacher_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        sql = """
            SELECT 
                id, quiz_title, teacher, school, department, program, 
                semester, course, course_id, total_questions, 
                quiz_status AS status, 
                quiz_link, 
                quiz_token AS token, 
                created_at 
            FROM quizzes 
            WHERE teacher_id = %s 
            ORDER BY created_at DESC
        """
        cursor.execute(sql, (teacher_id,))
        results = cursor.fetchall()
        
        # Convert datetime objects to string
        for row in results:
            if row['created_at']:
                row['created_at'] = row['created_at'].isoformat()
                
        return results
    except Exception as e:
        print(f"Error fetching professor quizzes: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

# 10. Get Quiz Preview ❤️❤️❤️❤️❤️
def get_quiz_preview_details(token):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Get the Quiz ID from the Token
        cursor.execute("SELECT id, quiz_title FROM quizzes WHERE quiz_token = %s", (token,))
        quiz = cursor.fetchone()
        
        if not quiz:
            print(f"DEBUG: Quiz not found for token: {token}")
            return None
        
        # 2. Fetch Questions using the Quiz ID (NOT the token)
        sql = """
            SELECT 
                qb.id as question_id, 
                qb.question_txt, 
                am.option_text, 
                am.is_correct
            FROM quiz_questions_generated qqg
            JOIN question_bank qb ON qqg.question_id = qb.id
            JOIN answer_map am ON qb.id = am.question_id
            WHERE qqg.quiz_id = %s 
        """
        # ⚠️ FIX: Pass quiz['id'], not token
        cursor.execute(sql, (quiz['id'],)) 
        results = cursor.fetchall()        
        if not results:
            return {"title": quiz['quiz_title'], "questions": []}
        # 3. Restructure Data
        quiz_data = {"title": quiz['quiz_title'], "questions": {}}   
        for row in results:
            q_id = row['question_id']
            if q_id not in quiz_data['questions']:
                quiz_data['questions'][q_id] = {
                    "id": q_id, 
                    "text": row['question_txt'], 
                    "options": []
                }
            quiz_data['questions'][q_id]['options'].append({
                "text": row['option_text'], 
                "is_correct": row['is_correct']
            })
            
        quiz_data['questions'] = list(quiz_data['questions'].values())
        return quiz_data

    except Exception as e:
        print(f"Error fetching preview: {e}")
        return None
    finally:
        cursor.close()
        conn.close()

# 11. Delete Quiz ❤️❤️❤️❤️❤️
def delete_quiz(quiz_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Delete linked questions in the generated quiz table
        cursor.execute("DELETE FROM quiz_questions_generated WHERE quiz_id = %s", (quiz_id,))
        
        # 2. Delete the quiz entry itself
        cursor.execute("DELETE FROM quizzes WHERE id = %s", (quiz_id,))
        
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error deleting quiz: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

# 12. Get Single Question by ID
def get_question_by_id(question_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)    
    try:
        # SQL to join the question with all its options and correct flag and course mapping
        sql = """
            SELECT 
                qb.id AS question_id,
                qb.question_txt, 
                am.option_text,
                am.is_correct,
                qc.course_id
            FROM question_bank qb
            JOIN answer_map am ON qb.id = am.question_id
            LEFT JOIN question_course qc ON qb.id = qc.question_id
            WHERE qb.id = %s
        """
        cursor.execute(sql, (question_id,))
        results = cursor.fetchall()

        if not results:
            return None # Question not found
        question_data = {
            'text': results[0]['question_txt'], 
            'options': [],
            'correct': '', # Will hold the index (0, 1, 2, 3) as a string
            'course_id': results[0].get('course_id') if results[0].get('course_id') else ''
        }        
        option_texts = []
        correct_text = None
        for row in results:
            option_texts.append(row['option_text'])
            if row['is_correct'] == 1:
                correct_text = row['option_text']
        while len(option_texts) < 4:
            option_texts.append("")
        question_data['options'] = option_texts
        # Find the index of the correct text and store it as a string
        if correct_text in option_texts:
            correct_index = option_texts.index(correct_text)
            question_data['correct'] = str(correct_index)
        else:
             question_data['correct'] = '' # Failsafe
        
        return question_data

    except Exception as e:
        print(f"Database error in get_question_by_id: {e}")
        return None
    finally:
        cursor.close()
        conn.close()    

#  Publishing Part ❤️❤️❤️❤️❤️

# Add this new function to fetch divisions allowed for this teacher
def get_divisions_for_publish(teacher_id, course_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Fetch only divisions where the teacher is assigned to this course
        sql = """
            SELECT d.id, d.division 
            FROM division d
            JOIN teacher_course_division tcd ON d.id = tcd.division_id
            WHERE tcd.teacher_id = %s AND tcd.course_id = %s
            ORDER BY d.division ASC
        """
        cursor.execute(sql, (teacher_id, course_id))
        return cursor.fetchall()
    except Exception as e:
        print(f"Error fetching divisions: {e}")
        return []
    finally:
        cursor.close()
        conn.close()

# Add this function to handle the Publish logic
def publish_quiz_to_divisions(quiz_id, time_limit, division_ids):
    """Updates quiz status and links it to specific divisions."""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Update Quiz Metadata (Time Limit & Status)
        update_quiz_sql = """
            UPDATE quizzes 
            SET time_limit = %s, quiz_status = 'Published' 
            WHERE id = %s
        """
        cursor.execute(update_quiz_sql, (time_limit, quiz_id))

        # 2. Get Course and Semester info from the quiz to ensure consistency
        get_ids_sql = """
            SELECT q.course_id, sc.semester_id 
            FROM quizzes q
            JOIN semester_course sc ON q.course_id = sc.course_id
            WHERE q.id = %s LIMIT 1
        """
        cursor.execute(get_ids_sql, (quiz_id,))
        meta = cursor.fetchone() # returns tuple (course_id, semester_id)
        
        if not meta:
            raise Exception("Could not verify course/semester details.")
            
        course_id = meta['course_id']
        semester_id = meta['semester_id']

        # 3. Link Quiz to Selected Divisions
        # Clear old links first to prevent duplicates
        cursor.execute("DELETE FROM quiz_semester_course_division WHERE quiz_id = %s", (quiz_id,))

        insert_div_sql = """
            INSERT INTO quiz_semester_course_division 
            (quiz_id, semester_id, course_id, division_id)
            VALUES (%s, %s, %s, %s)
        """
        
        for div_id in division_ids:
            cursor.execute(insert_div_sql, (quiz_id, semester_id, course_id, div_id))

        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error publishing quiz: {type(e).__name__}: {e}")
        return False
    finally:
        cursor.close()
        conn.close() 

def get_professor_results_table(quiz_id):
    """
    Fetches the big table: Student Name, Enrollment, Course, Sem, Marks.
    """
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        sql = """
            SELECT 
                s.f_name, s.l_name, s.enrollment_no, s.email,
                qa.total_score, qa.submit_time, qa.attempt_id,
                sem.sem_no, c.course_name
            FROM student_quiz_attempt sqa
            JOIN quiz_attempt qa ON sqa.attempt_id = qa.attempt_id
            JOIN student s ON sqa.student_id = s.id
            -- Join Academic Info to get Course/Sem
            LEFT JOIN student_academic_info sai ON s.id = sai.student_id
            LEFT JOIN semester sem ON sai.semester_id = sem.id
            LEFT JOIN quizzes q ON sqa.quiz_id = q.id
            LEFT JOIN course c ON q.course = c.id -- Assuming quiz table stores course ID
            WHERE sqa.quiz_id = %s
            ORDER BY qa.total_score DESC
        """
        cursor.execute(sql, (quiz_id,))
        return cursor.fetchall()
    finally:
        cursor.close()
        conn.close()


# 🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮
# STUDENT SIDE
def get_quiz_for_student(token):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        SELECT q.quiz_title, qb.id as question_id, qb.question_txt, 
               am.id as option_id, am.option_text
        FROM quizzes q
        JOIN quiz_questions_generated qqg ON q.id = qqg.quiz_id
        JOIN question_bank qb ON qqg.question_id = qb.id
        JOIN answer_map am ON qb.id = am.question_id
        WHERE q.quiz_token = %s
    """
    cursor.execute(query, (token,))
    quiz_info = cursor.fetchall()

    #🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍
    # Check Question and Option Counts of a Token, for debugging
    # unique_question_ids = {row['question_id'] for row in quiz_info}
    # print(f"Total rows (options) returned: {len(quiz_info)}")
    # print(f"Total unique questions: {len(unique_question_ids)}")
    #🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍

    if not quiz_info:
        return 'Invalid token or no quiz found.'

    quiz_data = {
        "title": quiz_info[0]['quiz_title'],
        "questions": {}
    }

    for row in quiz_info:
        q_id = row['question_id']
        if q_id not in quiz_data['questions']:
            quiz_data['questions'][q_id] = {
                "id": q_id,
                "text": row['question_txt'],
                "options": []
            }
        quiz_data['questions'][q_id]['options'].append({
            "id": row['option_id'],
            "text": row['option_text']
        })

    quiz_data['questions'] = list(quiz_data['questions'].values())
    return quiz_data

# def save_student_quiz_responses(quiz_id, student_id, responses):
#     conn = get_db_connection()
#     cursor = conn.cursor()
    
#     sql_insert_response = """
#         INSERT INTO student_quiz_responses (quiz_id, student_id, question_id, selected_option_id)
#         VALUES (%s, %s, %s, %s)
#     """

#     try:
#         response_entries = [
#             (quiz_id, student_id, q_id, option_id) 
#             for q_id, option_id in responses.items()
#         ]

#         cursor.executemany(sql_insert_response, response_entries)
#         conn.commit()
        
#     except Exception as e:
#         conn.rollback()
#         print(f"Database error: {e}")

#     finally:
#         cursor.close()
#         conn.close()

def submit_student_quiz(token, student_id, answers):
    """
    Calculates score and stores attempts in DB.
    answers: dict { question_id: option_id }
    """
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Get Quiz ID from Token
        cursor.execute("SELECT id FROM quizzes WHERE quiz_token = %s", (token,))
        quiz = cursor.fetchone()
        if not quiz: return None
        quiz_id = quiz['id']

        # 2. Calculate Score
        total_score = 0
        response_data = [] # List to store tuples for batch insert

        for q_id, opt_id in answers.items():
            # Check if option is correct
            # Assumes answer_map has 'is_correct' boolean
            cursor.execute("SELECT is_correct FROM answer_map WHERE id = %s", (opt_id,))
            option = cursor.fetchone()
            
            marks = 0
            if option and option['is_correct']:
                # Get marks for this question
                cursor.execute("SELECT marks FROM question_bank WHERE id = %s", (q_id,))
                q_meta = cursor.fetchone()
                marks = q_meta['marks'] if q_meta else 1
                total_score += marks
            
            response_data.append((q_id, opt_id, marks))

        # 3. Insert into quiz_attempt
        cursor.execute("""
            INSERT INTO quiz_attempt (total_score, attempt_status, submit_time, is_published)
            VALUES (%s, 'Completed', NOW(), FALSE)
        """, (total_score,))
        attempt_id = cursor.lastrowid

        # 4. Link Student -> Quiz -> Attempt
        cursor.execute("""
            INSERT INTO student_quiz_attempt (student_id, quiz_id, attempt_id)
            VALUES (%s, %s, %s)
        """, (student_id, quiz_id, attempt_id))

        # 5. Store Responses (JSON logic stored relationally)
        for q_id, opt_id, marks in response_data:
            cursor.execute("""
                INSERT INTO attempt_response (attempt_id, question_id, selected_option_id, marks_awarded)
                VALUES (%s, %s, %s, %s)
            """, (attempt_id, q_id, opt_id, marks))

        conn.commit()
        return {"score": total_score, "attempt_id": attempt_id}

    except Exception as e:
        conn.rollback()
        print(f"Error submitting quiz: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()

def get_student_attempt_details(attempt_id):
    """
    Fetches the full quiz review: Questions, Selected Options, Correct Options, and Colors.
    """
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Fetch Basic Attempt Info
        cursor.execute("""
            SELECT qa.total_score, qa.submit_time, q.quiz_title, q.total_questions 
            FROM quiz_attempt qa
            JOIN student_quiz_attempt sqa ON qa.attempt_id = sqa.attempt_id
            JOIN quizzes q ON sqa.quiz_id = q.id
            WHERE qa.attempt_id = %s
        """, (attempt_id,))
        attempt_meta = cursor.fetchone()
        
        if not attempt_meta: return None

        # 2. Fetch All Responses (Questions + Selected Answer)
        sql = """
            SELECT 
                q.id as question_id, q.question_txt, q.marks,
                ar.selected_option_id, ar.marks_awarded
            FROM attempt_response ar
            JOIN question_bank q ON ar.question_id = q.id
            WHERE ar.attempt_id = %s
        """
        cursor.execute(sql, (attempt_id,))
        questions = cursor.fetchall()

        # 3. For each question, fetch options and label them (Correct vs Selected)
        for q in questions:
            cursor.execute("SELECT id, option_text, is_correct FROM answer_map WHERE question_id = %s", (q['question_id'],))
            options = cursor.fetchall()
            
            # Map options for Frontend
            formatted_options = []
            for opt in options:
                is_selected = (opt['id'] == q['selected_option_id'])
                is_correct = (opt['is_correct'] == 1)
                
                # Determine Color Status
                status = "neutral"
                if is_selected and is_correct:
                    status = "correct" # Green
                elif is_selected and not is_correct:
                    status = "wrong"   # Red
                elif not is_selected and is_correct:
                    status = "missed"  # Show correct answer in Green (or lighter green)
                
                formatted_options.append({
                    "id": opt['id'],
                    "text": opt['option_text'],
                    "status": status 
                })
            
            q['options'] = formatted_options

        return {
            "meta": attempt_meta,
            "questions": questions
        }
    finally:
        cursor.close()
        conn.close()


# ==============================================================================================
# if __name__ == "__main__":
#     app = create_app()
#     with app.app_context():
#         # 🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬
#         # Testing get_quiz_for_student
#         test_token = "fac0a6d4-71b"
#         print(get_quiz_for_student(test_token))
#         # De-comment --> #🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍🎍
#         #command to run ('python -m backend.services.quiz_service)