import os
import json
import PyPDF2
import docx
import pymysql
from google import genai
from google.genai import types
from backend.extensions import get_db_connection

def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    if ext == '.pdf':
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    text += t + "\n"
    elif ext in ['.docx', '.doc']:
        doc = docx.Document(file_path)
        for p in doc.paragraphs:
            text += p.text + "\n"
    return text

def parse_and_save_syllabus_doc(file_path, course_id):
    raw_text = extract_text_from_file(file_path)
    if len(raw_text.strip()) < 30:
        raise ValueError("Could not extract readable text from syllabus document.")

    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)

    prompt = f"""You are an expert curriculum parsing AI. Analyze the following university course syllabus document and extract the units, unit titles, and topics covered under each unit.

Syllabus Source Text:
{raw_text[:12000]}

Rules:
1. Extract every Unit (e.g., Unit 1, Unit 2, Unit 3, Unit 4, Unit 5).
2. "unit_number": Must be an integer (1, 2, 3, etc.).
3. "unit_title": Clean title string without the word 'Unit X:' (e.g., "Finite Automata", "Grammar", "Pushdown Automata").
4. "unit_topics": Detailed paragraph or comma-separated list of all topics listed under that unit.

Return STRICTLY a raw JSON array of objects without markdown block formatting:
[
  {{
    "unit_number": 1,
    "unit_title": "Finite Automata",
    "unit_topics": "Introduction, DFA & NDFA, Finite Automaton with epsilon moves, Regular Expressions, Pumping Lemma"
  }}
]
"""

    response = client.models.generate_content(
        model='gemini-3.8-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1
        )
    )

    clean_json = response.text.strip()
    if clean_json.startswith("```json"): clean_json = clean_json[7:]
    if clean_json.startswith("```"): clean_json = clean_json[3:]
    if clean_json.endswith("```"): clean_json = clean_json[:-3]
    
    syllabus_data = json.loads(clean_json.strip())

    # Save/Update into MySQL Database
    conn = get_db_connection()
    cursor = conn.cursor()
    saved_count = 0
    try:
        for item in syllabus_data:
            unit_num = int(item.get('unit_number', 1))
            unit_title = str(item.get('unit_title', f'Unit {unit_num}')).strip()
            unit_topics = str(item.get('unit_topics', '')).strip()

            cursor.execute("""
                INSERT INTO course_syllabus_units (course_id, unit_number, unit_title, unit_topics)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                    unit_title = VALUES(unit_title),
                    unit_topics = VALUES(unit_topics)
            """, (course_id, unit_num, unit_title, unit_topics))
            saved_count += 1

        conn.commit()
        return {"status": "success", "units_saved": saved_count}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()