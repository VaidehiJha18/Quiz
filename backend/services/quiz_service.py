from ..extensions import get_db_connection
from ..import create_app
import random
import pymysql
from flask import session
from datetime import datetime, timedelta
import uuid
import random
from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, SubmitField
from wtforms.validators import DataRequired 

class QuestionForm(FlaskForm):
    pass 

# 1. Database Add Question
def insert_question(form_data, teacher_id): 
    conn = get_db_connection()
    cursor = conn.cursor()
    DEFAULT_TYPE = "MCQ"
    DEFAULT_UNIT = 1
    DEFAULT_MARKS = 1
    DEFAULT_COURSE_ID = 21 #for now

    sql_insert_question_bank = """
        INSERT INTO question_bank (question_txt, question_type, unit, marks)
        VALUES (%s, %s, %s, %s)
    """
    sql_insert_options = """
        INSERT INTO answer_map (question_id, option_text, is_correct)
        VALUES (%s, %s, %s)
    """
    sql_link_question_to_course = """
        INSERT INTO question_course (question_id, course_id)
        VALUES (%s, %s)
    """
    sql_link_question_to_creator = """
        INSERT INTO question_employee (question_id, employee_id)
        VALUES (%s, %s)
    """
    sql_link_question_to_course = """
        INSERT INTO question_course (question_id, course_id)
        VALUES (%s, %s)
    """

    try:
        cursor.execute(sql_insert_question_bank, (
            form_data['text'], 
            DEFAULT_TYPE,  
            DEFAULT_UNIT,  
            DEFAULT_MARKS,
        ))

        new_question_id = cursor.lastrowid
        correct_index = int(form_data['correct_index'])

        for index, option_text in enumerate(form_data['options']):
            is_correct_flag = 1 if index == correct_index else 0
            cursor.execute(sql_insert_options, (
                new_question_id,
                option_text,
                is_correct_flag,
            ))

        cursor.execute(sql_link_question_to_creator, (new_question_id, teacher_id))
        cursor.execute(sql_link_question_to_course, (new_question_id, DEFAULT_COURSE_ID))

        print(f"Inserted question ID: {new_question_id} with options.")

        conn.commit() 
        
    except Exception as e:
        conn.rollback() 
        print(f"Database error: {e}")
        raise

    finally:
        cursor.close()
        conn.close()

def update_question(question_id, form_data):
    conn = get_db_connection()
    cursor = conn.cursor()

    sql_update_question_bank = """
        UPDATE question_bank
        SET question_txt = %s
        WHERE id = %s
    """

    sql_update_options = """
        UPDATE answer_map
        SET option_text = %s, is_correct = %s
        WHERE question_id = %s AND option_id = %s
    """

    try:
        cursor.execute(sql_update_question_bank, (
            form_data['text'], 
            question_id
        ))

        correct_index = int(form_data['correct_index'])

        for index, option_text in enumerate(form_data['options']):
            is_correct_flag = 1 if index == correct_index else 0
            option_id = form_data['option_ids'][index]  # Assuming option_ids are provided in form_data
            cursor.execute(sql_update_options, (
                option_text,
                is_correct_flag,
                question_id,
                option_id
            ))

        print(f"Updated question ID: {question_id} with options.")
        conn.commit() 
        
    except Exception as e:
        conn.rollback() 
        print(f"Database error: {e}")

    finally:
        cursor.close()
        conn.close()

# 4. Database Delete Question
def delete_question(question_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    sql_delete_answer_map = "DELETE FROM answer_map WHERE question_id = %s"
    sql_delete_question_employee = "DELETE FROM question_employee WHERE question_id = %s"
    sql_delete_question_course = "DELETE FROM question_course WHERE question_id = %s"
    sql_delete_question_bank = "DELETE FROM question_bank WHERE id = %s"

    try:
        cursor.execute(sql_delete_answer_map, (question_id,))
        cursor.execute(sql_delete_question_employee, (question_id,))
        cursor.execute(sql_delete_question_course, (question_id,))
        cursor.execute(sql_delete_question_bank, (question_id,))

        print(f"Deleted question ID: {question_id} and its related data.")
        conn.commit() 
        
    except Exception as e:
        conn.rollback() 
        print(f"Database error: {e}")

    finally:
        cursor.close()
        conn.close()

# 2. Database fetch all questions
def fetch_questions(employee_id, fetch_scope='creator'):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor) 
    
    if not employee_id and fetch_scope == 'creator':
        return []
    
    try:
        # Select the course_id from dropdown and connect here
        course_id = 21 # for now
        emp_id = employee_id
        # Fetch questions based on employee and course
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
            JOIN
                question_course qc ON qb.id = qc.question_id
            WHERE
                qe.employee_id = %s 
                AND qc.course_id = %s
        """

        select_params = (emp_id, course_id)
        print(f"DEBUG: SQL Params: {select_params}, Types: {type(emp_id), type(course_id)}")

        cursor.execute(select_clause, (emp_id, course_id)) 
        results = cursor.fetchall()

    except Exception as e:
        print(f"Query failed to execute: {e}")
        return []
        
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
# Vaidehi Changes

def get_question_by_id(question_id):
    """Fetches a single question and its options from the database by ID."""
    conn = get_db_connection()
    # Use DictCursor to get results as dictionaries
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    # teacher_id = None
    quiz_id = None

    try:    
        cursor.execute("SELECT id FROM question_bank")
        all_questions = cursor.fetchall()

        all_ids = [q['id'] for q in all_questions]
        SAMPLE_SIZE = 5
        
        if not all_ids:
            return None 

        selected_ids = random.sample(all_ids, min(SAMPLE_SIZE, len(all_ids)))

        unique_link_id = str(uuid.uuid4())
        quiz_title = f"New Quiz - {datetime.now().strftime('%Y%m%d%H%M%S')}"

        sql_quiz = """
            INSERT INTO generated_quizzes 
                (teacher_id, quiz_title, quiz_status, total_questions, total_marks, time_limit, quiz_link, scheduled_start_time, scheduled_end_time)
            VALUES 
                (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (question_id,))
        results = cursor.fetchall()

        if not results:
            return None # Question not found

        # Initialize the final question structure
        question_data = {
            # Use 'question_txt' from DB and map to 'text' for the frontend state
            'text': results[0]['question_txt'], 
            'options': [],
            'correct': '' # Will hold the index (0, 1, 2, 3) as a string
        }
        
        # Collect options and find the correct one
        option_texts = []
        correct_text = None

        for row in results:
            option_texts.append(row['option_text'])
            if row['is_correct'] == 1:
                correct_text = row['option_text']

        # Ensure we have 4 options slots for the frontend form
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

def publish_quiz(quiz_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    sql_update_status = """
        UPDATE quizzes
        SET quiz_status = %s
        WHERE id = %s
    """

    try:
        STATUS = 'PUBLISHED'
        cursor.execute(sql_update_status, (STATUS, quiz_id))
        conn.commit()
        
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")

def fetch_questions_by_course(course_id):
    """Fetches full question details for a specific course ID."""
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
                    'id': q_id,
                    'text': row['question_txt'],
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
# def fetch_questions_by_course(course_id):
#     """Fetches all questions and their options linked to a specific course ID."""
#     conn = get_db_connection()
#     # Use DictCursor to get results as dictionaries
#     cursor = conn.cursor(pymysql.cursors.DictCursor) 
    
#     try:
#         # SQL query to join Question, Answer, and Course tables
#         sql = """
#             SELECT 
#                 qb.id AS question_id,
#                 qb.question_txt,
#                 am.option_text,
#                 am.is_correct
#             FROM question_bank qb
#             JOIN question_course qc ON qb.id = qc.question_id
#             JOIN answer_map am ON qb.id = am.question_id
#             WHERE qc.course_id = %s
#             ORDER BY qb.id, am.id
#         """
#         cursor.execute(sql, (course_id,))
#         results = cursor.fetchall()
        
#     except Exception as e:
#         print(f"Database error fetching questions for course {course_id}: {e}")
#         return []
#     finally:
#         cursor.close()
#         conn.close()

#     # --- Data Restructuring ---
#     questions_map = {}
    
#     for row in results:
#         q_id = row['question_id']
        
#         if q_id not in questions_map:
#             questions_map[q_id] = {
#                 'id': q_id,
#                 'question_txt': row['question_txt'],
#                 'options': []
#             }
        
#         questions_map[q_id]['options'].append({
#             'option_text': row['option_text'],
#             'is_correct': row['is_correct']
#         })
        
#     # Return the dictionary values (which is an array of question objects)
#     return list(questions_map.values())
# Vaidehi Changes
        
# 3. Generate and Save Quiz  ❤️❤️❤️❤️❤️
def generate_and_save_quiz(teacher_id, course_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Fetch 10 random questions for THIS teacher AND THIS course
        query = """
            SELECT qb.id FROM question_bank qb
            JOIN question_employee qe ON qb.id = qe.question_id
            JOIN question_course qc ON qb.id = qc.question_id
            WHERE qe.employee_id = %s AND qc.course_id = %s
            ORDER BY RAND() LIMIT 10
        """
        cursor.execute(query, (teacher_id, course_id))
        selected_questions = cursor.fetchall()

        if not selected_questions:
            return None
        
        # 2. Generate unique token for the link
        quiz_token = str(uuid.uuid4())[:12]
        # This link points to your React route where the preview/quiz happens
        quiz_link = f"http://localhost:3000/take-quiz/{quiz_token}"
        
        # 3. Store Quiz Metadata
        insert_quiz = """
            INSERT INTO quizzes (teacher_id, course_id, quiz_title, quiz_link, quiz_token, quiz_status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_quiz, 
                       (teacher_id, 
                        course_id, 
                        f"Quiz for Course {course_id}", 
                        quiz_link, 
                        quiz_token, "active"
                        ))
        quiz_id = cursor.lastrowid

        # 4. Save specific questions for this unique quiz instance
        for q in selected_questions:
            cursor.execute(
                "INSERT INTO quiz_questions_generated (quiz_id, question_id) VALUES (%s, %s)", 
                (quiz_id, q['id'])
            )

        conn.commit()
        return {"id": quiz_id, "quiz_link": quiz_link, "token": quiz_token}
    finally:
        conn.close()

# 4. Fetch Quiz Preview Details ❤️❤️❤️❤️❤️
def get_quiz_preview_details(token):
    """Fetches quiz metadata and questions for the preview page."""
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Note: Using correct table casing based on your previous SQL
        sql = """
            SELECT 
                q.quiz_title, 
                qb.id as question_id, 
                qb.question_txt, 
                am.option_text, 
                am.is_correct
            FROM quizzes q
            JOIN Quiz_Questions_Generated qqg ON q.id = qqg.quiz_id
            JOIN Question_Bank qb ON qqg.question_id = qb.id
            JOIN Answer_Map am ON qb.id = am.question_id
            WHERE q.quiz_token = %s
        """
        cursor.execute(sql, (token,))
        results = cursor.fetchall()
        
        if not results:
            return None

        # Restructure data: Group options under questions
        quiz_data = {
            "title": results[0]['quiz_title'],
            "questions": {}
        }
        
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
            
        # Convert dictionary to list
        quiz_data['questions'] = list(quiz_data['questions'].values())
        return quiz_data
        
    finally:
        cursor.close()
        conn.close()
        
def delete_question(question_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Delete related data first due to foreign key constraints
        cursor.execute("DELETE FROM answer_map WHERE question_id = %s", (question_id,))
        cursor.execute("DELETE FROM question_course WHERE question_id = %s", (question_id,))
        # Delete the question itself
        delete_count = cursor.execute("DELETE FROM question_bank WHERE id = %s", (question_id,))
        
        conn.commit()
        return delete_count > 0

    except Exception as e:
        conn.rollback()
        print(f"Transaction failed for question deletion (ID {question_id}): {e}")
        return False
    finally:
        cursor.close()
        conn.close()
        
# def delete_question(question_id):
#     """Deletes a question and all related options and links in a transaction."""
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     try:
#         # 1. Delete options from answer_map (due to foreign key constraints, this is necessary)
#         cursor.execute("DELETE FROM answer_map WHERE question_id = %s", (question_id,))
        
#         # 2. Delete links from question_course
#         cursor.execute("DELETE FROM question_course WHERE question_id = %s", (question_id,))
        
#         # 3. Delete the question itself
#         delete_count = cursor.execute("DELETE FROM question_bank WHERE id = %s", (question_id,))
        
#         # Commit the transaction if all deletions succeeded
#         conn.commit()
        
#         # Return True only if the question itself was deleted
#         return delete_count > 0

#     except Exception as e:
#         conn.rollback()
#         print(f"Transaction failed for question deletion (ID {question_id}): {e}")
#         return False
#     finally:
#         cursor.close()
#         conn.close()
# ==============================================================================================
# if __name__ == "__main__":
#     app = create_app()
#     with app.app_context():
#         🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬
#         Testing fetch_questions 
#         test_employee_id = 1
#         test_scope = 'creator'
#         print(fetch_questions(test_employee_id, test_scope))

#         🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬
#         Example, Testing data
#         form_data = {
#             'question_txt': 'What is the capital of Germany?', 
#             'options': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'],
#             'correct': '0'
#         }
        
#         insert_question(form_data)

        # 🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬
        # Testing generate_and_save_quiz


# 🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮🏮
# STUDENT SIDE
def fetch_quiz_by_link(quiz_link):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor) 
    
    try:
        sql_quiz_details = """
            SELECT 
                gq.id AS quiz_id,
                gq.quiz_title,
                gq.time_limit,
                qqg.question_id,
                qb.question_txt,
                am.id AS option_id,
                am.option_text
            FROM 
                quizzes gq
            JOIN 
                quiz_questions_generated qqg ON gq.id = qqg.quiz_id
            JOIN 
                question_bank qb ON qqg.question_id = qb.id
            JOIN 
                answer_map am ON qb.id = am.question_id
            WHERE 
                gq.quiz_link = %s
        """

        cursor.execute(sql_quiz_details, (quiz_link,))
        results = cursor.fetchall()

    except Exception as e:
        print(f"Query failed to execute: {e}")
        return None
        
    finally:
        cursor.close()
        conn.close()

    if not results:
        return None

    quiz_info = {
        'quiz_id': results[0]['quiz_id'],
        'quiz_title': results[0]['quiz_title'],
        'time_limit': results[0]['time_limit'],
        'questions': {}
    }

    for row in results:
        q_id = row['question_id']
        
        if q_id not in quiz_info['questions']:
            quiz_info['questions'][q_id] = {
                'question_txt': row['question_txt'],
                'options': []
            }
        
        quiz_info['questions'][q_id]['options'].append({
            'option_id': row['option_id'],
            'option_text': row['option_text']
        })

    return quiz_info

def save_student_quiz_responses(quiz_id, student_id, responses):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    sql_insert_response = """
        INSERT INTO student_quiz_responses (quiz_id, student_id, question_id, selected_option_id)
        VALUES (%s, %s, %s, %s)
    """

    try:
        response_entries = [
            (quiz_id, student_id, q_id, option_id) 
            for q_id, option_id in responses.items()
        ]

        cursor.executemany(sql_insert_response, response_entries)
        conn.commit()
        
    except Exception as e:
        conn.rollback()
        print(f"Database error: {e}")

    finally:
        cursor.close()
        conn.close()

def grade_student_quiz(quiz_id, student_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
