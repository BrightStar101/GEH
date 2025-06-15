// File: /frontend/components/shared/TopBannerCTA.jsx

import React, { useEffect, useState } from "react";
import { getUserPlanMetadata } from "../../services/planMetadataService";
import { logger } from "../../utils/logger";

/**
 * TopBannerCTA.jsx
 * Displays a rotating or conditional call-to-action banner based on user plan metadata.
 * Common banners include time-based alerts (e.g., AI access ending), upgrade prompts, or new agent invites.
 *
 * Props:
 * - token: JWT auth token (required)
 * - activeAgent: "Mira" | "Kairo" | "Lumo"
 */
export default function TopBannerCTA({ token, activeAgent }) {
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function resolveBanner() {
      try {
        const data = await getUserPlanMetadata(token);

        if (!data?.success) {
          throw new Error("Failed to retrieve plan metadata");
        }

        const { plan, hoursLeft, agentsAvailable } = data;

        // ⚠️ Warning for expiring Mira usage
        if (hoursLeft !== null && hoursLeft < 12 && activeAgent === "Mira") {
          setBanner({
            type: "warning",
            message: `⚠️ Your AI access expires in ${hoursLeft} hours. Upgrade to keep working.`,
            actionText: "Upgrade Now",
            actionPath: "/purchase",
          });
        }

        // 🚫 Block Kairo promotion if not yet live
        else if (
          activeAgent === "Mira" &&
          agentsAvailable.includes("Kairo") &&
          import.meta.env.REACT_APP_KAIRO_LIVE === "true"
        ) {
          setBanner({
            type: "promo",
            message: `🎯 Meet Kairo – Your financial setup assistant is ready.`,
            actionText: "Try Kairo",
            actionPath: "/kairo",
          });
        }
      } catch (err) {
        logger.error("TopBannerCTA error:", err);
        setError("Unable to fetch banner content.");
      }
    }

    resolveBanner();
  }, [token, activeAgent]);

  if (!banner) return null;

  const bannerClass = {
    warning: "border-yellow-400 bg-yellow-100 text-yellow-800",
    promo: "border-teal-500 bg-teal-50 text-teal-700",
  }[banner.type] || "border-gray-300 bg-gray-50 text-gray-700";

  return (
    <div
      className={`w-full p-3 border-l-4 ${bannerClass} mb-4 rounded-md flex justify-between items-center`}
    >
      <div className="flex items-center">
        {banner.type === "promo" &&
          banner.message.includes("Kairo") &&
          import.meta.env.REACT_APP_KAIRO_LIVE === "true" && (
            <img
              src="/images/kairo.png"
              alt="Kairo - Your Financial Setup Guide"
              width="42"
              height="42"
              className="mr-3 rounded-full border border-teal-300 shadow-sm"
            />
          )}
        <span className="text-sm">{banner.message}</span>
      </div>
      <a
        href={banner.actionPath}
        className="ml-4 text-sm font-medium underline text-blue-700 hover:text-blue-900"
      >
        {banner.actionText}
      </a>
    </div>
  );
}
