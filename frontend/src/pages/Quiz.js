import QuizSidebar from '../components/quiz/QuizSidebar';
import QuestionIndicator from '../components/quiz/QuestionIndicator';
import QuizQCard from '../components/quiz/QuizQCard';
import './Quiz.css';
import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { fetchQuizQuestions } from '../api/apiService';

const Quiz = () => {
  const { token } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // States that depend on question count
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [reviewFlags, setReviewFlags] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // Pass the token directly to your service
        const response = await fetchQuizQuestions(token); 
        const data = response.data; // Axios data
        
        setQuizData(data);
        setAnswers(Array(data.questions.length).fill(null));
        setReviewFlags(Array(data.questions.length).fill(false));
      } catch (err) {
        console.error("Failed to load quiz:", err);
        setQuizData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [token]);

  if (loading) return <div className="loading">Loading Quiz Questions...</div>;
  if (!quizData) return <div className="error">Quiz not found.</div>;

  // Now we can safely use quizData.questions.length
  const totalQuestions = quizData.questions.length;

  const getQuestionStatus = (index) => {
    if (reviewFlags[index]) return 'review';
    if (answers[index] !== null) return 'answered';
    if (visitedQuestions.has(index)) return 'unattempted';
    return 'unvisited';
  };

  const questionStatuses = quizData.questions.map((_, index) => getQuestionStatus(index));

  const handleAnswerSelect = (optionId) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionId; // Store the ID from the database
    setAnswers(newAnswers);
  };

  const handleMarkReview = () => {
    const newReviewFlags = [...reviewFlags];
    newReviewFlags[currentQuestion] = !newReviewFlags[currentQuestion];
    setReviewFlags(newReviewFlags);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      setVisitedQuestions(prev => new Set([...prev, nextQuestion])); // Mark as visited
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      setVisitedQuestions(prev => new Set([...prev, prevQuestion])); // Mark as visited
    }
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/prof/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          // Map answers to a clean format: { question_id: selected_option_id }
          responses: quizData.questions.reduce((acc, q, index) => {
            acc[q.id] = answers[index];
            return acc;
          }, {})
        }),
    });

    if (response.ok) {
      const result = await response.json();
      alert(`Quiz submitted successfully!`);
      // Navigate to a "Thank You" or Results page
      // window.location.href = '/quiz-completion';
    }
  } catch (err) {
    console.error("Submission failed", err);
  }
};

  return (
    <div className="quiz-page-layout">
      <QuizSidebar
        questions={quizData.questions}
        currentQuestion={currentQuestion}
        onQuestionSelect={(index) => {
          setCurrentQuestion(index);
          setVisitedQuestions(prev => new Set([...prev, index])); // Mark as visited when clicked
        }}
        questionStatuses={questionStatuses}
      />

      <div className="quiz-main-content">
        <div className="quiz-header">
          <h1>{quizData.title}</h1>
          <div className="quiz-progress">
            Question {currentQuestion + 1} of {quizData.questions.length}
          </div>
        </div>

        <QuizQCard
          question={quizData.questions[currentQuestion]}
          selectedAnswer={answers[currentQuestion]}
          onAnswerSelect={handleAnswerSelect}
          onMarkReview={handleMarkReview}
          isMarkedReview={reviewFlags[currentQuestion]}
        />

        <div className="quiz-navigation-buttons">
          <button
            className="nav-btn btn-previous"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion === quizData.questions.length - 1 ? (
            <button className="nav-btn btn-submit" onClick={handleSubmit}>
              Submit Quiz
            </button>
          ) : (
            <button className="nav-btn btn-next" onClick={handleNext}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;