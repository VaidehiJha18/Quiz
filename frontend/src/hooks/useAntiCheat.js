import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * useAntiCheat
 * Returns { FreezeOverlay } — render this at the TOP of your QuizPage JSX.
 * On 3rd violation: screen visually freezes + blurs, countdown shows, then auto-submits.
 */
export default function useAntiCheat(isActive, submitted, onViolation) {
  const violationCount = useRef(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const countdownRef = useRef(null);

  // Cleanup interval on unmount
  useEffect(() => () => clearInterval(countdownRef.current), []);

  // Freeze screen + start countdown then call onViolation
  const freezeAndSubmit = useCallback((reason) => {
    if (submitted || !isActive || isFrozen) return;
    setIsFrozen(true);
    setCountdown(3);
    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current);
        onViolation(reason);
      }
    }, 1000);
  }, [isActive, submitted, isFrozen, onViolation]);

  // 3-strike system
  const handleViolation = useCallback((reason) => {
    if (submitted || !isActive || isFrozen) return;
    violationCount.current += 1;
    if (violationCount.current >= 3) {
      freezeAndSubmit(reason);
    } else {
      const left = 3 - violationCount.current;
      alert(`Warning ${violationCount.current}/2: Stay on the quiz!\n${left} warning(s) left before auto-submit.`);
    }
  }, [isActive, submitted, isFrozen, freezeAndSubmit]);

  // 1. Block right-click
  useEffect(() => {
    if (!isActive) return;
    const b = (e) => e.preventDefault();
    document.addEventListener('contextmenu', b);
    return () => document.removeEventListener('contextmenu', b);
  }, [isActive]);

  // 2. Block keyboard shortcuts
  useEffect(() => {
    if (!isActive) return;
    const block = (e) => {
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey || e.metaKey) {
        if (['C','V','X','U','S','P','A','F'].includes(e.key?.toUpperCase())) { e.preventDefault(); return; }
        if (e.shiftKey && ['I','J','C'].includes(e.key?.toUpperCase())) { e.preventDefault(); return; }
      }
      if (e.altKey && e.key === 'Tab') { e.preventDefault(); handleViolation('alt_tab'); }
    };
    document.addEventListener('keydown', block);
    return () => document.removeEventListener('keydown', block);
  }, [isActive, handleViolation]);

  // 3. Tab switch
  useEffect(() => {
    if (!isActive) return;
    const fn = () => { if (document.hidden) handleViolation('tab_switch'); };
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, [isActive, handleViolation]);

  // 4. Window blur
  useEffect(() => {
    if (!isActive) return;
    const fn = () => handleViolation('window_blur');
    window.addEventListener('blur', fn);
    return () => window.removeEventListener('blur', fn);
  }, [isActive, handleViolation]);

  // 5. Fullscreen exit
  useEffect(() => {
    if (!isActive) return;
    const fn = () => { if (!document.fullscreenElement) handleViolation('exit_fullscreen'); };
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, [isActive, handleViolation]);

  // 6. Block copy/select
  useEffect(() => {
    if (!isActive) return;
    const b = (e) => e.preventDefault();
    document.addEventListener('copy', b);
    document.addEventListener('cut', b);
    document.addEventListener('selectstart', b);
    return () => {
      document.removeEventListener('copy', b);
      document.removeEventListener('cut', b);
      document.removeEventListener('selectstart', b);
    };
  }, [isActive]);

  // 7. Block page close
  useEffect(() => {
    if (!isActive || submitted) return;
    const fn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', fn);
    return () => window.removeEventListener('beforeunload', fn);
  }, [isActive, submitted]);

  // The freeze overlay — render this in your JSX
  const FreezeOverlay = () => {
    if (!isFrozen) return null;
    return (
      <>
        <style>{`
          body { overflow: hidden !important; }
          @keyframes pulse {
            0%   { box-shadow: 0 0 0 0px rgba(192,57,43,0.5); }
            70%  { box-shadow: 0 0 0 18px rgba(192,57,43,0); }
            100% { box-shadow: 0 0 0 0px rgba(192,57,43,0); }
          }
        `}</style>

        {/* Full-screen dark blur overlay */}
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: 'rgba(0,0,0,0.78)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'not-allowed',
          userSelect: 'none',
        }}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔒</div>

          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '36px 44px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <h2 style={{ color: '#c0392b', margin: '0 0 10px', fontSize: '22px' }}>
              Screen Frozen
            </h2>
            <p style={{ color: '#666', fontSize: '15px', margin: '0 0 24px', lineHeight: 1.6 }}>
              You left the quiz window too many times.<br />
              Your quiz is being auto-submitted.
            </p>

            {/* Pulsing countdown circle */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#c0392b',
              color: '#fff',
              fontSize: '38px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              animation: 'pulse 1s ease-out infinite',
            }}>
              {countdown}
            </div>

            <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
              Submitting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        </div>
      </>
    );
  };

  
  return { FreezeOverlay };
}
