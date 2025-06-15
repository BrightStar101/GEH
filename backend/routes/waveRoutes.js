const express = require('express');
const router = express.Router();

const {
  previewWaveContacts,
  launchWave,
} = require('../controllers/emailWaveController');

const authMiddleware = require('../middleware/authMiddleware');
const adminCheckMiddleware = require('../middleware/adminCheckMiddleware');

router.post(
  '/admin/wave/preview',
  authMiddleware,
  adminCheckMiddleware,
  express.text({ type: 'text/csv' }),
  previewWaveContacts
);

router.post(
  '/admin/wave/launch',
  authMiddleware,
  adminCheckMiddleware,
  express.json({ limit: '5mb' }),
  launchWave
);

module.exports = router;
