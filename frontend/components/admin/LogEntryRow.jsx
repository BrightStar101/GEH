// File: /frontend/components/admin/LogEntryRow.jsx

import React from "react";
import { formatDateTime } from "../../utils/dateFormatter";

/**
 * LogEntryRow.jsx
 * Renders a single row in the admin audit log viewer.
 *
 * Props:
 * - log: {
 *     id: string,
 *     timestamp: string (ISO),
 *     userId: string,
 *     action: string,
 *     metadata: object,
 *     status: "success" | "warning" | "error",
 *     flagged?: boolean
 *   }
 */
export default function LogEntryRow({ log }) {
  const { _id, timestamp, user, action, metadata, status, flagged } = log;

  const statusBadge = {
    success: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    error: "bg-red-100 text-red-800 border-red-300",
  }[status] || "bg-gray-100 text-gray-700 border-gray-300";

  return (
    <tr
      className={`text-sm text-gray-800 border-b ${
        flagged ? "bg-yellow-50 border-l-4 border-yellow-400" : ""
      }`}
    >
      <td className="px-3 py-2 font-mono text-xs text-gray-500">{_id}</td>
      <td className="px-3 py-2">{formatDateTime(timestamp)}</td>
      <td className="px-3 py-2">{user}</td>
      <td className="px-3 py-2">{action}</td>
      <td className="px-3 py-2">
        {metadata && Object.keys(metadata).length > 0 ? (
          <pre className="whitespace-pre-wrap text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        ) : (
          <span className="italic text-gray-400">—</span>
        )}
      </td>
      <td className="px-3 py-2">
        <span
          className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${statusBadge}`}
        >
          {status.toUpperCase()}
        </span>
      </td>
    </tr>
  );
}
