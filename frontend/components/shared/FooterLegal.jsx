// File: /frontend/components/shared/FooterLegal.jsx

import React from "react";

/**
 * FooterLegal.jsx
 * Renders the standard legal footer used across all pages in Global Entry Hub.
 * Includes links to legal and support documents, brand imprint, and a security statement.
 *
 * Props: none (self-contained)
 */
export default function FooterLegal() {
  return (
    <footer className="w-full mt-10 px-4 py-6 bg-gray-50 text-gray-600 border-t text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between space-y-3 md:space-y-0">
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0">
          <Link to="/support/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link to="/support/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link to="/support/ai" className="hover:underline">
            AI Support Access
          </Link>
          <Link to="/support/security" className="hover:underline">
            Security Overview
          </Link>
        </div>

        <div className="text-xs text-gray-500 text-center md:text-right leading-tight">
          © {new Date().getFullYear()} GoldenKeyHoldCo LLC  
          <br className="md:hidden" />
          DBA Global Entry Hub — Patent Pending
        </div>
      </div>
    </footer>
  );
}
