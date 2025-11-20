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
def insert_question(form_data, email):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Define default values for the required columns not provided by the user
    DEFAULT_TYPE = "MCQ"
    DEFAULT_UNIT = 1
    DEFAULT_MARKS = 1
    
    sql = """
        INSERT INTO question_bank (question_txt, question_type, unit, marks)
        VALUES (%s, %s, %s, %s)
    """
    try:
        cursor.execute(sql, (
            form_data['question_txt'], 
            DEFAULT_TYPE,  
            DEFAULT_UNIT,  
            DEFAULT_MARKS,
        ))
        conn.commit()
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
        # q.question_type not included
        # Possible additions: Select by Unit, question_type etc.

        cursor.execute(select_clause, (emp_id, course_id)) # dictionary=True is very helpful
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


    #try:
    questions_with_options = fetch_questions(creator_email)
    
    #  Sample only a few questions
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
        # or get quiz_title from user
        # quiz_title = f"{ user_title } - {datetime.now().strftime('%Y%m%d%H%M%S')}"

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

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        test_employee_id = 1
        test_scope = 'creator'
        print(fetch_questions(test_employee_id, test_scope))