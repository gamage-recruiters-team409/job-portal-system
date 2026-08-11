import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { durationToHuman } from '../utils/duration.js';

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
    `This link expires in ${durationToHuman(env.resetPasswordExpiresIn)}. If you did not request a reset, you can ignore this email.`,
  ].join('\n');

  await sendMail({
    to,
    subject: 'Reset your password — Gamage Recruiters',
    text,
    html: text.replace(/\n/g, '<br/>'),
  });
}

/**
 * Notify a job seeker that their application was successfully submitted.
 * @param {string} to recipient address
 * @param {string} jobTitle title of the job applied to
 */
export async function sendApplicationSubmittedEmail(to, jobTitle) {
  const text = [
    `Your application for "${jobTitle}" has been submitted successfully.`,
    '',
    'You can track your application status from your dashboard.',
    '',
    'Thank you for using Gamage Recruiters.',
  ].join('\n');

  await sendMail({
    to,
    subject: `Application submitted — ${jobTitle}`,
    text,
    html: text.replace(/\n/g, '<br/>'),
  });
}

/**
 * Notify an employer that a new application was received for their job.
 * @param {string} to recipient address (employer)
 * @param {string} jobTitle title of the job
 * @param {string} applicantName name of the applicant
 */
export async function sendNewApplicationEmail(to, jobTitle, applicantName) {
  const text = [
    `You have received a new application for "${jobTitle}" from ${applicantName}.`,
    '',
    'Log in to your employer dashboard to review the application.',
  ].join('\n');

  await sendMail({
    to,
    subject: `New application received — ${jobTitle}`,
    text,
    html: text.replace(/\n/g, '<br/>'),
  });
}

/**
 * Notify a job seeker that their application status has changed.
 * @param {string} to recipient address
 * @param {string} jobTitle title of the job
 * @param {string} newStatus the new application status
 */
export async function sendApplicationStatusChangeEmail(to, jobTitle, newStatus) {
  const text = [
    `Your application status for "${jobTitle}" has been updated to: ${newStatus}.`,
    '',
    'Log in to your dashboard to view the full details.',
  ].join('\n');

  await sendMail({
    to,
    subject: `Application status updated — ${jobTitle}`,
    text,
    html: text.replace(/\n/g, '<br/>'),
  });
}
