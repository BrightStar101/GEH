/**
 * adminPlanController.js
 *
 * Admin-level controller to manually manage user tier plans.
 * Supports upgrades, resets, and privilege enforcement for internal staff only.
 */

const User = require('../models/userModel');
const { logInfo, logError } = require('../utils/loggerUtils');

/**
 * GET /api/admin/plan/:userId
 */
async function getUserPlanStatus(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId." });
    }

    const user = await User.findById(userId).select("email planTier role isActive lastLoginAt");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        tier: user.planTier,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    logError("❌ Failed to fetch user plan status", err);
    return res.status(500).json({ success: false, message: "Internal error." });
  }
}

/**
 * PATCH /api/admin/plan/:userId
 */
async function updateUserPlanTier(req, res) {
  try {
    const { userId } = req.params;
    const { newTier, note } = req.body;

    const validTiers = ["free", "starter", "official", "family"];
    if (!userId || !validTiers.includes(newTier)) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid userId or plan tier.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { planTier: newTier },
      { new: true, runValidators: true }
    ).select("email planTier role");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    logInfo("✅ Admin updated user tier", {
      adminEmail: req.user?.email,
      userId,
      newTier,
      note,
    });

    return res.status(200).json({
      success: true,
      message: `User tier updated to ${newTier}.`,
      user: {
        email: user.email,
        tier: user.planTier,
        role: user.role,
      },
    });
  } catch (err) {
    logError("❌ Failed to update user tier", err);
    return res.status(500).json({ success: false, message: "Internal error." });
  }
}

module.exports = {
  getUserPlanStatus,
  updateUserPlanTier,
};
