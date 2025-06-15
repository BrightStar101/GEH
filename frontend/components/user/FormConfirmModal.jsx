import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ConfirmDownloadModal({ open, onClose, formId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!open) return null;

  const onConfirm = async () => {
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
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Download failed. You may need to upgrade your plan.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-2">You're All Set!</h2>
        <p className="text-gray-600 mb-4">Do you want to download the PDF file?</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? 'Preparing Download...' : 'Download My Form'}
          </button>
        </div>
      </div>
    </div>
  );
}