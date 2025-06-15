// enhancements/routes/overrideRoutes.js

/**
 * overrideRoutes.js
 *
 * Admin-only route to manually override user access:
 * - Tier changes
 * - Token reset
 * - Flags (e.g., CLA exemptions, manual activation)
 *
 * Must enforce admin-only access, JWT auth, and audit logging.
 */

const express = require('express');
const router = express.Router();

const User = require('../models/userModel');
const { logComplianceTrigger } = require('../services/loggerService');

/**
 * @route   POST /app/admin/overrides
 * @desc    Admin manual override for user access or flags
 * @access  Admin Only
 */
router.post('/', async (req, res) => {
  try {
    const { targetUserEmail, newPlan, newAgent, aiAccessHours } = req.body;

    if (!targetUserEmail || typeof targetUserEmail !== 'string') {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const user = await User.findOne({email: targetUserEmail});
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (newPlan !== undefined) {
      user.planTier = newPlan.toLowerCase();
      user.planActivatedAt = new Date();
      
      user.tokensUsed = 0;
      user.formUsed = 0;
      user.promptsUsed = 0;
      user.extraPrompts = 0;
    }

    // if (typeof setFlag === 'string') {
    //   user.manualFlags = user.manualFlags || [];
    //   if (!user.manualFlags.includes(setFlag)) {
    //     user.manualFlags.push(setFlag);
    //   }
    // }

    await user.save();

    logComplianceTrigger({
      userId: user._id,
      type: 'ManualOverride',
      metadata: { newPlan },
    });

    return res.status(200).json({ message: 'Override applied successfully.' });
  } catch (err) {
    console.error('[Override Route Error]', err.message);
    return res.status(500).json({ error: 'Override operation failed.' });
  }
});

module.exports = router;
