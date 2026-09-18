import { useState, useEffect, useRef } from 'react';

/** Maximum consecutive failures before the lockout kicks in. */
const FAILURE_THRESHOLD = 3;

/** Duration of the lockout window in seconds. */
const LOCKOUT_SECONDS = 30;

/**
 * @file useLoginRateLimit.js
 * @description Frontend-only login rate-limiting hook.
 *
 * Tracks consecutive failed sign-in attempts within a single page session.
 * After FAILURE_THRESHOLD consecutive failures the submit button is locked for
 * LOCKOUT_SECONDS seconds, displaying a countdown timer to the user.
 *
 * This is a UX-layer deterrent against automated brute-force attempts. It does
 * not replace server-side rate limiting. The lock resets on page reload because
 * no persistent storage is used — intentional by design.
 *
 * @returns {{
 *   isLocked: boolean,
 *   secondsLeft: number,
 *   recordSuccess: () => void,
 *   recordFailure: () => void,
 * }}
 */
export default function useLoginRateLimit() {
  const failureCountRef = useRef(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
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
  }

  function recordFailure() {
    failureCountRef.current += 1;
    if (failureCountRef.current >= FAILURE_THRESHOLD) {
      setSecondsLeft(LOCKOUT_SECONDS);
      failureCountRef.current = 0; // reset counter so the next window starts fresh after lockout
    }
  }

  return { isLocked, secondsLeft, recordSuccess, recordFailure };
}
