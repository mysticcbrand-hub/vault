import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Workout Timer ────────────────────────────────────────────────────────────
// Source of truth: the START timestamp, not a counter.
// Survives screen lock, tab switch, and page refresh.

export function useWorkoutTimer() {
  const startTsRef = useRef(null);
  const [elapsed, setElapsed] = useState(0); // seconds
  const workerRef = useRef(null);
  const wakeLockRef = useRef(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (e) { /* not supported — fail silently */ }
  };

  const releaseWakeLock = () => {
    try { wakeLockRef.current?.release(); } catch (e) {}
    wakeLockRef.current = null;
  };

  const terminateWorker = () => {
    try { workerRef.current?.postMessage({ type: 'STOP' }); } catch (e) {}
    try { workerRef.current?.terminate(); } catch (e) {}
    workerRef.current = null;
  };

  const start = useCallback((existingStartTs = null) => {
    startTsRef.current = existingStartTs ?? Date.now();
    localStorage.setItem('graw_workout_start_ts', String(startTsRef.current));

    terminateWorker();

    workerRef.current = new Worker(
      new URL('../workers/timer.worker.js', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = ({ data }) => {
      if (data.type === 'TICK') {
        const secs = Math.floor((Date.now() - startTsRef.current) / 1000);
        setElapsed(secs);
      }
    };

    workerRef.current.postMessage({ type: 'START' });
    requestWakeLock();
  }, []);

  const stop = useCallback(() => {
    terminateWorker();
    startTsRef.current = null;
    localStorage.removeItem('graw_workout_start_ts');
    releaseWakeLock();
    setElapsed(0);
  }, []);

  // Resync immediately on tab/screen return — eliminates drift
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && startTsRef.current) {
        const secs = Math.floor((Date.now() - startTsRef.current) / 1000);
        setElapsed(secs);
        // Re-acquire wake lock (iOS releases it on hide)
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Recover from page refresh during active workout
  useEffect(() => {
    const savedTs = localStorage.getItem('graw_workout_start_ts');
    if (savedTs && !startTsRef.current) {
      start(Number(savedTs));
    }
    return () => {
      terminateWorker();
      releaseWakeLock();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { elapsed, start, stop };
}

// ─── Rest Timer ───────────────────────────────────────────────────────────────
// Countdown from a target duration.
// Source of truth: absolute end timestamp — not a decrementing counter.

export function useRestTimer() {
  const endTsRef = useRef(null);
  const totalRef = useRef(120);
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(120);
  const [isActive, setIsActive] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const workerRef = useRef(null);

  const terminateWorker = () => {
    try { workerRef.current?.postMessage({ type: 'STOP' }); } catch (e) {}
    try { workerRef.current?.terminate(); } catch (e) {}
    workerRef.current = null;
  };

  const skip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      terminateWorker();
      endTsRef.current = null;
      setRemaining(0);
      setIsActive(false);
      setIsExiting(false);
    }, 240);
  }, []);

  const start = useCallback((seconds) => {
    endTsRef.current = Date.now() + seconds * 1000;
    totalRef.current = seconds;
    setTotal(seconds);
    setRemaining(seconds);
    setIsActive(true);
    setIsExiting(false);

    terminateWorker();

    workerRef.current = new Worker(
      new URL('../workers/timer.worker.js', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = ({ data }) => {
      if (data.type === 'TICK' && endTsRef.current) {
        const rem = Math.max(0, Math.ceil((endTsRef.current - Date.now()) / 1000));
        setRemaining(rem);
        if (rem <= 0) {
          terminateWorker();
          try { navigator.vibrate([200, 100, 200]); } catch (e) {}
          // Flash then exit
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
              endTsRef.current = null;
              setIsActive(false);
              setIsExiting(false);
            }, 240);
          }, 600);
        }
      }
    };

    workerRef.current.postMessage({ type: 'START' });
  }, []);

  const addSeconds = useCallback((secs) => {
    if (!endTsRef.current) return;
    endTsRef.current += secs * 1000;
    const rem = Math.max(0, Math.ceil((endTsRef.current - Date.now()) / 1000));
    setRemaining(rem);
    const newTotal = totalRef.current + secs;
    totalRef.current = newTotal;
    setTotal(newTotal);
    try { navigator.vibrate(8); } catch (e) {}
  }, []);

  // Resync on tab return
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && endTsRef.current) {
        const rem = Math.max(0, Math.ceil((endTsRef.current - Date.now()) / 1000));
        setRemaining(rem);
        if (rem <= 0) skip();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      terminateWorker();
    };
  }, [skip]);

  return { remaining, total, isActive, isExiting, start, addSeconds, skip };
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function formatElapsed(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
