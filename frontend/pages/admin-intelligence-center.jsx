/**
 * Admin Intelligence Center
 *
 * Global Entry Hub (GEH)
 * /frontend/pages/admin-intelligence-center.jsx
 *
 * Purpose:
 * Displays secure, filterable audit logs of all PDF download activity.
 * Enforced by admin-only access, pulls real-time data from a protected API,
 * and provides a clear audit interface with visual tagging.
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function AdminIntelligenceCenter() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    userId: '',
    formId: '',
    country: '',
    downloadType: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Enforces admin-only access using JWT claims from localStorage.
   * Redirects unauthorized users to /unauthorized.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const claims = JSON.parse(localStorage.getItem('claims') || '{}');
    if (!token || claims.role !== 'admin') {
      router.replace('/unauthorized');
    }
  }, [router]);

  /**
   * Fetches audit logs from the backend API.
   * Populates both full and filtered state arrays.
   */
  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/pdf-audit');
      const data = res.data;

      setLogs(data.logs || []);
      setFilteredLogs(data.logs || []);
      setLoading(false);
    } catch (err) {
      console.error('Admin Intelligence Center: fetch error', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Trigger fetch on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  /**
   * Updates filter state and applies the filters immediately.
   * @param {string} field - The filter key
   * @param {string} value - The new filter value
   */
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  /**
   * Applies active filters to the full logs array and updates the filtered view.
   * @param {Object} filters - The full filter state object
   */
  const applyFilters = (filters) => {
    const filtered = logs.filter((log) => {
      return (
        (!filters.userId || log.userId.includes(filters.userId)) &&
        (!filters.formId || log.formId.includes(filters.formId)) &&
        (!filters.country || (log.geo?.country || '').toLowerCase().includes(filters.country.toLowerCase())) &&
        (!filters.downloadType || log.downloadType === filters.downloadType)
      );
    });
    setFilteredLogs(filtered);
  };

  /**
   * Formats ISO date strings into human-readable format.
   * Handles invalid inputs gracefully.
   * @param {string} date - Raw ISO timestamp
   * @returns {string} - Localized date string
   */
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleString();
    } catch {
      return '—';
    }
  };

  /**
   * Renders a downloadType badge with contextual color.
   * @param {string} type - 'user', 'admin', or 'system'
   * @returns {JSX.Element}
   */
  const renderTag = (type) => {
    const base = 'inline-block px-2 py-1 rounded text-white text-xs';
    const colors = {
      user: 'bg-blue-500',
      admin: 'bg-yellow-500',
      system: 'bg-gray-600',
    };
    return <span className={`${base} ${colors[type] || 'bg-slate-400'}`}>{type.toUpperCase()}</span>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Admin Intelligence Center</h1>

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
              placeholder="Filter by Form ID"
              value={filters.formId}
              onChange={(e) => handleFilterChange('formId', e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Filter by Country"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="input"
            />
            <select
              value={filters.downloadType}
              onChange={(e) => handleFilterChange('downloadType', e.target.value)}
              className="input"
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="system">System</option>
            </select>
          </div>

          <table className="w-full border mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Timestamp</th>
                <th className="p-2 text-left">User ID</th>
                <th className="p-2 text-left">Form ID</th>
                <th className="p-2 text-left">Country</th>
                <th className="p-2 text-left">Download Type</th>
                <th className="p-2 text-left">Locale</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{formatDate(log.timestamp)}</td>
                  <td className="p-2">{log.userId}</td>
                  <td className="p-2">{log.formId}</td>
                  <td className="p-2">{log.geo?.country || '—'}</td>
                  <td className="p-2">{renderTag(log.downloadType)}</td>
                  <td className="p-2">{log.locale}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td className="p-2 text-center" colSpan="6">
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
