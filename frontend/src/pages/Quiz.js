// export default Quiz;
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import './Quiz.css';

export default function Quiz() {
  const { token, quizId } = useParams();
  const activeQuizToken = token || quizId;
  const navigate = useNavigate();

  // Quiz State
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  // Proctoring State
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStatus, setCalibrationStatus] = useState('');
  const [violationCount, setViolationCount] = useState(0);
  const [activeViolationModal, setActiveViolationModal] = useState(null);

  // Proctoring Refs
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const isTerminatedRef = useRef(false);
  const lastGazeAwayRef = useRef(null);
  const startTimeRef = useRef(null);
  const viewDimsRef = useRef({ w: window.innerWidth, h: window.innerHeight });

  // 1. Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`/student/take-quiz/${activeQuizToken}`);
        if (res.data) {
          setQuiz(res.data.quiz);
          setQuestions(res.data.questions || []);
          if (res.data.quiz?.time_limit) {
            setTimeLeft(res.data.quiz.time_limit * 60);
          }
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      }
    };
    if (activeQuizToken) fetchQuiz();
  }, [activeQuizToken]);

  // Track visited questions
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      setVisited((prev) => ({ ...prev, [questions[currentIndex].id]: true }));
    }
  }, [currentIndex, questions]);

  // 2. Submit Handler (Declared first with useCallback to satisfy dependencies)
  const handleQuizSubmit = useCallback(
    async (auto = false, reason = '') => {
      if (isSubmitting) return;
      if (!auto && !window.confirm('Are you sure you want to submit your quiz?')) return;

      setIsSubmitting(true);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      try {
        const endTime = new Date();
        const start = startTimeRef.current || new Date();
        const durationSeconds = Math.round((endTime - start) / 1000);

        await axios.post('/student/submit-quiz', {
          token: activeQuizToken,
          answers,
          auto_submitted: auto,
          violation_reason: reason,
          duration_seconds: durationSeconds
        });

        alert(auto ? `Quiz auto-submitted: ${reason}` : 'Quiz submitted successfully!');
        navigate('/student/dashboard');
      } catch (err) {
        console.error('Submit error:', err);
        alert('Error submitting quiz.');
        setIsSubmitting(false);
      }
    },
    [isSubmitting, activeQuizToken, answers, navigate]
  );

  // 3. Timer Loop
  useEffect(() => {
    if (!isQuizStarted || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizSubmit(true, 'Time Expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isQuizStarted, isSubmitting, handleQuizSubmit]);

  // 4. Snapshot Capture
  const captureSnapshot = useCallback(() => {
    if (!videoRef.current) return '';
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.65);
  }, []);

  // 5. Report Violation
  const reportViolation = useCallback(
    async (reason) => {
      if (isTerminatedRef.current || !isQuizStarted || isSubmitting) return;

      const snapshot = captureSnapshot();
      const nextCount = violationCount + 1;
      setViolationCount(nextCount);

      setActiveViolationModal({
        reason: reason.replace(/_/g, ' '),
        count: nextCount,
        snapshot
      });

      try {
        await axios.post('/student/api/quiz/violation', {
          quizId: quiz?.id || activeQuizToken,
          violationType: reason,
          snapshot,
          violationCount: nextCount
        });
      } catch (err) {
        console.error('Error reporting violation:', err);
      }

      if (nextCount >= 3) {
        isTerminatedRef.current = true;
        alert('3 Violations detected. Your quiz will be automatically submitted.');
        handleQuizSubmit(true, 'Maximum Violations Exceeded (3/3)');
      }
    },
    [
      isQuizStarted,
      isSubmitting,
      violationCount,
      captureSnapshot,
      quiz,
      activeQuizToken,
      handleQuizSubmit
    ]
  );

  // 6. Pre-Quiz Camera Calibration
  const startCameraCalibration = async () => {
    setIsCalibrating(true);
    setCalibrationStatus('Requesting webcam access...');

    try {
      await tf.setBackend('webgl');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((res) => {
          videoRef.current.onloadedmetadata = () => res();
        });
        await videoRef.current.play();
      }

      setCalibrationStatus('Loading Face AI detection...');
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detector = await faceLandmarksDetection.createDetector(model, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true,
        maxFaces: 4
      });

      detectorRef.current = detector;
      const faces = await detector.estimateFaces(videoRef.current);

      if (faces.length === 0) {
        setCalibrationStatus('❌ No face detected. Please face the camera directly.');
        setIsCalibrating(false);
        return;
      }
      if (faces.length > 1) {
        setCalibrationStatus('❌ Multiple faces detected. Only one candidate allowed.');
        setIsCalibrating(false);
        return;
      }

      setCalibrationStatus('✅ Face verified successfully! You may now begin.');
      setIsCameraReady(true);
    } catch (err) {
      console.error(err);
      setCalibrationStatus('❌ Camera error: please allow webcam permissions in your browser.');
    } finally {
      setIsCalibrating(false);
    }
  };

  const handleStartExam = async () => {
    if (!isCameraReady) {
      alert('Please complete face verification first.');
      return;
    }
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn('Fullscreen blocked:', e);
    }
    startTimeRef.current = new Date();
    setIsQuizStarted(true);
  };

  // 7. Gaze & Head Turn Calculation
  const isLookingAway = (keypoints) => {
    const nose = keypoints.find((k) => k.name === 'noseTip') || keypoints[1];
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    if (!nose || !leftEye || !rightEye) return false;

    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
    const midPointX = (leftEye.x + rightEye.x) / 2;
    const horizontalDeviation = (nose.x - midPointX) / eyeDistance;

    return Math.abs(horizontalDeviation) > 0.35;
  };

  // 8. Cross-Platform Lockdown Listeners
  useEffect(() => {
    if (!isQuizStarted || isSubmitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) reportViolation('TAB_SWITCH_OR_MINIMIZED');
    };
    const handleBlur = () => reportViolation('WINDOW_FOCUS_LOST');
    const handleResize = () => {
      const dw = Math.abs(window.innerWidth - viewDimsRef.current.w);
      const dh = Math.abs(window.innerHeight - viewDimsRef.current.h);
      if (dw > 120 || dh > 120) {
        reportViolation('SPLIT_SCREEN_OR_RESIZED');
        viewDimsRef.current = { w: window.innerWidth, h: window.innerHeight };
      }
    };
    const handleFullscreen = () => {
      if (!document.fullscreenElement) reportViolation('FULLSCREEN_EXITED');
    };
    const handleContextMenu = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreen);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreen);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isQuizStarted, isSubmitting, reportViolation]);

  // 9. Continuous Face & Gaze Tracking
  useEffect(() => {
    if (!isQuizStarted || isSubmitting || !detectorRef.current) return;

    const interval = setInterval(async () => {
      if (isTerminatedRef.current || !videoRef.current) return;

      try {
        const faces = await detectorRef.current.estimateFaces(videoRef.current, { flipHorizontal: false });

        if (faces.length === 0) {
          reportViolation('NO_FACE_DETECTED');
        } else if (faces.length > 1) {
          reportViolation('MULTIPLE_FACES_DETECTED');
        } else {
          const lookingAway = isLookingAway(faces[0].keypoints);
          if (lookingAway) {
            if (!lastGazeAwayRef.current) {
              lastGazeAwayRef.current = Date.now();
            } else if (Date.now() - lastGazeAwayRef.current > 2500) {
              reportViolation('LOOKING_AWAY_FROM_SCREEN');
              lastGazeAwayRef.current = null;
            }
          } else {
            lastGazeAwayRef.current = null;
          }
        }
      } catch (err) {
        console.error('Detection loop error:', err);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [isQuizStarted, isSubmitting, reportViolation]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="quiz-pastel-wrapper">
      {/* Floating Camera Preview */}
      <div className="proctor-cam-box">
        <video ref={videoRef} autoPlay playsInline muted className="proctor-video-element" />
        <div className={`proctor-pill ${isCameraReady ? 'live' : 'not-live'}`}>
          {isCameraReady ? '● PROCTOR LIVE' : '○ CAMERA NOT VERIFIED'}
        </div>
      </div>

      {!isQuizStarted ? (
        /* Pre-Quiz Instruction Card */
        <div className="pre-quiz-card">
          <div className="pre-lock-icon">🔒</div>
          <h2>{quiz?.quiz_title || 'Quiz Assessment'}</h2>

          <div className="pre-stats-row">
            <div>
              <h3>{questions.length || 0}</h3>
              <p>QUESTIONS</p>
            </div>
            <div>
              <h3>{quiz?.time_limit || 10}m</h3>
              <p>DURATION</p>
            </div>
            <div>
              <h3 style={{ color: '#ef4444' }}>3</h3>
              <p>VIOLATIONS</p>
            </div>
          </div>

          <div className="pre-rules-callout">
            <strong>⚠️ LOCKDOWN RULES — READ CAREFULLY</strong>
            <ul>
              <li>Quiz runs in mandatory fullscreen mode</li>
              <li>Camera continuously checks for face & gaze presence</li>
              <li>Looking away from the screen for &gt; 2.5s triggers a violation</li>
              <li>Switching tabs or minimizing = 1 violation</li>
              <li>3rd violation = quiz auto-submits immediately</li>
            </ul>
          </div>

          {calibrationStatus && (
            <div className={`calibration-alert ${isCameraReady ? 'ready' : 'pending'}`}>
              {calibrationStatus}
            </div>
          )}

          {!isCameraReady ? (
            <button
              onClick={startCameraCalibration}
              disabled={isCalibrating}
              className="btn-purple-action"
            >
              {isCalibrating ? 'Verifying Face with Camera...' : '📷 Verify Face & Enable Camera'}
            </button>
          ) : (
            <button onClick={handleStartExam} className="btn-purple-action">
              🚀 Start Quiz (Enter Fullscreen)
            </button>
          )}
        </div>
      ) : (
        /* Original Quiz UI: Pastel Gradient, Sidebar Navigation & Card */
        <div className="quiz-main-container">
          <header className="quiz-header-row">
            <div>
              <h1 className="quiz-header-title">{quiz?.quiz_title || 'Quiz'}</h1>
              <p className="quiz-answered-count">
                {answeredCount} / {questions.length} Questions Answered
              </p>
            </div>
            <div className="quiz-timer-pill">
              <span className="timer-dot">●</span>
              {formatTimer(timeLeft)}
            </div>
          </header>

          <div className="quiz-body-layout">
            {/* Left Sidebar: Question Navigation Grid & Legend */}
            <aside className="question-navigation-sidebar">
              <h3>Question Navigation</h3>
              <div className="question-numbers-grid">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = answers[q.id] !== undefined;
                  const isMarked = markedForReview[q.id];

                  let statusClass = 'unvisited';
                  if (isCurrent) statusClass = 'current';
                  else if (isMarked) statusClass = 'marked';
                  else if (isAnswered) statusClass = 'answered';
                  else if (visited[q.id]) statusClass = 'visited-no-answer';

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`nav-num-btn ${statusClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="nav-legend">
                <div className="legend-row">
                  <span className="legend-square unvisited"></span> Unvisited
                </div>
                <div className="legend-row">
                  <span className="legend-square visited-no-answer"></span> Visited (No Answer)
                </div>
                <div className="legend-row">
                  <span className="legend-square answered"></span> Answered
                </div>
                <div className="legend-row">
                  <span className="legend-square marked"></span> Marked for Review
                </div>
              </div>
            </aside>

            {/* Center Area: White Question Card */}
            <main className="question-content-area">
              {currentQ ? (
                <>
                  <div className="question-white-card">
                    <div className="question-text-row">
                      <h2>
                        {currentIndex + 1}. {currentQ.text || currentQ.question_txt}
                      </h2>
                      <button
                        type="button"
                        onClick={() =>
                          setMarkedForReview((prev) => ({
                            ...prev,
                            [currentQ.id]: !prev[currentQ.id]
                          }))
                        }
                        className={`btn-mark-review ${markedForReview[currentQ.id] ? 'active' : ''}`}
                      >
                        ⭐ {markedForReview[currentQ.id] ? 'Marked' : 'Mark for Review'}
                      </button>
                    </div>

                    {/* Options (Purple Theme on Selection) */}
                    <div className="quiz-options-list">
                      {(currentQ.options || []).map((opt) => (
                        <label
                          key={opt.id}
                          className={`option-row ${answers[currentQ.id] === opt.id ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`q_${currentQ.id}`}
                            value={opt.id}
                            checked={answers[currentQ.id] === opt.id}
                            onChange={() => setAnswers({ ...answers, [currentQ.id]: opt.id })}
                          />
                          <span className="option-text">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Previous / Next / Submit Controls */}
                  <div className="question-action-bar">
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="btn-outline-prev"
                    >
                      ← Previous
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="btn-purple-next"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuizSubmit(false)}
                        disabled={isSubmitting}
                        className="btn-purple-next"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p>Loading question...</p>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Violation Alert Modal */}
      {activeViolationModal && (
        <div className="modal-backdrop">
          <div className="violation-box">
            <h3 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>⚠️ Violation Detected</h3>
            <p><strong>Reason:</strong> {activeViolationModal.reason}</p>
            <p style={{ color: activeViolationModal.count >= 2 ? '#ef4444' : '#6b46c1' }}>
              Strike: <strong>{activeViolationModal.count} / 3</strong>
            </p>
            {activeViolationModal.snapshot && (
              <img
                src={activeViolationModal.snapshot}
                alt="Violation snapshot"
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            )}
            <br />
            {activeViolationModal.count < 3 ? (
              <button
                onClick={() => setActiveViolationModal(null)}
                className="btn-purple-action"
                style={{ marginTop: '12px', padding: '10px 20px' }}
              >
                Acknowledge & Continue
              </button>
            ) : (
              <p style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '12px' }}>Auto-submitting test...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}