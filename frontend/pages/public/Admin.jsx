import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MetaHead from "../../components/public/MetaHead";
import analyticsTracker from "../../utils/analyticsTracker";
import axios from "axios";

/**
 * Admin.jsx
 * Global Entry Hub – Protected Admin Dashboard
 *
 * Only accessible to authorized emails via JWT validation.
 * Handles internal access, logs admin usage, and enforces security.
 */

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    async function validateAdminAccess() {
      try {
        const token = localStorage.getItem("jwt_token");
        if (!token) throw new Error("Token missing");

        const res = await axios.post("/api/auth/verify-admin");
        const data = res.data;
        if (!data.success || !data.isAuthorized) {
          throw new Error("Unauthorized user");
        }

        const decoded = JSON.parse(atob(token.split(".")[1]));
        setAdminEmail(decoded?.email || "admin@globalentryhub.com");

        analyticsTracker.logPageView("admin_dashboard");
        setLoading(false);
      } catch (err) {
        console.warn("Admin access denied:", err);
        setUnauthorized(true);
        setLoading(false);
      }
    }

    validateAdminAccess();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        <p>Validating access...</p>
      </main>
    );
  }

  if (unauthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center text-center text-red-600 px-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p>You are not authorized to view this page. Please log in with an approved admin account.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
          >
            Return to Homepage
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <MetaHead
        title="Admin Dashboard | Global Entry Hub"
        description="Secure admin panel for Global Entry Hub. Access restricted to verified internal team members."
        canonical="https://www.globalentryhub.com/admin"
      />

      <main className="min-h-screen p-8 text-gray-800 bg-gray-50">
        <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">Logged in as <strong>{adminEmail}</strong></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">🕵️ Audit Logs</h2>
            <p className="text-gray-600">View recent system access and activity logs.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">🧹 UGC Moderation</h2>
            <p className="text-gray-600">Review and approve user-generated immigration stories.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">📊 Analytics Export</h2>
            <p className="text-gray-600">Download usage metrics and form completion stats.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-2">⏱️ Last Login</h2>
            <p className="text-gray-600">Now</p>
          </div>
        </div>
      </main>
    </>
  );
}
