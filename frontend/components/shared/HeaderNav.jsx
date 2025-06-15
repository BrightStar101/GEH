// File: frontend/components/shared/HeaderNav.jsx
// Purpose: Global Entry Hub navigation bar with GPT access tier logic

import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import AdminTopBar from "../admin/AdminTopBar";

/**
 * HeaderNav
 * Displays top-level navigation and conditionally exposes AI access.
 * Plan tier detection is handled via decoded JWT (from localStorage).
 */
export default function HeaderNav() {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return !isAdmin ? (
    <header className="header-nav border-b bg-white shadow-sm px-4 py-2 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img
          src="/images/geh-logo.png"
          alt="Global Entry Hub Logo"
          width="36"
          height="36"
          className="rounded-full"
        />
        <Link to="/" className="text-lg font-semibold text-gray-800">
          Global Entry Hub
        </Link>
      </div>
      <nav className="flex items-center gap-5 text-sm text-gray-700">
        {user && <Link to="/dashboard">Dashboard</Link>}
        <Link to="/support">Support</Link>
        {user && (
          <>
            <Link to="/pricing">Pricing</Link>
            <Link to="/support/prompt-examples" className="text-blue-600 hover:underline">
              Prompt Help
            </Link>
            <Link to="/free-form" className="text-blue-600 hover:underline">
              Try Mira
            </Link>
          </>
        )}
        {
          user ? (
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-red-600 hover:underline"
            >
              Log Out
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate("/login");
                }}
                className="text-blue-600 hover:underline"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate("/register");
                }}
                className="text-blue-600 hover:underline"
              >
                Register
              </button>
            </>
          )
        }
      </nav>
    </header>
  ) : (
    <AdminTopBar />
  );
}
