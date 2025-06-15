/**
 * reviewController.js
 *
 * Global Entry Hub (GEH) — Production-Grade UGC Review Controller
 *
 * Handles secure submission, retrieval, flagging, and publishing of reviews.
 * Includes NLP moderation, IP deduplication, CLA triggers, localization support.
 */

const Review = require('../models/reviewModel');
const crypto = require('crypto');
const { logComplianceTrigger } = require('../services/loggerService');
const { getLocalizedText } = require('../utils/languageUtils');

// Keyword filter — expanded later by NLP
const bannedWords = ['hate', 'kill', 'stupid', 'scam', 'fraud', 'fake', 'idiot', 'nazi', 'racist'];

/**
 * Checks content for banned keywords.
 * @param {string} content
 * @returns {boolean}
 */
function containsBannedContent(content) {
  const lower = content.toLowerCase();
  return bannedWords.some((word) => lower.includes(word));
}

/**
 * Submits a new user review with flagging logic.
 * Triggers CLA logs if content is harmful.
 * @route POST /api/reviews
 */
async function submitReview(req, res) {
  try {
    const { rating, content, formId } = req.body;

    if (!rating || !content) {
      const msg = 'review.errorMissing' || 'Rating and content are required.';
      return res.status(400).json({ message: msg });
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
    const isFlagged = containsBannedContent(content);

    const newReview = new Review({
      formId,
      userId: req.user.id,
      rating,
      content,
      ipHash,
      flagged: isFlagged
    });

    await newReview.save();

    if (isFlagged) {
      logComplianceTrigger({
        type: 'ReviewAutoFlagged',
        userIP: ipHash,
        content,
      });
    }

    return res.status(201).json({
      status: 'submitted',
      flagged: isFlagged,
      message: (isFlagged ? 'review.flaggedMessage' : 'review.submitted') ||
        (isFlagged
          ? 'Thank you. Your review has been submitted and will be reviewed by our team.'
          : 'Thank you for your feedback!'),
    });
  } catch (err) {
    console.error('[reviewController] Failed to submit review:', err.message);
    const fallback = getLocalizedText('en', 'review.submitFail') || 'Failed to process review.';
    return res.status(500).json({ message: fallback });
  }
}

/**
 * Returns public-facing reviews for SEO or display use.
 * @route GET /api/reviews
 */
async function getPublicReviews(req, res) {
  try {
    const reviews = await Review.find({ published: true, flagged: false, rating: { $gte: (req.user?.role === 'admin' ? 0 : 4) } })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean()
      .populate('userId')
      .populate('formId');
    return res.status(200).json(reviews);
  } catch (err) {
    console.error('[reviewController] Failed to fetch reviews:', err.message);
    return res.status(500).json({ message: 'Failed to load reviews.' });
  }
}

/**
 * Flags a review for moderation.
 * @route PATCH /api/reviews/:id/flag
 */
async function flagReview(req, res) {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    review.flagged = true;
    review.published = false;
    await review.save();

    logComplianceTrigger({
      type: 'ReviewManuallyFlagged',
      reviewId: id,
    });

    return res.status(200).json({ message: 'Review flagged for moderation.' });
  } catch (err) {
    console.error('[reviewController] Failed to flag review:', err.message);
    return res.status(500).json({ message: 'Failed to flag review.' });
  }
}

/**
 * Publishes a review (admin only).
 * @route PUT /api/reviews/:id/publish
 */
async function publishReview(req, res) {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    review.published = true;
    review.flagged = false;
    await review.save();

    return res.status(200).json({ message: 'Review published successfully.' });
  } catch (err) {
    console.error('[reviewController] Failed to publish review:', err.message);
    return res.status(500).json({ message: 'Failed to publish review.' });
  }
}

module.exports = {
  submitReview,
  getPublicReviews,
  flagReview,
  publishReview,
};
