# from flask import Blueprint, jsonify
# # Import your actual SQLAlchemy models here
# from models.user import User 
# from models.quiz import Quiz 

# admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# @admin_bp.route('/stats', methods=['GET'])
# def get_dashboard_stats():
#     try:
#         # Querying the real database directly
#         # Assuming your User table has a 'role' column. Adjust if different!
#         student_count = User.query.filter_by(role='student').count()
#         professor_count = User.query.filter_by(role='professor').count()
#         quiz_count = Quiz.query.count()
        
#         return jsonify({
#             "students": student_count,
#             "professors": professor_count,
#             "quizzes": quiz_count
#         }), 200
        
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
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
# @admin_bp.route('/users', methods=['GET'])
# def get_all_users():
#     conn = get_db_connection()
#     cursor = conn.cursor(pymysql.cursors.DictCursor)
#     try:
#         # 1. Grab filters from React request
#         search = request.args.get('search', '', type=str)
#         school = request.args.get('school', 'All')
#         branch = request.args.get('branch', 'All')
#         semester = request.args.get('semester', 'All')

#         # 2. Build the Base Query with academic JOINs
#         # We use LEFT JOIN so Professors still show up even if they don't have student info
#         sql = """
#             SELECT 
#                 u.user_id, 
#                 u.user_name, 
#                 u.email, 
#                 u.role_id,
#                 p.program_name,
#                 sem.sem_no
#             FROM user_account u
#             LEFT JOIN student_academic_info sai ON u.user_id = sai.student_id
#             LEFT JOIN program p ON sai.program_id = p.id
#             LEFT JOIN semester sem ON sai.semester_id = sem.id
#             WHERE 1=1
#         """
#         params = []

#         # 3. Apply the Funnel Filters (The Path to Execution!)
#         if search:
#             sql += " AND (u.user_name LIKE %s OR u.email LIKE %s)"
#             params.extend([f"%{search}%", f"%{search}%"])

#         if school != 'All':
#             # Note: Ensure your 'program' table has a column for school_name
#             # If it's stored differently, we can adjust this line
#             sql += " AND p.school_name = %s" 
#             params.append(school)

#         if branch != 'All':
#             sql += " AND p.program_name = %s"
#             params.append(branch)

#         if semester != 'All':
#             sql += " AND sem.sem_no = %s"
#             params.append(semester)

#         sql += " ORDER BY u.role_id ASC, u.user_name ASC"

#         cursor.execute(sql, tuple(params))
#         users = cursor.fetchall()

#         # Translate role IDs for the UI
#         role_map = {1: 'Student', 2: 'Professor', 3: 'Admin'}
#         for user in users:
#             user['role_name'] = role_map.get(user['role_id'], 'Unknown')

#         return jsonify(users), 200

#     except Exception as e:
#         print(f"Error fetching users: {e}")
#         return jsonify({"error": "Failed to fetch users"}), 500
#     finally:
#         cursor.close()
#         conn.close()
@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Capture filters from React
        search = request.args.get('search', '')
        school = request.args.get('school', 'All')     # This will now receive an ID (e.g., '1')
        branch = request.args.get('branch', 'All')     # This will receive 'B.Tech CSE'
        semester = request.args.get('semester', 'All') # This will receive '6'

        # 2. Build the query matching your EXACT schema screenshots
        sql = """
            SELECT 
                u.user_id, u.user_name, u.email, u.role_id, 
                r.role AS role_name, 
                p.program_name, sem.sem_no
            FROM user_account u
            LEFT JOIN role r ON u.role_id = r.id
            LEFT JOIN student_academic_info sai ON u.user_id = sai.student_id
            LEFT JOIN program p ON sai.program_id = p.id
            LEFT JOIN semester sem ON sai.semester_id = sem.id
            WHERE 1=1
        """
        params = []

        # 3. The Funnel Logic
        if search:
            sql += " AND (u.user_name LIKE %s OR u.email LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        if school != 'All':
            sql += " AND p.school_id = %s"  # MATCHES IMAGE 1
            params.append(school)

        if branch != 'All':
            sql += " AND p.program_name = %s" # MATCHES IMAGE 1
            params.append(branch)

        if semester != 'All':
            sql += " AND sem.sem_no = %s"   # MATCHES IMAGE 3
            params.append(semester)

        sql += " ORDER BY u.role_id ASC"

        print(f"EXECUTING SQL: {sql}")
        print(f"WITH PARAMS: {params}")

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
        # 1. Grab the basic info from the security gate
        cursor.execute("SELECT user_id, user_name, email, role_id FROM user_account WHERE user_id = %s", (user_id,))
        base_user = cursor.fetchone()
        
        if not base_user:
            return jsonify({"error": "User not found"}), 404

        role_id = base_user['role_id']
        email = base_user['email']
        
        # 2. Translate the Role
        role_map = {1: 'Student', 2: 'Professor', 3: 'Admin'}
        base_user['role_name'] = role_map.get(role_id, 'Unknown')

        # 3. Fetch the "Deep Data" based on their role using JOINs
        profile_data = {}
        
        if role_id == 1: 
            # It's a Student! Join with academic_info, program, and semester.
            sql = """
                SELECT 
                    s.*, 
                    p.program_name AS program, 
                    sem.sem_no AS semester
                FROM student s
                LEFT JOIN student_academic_info sai ON s.id = sai.student_id
                LEFT JOIN program p ON sai.program_id = p.id
                LEFT JOIN semester sem ON sai.semester_id = sem.id
                WHERE s.email = %s
            """
            cursor.execute(sql, (email,))
            student_data = cursor.fetchone()
            if student_data:
                profile_data = student_data
                
        elif role_id == 2: 
            # It's a Professor! Join with employee_school_department and department.
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

        # 4. Package it all up and send it to React
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
# 4. THE BULK UPLOAD ROUTE (The Mail Sorter)
# ---------------------------------------------------------
@admin_bp.route('/users/upload', methods=['POST'])
def upload_roster():
    # 1. Check if React actually sent a file
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        # 1. Read the file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        # --- NEW: Print exactly what columns Python sees to the terminal ---
        print(f"DEBUG - Found these columns in the file: {df.columns.tolist()}")

        # --- NEW: Clean the headers (remove hidden spaces and make lowercase) ---
        df.columns = df.columns.str.strip().str.lower()

        conn = get_db_connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        success_count = 0
        skipped_count = 0

        # 3. The Sorter Loop
        for index, row in df.iterrows():
            # Because we cleaned the headers, we now safely look for lowercase
            email = row.get('email')
            name = row.get('name')
            
            # --- NEW: Smarter check for empty rows (handles hidden spaces in Excel) ---
            if pd.isna(email) or pd.isna(name) or str(email).strip() == '' or str(name).strip() == '':
                continue

            # Action A: Check for duplicates
            cursor.execute("SELECT user_id FROM user_account WHERE email = %s", (email,))
            if cursor.fetchone():
                skipped_count += 1
                continue 

            # Action B: Insert into Security Gate
            default_password = "Gsfc@123"
            hashed_pw = generate_password_hash(default_password) 
            
            cursor.execute(
                "INSERT INTO user_account (user_name, email, password_hash, role_id) VALUES (%s, %s, %s, %s)",
                (name, email, hashed_pw, 1) 
            )
            
            # Action C: Grab ID and insert into Student folder
            new_user_id = cursor.lastrowid 
            cursor.execute("INSERT INTO student (id, email) VALUES (%s, %s)", (new_user_id, email))
            
            success_count += 1

        conn.commit()
        
        return jsonify({
            "message": f"Upload complete! Added {success_count} students. Skipped {skipped_count} duplicates."
        }), 200

    except Exception as e:
        print(f"Error processing upload: {e}")
        return jsonify({"error": "Failed to process file"}), 500
    finally:
        if 'conn' in locals():
            cursor.close()
            conn.close()

#5. THE DELETE USER ROUTE (For the Red Button of Doom)
@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Delete from dependent tables first (to avoid Foreign Key crashes)
        cursor.execute("DELETE FROM student_academic_info WHERE student_id = %s", (user_id,))
        
        # 2. Delete from the main user table
        cursor.execute("DELETE FROM user_account WHERE user_id = %s", (user_id,))
        
        # 3. Commit the changes permanently to MySQL
        conn.commit()
        return jsonify({"message": f"User #{user_id} deleted successfully."}), 200

    except Exception as e:
        conn.rollback() # If something goes wrong, undo the deletion
        print(f"DELETE ERROR: {e}")
        return jsonify({"error": "Failed to delete user."}), 500
    finally:
        cursor.close()
        conn.close()

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    new_name = data.get('user_name')
    new_role = data.get('role_id')  # 1: Student, 2: Professor, 3: Admin

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Update their name and role in the database
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
#Priyanka