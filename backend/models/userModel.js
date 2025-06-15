// enhancements/models/userModel.js

/**
 * userModel.js
 *
 * GEH-Compliant User Model
 * Supports JWT auth, tier-based AI access, session logging, PDF expiry, and monetization enforcement.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    planTier: {
      type: String,
      enum: ['free', 'starter', 'official', 'family'],
      default: 'free',
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    formUsed: {
      type: Number,
      default: 0,
    },
    promptsUsed: {
      type: Number,
      default: 0,
    },
    extraPrompts: {
      type: Number,
      default: 0
    },
    planActivatedAt: {
      type: Date,
      default: Date.now,
    },
    hasUsedFreeForm: {
      type: Boolean,
      default: false
    },
    paymentConfirmed: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    jwtVersion: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'hi', 'zh', 'fr', 'pt', 'tl', 'uk', 'ar'],
    },
    manualFlags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Validate password
UserSchema.methods.isPasswordValid = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);
