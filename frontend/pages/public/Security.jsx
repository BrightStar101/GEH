import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetaHead from "@/components/public/MetaHead";
import analyticsTracker from "../../utils/analyticsTracker";

/**
 * Security.jsx
 *
 * Placeholder security page that reroutes users to the Trust Center.
 * Used to maintain link integrity from older pages or search engine indexing.
 */

export default function SecurityRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      analyticsTracker.logPageView("security_page_placeholder");
    } catch (err) {
      console.warn("Security redirect tracking failed:", err);
    }

    // Redirect after brief pause
    const timeout = setTimeout(() => {
      navigate("/trust");
    }, 2500);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <>
      <MetaHead
        title="Security Overview | Global Entry Hub"
        description="All security, encryption, and compliance details are now available in our Trust Center."
        canonical="https://www.globalentryhub.com/security"
      />
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 text-gray-700">
        <h1 className="text-2xl font-semibold mb-4">Page Updated</h1>
        <p className="mb-2">We’ve moved our security and privacy details into the new Trust Center.</p>
        <p>You’ll be redirected automatically...</p>
      </main>
    </>
  );
}
