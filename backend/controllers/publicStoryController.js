/**
 * publicStoryController.js
 *
 * Global Entry Hub (GEH)
 * Purpose: Returns public-facing UGC stories with cache headers for SEO
 */

const publicStoryService = require('../services/publicStoryService');

/**
 * GET /api/stories
 */
async function getPublicStories(req, res) {
  try {
    const { country, language, tag, page = 1, limit = 12 } = req.query;

    const filters = {
      ...(country && { countryOfOrigin: country }),
      ...(language && { languageCode: language }),
      ...(tag && { tags: tag }),
    };

    const result = await publicStoryService.fetchApprovedStories(filters, page, limit);

    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("getPublicStories error:", err);
    res.status(500).json({ success: false, error: "Unable to load stories." });
  }
}

/**
 * GET /api/stories/country/:countryCode
 */
async function getCountryStoryFeed(req, res) {
  try {
    const { countryCode } = req.params;

    if (!countryCode || countryCode.length < 2) {
      return res.status(400).json({ success: false, message: "Invalid country code." });
    }

    const result = await publicStoryService.fetchApprovedStories(
      { countryOfOrigin: countryCode },
      1,
      20
    );

    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("getCountryStoryFeed error:", err);
    res.status(500).json({ success: false, error: "Unable to fetch stories." });
  }
}

module.exports = {
  getPublicStories,
  getCountryStoryFeed,
};
