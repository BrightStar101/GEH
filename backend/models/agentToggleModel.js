/**
 * agentToggleModel.js
 *
 * Global Entry Hub (GEH)
 * Mongoose Model – Agent Feature Toggles
 *
 * Purpose:
 * Stores feature toggle state for admin-controlled AI modules (e.g. retraining, CLA)
 */

const mongoose = require('mongoose');

const agentToggleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  description: { type: String },
  enabled: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('AgentToggle', agentToggleSchema);
