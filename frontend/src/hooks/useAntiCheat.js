import { useEffect, useRef, useCallback, useState } from 'react';


let globalStrikeCount = 0;
let globalCooldown = false;

export default function useAntiCheat(isActive, submitted, onViolation) {
  const [violationsCount, setViolationsCount] = useState(0);
  const [warningModal, setWarningModal] = useState({ open: false, reason: '' });
  const [isFrozen, setIsFrozen] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const countdownRef = useRef(null);
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  // Reset counters when quiz starts
  useEffect(() => {
    if (isActive) {
      globalStrikeCount = 0;
      globalCooldown = false;
    }
  }, [isActive]);

  useEffect(() => () => clearInterval(countdownRef.current), []);

  // 🔒Strike 3: Freeze Screen & Auto-Submit Sequence
  const freezeAndSubmit = useCallback((reason) => {
    if (submitted || !isActive || isFrozen) return;
    setIsFrozen(true);
    setCountdown(3);

    let countTimer = 3;
    countdownRef.current = setInterval(() => {
      countTimer -= 1;
      setCountdown(countTimer);
      if (countTimer <= 0) {
        clearInterval(countdownRef.current);
        if (onViolationRef.current) {
          onViolationRef.current(reason, 3, true);
        }
      }
    }, 1000);
  }, [isActive, submitted, isFrozen]);

  // Core Violation Handler
  const triggerViolation = useCallback((reason) => {
    if (!isActive || submitted || isFrozen || globalCooldown) return;

    // Cooldown lock to prevent tab-switch + blur firing as multiple strikes at once
    globalCooldown = true;
    globalStrikeCount += 1;

    const currentCount = globalStrikeCount;
    setViolationsCount(currentCount);

    console.log(`[AntiCheat] Strike ${currentCount}/3 registered: ${reason}`);

    if (currentCount >= 3) {
      //  STRIKE 3: Terminate Quiz
      setWarningModal({ open: false, reason: '' });
      freezeAndSubmit(reason);
    } else {
      //  STRIKES 1 & 2: Show Warning Modal ONLY (Do NOT submit)
      setWarningModal({ open: true, reason });
    }
  }, [isActive, submitted, isFrozen, freezeAndSubmit]);

  // Dismiss modal and re-request full-screen mode for strikes 1 & 2
  const dismissWarning = () => {
    setWarningModal({ open: false, reason: '' });

    // Request full-screen mode again when student acknowledges warning
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    }

    // Unlock listener 1.5s after clicking button
    setTimeout(() => {
      globalCooldown = false;
    }, 1500);
  };

  // 1. Right Click Block
  useEffect(() => {
    if (!isActive) return;
    const b = (e) => e.preventDefault();
    document.addEventListener('contextmenu', b);
    return () => document.removeEventListener('contextmenu', b);
  }, [isActive]);

  // 2. Keyboard Shortcuts Block (Windows & Mac)
  useEffect(() => {
    if (!isActive) return;
    const block = (e) => {
      const key = e.key?.toUpperCase();
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;

      if (['F12', 'F11', 'META', 'CONTEXTMENU'].includes(key)) {
        e.preventDefault();
        return;
      }

      if (isCmdOrCtrl && ['C', 'V', 'X', 'U', 'S', 'P', 'A', 'F', 'W', 'R', 'T', 'N'].includes(key)) {
        e.preventDefault();
        return;
      }

      if (isCmdOrCtrl && e.shiftKey && ['I', 'J', 'C', 'S', '4', '3', '5'].includes(key)) {
        e.preventDefault();
        return;
      }

      if ((e.altKey && e.key === 'Tab') || (e.metaKey && e.key === 'Tab')) {
        e.preventDefault();
        triggerViolation('alt_tab');
      }
    };

    document.addEventListener('keydown', block);
    return () => document.removeEventListener('keydown', block);
  }, [isActive, triggerViolation]);

  // 3. Tab Switch / Window Blur Detection
  useEffect(() => {
    if (!isActive) return;
    const handleVisibility = () => {
      if (document.hidden) {
        triggerViolation('tab_switch');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isActive, triggerViolation]);

  // 4. Block Copy/Cut/Select
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

  // Overlays UI
  const AntiCheatOverlays = () => {
    return (
      <>
        <style>{`
          ${isFrozen ? 'body { overflow: hidden !important; }' : ''}
          @keyframes pulse {
            0%   { box-shadow: 0 0 0 0px rgba(192,57,43,0.5); }
            70%  { box-shadow: 0 0 0 18px rgba(192,57,43,0); }
            100% { box-shadow: 0 0 0 0px rgba(192,57,43,0); }
          }
        `}</style>

        {/* Warning Modal (Strikes 1 & 2) */}
        {warningModal.open && !isFrozen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 99998,
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff', borderRadius: '12px', padding: '28px',
              textAlign: 'center', maxWidth: '400px', width: '90%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>⚠️</div>
              <h3 style={{ color: '#e67e22', margin: '0 0 8px', fontSize: '20px' }}>
                Violation Warning ({violationsCount}/3)
              </h3>
              <p style={{ color: '#444', fontSize: '14px', margin: '0 0 18px', lineHeight: 1.5 }}>
                A policy violation was detected: <strong>{warningModal.reason.replace('_', ' ')}</strong>.
                <br /><br />
                You have <strong>{3 - violationsCount}</strong> warning(s) left. Clicking below will return you to full-screen mode. Reaching 3 violations will terminate your quiz.
              </p>
              <button 
                onClick={dismissWarning}
                style={{
                  background: '#e67e22', color: '#fff', border: 'none',
                  padding: '12px 24px', borderRadius: '6px', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer', width: '100%'
                }}
              >
                I Understand & Re-enter Fullscreen
              </button>
            </div>
          </div>
        )}

        {/* Freeze Modal (Strike 3) */}
        {isFrozen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'not-allowed', userSelect: 'none',
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔒</div>
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '36px 44px',
              textAlign: 'center', maxWidth: '400px', width: '90%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}>
              <h2 style={{ color: '#c0392b', margin: '0 0 10px', fontSize: '22px' }}>
                Quiz Terminated
              </h2>
              <p style={{ color: '#666', fontSize: '15px', margin: '0 0 24px', lineHeight: 1.6 }}>
                You reached 3 violations.<br />
                Your quiz is being auto-submitted.
              </p>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: '#c0392b', color: '#fff', fontSize: '38px',
                fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', animation: 'pulse 1s ease-out infinite',
              }}>
                {countdown}
              </div>
              <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
                Submitting in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  return { AntiCheatOverlays, violationsCount };
}