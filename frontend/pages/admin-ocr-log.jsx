/**
 * admin-ocr-log.jsx
 *
 * Global Entry Hub (GEH)
 * Admin OCR Log Viewer (Upgraded)
 *
 * Adds:
 * - Export format toggle
 * - Record count preview before download
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function AdminOCRLog() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    userId: '',
    mimeType: '',
    languageHint: '',
    success: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const claims = JSON.parse(localStorage.getItem('claims') || '{}');
    if (!token || claims.role !== 'admin') {
      router.replace('/unauthorized');
    }
  }, [router]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/ocr-logs');
      const data = res.data;

      setLogs(data.logs || []);
      setFilteredLogs(data.logs || []);
      setLoading(false);
    } catch (err) {
      console.error('AdminOCRLog fetch error', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilterChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    applyFilters(updated);
  };

  const applyFilters = (filters) => {
    const result = logs.filter((log) => {
      return (
        (!filters.userId || log.userId.includes(filters.userId)) &&
        (!filters.mimeType || log.mimeType.includes(filters.mimeType)) &&
        (!filters.languageHint || log.languageHint === filters.languageHint) &&
        (!filters.success || String(log.success) === filters.success)
      );
    });
    setFilteredLogs(result);
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString();
    } catch {
      return '—';
    }
  };

  const tagColor = (success) => {
    return success ? 'bg-green-500' : 'bg-red-500';
  };

  const triggerExport = async () => {
    const token = localStorage.getItem('token');
    const previewRes = await axios.post('/api/admin/export-ocr-logs', {
        format: exportFormat,
        filters,
        reason: 'Export from OCR Log Viewer',
        previewOnly: true,
      });

    const previewData = previewRes.data;
    const confirmed = window.confirm(
      `This export will contain ${previewData.recordCount} records. Proceed?`
    );
    if (!confirmed) return;

    const fileRes = await fetch('/api/admin/export-ocr-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        format: exportFormat,
        filters,
        reason: 'Export from OCR Log Viewer',
      }),
    });

    const blob = await fileRes.blob();
    const fileName = `ocr_export.${exportFormat}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧠 Admin OCR Usage Log</h1>

      {loading && <p>Loading logs...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Filter by User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Filter by File Type"
              value={filters.mimeType}
              onChange={(e) => handleFilterChange('mimeType', e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Filter by Language Hint"
              value={filters.languageHint}
              onChange={(e) => handleFilterChange('languageHint', e.target.value)}
              className="input"
            />
            <select
              value={filters.success}
              onChange={(e) => handleFilterChange('success', e.target.value)}
              className="input"
            >
              <option value="">All</option>
              <option value="true">Success</option>
              <option value="false">Fail</option>
            </select>
          </div>

          <div className="flex items-center justify-between mb-4">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="input w-48"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
            <button className="btn btn-primary" onClick={triggerExport}>
              Export Logs
            </button>
          </div>

          <table className="w-full border mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Timestamp</th>
                <th className="p-2 text-left">User ID</th>
                <th className="p-2 text-left">File Type</th>
                <th className="p-2 text-left">Language</th>
                <th className="p-2 text-left">Confidence</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{formatDate(log.timestamp)}</td>
                  <td className="p-2">{log.userId}</td>
                  <td className="p-2">{log.mimeType}</td>
                  <td className="p-2">{log.languageHint || 'en'}</td>
                  <td className="p-2">{log.confidence !== null ? `${log.confidence.toFixed(2)}%` : '—'}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-white text-xs ${tagColor(log.success)}`}>
                      {log.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
