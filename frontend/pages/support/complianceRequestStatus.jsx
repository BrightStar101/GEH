// File: /frontend/pages/support/complianceStatus.jsx

import React, { useEffect, useState } from "react";
import { getComplianceStatus } from "../../services/legalDataService";
import { logger } from "../../utils/logger";

/**
 * complianceStatus.jsx
 * Displays the read-only status of the user’s GDPR/CCPA requests (export, delete).
 * This supports transparency and auditability of active or completed compliance actions.
 *
 * Props:
 * - token: JWT auth token (required)
 */
export default function ComplianceStatus({ token }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStatus() {
      try {
        const result = await getComplianceStatus(token);
        if (isMounted) {
          if (result?.success && result?.data) {
            setStatus(result.data);
          } else {
            throw new Error("Failed to retrieve compliance status");
          }
        }
      } catch (err) {
        if (isMounted) {
          logger.error("ComplianceStatus.fetchStatus failed", err);
          setError("Unable to retrieve compliance information.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) {
    return <p className="text-sm text-gray-500 italic">Loading compliance status...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500">⚠️ {error}</p>;
  }

  if (!status) {
    return <p className="text-sm text-gray-600">No compliance activity on record.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4 py-6 border rounded-lg shadow-sm bg-white">
      <h1 className="text-lg font-semibold text-gray-800 mb-3">Compliance Request Status</h1>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 border-b">Request Type</th>
            <th className="py-2 px-3 border-b">Status</th>
            <th className="py-2 px-3 border-b">Requested On</th>
            <th className="py-2 px-3 border-b">Completed On</th>
          </tr>
        </thead>
        <tbody>
          {status.map((entry, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 px-3">{entry.type}</td>
              <td className="py-2 px-3">{entry.status}</td>
              <td className="py-2 px-3">{new Date(entry.requestedAt).toLocaleString()}</td>
              <td className="py-2 px-3">
                {entry.completedAt ? new Date(entry.completedAt).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
