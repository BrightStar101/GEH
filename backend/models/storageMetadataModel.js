/**
 * storageMetadataModel.js
 *
 * PDF metadata schema for access, retention, and lifetime upgrade logic
 */

const mongoose = require('mongoose');

const storageMetadataSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  isLifetime: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("StorageMetadata", storageMetadataSchema);
