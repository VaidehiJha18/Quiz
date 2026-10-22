import os
import json
import time
import PyPDF2
import docx
import pymysql
from pptx import Presentation
from flask import current_app
from google import genai
from google.genai import types
from google.genai import errors
from backend.extensions import get_db_connection

# Comprehensive list of valid Google Gemini models with automatic fallback
# Updated valid models list for google-genai
CANDIDATE_GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-3.5-flash',
]
# 1. Document Text Extraction Helpers
def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    return text

def extract_text_from_pptx(file_path):
    text = ""
    prs = Presentation(file_path)
    for slide in prs.slides:
        for shape in slide.shapes:
            if hasattr(shape, "text"):
                text += shape.text + "\n"
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs if p.text])

def extract_text_from_files(file_paths, max_chars=12000):
    combined_text = ""
    for path in file_paths:
        ext = os.path.splitext(path)[1].lower()
        raw_text = ""
        
        # 1. Extract text based on file format
        if ext == '.pdf':
            raw_text = extract_text_from_pdf(path)
        elif ext in ['.ppt', '.pptx']:
            raw_text = extract_text_from_pptx(path)
        elif ext in ['.doc', '.docx']:
            raw_text = extract_text_from_docx(path)
            
        # 2. Filter out common scanner artifacts and unwanted watermarks
        lines = raw_text.split("\n")
        filtered_lines = [
            line for line in lines 
            if "camscanner" not in line.lower() 
            and "scanned by" not in line.lower() 
            and "scanned with" not in line.lower()
        ]
        
        combined_text += "\n".join(filtered_lines) + "\n\n"
        
    return combined_text[:max_chars]

def get_google_api_key():
    """
    Safely retrieves and cleans the Google/Gemini API key, stripping
    any surrounding quotes, spaces, or newlines.
    """
    raw_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not raw_key:
        try:
            if current_app:
                raw_key = current_app.config.get("GEMINI_API_KEY") or current_app.config.get("GOOGLE_API_KEY")
        except Exception:
            pass

    if raw_key:
        return str(raw_key).strip().strip('"').strip("'")
    return None

# 2. Main Question Generation Engine (MCQ Specific)
def generate_mcqs_from_file(file_path, num_questions=5, unit=1):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        text_content = extract_text_from_pdf(file_path)
    elif ext in ['.ppt', '.pptx']:
        text_content = extract_text_from_pptx(file_path)
    else:
        raise ValueError("Unsupported file format. Please upload a PDF or PPT/PPTX file.")

    if len(text_content.strip()) < 50:
        raise ValueError("Could not extract sufficient text from the document.")

    text_content = text_content[:10000]

    api_key = get_google_api_key()
    if not api_key:
        raise ValueError("Google API Key is not configured. Please set GOOGLE_API_KEY in environment or .env file.")

    client = genai.Client(api_key=api_key)

    prompt_text = f"""You are an expert exam generator. Analyze the document content and generate exactly {num_questions} Multiple Choice Questions (MCQs).

Document Content:
{text_content}

Your response MUST be a raw JSON array of objects without markdown block formatting.
Each object in the array must contain:
- "question_txt": The question string.
- "options": Array of exactly 4 strings.
- "correct_index": Integer (0, 1, 2, or 3) indicating the correct option index.
- "rationale": Short explanation of why the answer is correct.
"""

    last_exception = None

    for idx, model_name in enumerate(CANDIDATE_GEMINI_MODELS):
        try:
            print(f"DEBUG: Attempting AI MCQ generation using model '{model_name}' (Attempt {idx + 1}/{len(CANDIDATE_GEMINI_MODELS)})...")
            
            response = client.models.generate_content(
                model=model_name,
                contents=prompt_text,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )

            raw_content = response.text if hasattr(response, 'text') else response
            if isinstance(raw_content, list):
                raw_text = "".join(str(item) for item in raw_content).strip()
            else:
                raw_text = str(raw_content).strip()

            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            return json.loads(raw_text.strip())

        except (errors.ClientError, errors.ServerError, Exception) as e:
            print(f"⚠️ Model '{model_name}' failed with: {e}. Trying fallback model...")
            last_exception = e
            time.sleep(1.5)

    raise last_exception

# 3. Database Persistence Helper
def save_ai_questions_to_bank(questions, teacher_id, course_id, unit=1):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    saved_count = 0

    try:
        for q in questions:
            q_txt = q.get('question_txt', '').strip()
            marks = 1
            q_unit = str(q.get('unit', unit))
            q_type = q.get('question_type', 'Descriptive' if marks > 1 else 'MCQ')
            bloom = q.get('bloom_level', 'Understand')
            co = q.get('course_outcome', 'CO1')

            if not q_txt:
                continue

            # 1. Insert Into question_bank
            cursor.execute("""
                INSERT INTO question_bank (question_txt, question_type, unit, marks, bloom_level, course_outcome)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (q_txt, q_type, q_unit, marks, bloom, co))
            
            q_id = cursor.lastrowid
            saved_count += 1

            # 2. Map Professor ID
            cursor.execute("""
                INSERT IGNORE INTO question_employee (question_id, employee_id) 
                VALUES (%s, %s)
            """, (q_id, teacher_id))

            # 3. Map Course ID
            cursor.execute("""
                INSERT IGNORE INTO question_course (question_id, course_id) 
                VALUES (%s, %s)
            """, (q_id, course_id))

            # If question is MCQ, insert options into answer_map
            if q_type == 'MCQ':
                options = q.get('options', [])
                correct_idx = int(q.get('correct_index', 0))
                for idx, opt_text in enumerate(options):
                    cursor.execute("""
                        INSERT INTO answer_map (question_id, option_text, is_correct)
                        VALUES (%s, %s, %s)
                    """, (q_id, opt_text, 1 if idx == correct_idx else 0))

        conn.commit()
        return saved_count
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

# 4. Dynamically fetches the latest syllabus topics for a given course ID from MySQL
def get_course_syllabus_context(course_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("""
            SELECT unit_number, unit_title, unit_topics 
            FROM course_syllabus_units 
            WHERE course_id = %s 
            ORDER BY unit_number ASC
        """, (course_id,))
        units = cursor.fetchall()

        if not units:
            return "No custom syllabus reference registered for this course. Assign units logically based on standard topic progression."

        syllabus_str = "OFFICIAL COURSE SYLLABUS REFERENCE (Use this to classify topics into Units):\n"
        for u in units:
            syllabus_str += f"- Unit {u['unit_number']} ({u['unit_title']}): {u['unit_topics']}\n"
        return syllabus_str
    except Exception as e:
        print(f"⚠️ Warning: Failed to fetch course syllabus context for course_id {course_id}: {e}")
        return "Assign units logically based on standard topic progression."
    finally:
        cursor.close()
        conn.close()

# 5. For Mid-Sem & End-Sem Exam Papers (Generate Exam Paper Page)
def generate_paper_questions_from_docs(file_paths, course_id, unit="AUTO", num_questions=8, question_type="MIXED"):
    combined_text = extract_text_from_files(file_paths)
    if len(combined_text.strip()) < 50:
        raise ValueError("Could not extract sufficient text from uploaded document(s).")

    dynamic_syllabus = get_course_syllabus_context(course_id)

    api_key = get_google_api_key()
    if not api_key:
        raise ValueError("Google API Key is not configured. Please set GOOGLE_API_KEY in environment or .env file.")

    client = genai.Client(api_key=api_key)

    # Unit Rule Instruction
    if unit != "AUTO" and str(unit).strip() != "":
        unit_instruction = f"Assign ALL questions strictly to Unit {unit}."
    else:
        unit_instruction = f"""
        Map each question strictly to its syllabus unit ('1', '2', '3', '4', or '5') by cross-referencing 
        the question text against the active course syllabus provided below:
        
        {dynamic_syllabus}
        """

    # Question Type Instruction
    if question_type == "MIXED":
        type_instruction = """Generate a balanced mix of both Multiple Choice Questions (MCQs) and Descriptive questions (e.g., 50% MCQs and 50% Descriptive questions).
- For MCQ items: Set "question_type" to "MCQ", provide exactly 4 string choices in "options", set "correct_index" (0-3), and include a brief 1-sentence "rationale".
- For Descriptive items: Set "question_type" to "Descriptive", set "options" to [], "correct_index" to 0, and "rationale" to ""."""
    elif question_type == "MCQ":
        type_instruction = """Set "question_type" for ALL items to "MCQ". 
For every item: provide exactly 4 string choices in "options", set "correct_index" (0, 1, 2, or 3), and include a 1-sentence "rationale"."""
    else:
        type_instruction = """Set "question_type" for ALL items to "Descriptive". 
Set "options" to [], "correct_index" to 0, and "rationale" to "" for all items."""

    prompt_text = f"""You are an expert exam paper setter. Analyze the provided study material and generate exactly {num_questions} high-quality questions.

Rules:
1. {unit_instruction}
2. {type_instruction}
3. DO NOT include mark allocations or point numbers in question text strings.

Source Context:
{combined_text[:12000]}

Return STRICTLY a raw JSON array without markdown code blocks. Each object MUST contain:
- "question_txt": String
- "unit": String ("1", "2", "3", "4", or "5")
- "question_type": String ("MCQ" or "Descriptive")
- "options": Array of 4 strings (if MCQ, else [])
- "correct_index": Integer 0-3 (if MCQ, else 0)
- "rationale": String (if MCQ, else "")
- "bloom_level": String ("Remember", "Understand", "Apply", "Analyze")
- "course_outcome": String ("CO1", "CO2", "CO3", etc.)
"""

    last_exception = None

    # Iterates across official Gemini models with auto-fallback
    for attempt, model_name in enumerate(CANDIDATE_GEMINI_MODELS, start=1):
        try:
            print(f"DEBUG: Attempting AI Paper Question generation using model '{model_name}' (Attempt {attempt}/{len(CANDIDATE_GEMINI_MODELS)})...")
            
            response = client.models.generate_content(
                model=model_name,
                contents=prompt_text,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )

            raw_content = response.text if hasattr(response, 'text') else response
            if isinstance(raw_content, list):
                raw_text = "".join(str(item) for item in raw_content).strip()
            else:
                raw_text = str(raw_content).strip()

            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            return json.loads(raw_text.strip())

        except (errors.ServerError, errors.ClientError, Exception) as e:
            last_exception = e
            print(f"⚠️ Model '{model_name}' encountered: {e}. Falling back to next model...")
            time.sleep(1.5)

    raise last_exception