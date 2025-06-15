// ✅ GEH: pricingTiersConfig.js — Production-Depth, Audit-Validated
// Path: frontend/config/pricingTiersConfig.js

/**
 * UI-friendly representation of pricing tiers for display components.
 * Keeps visual logic separated from enforcement logic (pricingConfig.js).
 *
 * 🎯 Used by pricing page, upgrade panels, dashboards
 * 📦 Centralizes tier metadata for multilingual and UI rendering
 */

const pricingTiersConfig = [
  {
    id: "free",
    label: "First Form Free",
    description: "Fill out one form at no cost — no AI support included.",
    price: 0,
    highlights: [
      "1 form included",
      "No AI support",
      "Try the platform risk-free"
    ],
    badgeColor: "gray",
  },
  {
    id: "starter",
    label: "Starter Kit",
    description: "Perfect for quick needs — get Mira's help for 24 hours.",
    price: 5,
    highlights: [
      "2 forms total",
      "24 hours AI access",
      "24 prompt limit"
    ],
    badgeColor: "green",
  },
  {
    id: "official",
    label: "Official Pack",
    description: "For serious planning — 3 days of AI support with 20 forms.",
    price: 25,
    highlights: [
      "20 forms included",
      "72 hours AI access",
      "60 prompt limit"
    ],
    badgeColor: "blue",
  },
  {
    id: "family",
    label: "Friends & Family Plan",
    description: "For big journeys — full access with 60 forms and 1 week of Mira.",
    price: 75,
    highlights: [
      "60 forms included",
      "1 week AI access",
      "120 prompt limit"
    ],
    badgeColor: "orange",
  }
];

export default pricingTiersConfig;

// ✅ Fully production-complete
// 🔐 No backend dependency
// 🧠 Separated from logic config (pricingConfig.js)
// 📈 Used across pricing display surfaces and multilingual UI
