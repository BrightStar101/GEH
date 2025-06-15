const express = require('express');
const multer = require('multer');
const { uploadStoryImage } = require('../controllers/ugcMediaController');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mime = file.mimetype;
    if (mime === 'image/jpeg' || mime === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG files are allowed.'));
    }
  },
});

router.post('/ugc/media-upload', upload.single('image'), uploadStoryImage);

module.exports = router;
