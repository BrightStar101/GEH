import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * LifetimeUpgradePage.jsx
 *
 * Educates users about lifetime storage.
 * Includes file-specific urgency, upgrade CTAs, and behavioral nudges.
 */
export default function LifetimeUpgradePage() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [isLifetime, setIsLifetime] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkUpgradeStatus() {
      try {
        const token = localStorage.getItem("jwt");
        const res = await axios.get(`/api/pdf/check-expiry/${fileId}`);
        const data = res.data;
        if (!isMounted) return;

        if (data.isLifetime) {
          setUpgradeSuccess(true);
          setTimeout(() => navigate("/dashboard"), 2500);
        } else {
          setDaysRemaining(data.daysRemaining);
          setIsLifetime(false);
        }
      } catch (err) {
        if (isMounted) console.warn("Could not check upgrade status.");
      }
    }

    if (fileId) {
      checkUpgradeStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [fileId, navigate]);

  if (upgradeSuccess || isLifetime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-green-700 font-medium text-lg">✅ File already upgraded! Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Keep Your Files for Life</h1>

        {daysRemaining !== null && (
          <p className="text-sm text-red-600 font-medium mb-4">
            ⚠️ This file will auto-delete in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}.
          </p>
        )}

        <p className="text-gray-600 mb-6">
          Your form is currently stored for 90 days. After that, it will be permanently deleted unless upgraded.
        </p>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8 text-left text-sm">
          <ul className="list-disc pl-5 text-blue-800 space-y-2">
            <li>✅ Retain access forever</li>
            <li>✅ Works across all devices and logins</li>
            <li>✅ Secure, encrypted storage</li>
            <li>✅ Saves you from repeating paperwork or refilling data</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {fileId && (
            <a
              href={`/api/upsell/upgrade/${fileId}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition"
            >
              Upgrade This File – $1
            </a>
          )}
          <a
            href="/api/upsell/upgrade-all"
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm font-medium transition"
          >
            Upgrade All Files – $3
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-3 italic">
          Don’t risk losing access — once deleted, your form cannot be recovered.
        </p>
      </div>
    </div>
  );
}
