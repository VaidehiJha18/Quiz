import QuestionIndicator from "./QuestionIndicator";

const QuizSidebar = ({ questions, currentQuestion, onQuestionSelect, questionStatuses }) => {
  return (
    <div className="quiz-sidebar">
      <div className="sidebar-header">
        <h3>Question Navigation</h3>
      </div>
      
      <div className="indicators-grid">
        {questions.map((_, index) => (
          <QuestionIndicator
            key={index}
            number={index + 1}
            status={questionStatuses[index]}
            isActive={currentQuestion === index}
            onClick={() => onQuestionSelect(index)}
          />
        ))}
      </div>

      <div className="sidebar-legend">
        <div className="legend-item">
          <div className="legend-box indicator-unvisited"></div>
          <span>Unvisited</span>
        </div>
        <div className="legend-item">
          <div className="legend-box indicator-unattempted"></div>
          <span>Visited (No Answer)</span>
        </div>
        <div className="legend-item">
          <div className="legend-box indicator-answered"></div>
          <span>Answered</span>
        </div>
        <div className="legend-item">
          <div className="legend-box indicator-review"></div>
          <span>Marked for Review</span>
        </div>
      </div>
    </div>
  );
};
export default QuizSidebar;