/**
 * storyCategoryModel.js
 *
 * Defines public UGC story categories for discovery and routing
 */

const mongoose = require('mongoose');

const storyCategorySchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "📖",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("StoryCategory", storyCategorySchema);
