import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import seoRedirectConfig from "../../config/seoRedirectConfig";
import analyticsTracker from "../../utils/analyticsTracker";
import GlobalMetaHelmet from "@/components/GlobalMetaHelmet"; // ✅ Added

export default function SeoRedirect() {
  const location = useLocation();
  const hostname = window.location.hostname;

  const config = seoRedirectConfig[hostname] || {
    title: "Immigration Support Powered by AI | Global Entry Hub",
    description: "Mira helps you complete immigration forms quickly, securely, and in your language.",
    redirectTo: "https://www.globalentryhub.com",
    ogImage: "/static/meta/mira-og-default.jpg",
  };

  useEffect(() => {
    try {
      analyticsTracker.logEvent("seo_redirect", {
        sourceDomain: hostname,
        targetUrl: config.redirectTo,
        path: location.pathname,
      });
    } catch (err) {
      console.warn("Redirect event tracking failed:", err);
    }

    const timer = setTimeout(() => {
      window.location.href = config.redirectTo;
    }, 5000);

    return () => clearTimeout(timer);
  }, [config.redirectTo, hostname, location.pathname]);

  return (
    <>
      <GlobalMetaHelmet /> {/* ✅ Injected OG meta for universal fallback */}

      <HelmetProvider>
        <Helmet>
          <title>{config.title}</title>
          <meta name="description" content={config.description} />
          <meta property="og:title" content={config.title} />
          <meta property="og:description" content={config.description} />
          <meta property="og:image" content={config.ogImage} />
          <meta property="og:url" content={config.redirectTo} />
          <meta name="robots" content="index,follow" />
        </Helmet>
      </HelmetProvider>

      <div className="flex items-center justify-center min-h-screen bg-white text-gray-800 text-center px-6">
        <div>
          <h1 className="text-2xl font-semibold mb-4">{config.title}</h1>
          <p className="mb-6">{config.description}</p>
          <p className="text-sm text-gray-500">You’ll be redirected shortly…</p>
        </div>
      </div>
    </>
  );
}
