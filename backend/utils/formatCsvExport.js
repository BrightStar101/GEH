const { Parser } = require('json2csv');
const exportConfig = require("config/exportConfig");

function flattenFlagRecord(flag) {
  const flat = {};

  for (const field of exportConfig.allowedExportFields) {
    const value = flag[field];

    if (field === "matches" && Array.isArray(value)) {
      flat.matches = value.map((m) => `${m.tag}:${m.tier}:${m.confidence}`).join(" | ");
    } else if (field === "history" && Array.isArray(value)) {
      flat.history = value.map((h) =>
        `[${h.timestamp}] ${h.by} (${h.role}) → ${h.action}`
      ).join(" | ");
    } else if (typeof value === "object" && value !== null) {
      flat[field] = JSON.stringify(value);
    } else {
      flat[field] = value || "";
    }
  }

  return flat;
}

function formatCsvExport(data = []) {
  try {
    if (!Array.isArray(data) || data.length === 0) return "";

    const flatRows = data.map(flattenFlagRecord);
    const fields = exportConfig.allowedExportFields;
    const parser = new Parser({ fields, delimiter: "," });
    return parser.parse(flatRows);
  } catch (err) {
    console.error("formatCsvExport failed:", err);
    return "";
  }
}

module.exports = { formatCsvExport };
