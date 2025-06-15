// frontend/utils/auditUtils.js

let sessionId = null;
let userId = null;
const eventQueue = [];

// Utility to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Initializes audit session
function startSessionAudit(initUserId = 'anon', tier = 'free', language = 'en') {
  sessionId = generateId();
  userId = initUserId;
  logAuditEvent('session_start', { tier, language });
}

// Logs a generic audit event
function logAuditEvent(eventType, payload = {}) {
  const event = {
    timestamp: new Date().toISOString(),
    eventType,
    agent: payload.agent || null,
    tier: payload.tier || null,
    language: payload.language || null,
    payload: payload.data || {},
    userId,
    sessionId,
  };
  eventQueue.push(event);
  // Optional: console log for local dev
  if (process.env.NODE_ENV !== 'production') {
    console.log('[AUDIT EVENT]', event);
  }
  // Optional: dispatch to backend
  // sendAuditLog(event);
}

function recordPromptInteraction(agent, prompt, language, tier) {
  logAuditEvent('prompt_interaction', {
    agent,
    tier,
    language,
    data: { prompt }
  });
}

function trackAgentEvent(agent, eventType, meta = {}) {
  logAuditEvent('agent_event', {
    agent,
    data: { eventType, ...meta }
  });
}

function trackOnboardingMilestone(stepName, status) {
  logAuditEvent('onboarding_step', {
    data: { stepName, status }
  });
}

function logLanguageSwitch(fromLang, toLang) {
  logAuditEvent('language_switch', {
    data: { fromLang, toLang }
  });
}

function recordTierSelection(tierId, interactionType) {
  logAuditEvent('tier_select', {
    tier: tierId,
    data: { interactionType }
  });
}

function flagConfusionLoop(inputHistory = []) {
  logAuditEvent('confusion_loop', {
    data: { inputs: inputHistory.slice(-5) }
  });
}

function reportFrontendAnomaly(errorType, metadata = {}) {
  logAuditEvent('frontend_error', {
    data: { errorType, ...metadata }
  });
}

function logFallbackTrigger(fallbackType, agent, prompt = null) {
  logAuditEvent('fallback_trigger', {
    agent,
    data: { fallbackType, prompt }
  });
}

function finalizeSessionAudit() {
  logAuditEvent('session_end');
  sessionId = null;
  userId = null;
  // Clear queue if batching
  // flushAuditQueue();
}

module.exports = {
  startSessionAudit,
  logAuditEvent,
  recordPromptInteraction,
  trackAgentEvent,
  trackOnboardingMilestone,
  logLanguageSwitch,
  recordTierSelection,
  flagConfusionLoop,
  reportFrontendAnomaly,
  logFallbackTrigger,
  finalizeSessionAudit
};
