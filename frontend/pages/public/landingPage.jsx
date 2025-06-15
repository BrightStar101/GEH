import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import MetaHead from "@/components/public/MetaHead";
import HeroBanner from "@/components/public/HeroBanner";
import ValuePropStats from "@/components/public/ValuePropStats";
import FeatureGrid from "@/components/public/FeatureGrid";
import PricingPlanCard from "@/components/public/PricingPlanCard";
import TrustStatsPanel from "@/components/public/TrustStatsPanel";
import TestimonialsCarousel from "@/components/public/TestimonialsCarousel";
import LanguageToggle from "@/components/public/LanguageToggle";
import FooterNavigation from "@/components/public/FooterNavigation";
import ComplianceBadge from "@/components/public/ComplianceBadge";

import analyticsTracker from "../../utils/analyticsTracker";
import languageSupportConfig from "../../config/languageSupportConfig";
import { AuthContext } from "../../contexts/AuthContext";
import PricingPage from "./pricingPage";

/**
 * LandingPage.jsx
 * Global Entry Hub – SaaS Homepage with CTA, Value Prop, SEO, and Trust Logic
 *
 * Delivers conversion-focused layout, SEO metadata, multilingual brand alignment,
 * CTA tracking, and social proof. Fully compliant with GEH frontend standards.
 */

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAdmin } = useContext(AuthContext);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    try {
      analyticsTracker.logPageView("landing_page");
    } catch (err) {
      console.warn("Landing page analytics tracking failed:", err);
    }
  }, []);

  return (
    <>
      <MetaHead
        title="Global Entry Hub – Simplifying Immigration Worldwide"
        description="Meet Mira, your AI migration assistant. Save time, reduce errors, and move forward with multilingual support and clarity."
        canonical="https://www.globalentryhub.com/"
      />

      <main className="landing-page">
        <section className="hero-banner">
          <HeroBanner
            title="landing.heroHeadline"
            subtitle="landing.heroSubhead"
            ctaLabel="landing.tryMira"
            onCTAClick={() => navigate("/mira")}
          />
          <div style={{ textAlign: "center" }}>
            <img
              src="/images/mira.png"
              alt="Mira the Migration Assistant - Global AI Support"
              width="160"
              height="160"
              style={{
                borderRadius: "50%",
                backgroundColor: "white",
                margin: "20px auto",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            />
            <div style={{ marginTop: "16px" }}>
              <button
                onClick={() => navigate("/support")}
                className="text-sm underline text-blue-600 hover:text-blue-800"
              >
                {t('support.title')} {t('footer.support')}
              </button>
              {isAdmin && (
                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => navigate("/admin")}
                    className="text-sm underline text-gray-600 hover:text-gray-800"
                  >
                    Admin Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <LanguageToggle config={languageSupportConfig} />
        <ValuePropStats countriesSupported={42} />
        <FeatureGrid />
        {/* <PricingPlanCard /> */}
        <PricingPage />
        <TrustStatsPanel />
        <TestimonialsCarousel testimonials={[]} />
        <ComplianceBadge labels={["GDPR", "CCPA", "AI Explainability", "DSAR Ready"]} />
        
      </main>
    </>
  );
}
