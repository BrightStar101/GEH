const UGCSubmission = require('models/ugcSubmissionModel');

/**
 * fetchApprovedStories
 * Returns filtered, paginated, and sorted UGC stories for public visibility.
 */
async function fetchApprovedStories(filters = {}, page = 1, limit = 12) {
  try {
    const query = {
      status: "approved",
      consentToShare: true,
      ...filters,
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const stories = await UGCSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return stories;
  } catch (err) {
    console.error("fetchApprovedStories error:", err);
    throw new Error("Failed to retrieve public stories.");
  }
}

module.exports = {
  fetchApprovedStories,
};
