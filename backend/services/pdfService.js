const PDFDocument = require('pdfkit');
const getStream = require('get-stream');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const logger = require('../utils/loggerUtils');
const { recordPDFDownload } = require('./pdfAuditService');

function loadLocalizedLabels(locale = 'en', formType = 'default') {
  const supportedLocales = ['en', 'es', 'ar', 'hi', 'fr', 'pt', 'uk', 'tl', 'zh'];
  const safeLocale = supportedLocales.includes(locale) ? locale : 'en';

  const pathsToTry = [
    path.join(__dirname, `../../i18n/pdfLabels.${safeLocale}.${formType}.json`),
    path.join(__dirname, `../../i18n/pdfLabels.${safeLocale}.json`),
    path.join(__dirname, `../../i18n/pdfLabels.en.json`),
  ];

  for (const labelPath of pathsToTry) {
    if (fs.existsSync(labelPath)) {
      try {
        return JSON.parse(fs.readFileSync(labelPath, 'utf8'));
      } catch (err) {
        logger.logWarn(`PDFService: Failed to load i18n labels at ${labelPath}`, err.message);
      }
    }
  }

  return {};
}

function formatDateByLocale(rawDate, locale = 'en') {
  try {
    const date = new Date(rawDate);
    if (isNaN(date)) return '—';

    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    }).format(date);
  } catch (err) {
    logger.logWarn('PDFService: Failed to format date.', err.message);
    return '—';
  }
}

function normalizeFormData(data, primaryLabels, fallbackLabels, locale) {
  if (!data || typeof data !== 'object') return [];

  return Object.entries(data).map(([key, value]) => {
    const localized = primaryLabels[key] || fallbackLabels[key] || formatLabel(key);
    const english = fallbackLabels[key] || key;
    const finalLabel = locale === 'en' ? english : `${localized} (${english})`;

    const isDate = key.toLowerCase().includes('date');
    const finalValue = isDate ? formatDateByLocale(value, locale) : String(value ?? '—');

    return { label: finalLabel, value: finalValue };
  });
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function generatePDF({
  formData,
  userId,
  formId,
  locale = 'en',
  ip,
  formType = 'default',
  downloadType = 'user',
}) {
  const doc = new PDFDocument({ margin: 50 });
  const stream = doc.pipe(getStream.buffer());

  try {
    const primaryLabels = loadLocalizedLabels(locale, formType);
    const fallbackLabels = loadLocalizedLabels('en', formType);
    const normalizedData = normalizeFormData(formData, primaryLabels, fallbackLabels, locale);

    const title = primaryLabels.__title || fallbackLabels.__title || 'Immigration Form Summary';
    doc.fontSize(20).text(title, { align: 'center' }).moveDown();

    normalizedData.forEach((line, i) => {
      doc.fontSize(12).text(`${line.label}:`, { continued: true });
      doc.font('Helvetica-Bold').text(` ${line.value}`);
      doc.moveDown(0.3);
      if ((i + 1) % 30 === 0) doc.addPage();
    });

    doc.end();
    const pdfBuffer = await stream;

    await recordPDFDownload({
      userId,
      formId,
      ip,
      locale,
      timestamp: new Date(),
      downloadType,
    });

    return pdfBuffer;
  } catch (err) {
    logger.logError('PDFService: Failed to render PDF.', err);
    throw new Error('PDF generation failed. Please try again.');
  }
}

module.exports = {
  generatePDF,
};
