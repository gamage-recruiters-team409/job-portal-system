import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { ACCOUNT_STATUSES } from '../constants/statuses.js';

let io;

// How often an already-connected socket re-checks that its session is
// still valid (account active, email verified, tokenVersion unchanged).
// 5 minutes bounds how long a revoked session could keep receiving
// private notifications after being invalidated elsewhere.
const REVALIDATION_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Creates the Socket.IO server on top of the existing HTTP server, and
 * authenticates each connection using the SAME rules as the `protect`
 * REST middleware (valid JWT, active account, verified email, matching
 * tokenVersion). A connection that fails any of these is rejected before
 * it ever completes — it never reaches a connected state.
 *
 * Each authenticated socket joins a private room named after its user's
 * ID, so a notification can only ever be pushed to the one user it
 * belongs to — this server never broadcasts to all connected clients.
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Not authorized.'));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, env.jwtSecret);
      } catch {
        return next(new Error('Session expired or invalid.'));
      }

      const user = await User.findById(decoded.id).select('+tokenVersion');
      if (!user) {
        return next(new Error('The user for this session no longer exists.'));
      }
      if (user.accountStatus !== ACCOUNT_STATUSES.ACTIVE) {
        return next(new Error('This account is not active.'));
      }
      if (!user.emailVerified) {
        return next(new Error('Please verify your email before continuing.'));
      }
      if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
        return next(new Error('Your session has expired.'));
      }

      socket.userId = String(user._id);
      return next();
    } catch (error) {
      return next(error);
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    // The io.use() middleware above only validates once, at handshake
    // time. Since this is a long-lived connection carrying private
    // notification data, it needs to keep re-checking the SAME rules
    // the REST API enforces on every request — otherwise a revoked
    // session (password reset, account suspended, tokenVersion bumped)
    // could keep receiving private data indefinitely after a REST call
    // would have correctly rejected it.
    const revalidationInterval = setInterval(async () => {
      try {
        const user = await User.findById(socket.userId).select('+tokenVersion');
        const stillValid =
          user &&
          user.accountStatus === ACCOUNT_STATUSES.ACTIVE &&
          user.emailVerified &&
          (socket.tokenVersion ?? 0) === (user.tokenVersion ?? 0);

        if (!stillValid) {
          socket.disconnect(true);
        }
      } catch (error) {
        console.error('Socket re-validation failed:', error.message);
        socket.disconnect(true);
      }
    }, REVALIDATION_INTERVAL_MS);

    socket.on('disconnect', () => {
      clearInterval(revalidationInterval);
    });
  });

  return io;
}

/**
 * Pushes a real-time event to a single user's room. Safe to call even if
 * the user has no active socket connection — Socket.IO simply delivers
 * to zero listeners in that case, this never throws.
 */
export function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}
