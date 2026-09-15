import { io } from 'socket.io-client';
import { authStorage } from '../config/authStorage.js';

// Derive the Socket.IO server URL from the same base URL apiClient uses,
// stripping the '/api/v1' suffix — Socket.IO connects to the server's
// root, not to a REST API path.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

let socket = null;

/**
 * Creates (or returns the existing) authenticated real-time connection.
 * Reuses the exact same session token apiClient already attaches to every
 * REST request — no separate login step needed for real-time.
 */
export function connectSocket() {
  if (socket) return socket;

  const token = authStorage.getToken();
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    withCredentials: true,
  });

  return socket;
}

/**
 * Closes the real-time connection. Called on logout so a signed-out
 * session doesn't keep an authenticated socket open in the background.
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
