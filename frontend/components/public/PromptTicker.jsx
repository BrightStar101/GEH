// 📁 File: frontend/components/mira/PromptTicker.jsx
// ✅ Fully production-grade — GEH enforcement + upsell logic
// 🔄 Depends on: TokenContext, useTranslation, logPromptInteraction

import React, { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TokenContext } from "@/contexts/TokenContext";
import { logPromptInteraction } from "@/utils/analytics";

const PromptTicker = () => {
  const { t, i18n } = useTranslation();
  const { usedPrompts, maxPrompts, userTier } = useContext(TokenContext);

  const progress = Math.min((usedPrompts / maxPrompts) * 100, 100);
  const nearLimit = usedPrompts / maxPrompts >= 0.85;
  const isMaxed = usedPrompts >= maxPrompts;

  useEffect(() => {
    if (isMaxed) {
      logPromptInteraction("PromptLimitReached", {
        lang: i18n.language,
        tier: userTier,
        usedPrompts,
        maxPrompts,
      });
    }
  }, [isMaxed]);

  return (
    <section className="w-full px-4 py-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          {t("mira.ticker.prompts_used", { count: usedPrompts, total: maxPrompts })}
        </span>
        {nearLimit && !isMaxed && (
          <span className="text-sm text-orange-600 animate-pulse">
            {t("mira.ticker.almost_out")}
          </span>
        )}
        {isMaxed && (
          <span className="text-sm text-red-600 font-bold animate-bounce">
            {t("mira.ticker.out_of_tokens")}
          </span>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
        <div
          className={`h-2.5 rounded-full transition-all duration-300 ${
            isMaxed ? "bg-red-500" : nearLimit ? "bg-orange-500" : "bg-green-500"
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {isMaxed && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700 mb-2">
            {t("mira.ticker.limit_message")}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => logPromptInteraction("UpgradeClicked", { context: "PromptTicker" })}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-2xl text-sm"
            >
              {t("mira.ticker.upgrade_cta")}
            </button>
            <button
              onClick={() => logPromptInteraction("LearnPlans", { context: "PromptTicker" })}
              className="border border-gray-400 text-gray-700 px-4 py-1.5 rounded-2xl text-sm"
            >
              {t("mira.ticker.learn_more")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default PromptTicker;