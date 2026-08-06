import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || '';

// Fail fast on a missing/placeholder signing secret rather than silently
// issuing unsigned tokens. The real value lives in gitignored `server/.env`.
if (!jwtSecret || jwtSecret === 'replace_with_a_strong_local_secret') {
  throw new Error(
    'JWT_SECRET is required. Set a strong secret in server/.env (see server/.env.example).'
  );
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  emailVerificationExpiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h',
  resetPasswordExpiresIn: process.env.RESET_PASSWORD_EXPIRES_IN || '30m',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  // Brevo SMTP — used by the email service; optional in development.
  brevoHost: process.env.BREVO_HOST || '',
  brevoPort: Number(process.env.BREVO_PORT) || 587,
  brevoUser: process.env.BREVO_USER || '',
  brevoPassword: process.env.BREVO_PASSWORD || '',
  emailFromName: process.env.EMAIL_FROM_NAME || 'Gamage Recruiters',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || 'no-reply@gamagerecruiters.local',
});
