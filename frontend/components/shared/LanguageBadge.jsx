// File: /frontend/components/shared/LanguageBadge.jsx

import React from "react";
import languageConfig from "../../config/languageConfig";
import i18n from "../../i18n";

/**
 * LanguageBadge.jsx
 * Displays a visual badge for the current active language, including:
 * - Region-specific code
 * - Tier indicator badge
 * - Directionality tag (RTL-aware)
 */
export default function LanguageBadge() {
  const langCode = i18n.language || languageConfig.defaultLanguage;
  const lang = languageConfig.getByCode(langCode);

  if (!lang) return null;

  const tierColor = {
    verified: "bg-green-100 text-green-700 border-green-400",
    beta: "bg-yellow-100 text-yellow-800 border-yellow-400",
    comingSoon: "bg-gray-200 text-gray-600 border-gray-400",
  }[lang.tier] || "bg-gray-100 text-gray-700 border-gray-300";

  const isRTL = lang.direction === "rtl";

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${tierColor}`}
      dir={isRTL ? "rtl" : "ltr"}
      title={`${lang.name} (${lang.code}) — ${lang.tier}`}
    >
      <img
        src={lang.flagIcon}
        alt={lang.code}
        className="w-4 h-4 rounded-full mr-2"
        style={isRTL ? { marginLeft: "0.5rem", marginRight: 0 } : {}}
      />
      <span>
        {lang.nativeName}
        {lang.tier === "beta" && " (Beta)"}
        {lang.tier === "comingSoon" && " (Soon)"}
      </span>
    </div>
  );
}
