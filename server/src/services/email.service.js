import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Whether real SMTP credentials are configured.
 */
const hasSmtpConfig = Boolean(env.brevoHost && env.brevoUser && env.brevoPassword);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.brevoHost,
      port: env.brevoPort,
      secure: env.brevoPort === 465,
      auth: {
        user: env.brevoUser,
        pass: env.brevoPassword,
      },
    })
  : null;

/**
 * Send an email.
 *
 * When SMTP is not configured the rendered message (which includes the
 * verification link + token) is logged to the console in DEVELOPMENT only.
 * In production a missing SMTP configuration raises a controlled error and the
 * message is never logged, so the verification token is not exposed.
 */
async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    if (env.nodeEnv === 'development') {
      console.log(`\n[dev-email] To: ${to}\nSubject: ${subject}\n\n${text}\n`);
      return;
    }
    throw new ApiError(503, 'Email service is not configured. Please try again later.');
  }

  await transporter.sendMail({
    from: `"${env.emailFromName}" <${env.emailFromAddress}>`,
    to,
    subject,
    text,
    html,
  });
}

/**
 * Send an account-verification email containing the verification link.
 * @param {string} to recipient address
 * @param {string} token verification token to embed in the link
 */
export async function sendVerificationEmail(to, token) {
  const url = new URL('/verify-email', env.clientUrl);
  url.searchParams.set('token', token);

  const text = [
    'Welcome to Gamage Recruiters.',
    '',
    'Please verify your email address to activate your account:',
    url.toString(),
    '',
    'This link expires in 24 hours. If you did not create this account, you can ignore this email.',
  ].join('\n');

  await sendMail({
    to,
    subject: 'Verify your email — Gamage Recruiters',
    text,
    html: text.replace(/\n/g, '<br/>'),
  });
}

/**
 * Send a password-reset email containing the reset link.
 * @param {string} to recipient address
 * @param {string} token reset token to embed in the link
 */
export async function sendResetPasswordEmail(to, token) {
  const url = new URL('/reset-password', env.clientUrl);
  url.searchParams.set('token', token);

  const text = [
    'We received a request to reset your Gamage Recruiters password.',
    '',
    'Click the link below to choose a new password:',
    url.toString(),
    '',
    'This link expires in 30 minutes. If you did not request a reset, you can ignore this email.',
  ].join('\n');

  await sendMail({
    to,
    subject: 'Reset your password — Gamage Recruiters',
    text,
    html: text.replace(/\n/g, '<br/>'),
  });
}
