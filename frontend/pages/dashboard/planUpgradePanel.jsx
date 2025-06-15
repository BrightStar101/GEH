import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { listAllPlans } from "../../services/planMetadataService";
import { logger } from "../../utils/logger";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * PlanUpgradePanel
 * ------------------------------
 * Displays upgrade options and routes user to checkout flow.
 * Uses usage context to dynamically recommend upgrades if limits are hit.
 *
 * Props:
 * - token: string (JWT auth token)
 * - hasUsedFreeForm: boolean (from usageStatus.jsx)
 * - canDownloadPDF: boolean (from usageStatus.jsx)
 */
export default function PlanUpgradePanel({ token, hasUsedFreeForm = false, canDownloadPDF = true }) {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    if (!token || typeof token !== "string") {
      if (isMounted) {
        setError("Invalid or missing token.");
        setLoading(false);
      }
      return;
    }

    async function loadPlans() {
      try {
        const result = listAllPlans();
        setPlans(result);
      } catch (err) {
        if (isMounted) {
          logger.error("planUpgradePanel.loadPlans failed", err);
          setError("Unable to load upgrade plans");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    async function loadProfile() {
      try {
        const res = await axios.get('/api/auth/profile');
        setProfile(res.data.user)
      } catch (err) {
        if (isMounted) {
          logger.error("planUpgradePanel.loadPlans failed", err);
          setError("Unable to load upgrade plans");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlans();
    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleUpgrade = async (planId) => {
    try {
      setSelectedPlan(planId);
      navigate(`/checkout?plan=${planId}`);
    } catch (err) {
      logger.error("planUpgradePanel.handleUpgrade failed", err);
      setError("Failed to start upgrade process");
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500 italic">Loading upgrade options...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">⚠️ {error}</div>;
  }

  if (!plans.length) {
    return (
      <div className="text-sm text-gray-600">
        You are already on the highest plan available.
      </div>
    );
  }

  let upgradeFlag = false;

  return (
    <div className="border rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-2">Upgrade Your Plan</h2>

      {hasUsedFreeForm && (
        <div className="mb-4 text-sm text-red-600">
          You’ve used your 1 free form. Upgrade now to unlock full access.
        </div>
      )}

      <ul className="space-y-3">
        {plans.map((plan) => (
          <li
            key={plan.id}
            className="border rounded-md p-3 flex flex-col md:flex-row md:items-center md:justify-between hover:shadow transition"
          >
            <div className="mb-2 md:mb-0">
              <span className="font-medium">{plan.name}</span>
              <p className="text-sm text-gray-600">{t(plan.descriptionKey)}</p>
            </div>
            {
              plan.id !== 'free' && upgradeFlag ? (
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-md disabled:opacity-50 cursor-pointer"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={selectedPlan === plan.id}
                >
                  {selectedPlan === plan.id ? "Processing..." : `Upgrade for ${plan.name}`}
                </button>
              ) : (
                plan.id === profile.planTier ? (
                  <>
                    {upgradeFlag = true}
                    Current plan
                  </>
                ) : ''
              )
            }
          </li>
        ))}
      </ul>
    </div>
  );
}
