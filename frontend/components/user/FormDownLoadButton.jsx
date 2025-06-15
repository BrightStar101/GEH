// components/FormDownloadButton.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FormDownloadButton({ formId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDownload = async () => {
    try {
      setError('');
      setLoading(true);

      const res = await axios.get(`/api/download/${formId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Download failed. You may need to upgrade your plan.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 text-center space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Preparing Download...' : 'Download My Form'}
      </button>
      {error && (
        <button
          onClick={() => navigate('/upgrade')}
          className="block mx-auto text-sm text-blue-600 hover:underline mt-2"
        >
          Upgrade to unlock access →
        </button>
      )}
    </div>
  );
}
