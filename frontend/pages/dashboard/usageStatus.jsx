import React, { useEffect, useState } from "react";
import { formatFullUsageSummary } from "../../utils/formatUsageStats";
// import { getAgentTheme } from "../../utils/getAgentTheme";
// import { fetchUserPlan } from "../../services/planMetadataService";
import { logger } from "../../utils/logger";
import axios from "axios";

/**
 * UsageStatus
 * ------------------------------
 * Displays current plan, usage stats, and PDF access eligibility.
 * Gated via monetization policy for GEH SaaS.
 *
* Props:
 * - token: string (JWT token required for user validation)
 */
export default function UsageStatus({ token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usageData, setUsageData] = useState({
    planTier: null,
    planActivatedAt: null,
    formUsed: 0,
    extraPrompts: null,
    promptsUsed: 0,
    hoursLeft: 0
  });

  const [canDownloadPDF, setCanDownloadPDF] = useState(false);
  const [hasUsedFreeForm, setHasUsedFreeForm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!token || typeof token !== "string") {
      if (isMounted) {
        setError("Invalid token provided");
        setLoading(false);
      }
      return;
    }

    async function loadPlanMetadata() {
      try {
        const response = await axios.get('/api/user/tier');
        const {
          planTier,
          planActivatedAt,
          formUsed,
          promptsUsed,
          extraPrompts,
          features
        } = response.data;


        if (isMounted) {
          setUsageData({
            planTier,
            formUsed,
            promptsUsed,
            planActivatedAt,
            extraPrompts,
            hoursLeft: parseInt(features.aiAccessHours - (Date.now() - new Date(planActivatedAt)) / 1000 / 60 / 60) ?? 0,
          });

          const isFree = planTier?.toLowerCase() === "free";
          const maxReached = (formUsed ?? 0) >= (features.maxForms ?? 1);
          setCanDownloadPDF(!isFree || !maxReached);
          setHasUsedFreeForm(isFree && maxReached);
        }
      } catch (err) {
        console.log(err)
        if (isMounted) {
          logger.error("usageStatus.loadPlanMetadata failed", err);
          setError("Unable to load usage information");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlanMetadata();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // const theme = getAgentTheme(usageData.activeAgent);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 italic">
        Loading usage data...
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-500">⚠️ {error}</div>;
  }

  const usageString = formatFullUsageSummary({
    tierId: usageData.planTier,
    formsUsed: usageData.formUsed,
    promptsUsed: usageData.promptsUsed,
    hoursRemaining: usageData.hoursLeft
  });

  return (
    <div className="rounded-lg border px-4 py-3 shadow-sm bg-white">
      <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4">
        <span className="text-gray-600 text-sm">
          <strong>Plan:</strong> {usageData.planTier}
        </span>
      </div>

      <div className="text-sm font-semibold text-gray-800 mt-2 md:mt-0">
        {usageString.forms}<br />
        {usageString.prompts}<br />
        {
          usageData.extraPrompts && (
            <>{usageData.extraPrompts} extra prompts<br/></>
          )
        }
        {usageString.time}<br />
        {!canDownloadPDF && (
          <div className="text-red-500 text-xs mt-1">
            You've used your free form. Upgrade to unlock more.
          </div>
        )}
      </div>
    </div>
  );
}

// export { canDownloadPDF, hasUsedFreeForm };
