
//vaidehi
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
  const [isCalibrating, setIsCalibrating] = useState(false);

  const startTimeRef = useRef(null);

  // Load quiz details
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

  // Submit Handler
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
        ? `Quiz auto-submitted due to violations: ${reason}`
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

  // Submit on Strike 3
  const handleViolationUpdate = useCallback((reason, count, isFinalViolation) => {
    if (isFinalViolation === true) {
      handleSubmit(true, reason);
    }
  }, [handleSubmit]);

  // Hook instance
  const {
    AntiCheatOverlays,
    calibrateSystem,
    calibrationError,
    violationCount
  } = useAntiCheat(
    isQuizStarted,
    submitted,
    handleViolationUpdate,
    quizId
  );

  // Start Calibration and Enter Fullscreen
  const handleStartExam = async () => {
    setIsCalibrating(true);
    const success = await calibrateSystem();
    setIsCalibrating(false);

    if (!success) return;

    const el = document.documentElement;
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
      } catch {
        alert("Fullscreen is required. Please grant permission.");
        return;
      }
    }

    setIsQuizStarted(true);
    startTimeRef.current = new Date();
  };

  const handleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

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

  // Pre-quiz Calibration Screen
  if (!isQuizStarted) {
    return (
      <>
        <Header />
        <main className="page-container">
          <div style={{
            maxWidth: '520px', margin: '60px auto', textAlign: 'center',
            padding: '36px', borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: '#fff'
          }}>
            <h2 style={{ marginBottom: '12px' }}>{quiz.title}</h2>
            <p style={{ color: '#555', marginBottom: '8px' }}>
              Duration: <strong>{quiz.time_limit || quiz.duration || 10} minutes</strong>
            </p>
            <p style={{ color: '#555', marginBottom: '20px' }}>
              Questions: <strong>{quiz.questions?.length || 0}</strong>
            </p>

            <div style={{
              background: '#fff8e1', border: '1px solid #f0c040',
              borderRadius: '8px', padding: '16px', marginBottom: '24px',
              textAlign: 'left', fontSize: '13.5px', color: '#444'
            }}>
              <strong>Strict Proctoring Enforced:</strong>
              <ul style={{ margin: '8px 0 0 16px', lineHeight: '1.8' }}>
                <li>Fullscreen required across all platforms.</li>
                <li>Tab switching, window resizing, or split screens trigger violations.</li>
                <li>Camera analyzes single-face presence and gaze directions continuously.</li>
                <li>Looking away from the screen will trigger a violation.</li>
                <li>Webcam snapshots are recorded on violations.</li>
                <li><strong>3 violations will automatically submit your exam.</strong></li>
              </ul>
            </div>

            {calibrationError && (
              <div style={{ color: '#d9534f', marginBottom: '15px', fontSize: '14px', fontWeight: 'bold' }}>
                {calibrationError}
              </div>
            )}

            <Button
              label={isCalibrating ? "Verifying Face & Fullscreen..." : "Calibrate Camera & Start Quiz"}
              onClick={handleStartExam}
              disabled={isCalibrating}
              className="btn btn-primary"
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AntiCheatOverlays />

      <Header />
      <main className="page-container">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0 }}>{quiz.title}</h2>
              <span style={{
                display: 'inline-block',
                marginTop: '6px',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: violationCount >= 2 ? '#ff4d4f' : '#faad14',
                color: '#fff'
              }}>
                Violations: {violationCount} / 3
              </span>
            </div>
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