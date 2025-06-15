import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AgentTogglePanel from "@/components/admin/AgentTogglePanel.jsx";
import UpgradePerformanceChart from "@/components/admin/UpgradePerformanceChart.jsx";
import ModelDriftWarningBanner from "@/components/admin/ModelDriftWarningBanner.jsx";
import axios from "axios";

/**
 * AdminIntelligenceCenter.jsx
 *
 * Secure admin-only dashboard for managing agent toggles and monitoring system health.
 * Pulls metrics, upgrades, and toggle flags from backend APIs.
 */
export default function AdminIntelligenceCenter() {
  const [toggles, setToggles] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [flags, setFlags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const token = localStorage.getItem("jwt");
    if (!token) return navigate("/login");

    async function fetchData() {
      try {
        const [togglesRes, metricsRes, flagsRes] = await Promise.all([
          axios.get("/api/admin/agents/toggles"),
          axios.get("/api/admin/metrics/system-health"),
          axios.get("/api/admin/audit/upgrade-failures"),
        ]);

        const togglesData = togglesRes.data;
        const metricsData = metricsRes.data;
        const flagsData = flagsRes.data;

        if (!togglesData.success || !metricsData.success || !flagsData.success) {
          throw new Error("Failed to load admin dashboard content.");
        }

        if (isMounted) {
          setToggles(togglesData.data);
          setMetrics(metricsData.data);
          setFlags(flagsData.data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load dashboard content.");
          console.error("AdminIntelligenceCenter fetch error:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return <p className="p-4 text-gray-500 text-sm">Loading admin metrics...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-600 text-sm">{error}</p>;
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Admin Intelligence Center</h1>

      <section className="mb-6">
        <ModelDriftWarningBanner flags={flags} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Upgrade Performance</h2>
        <UpgradePerformanceChart data={metrics?.upgradePerformance || []} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Feature Toggles</h2>
        <AgentTogglePanel toggles={toggles} />
      </section>
    </main>
  );
}
