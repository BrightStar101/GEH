/**
 * authRoutes.js
 *
 * Global Entry Hub (GEH)
 * Route definitions for user authentication.
 */

const express = require('express');
const {
  registerUser,
  loginUser,
  verifyAdminAccess,
  getProfile
} = require('../controllers/authController');
const {
  validateRegistration,
  validateLogin,
  authenticate,
} = require('../middleware/authMiddleware');

const { setLanguagePreference } = require('../services/agentLanguagePreferenceService'); // ✅ ADDED

const router = express.Router();

router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    await registerUser(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateLogin, async (req, res, next) => {
  try {
    await loginUser(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    await getProfile(req, res)
  } catch (err) {
    next(err);
  }
});

router.post('/verify-admin', authenticate, async (req, res, next) => {
  try {
    await verifyAdminAccess(req, res);
  } catch (err) {
    next(err);
  }
});

// ✅ NEW: Set Language Preference Route
router.post('/set-language', authenticate, async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { languageCode } = req.body;

    const result = await setLanguagePreference(token, languageCode);
    res.status(result.success ? 200 : 400).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
