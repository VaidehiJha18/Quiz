import React from 'react';

export default function QuestionCard({
  questionId,
  questionText,
  options,
  onSelect,
  selectedValue,
}) {
  return (
    <div className="question-card">
      <p className="question-card-text">{questionText}</p>
      <div className="question-options">
        {options.map((option, index) => (
          <label
            key={index}
            // Ensure 'selected' class is applied when values match
            className={`question-option ${selectedValue === option ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name={`question-${questionId}`}
              value={option}
              // FIX: Pass questionId so handleSelect in QuizPage updates correctly
              onChange={() => onSelect(questionId, option)} 
              style={{ display: 'none' }} 
            />
            {/* Display the option text */}
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
