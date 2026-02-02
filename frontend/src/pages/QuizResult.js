import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './QuizResult.css'; // You'll create this CSS next

const QuizResult = () => {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        // Ensure you import 'api' from your apiService or use axios directly with credentials
        const res = await axios.get(`http://localhost:5000/student/result/${attemptId}`, { withCredentials: true });
        setResult(res.data);
      } catch (err) {
        console.error("Error loading result", err);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (!result) return <div>Loading Results...</div>;

  return (
    <div className="result-container">
      <div className="result-header">
        <h1>{result.meta.quiz_title} - Results</h1>
        <div className="score-card">
          <h2>Score: {result.meta.total_score}</h2>
        </div>
      </div>

      <div className="questions-review">
        {result.questions.map((q, index) => (
          <div key={index} className="review-card">
            <h3>Q{index + 1}: {q.question_txt}</h3>
            <div className="options-list">
              {q.options.map((opt) => (
                <div 
                  key={opt.id} 
                  className={`review-option ${opt.status}`}
                >
                  {opt.text}
                  {/* Status Icons */}
                  {opt.status === 'correct' && <span className="icon">✅ (Your Answer)</span>}
                  {opt.status === 'wrong' && <span className="icon">❌ (Your Answer)</span>}
                  {opt.status === 'missed' && <span className="icon">⬅ Correct Answer</span>}
                </div>
              ))}
            </div>
            <div className="marks-badge">Marks: {q.marks_awarded} / {q.marks}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResult;