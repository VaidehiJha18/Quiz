import os
import re
import pandas as pd
import docx
import pdfplumber
from backend.extensions import get_db_connection

def parse_and_save_csv(file_path, teacher_id, course_id):
    """
    Parses CSV files with columns:
    Question_Text, Marks, Question_Type, Unit, Bloom_Level, Course_Outcome, Option_A, Option_B, Option_C, Option_D, Correct_Option
    """
    df = pd.read_csv(file_path)
    conn = get_db_connection()
    cursor = conn.cursor()
    saved_count = 0

    try:
        for _, row in df.iterrows():
            q_txt = str(row.get('Question_Text', '')).strip()
            if not q_txt or q_txt == 'nan':
                continue

            marks = int(row.get('Marks', 1))
            q_type = str(row.get('Question_Type', 'MCQ')).strip()
            unit = str(row.get('Unit', '1')).strip()
            bloom = str(row.get('Bloom_Level', 'Understand')).strip()
            co = str(row.get('Course_Outcome', 'CO1')).strip()

            cursor.execute("""
                INSERT INTO question_bank (question_txt, marks, question_type, unit, bloom_level, course_outcome)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (q_txt, marks, q_type, unit, bloom, co))
            q_id = cursor.lastrowid

            cursor.execute("INSERT INTO question_course (question_id, course_id) VALUES (%s, %s)", (q_id, course_id))
            cursor.execute("INSERT INTO question_employee (question_id, employee_id) VALUES (%s, %s)", (q_id, teacher_id))

            # Handle MCQ options if present
            if q_type.upper() == 'MCQ':
                options = {
                    'A': row.get('Option_A'),
                    'B': row.get('Option_B'),
                    'C': row.get('Option_C'),
                    'D': row.get('Option_D')
                }
                correct_opt = str(row.get('Correct_Option', '')).strip().upper()

                for opt_key, opt_val in options.items():
                    if pd.notna(opt_val) and str(opt_val).strip() != '':
                        is_corr = 1 if opt_key == correct_opt else 0
                        cursor.execute("""
                            INSERT INTO answer_map (question_id, option_txt, is_correct)
                            VALUES (%s, %s, %s)
                        """, (q_id, str(opt_val).strip(), is_corr))

            saved_count += 1

        conn.commit()
        return {"status": "success", "questions_saved": saved_count}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def parse_and_save_docx(file_path, teacher_id, course_id):
    """
    Parses DOCX question papers extracting question text and trailing mark badges like (02), (04), (06), [5 Marks]
    """
    doc = docx.Document(file_path)
    conn = get_db_connection()
    cursor = conn.cursor()
    saved_count = 0

    try:
        for para in doc.paragraphs:
            text = para.text.strip()
            if not text or len(text) < 10:
                continue

            # Skip common university header titles
            if any(header_word in text.upper() for header_word in ["GSFC UNIVERSITY", "SCHOOL OF TECHNOLOGY", "TOTAL MARKS", "INSTRUCTIONS", "ATTEMPT ALL"]):
                continue

            # Extract marks from parentheses or brackets (e.g. '(02)', '(04)', '[5 Marks]')
            mark_match = re.search(r'[\(\[]\s*(\d{1,2})\s*(?:Marks?|M)?\s*[\)\]]$', text, re.IGNORECASE)
            marks = int(mark_match.group(1)) if mark_match else 2

            # Clean question text by stripping mark brackets and leading numbers
            clean_txt = re.sub(r'[\(\[]\s*\d{1,2}\s*(?:Marks?|M)?\s*[\)\]]$', '', text).strip()
            clean_txt = re.sub(r'^(?:Q\.?\s*\d+|[a-z]\.|\d+\.)\s*', '', clean_txt).strip()

            if len(clean_txt) > 5:
                cursor.execute("""
                    INSERT INTO question_bank (question_txt, marks, question_type, unit, bloom_level, course_outcome)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (clean_txt, marks, 'Descriptive', '1', 'Understand', 'CO1'))
                q_id = cursor.lastrowid

                cursor.execute("INSERT INTO question_course (question_id, course_id) VALUES (%s, %s)", (q_id, course_id))
                cursor.execute("INSERT INTO question_employee (question_id, employee_id) VALUES (%s, %s)", (q_id, teacher_id))
                saved_count += 1

        conn.commit()
        return {"status": "success", "questions_saved": saved_count}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def parse_and_save_pdf(file_path, teacher_id, course_id):
    """
    Parses PDF question papers using pdfplumber line-by-line regex scanning.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    saved_count = 0

    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue

                for line in text.split('\n'):
                    line = line.strip()
                    if not line or len(line) < 10:
                        continue

                    if any(header_word in line.upper() for header_word in ["GSFC UNIVERSITY", "SCHOOL OF TECHNOLOGY", "SEMESTER", "COURSE CODE", "INSTRUCTIONS"]):
                        continue

                    mark_match = re.search(r'[\(\[]\s*(\d{1,2})\s*(?:Marks?|M)?\s*[\)\]]$', line, re.IGNORECASE)
                    marks = int(mark_match.group(1)) if mark_match else 2

                    clean_txt = re.sub(r'[\(\[]\s*\d{1,2}\s*(?:Marks?|M)?\s*[\)\]]$', '', line).strip()
                    clean_txt = re.sub(r'^(?:Q\.?\s*\d+|[a-z]\.|\d+\.)\s*', '', clean_txt).strip()

                    if len(clean_txt) > 5:
                        cursor.execute("""
                            INSERT INTO question_bank (question_txt, marks, question_type, unit, bloom_level, course_outcome)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (clean_txt, marks, 'Descriptive', '1', 'Understand', 'CO1'))
                        q_id = cursor.lastrowid

                        cursor.execute("INSERT INTO question_course (question_id, course_id) VALUES (%s, %s)", (q_id, course_id))
                        cursor.execute("INSERT INTO question_employee (question_id, employee_id) VALUES (%s, %s)", (q_id, teacher_id))
                        saved_count += 1

        conn.commit()
        return {"status": "success", "questions_saved": saved_count}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()