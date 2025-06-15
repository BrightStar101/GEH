const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

/**
 * uploadImage
 * @desc Saves an image file (JPEG/PNG) and returns a public-access URL
 * @param {object} file - Contains buffer, originalName, mimeType
 * @returns {Promise<string>} - Public-facing URL
 */
async function uploadImage(file) {
  try {
    const { buffer, originalName, mimeType } = file;
    const ext = mimeType === 'image/png' ? '.png' : '.jpg';
    const safeName = uuidv4() + ext;
    const targetDir = path.resolve('public', 'ugc-images');

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const outputPath = path.join(targetDir, safeName);

    await sharp(buffer)
      .resize(800, 800, { fit: 'inside' })
      .toFormat(ext === '.png' ? 'png' : 'jpeg')
      .toFile(outputPath);

    return `/ugc-images/${safeName}`;
  } catch (err) {
    console.error('uploadImage error:', err);
    throw new Error('Failed to store uploaded image.');
  }
}

module.exports = {
  uploadImage,
};
