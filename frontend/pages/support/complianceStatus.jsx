/**
 * complianceStatus.jsx
 *
 * Global Entry Hub (GEH)
 * Compliance Transparency Panel
 *
 * Purpose:
 * Displays user-facing compliance metadata such as:
 * - policy version accepted
 * - last data export date
 * - consent status (if enabled)
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ComplianceStatus() {
  const [status, setStatus] = useState('loading');
  const [complianceData, setComplianceData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchComplianceStatus() {
      try {
        const response = await axios.get('/support/compliance-status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (isMounted) {
          setComplianceData(response.data);
          setStatus('ready');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Compliance fetch failed:', err.message);
          setError('Unable to load compliance details at this time.');
          setStatus('error');
        }
      }
    }

    fetchComplianceStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-semibold mb-4">My Compliance Status</h1>

      {status === 'loading' && (
        <p className="text-gray-600">Loading your compliance records...</p>
      )}

      {status === 'error' && (
        <p className="text-red-600 font-medium">⚠️ {error}</p>
      )}

      {status === 'ready' && complianceData && (
        <div className="space-y-4 text-sm text-gray-800">
          <div>
            <strong>Accepted Policy Version:</strong>{' '}
            {complianceData.policyVersion || 'Not recorded'}
          </div>
          <div>
            <strong>Accepted On:</strong>{' '}
            {complianceData.acceptedAt
              ? new Date(complianceData.acceptedAt).toLocaleString()
              : 'Unknown'}
          </div>
          <div>
            <strong>Last Export Download:</strong>{' '}
            {complianceData.lastExportAt
              ? new Date(complianceData.lastExportAt).toLocaleString()
              : 'No exports performed'}
          </div>
          {complianceData.marketingConsent !== undefined && (
            <div>
              <strong>Marketing Consent:</strong>{' '}
              {complianceData.marketingConsent ? '✅ Opted In' : '❌ Opted Out'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
