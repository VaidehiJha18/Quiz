import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuizQuestions, submitStudentQuiz } from '../api/apiService';
import QuizTimer from '../components/QuizTimer';
import './Quiz.css';

// ─────────────────────────────────────────────────────────────────────────────
// Anti-cheat hook — all lockdown logic lives here, cleanly separated
// ─────────────────────────────────────────────────────────────────────────────
function useAntiCheat(isActive, submitted, onViolation) {
  const violationCount = useRef(0);
  const isProcessing = useRef(false); 
  const MAX_VIOLATIONS = 1;

  const handleViolation = useCallback((reason) => {
    if (!isActive || submitted || isProcessing.current) return;
    
    isProcessing.current = true; 
    violationCount.current += 1;

    if (violationCount.current >= MAX_VIOLATIONS) {
      onViolation(reason);
    } else {
      const remaining = MAX_VIOLATIONS - violationCount.current;
      alert(`⚠️ Warning ${violationCount.current}/${MAX_VIOLATIONS}: Do not leave the quiz!\n${remaining} warning(s) left before auto-submit.`);
    }

    setTimeout(() => {
      isProcessing.current = false;
    }, 1000);

  }, [isActive, submitted, onViolation]);

  // 1. Block right-click
  useEffect(() => {
    if (!isActive) return;
    const block = (e) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    return () => document.removeEventListener('contextmenu', block);
  }, [isActive]);

  // 2. Block keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;
    const block = (e) => {
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey || e.metaKey) {
        const blocked = ['C','V','X','U','S','P','A','F'];
        if (blocked.includes(e.key?.toUpperCase())) { e.preventDefault(); return; }
        if (e.shiftKey && ['I','J','C'].includes(e.key?.toUpperCase())) { e.preventDefault(); return; }
      }
      if (e.altKey && e.key === 'Tab') { e.preventDefault(); handleViolation('alt_tab'); }
      if (e.key === 'Meta') { e.preventDefault(); }
    };
    document.addEventListener('keydown', block);
    return () => document.removeEventListener('keydown', block);
  }, [isActive, handleViolation]);

  // 3. Tab switch / window blur
  useEffect(() => {
    if (!isActive) return;
    const onVisibility = () => { if (document.hidden) handleViolation('tab_switch'); };
    const onBlur = () => handleViolation('window_blur');
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [isActive, handleViolation]);

  // 4. Fullscreen exit
  useEffect(() => {
    if (!isActive) return;
    const onFSChange = () => {
      if (!document.fullscreenElement) handleViolation('exit_fullscreen');
    };
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, [isActive, handleViolation]);

  // 5. Block copy / cut / text selection
  useEffect(() => {
    if (!isActive) return;
    const block = (e) => e.preventDefault();
    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('selectstart', block);
    return () => {
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('selectstart', block);
    };
  }, [isActive]);

  // 6. Warn before closing tab
  useEffect(() => {
    if (!isActive || submitted) return;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isActive, submitted]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-start lockdown screen
// ─────────────────────────────────────────────────────────────────────────────
function LockdownStartScreen({ quizData, onStart }) {
  const totalQuestions = quizData?.questions?.length || 0;
  const duration = quizData?.quiz?.time_limit || quizData?.quiz?.duration || 10;
  const title = quizData?.quiz?.quiz_title || "Quiz";

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '520px',
        width: '90%',
        textAlign: 'center',
        color: '#fff',
      }}>
        {/* Icon */}
        <div style={{
          width: '72px', height: '72px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', margin: '0 auto 24px',
          boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
        }}>🔒</div>

        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{title}</h1>

        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', margin: '20px 0 28px' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#667eea' }}>{totalQuestions}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Questions</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#667eea' }}>{duration}m</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Duration</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f39c12' }}>1</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Violation</div>
          </div>
        </div>

        {/* Rules */}
        <div style={{
          background: 'rgba(243,156,18,0.1)',
          border: '1px solid rgba(243,156,18,0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '28px',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#f39c12', marginBottom: '10px' }}>
            ⚠️ LOCKDOWN RULES — READ CAREFULLY
          </div>
          {[
            'Quiz runs in mandatory fullscreen mode',
            'Switching tabs or windows = 1 violation ',
            'Exiting fullscreen = 1 violation ',
            'Alt+Tab or minimizing = 1 violation ',
            '1 violation → quiz auto-submits immediately',
            'Right-click and copy are disabled',
          ].map((rule, i) => (
            <div key={i} style={{
              fontSize: '13px', color: 'rgba(255,255,255,0.7)',
              padding: '4px 0', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ color: '#e74c3c', fontWeight: 700 }}>✕</span> {rule}
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.5px',
            boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
        >
          🚀 Start Quiz (Enter Fullscreen)
        </button>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '16px' }}>
          Timer starts immediately after entering fullscreen
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Quiz Component
// ─────────────────────────────────────────────────────────────────────────────
const Quiz = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [reviewFlags, setReviewFlags] = useState([]);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isQuizStarted, setIsQuizStarted] = useState(false); // ← lockdown gate

  const startTimeRef = useRef(null);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetchQuizQuestions(token);
        const data = response.data;
        setQuizData(data);
        setAnswers(Array(data.questions.length).fill(null));
        setReviewFlags(Array(data.questions.length).fill(false));
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchQuiz();
  }, [token]);

  // Track visited questions
  useEffect(() => {
    if (quizData) {
      setVisitedQuestions(prev => new Set([...prev, currentQuestion]));
    }
  }, [currentQuestion, quizData]);

  // Submit handler — defined before useAntiCheat so it can be passed in
  const handleSubmit = useCallback(async (autoSubmitted = false, reason = '') => {
    if (submitted || isSubmitting || !quizData) return;
    if (!autoSubmitted && !window.confirm("Are you sure you want to submit?")) return;

    setIsSubmitting(true);
    setSubmitted(true);

    // Exit fullscreen cleanly
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    try {
      const formattedAnswers = {};
      quizData.questions.forEach((q, index) => {
        formattedAnswers[q.id] = answers[index];
      });

      const endTime = new Date();
      const start = startTimeRef.current || new Date();
      const timeSpentSeconds = Math.floor((endTime - start) / 1000);

      const payload = {
        token,
        answers: formattedAnswers,
        auto_submitted: autoSubmitted,
        violation_reason: reason,
        submitted_at: endTime.toISOString(),
        started_at: start.toISOString(),
        duration_seconds: timeSpentSeconds,
      };

      await submitStudentQuiz(payload);
      alert(autoSubmitted
        ? "⚠️ Your quiz was auto-submitted due to a policy violation."
        : "✅ Quiz Submitted Successfully!"
      );
      navigate('/student/dashboard');

    } catch (err) {
      console.error("Submission failed", err);
      alert("Submission failed. Please try again.");
      setIsSubmitting(false);
      setSubmitted(false);
    }
  }, [answers, isSubmitting, quizData, submitted, token, navigate]);

  // ── Activate anti-cheat only after quiz is started ──
  useAntiCheat(isQuizStarted, submitted, (reason) => handleSubmit(true, reason));

  // Enter fullscreen and start quiz
  const enterLockdown = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen()
        .then(() => {
          setIsQuizStarted(true);
          startTimeRef.current = new Date(); // timer starts NOW
        })
        .catch(() => {
          alert("Fullscreen access is required to start this quiz. Please allow fullscreen and try again.");
        });
    } else {
      // Fallback for browsers without fullscreen API
      setIsQuizStarted(true);
      startTimeRef.current = new Date();
    }
  }, []);

  const handleAnswerSelect = (optionId) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionId;
    setAnswers(newAnswers);
  };

  const handleMarkReview = () => {
    const newFlags = [...reviewFlags];
    newFlags[currentQuestion] = !newFlags[currentQuestion];
    setReviewFlags(newFlags);
  };

  const handleTimeUp = useCallback(() => {
    handleSubmit(true, 'time_up');
  }, [handleSubmit]);

  // ── Loading / error states ──
  if (loading) return <div className="loading">Loading Quiz Questions...</div>;
  if (!quizData || !quizData.questions) return <div className="error">Quiz not found.</div>;

  // ── Pre-start lockdown screen ──
  if (!isQuizStarted) {
    return <LockdownStartScreen quizData={quizData} onStart={enterLockdown} />;
  }

  // ── Active quiz ──
  const totalQuestions = quizData.questions.length;
  const answeredCount = answers.filter(a => a !== null).length;
  const allAnswered = answeredCount === totalQuestions;

  const getQuestionStatus = (index) => {
    let classes = "";
    if (index === currentQuestion) classes += "indicator-active ";
    if (reviewFlags[index]) classes += "indicator-review";
    else if (answers[index] !== null) classes += "indicator-answered";
    else if (visitedQuestions.has(index)) classes += "indicator-unattempted";
    else classes += "indicator-unvisited";
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
