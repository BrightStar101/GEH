/**
 * hallucinationMitigator.js
 *
 * Global Entry Hub (GEH)
 * Hallucination Mitigation Agent (Production-Depth)
 *
 * Purpose:
 * Categorizes AI outputs by confidence levels.
 * Dynamically handles caution warnings, fallback halts, escalation triggers,
 * and system integrity protection during low-confidence or invalid payload scenarios.
 */

const logger = require('../utils/loggerUtils');

const HIGH_CONFIDENCE_THRESHOLD = 0.85;
const AUTO_FILL_CRITICAL_THRESHOLD = 0.95;
const LOW_CONFIDENCE_THRESHOLD = 0.65;
const MAX_REPHRASE_ATTEMPTS = 2;

/**
 * Determines if the given context is considered high-risk.
 * @param {string} context
 * @returns {boolean}
 */
function isHighRiskContext(context) {
  const sensitiveContexts = ['form-auto-fill', 'tax-guidance', 'legal-disclaimer', 'financial-regulation'];
  return sensitiveContexts.includes(context);
}

/**
 * Classifies confidence scores into high, medium, or low categories.
 * @param {number} score
 * @returns {string} category ('high', 'medium', 'low', 'invalid')
 */
function classifyConfidence(score) {
  if (typeof score !== 'number' || score < 0 || score > 1) return 'invalid';
  if (score >= HIGH_CONFIDENCE_THRESHOLD) return 'high';
  if (score >= LOW_CONFIDENCE_THRESHOLD) return 'medium';
  return 'low';
}

/**
 * Applies soft caution language to Mira output at medium confidence levels.
 * @param {string} output
 * @returns {string}
 */
function applyCautionPhrasing(output) {
  return `⚠️ Note: I'm not completely sure about this. Here's what I found: ${output}`;
}

/**
 * Returns a structured fallback response object.
 * @param {string} reason
 * @returns {Object}
 */
function generateFallbackResponse(reason) {
  const common = {
    escalation: true,
    estimatedResponseTime: '24–48 hours',
  };

  switch (reason) {
    case 'high-risk-low-confidence':
      return {
        ...common,
        status: 'fallback',
        message: "I'm not confident enough to safely complete this request. Let's try a different question.",
      };
    case 'low-confidence':
      return {
        escalation: false,
        status: 'fallback',
        message: "This might be outside my trained knowledge. Would you like to rephrase your question?",
      };
    case 'invalid-payload':
    case 'exception':
    default:
      return {
        ...common,
        status: 'fallback',
        message: "Something went wrong processing your request. Support has been notified.",
      };
  }
}

/**
 * Evaluates an AI response for hallucination risk.
 * @param {Object} aiPayload - AI response object { confidence, output, rephraseAttempts }
 * @param {string} context - Operation context ('form-auto-fill', 'navigation', etc.)
 * @param {string} origin - Optional tracking label
 * @returns {Object} evaluationResult { allowed, response, severity }
 */
function evaluateResponseForHallucination(aiPayload, context = 'general', origin = 'unknown') {
  try {
    if (
      !aiPayload ||
      typeof aiPayload !== 'object' ||
      typeof aiPayload.confidence !== 'number' ||
      typeof aiPayload.output !== 'string'
    ) {
      logger.logWarn(`HallucinationMitigator: Invalid AI payload from ${origin}`);
      return {
        allowed: false,
        response: generateFallbackResponse('invalid-payload'),
        severity: 'error',
      };
    }

    const confidenceCategory = classifyConfidence(aiPayload.confidence);

    if (isHighRiskContext(context) && aiPayload.confidence < AUTO_FILL_CRITICAL_THRESHOLD) {
      logger.logWarn(`HallucinationMitigator: High-risk operation blocked — Confidence too low for ${context} (${aiPayload.confidence}).`);
      return {
        allowed: false,
        response: generateFallbackResponse('high-risk-low-confidence'),
        severity: 'critical',
      };
    }

    if (confidenceCategory === 'high') {
      return {
        allowed: true,
        response: aiPayload.output,
        severity: 'normal',
      };
    }

    if (confidenceCategory === 'medium') {
      logger.logWarn(`HallucinationMitigator: Medium-confidence caution (${aiPayload.confidence}) detected in ${origin}.`);
      return {
        allowed: true,
        response: applyCautionPhrasing(aiPayload.output),
        severity: 'caution',
      };
    }

    if (confidenceCategory === 'low') {
      if (aiPayload.rephraseAttempts && aiPayload.rephraseAttempts >= MAX_REPHRASE_ATTEMPTS) {
        logger.logError(`HallucinationMitigator: Low-confidence block after rephrases (${origin}).`);
        return {
          allowed: false,
          response: generateFallbackResponse('low-confidence'),
          severity: 'block',
        };
      } else {
        logger.logWarn(`HallucinationMitigator: Low-confidence warning — suggesting rephrase to user.`);
        return {
          allowed: false,
          response: generateFallbackResponse('low-confidence'),
          severity: 'caution',
        };
      }
    }

    logger.logError('HallucinationMitigator: Unexpected confidence category.');
    return {
      allowed: false,
      response: generateFallbackResponse('exception'),
      severity: 'error',
    };
  } catch (error) {
    logger.logError('HallucinationMitigator: Fatal error evaluating AI output.', error);
    return {
      allowed: false,
      response: generateFallbackResponse('exception'),
      severity: 'error',
    };
  }
}

/**
 * Initializes Hallucination Mitigator at server boot.
 */
async function initializeHallucinationMitigator() {
  logger.logInfo('HallucinationMitigator: Initialized and monitoring outputs.');
}

module.exports = {
  initializeHallucinationMitigator,
  evaluateResponseForHallucination,
};
