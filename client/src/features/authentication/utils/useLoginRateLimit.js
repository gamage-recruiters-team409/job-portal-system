import { useState, useEffect, useRef } from 'react';

/** Maximum consecutive invalid-credential (401) failures before the local cooldown kicks in. */
const FAILURE_THRESHOLD = 3;

/** Duration of the local cooldown window in seconds. */
const DEFAULT_COOLDOWN_SECONDS = 30;

/**
 * @file useLoginRateLimit.js
 * @description Frontend login rate-limiting UX hook.
 *
 * Provides responsive feedback for login rate limiting and rapid submission cooldown:
 * 1. Synchronizes with server-side 429 Too Many Requests responses and respects
 *    the standard `Retry-After` header.
 * 2. Provides a client-side UX cooldown when consecutive invalid credential (401)
 *    failures reach FAILURE_THRESHOLD.
 * 3. Safely ignores network errors, 5xx server errors, and 403 account-state failures
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
export default function useLoginRateLimit() {
  const failureCountRef = useRef(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [lockReason, setLockReason] = useState(null);
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
  }

  function recordFailure(error) {
    // 1. If the server explicitly returns 429 Too Many Requests, drive the timer from backend metadata
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
      setLockReason('rate_limit');
      setSecondsLeft(waitSeconds);
      failureCountRef.current = 0;
      return;
    }

    // 2. Only count specific invalid-credential responses (HTTP 401).
    // Network errors (ERR_NETWORK), server 5xx, or account-state errors (403 unverified/suspended)
    // are strictly ignored and will not count toward the lockout.
    if (error?.response?.status === 401) {
      failureCountRef.current += 1;
      if (failureCountRef.current >= FAILURE_THRESHOLD) {
        setLockReason('cooldown');
        setSecondsLeft(DEFAULT_COOLDOWN_SECONDS);
        failureCountRef.current = 0; // Reset counter for the next window
      }
    }
  }

  return { isLocked, secondsLeft, lockReason, recordSuccess, recordFailure };
}
