// File: /frontend/components/admin/ModelDriftWarningBanner.jsx
// Purpose: Admin banner to surface upgrade failures, confidence drift, or audit flags

import React from "react";
import PropTypes from "prop-types";

/**
 * ModelDriftWarningBanner.jsx
 *
 * Displays alert when upgrade failures or QA inconsistencies occur.
 * Used to highlight potential model drift, unmet user expectations,
 * or agent logic requiring review.
 */

export default function ModelDriftWarningBanner({ flags }) {
  if (!Array.isArray(flags) || flags.length === 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-4 mb-6 rounded-md shadow-sm">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-red-700">
            ⚠️ Model Attention Required
          </span>
          <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
            {flags.length} flagged issues
          </span>
        </div>

        <ul className="pl-5 text-sm list-disc text-red-800 space-y-1">
          {flags.slice(0, 3).map((log, index) => (
            <li key={index}>
              {log.fileId ? `File: ${log.fileId}` : "No file ID"} – {log.upgradeType}
              {log.createdAt && (
                <span className="ml-2 text-xs text-red-600">
                  ({new Date(log.createdAt).toLocaleString()})
                </span>
              )}
            </li>
          ))}
        </ul>

        <p className="text-xs text-red-500 italic">
          Review logs or agent toggles if patterns persist. This could indicate model drift or QA regression.
        </p>
      </div>
    </div>
  );
}

ModelDriftWarningBanner.propTypes = {
  flags: PropTypes.arrayOf(
    PropTypes.shape({
      fileId: PropTypes.string,
      upgradeType: PropTypes.string.isRequired,
      createdAt: PropTypes.string,
    })
  ).isRequired,
};
