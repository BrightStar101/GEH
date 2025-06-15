// 📁 File: frontend/components/public/PricingPlanCard.jsx
// ✅ Fully production-grade — GEH monetization-compliant
// 🔄 Depends on: i18n, AuthContext, Kairo pricing enforcement, audit utils

import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "@/contexts/AuthContext";
import { logPromptInteraction } from "@/utils/analytics";
import { getPricingTiers } from "@/utils/pricingConfig";

const PricingPlanCard = (pricing) => {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    logPromptInteraction("PricingCardRender", {
      key: pricing.key,
      lang: i18n.language,
      viewerTier: user?.planTier || "free",
    });
  }, [i18n.language, user?.planTier || "free"]);

  return (
    <div
      className="px-3 py-6 border rounded-2xl shadow-lg bg-white hover:border-orange-500 transition w-[23%] flex flex-col justify-between"
      role="region"
      aria-labelledby={`tier-${pricing.key}`}
    >
      <h3 id={`tier-${pricing.key}`} className="text-xl font-bold mb-2 text-gray-900">
        {pricing.name}
      </h3>
      <p className="text-2xl font-bold mb-1 text-orange-600">${pricing.price}</p>
      <p className="text-sm text-gray-500 mb-3">
        {pricing.description/* {t("pricing.prompts_cap", { count: pricing.promptCap || 0 })} */}
      </p>
      <ul className="mb-4 space-y-1 text-sm text-gray-700">
        {pricing.features?.map((feature, index) => (
          <li key={index}>• {feature}</li>
        ))}
      </ul>
      <button
        onClick={pricing.onClick}
        disabled={pricing.disabled || pricing.id === 'free'}
        className="bg-orange-500 hover:bg-orange-600 text-white w-full py-2 rounded-xl text-sm font-semibold disabled:bg-gray-400"
      >
        Upgrade
      </button>
    </div>
  );
};

export default PricingPlanCard;
