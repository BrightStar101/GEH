// Purpose: Converts arrays of objects into CSV format for admin exports

function escapeCSVValue(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  const escaped = stringValue
    .replace(/"/g, '""') // escape double quotes
    .replace(/\r?\n|\r/g, ' '); // remove newlines
  return `"${escaped}"`;
}

function toCSV(rows, columns) {
  const headerRow = columns.map(col => escapeCSVValue(col.label)).join(',');
  const dataRows = rows.map(row => {
    return columns.map(col => escapeCSVValue(row[col.key])).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

module.exports = {
  toCSV,
};
