import React, { useContext, useEffect, useState } from "react";
import AdminTopBar from "../../components/admin/AdminTopBar";
import LogEntryRow from "../../components/admin/LogEntryRow";
import { getAuditLogs } from "../../services/auditLogService";
import { exportCsv } from "../../utils/exportCsv";
import { logger } from "../../utils/logger";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * auditViewer.jsx
 * Displays paginated, filterable audit logs with CSV export and flagged entry highlighting.
 *
 * Props:
 * - token: JWT auth token (required)
 * - user: { name: string, role: string }
 */
export default function AuditViewer() {
  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ userId: "", actionType: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      try {
        setLoading(true);
        const data = await getAuditLogs(filter, page);
        if (isMounted) {
          setLogs(data.logs);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        if (isMounted) {
          logger.error("AuditViewer.loadLogs failed", err);
          setError("Unable to load audit log records.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [page, filter]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleExport = () => {
    exportCsv(logs, `geh-audit-page-${page}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Audit Log Viewer</h1>

        {/* Filters + Export */}
        <div className="flex flex-wrap items-center space-x-4 mb-6">
          <input
            type="text"
            name="userId"
            value={filter.userId}
            onChange={handleFilterChange}
            placeholder="Filter by User Email"
            className="px-3 py-2 border rounded-md text-sm w-52"
          />
          <input
            type="text"
            name="actionType"
            value={filter.actionType}
            onChange={handleFilterChange}
            placeholder="Filter by Action"
            className="px-3 py-2 border rounded-md text-sm w-52"
          />
          <button
            onClick={handleExport}
            className="ml-auto text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            disabled={logs.length === 0}
          >
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-xs text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 w-[10%]">Log ID</th>
                <th className="px-3 py-2 w-[20%]">Timestamp</th>
                <th className="px-3 py-2 w-[20%]">User Email</th>
                <th className="px-3 py-2 w-[20%]">Action</th>
                <th className="px-3 py-2 w-[20%]">Metadata</th>
                <th className="px-3 py-2 w-[10%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr key='loading'>
                  <td colSpan="6" className="text-center py-4 italic text-gray-500">
                    Loading logs...
                  </td>
                </tr>
              )}
              {!loading && logs.length === 0 && (
                <tr key='not found'>
                  <td colSpan="6" className="text-center py-4 italic text-gray-500">
                    No matching audit records found.
                  </td>
                </tr>
              )}
              {!loading &&
                logs.map((log) => <LogEntryRow key={log._id} log={log} />)}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 text-sm border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-700 pt-1">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 text-sm border rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
