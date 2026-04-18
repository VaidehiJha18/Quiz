import { useState, useEffect, useRef, useCallback } from 'react';

export function useQuizTimer(timeLimitMinutes, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const hasEndedRef = useRef(false);
  
  // Use a ref for the callback to prevent the effect from re-running
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const start = useCallback(() => setIsRunning(true), []);
  const stop  = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          if (!hasEndedRef.current) {
            hasEndedRef.current = true;
            if (onTimeUpRef.current) onTimeUpRef.current(); 
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]); // Remove onTimeUp from here to stop the loop

  const minutes  = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds  = String(timeLeft % 60).padStart(2, '0');
  const isUrgent  = timeLeft <= 60;
  const isWarning = timeLeft <= 300;

  return { display: `${minutes}:${seconds}`, isUrgent, isWarning, start, stop };
}

// Keep only ONE export style to avoid confusion
export default useQuizTimer;