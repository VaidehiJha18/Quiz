import React from 'react';

const StudentQuizCard = ({ quiz, onStartQuiz }) => {
  
  if (!quiz) return null;

  return (
    <div className="quiz-card">
      <h3>{quiz.quiz_title || quiz.title}</h3>

      <div className="quiz-card-details">
        <div className="quiz-detail-item">
          <div className="detail-icon">❓</div>
          <span>
            <span className="quiz-detail-label">Questions:</span> {quiz.questions}
          </span>
        </div>
        <div className="quiz-detail-item">
          <div className="detail-icon">⏱️</div>
          <span>
            <span className="quiz-detail-label">Duration:</span> {quiz.duration}
          </span>
        </div>
        <div className="quiz-detail-item">
          <div className="detail-icon">📅</div>
          <span>
            <span className="quiz-detail-label">Due:</span> {quiz.dueDate}
          </span>
        </div>
        <div className="quiz-detail-item">
          <div className="detail-icon">👨‍🏫</div>
          <span>
            <span className="quiz-detail-label">Professor:</span> {quiz.professor}
          </span>
        </div>
      </div>

      {/* ✅ NEW — Timer Warning Banner */}
      <div style={{
        backgroundColor: 'rgba(255, 243, 176, 0.85)',
        border: '1px solid #f6e05e',
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '1rem',
        fontSize: '0.88rem',
        color: '#744210',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
        backdropFilter: 'blur(4px)',
      }}>
        <span>⚠️</span>
        <span>
          Once you start, a <strong>{quiz.duration || quiz.time_limit} timer</strong> begins 
          and <strong>cannot be paused</strong>. The quiz auto-submits when time runs out.
        </span>
      </div>

      <button 
        className="start-quiz-btn"
        onClick={() => onStartQuiz(quiz.id)}
        disabled={quiz.status !== 'available'}
        style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '8px',
            cursor: quiz.status === 'available' ? 'pointer' : 'not-allowed'
        }}
      >
        {quiz.status === 'available' ? '📝 Start Quiz' : 
         quiz.status === 'completed' ? '✓ Completed' : 
         '🔒 Not Available Yet'}
      </button>
    </div>
  );
};

export default StudentQuizCard;