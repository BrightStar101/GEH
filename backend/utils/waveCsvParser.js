const csvParse = require('csv-parse/sync');
const { logError } = require('utils/loggerUtils');

const requiredHeaders = ['email'];
const allowedFields = [
  'email',
  'firstName',
  'language',
  'region',
  'funnelStage',
  'sourceChannel',
];

function parseWaveCsv(rawCsv) {
  const results = {
    contacts: [],
    errors: [],
  };

  try {
    const csvString = Buffer.isBuffer(rawCsv) ? rawCsv.toString('utf-8') : rawCsv;

    const records = csvParse.parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const seenEmails = new Set();

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const email = (row.email || '').toLowerCase().trim();

      if (!email || !email.includes('@')) {
        results.errors.push({ row: i + 1, error: 'Invalid or missing email address.' });
        continue;
      }

      if (seenEmails.has(email)) {
        results.errors.push({ row: i + 1, error: 'Duplicate email detected.' });
        continue;
      }

      seenEmails.add(email);

      const language = ['en', 'es', 'hi', 'zh'].includes(row.language?.toLowerCase())
        ? row.language.toLowerCase()
        : 'en';

      const contact = {
        email,
        firstName: row.firstName || '',
        language,
        region: row.region || '',
        funnelStage: row.funnelStage || 'unknown',
        sourceChannel: row.sourceChannel || 'wave_csv',
      };

      results.contacts.push(contact);
    }
  } catch (err) {
    logError('waveCsvParser failed:', err.message);
    results.errors.push({ row: 'global', error: err.message });
  }

  return results;
}

module.exports = {
  parseWaveCsv,
};
