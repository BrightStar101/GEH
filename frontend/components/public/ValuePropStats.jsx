// File: /frontend/components/public/ValuePropStats.jsx
// Purpose: Display core GEH value metrics — speed, cost savings, accuracy, reach

import React from "react";
import PropTypes from "prop-types";
import languageSupportConfig from "../../config/languageSupportConfig";

/**
 * ValuePropStats.jsx
 *
 * Displays high-conversion value proposition metrics including time saved,
 * average cost savings, verified accuracy, and multilingual/country reach.
 *
 * Pulls real-time counts from config to ensure consistency.
 */

export default function ValuePropStats({ countriesSupported = 12 }) {
  try {
    const liveLanguages = languageSupportConfig?.available?.length || 0;
    const inTraining = languageSupportConfig?.upcoming?.length || 0;

    return (
      <section className="py-12 bg-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-gray-800">
            <div>
              <p className="text-3xl font-bold text-blue-700 mb-2">5x Faster</p>
              <p className="text-sm">Average time saved vs. manual filing or legal prep</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700 mb-2">$700–$950</p>
              <p className="text-sm">Average cost savings per user compared to legal fees</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700 mb-2">99.2%</p>
              <p className="text-sm">Verified AI form accuracy across supported visa types</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700 mb-2">
                {liveLanguages + inTraining}+ / {countriesSupported}
              </p>
              <p className="text-sm">Languages in progress / Countries supported</p>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (err) {
    console.error("ValuePropStats rendering failed:", err);
    return null;
  }
}

ValuePropStats.propTypes = {
  countriesSupported: PropTypes.number, // Pass as prop or default to 12
};
