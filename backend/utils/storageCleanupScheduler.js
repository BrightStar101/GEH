const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const StorageMetadata = require("../models/storageMetadataModel");

async function cleanUpExpiredFiles() {
  try {
    const now = new Date();

    const expiredFiles = await StorageMetadata.find({
      isLifetime: false,
      expiresAt: { $lt: now },
    });

    if (expiredFiles.length === 0) {
      console.log("✅ No expired files found during cleanup.");
      return;
    }

    for (const file of expiredFiles) {
      const filePath = path.join("storage/pdfs", `${file.fileId}.pdf`);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted file: ${file.fileId}.pdf`);
        } else {
          console.warn(`⚠️ File not found on disk: ${file.fileId}.pdf`);
        }
      } catch (fileErr) {
        console.error(`🚨 Failed to delete file: ${file.fileId}.pdf`, fileErr);
      }

      try {
        await StorageMetadata.deleteOne({ _id: file._id });
        console.log(`🧹 Deleted metadata for: ${file.fileId}`);
      } catch (dbErr) {
        console.error(`🚨 Failed to delete metadata for: ${file.fileId}`, dbErr);
      }
    }

    console.log(`✅ Cleanup complete. Total purged: ${expiredFiles.length}`);
  } catch (err) {
    console.error("🚨 Storage cleanup job failed:", err);
  }
}

function scheduleDailyCleanup() {
  cron.schedule("0 3 * * *", async () => {
    console.log("⏰ Running scheduled PDF cleanup...");
    await cleanUpExpiredFiles();
  });
}

module.exports = {
  cleanUpExpiredFiles,
  scheduleDailyCleanup,
};
