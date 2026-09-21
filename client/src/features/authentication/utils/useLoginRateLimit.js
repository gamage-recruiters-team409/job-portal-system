import { useState, useEffect, useRef } from 'react';

/** Maximum consecutive invalid-credential (401) failures before the local cooldown kicks in. */
const FAILURE_THRESHOLD = 3;

/** Duration of the local cooldown window in seconds. */
const DEFAULT_COOLDOWN_SECONDS = 30;

/** sessionStorage keys */
const SS_EXPIRY_KEY = 'login_lockout_expiry';
const SS_REASON_KEY = 'login_lockout_reason';
const SS_COUNT_KEY = 'login_failure_count';

/**
 * @file useLoginRateLimit.js
 * @description Frontend login rate-limiting UX hook.
 *
 * Provides responsive feedback for login rate limiting and rapid submission cooldown:
 * 1. Synchronizes with server-side 429 Too Many Requests responses and respects
 *    the standard `Retry-After` header.
 * 2. Provides a client-side UX cooldown when consecutive invalid credential (401)
 *    failures reach FAILURE_THRESHOLD.
 * 3. Persists the lockout expiry timestamp in sessionStorage so the countdown
 *    survives browser refreshes within the same tab session.
 * 4. Safely ignores network errors, 5xx server errors, and 403 account-state failures
 *    (e.g., unverified email or suspended accounts) so they do not falsely trigger lockouts.
 *
 * @returns {{
 *   isLocked: boolean,
 *   secondsLeft: number,
 *   lockReason: 'rate_limit' | 'cooldown' | null,
 *   recordSuccess: () => void,
 *   recordFailure: (error: any) => void,
 * }}
 */

function readStoredLockout() {
  try {
    const expiry = parseInt(sessionStorage.getItem(SS_EXPIRY_KEY), 10);
    const reason = sessionStorage.getItem(SS_REASON_KEY);
    const count = parseInt(sessionStorage.getItem(SS_COUNT_KEY), 10) || 0;
    if (expiry && expiry > Date.now()) {
      return { secondsLeft: Math.ceil((expiry - Date.now()) / 1000), reason, count };
    }
  } catch {
    // sessionStorage unavailable (e.g., private browsing restrictions) — degrade gracefully.
  }
  return { secondsLeft: 0, reason: null, count: 0 };
}

function writeLockout(durationSeconds, reason) {
  try {
    sessionStorage.setItem(SS_EXPIRY_KEY, String(Date.now() + durationSeconds * 1000));
    sessionStorage.setItem(SS_REASON_KEY, reason);
  } catch {
    // Ignore storage errors.
  }
}

function clearLockout() {
  try {
    sessionStorage.removeItem(SS_EXPIRY_KEY);
    sessionStorage.removeItem(SS_REASON_KEY);
    sessionStorage.removeItem(SS_COUNT_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function writeCount(count) {
  try {
    sessionStorage.setItem(SS_COUNT_KEY, String(count));
  } catch {
    // Ignore storage errors.
  }
}

export default function useLoginRateLimit() {
  const stored = readStoredLockout();
  const failureCountRef = useRef(stored.count);
  const [secondsLeft, setSecondsLeft] = useState(stored.secondsLeft);
  const [lockReason, setLockReason] = useState(stored.reason);
  const intervalRef = useRef(null);

  const isLocked = secondsLeft > 0;

  // Start or clear the countdown whenever the lock status flips.
  useEffect(() => {
    if (secondsLeft <= 0) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setLockReason(null);
          clearLockout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked]);

  function recordSuccess() {
    clearInterval(intervalRef.current);
    failureCountRef.current = 0;
    setSecondsLeft(0);
    setLockReason(null);
    clearLockout();
  }

  function recordFailure(error) {
    // 1. If the server explicitly returns 429 Too Many Requests, drive the timer from backend metadata.
    if (error?.response?.status === 429) {
      let waitSeconds = DEFAULT_COOLDOWN_SECONDS;
      const retryAfterHeader =
        error.response.headers?.['retry-after'] || error.response.headers?.['Retry-After'];
      if (retryAfterHeader) {
        const parsed = parseInt(retryAfterHeader, 10);
        if (!isNaN(parsed) && parsed > 0) {
          waitSeconds = parsed;
        }
      }
      writeLockout(waitSeconds, 'rate_limit');
      setLockReason('rate_limit');
      setSecondsLeft(waitSeconds);
      failureCountRef.current = 0;
      writeCount(0);
      return;
    }

    // 2. Only count specific invalid-credential responses (HTTP 401).
    // Network errors (ERR_NETWORK), server 5xx, or account-state errors (403 unverified/suspended)
    // are strictly ignored and will not count toward the lockout.
    if (error?.response?.status === 401) {
      failureCountRef.current += 1;
      writeCount(failureCountRef.current);
      if (failureCountRef.current >= FAILURE_THRESHOLD) {
        writeLockout(DEFAULT_COOLDOWN_SECONDS, 'cooldown');
        setLockReason('cooldown');
        setSecondsLeft(DEFAULT_COOLDOWN_SECONDS);
        failureCountRef.current = 0;
        writeCount(0);
      }
    }
  }

  return { isLocked, secondsLeft, lockReason, recordSuccess, recordFailure };
}
