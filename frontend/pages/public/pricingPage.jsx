// File: /frontend/pages/public/pricingPage.jsx
// Purpose: Displays GEH pricing tiers with dynamic checkout routing and value highlights

import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetaHead from "@/components/public/MetaHead";
import PricingPlanCard from "@/components/public/PricingPlanCard";
import FooterNavigation from "@/components/public/FooterNavigation";
import analyticsTracker from "../../utils/analyticsTracker";
import pricingTiers from "../../config/pricingTiersConfig";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * pricingPage.jsx
 *
 * Lists all current Global Entry Hub pricing options with
 * real-time CTA routing, value propositions, and SEO metadata.
 */

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    analyticsTracker.logPageView("pricing_page");
  }, []);

  const handlePlanClick = (tierId) => {
    try {
      analyticsTracker.logEvent("plan_selected", {
        plan: tierId,
        source: "pricing_page",
      });
      navigate(`/checkout?plan=${tierId}`);
    } catch (err) {
      console.error("Plan routing failed:", err);
    }
  };

  return (
    <>
      <MetaHead
        title="Pricing | Global Entry Hub"
        description="Choose from affordable one-time plans to access Mira, your AI-powered immigration assistant. No subscriptions. Instant results."
        canonical="https://www.globalentryhub.com/pricing"
        ogImage="/static/meta/pricing-hero.jpg"
        ogUrl="https://www.globalentryhub.com/pricing"
      />

      <div className="bg-white text-gray-900 w-full">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            No subscriptions. Pay once. Get everything you need to move forward — with AI-powered guidance from Mira.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {pricingTiers.map((plan) => (
              <React.Fragment key={plan.id}>
                <PricingPlanCard
                  id={plan.id}
                  name={plan.label}
                  price={plan.price}
                  description={plan.description}
                  features={plan.highlights}
                  badge={plan.badgeColor}
                  disabled={!user}
                  onClick={() => handlePlanClick(plan.id)}
                />
              </React.Fragment>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
