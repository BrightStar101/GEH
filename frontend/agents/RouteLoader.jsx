// File: frontend/agents/RouteLoader.jsx

import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePaywall } from "../hooks/usePaywall";
import DashboardPage from "../pages/dashboard";
import TryMiraPage from "../pages/try-mira";
import PurchasePage from "../pages/purchase";
import ExportMyDataPage from "../pages/export-my-data";
import NotFoundPage from "../pages/404";
import KairoComingSoon from "../kairo/KairoComingSoon";
import { useLanguageContext } from "../hooks/useLanguageContext";

/**
 * PrivateRoute – Protects access to authenticated and gated content.
 * Checks for user authentication, and if gated, paywall tier.
 */
const PrivateRoute = ({ requiresPaid = false }) => {
  const { isAuthenticated } = useAuth();
  const { hasPaidAccess } = usePaywall();

  if (!isAuthenticated) {
    return <Navigate to="/purchase" replace />;
  }

  if (requiresPaid && !hasPaidAccess) {
    return <Navigate to="/purchase" replace />;
  }

  return <Outlet />;
};

/**
 * RouteLoader – Defines all route-level logic for the GEH frontend.
 * Includes auth protection, fallback handling, and Kairo lock logic.
 */
const RouteLoader = () => {
  const { languageReady } = useLanguageContext();

  if (!languageReady) {
    return <div>Loading your language preference...</div>;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/try-mira" />} />
      <Route path="/try-mira" element={<TryMiraPage />} />
      <Route path="/purchase" element={<PurchasePage />} />

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/export-my-data" element={<ExportMyDataPage />} />
      </Route>

      {/* Kairo CTA (Coming Soon Lock) */}
      <Route
        path="/kairo"
        element={
          import.meta.env.REACT_APP_KAIRO_LIVE === "true" ? (
            <Navigate to="/dashboard" />
          ) : (
            <KairoComingSoon />
          )
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default RouteLoader;
