import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { USER_ROLES, ACCOUNT_STATUSES } from '../constants/statuses.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.JOB_SEEKER,
    },
    accountStatus: {
      type: String,
      enum: Object.values(ACCOUNT_STATUSES),
      default: ACCOUNT_STATUSES.ACTIVE,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Password-reset state. We store only a hash of the one-time token (never
    // the raw token), plus an expiry. Each new reset request overwrites these,
    // so a previously issued link is invalidated the moment a newer one is made.
    // These are internal-only fields: excluded from normal queries and from
    // serialized User responses (see the toJSON transform below).
    resetPasswordTokenHash: {
      type: String,
      select: false,
    },
    resetPasswordTokenExpires: {
      type: Date,
      select: false,
    },
    // Bumped on password reset. Embedded in auth JWTs so any session issued
    // before a password change is rejected by the protect middleware. Also
    // excluded from normal queries; login/protect select it explicitly.
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.resetPasswordTokenHash;
        delete ret.resetPasswordTokenExpires;
        delete ret.tokenVersion;
        return ret;
      },
    },
  }
);

// Hash the password before saving (skip when unchanged/not modified).
// Mongoose 9 awaits async middleware — no `next` callback is passed.
userSchema.pre('save', async function preSave() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.generateAuthToken = function generateAuthToken() {
  return jwt.sign(
    { id: this._id, role: this.role, tokenVersion: this.tokenVersion },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const User = mongoose.model('User', userSchema);

export default User;
