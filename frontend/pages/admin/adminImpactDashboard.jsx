import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetaHead from "../../components/public/MetaHead";
import analyticsTracker from "../../utils/analyticsTracker";
import { getAdminImpactMetrics } from "../../services/adminMetricsService";

/**
 * adminImpactDashboard.jsx
 *
 * Displays anonymized internal platform metrics such as:
 * - Form completions
 * - Language usage distribution
 * - AI session volume
 * - Regional access clusters
 * Access is restricted to authenticated admin users via JWT.
 */

export default function AdminImpactDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMetrics() {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await getAdminImpactMetrics(token);
        if (!response || !response.success) throw new Error("Unauthorized or invalid response");

        if (isMounted) {
          setMetrics(response.data);
          analyticsTracker.logEvent("admin_impact_view", { source: "admin-dashboard" });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load admin metrics:", err);
          setError("You are not authorized to view this page.");
        }
      }
    }

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <MetaHead
        title="Admin Impact Dashboard | Global Entry Hub"
        description="Internal dashboard showing form, user, and language-level usage metrics."
        canonical="https://www.globalentryhub.com/admin-impact"
        ogUrl="https://www.globalentryhub.com/admin-impact"
      />

      <div className="bg-gray-50 min-h-screen px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-blue-700">Impact Metrics Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">Total Forms Completed</h2>
              <p className="text-3xl text-blue-600 font-bold">{metrics.totalForms}</p>
            </div>

            <div className="bg-white shadow p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">AI Sessions Run</h2>
              <p className="text-3xl text-blue-600 font-bold">{metrics.totalAISessions}</p>
            </div>

            <div className="bg-white shadow p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">Top Languages</h2>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                {metrics.topLanguages.map((lang, idx) => (
                  <li key={idx}>{lang.name} – {lang.count}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white shadow p-6 rounded-xl">
              <h2 className="text-lg font-semibold mb-2">Access by Country</h2>
              <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
                {metrics.topCountries.map((country, idx) => (
                  <li key={idx}>{country.name} – {country.count}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 text-sm text-gray-500 text-center">
            Data is anonymized. Export available on request.
          </div>
        </div>
      </div>
    </>
  );
}
