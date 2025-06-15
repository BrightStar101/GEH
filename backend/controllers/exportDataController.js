/**
 * exportDataController.js
 *
 * Global Entry Hub (GEH)
 * Data Export Controller
 *
 * Purpose:
 * Handles authenticated requests to export user-owned data
 * in compliance with GDPR/CCPA. Aggregates, sanitizes, and delivers
 * a downloadable JSON response.
 */

const { exportUserData } = require('../services/exportDataService');

/**
 * GET /api/support/export-my-data
 */
async function getUserExport(req, res) {
  try {
    const userId = req.user?.id;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required for data export.' });
    }

    const exportPayload = await exportUserData({
      userId,
      userAgent,
      ip,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="geh_export_${new Date().toISOString()}.json"`
    );

    res.status(200).send(JSON.stringify(exportPayload, null, 2));
  } catch (err) {
    console.error('ExportDataController: Failed to generate user export', err.message);
    res.status(500).json({
      message: 'Unable to generate data export. Please try again later.',
    });
  }
}

module.exports = {
  getUserExport,
};
