import { useEffect } from 'react';
import { useQuizTimer } from '../hooks/useQuizTimer';

export default function QuizTimer({ timeLimitMinutes, onTimeUp }) {
  const { display, isUrgent, isWarning, start } = useQuizTimer(
    timeLimitMinutes,
    onTimeUp
  );

  // Auto-start the moment this component mounts
  useEffect(() => {
    start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bg     = isUrgent ? '#fee2e2' : isWarning ? '#fef9c3' : '#f0fdf4';
  const border = isUrgent ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e';
  const color  = isUrgent ? '#dc2626' : isWarning ? '#92400e' : '#15803d';
  const icon   = isUrgent ? '🔴' : isWarning ? '🟡' : '🟢';

  return (
    <>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 20px',
        borderRadius: '10px',
        fontWeight: '700',
        fontSize: '1.3rem',
        userSelect: 'none',
        transition: 'all 0.4s ease',
        backgroundColor: bg,
        border: `2px solid ${border}`,
        color,
        animation: isUrgent ? 'timerPulse 1s ease-in-out infinite' : 'none',
        fontFamily: 'Poppins, sans-serif',
      }}>
        <span>{icon}</span>
        <span>{display}</span>
        {isUrgent && (
          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#dc2626' }}>
            TIME RUNNING OUT!
          </span>
        )}
      </div>

      <style>{`
        @keyframes timerPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(1.06); }
        }
      `}</style>
    </>
  );
}