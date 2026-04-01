import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuizQuestions, submitStudentQuiz } from '../api/apiService';
import QuizTimer from '../components/QuizTimer'; 
import './Quiz.css';

const Quiz = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // --- State Management ---
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]); 
  const [reviewFlags, setReviewFlags] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const startTimeRef = useRef(null);
  
  // --- Fetch Quiz Data ---
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetchQuizQuestions(token);
        const data = response.data;
        
        setQuizData(data);
        setAnswers(Array(data.questions.length).fill(null));
        setReviewFlags(Array(data.questions.length).fill(false));
        
        startTimeRef.current = new Date();
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchQuiz();
  }, [token]);

  // --- Track Visited Questions ---
  useEffect(() => {
    if (quizData) {
      setVisitedQuestions(prev => new Set([...prev, currentQuestion]));
    }
  }, [currentQuestion, quizData]);

  // --- Handlers ---
  const handleAnswerSelect = (optionId) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionId;
    setAnswers(newAnswers);
  };

  const handleMarkReview = () => {
    const newReviewFlags = [...reviewFlags];
    newReviewFlags[currentQuestion] = !newReviewFlags[currentQuestion];
    setReviewFlags(newReviewFlags);
  };

  const handleSubmit = useCallback(async (autoSubmitted = false) => {
    if (submitted || isSubmitting || !quizData) return;
    
    if (!autoSubmitted && !window.confirm("Are you sure you want to submit?")) return;

    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const formattedAnswers = {};
      quizData.questions.forEach((q, index) => {
        formattedAnswers[q.id] = answers[index];
      });

      const endTime = new Date();
      const start = startTimeRef.current || new Date(); 
      const timeSpentSeconds = Math.floor((endTime - start) / 1000);

      const payload = {
        token: token,
        answers: formattedAnswers,
        auto_submitted: autoSubmitted,
        submitted_at: endTime.toISOString(),
        started_at: start.toISOString(),
        duration_seconds: timeSpentSeconds 
      };

      await submitStudentQuiz(payload);
      
      alert(autoSubmitted ? "Time expired! Quiz submitted." : "Quiz Submitted Successfully!");
      
      
      navigate('/student/dashboard'); 
      
    } catch (err) {
      console.error("Submission failed", err);
      alert("Submission failed. Please try again.");
      setIsSubmitting(false);
      setSubmitted(false);
    }
  }, [answers, isSubmitting, quizData, submitted, token, navigate]);

  const handleTimeUp = useCallback(() => {
    handleSubmit(true);
  }, [handleSubmit]);

  if (loading) return <div className="loading">Loading Quiz Questions...</div>;
  if (!quizData || !quizData.questions) return <div className="error">Quiz not found.</div>;

  const totalQuestions = quizData.questions.length;
  const answeredCount = answers.filter(a => a !== null).length;
  const allAnswered = answeredCount === totalQuestions;

  const getQuestionStatus = (index) => {
    let classes = "";
    if (index === currentQuestion) classes += "indicator-active ";
    
    if (reviewFlags[index]) {
        classes += "indicator-review";
    } else if (answers[index] !== null) {
        classes += "indicator-answered";
    } else if (visitedQuestions.has(index)) {
        classes += "indicator-unattempted";
    } else {
        classes += "indicator-unvisited";
    }
    return classes;
  };

  const questionStatuses = quizData.questions.map((_, index) => getQuestionStatus(index));

  return (
    <div className="quiz-page-wrapper">
      <header className="quiz-top-header">
        <div className="header-left">
          <h2 className="quiz-title-text">{quizData.quiz?.quiz_title || "Quiz"}</h2>
          <div className="quiz-progress-mini">
            <span className="count-bold">{answeredCount}</span> / {totalQuestions} Questions Answered
          </div>
        </div>

        <div className="header-right">
          <QuizTimer
            timeLimitMinutes={quizData.quiz?.time_limit || quizData.quiz?.duration || 10}
            onTimeUp={handleTimeUp}
          />
        </div>
        
        <div className="header-progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      <div className="quiz-layout-body">
        <aside className="quiz-navigation-sidebar">
          <div className="sidebar-header">
            <h3>Question Navigation</h3>
          </div>
          <div className="indicators-grid">
            {quizData.questions.map((_, index) => (
              <div
                key={index}
                className={`question-indicator ${questionStatuses[index]}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>
          
          <div className="sidebar-legend">
            <div className="legend-item"><div className="legend-box legend-unvisited"></div><span>Unvisited</span></div>
            <div className="legend-item"><div className="legend-box legend-visited"></div><span>Visited (No Answer)</span></div>
            <div className="legend-item"><div className="legend-box legend-answered"></div><span>Answered</span></div>
            <div className="legend-item"><div className="legend-box legend-review"></div><span>Marked for Review</span></div>
          </div>
        </aside>

        <main className="quiz-question-area">
          <div className="question-card-container">
            <div className="quiz-question-card">
              <div className="question-header">
                
                <h2 className="question-text">
                  {currentQuestion + 1}. {quizData.questions[currentQuestion].question_text || quizData.questions[currentQuestion].text}
                </h2>
                <button 
                  className={`mark-review-btn ${reviewFlags[currentQuestion] ? 'marked' : ''}`}
                  onClick={handleMarkReview}
                >
                  {reviewFlags[currentQuestion] ? '★ Marked' : '☆ Mark for Review'}
                </button>
              </div>

              <div className="options-container">
                {quizData.questions[currentQuestion].options.map((opt, idx) => (
                  <div 
                    key={opt.id || idx}
                    className={`quiz-option ${answers[currentQuestion] === opt.id ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(opt.id)}
                  >
                    <div className="option-indicator">{String.fromCharCode(65 + idx)}</div>
                    
                    <div className="option-text">{opt.option_text || opt.text || opt.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="quiz-action-footer">
              <button 
                className="nav-btn prev-btn" 
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>

              {currentQuestion === totalQuestions - 1 ? (
                <button 
                  className="nav-btn submit-btn" 
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  style={{ backgroundColor: allAnswered ? '#27ae60' : '#6c757d' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Final Quiz'}
                </button>
              ) : (
                <button 
                  className="nav-btn next-btn" 
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Quiz;
