import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EmailWaveDashboard = () => {
  const [waves, setWaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWave, setSelectedWave] = useState(null);
  const [waveLogs, setWaveLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchWaves = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/waves/summary', { withCredentials: true });
        if (isMounted) {
          setWaves(res.data.data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load waves:', err.message);
          setError('Unable to fetch wave history.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWaves();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchWaveDetails = async (waveId) => {
    try {
      setLoading(true);
      setSelectedWave(waveId);
      const res = await axios.get(`/api/admin/waves/${waveId}/audit`, { withCredentials: true });
      setWaveLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch wave logs:', err.message);
      setError('Unable to fetch email logs.');
    } finally {
      setLoading(false);
    }
  };

  const exportWaveLogs = async (waveId) => {
    try {
      const res = await axios.get(`/api/admin/waves/${waveId}/export`, {
        withCredentials: true,
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wave_${waveId}_email_logs.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err.message);
      setError('Failed to export logs.');
    }
  };

  const retryWave = async (waveId) => {
    try {
      setLoading(true);
      await axios.post(`/api/admin/waves/${waveId}/retry`, {}, { withCredentials: true });
      fetchWaves(); // Refresh wave summary
    } catch (err) {
      console.error('Retry failed:', err.message);
      setError('Wave retry failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📡 Email Wave Dashboard</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="overflow-x-auto border border-gray-200 rounded mb-6">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Wave</th>
              <th className="p-2 border">Template</th>
              <th className="p-2 border">Triggered By</th>
              <th className="p-2 border">Sent / Failed</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Start</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {waves.map((wave) => (
              <tr key={wave._id} className="hover:bg-gray-50">
                <td className="p-2 border text-center">{wave.waveNumber}</td>
                <td className="p-2 border">{wave.templateGroup}</td>
                <td className="p-2 border">{wave.triggeredBy}</td>
                <td className="p-2 border text-center">{wave.sentCount} / {wave.failedCount}</td>
                <td className={`p-2 border text-center ${wave.status === 'completed' ? 'text-green-600' : 'text-yellow-700'}`}>
                  {wave.status}
                </td>
                <td className="p-2 border text-sm">{new Date(wave.startTime).toLocaleString()}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => fetchWaveDetails(wave._id)}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => exportWaveLogs(wave._id)}
                    className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Export
                  </button>
                  <button
                    onClick={() => retryWave(wave._id)}
                    className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedWave && (
        <div>
          <h3 className="text-lg font-semibold mb-2">📬 Wave {selectedWave} Email Logs</h3>
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Language</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Template</th>
                  <th className="p-2 border">Time</th>
                  <th className="p-2 border">Reason</th>
                </tr>
              </thead>
              <tbody>
                {waveLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border">{log.email}</td>
                    <td className="p-2 border">{log.language}</td>
                    <td className={`p-2 border ${log.status === 'failed' ? 'text-red-600' : 'text-green-600'}`}>
                      {log.status}
                    </td>
                    <td className="p-2 border">{log.templateId}</td>
                    <td className="p-2 border">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-2 border">{log.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailWaveDashboard;
