const ConfidenceScore = require('models/confidenceScoreModel');
const confidenceUtils = require('utils/confidenceUtils');

async function generateConfidenceScore(fileId, payload) {
  try {
    const { rawScore, agentVersion } = payload;

    const normalizedScore = confidenceUtils.normalizeScore(rawScore);
    const thresholdBreached = confidenceUtils.checkThreshold(normalizedScore);

    const newScore = await ConfidenceScore.create({
      fileId,
      score: normalizedScore,
      agentVersion,
      thresholdBreached,
    });

    return newScore;
  } catch (err) {
    console.error("generateConfidenceScore error:", err);
    throw new Error("Failed to compute confidence score.");
  }
}

async function fetchScoreByFileId(fileId) {
  try {
    return await ConfidenceScore.findOne({ fileId }).lean();
  } catch (err) {
    console.error("fetchScoreByFileId error:", err);
    throw new Error("Failed to retrieve confidence score.");
  }
}

module.exports = {
  generateConfidenceScore,
  fetchScoreByFileId,
};
