/**
 * ocrUploadMiddleware.js
 *
 * Global Entry Hub (GEH)
 * OCR Upload Middleware (Upgraded with file extension guard)
 *
 * Purpose:
 * Handles secure, validated ingestion of files submitted for OCR processing.
 * Ensures uploaded file is a supported type, has correct extension, and fits size limits.
 * Stores file buffer in memory for use with GCP Vision API.
 */

const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

/**
 * Multer memory-only storage for safe transient file access
 */
const storage = multer.memoryStorage();

/**
 * File validation for OCR routes
 * - Accepts only specific file extensions
 * - Accepts only specific MIME types
 *
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Multer callback
 */
function fileFilter(req, file, cb) {
  const fileExt = path.extname(file.originalname).toLowerCase();
  const isValidMime = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isValidExt = ALLOWED_EXTENSIONS.includes(fileExt);

  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file upload. Only JPG, PNG, and PDF files with correct extensions are allowed.`
      )
    );
  }
}

/**
 * Middleware to handle OCR uploads securely:
 * - Validates file type
 * - Validates file extension
 * - Applies memory storage and 10MB size limit
 * - Exposes req.file for controller use
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

const ocrUploadMiddleware = upload.single('file');

module.exports = { ocrUploadMiddleware };
