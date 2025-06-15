/**
 * reviewModel.js
 *
 * Global Entry Hub (GEH)
 * UGC Review Model
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1200,
      trim: true,
    },
    ipHash: {
      type: String,
      required: false,
      select: false,
      index: true,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'ugc_reviews',
    versionKey: false,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
