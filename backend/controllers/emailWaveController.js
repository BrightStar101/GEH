/**
 * backend/controllers/emailWaveController.js
 *
 * Global Entry Hub (GEH)
 * Batch 36 – Email Wave Trigger System
 *
 * Purpose:
 * Handles admin-initiated requests to launch, preview, or audit email wave sends.
 * Connects CSV contact parsing with queue execution and audit tracking.
 */

const waveQueueService = require('../services/waveQueueService');
const { parseWaveCsv } = require('../utils/waveCsvParser');
const WaveAuditLog = require('../models/waveAuditModel');
const { logError } = require('../utils/loggerUtils');

/**
 * Admin endpoint to preview parsed contact list from a CSV file (without sending).
 */
async function previewWaveContacts(req, res) {
  try {
    const rawCsv = req.body;
    const parsed = parseWaveCsv(rawCsv);

    if (parsed.errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'CSV contains errors',
        errors: parsed.errors,
      });
    }

    return res.status(200).json({
      success: true,
      previewCount: parsed.contacts.length,
      sample: parsed.contacts.slice(0, 10),
    });
  } catch (err) {
    logError('Wave contact preview failed:', err.message);
    return res.status(500).json({ success: false, message: 'Internal CSV parse error' });
  }
}

/**
 * Admin endpoint to trigger a real email wave send.
 */
async function launchWave(req, res) {
  try {
    const { csvData, templateGroup, waveNumber } = req.body;
    const adminUser = req.user?.email || 'system';

    if (!csvData || !templateGroup || !waveNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required launch parameters',
      });
    }

    const parsed = parseWaveCsv(csvData);

    if (parsed.errors.length > 0 || parsed.contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CSV content',
        errors: parsed.errors,
      });
    }

    const waveRecord = await WaveAuditLog.create({
      waveNumber,
      templateGroup,
      contactCount: parsed.contacts.length,
      triggeredBy: adminUser,
      status: 'in_progress',
    });

    const startTime = Date.now();

    const results = await waveQueueService.dispatchWaveEmailBatch(
      parsed.contacts,
      templateGroup,
      waveNumber,
      adminUser
    );

    const endTime = new Date();

    waveRecord.sentCount = results.sent;
    waveRecord.failedCount = results.failed;
    waveRecord.endTime = endTime;
    waveRecord.status = results.failed > 0 ? 'completed' : 'completed';
    await waveRecord.save();

    return res.status(200).json({
      success: true,
      message: `Wave ${waveNumber} dispatched.`,
      summary: results,
    });
  } catch (err) {
    logError('Wave launch failed:', err.message);
    return res.status(500).json({ success: false, message: 'Internal wave launch error' });
  }
}

module.exports = {
  previewWaveContacts,
  launchWave,
};
