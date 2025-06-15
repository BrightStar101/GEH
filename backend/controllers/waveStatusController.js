/**
 * waveStatusController.js
 *
 * Global Entry Hub (GEH)
 * Batch 37 – Email Wave Monitoring & Admin Control
 *
 * Purpose:
 * Provides endpoints for retrieving wave execution summaries and audit logs.
 * Supports admin filtering, performance visibility, and export integration.
 */

const WaveAuditLog = require('../models/waveAuditModel');
const EmailAuditLog = require('../models/emailAuditModel');
const { logError } = require('../utils/loggerUtils');

/**
 * Retrieves a list of recent wave executions with summary stats.
 * Called from admin dashboard (EmailWaveDashboard.jsx).
 */
async function getWaveSummary(req, res) {
  try {
    const waves = await WaveAuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      count: waves.length,
      data: waves,
    });
  } catch (err) {
    logError('getWaveSummary failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve wave summaries',
    });
  }
}

/**
 * Retrieves full delivery audit logs for a specific wave.
 */
async function getWaveEmailLogs(req, res) {
  try {
    const { waveId } = req.params;

    if (!waveId) {
      return res.status(400).json({ success: false, message: 'Missing wave ID' });
    }

    const logs = await EmailAuditLog.find({ wave: waveId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    logError('getWaveEmailLogs failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve email logs for this wave',
    });
  }
}

module.exports = {
  getWaveSummary,
  getWaveEmailLogs,
};
