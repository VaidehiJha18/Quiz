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
            key={option.id} // Use the database ID as the key
            className={`quiz-option ${selectedAnswer === option.id ? 'selected' : ''}`} // Compare using ID
            onClick={() => onAnswerSelect(option.id)} // Pass the ID to the select handler
          >
            <div className="option-indicator">
              {String.fromCharCode(65 + index)}
            </div>
            {/* FIX: Render option.text instead of the whole option object */}
            <span className="option-text">{option.text}</span> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizQCard;