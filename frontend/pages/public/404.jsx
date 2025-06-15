import React from "react";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white text-center px-6">
      <HelmetProvider>
        <Helmet>
          <title>Page Not Found | Global Entry Hub</title>
          <meta name="robots" content="noindex" />
        </Helmet>
      </HelmetProvider>

      <img
        src="/assets/og-card.png"
        alt="Mira - Global Entry Hub"
        className="w-40 h-40 mb-6 rounded-full shadow-md"
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-6 max-w-xl">
        We couldn’t find that page — but Mira can still help. Let’s get you back to where you need to be.
      </p>

      <Link
        to="/"
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition"
      >
        Return to Homepage
      </Link>
    </main>
  );
}
