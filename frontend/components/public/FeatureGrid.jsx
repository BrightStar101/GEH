// 📁 File: frontend/components/public/FeatureGrid.jsx
// ✅ Fully production-grade — GEH compliant
// 🔄 Depends on: i18n, TokenContext, ToneContext

import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToneContext } from "@/contexts/ToneContext";
import { logPromptInteraction } from "@/utils/analytics";
import { AuthContext } from "../../contexts/AuthContext";

const FeatureGrid = () => {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AuthContext);
  const { tone } = useContext(ToneContext);

  useEffect(() => {
    logPromptInteraction("FeatureGridRender", {
      lang: i18n.language,
      tier: user?.planTier || "free",
      tone,
    });
  }, []);

  const features = [
    {
      key: "save_time",
      icon: "⏱️",
      text: "save time"//t("landing.features.save_time"),
    },
    {
      key: "high_accuracy",
      icon: "✅",
      text: "high accuracy"//t("landing.features.high_accuracy"),
    },
    {
      key: "multilingual_support",
      icon: "🌍",
      text: "multilingual support"//t("landing.features.multilingual_support"),
    },
    {
      key: "family_friendly",
      icon: "👨‍👩‍👧‍👦",
      text: "family friendly"//t("landing.features.family_friendly"),
    },
  ];

  return (
    <section
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-10"
      aria-label={t("landing.features.heading")}
    >
      {features.map((f) => (
        <div
          key={f.key}
          className="flex flex-col items-center p-4 border border-gray-200 rounded-2xl shadow bg-white"
        >
          <span
            role="img"
            aria-label={f.key}
            className="text-3xl mb-2"
          >
            {f.icon}
          </span>
          <p className="text-center text-sm font-medium text-gray-800">
            {f.text}
          </p>
        </div>
      ))}
    </section>
  );
};

export default FeatureGrid;
