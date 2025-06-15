/**
 * storyCategoryController.js
 * Purpose: Fetch and filter public stories based on category slugs or tags
 */

const storyCategoryService = require('../services/storyCategoryService');

/**
 * GET /api/stories/category/:slug
 */
async function getStoriesByCategorySlug(req, res) {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;

    if (!slug || slug.length < 2) {
      return res.status(400).json({ success: false, message: "Invalid category slug." });
    }

    const result = await storyCategoryService.fetchStoriesByCategory(slug.toLowerCase(), page, limit);

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: "No stories found for this category." });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("getStoriesByCategorySlug error:", err);
    res.status(500).json({ success: false, error: "Failed to load category stories." });
  }
}

/**
 * GET /api/stories/search?tag=asylum&tag=student
 */
async function getStoriesByTags(req, res) {
  try {
    const { tag, page = 1, limit = 12 } = req.query;
    const tagArray = Array.isArray(tag) ? tag : tag ? [tag] : [];

    if (!tagArray.length) {
      return res.status(400).json({ success: false, message: "At least one tag is required." });
    }

    const result = await storyCategoryService.fetchStoriesByTags(tagArray.map(t => t.toLowerCase()), page, limit);

    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: "No stories found for the provided tags." });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("getStoriesByTags error:", err);
    res.status(500).json({ success: false, error: "Failed to load tag-filtered stories." });
  }
}

module.exports = {
  getStoriesByCategorySlug,
  getStoriesByTags,
};
