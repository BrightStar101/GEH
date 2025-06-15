// File: /frontend/components/shared/languageToggle.jsx
// Purpose: Dropdown language selector using GEH-supported languages

import React, { useState, useEffect } from "react";
import languageConfig from "../../config/languageConfig";

/**
 * languageToggle.jsx
 * 
 * Modular component for switching UI language.
 * Supports fallback-awareness and persists selection using localStorage.
 * 
 * @returns JSX Element for the language dropdown.
 */
export default function LanguageToggle() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("userLang");
    if (storedLang && languageConfig.supportedLanguages.includes(storedLang)) {
      setSelectedLanguage(storedLang);
    }
  }, []);

  const handleChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    localStorage.setItem("userLang", newLang);
    window.location.reload(); // reload app to reflect lang change
  };

  return (
    <div className="language-toggle text-sm">
      <label htmlFor="lang-select" className="sr-only">Select language</label>
      <select
        id="lang-select"
        className="border border-gray-300 px-2 py-1 rounded text-gray-700"
        value={selectedLanguage}
        onChange={handleChange}
      >
        {languageConfig.supportedLanguages.map((langCode) => (
          <option key={langCode} value={langCode}>
            {renderLangLabel(langCode)}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * renderLangLabel
 * Converts language code to a display name.
 *
 * @param {string} code - ISO language code
 * @returns {string} Display name
 */
function renderLangLabel(code) {
  const map = {
    en: "English",
    es: "Español",
    hi: "हिन्दी",
    zh: "中文",
    fr: "Français",
    pt: "Português",
    ar: "العربية",
    tl: "Tagalog",
    uk: "Українська"
  };
  return map[code] || code.toUpperCase();
}
