const UGCSubmission = require('models/ugcSubmissionModel');

/**
 * fetchStoriesByCategory
 * @desc Returns approved stories for a given category slug (matched to tag)
 */
async function fetchStoriesByCategory(slug, page = 1, limit = 12) {
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const stories = await UGCSubmission.find({
      status: "approved",
      consentToShare: true,
      tags: { $in: [slug] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return stories;
  } catch (err) {
    console.error("fetchStoriesByCategory error:", err);
    throw new Error("Failed to retrieve stories for category.");
  }
}

/**
 * fetchStoriesByTags
 * @desc Returns stories that match one or more tags
 */
async function fetchStoriesByTags(tags, page = 1, limit = 12) {
  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const stories = await UGCSubmission.find({
      status: "approved",
      consentToShare: true,
      tags: { $in: tags },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return stories;
  } catch (err) {
    console.error("fetchStoriesByTags error:", err);
    throw new Error("Failed to retrieve stories by tags.");
  }
}

module.exports = {
  fetchStoriesByCategory,
  fetchStoriesByTags,
};
