import rateLimit from "express-rate-limit";

export const supportSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 requests per IP
  message: {
    success: false,
    message: "Too many support requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});