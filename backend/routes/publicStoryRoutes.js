/**
 * publicStoryRoutes.js
 *
 * API for browsing approved UGC stories
 */

const express = require('express');
const {
  getPublicStories,
  getCountryStoryFeed,
} = require('../controllers/publicStoryController');

const router = express.Router();

router.get('/stories', getPublicStories);
router.get('/stories/country/:countryCode', getCountryStoryFeed);

module.exports = router;
