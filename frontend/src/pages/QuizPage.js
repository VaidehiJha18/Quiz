import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/forms/Button';
import QuestionCard from '../components/quiz/QuestionCard';
import QuizTimer from '../components/QuizTimer'; 
import { fetchQuizById, submitQuiz } from '../api/apiService';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const startTimeRef = useRef(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await fetchQuizById(quizId);
        setQuiz(res.data);
        // Start the timer exactly when the data is set
        startTimeRef.current = new Date();
      } catch (err) {
        console.error("Failed to load quiz:", err);
      }
    };
    if (quizId) loadQuiz();
  }, [quizId]);

  const handleSelect = (questionId, option) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: option,
    }));
  };

  const handleSubmit = useCallback(async (autoSubmitted = false) => {
    if (submitted || isSubmitting || !quiz) return;
    
    if (!autoSubmitted && !window.confirm("Are you sure you want to submit?")) return;

    setIsSubmitting(true);
    setSubmitted(true);

    try {
      const endTime = new Date();
      const start = startTimeRef.current || new Date(); 
      const timeSpentSeconds = Math.floor((endTime - start) / 1000);

      const payload = {
        quizId: quizId,
        answers: answers,
        auto_submitted: autoSubmitted,
        submitted_at: endTime.toISOString(),
        started_at: start.toISOString(),
        duration_seconds: timeSpentSeconds 
      };

      await submitQuiz(quizId, payload);
      
      if (autoSubmitted) {
        alert("Time's up! Your response has been recorded.");
      } else {
        alert("Quiz Submitted Successfully!");
      }

      navigate('/Student/Dashboard');

    } catch (err) {
      console.error("Submission failed", err);
      alert("Submission failed. Please try again.");
      setIsSubmitting(false);
      setSubmitted(false);
    }
  }, [quiz, answers, isSubmitting, submitted, quizId, navigate]);

  if (!quiz) {
    return (
      <>
        <Header />
        <main className="page-container">
          <p style={{textAlign: 'center', padding: '50px'}}>Loading quiz questions...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="page-container">
        <div className="quiz-container" style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>{quiz.title}</h2>
            
            {/* ✅ DYNAMIC TIMER FIX: 
                Pass the limit from your quiz data. If it's missing, default to 5 or 10.
                Using {quiz && ...} ensures the timer only starts once the data is ready. */}
            {quiz && (
              <QuizTimer 
                timeLimitMinutes={quiz.time_limit || quiz.duration || 10} 
                onTimeUp={() => handleSubmit(true)} 
              />
            )}
          </div>
          
          <div className="questions-list">
            {quiz.questions && quiz.questions.map((q) => (
              <QuestionCard
                key={q.id}
                questionId={q.id}
                questionText={q.text}
                options={q.options}
                onSelect={handleSelect}
                selectedValue={answers[q.id]}
              />
            ))}
          </div>

          <div className="submit-quiz-container" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Button
              label={isSubmitting ? "Submitting..." : "Submit Quiz"}
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="btn btn-primary"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
