/**
 * buildModerationQuery.js
 *
 * Constructs a safe, filterable query object for moderation searches.
 * Used by searchFlags.js, export endpoints, and analytics dashboards.
 * Enforces soft-delete protection (unless explicitly overridden).
 *
 * @param {object} params - Query parameters from req.query
 * @returns {object} - MongoDB-safe query filter object
 */

function buildModerationQuery(params = {}) {
  const {
    status,
    tag,
    tier,
    reviewedBy,
    createdBy,
    includeDeleted = "false",
  } = params;

  const query = {};

  if (status && typeof status === "string") {
    query.status = status;
  }

  if (tier && typeof tier === "string") {
    query.highestTier = tier;
  }

  if (reviewedBy && typeof reviewedBy === "string") {
    query.reviewedBy = reviewedBy;
  }

  if (createdBy && typeof createdBy === "string") {
    query.createdBy = createdBy;
  }

  if (tag && typeof tag === "string") {
    query["matches.tag"] = tag;
  }

  // Enforce soft-delete exclusion unless explicitly requested
  if (includeDeleted !== "true") {
    query.deletedAt = null;
  }

  return query;
}

module.exports = buildModerationQuery;
