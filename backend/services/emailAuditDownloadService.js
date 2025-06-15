const { Parser } = require('json2csv');
const EmailAuditLog = require('models/emailAuditModel');
const { logError } = require('utils/loggerUtils');

async function exportWaveAuditCsv(req, res) {
  try {
    const { waveId } = req.params;

    if (!waveId) {
      return res.status(400).json({
        success: false,
        message: 'Missing wave ID',
      });
    }

    const logs = await EmailAuditLog.find({ wave: waveId }).lean();

    if (!logs || logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No email logs found for this wave',
      });
    }

    const fields = [
      { label: 'Email', value: 'email' },
      { label: 'Language', value: 'language' },
      { label: 'Status', value: 'status' },
      { label: 'Template ID', value: 'templateId' },
      { label: 'SendGrid Message ID', value: 'sendgridMessageId' },
      { label: 'Wave', value: 'wave' },
      { label: 'Funnel Stage', value: 'funnelStage' },
      { label: 'Region', value: 'region' },
      { label: 'Source Channel', value: 'sourceChannel' },
      { label: 'Failure Reason', value: 'reason' },
      { label: 'Created At', value: (row) => new Date(row.createdAt).toISOString() },
    ];

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(logs);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=wave_${waveId}_email_logs.csv`);
    return res.status(200).send(csv);
  } catch (err) {
    logError('exportWaveAuditCsv failed:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal export failure',
    });
  }
}

module.exports = {
  exportWaveAuditCsv,
};
