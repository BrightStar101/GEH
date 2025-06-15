// File: /frontend/components/user/LifetimeUpsellBanner.jsx
// Purpose: Warns user of expiring file and offers upgrade CTA (file + bulk)

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

/**
 * LifetimeUpsellBanner.jsx
 *
 * Displays a banner for expiring PDF files and offers a lifetime upgrade path.
 * Includes:
 * - Auto-dismiss if file already upgraded
 * - Sticky CTA on mobile
 */

export default function LifetimeUpsellBanner({ fileId }) {
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [isLifetime, setIsLifetime] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchExpiryData() {
      try {
        const token = localStorage.getItem("jwt");
        const res = await axios.get(`/api/pdf/check-expiry/${fileId}`);
        const data = res.data;
        if (!data.success) {
          throw new Error(data.message || "Unable to load file info");
        }

        setDaysRemaining(data.daysRemaining);
        setIsLifetime(data.isLifetime);
      } catch (err) {
        console.error("LifetimeUpsellBanner fetch error:", err);
        setError("Error loading file status.");
      } finally {
        setLoading(false);
      }
    }

    fetchExpiryData();
  }, [fileId]);

  // Dismiss banner if already upgraded or still loading
  if (loading || isLifetime) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 p-4 my-6 rounded-md shadow-sm md:sticky md:bottom-0 md:z-40">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="font-semibold">
            This file will expire in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}.
          </p>
          <p className="text-sm">
            Upgrade now to keep it forever — and never lose access again.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          <a
            href={`/user/upgrade/${fileId}`}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
          >
            Upgrade Now
          </a>
          <a
            href="/user/upgrade-all"
            className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition"
          >
            Upgrade All for $3
          </a>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-600 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

LifetimeUpsellBanner.propTypes = {
  fileId: PropTypes.string.isRequired,
};
