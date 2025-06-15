// File: /frontend/components/public/ComplianceBadge.jsx
// Purpose: Displays labeled compliance badges with tooltips for clarity and trust

import React from "react";
import PropTypes from "prop-types";

/**
 * ComplianceBadge.jsx
 *
 * Renders compliance-related labels (e.g., GDPR, CCPA) with tooltips to explain each term.
 * Each badge is styled and labeled for user trust.
 */

const complianceTooltips = {
  GDPR: "General Data Protection Regulation (EU)",
  CCPA: "California Consumer Privacy Act (US)",
  "AI Explainability": "Outputs can be traced and reviewed for accuracy",
  "DSAR Ready": "Supports Data Subject Access Requests (export/delete)",
};

export default function ComplianceBadge({ labels }) {
  if (!Array.isArray(labels) || labels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {labels.map((label, idx) => (
        <span
          key={idx}
          title={complianceTooltips[label] || label}
          className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full border border-green-300 shadow-sm cursor-help"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

ComplianceBadge.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
};
