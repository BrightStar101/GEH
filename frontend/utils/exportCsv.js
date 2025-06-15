// File: /frontend/utils/exportCsv.js

/**
 * Converts an array of objects into CSV format and triggers a download.
 *
 * @param {Array<Object>} rows - Array of log objects to export
 * @param {string} filename - Desired CSV filename (without extension)
 */
export function exportCsv(rows, filename = "audit-logs") {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn("No rows provided for CSV export.");
    return;
  }

  const header = Object.keys(rows[0]);
  const csvContent = [
    header.join(","),
    ...rows.map((row) =>
      header
        .map((field) => {
          let val = row[field];
          if (typeof val === "object") val = JSON.stringify(val);
          return `"${(val ?? "").toString().replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
