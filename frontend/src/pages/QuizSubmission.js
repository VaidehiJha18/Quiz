import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
}

.submission-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  background-attachment: fixed;
  padding: 2rem;
}

.submission-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.5);
  text-align: center;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon-container {
  margin-bottom: 2rem;
  animation: scaleIn 0.5s ease-out 0.2s both;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(39, 174, 96, 0.3);
}

.checkmark {
  width: 50px;
  height: 50px;
  border: 4px solid white;
  border-radius: 50%;
  position: relative;
}

.checkmark::after {
  content: '';
  position: absolute;
  left: 14px;
  top: 6px;
  width: 12px;
  height: 24px;
  border: solid white;
  border-width: 0 4px 4px 0;
  transform: rotate(45deg);
}

.submission-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.submission-message {
  font-size: 1.1rem;
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.submission-details {
  background: rgba(90, 62, 141, 0.05);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2.5rem;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: #5a3e8d;
  font-size: 1rem;
}

.detail-value {
  font-weight: 500;
  color: #2c3e50;
  font-size: 1rem;
}

.info-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.info-box p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
}

.info-icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  text-align: center;
  line-height: 20px;
  margin-right: 8px;
  font-weight: 700;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.action-button {
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  flex: 1;
  max-width: 200px;
}

.btn-primary {
  background-color: #5a3e8d;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #482f71;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(90, 62, 141, 0.4);
}

.btn-secondary {
  background-color: transparent;
  color: #5a3e8d;
  border: 2px solid #5a3e8d;
}

.btn-secondary:hover {
  background-color: #e9e5f3;
  transform: translateY(-2px);
}

.timestamp {
  margin-top: 2rem;
  font-size: 0.85rem;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .submission-card {
    padding: 2rem;
  }

  .submission-title {
    font-size: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .action-button {
    max-width: 100%;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// ==================== COMPONENT ====================

const QuizSubmissionPage = () => {
  const navigate = useNavigate();

  // This data would come from props or route state in a real app
  const submissionData = {
    quizTitle: 'Data Structures Midterm',
    courseName: 'CS 201 - Data Structures',
    submittedAt: new Date().toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short'
    }),
    totalQuestions: 20,
    answeredQuestions: 18,
    duration: '28 minutes',
    professorName: 'Dr. Smith'
  };

  const handleDashboard = () => {
    navigate('/student/dashboard');
  };

  const handleViewQuizzes = () => {
    navigate('/student/quizzes');
  };

  return (
    <div className="submission-page">
      <div className="submission-card">
        <div className="success-icon-container">
          <div className="success-icon">
            <div className="checkmark"></div>
          </div>
        </div>

        <h1 className="submission-title">Quiz Submitted Successfully!</h1>
        
        <p className="submission-message">
          Thank you for completing the quiz. Your responses have been recorded and submitted for evaluation.
        </p>

        <div className="info-box">
          <p>
            <span className="info-icon">ℹ️</span>
            Your results will be reviewed by your professor and made available once grading is complete. You will be notified when your results are ready.
          </p>
        </div>

        <div className="submission-details">
          <div className="detail-row">
            <span className="detail-label">Quiz Title</span>
            <span className="detail-value">{submissionData.quizTitle}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Course</span>
            <span className="detail-value">{submissionData.courseName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Professor</span>
            <span className="detail-value">{submissionData.professorName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Questions Answered</span>
            <span className="detail-value">
              {submissionData.answeredQuestions} of {submissionData.totalQuestions}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Time Taken</span>
            <span className="detail-value">{submissionData.duration}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Submitted At</span>
            <span className="detail-value">{submissionData.submittedAt}</span>
          </div>
        </div>

        <div className="button-group">
          <button className="action-button btn-secondary" onClick={handleViewQuizzes}>
            View Quizzes
          </button>
          <button className="action-button btn-primary" onClick={handleDashboard}>
            Go to Dashboard
          </button>
        </div>

        <p className="timestamp">
          Submission ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default QuizSubmissionPage;