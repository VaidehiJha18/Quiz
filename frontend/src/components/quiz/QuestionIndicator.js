const QuestionIndicator = ({ number, status, isActive, onClick }) => {
  const getStatusClass = () => {
    if (status === 'answered') return 'indicator-answered';
    if (status === 'review') return 'indicator-review';
    if (status === 'unattempted') return 'indicator-unattempted';
    if (status === 'unvisited') return 'indicator-unvisited';
    return '';
  };

  return (
    <div className={`question-indicator ${getStatusClass()} ${isActive ? 'indicator-active' : ''}`} onClick={onClick}>
      {number}
    </div>
  );
};

export default QuestionIndicator;