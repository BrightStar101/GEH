/**
 * ugcSubmissionModel.js
 *
 * UGC story submission schema — supports plain and rich formatted story types
 */

const mongoose = require('mongoose');

const ugcSubmissionSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  storyText: {
    type: String,
    required: true,
    minlength: 100,
  },
  formattedHtml: {
    type: String,
    default: "",
  },
  imageUrl: {
    type: String,
    default: "",
  },
  formatVersion: {
    type: String,
    default: "plain-text-v1",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  consentToShare: {
    type: Boolean,
    default: false,
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UGCSubmission", ugcSubmissionSchema);
