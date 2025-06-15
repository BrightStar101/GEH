// backend/utils/downloadBlockLogger.js

const fs = require('fs');
const path = require('path');
const logger = require('./loggerUtils');

const BLOCK_LOG_PATH = path.join(__dirname, '../../logs/download-blocks.jsonl');

function logDownloadBlock({ userId, fileId, reason }) {
  try {
    const entry = {
      timestamp: new Date().toISOString(),
      userId,
      fileId,
      reason,
    };
    fs.appendFileSync(BLOCK_LOG_PATH, JSON.stringify(entry) + '\n');
  } catch (err) {
    logger.logError('DownloadBlockLogger: Failed to write block event.', err);
  }
}

module.exports = {
  logDownloadBlock,
};
