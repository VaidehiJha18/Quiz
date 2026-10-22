from extensions import db
from datetime import datetime
import uuid
# Vaidehi Canges
class Quiz(db.Model):
    __tablename__ = 'quizzes'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_title = db.Column(db.String(200), nullable=False)
    teacher = db.Column(db.String(100), nullable=False)
    school = db.Column(db.String(200), nullable=False)
    department = db.Column(db.String(200), nullable=False)
    program = db.Column(db.String(200), nullable=False)
    semester = db.Column(db.String(50), nullable=False)
    course = db.Column(db.String(300), nullable=False)
    total_questions = db.Column(db.Integer, nullable=False, default=5)
    duration = db.Column(db.Integer, nullable=False, default=10)
    status = db.Column(db.String(20), default='Published')
    # Generate a unique link slug
    quiz_link = db.Column(db.String(200), default=lambda: str(uuid.uuid4()))
    # 🆕 Added for Quiz Scheduling ❤️❤️❤️
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'quiz_title': self.quiz_title,
            'title': self.quiz_title,
            'teacher': self.teacher,
            'school': self.school,
            'department': self.department,
            'program': self.program,
            'semester': self.semester,
            'course': self.course,
            'total_questions': self.total_questions,
            'totalQuestions': self.total_questions,
            'duration': self.duration,
            'status': self.status,
            'quiz_link': self.quiz_link,
            # 🆕 Format for React frontend ❤️❤️❤️
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            # Use isoformat for easy consumption by JavaScript
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Quiz {self.quiz_title}>'
    
#vaidehi

class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    duration_seconds = db.Column(db.Integer, default=0)
    violation_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='IN_PROGRESS') # 'IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED_CHEATING'
    answers = db.Column(db.JSON, nullable=True)

    violations = db.relationship('Violation', backref='attempt', lazy=True, cascade='all, delete-orphan')

class Violation(db.Model):
    __tablename__ = 'violations'

    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('quiz_attempts.id'), nullable=False)
    violation_type = db.Column(db.String(100), nullable=False)
    snapshot = db.Column(db.Text(length=4294967295), nullable=False) # MySQL LONGTEXT for Base64 image
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.violation_type,
            'snapshot': self.snapshot,
            'timestamp': self.timestamp.isoformat()
        }
