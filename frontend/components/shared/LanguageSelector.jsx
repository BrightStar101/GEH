// File: /frontend/components/shared/LanguageSelector.jsx

import React, { useEffect, useState } from "react";
import i18n from "../../i18n";
import languageConfig from "../../config/languageConfig";
import { sanitizeLanguageKey } from "../../utils/sanitizeLanguageKey";

/**
 * LanguageSelector.jsx
 * Provides a dropdown for selecting supported languages, scoped to verified and beta tiers only.
 * Persists the preference to localStorage and updates i18n globally.
 */
export default function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState(i18n.language || languageConfig.defaultLanguage);

  const activeLanguages = languageConfig.getActiveLanguages(); // Excludes "comingSoon"

  useEffect(() => {
    const storedLang = localStorage.getItem("languagePreference");
    const validated = sanitizeLanguageKey(storedLang || selectedLang);
    setSelectedLang(validated);
    i18n.changeLanguage(validated);
  }, []);

  const handleLanguageChange = (e) => {
    const newLang = sanitizeLanguageKey(e.target.value);
    setSelectedLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("languagePreference", newLang);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="lang-select" className="text-sm text-gray-600">
        🌐 Language:
      </label>
      <select
        id="lang-select"
        value={selectedLang}
        onChange={handleLanguageChange}
        className="px-3 py-1 border text-sm rounded-md bg-white"
      >
        {activeLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name} {lang.tier === "beta" ? "(Beta)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
