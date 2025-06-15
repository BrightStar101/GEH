// 📁 File: frontend/components/public/HeroBanner.jsx
// ✅ Fully production-grade — GEH compliant
// 🔄 Depends on: i18n, ToneContext, TokenContext

import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToneContext } from "@/contexts/ToneContext";
import { AuthContext } from "@/contexts/AuthContext";
import { logPromptInteraction } from "@/utils/analytics";

const HeroBanner = (props) => {
  const { t, i18n } = useTranslation();
  const { tone } = useContext(ToneContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    logPromptInteraction("HeroBannerRender", {
      lang: i18n.language,
      tier: user?.planTier || "free",
      tone,
    });
  }, []);

  const toneStyle = tone === "stressed_parent"
    ? "bg-yellow-100 border-yellow-300"
    : tone === "gig_worker"
    ? "bg-blue-100 border-blue-300"
    : "bg-gray-100 border-gray-300";

  return (
    <section
      className={`rounded-2xl border ${toneStyle} p-6 shadow`} 
      role="banner"
      aria-labelledby="hero-heading"
    >
      <h1 id="hero-heading" className="text-4xl font-bold mb-4 text-center">
        {t(props.title)}
      </h1>
      <p className="text-lg text-center text-gray-700 mb-6">
        {t(props.subtitle)}
      </p>
      <div className="flex justify-center">
        <button
          onClick={props.onCTAClick}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-2xl text-sm shadow-lg"
        >
          {t(props.ctaLabel)}
        </button>
      </div>
    </section>
  );
};

export default HeroBanner;