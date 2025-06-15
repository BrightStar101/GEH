// File: /src/components/admin/AdminTopBar.jsx

import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * AdminTopBar.jsx
 * Top navigation bar for all admin routes.
 * - Highlights active link
 * - Shows pending alert badge if provided
 *
 * Props:
 * - user: { name: string, role: string }
 * - pendingAlerts: number (optional)
 */
export default function AdminTopBar({ pendingAlerts = 0 }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const currentPath = location.pathname;

  const shortcuts = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Audit Logs", path: "/admin/audit" },
    { label: "Override Panel", path: "/admin/override" },
    { label: "Try Mira", path: "/free-form" },
  ];

  const onLogoutClicked = e => {
    logout();
    navigate('/login');
  }

  return (
    <header className="w-full px-4 py-3 bg-gray-900 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Branding */}
        <div className="flex items-center space-x-3">
          <img src="/images/geh-logo.png" alt="GEH Admin" className="h-8" />
          <span className="text-lg font-semibold tracking-wide">GEH Admin</span>
        </div>

        {/* Navigation Shortcuts */}
        <nav className="hidden md:flex items-center space-x-4">
          {shortcuts.map(({ label, path }) => {
            const isActive = currentPath === path;
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`text-sm px-2 py-1 rounded-md transition ${
                  isActive
                    ? "bg-blue-600 text-white font-medium"
                    : "hover:underline text-gray-300"
                }`}
              >
                {label}
                {label === "Audit Logs" && pendingAlerts > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {pendingAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">
            {user?.name} <span className="text-xs italic">({user?.role})</span>
          </span>
          <button
            onClick={onLogoutClicked}
            className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md font-medium"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}