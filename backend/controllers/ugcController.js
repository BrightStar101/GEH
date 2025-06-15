/**
 * ugcController.js
 *
 * Global Entry Hub (GEH)
 * Purpose: Handles UGC submission and moderation lifecycle with rejection reason support
 */

const UGCSubmission = require('../models/ugcSubmissionModel');
const ModerationQueue = require('../models/moderationQueueModel');
const ugcModerationService = require('../services/ugcModerationService');
const { sendStoryThankYou } = require('../services/emailDispatchService');

/**
 * POST /api/ugc/share-your-story
 */
async function submitStory(req, res) {
  try {
    const { userName, storyText, consentToShare } = req.body;

    if (!userName || !storyText || storyText.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Name and a meaningful story (min 100 characters) are required.',
      });
    }

    const flagged = ugcModerationService.shouldFlagStory(storyText);

    const newStory = await UGCSubmission.create({
      userName,
      storyText,
      status: 'pending',
      consentToShare: !!consentToShare,
      flagged,
    });

    await ModerationQueue.create({
      submissionId: newStory._id,
      flagged,
      status: 'pending',
    });

    try {
      await sendStoryThankYou(req.user || {}, { title: storyText.slice(0, 30) });
    } catch (err) {
      console.warn('✅ UGC submitted, but thank-you email failed:', err.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Story submitted successfully.',
      flagged,
    });
  } catch (err) {
    console.error('submitStory error:', err);
    res.status(500).json({ success: false, error: 'Server error submitting story.' });
  }
}

/**
 * GET /api/ugc/moderation/queue
 */
async function getModerationQueue(req, res) {
  try {
    const queue = await ModerationQueue.find({ status: 'pending' }).populate('submissionId');
    return res.json({ success: true, queue });
  } catch (err) {
    console.error('getModerationQueue error:', err);
    res.status(500).json({ success: false, error: 'Unable to load moderation queue.' });
  }
}

/**
 * PATCH /api/ugc/moderation/approve/:storyId
 */
async function approveStory(req, res) {
  try {
    const { storyId } = req.params;

    const submission = await UGCSubmission.findByIdAndUpdate(
      storyId,
      { status: 'approved', rejectionReason: null },
      { new: true }
    );

    await ModerationQueue.deleteOne({ submissionId: storyId });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }

    return res.json({ success: true, message: 'Story approved.' });
  } catch (err) {
    console.error('approveStory error:', err);
    res.status(500).json({ success: false, error: 'Server error during approval.' });
  }
}

/**
 * PATCH /api/ugc/moderation/reject/:storyId
 */
async function rejectStory(req, res) {
  try {
    const { storyId } = req.params;
    const { rejectionReason } = req.body;

    const submission = await UGCSubmission.findByIdAndUpdate(
      storyId,
      {
        status: 'rejected',
        rejectionReason: rejectionReason || 'No reason provided.',
      },
      { new: true }
    );

    await ModerationQueue.deleteOne({ submissionId: storyId });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Story not found.' });
    }

    return res.json({ success: true, message: 'Story rejected.', reason: rejectionReason });
  } catch (err) {
    console.error('rejectStory error:', err);
    res.status(500).json({ success: false, error: 'Server error during rejection.' });
  }
}

module.exports = {
  submitStory,
  getModerationQueue,
  approveStory,
  rejectStory,
};
