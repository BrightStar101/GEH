/**
 * Rule definitions used by GEH moderation engine to detect harmful, sensitive, or off-policy content.
 * Each rule includes:
 * - `tier`: Severity of violation ("low", "medium", "high")
 * - `confidence`: Numeric likelihood (0–1) of flagging justification
 * - `keywords`: Array of direct-match strings (optional)
 * - `patterns`: Array of RegExp patterns (optional)
 * - `translations`: Optional object mapping language codes to translated keywords/phrases
 */

const contentFilterRules = {
  violence: {
    tier: "high",
    confidence: 0.95,
    keywords: ["kill", "murder", "bomb", "assassinate", "terrorist", "execute"],
    patterns: [
      /\b(?:shoot|stab|torture|decapitate)\b/i,
      /\b(?:massacre|lynch|execute)\b/i,
    ],
    translations: {
      "es-ES": ["asesinar", "bomba", "terrorista", "matar"],
      "zh-CN": ["杀人", "爆炸", "恐怖分子"],
      "hi-IN": ["हत्या", "बम", "आतंकवादी"],
    },
  },
  fraud: {
    tier: "high",
    confidence: 0.90,
    keywords: [
      "bank account number",
      "routing number",
      "bitcoin giveaway",
      "investment scheme",
    ],
    patterns: [
      /\b(?:ssn|social security number)\b/i,
      /\b(?:fake|fraudulent|scam)\b.*(?:site|offer|deal)/i,
    ],
    translations: {
      "es-ES": ["número de cuenta", "fraude", "estafa"],
      "zh-CN": ["银行账号", "诈骗"],
      "hi-IN": ["धोखाधड़ी", "खाता संख्या"],
    },
  },
  privacy: {
    tier: "high",
    confidence: 0.92,
    keywords: ["passport number", "driver's license", "medical record"],
    patterns: [
      /\b\d{3}-\d{2}-\d{4}\b/,
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/,
    ],
    translations: {
      "es-ES": ["número de pasaporte", "licencia de conducir"],
      "zh-CN": ["护照号码", "驾照"],
      "hi-IN": ["पासपोर्ट नंबर", "चालक लाइसेंस"],
    },
  },
  discrimination: {
    tier: "high",
    confidence: 0.93,
    keywords: ["illegal immigrant", "inferior race", "go back to your country"],
    patterns: [
      /\b(?:white|black|asian|latino)\b.*(?:superior|dumb|monkey)/i,
      /\b(?:nazi|klan|slur)\b/i,
    ],
    translations: {
      "es-ES": ["inmigrante ilegal", "raza inferior"],
      "zh-CN": ["非法移民", "劣等种族"],
      "hi-IN": ["अवैध प्रवासी", "निम्न जाति"],
    },
  },
  falseInfo: {
    tier: "medium",
    confidence: 0.80,
    keywords: [
      "vaccines cause autism",
      "election was stolen",
      "climate change is a hoax",
    ],
    patterns: [/\b(?:fake news|plandemic|deep state)\b/i],
    translations: {
      "es-ES": ["las vacunas causan autismo", "elección fue robada"],
      "zh-CN": ["疫苗导致自闭症", "选举被操控"],
    },
  },
  spam: {
    tier: "medium",
    confidence: 0.70,
    keywords: ["buy now", "limited time offer", "click here"],
    patterns: [
      /\b(?:free trial|only \$\d+|win big|get rich quick)\b/i,
    ],
    translations: {
      "es-ES": ["compre ahora", "oferta limitada"],
      "zh-CN": ["点击这里", "仅限时优惠"],
    },
  },
};

module.exports = contentFilterRules;
