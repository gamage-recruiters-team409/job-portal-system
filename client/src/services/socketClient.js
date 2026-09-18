import { io } from 'socket.io-client';
import { authStorage } from '../config/authStorage.js';

// Derive the Socket.IO server URL from the same base URL apiClient uses,
// stripping the '/api/v1' suffix — Socket.IO connects to the server's
// root, not to a REST API path.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

let socket = null;
let socketToken = null;

/**
 * Creates (or returns the existing) authenticated real-time connection.
 * Reuses the exact same session token apiClient already attaches to every
 * REST request — no separate login step needed for real-time.
 *
 * Critically: a socket is only ever reused if it was authenticated with
 * the SAME token as the current session. If the token has changed (a
 * different user logged in, or the previous user logged out and a new
 * one logged in without a full page reload), the stale socket is torn
 * down and a fresh, correctly-authenticated one is created — this
 * prevents one user's session from ever ending up listening on a
 * socket/room that belongs to a different user.
 */
export function connectSocket() {
  const token = authStorage.getToken();

  if (!token) {
    disconnectSocket();
    return null;
  }

  if (socket && socketToken === token) {
    return socket;
  }

  // Either no socket exists yet, or the existing one was authenticated
  // with a different token than the current session — reset first.
  disconnectSocket();

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
  });
  socketToken = token;

  return socket;
}

/**
 * Closes the real-time connection. Called on logout, and internally
 * whenever connectSocket() detects a token mismatch, so a stale or
 * signed-out session never keeps an authenticated socket open.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socketToken = null;
}
