/**
 * adminLegacyLogExportController.js
 *
 * Global Entry Hub (GEH)
 * PDF Audit Log Export Controller
 *
 * Purpose:
 * Allows internal admins to export PDF download logs with filters
 * into CSV or JSON format. Supports delivery as text download response.
 */

const fs = require('fs');
const path = require('path');

/**
 * POST /api/admin/export-pdf-audit
 */
async function exportPDFDownloadLogs(req, res) {
  try {
    const { format = 'csv', contains, userId } = req.body;

    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({ message: 'Invalid export format requested' });
    }

    const logPath = path.join(__dirname, '../../logs/pdf-download-audit.log');
    if (!fs.existsSync(logPath)) {
      return res.status(404).json({ message: 'PDF audit log not found' });
    }

    const raw = fs.readFileSync(logPath, 'utf-8');
    const lines = raw.trim().split('\n');

    const filtered = lines.filter((line) => {
      const matchesUser = userId ? line.includes(`user=${userId}`) : true;
      const matchesKeyword = contains ? line.toLowerCase().includes(contains.toLowerCase()) : true;
      return matchesUser && matchesKeyword;
    });

    if (format === 'json') {
      return res
        .status(200)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(filtered, null, 2));
    } else {
      const csv = ['entry'].concat(filtered.map(line => `"${line.replace(/"/g, '""')}"`)).join('\n');
      return res
        .status(200)
        .set('Content-Disposition', 'attachment; filename=pdf-audit-export.csv')
        .set('Content-Type', 'text/csv')
        .send(csv);
    }
  } catch (err) {
    console.error('AdminExportController Error:', err.message);
    return res.status(500).json({ message: 'Failed to export PDF audit logs' });
  }
}

module.exports = {
  exportPDFDownloadLogs,
};
