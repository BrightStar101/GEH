// File: /frontend/pages/public/featuresPage.jsx
// Purpose: Showcases core platform features and tech differentiators of Global Entry Hub

import React, { useEffect } from "react";
import MetaHead from "../../components/public/MetaHead";
import FeatureGrid from "../../components/public/FeatureGrid";
import FooterNavigation from "../../components/public/FooterNavigation";
import analyticsTracker from "../../utils/analyticsTracker";

/**
 * featuresPage.jsx
 *
 * Highlights the technology and benefits behind Global Entry Hub,
 * including Mira's multilingual intelligence, AI accuracy, export safeguards,
 * and user privacy controls.
 */

export default function FeaturesPage() {
  useEffect(() => {
    analyticsTracker.logPageView("features_page");
  }, []);

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Accuracy",
      description:
        "Mira is trained on government guidelines and 12,000+ use cases — delivering 99.2% accuracy across supported visa types.",
    },
    {
      icon: "🌍",
      title: "Multilingual Intelligence",
      description:
        "Mira currently supports English, Spanish, Hindi, and Mandarin — with more languages in training.",
    },
    {
      icon: "📤",
      title: "Form Export + DSAR Compliance",
      description:
        "Every form you complete is downloadable and privacy-safe. Full DSAR support is built in by design.",
    },
    {
      icon: "🛡️",
      title: "Data Privacy & Encryption",
      description:
        "We never sell your data. All files are encrypted. Mira operates with full CCPA and GDPR safeguards.",
    },
    {
      icon: "⚙️",
      title: "Smart Retry Logic",
      description:
        "If a form fails to generate due to document issues, Mira automatically re-analyzes the inputs and suggests a fix.",
    },
    {
      icon: "📈",
      title: "Real-Time Quality Assurance",
      description:
        "Mira is monitored by our QA engine to maintain high accuracy across all user flows — with ongoing learning.",
    },
  ];

  return (
    <>
      <MetaHead
        title="Features | Global Entry Hub"
        description="Explore how Mira works — from multilingual accuracy to smart export tools and privacy-first compliance. Built for your journey."
        canonical="https://www.globalentryhub.com/features"
        ogImage="/static/meta/features-hero.jpg"
        ogUrl="https://www.globalentryhub.com/features"
      />

      <div className="bg-white text-gray-900 w-full">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Built for Accuracy, Privacy, and Global Access</h1>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            Mira combines AI intelligence, multilingual support, and ethical architecture to guide your immigration journey — faster, safer, and more affordably than ever.
          </p>
          <FeatureGrid features={features} />
        </div>
        
      </div>
    </>
  );
}
