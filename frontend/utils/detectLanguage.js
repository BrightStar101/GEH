// File: /frontend/utils/detectLanguage.js

import axios from "axios";
import languageConfig from "../config/languageConfig";
import { sanitizeLanguageKey } from "./sanitizeLanguageKey";

/**
 * detectLanguage
 *
 * Determines the user's preferred language using:
 * 1. Saved preference from localStorage
 * 2. Browser language (e.g., 'fr-CA')
 * 3. GEH defaultLanguage
 *
 * If a fallback is triggered (detected vs. sanitized differ), it logs the event.
 * @returns {string} - A valid, supported GEH language code
 */
export function detectLanguage() {
  try {
    const rawLocal = localStorage.getItem("languagePreference");
    const rawBrowser = navigator?.language || navigator?.userLanguage;
    const defaultLang = languageConfig.defaultLanguage;

    // Priority: localStorage → browser → default
    const rawDetected = rawLocal || rawBrowser || defaultLang;
    const sanitized = sanitizeLanguageKey(rawDetected);

    // Trigger fallback telemetry only if fallback occurred
    if (sanitized !== rawDetected && rawDetected !== null) {
      try {
        axios.post("/api/debugger/logLanguageFallback", { from: rawDetected, fallbackTo: sanitized });
      } catch (fallbackError) {
        console.warn("Language fallback telemetry failed (non-blocking):", fallbackError);
      }
    }

    return sanitized;
  } catch (err) {
    console.warn("detectLanguage.js: failed to detect language, using default.", err);
    return languageConfig.defaultLanguage;
  }
}
