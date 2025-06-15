// File: /frontend/components/shared/SupportNav.jsx

import React from "react";
import { useRouter } from "next/router";

/**
 * SupportNav.jsx
 * Displays navigation links for all legal and compliance-related support tools.
 * Used as a sidebar or top-of-page panel in all `/support/*` routes.
 *
 * Props:
 * - currentPath: string representing current active route (used to highlight selected tab)
 */
export default function SupportNav({ currentPath }) {
  const router = useRouter();

  const navItems = [
    { label: "Privacy Policy", path: "/support/privacy" },
    { label: "Terms of Service", path: "/support/terms" },
    { label: "AI Support Access", path: "/support/ai" },
    { label: "Security Overview", path: "/support/security" },
    { label: "Export My Data", path: "/support/export-my-data" },
    { label: "Delete My Data", path: "/support/delete-my-data" },
    { label: "Compliance: Policy & Consent", path: "/support/compliance-status" },
    { label: "Compliance: Requests Log", path: "/support/compliance-requests" },
  ];

  return (
    <nav className="w-full md:w-64 bg-gray-50 border-r px-4 py-6 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
        Support Center
      </h2>
      <ul className="space-y-2">
        {navItems.map(({ label, path }) => (
          <li key={path}>
            <button
              onClick={() => router.push(path)}
              className={`w-full text-left text-sm px-3 py-2 rounded-md transition ${
                currentPath === path
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
