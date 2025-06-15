import React, { useEffect } from "react";
import MetaHead from "../../components/public/MetaHead";
import FooterNavigation from "../../components/public/FooterNavigation";
import analyticsTracker from "../../utils/analyticsTracker";

/**
 * Support.jsx
 * Global Entry Hub – Public Support Page
 *
 * Provides support contact guidance, SEO metadata, and engagement tracking.
 * Fully production-ready under GEH frontend standards.
 */
export default function Support() {
  useEffect(() => {
    try {
      analyticsTracker.logPageView("support_page");
    } catch (err) {
      console.warn("Support page analytics tracking failed:", err);
    }
  }, []);

  return (
    <>
      <MetaHead
        title="Support | Global Entry Hub"
        description="Need help? Contact Global Entry Hub support or reach out through Mira, your AI assistant."
        canonical="https://www.globalentryhub.com/support"
      />

      <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-16 bg-white text-gray-800">
        <h1 className="text-3xl font-bold mb-4">Need Help?</h1>
        <p className="text-lg mb-6 max-w-xl">
          We're here to support your immigration journey. For questions about forms, billing, or technical issues, please reach out:
        </p>

        <div className="text-base text-gray-700">
          <p className="mb-2">📧 Email: <a href="mailto:support@globalentryhub.com" className="text-blue-600 underline">support@globalentryhub.com</a></p>
          <p className="mb-2">💬 In-App Help: Use the Mira assistant chat on any page</p>
        </div>

        <p className="mt-8 text-sm text-gray-500">Our team typically responds within 24–48 hours.</p>

        <div className="mt-12 w-full">
          
        </div>
      </main>
    </>
  );
}