// frontend/components/SupportQuestionBar.jsx

/**
 * SupportQuestionBar.jsx
 *
 * Global Entry Hub (GEH) - Multilingual Frontend Component
 * Displays support question usage + upgrade CTA at top of chat interface.
 *
 * Props:
 * - remaining (number)
 * - maxAllowed (number)
 * - percentUsed (number)
 * - language (string) — 'en', 'es', 'hi', 'zh'
 * - onUpgrade (function) — callback to upgrade route
 */

import React from 'react';
import PropTypes from 'prop-types';

const translations = {
  en: {
    msg_safe: (x) => `You have ${x} support questions remaining.`,
    msg_low: (x) => `Only ${x} left — consider upgrading if you need more help.`,
    msg_critical: 'You’ve used all your support questions for this plan.',
    cta: 'Upgrade for more',
    aria: (x) => `You’ve used ${x}% of your support questions`,
  },
  es: {
    msg_safe: (x) => `Te quedan ${x} preguntas de soporte.`,
    msg_low: (x) => `Solo quedan ${x} — considera actualizar si necesitas más ayuda.`,
    msg_critical: 'Has usado todas tus preguntas de soporte para este plan.',
    cta: 'Actualizar para obtener más',
    aria: (x) => `Has usado el ${x}% de tus preguntas de soporte`,
  },
  hi: {
    msg_safe: (x) => `आपके पास ${x} समर्थन प्रश्न बचे हैं।`,
    msg_low: (x) => `केवल ${x} प्रश्न शेष हैं — अधिक सहायता के लिए अपग्रेड करें।`,
    msg_critical: 'आपने सभी समर्थन प्रश्नों का उपयोग कर लिया है।',
    cta: 'अधिक सहायता के लिए अपग्रेड करें',
    aria: (x) => `आपने ${x}% समर्थन प्रश्नों का उपयोग किया है`,
  },
  zh: {
    msg_safe: (x) => `您还有 ${x} 个支持问题。`,
    msg_low: (x) => `仅剩 ${x} 个支持问题 — 如需帮助请升级。`,
    msg_critical: '您已用完所有支持问题。',
    cta: '升级获取更多',
    aria: (x) => `您已使用了 ${x}% 的支持问题`,
  },
};

const SupportQuestionBar = ({
  remaining,
  maxAllowed,
  percentUsed,
  language = 'en',
  onUpgrade,
}) => {
  const isLow = remaining <= 3 && remaining > 0;
  const isCritical = remaining === 0;
  const lang = translations[language] ? language : 'en';

  let message = translations[lang].msg_safe(remaining);
  if (isLow) message = translations[lang].msg_low(remaining);
  if (isCritical) message = translations[lang].msg_critical;

  const containerClasses = `flex items-center justify-between text-sm rounded px-4 py-2 mb-4 border ${
    isCritical
      ? 'bg-red-50 text-red-800 border-red-200'
      : isLow
      ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
      : 'bg-gray-50 text-gray-800 border-gray-200'
  }`;

  return (
    <div role="status" aria-live="polite" className={containerClasses}>
      <span className="mr-4">{message}</span>

      {maxAllowed > 0 && !isCritical && (
        <div className="flex-grow ml-4 bg-gray-200 rounded h-2 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
            aria-label={translations[lang].aria(percentUsed)}
          />
        </div>
      )}

      {isCritical && typeof onUpgrade === 'function' && (
        <button
          onClick={onUpgrade}
          className="ml-4 text-blue-600 hover:text-blue-800 underline text-xs"
        >
          {translations[lang].cta}
        </button>
      )}
    </div>
  );
};

SupportQuestionBar.propTypes = {
  remaining: PropTypes.number.isRequired,
  maxAllowed: PropTypes.number.isRequired,
  percentUsed: PropTypes.number.isRequired,
  language: PropTypes.string,
  onUpgrade: PropTypes.func,
};

export default SupportQuestionBar;
