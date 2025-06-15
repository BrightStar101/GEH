// File: /frontend/components/admin/UpgradePerformanceChart.jsx
// Purpose: Admin component for displaying upgrade performance metrics in chart and stat block form

import React from "react";
import PropTypes from "prop-types";

/**
 * UpgradePerformanceChart.jsx
 *
 * Displays upgrade totals, conversion %, and breakdown by tier.
 * Uses backend metrics pulled via AdminIntelligenceCenter.
 */

export default function UpgradePerformanceChart({ metrics }) {
  if (!metrics) {
    return <p className="text-sm text-gray-500">Metrics loading or unavailable.</p>;
  }

  const { totalFiles, totalUpgrades, upgradeRatePercent, upgradesByTier } = metrics;

  const tierColors = {
    starter: "bg-yellow-300",
    official: "bg-blue-400",
    family: "bg-green-400",
    unknown: "bg-gray-300",
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Upgrade Conversion Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-sm text-gray-500">Total Form Files</p>
          <p className="text-xl font-bold text-gray-800">{totalFiles}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Lifetime Upgrades</p>
          <p className="text-xl font-bold text-gray-800">{totalUpgrades}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Upgrade Rate</p>
          <p className="text-xl font-bold text-blue-600">{upgradeRatePercent}%</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-600">Upgrades by Tier</h3>
        <ul className="space-y-2">
          {Object.entries(upgradesByTier).map(([tier, count]) => (
            <li key={tier} className="flex justify-between items-center text-sm">
              <span className="capitalize">{tier}</span>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${tierColors[tier] || tierColors.unknown}`}></div>
                <span className="text-gray-700">{count}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

UpgradePerformanceChart.propTypes = {
  metrics: PropTypes.shape({
    totalFiles: PropTypes.number,
    totalUpgrades: PropTypes.number,
    upgradeRatePercent: PropTypes.string,
    upgradesByTier: PropTypes.objectOf(PropTypes.number),
  }),
};
