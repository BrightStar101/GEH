const ModerationFlag = require("models/moderationFlag.model");
const exportConfig = require("config/exportConfig");
const { buildModerationQuery } = require("utils/buildModerationQuery");
const { formatCsvExport } = require("utils/formatCsvExport");
const { logger } = require("utils/loggerUtils");

async function exportModerationData({ filters = {}, format = "json", isDsar = false }) {
  try {
    const query = buildModerationQuery(filters);
    const totalRows = await ModerationFlag.countDocuments(query);

    if (totalRows > exportConfig.maxExportRows) {
      throw new Error(`Export row limit exceeded. Found ${totalRows}, limit is ${exportConfig.maxExportRows}.`);
    }

    const flags = await ModerationFlag.find(query).sort({ createdAt: -1 }).lean();

    const sanitized = flags.map((flag) => {
      const result = {};
      for (const field of exportConfig.allowedExportFields) {
        result[field] = flag[field];
      }

      if (isDsar && exportConfig.dsarAnonymization.enabled) {
        for (const field of exportConfig.dsarAnonymization.removeFields) {
          delete result[field];
        }
        for (const [field, masker] of Object.entries(exportConfig.dsarAnonymization.maskPatterns)) {
          if (result[field]) result[field] = masker(result[field]);
        }
      }

      return result;
    });

    if (format === "csv") {
      return formatCsvExport(sanitized);
    }

    return sanitized;
  } catch (err) {
    logger.logError("exportModerationData failed:", err);
    throw new Error("Moderation export failed.");
  }
}

module.exports = {
  exportModerationData,
};
