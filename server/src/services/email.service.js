import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Whether real SMTP credentials are configured. In development the server may
 * run without them, in which case messages are logged instead of sent so the
 * verification flow can be exercised end-to-end locally.
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
 * Send an email. Falls back to logging the rendered message (including any
 * link) to the console when no SMTP credentials are configured.
 */
async function sendMail({ to, subject, html, text }) {
  const payload = {
    from: `"${env.emailFromName}" <${env.emailFromAddress}>`,
    to,
    subject,
    text,
    html,
  };

  if (!transporter) {
    console.log(`\n[dev-email] To: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return;
  }

  await transporter.sendMail(payload);
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
