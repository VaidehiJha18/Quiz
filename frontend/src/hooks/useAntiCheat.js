
//vaidehi
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

export default function useAntiCheat(isQuizStarted, submitted, onViolationUpdate, quizId) {
  const [violationCount, setViolationCount] = useState(0);
  const [currentViolation, setCurrentViolation] = useState(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationError, setCalibrationError] = useState('');

  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const isTerminatedRef = useRef(false);
  const lastGazeAwayRef = useRef(null);
  const viewDimsRef = useRef({ w: window.innerWidth, h: window.innerHeight });

  // 1. Capture snapshot as base64 JPEG from active webcam
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

  // 2. Report Violation to Backend
  const triggerViolation = useCallback(async (reason) => {
    if (isTerminatedRef.current || submitted || !isQuizStarted) return;

    const snapshot = captureSnapshot();
    const nextCount = violationCount + 1;
    setViolationCount(nextCount);

    const isFinalViolation = nextCount >= 3;
    if (isFinalViolation) {
      isTerminatedRef.current = true;
    }

    setCurrentViolation({
      reason: reason.replace(/_/g, ' '),
      snapshot,
      count: nextCount
    });

    try {
      await fetch('/student/api/quiz/violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          violationType: reason,
          snapshot,
          violationCount: nextCount
        })
      });
    } catch (err) {
      console.error('Failed to log violation to server:', err);
    }

    if (onViolationUpdate) {
      onViolationUpdate(reason, nextCount, isFinalViolation);
    }
  }, [submitted, isQuizStarted, captureSnapshot, violationCount, quizId, onViolationUpdate]);

  // 3. Pre-Quiz Face & Camera Calibration
  const calibrateSystem = async () => {
    setCalibrationError('');
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

      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detector = await faceLandmarksDetection.createDetector(model, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true,
        maxFaces: 4
      });

      detectorRef.current = detector;

      // Calibration face check: Must detect exactly 1 person
      const faces = await detector.estimateFaces(videoRef.current);
      if (faces.length === 0) {
        setCalibrationError('No face detected. Please center your face in the camera.');
        return false;
      }
      if (faces.length > 1) {
        setCalibrationError('Multiple faces detected. Only one candidate must be present.');
        return false;
      }

      setIsCalibrated(true);
      return true;
    } catch (err) {
      console.error('Calibration error:', err);
      setCalibrationError('Camera access denied or failed to load detection model.');
      return false;
    }
  };

  // 4. Check if student is looking away from screen
  const checkLookingAway = (keypoints) => {
    const nose = keypoints.find((k) => k.name === 'noseTip') || keypoints[1];
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    if (!nose || !leftEye || !rightEye) return false;

    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
    const midPointX = (leftEye.x + rightEye.x) / 2;
    const horizontalDeviation = (nose.x - midPointX) / eyeDistance;

    return Math.abs(horizontalDeviation) > 0.35;
  };

  // 5. Browser Lockdown Listeners (Tab switch, split screen, window blur, fullscreen)
  useEffect(() => {
    if (!isQuizStarted || submitted) return;

    const handleVisibility = () => {
      if (document.hidden) triggerViolation('TAB_SWITCH_OR_MINIMIZED');
    };

    const handleBlur = () => {
      triggerViolation('WINDOW_FOCUS_LOST');
    };

    const handleResize = () => {
      const dw = Math.abs(window.innerWidth - viewDimsRef.current.w);
      const dh = Math.abs(window.innerHeight - viewDimsRef.current.h);
      if (dw > 120 || dh > 120) {
        triggerViolation('SPLIT_SCREEN_OR_WINDOW_RESIZED');
        viewDimsRef.current = { w: window.innerWidth, h: window.innerHeight };
      }
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        triggerViolation('EXITED_FULLSCREEN');
      }
    };

    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        triggerViolation('DEV_TOOLS_ATTEMPT');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreen);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreen);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isQuizStarted, submitted, triggerViolation]);

  // 6. Real-time Face & Gaze Evaluation Loop
  useEffect(() => {
    if (!isQuizStarted || submitted || !detectorRef.current) return;

    const interval = setInterval(async () => {
      if (isTerminatedRef.current || !videoRef.current) return;

      try {
        const faces = await detectorRef.current.estimateFaces(videoRef.current, { flipHorizontal: false });

        if (faces.length === 0) {
          triggerViolation('NO_FACE_DETECTED');
        } else if (faces.length > 1) {
          triggerViolation('MULTIPLE_FACES_DETECTED');
        } else {
          const lookingAway = checkLookingAway(faces[0].keypoints);
          if (lookingAway) {
            if (!lastGazeAwayRef.current) {
              lastGazeAwayRef.current = Date.now();
            } else if (Date.now() - lastGazeAwayRef.current > 2500) {
              triggerViolation('LOOKING_AWAY_FROM_SCREEN');
              lastGazeAwayRef.current = null;
            }
          } else {
            lastGazeAwayRef.current = null;
          }
        }
      } catch (err) {
        console.error('Proctor loop error:', err);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [isQuizStarted, submitted, triggerViolation]);

  // 7. Student Overlays (Camera and Violation Dialog)
  const AntiCheatOverlays = () => (
    <>
      {/* Floating webcam view */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '180px',
        background: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 9999,
        textAlign: 'center'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '135px', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
        <div style={{ color: '#fff', fontSize: '11px', padding: '4px', fontWeight: 'bold' }}>
          <span style={{ color: '#ff4d4f', marginRight: '4px' }}>●</span> PROCTOR ACTIVE
        </div>
      </div>

      {/* Real-time violation alert modal */}
      {currentViolation && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '10px',
            padding: '24px',
            maxWidth: '420px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: '#d9534f', margin: '0 0 10px 0' }}>⚠️ Violation Detected</h3>
            <p style={{ margin: '8px 0', fontSize: '15px' }}>
              <strong>Reason:</strong> {currentViolation.reason}
            </p>
            <p style={{ margin: '8px 0', color: currentViolation.count >= 2 ? '#d9534f' : '#666' }}>
              Violation Strike: <strong>{currentViolation.count} / 3</strong>
              <br />
              <small>(Reaching 3 strikes will auto-submit your test)</small>
            </p>

            {currentViolation.snapshot && (
              <div style={{ margin: '15px 0' }}>
                <p style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>Captured Evidence:</p>
                <img
                  src={currentViolation.snapshot}
                  alt="Violation Snapshot"
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }}
                />
              </div>
            )}

            {currentViolation.count < 3 ? (
              <button
                onClick={() => setCurrentViolation(null)}
                style={{
                  background: '#1890ff',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginTop: '10px'
                }}
              >
                Acknowledge & Continue
              </button>
            ) : (
              <p style={{ color: '#d9534f', fontWeight: 'bold' }}>Auto-submitting test...</p>
            )}
          </div>
        </div>
      )}
    </>
  );

  return {
    AntiCheatOverlays,
    calibrateSystem,
    isCalibrated,
    calibrationError,
    violationCount
  };
}