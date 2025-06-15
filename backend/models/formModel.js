/**
 * formModel.js
 *
 * Global Entry Hub (GEH)
 * Form Model for Immigration Submission Tracking
 */

const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    formId: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      default: null,
    },
    languageCode: {
      type: String,
      default: 'en',
    },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Custom instance methods
FormSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

module.exports = mongoose.model('Form', FormSchema);
