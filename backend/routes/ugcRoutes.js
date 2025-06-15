const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminAuthMiddleware');
const {
  submitStory,
  getModerationQueue,
  approveStory,
  rejectStory,
} = require('../controllers/ugcController');
const { ugcRateLimiter } = require('../middleware/ugcRateLimiter');

const router = express.Router();

router.post('/share-your-story', ugcRateLimiter, submitStory);
router.get('/moderation/queue', requireAdmin, getModerationQueue);
router.patch('/moderation/approve/:storyId', requireAdmin, approveStory);
router.patch('/moderation/reject/:storyId', requireAdmin, rejectStory);

module.exports = router;
