import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizSidebar from '../components/quiz/QuizSidebar';
import QuizQCard from '../components/quiz/QuizQCard';
import { fetchQuizQuestions, submitStudentQuiz } from '../api/apiService';
import './Quiz.css';

const Quiz = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // --- State Management ---
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of option IDs
  const [reviewFlags, setReviewFlags] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Fetch Quiz Data ---
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetchQuizQuestions(token); 
        const data = response.data;
        
        setQuizData(data);
        // Initialize state arrays based on question count
        setAnswers(Array(data.questions.length).fill(null));
        setReviewFlags(Array(data.questions.length).fill(false));
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [token]);

  // --- Loading / Error States ---
  if (loading) return <div className="loading">Loading Quiz Questions...</div>;
  if (!quizData) return <div className="error">Quiz not found.</div>;

  // --- Derived Constants ---
  const totalQuestions = quizData.questions.length;
  const answeredCount = answers.filter(a => a !== null).length;
  const allAnswered = answeredCount === totalQuestions;

  // --- Sidebar Logic ---
  const getQuestionStatus = (index) => {
    if (reviewFlags[index]) return 'review';
    if (answers[index] !== null) return 'answered';
    if (index === currentQuestion) return 'active'; 
    if (visitedQuestions.has(index)) return 'unattempted'; // Visited but not answered
    return 'unvisited';
  };

  const questionStatuses = quizData.questions.map((_, index) => getQuestionStatus(index));

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

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setVisitedQuestions(prev => new Set([...prev, nextQuestion]));
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      setVisitedQuestions(prev => new Set([...prev, prevQuestion]));
    }
  };

  const handleSubmit = async () => {
    // Strict Check: Ensure all questions are answered
    if (!allAnswered) return; 
    
    if (!window.confirm("Are you sure you want to submit? This cannot be undone.")) return;

    setIsSubmitting(true);
    try {
        // Format answers for Backend: { question_id: option_id }
        const formattedAnswers = {};
        quizData.questions.forEach((q, index) => {
            formattedAnswers[q.id] = answers[index];
        });

        const payload = {
            token: token,
            answers: formattedAnswers
        };

        await submitStudentQuiz(payload);

        alert("Quiz Submitted Successfully!");
        navigate('/student/dashboard'); 

    } catch (err) {
        console.error("Submission failed", err);
        alert("Submission failed. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="quiz-page-layout">
      {/* Sidebar with Navigation Status */}
      <QuizSidebar
        questions={quizData.questions}
        currentQuestion={currentQuestion}
        onQuestionSelect={(index) => {
          setCurrentQuestion(index);
          setVisitedQuestions(prev => new Set([...prev, index]));
        }}
        questionStatuses={questionStatuses}
      />
      
      <div className="quiz-main-content">
        {/* Header */}
        <div className="quiz-header">
           <h1>{quizData.quiz.quiz_title}</h1>
           <div className="quiz-progress">
             Question {currentQuestion + 1} of {totalQuestions}
           </div>
        </div>
        
        {/* Question Card */}
        <QuizQCard
          question={quizData.questions[currentQuestion]}
          selectedAnswer={answers[currentQuestion]}
          onAnswerSelect={handleAnswerSelect}
          onMarkReview={handleMarkReview}
          isMarkedReview={reviewFlags[currentQuestion]}
        />

        {/* Navigation Buttons */}
        <div className="quiz-navigation-buttons">
          <button 
            className="nav-btn" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion === totalQuestions - 1 ? (
            <button 
                className={`nav-btn btn-submit ${allAnswered ? '' : 'disabled'}`} 
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                style={{ backgroundColor: allAnswered ? '#28a745' : '#ccc', cursor: allAnswered ? 'pointer' : 'not-allowed' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button 
                className="nav-btn" 
                onClick={handleNext}
            >
              Next →
            </button>
          )}
        </div>
        
        {/* Helper Text for Submission */}
        {!allAnswered && currentQuestion === totalQuestions - 1 && (
            <p style={{color: 'red', marginTop: '10px', textAlign: 'center'}}>
                You must answer all questions before submitting.
            </p>
        )}
      </div>
    </div>
  );
};

export default Quiz;