import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/forms/Button';
import QuestionCard from '../components/quiz/QuestionCard';
import QuizTimer from '../components/QuizTimer';
import { fetchQuizById, submitQuiz } from '../api/apiService';
import useAntiCheat from '../hooks/useAntiCheat';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  const startTimeRef = useRef(null);

  // Load quiz
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await fetchQuizById(quizId);
        setQuiz(res.data);
      } catch (err) {
        console.error("Failed to load quiz:", err);
      }
    };
    if (quizId) loadQuiz();
  }, [quizId]);

  // Submit handler
  const handleSubmit = useCallback(async (autoSubmitted = false, reason = '') => {
    if (submitted || isSubmitting || !quiz) return;
    if (!autoSubmitted && !window.confirm("Are you sure you want to submit?")) return;

    setIsSubmitting(true);
    setSubmitted(true);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    try {
      const endTime = new Date();
      const start = startTimeRef.current || new Date();
      const timeSpentSeconds = Math.floor((endTime - start) / 1000);

      const payload = {
        quizId,
        answers,
        auto_submitted: autoSubmitted,
        violation_reason: reason,
        submitted_at: endTime.toISOString(),
        started_at: start.toISOString(),
        duration_seconds: timeSpentSeconds,
      };

      await submitQuiz(quizId, payload);
      alert(autoSubmitted
        ? "Your quiz was auto-submitted due to a policy violation."
        : "Quiz Submitted Successfully!"
      );
      navigate('/Student/Dashboard');

    } catch (err) {
      console.error("Submission failed", err);
      alert("Submission failed. Please try again.");
      setIsSubmitting(false);
      setSubmitted(false);
    }
  }, [quiz, answers, isSubmitting, submitted, quizId, navigate]);

  

  // ── Anti-cheat: get FreezeOverlay from the hook ───────────────────────────
  const { FreezeOverlay } = useAntiCheat(
    isQuizStarted,
    submitted,
    (reason) => handleSubmit(true, reason)
  );

  // Enter fullscreen + start quiz
  const enterLockdown = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen()
        .then(() => {
          setIsQuizStarted(true);
          startTimeRef.current = new Date();
        })
        .catch(() => alert("Fullscreen is required. Please allow it and try again."));
    } else {
      // Fallback for browsers without fullscreen support
      setIsQuizStarted(true);
      startTimeRef.current = new Date();
    }
  };

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  // Loading
  if (!quiz) {
    return (
      <>
        <Header />
        <main className="page-container">
          <p style={{ textAlign: 'center', padding: '50px' }}>Loading quiz...</p>
        </main>
        <Footer />
      </>
    );
  }

  // Pre-start screen
  if (!isQuizStarted) {
    return (
      <>
        <Header />
        <main className="page-container">
          <div style={{
            maxWidth: '500px', margin: '80px auto', textAlign: 'center',
            padding: '40px', borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: '#fff'
          }}>
            <h2 style={{ marginBottom: '12px' }}>{quiz.title}</h2>
            <p style={{ color: '#555', marginBottom: '8px' }}>
              Duration: <strong>{quiz.time_limit || quiz.duration || 10} minutes</strong>
            </p>
            <p style={{ color: '#555', marginBottom: '24px' }}>
              Questions: <strong>{quiz.questions?.length || 0}</strong>
            </p>
            <div style={{
              background: '#fff8e1', border: '1px solid #f0c040',
              borderRadius: '8px', padding: '16px', marginBottom: '28px',
              textAlign: 'left', fontSize: '14px', color: '#555'
            }}>
              <strong>Lockdown Rules:</strong>
              <ul style={{ margin: '8px 0 0 16px', lineHeight: '1.8' }}>
                <li>Quiz opens in fullscreen — do not exit</li>
                <li>Do NOT switch tabs or minimize</li>
                <li>Do NOT press Alt+Tab or the Windows key</li>
                <li>Do NOT right-click or copy text</li>
                <li>3 violations = screen freeze + auto-submit</li>
              </ul>
            </div>
            <Button label="Start Quiz (Enter Fullscreen)" onClick={enterLockdown} className="btn btn-primary" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Active quiz
  return (
    <>
      {/* ✅ FreezeOverlay renders here — sits on top of everything when triggered */}
      <FreezeOverlay />

      <Header />
      <main className="page-container">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>{quiz.title}</h2>
            <QuizTimer
              timeLimitMinutes={quiz.time_limit || quiz.duration || 10}
              onTimeUp={() => handleSubmit(true, 'time_up')}
            />
          </div>

          <div className="questions-list">
            {quiz.questions?.map((q) => (
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

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
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

