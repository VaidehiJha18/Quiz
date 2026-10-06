import os
import json
import time
import PyPDF2
from pptx import Presentation
from flask import current_app
from google import genai
from google.genai import types
from google.genai import errors
from backend.extensions import get_db_connection

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

def get_google_api_key():
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if api_key:
        return api_key
    try:
        if current_app:
            return current_app.config.get("GOOGLE_API_KEY") or current_app.config.get("GEMINI_API_KEY")
    except Exception:
        pass
    return None

# 2. Main Question Generation Engine
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

    # Safely limit text length
    text_content = text_content[:8000]

    api_key = get_google_api_key()
    if not api_key:
        raise ValueError("Google API Key is not configured. Please set GOOGLE_API_KEY in environment or config.py.")

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

    # ✅ Only use valid Gemini 3+ models
    candidate_models = [
        'gemini-3.8-flash',
        'gemini-3.8-flash'  # Retry in case of transient 503 load spikes
    ]

    last_exception = None

    for idx, model_name in enumerate(candidate_models):
        try:
            print(f"DEBUG: Attempting AI MCQ generation using model '{model_name}' (Attempt {idx + 1})...")
            
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

            # Clean markdown formatting backticks if present
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            return json.loads(raw_text)

        except (errors.ClientError, errors.ServerError, Exception) as e:
            print(f"⚠️ Model '{model_name}' failed with error: {e}. Waiting 2 seconds before retrying...")
            last_exception = e
            time.sleep(2)  # Give Google API load spikes time to settle

    raise last_exception

# 3. Database Persistence Helper
def save_ai_questions_to_bank(mcqs, teacher_id, course_id, unit=1):
    conn = get_db_connection()
    cursor = conn.cursor()
    saved_count = 0
    try:
        for q in mcqs:
            q_txt = q.get('question_txt')
            options = q.get('options', [])
            correct_idx = int(q.get('correct_index', 0))

            cursor.execute("""
                INSERT INTO question_bank (question_txt, question_type, unit, marks, bloom_level, course_outcome)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (q_txt, 'MCQ', unit, 1, 'Understand', 'CO1'))
            
            q_id = cursor.lastrowid

            cursor.execute("INSERT INTO question_course (question_id, course_id) VALUES (%s, %s)", (q_id, course_id))
            cursor.execute("INSERT INTO question_employee (question_id, employee_id) VALUES (%s, %s)", (q_id, teacher_id))

            for idx, opt_text in enumerate(options):
                is_correct = 1 if idx == correct_idx else 0
                cursor.execute("""
                    INSERT INTO answer_map (question_id, option_text, is_correct)
                    VALUES (%s, %s, %s)
                """, (q_id, opt_text, is_correct))
                
            saved_count += 1

        conn.commit()
        return saved_count
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()