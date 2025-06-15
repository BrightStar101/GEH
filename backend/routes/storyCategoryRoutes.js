const express = require('express');
const {
  getStoriesByCategorySlug,
  getStoriesByTags,
} = require('../controllers/storyCategoryController');

const router = express.Router();

router.get('/stories/category/:slug', getStoriesByCategorySlug);
router.get('/stories/search', getStoriesByTags);

module.exports = router;
