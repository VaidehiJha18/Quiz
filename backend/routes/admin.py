import pandas as pd
from flask import request 
from werkzeug.security import generate_password_hash 
from flask import Blueprint, jsonify
from ..extensions import get_db_connection
import pymysql.cursors

# Notice the prefix is /api/admin based on your file!
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ---------------------------------------------------------
# 1. THE STATS ROUTE (For your Dashboard Cards)
# ---------------------------------------------------------
@admin_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # Count Students (role_id = 1)
        cursor.execute("SELECT COUNT(*) as count FROM user_account WHERE role_id = 1")
        student_count = cursor.fetchone()['count']

        # Count Professors (role_id = 2)
        cursor.execute("SELECT COUNT(*) as count FROM user_account WHERE role_id = 2")
        professor_count = cursor.fetchone()['count']

        # Count Quizzes (Assumes your table is named 'quiz')
        # cursor.execute("SELECT COUNT(*) as count FROM quiz")
        # quiz_count = cursor.fetchone()['count']
        quiz_count = 0   #Priyanka
        
        return jsonify({
            "students": student_count,
            "professors": professor_count,
            "quizzes": quiz_count
        }), 200
        
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({"error": "Failed to fetch stats"}), 500
    finally:
        cursor.close()
        conn.close()
#Priyanka

# ---------------------------------------------------------
# 2. THE USERS ROUTE (Upgraded for Hierarchical Filtering)
# ---------------------------------------------------------
@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        search = request.args.get('search', '')
        school = request.args.get('school', 'All')     
        branch = request.args.get('branch', 'All')     
        semester = request.args.get('semester', 'All') 
        division = request.args.get('division', 'All')
        batch = request.args.get('batch', 'All')

        # Cleaned SQL query matching your actual table structure
        sql = """
            SELECT 
                u.user_id, u.user_name, u.email, u.role_id, 
                r.role AS role_name, 
                p.program_name, sem.sem_no, d.division
            FROM user_account u
            LEFT JOIN role r ON u.role_id = r.id
            LEFT JOIN student_academic_info sai ON u.user_id = sai.student_id
            LEFT JOIN program p ON sai.program_id = p.id
            LEFT JOIN semester sem ON sai.semester_id = sem.id
            LEFT JOIN division d ON sai.division_id = d.id
            WHERE 1=1
        """
        params = []

        if search:
            sql += " AND (u.user_name LIKE %s OR u.email LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        if school != 'All':
            sql += " AND p.school_id = %s"  
            params.append(school)

        if branch != 'All':
            sql += " AND p.program_name = %s" 
            params.append(branch)

        if semester != 'All':
            sql += " AND sem.sem_no = %s"   
            params.append(semester)

        if division != 'All':
            sql += " AND d.division = %s"
            params.append(division)

        sql += " ORDER BY u.role_id ASC"

        cursor.execute(sql, tuple(params))
        users = cursor.fetchall()

        return jsonify({"users": users}), 200

    except Exception as e:
        print(f"DATABASE ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


# ---------------------------------------------------------
# 3. THE DEEP PROFILE ROUTE (For the Edit Button Modal)
# ---------------------------------------------------------
@admin_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_details(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT user_id, user_name, email, role_id FROM user_account WHERE user_id = %s", (user_id,))
        base_user = cursor.fetchone()
        
        if not base_user:
            return jsonify({"error": "User not found"}), 404

        role_id = base_user['role_id']
        email = base_user['email']
        
        role_map = {1: 'Student', 2: 'Professor', 3: 'Admin'}
        base_user['role_name'] = role_map.get(role_id, 'Unknown')

        profile_data = {}
        
        if role_id == 1: 
            sql = """
                SELECT 
                    s.*, 
                    p.program_name AS program, 
                    sem.sem_no AS semester,
                    d.division,
                    b.batch_no
                FROM student s
                LEFT JOIN student_academic_info sai ON s.id = sai.student_id
                LEFT JOIN program p ON sai.program_id = p.id
                LEFT JOIN semester sem ON sai.semester_id = sem.id
                LEFT JOIN division d ON sai.division_id = d.id
                LEFT JOIN batch b ON sai.batch_id = b.id
                WHERE s.email = %s
            """
            cursor.execute(sql, (email,))
            student_data = cursor.fetchone()
            if student_data:
                profile_data = student_data
                
        elif role_id == 2: 
            sql = """
                SELECT 
                    e.*, 
                    d.dept_name AS department
                FROM employee e
                LEFT JOIN employee_school_department esd ON e.id = esd.employee_id
                LEFT JOIN department d ON esd.dept_id = d.id
                WHERE e.email = %s
            """
            cursor.execute(sql, (email,))
            prof_data = cursor.fetchone()
            if prof_data:
                profile_data = prof_data

        return jsonify({
            "account": base_user,
            "profile": profile_data
        }), 200

    except Exception as e:
        print(f"Error fetching deep user details: {e}")
        return jsonify({"error": "Failed to fetch user details"}), 500
    finally:
        cursor.close()
        conn.close()


# ---------------------------------------------------------
# 4. THE HIERARCHICAL BULK UPLOAD ROUTE (With Target Micro-Cohort Mapping)
# ---------------------------------------------------------
@admin_bp.route('/users/upload', methods=['POST'])
def upload_roster():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    program_id = request.form.get('program_id')
    semester_id = request.form.get('semester_id')
    division_id = request.form.get('division_id')
    batch_id = request.form.get('batch_id')

    if not all([program_id, semester_id, division_id, batch_id]):
        return jsonify({"error": "Target academic context (Branch, Semester, Division, Batch) is required for upload"}), 400

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        df.columns = df.columns.str.strip().str.lower()

        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        success_count = 0
        skipped_count = 0

        for index, row in df.iterrows():
            email = row.get('email')
            name = row.get('name')
            
            if pd.isna(email) or pd.isna(name) or str(email).strip() == '' or str(name).strip() == '':
                continue

            # Check duplicate in user_account
            cursor.execute("SELECT user_id FROM user_account WHERE email = %s", (email,))
            if cursor.fetchone():
                skipped_count += 1
                continue 

            default_password = "Gsfc@123"
            hashed_pw = generate_password_hash(default_password) 
            
            # Insert into Security Gate (Role ID 1 = Student)
            cursor.execute(
                "INSERT INTO user_account (user_name, email, password_hash, role_id) VALUES (%s, %s, %s, %s)",
                (name, email, hashed_pw, 1) 
            )
            new_user_id = cursor.lastrowid 
        
            # Insert into student table
            cursor.execute("INSERT INTO student (id, email) VALUES (%s, %s)", (new_user_id, email))
            
            # Link to the targeted micro-cohort via student_academic_info
            cursor.execute(
                """INSERT INTO student_academic_info (student_id, program_id, semester_id, division_id, batch_id) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (new_user_id, program_id, semester_id, division_id, batch_id)
            )

            success_count += 1

        conn.commit()
        
        return jsonify({
            "message": f"Upload complete! Added {success_count} students to target micro-cohort. Skipped {skipped_count} duplicates."
        }), 200

    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        print(f"Error processing upload: {e}")
        return jsonify({"error": f"Failed to process file: {str(e)}"}), 500
    finally:
        if 'conn' in locals():
            cursor.close()
            conn.close()


# 5. THE DELETE USER ROUTE
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM student_academic_info WHERE student_id = %s", (user_id,))
        cursor.execute("DELETE FROM user_account WHERE user_id = %s", (user_id,))
        conn.commit()
        return jsonify({"message": f"User #{user_id} deleted successfully."}), 200

    except Exception as e:
        conn.rollback() 
        print(f"DELETE ERROR: {e}")
        return jsonify({"error": "Failed to delete user."}), 500
    finally:
        cursor.close()
        conn.close()


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    new_name = data.get('user_name')
    new_role = data.get('role_id')  

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE user_account 
            SET user_name = %s, role_id = %s 
            WHERE user_id = %s
        """, (new_name, new_role, user_id))
        
        conn.commit()
        return jsonify({"message": f"User #{user_id} updated successfully."}), 200

    except Exception as e:
        conn.rollback()
        print(f"UPDATE ERROR: {e}")
        return jsonify({"error": "Failed to update user."}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# --- ADMIN SETUP: SCHOOLS ---
# ==========================================
@admin_bp.route('/setup/schools', methods=['GET'])
def get_schools():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT id, school_name AS name FROM school")
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/schools', methods=['POST'])
def add_school():
    data = request.get_json()
    school_name_input = data.get('name')
    if not school_name_input:
        return jsonify({"error": "School name is required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO school (school_name) VALUES (%s)", (school_name_input,))
        conn.commit()
        return jsonify({"message": "School added successfully", "id": cursor.lastrowid, "name": school_name_input}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/schools/<int:school_id>', methods=['DELETE'])
def delete_school(school_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM school WHERE id = %s", (school_id,))
        conn.commit()
        return jsonify({"message": "School deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Cannot delete school. Ensure no branches or students are attached."}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# --- ADMIN SETUP: PROGRAMS (BRANCHES) ---
# ==========================================
@admin_bp.route('/setup/programs', methods=['GET'])
def get_programs():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT id, program_name AS name, school_id FROM program")
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/programs', methods=['POST'])
def add_program():
    data = request.get_json()
    program_name = data.get('name')
    school_id = data.get('school_id')
    if not program_name or not school_id:
        return jsonify({"error": "Program name and Parent School ID are required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO program (program_name, school_id) VALUES (%s, %s)", (program_name, school_id))
        conn.commit()
        return jsonify({"message": "Program added successfully", "id": cursor.lastrowid, "name": program_name, "school_id": school_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/programs/<int:program_id>', methods=['DELETE'])
def delete_program(program_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM program WHERE id = %s", (program_id,))
        conn.commit()
        return jsonify({"message": "Program deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Cannot delete program. It may have semesters or students attached."}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# --- ADMIN SETUP: SEMESTERS ---
# ==========================================
@admin_bp.route('/setup/program_semesters', methods=['GET'])
def get_program_semesters():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("""
            SELECT ps.program_id, ps.semester_id, s.sem_no 
            FROM program_semester ps
            JOIN semester s ON ps.semester_id = s.id
            ORDER BY s.sem_no ASC
        """)
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/program_semesters', methods=['POST'])
def add_program_semester():
    data = request.get_json()
    program_id = data.get('program_id')
    sem_no = data.get('sem_no')
    if not program_id or not sem_no:
        return jsonify({"error": "Program ID and Semester Number are required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT id FROM semester WHERE sem_no = %s", (sem_no,))
        sem_result = cursor.fetchone()
        
        if sem_result:
            semester_id = sem_result['id']
        else:
            cursor.execute("INSERT INTO semester (sem_no) VALUES (%s)", (sem_no,))
            semester_id = cursor.lastrowid
            
        cursor.execute("SELECT * FROM program_semester WHERE program_id = %s AND semester_id = %s", (program_id, semester_id))
        if cursor.fetchone():
            return jsonify({"error": "This semester is already linked to this program"}), 400
            
        cursor.execute("INSERT INTO program_semester (program_id, semester_id) VALUES (%s, %s)", (program_id, semester_id))
        conn.commit()
        
        return jsonify({"message": "Semester linked successfully", "program_id": program_id, "semester_id": semester_id, "sem_no": sem_no}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/program_semesters/<int:program_id>/<int:semester_id>', methods=['DELETE'])
def delete_program_semester(program_id, semester_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM program_semester WHERE program_id = %s AND semester_id = %s", (program_id, semester_id))
        conn.commit()
        return jsonify({"message": "Semester unlinked successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Cannot delete this mapping. It is likely tied to active divisions or batches."}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# --- ADMIN SETUP: DIVISIONS & BATCHES ---
# ==========================================
@admin_bp.route('/setup/mappings', methods=['GET'])
def get_mappings():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("""
            SELECT m.program_id, m.semester_id, m.division_id, m.batch_id,
                   s.sem_no, d.division, b.batch_no
            FROM program_semester_division_batch m
            JOIN semester s ON m.semester_id = s.id
            JOIN division d ON m.division_id = d.id
            JOIN batch b ON m.batch_id = b.id
            ORDER BY s.sem_no ASC, d.division ASC, b.batch_no ASC
        """)
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/mappings', methods=['POST'])
def add_mapping():
    data = request.get_json()
    program_id = data.get('program_id')
    semester_id = data.get('semester_id')
    div_input = data.get('division')
    batch_input = data.get('batch_no')
    
    if not all([program_id, semester_id, div_input, batch_input]):
        return jsonify({"error": "Program, Semester, Division, and Batch are required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT id FROM division WHERE division = %s", (div_input,))
        div_res = cursor.fetchone()
        if div_res:
            division_id = div_res['id']
        else:
            cursor.execute("INSERT INTO division (division) VALUES (%s)", (div_input,))
            division_id = cursor.lastrowid
            
        cursor.execute("SELECT id FROM batch WHERE batch_no = %s", (batch_input,))
        batch_res = cursor.fetchone()
        if batch_res:
            batch_id = batch_res['id']
        else:
            cursor.execute("INSERT INTO batch (batch_no) VALUES (%s)", (batch_input,))
            batch_id = cursor.lastrowid
            
        cursor.execute("""
            SELECT * FROM program_semester_division_batch 
            WHERE program_id = %s AND semester_id = %s AND division_id = %s AND batch_id = %s
        """, (program_id, semester_id, division_id, batch_id))
        
        if cursor.fetchone():
            return jsonify({"error": "This specific Division and Batch is already mapped to this Semester"}), 400
            
        cursor.execute("""
            INSERT INTO program_semester_division_batch 
            (program_id, semester_id, division_id, batch_id) 
            VALUES (%s, %s, %s, %s)
        """, (program_id, semester_id, division_id, batch_id))
        conn.commit()
        
        return jsonify({"message": "Cohort mapped successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/mappings/<int:p_id>/<int:s_id>/<int:d_id>/<int:b_id>', methods=['DELETE'])
def delete_mapping(p_id, s_id, d_id, b_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            DELETE FROM program_semester_division_batch 
            WHERE program_id = %s AND semester_id = %s AND division_id = %s AND batch_id = %s
        """, (p_id, s_id, d_id, b_id))
        conn.commit()
        return jsonify({"message": "Cohort unlinked successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Cannot delete this mapping. Students may be enrolled in it."}), 500
    finally:
        cursor.close()
        conn.close()


# ==========================================
# --- ADMIN SETUP: COURSES ---
# ==========================================
@admin_bp.route('/setup/courses', methods=['GET'])
def get_courses():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT id, course_name, short_course_name FROM course")
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/courses', methods=['POST'])
def add_course():
    data = request.get_json()
    course_name = data.get('course_name')
    short_name = data.get('short_course_name')
    if not course_name:
        return jsonify({"error": "Course name is required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO course (course_name, short_course_name) VALUES (%s, %s)", (course_name, short_name))
        conn.commit()
        return jsonify({"message": "Course created successfully", "id": cursor.lastrowid, "course_name": course_name}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/semester_courses', methods=['GET'])
def get_semester_courses():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("""
            SELECT sc.semester_id, sc.course_id, c.course_name, c.short_course_name, s.sem_no
            FROM semester_course sc
            JOIN course c ON sc.course_id = c.id
            JOIN semester s ON sc.semester_id = s.id
        """)
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/semester_courses', methods=['POST'])
def link_semester_course():
    data = request.get_json()
    semester_id = data.get('semester_id')
    course_id = data.get('course_id')
    if not semester_id or not course_id:
        return jsonify({"error": "Semester ID and Course ID are required"}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT * FROM semester_course WHERE semester_id = %s AND course_id = %s", (semester_id, course_id))
        if cursor.fetchone():
            return jsonify({"error": "This course is already linked to this semester"}), 400
            
        cursor.execute("INSERT INTO semester_course (semester_id, course_id) VALUES (%s, %s)", (semester_id, course_id))
        conn.commit()
        return jsonify({"message": "Course linked to semester successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/setup/semester_courses/<int:sem_id>/<int:crs_id>', methods=['DELETE'])
def unlink_semester_course(sem_id, crs_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM semester_course WHERE semester_id = %s AND course_id = %s", (sem_id, crs_id))
        conn.commit()
        return jsonify({"message": "Course unlinked successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": "Cannot unlink course."}), 500
    finally:
        cursor.close()
        conn.close()