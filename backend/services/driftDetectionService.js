const DriftSignal = require('models/driftSignalModel');
const ConfidenceScore = require('models/confidenceScoreModel');
const statisticalDriftTools = require('utils/statisticalDriftTools');

async function checkForDrift(newScore, fileId) {
  try {
    const recentScores = await ConfidenceScore.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select("score")
      .lean();

    const isDrift = statisticalDriftTools.detectZScoreAnomaly(newScore, recentScores);
    if (!isDrift) return;

    const severity = statisticalDriftTools.classifySeverity(newScore, recentScores);

    await DriftSignal.create({
      fileId,
      score: newScore,
      signalType: "confidence_drop",
      severity,
    });
  } catch (err) {
    console.error("checkForDrift error:", err);
    throw new Error("Drift detection failed.");
  }
}

async function getRecentDriftSignals() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    return await DriftSignal.find({ createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  } catch (err) {
    console.error("getRecentDriftSignals error:", err);
    throw new Error("Could not retrieve drift signals.");
  }
}

module.exports = {
  checkForDrift,
  getRecentDriftSignals,
};
