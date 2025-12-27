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
        
# 3. Generate and Save Quiz
def generate_and_save_quiz(teacher_id):
    conn = get_db_connection()
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
        
        QUIZ_STATUS = 'DRAFT'
        TOTAL_QUESTIONS = len(selected_ids)
        TOTAL_MARKS = TOTAL_QUESTIONS * 10 
        TIME_LIMIT = 10 
        SCHEDULED_START = datetime.now()
        SCHEDULED_END = datetime.now() + timedelta(days=7) 

        cursor.execute(sql_quiz, (
            teacher_id,
            quiz_title,
            QUIZ_STATUS,
            TOTAL_QUESTIONS,
            TOTAL_MARKS,
            TIME_LIMIT,
            unique_link_id, 
            SCHEDULED_START,
            SCHEDULED_END
        ))
        quiz_id = cursor.lastrowid
        conn.commit()
        
        sql_link_questions = "INSERT INTO quiz_questions_generated (quiz_id, question_id) VALUES (%s, %s)"
        
        question_links = [(quiz_id, q_id) for q_id in selected_ids]

        cursor.executemany(sql_link_questions, question_links)
        conn.commit()
        
        return quiz_id 
        
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

    finally:
        cursor.close()
        conn.close()
        

# if __name__ == "__main__":
#     app = create_app()
    # with app.app_context():
        # 🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬
        # Testing fetch_questions 
        # test_employee_id = 1
        # test_scope = 'creator'
        # print(fetch_questions(test_employee_id, test_scope))

        # 🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬🥬
        # Example, Testing data
        # form_data = {
        #     'question_txt': 'What is the capital of Germany?', 
        #     'options': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg'],
        #     'correct': '0'
        # }
        
        # insert_question(form_data)

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