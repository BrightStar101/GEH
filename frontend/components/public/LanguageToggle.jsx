// File: /frontend/components/public/LanguageToggle.jsx
// Purpose: Language switcher for public UI with readable labels (e.g., Español, 中文)

import React, { useState } from "react";
import PropTypes from "prop-types";
import i18n from "i18next";

/**
 * LanguageToggle.jsx
 *
 * Allows the user to select a supported language from a dropdown.
 * Uses config to display available and upcoming languages.
 * Stores preferred language in localStorage and notifies parent via callback.
 * Now includes human-readable labels (e.g., Español, 中文).
 */

export default function LanguageToggle({ config }) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languageMap = {
    en: "English",
    es: "Español",
    hi: "हिन्दी",
    zh: "中文",
    fr: "Français",
    ar: "العربية",
    pt: "Português",
    uk: "Українська",
    tl: "Tagalog",
    vi: "Tiếng Việt",
  };

  const allLanguages = [
    ...config.available,
    ...config.upcoming,
  ];

  const handleChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);

    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex justify-center my-6">
      <label htmlFor="language" className="sr-only">
        Select Language
      </label>
      <select
        id="language"
        value={selectedLanguage}
        onChange={handleChange}
        className="border border-gray-300 rounded-md px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {allLanguages.map((langCode) => (
          <option key={langCode} value={langCode}>
            {languageMap[langCode] || langCode.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

LanguageToggle.propTypes = {
  onLanguageChange: PropTypes.func,
};
