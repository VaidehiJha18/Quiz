from ..extensions import get_db_connection
import random
import pymysql
from flask import session
from datetime import datetime, timedelta
import uuid

from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, SubmitField
from wtforms.validators import DataRequired 

class PythonQuestionForm(FlaskForm):
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
def fetch_questions(email, fetch_scope='creator'):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor) 
    employee_id = None

    # --- Step 1: Find Employee ID (Required for filtering) ---
    sql_id = "SELECT id FROM employee WHERE email = %s"
    cursor.execute(sql_id, (email,))
    employee_record = cursor.fetchone()
    
    if employee_record:
        employee_id = employee_record['id']
    elif fetch_scope == 'creator':
        return []
    
    try:
        # --- Step 2: Construct the SQL Query ---
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
        """

        join_clause = ""
        where_clause = ""

        if fetch_scope == 'creator':
            join_clause = "JOIN question_employee qe ON qb.id = qe.question_id"
            where_clause = "WHERE qe.employee_id = %s"
        elif fetch_scope == 'all':
            pass         #fetch all questions, no extra clauses 
        
        sql_questions = f"""
            {select_clause}
            {join_clause}
            {where_clause}
            ORDER BY 
                qb.id DESC, am.id ASC
            LIMIT 60
        """

        # --- Step 3: Execute the query ---
        if fetch_scope == 'creator':
            cursor.execute(sql_questions, (employee_id,))
        else:
            cursor.execute(sql_questions)
        raw_records = cursor.fetchall()

        # --- Step 4: Process the flat record set into a structured format ---
        structured_questions = {}
        for row in raw_records:
            q_id = row['question_id']
            
            if q_id not in structured_questions:
                structured_questions[q_id] = {
                    'id': q_id,
                    'question_txt': row['question_txt'],
                    'unit': row['unit'],
                    'options': [],
                    'correct_answer_id': None 
                }
            
            option_data = {
                'option_id': row['option_id'],
                'text': row['option_text'],
                'is_correct': row['is_correct']
            }
            structured_questions[q_id]['options'].append(option_data)
            
            if row['is_correct'] == 1:
                structured_questions[q_id]['correct_answer_id'] = row['option_id']
        return list(structured_questions.values())
    finally:
        cursor.close()
        conn.close()    
        
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
            # No questions available to create a quiz
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