import random
import pymysql
from backend.extensions import get_db_connection

def generate_exam_paper(teacher_id, blueprint):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. Master paper record
        cursor.execute("""
            INSERT INTO generated_question_papers (teacher_id, course_id, paper_title, exam_type, total_marks, academic_year)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            teacher_id,
            blueprint['course_id'],
            blueprint['paper_title'],
            blueprint['exam_type'],
            blueprint['total_marks'],
            blueprint.get('academic_year', '2025-2026')
        ))
        paper_id = cursor.lastrowid
        selected_question_ids = []

        for sec_order, q_block in enumerate(blueprint.get('questions', []), start=1):
            cursor.execute("""
                INSERT INTO paper_sections (paper_id, question_number, section_order, instructions, total_section_marks)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                paper_id,
                q_block.get('question_number', f'Q.{sec_order}'),
                sec_order,
                q_block.get('instructions', 'Attempt all questions.'),
                q_block.get('total_section_marks', 5)
            ))
            section_id = cursor.lastrowid

            def process_sub_parts(part_list, is_or=False):
                for display_order, part in enumerate(part_list, start=1):
                    mode = part.get('mode', 'auto')
                    chosen_qid = None
                    target_marks = int(part.get('marks') or 1)
                    target_type = part.get('type') or 'Descriptive'
                    units = part.get('units', [])

                    # Mode 1: Manual text entered by professor
                    if mode == 'manual' and part.get('manual_text'):
                        cursor.execute("""
                            INSERT INTO question_bank (question_txt, marks, question_type, unit, bloom_level, course_outcome)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """, (
                            part['manual_text'],
                            target_marks,
                            target_type,
                            units[0] if units else '1',
                            'Understand',
                            'CO1'
                        ))
                        chosen_qid = cursor.lastrowid
                        cursor.execute("INSERT INTO question_course (question_id, course_id) VALUES (%s, %s)", (chosen_qid, blueprint['course_id']))
                        cursor.execute("INSERT INTO question_employee (question_id, employee_id) VALUES (%s, %s)", (chosen_qid, teacher_id))

                    # Mode 2: Specific question selected from database modal
                    elif mode == 'bank' and part.get('selected_qid'):
                        chosen_qid = int(part['selected_qid'])

                    # Mode 3: Auto-random with graceful fallback
                    else:
                        query = """
                            SELECT qb.id FROM question_bank qb
                            JOIN question_course qc ON qb.id = qc.question_id
                            WHERE qc.course_id = %s AND qb.marks = %s
                        """
                        params = [blueprint['course_id'], target_marks]
                        if units:
                            placeholders = ','.join(['%s'] * len(units))
                            query += f" AND qb.unit IN ({placeholders})"
                            params.extend(units)

                        cursor.execute(query, tuple(params))
                        rows = cursor.fetchall()
                        pool = [r['id'] if isinstance(r, dict) else r[0] for r in rows]
                        available = [q for q in pool if q not in selected_question_ids]

                        # Fallback 1: Any question in the course
                        if not available:
                            cursor.execute("""
                                SELECT qb.id FROM question_bank qb
                                JOIN question_course qc ON qb.id = qc.question_id
                                WHERE qc.course_id = %s
                            """, (blueprint['course_id'],))
                            fallback_rows = cursor.fetchall()
                            available = [r['id'] if isinstance(r, dict) else r[0] for r in fallback_rows if (r['id'] if isinstance(r, dict) else r[0]) not in selected_question_ids]

                        # Fallback 2: Generate placeholder if bank is empty
                        if not available:
                            cursor.execute("""
                                INSERT INTO question_bank (question_txt, marks, question_type, unit, bloom_level, course_outcome)
                                VALUES (%s, %s, %s, %s, %s, %s)
                            """, (
                                f"Explain the core principles of {q_block.get('question_number', 'Q')} ({part.get('sub_label', 'a.')}) with suitable examples.",
                                target_marks,
                                target_type,
                                units[0] if units else '1',
                                'Understand',
                                'CO1'
                            ))
                            chosen_qid = cursor.lastrowid
                            cursor.execute("INSERT INTO question_course (question_id, course_id) VALUES (%s, %s)", (chosen_qid, blueprint['course_id']))
                            cursor.execute("INSERT INTO question_employee (question_id, employee_id) VALUES (%s, %s)", (chosen_qid, teacher_id))
                        else:
                            chosen_qid = random.choice(available)

                    selected_question_ids.append(chosen_qid)
                    cursor.execute("""
                        INSERT INTO paper_question_items 
                        (paper_id, section_id, question_id, sub_label, is_or_choice, marks, display_order)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (paper_id, section_id, chosen_qid, part.get('sub_label', 'a.'), is_or, target_marks, display_order))

            process_sub_parts(q_block.get('sub_parts', []), is_or=False)
            if q_block.get('or_sub_parts'):
                process_sub_parts(q_block['or_sub_parts'], is_or=True)

        for qid in selected_question_ids:
            cursor.execute("""
                INSERT INTO exam_question_usage_history (question_id, paper_id, academic_year, exam_type)
                VALUES (%s, %s, %s, %s)
            """, (qid, paper_id, blueprint.get('academic_year', '2025-2026'), blueprint['exam_type']))

        conn.commit()
        return {"status": "success", "paper_id": paper_id}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def get_paper_full_details(paper_id):
    """
    Retrieves full nested structure of a generated question paper for preview and export.
    """
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        cursor.execute("""
            SELECT p.*, c.course_name 
            FROM generated_question_papers p
            JOIN course c ON p.course_id = c.id
            WHERE p.id = %s
        """, (paper_id,))
        paper = cursor.fetchone()
        if not paper:
            return None

        # Fetch sections
        cursor.execute("""
            SELECT * FROM paper_sections WHERE paper_id = %s ORDER BY section_order ASC
        """, (paper_id,))
        sections = cursor.fetchall()

        # Fetch all questions mapped to sections
        cursor.execute("""
            SELECT pqi.*, qb.question_txt, qb.bloom_level, qb.course_outcome, qb.diagram_url, qb.question_type
            FROM paper_question_items pqi
            JOIN question_bank qb ON pqi.question_id = qb.id
            WHERE pqi.paper_id = %s
            ORDER BY pqi.section_id, pqi.is_or_choice ASC, pqi.display_order ASC
        """, (paper_id,))
        items = cursor.fetchall()

        # Attach items to sections
        for sec in sections:
            sec['main_questions'] = [it for it in items if it['section_id'] == sec['id'] and not it['is_or_choice']]
            sec['or_questions'] = [it for it in items if it['section_id'] == sec['id'] and it['is_or_choice']]

        paper['sections'] = sections
        return paper
    finally:
        cursor.close()
        conn.close()