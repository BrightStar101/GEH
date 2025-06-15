// File: frontend/pages/public/Login.jsx
// Global Entry Hub – Login Page (JWT-based, tier-aware, fully styled)

import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalMetaHelmet from "../../components/GlobalMetaHelmet";
import FooterNavigation from "../../components/public/FooterNavigation";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * Login Page
 * Allows users to log in using email and password.
 * Authenticates with backend API and stores JWT token in localStorage.
 */
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAuthToken } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/login", { email, password });

      if (!res.data.token) {
        throw new Error(res.data.message || "Login failed.");
      }

      setAuthToken(res.data.token, navigate)
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalMetaHelmet title="Login – Global Entry Hub" />
      {/* <HeaderNav /> */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
        <div className="max-w-md w-full bg-white border rounded-lg p-6 shadow-md">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Login to Continue</h1>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-300 rounded px-3 py-2 mb-4 text-sm">
              {error}
            </div>
          )}

          <label className="block mb-3 text-sm">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </label>

          <label className="block mb-6 text-sm">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </label>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Need help? Email <a href="mailto:support@globalentryhub.com" className="underline text-blue-600">support@globalentryhub.com</a>
          </p>
        </div>
      </main>
      
    </>
  );
}
