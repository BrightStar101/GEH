// models/PromptLog.js

/**
 * PromptLog.js
 *
 * Mongoose model to log GPT prompt interactions per user in the Global Entry Hub (GEH) platform.
 *
 * This schema supports:
 * - Token usage tracking
 * - Support vs form prompt categorization
 * - Per-form analytics
 * - Tier-based enforcement of prompt and token limits
 *
 * Compliant with GEH standards: full schema validation, production-depth, extensible for future logging layers.
 */

const mongoose = require('mongoose');

const validPurposes = ['support', 'form', 'system'];

const promptLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    formType: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: validPurposes,
      required: true,
      default: 'support',
    },
    promptContent: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    tokenCount: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
    },
    gptModel: {
      type: String,
      required: true,
      enum: ['gpt-3.5-turbo', 'gpt-4o'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    userTierAtTime: {
      type: String,
      enum: ['free', 'starter', 'official', 'family'],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for performance: frequently queried by userId + purpose
promptLogSchema.index({ userId: 1, purpose: 1, formType: 1 });

module.exports = mongoose.model('PromptLog', promptLogSchema);
