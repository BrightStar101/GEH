// File: /frontend/config/seoRedirectConfig.js
// Purpose: Maps inbound SEO domains to metadata, keyword clusters, and redirect targets

/**
 * Each domain entry includes:
 * - title: Page title tag
 * - description: Meta description
 * - redirectTo: Final destination (typically main GEH landing)
 * - ogImage: Optional OpenGraph image path
 */

const seoRedirectConfig = {
  "immigrationhelpforfamilies.com": {
    title: "Help With Immigration Forms for Families | Mira AI",
    description: "Use AI to help your family complete immigration forms — faster, easier, and multilingual. Powered by Mira at Global Entry Hub.",
    redirectTo: "https://www.globalentryhub.com",
    ogImage: "/static/meta/seo-families.jpg",
  },
  "visaforindia.ai": {
    title: "Get Help With India Visa Forms | Mira AI Assistant",
    description: "AI-powered visa help for India — supported in Hindi, English, and more. Try Mira today at Global Entry Hub.",
    redirectTo: "https://www.globalentryhub.com",
    ogImage: "/static/meta/seo-india.jpg",
  },
  // Additional domains omitted for brevity — add 44+ entries as needed
};

export default seoRedirectConfig;
