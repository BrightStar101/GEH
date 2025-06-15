// File: /config/moderationConfig.js

/**
 * moderationConfig.js
 *
 * Central moderation settings for the GEH platform.
 * Supports tier-based gating, auto-flag thresholds, role permissions,
 * and abuse protection via rate limits.
 */

const moderationConfig = {
  /**
   * Tiers define severity of flagged content.
   */
  tiers: {
    low: {
      label: "Low",
      description: "Minor formatting or tone issues. Generally safe.",
      autoEscalate: false,
    },
    medium: {
      label: "Medium",
      description: "Questionable claims, impersonation, or gray-area compliance.",
      autoEscalate: true,
    },
    high: {
      label: "High",
      description: "Violence, legal violation, fraud, or discriminatory content.",
      autoEscalate: true,
      notifyModerator: true,
    },
  },

  /**
   * Maps tags to tier severity to assist auto-routing.
   */
  tagTierMap: {
    "violence": "high",
    "fraud": "high",
    "privacy violation": "high",
    "discrimination": "high",
    "false info": "medium",
    "spam": "medium",
    "compliance": "medium",
    "legal": "medium",
  },

  /**
   * Thresholds for ML-based auto-flagging (0–1 scale).
   */
  thresholds: {
    aiResponse: 0.85,
    userInput: 0.75,
  },

  /**
   * Tags to assign to flags for filtering/moderation review.
   */
  tags: [
    "violence",
    "fraud",
    "privacy violation",
    "discrimination",
    "false info",
    "spam",
    "compliance",
    "legal",
  ],

  /**
   * Role access control: who can take action on what tiers.
   */
  tierRoleLimits: {
    low: ["moderator", "compliance", "superadmin"],
    medium: ["compliance", "superadmin"],
    high: ["superadmin"], // Only highest tier can resolve or redact "high"
  },

  /**
   * Rate limit per flaggable item type per IP/session/user (per day).
   * Used to guard against bot/spam flooding.
   */
  rateLimits: {
    aiResponse: 200,
    userInput: 100,
    totalFlagsPerUser: 300,
  },

  /**
   * Fallback policy for flagged but unreviewed content.
   * "redact" | "mask" | "passive"
   */
  fallbackPolicy: "mask",
};

export default moderationConfig;
