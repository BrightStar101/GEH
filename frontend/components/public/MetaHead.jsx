// File: /frontend/components/public/MetaHead.jsx
// Purpose: Shared SEO + Open Graph metadata handler — updated to reflect GEH brand logo for sharing visuals

import React from "react";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import PropTypes from "prop-types";

/**
 * MetaHead.jsx
 *
 * Reusable Open Graph + SEO metadata component.
 * Applies canonical title, description, favicon, and OG tags for brand sharing trust.
 *
 * @param {string} title - Page title to display in browser tab and search engines
 * @param {string} description - Short SEO description (~150 chars)
 * @param {string} canonical - Canonical URL for Google indexing
 * @param {string} ogImage - Path to Open Graph preview image (optional)
 * @param {string} ogUrl - Canonical URL for OG preview
 */
export default function MetaHead({
  title,
  description,
  canonical,
  ogImage = "/images/geh-logo.png",
  ogUrl = "https://www.globalentryhub.com",
}) {
  try {
    return (
      <HelmetProvider>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={canonical} />

          {/* Favicon + Platform Icons */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          {/* <link rel="manifest" href="/site.webmanifest" /> */}

          {/* Open Graph Tags */}
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:url" content={ogUrl} />
          <meta property="og:type" content="website" />

          {/* Twitter Card (Optional) */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={ogImage} />
        </Helmet>
      </HelmetProvider>
    );
  } catch (err) {
    console.error("MetaHead render error:", err);
    return null;
  }
}

MetaHead.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  canonical: PropTypes.string,
  ogImage: PropTypes.string,
  ogUrl: PropTypes.string,
};
