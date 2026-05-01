# """Models of the application."""
# # Vaidehi Changes
# # User Object for Sign Up/In and Session
# class User:
#     def __init__(self, id, username, email, password_hash, role=None, master_id=None):
#         self.id = id
#         self.username = username
#         self.email = email
#         self.password_hash = password_hash 
#         self.role = role
#         self.master_id = master_id        # Field to hold employee_id or student_id
        
#     def __repr__(self):
#         return f'<User {self.username}>'

#     @classmethod
#     def from_dict(cls, data):
#         return cls(
#             id=data['user_id'],
#             username=data['username'],
#             email=data['email'],
#             password_hash=data['password_hash'],
#             role=data.get('role'),
#             master_id=data.get('master_id')      # Handle master_id if present
#         )
    
"""Models of the application."""
# Vaidehi Changes
# User Object for Sign Up/In and Session
class User:
    def __init__(self, id, username, email, password_hash, role=None, master_id=None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash 
        self.role = role
        self.master_id = master_id        
        
    def __repr__(self):
        return f'<User {self.username}>'
#Priyanka
    @classmethod
    def from_dict(cls, data):
        
        role_map = {
            1: 'student',
            2: 'professor',
            3: 'admin'
        }
        db_role_id = data.get('role_id')
        translated_role = role_map.get(db_role_id) if db_role_id else data.get('role')

        return cls(
            id=data.get('user_id') or data.get('id'), 
            username=data.get('username') or data.get('user_name'),
            email=data.get('email'),
            password_hash=data.get('password_hash'),
            role=translated_role,
            master_id=data.get('master_id')
        )