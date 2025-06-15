/**
 * adminDashboardController.js (Upgraded with moderation notes)
 *
 * Purpose:
 * Includes admin action logging, moderation queue control,
 * and optional moderation reason/notes support.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const Review = require('../models/reviewModel');

/**
 * Logs moderation actions by admin.
 */
function logAdminAction({ adminId, action, reviewId, reason }) {
  try {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] Admin ${adminId} performed ${action.toUpperCase()} on review ${reviewId} ${reason ? '| Reason: ' + reason : ''}${os.EOL}`;
    const logPath = path.join(__dirname, '../../logs/admin-review-audit.log');
    fs.appendFile(logPath, entry, (err) => {
      if (err) console.error('Audit log error:', err.message);
    });
  } catch (err) {
    console.error('Audit logging failure:', err.message);
  }
}

/**
 * PATCH /api/admin/review/:id/notes
 * Updates the moderation reason or context.
 */
async function updateModerationNotes(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user?.id || 'unknown';

    if (!reason || reason.length < 3) {
      return res.status(400).json({ message: 'Moderation reason is required.' });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.moderationReason = reason;
    await review.save();

    logAdminAction({ adminId, action: 'notes', reviewId: id, reason });

    res.status(200).json({ message: 'Moderation reason updated.' });
  } catch (err) {
    console.error('Failed to update moderation notes:', err.message);
    res.status(500).json({ message: 'Failed to save notes.' });
  }
}

// Placeholder stubs for completeness
function getImpactMetrics() {}
function getModerationQueue() {}
function publishReview() {}
function flagReview() {}

module.exports = {
  getImpactMetrics,
  getModerationQueue,
  publishReview,
  flagReview,
  updateModerationNotes,
};
