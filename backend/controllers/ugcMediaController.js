/**
 * ugcMediaController.js
 *
 * Global Entry Hub (GEH)
 * Securely handles UGC image uploads for story submission
 */

const storyMediaUploadService = require('../services/storyMediaUploadService');

/**
 * POST /api/ugc/media-upload
 */
async function uploadStoryImage(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const { originalname, mimetype, buffer } = req.file;

    if (!['image/jpeg', 'image/png'].includes(mimetype)) {
      return res.status(400).json({ success: false, message: 'Unsupported file format.' });
    }

    const imageUrl = await storyMediaUploadService.uploadImage({
      buffer,
      originalName: originalname,
      mimeType: mimetype,
    });

    res.json({ success: true, url: imageUrl });
  } catch (err) {
    console.error('uploadStoryImage error:', err);
    res.status(500).json({ success: false, error: 'Image upload failed.' });
  }
}

module.exports = {
  uploadStoryImage,
};
