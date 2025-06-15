const vision = require('@google-cloud/vision');

// Auth is handled via GOOGLE_APPLICATION_CREDENTIALS env var
const client = new vision.ImageAnnotatorClient();

/**
 * Extracts OCR text and confidence metrics from a given file buffer.
 *
 * @param {Object} params
 * @param {Buffer} params.fileBuffer - File content in memory
 * @param {string} params.fileName - Original uploaded filename
 * @param {string} params.mimeType - MIME type of file (e.g., 'image/png')
 * @param {string} [params.languageHint='en'] - OCR language context
 * @param {string} [params.userId] - Optional user ID for logging
 * @returns {Promise<{ text: string, confidence?: number, confidencePerPage?: number[], meta?: object }>}
 */
async function extractTextFromFile({ fileBuffer, fileName, mimeType, languageHint = 'en', userId }) {
  try {
    if (!fileBuffer || !mimeType) throw new Error('Missing file or MIME type');

    const isPDF = mimeType === 'application/pdf';

    const request = {
      image: { content: fileBuffer },
      features: [{ type: isPDF ? 'DOCUMENT_TEXT_DETECTION' : 'TEXT_DETECTION' }],
      imageContext: {
        languageHints: [languageHint],
      },
    };

    const [result] = await client.annotateImage(request);
    const fullText = result.fullTextAnnotation?.text?.trim() || '';

    const pages = result.fullTextAnnotation?.pages || [];
    const confidencePerPage = pages.map((page) => {
      const blocks = page.blocks || [];
      const blockConfidence = blocks.map((b) => b.confidence ?? 1);
      const avg = blockConfidence.reduce((a, b) => a + b, 0) / blockConfidence.length || 1;
      return +(avg * 100).toFixed(2);
    });

    const confidence =
      confidencePerPage.length > 0
        ? +(confidencePerPage.reduce((a, b) => a + b, 0) / confidencePerPage.length).toFixed(2)
        : null;

    return {
      text: fullText,
      confidence,
      confidencePerPage,
      meta: {
        pages: pages.length || 1,
        detectedLang: result.textAnnotations?.[0]?.locale || languageHint,
        userId,
        fileName,
      },
    };
  } catch (err) {
    console.error('OCR Service: Vision API error —', err.message);
    return { text: null };
  }
}

module.exports = {
  extractTextFromFile,
};
