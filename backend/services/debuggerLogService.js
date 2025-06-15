const fs = require("fs");
const path = require("path");
const { logger } = require("utils/loggerUtils");

const logDirectory = path.join(process.cwd(), "logs", "fallback");
const logStreams = new Map();

function getOrCreateStream(dateStr) {
  if (logStreams.has(dateStr)) {
    return logStreams.get(dateStr);
  }

  const filePath = path.join(logDirectory, `${dateStr}.log`);
  fs.mkdirSync(logDirectory, { recursive: true });

  const stream = fs.createWriteStream(filePath, { flags: "a", encoding: "utf8" });
  logStreams.set(dateStr, stream);
  return stream;
}

async function logLanguageFallbackEvent({ from, fallbackTo }) {
  try {
    if (!from || !fallbackTo || typeof from !== "string" || typeof fallbackTo !== "string") {
      throw new Error("Invalid language fallback payload");
    }

    const timestamp = new Date().toISOString();
    const today = timestamp.slice(0, 10);
    const stream = getOrCreateStream(today);

    const logEntry = {
      timestamp,
      from,
      fallbackTo,
      source: "public/client",
    };

    stream.write(JSON.stringify(logEntry) + "\n");
    logger.logInfo(`[LANG-FALLBACK] ${from} → ${fallbackTo}`);
  } catch (err) {
    logger.logError("debuggerLogService.logLanguageFallbackEvent failed:", err);
  }
}

module.exports = {
  logLanguageFallbackEvent,
};
