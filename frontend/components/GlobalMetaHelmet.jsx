import { Helmet, HelmetProvider } from 'react-helmet-async';

export default function GlobalMetaHelmet() {
  return (
    <HelmetProvider>
      <Helmet>
        {/* Open Graph + Twitter Meta */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.globalentryhub.com/" />
        <meta property="og:title" content="Global Entry Hub - Your Immigration Form Specialist" />
        <meta property="og:description" content="We support you through your journey, one question, one form at a time." />
        <meta property="og:image" content="/assets/og-card.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Global Entry Hub - Your Immigration Form Specialist" />
        <meta name="twitter:description" content="We support you through your journey, one question, one form at a time." />
        <meta name="twitter:image" content="/assets/og-card.png" />

        {/* Structured Data Schema - JSON-LD */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Global Entry Hub",
              "url": "https://www.globalentryhub.com",
              "logo": "https://www.globalentryhub.com/assets/og-card.png",
              "description": "AI-powered immigration support platform. Trusted guidance for families, students, and workers across 50+ countries.",
              "sameAs": [
                "https://www.linkedin.com/company/global-entry-hub"
              ],
              "areaServed": [
                "United States", "Canada", "Mexico", "India", "China", "Philippines", "Brazil", "UK", "Germany", "France", "Ukraine", "South Korea", "Colombia", "Vietnam", "Nigeria"
              ],
              "inLanguage": ["en", "es", "hi", "zh"]
            }
          `}
        </script>
        </Helmet>
      </HelmetProvider>
  );
}
