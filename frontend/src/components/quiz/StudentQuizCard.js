const StudentQuizCard = ({ quiz, onStartQuiz }) => {
  return (
    <div className="quiz-card">
      <div className="quiz-card-header">
        <h3 className="quiz-card-title">{quiz.title}</h3>
        <span className={`quiz-status-badge ${quiz.status}`}>
          {quiz.status}
        </span>
      </div>

      <div className="quiz-card-details">
        <div className="quiz-detail-item">
          <div className="detail-icon">❓</div>
          <span><span className="quiz-detail-label">Questions:</span>{quiz.questions}</span>
        </div>
        <div className="quiz-detail-item">
          <div className="detail-icon">⏱️</div>
          <span><span className="quiz-detail-label">Duration:</span>{quiz.duration}</span>
        </div>
        <div className="quiz-detail-item">
          <div className="detail-icon">📅</div>
          <span><span className="quiz-detail-label">Due:</span>{quiz.dueDate}</span>
        </div>
        <div className="quiz-detail-item">
          <div className="detail-icon">👨‍🏫</div>
          <span><span className="quiz-detail-label">Professor:</span>{quiz.professor}</span>
        </div>
      </div>

      <button 
        className="start-quiz-btn"
        onClick={() => onStartQuiz(quiz.id)}
        disabled={quiz.status !== 'available'}
      >
        {quiz.status === 'available' ? '📝 Start Quiz' : 
         quiz.status === 'completed' ? '✓ Completed' : 
         '🔒 Not Available Yet'}
      </button>
    </div>
  );
};

export default StudentQuizCard;