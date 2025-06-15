import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmailLogPanel = () => {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    wave: '',
    templateId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/email-logs', {
          params: {
            ...filters,
          },
          withCredentials: true,
        });
        if (isMounted) {
          setLogs(response.data.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Email log fetch failed:', err.message);
          setError('Failed to load email logs.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const fetchSummary = async () => {
      try {
        const response = await axios.get('/api/admin/email-summary', {
          withCredentials: true,
        });
        if (isMounted) {
          setSummary(response.data.data || {});
        }
      } catch (err) {
        if (isMounted) {
          console.error('Email summary fetch failed:', err.message);
        }
      }
    };

    fetchLogs();
    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">📧 Email Log Dashboard</h2>

      <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          name="templateId"
          value={filters.templateId}
          onChange={handleFilterChange}
          placeholder="Template ID"
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          placeholder="Status (sent, failed...)"
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="wave"
          value={filters.wave}
          onChange={handleFilterChange}
          placeholder="Wave (1–5)"
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="col-span-full md:col-span-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </form>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div className="text-gray-600">Loading email logs...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Template</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Wave</th>
                  <th className="p-2 border">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border">{log.email}</td>
                    <td className="p-2 border">{log.templateId}</td>
                    <td className={`p-2 border ${log.status === 'failed' || log.status === 'bounced' ? 'text-red-600' : ''}`}>
                      {log.status}
                    </td>
                    <td className="p-2 border">{log.wave || '-'}</td>
                    <td className="p-2 border">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <h3 className="font-medium mb-2">📊 Summary (Status Totals)</h3>
            <ul className="text-sm">
              {Object.entries(summary).map(([status, count]) => (
                <li key={status}>
                  <strong>{status}</strong>: {count}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default EmailLogPanel;
