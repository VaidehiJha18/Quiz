const QuizQCard = ({ question, selectedAnswer, onAnswerSelect, onMarkReview, isMarkedReview }) => {
  return (
    <div className="quiz-question-card">
      <div className="question-header">
        <h2 className="question-text">{question.text}</h2>
        <button
          className={`mark-review-btn ${isMarkedReview ? 'marked' : ''}`}
          onClick={onMarkReview}
        >
          {isMarkedReview ? '★ Marked for Review' : '☆ Mark for Review'}
        </button>
      </div>

      <div className="options-container">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={`quiz-option ${selectedAnswer === index ? 'selected' : ''}`}
            onClick={() => onAnswerSelect(index)}
          >
            <div className="option-indicator">
              {String.fromCharCode(65 + index)}
            </div>
            <span className="option-text">{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizQCard;