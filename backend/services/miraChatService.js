const { localizeResponse } = require('../utils/miraResponseFormatter');
const { pickFallbackLanguage } = require('../utils/fallbackLanguagePicker');
const { logChatAudit } = require('../agents/miraAuditAgent');
const { getUserTierById } = require('./subscriptionService');
const { validatePrompt } = require('../utils/inputValidator');
// const { moderateInput } = require('./moderationService');
const { logError } = require('../utils/loggerUtils');
const { sendPrompt } = require('./openaiService'); // ✅ from openaiService
const { shouldRetrain } = require('./claPartitioningService'); // ✅ enhancement
const { logAgentUsage } = require('./agentUsageLogger'); // ✅ enhancement
const { logRetrainingCandidate } = require('./retrainingQueueService'); // ✅ enhancement

// ✅ NEW: inline confusion loop detector
function detectConfusionLoop(input, output) {
  if (!input || !output) return false;
  const cleanedInput = input.trim().toLowerCase();
  const cleanedOutput = output.trim().toLowerCase();

  // Basic heuristic: output contains input, or overly vague phrases
  const repeats = cleanedOutput.includes(cleanedInput);
  const vague = ['i don’t understand', 'please clarify', 'i’m not sure'].some(v =>
    cleanedOutput.includes(v)
  );

  return repeats || vague;
}

async function generateMiraResponse({ userId, message, language }) {
  try {
    if (!validatePrompt(message)) {
      return { error: 'Invalid input format.' };
    }

    // const flagged = await moderateInput(message);
    // if (flagged?.flagged) {
    //   return { error: 'Message flagged by moderation filter.' };
    // }

    const tier = await getUserTierById(userId);
    if (!tier) {
      return { error: 'Unable to verify user tier.' };
    }

    const now = new Date();
    const sessionActive = true;

    if (!sessionActive) {
      return { error: 'Mira access expired. Please upgrade to continue.' };
    }

    const lang = language || "en";

    const { result: aiResponse, normalizedScore } = await sendPrompt({
      userId,
      prompt: message,
      maxTokens: 500,
      language: lang,
    });

    const confidence = normalizedScore;
    const fallbackLang = pickFallbackLanguage(lang);
    const localized = await localizeResponse(aiResponse, fallbackLang);

    // ✅ NEW: detect confusion loop before logging
    const isConfused = detectConfusionLoop(message, localized.response);

    const retrainCandidate = shouldRetrain({
      agent: "mira",
      flags: [
        confidence < 0.4 ? "low_confidence" : "",
        isConfused ? "confusion_loop" : "",
      ].filter(Boolean),
    });

    await logChatAudit({
      userId,
      input: message,
      output: localized.response,
      confidence,
      tier,
      fallbackUsed: fallbackLang !== lang,
      timestamp: now,
      confusionLoop: isConfused, // ✅ optional metadata
    });

    await logAgentUsage({
      userId,
      agent: "mira",
      sessionType: "chat",
      confidence,
      fallbackUsed: fallbackLang !== lang,
      inputSummary: message.slice(0, 512),
      source: "web",
      retrainCandidate,
    });

    if (retrainCandidate) {
      await logRetrainingCandidate({
        userId,
        agent: "mira",
        input: message,
        output: localized.response,
        confidence,
      });
    }

    return {
      response: localized.response,
      lang: fallbackLang,
      confidence,
      tier,
      notice: fallbackLang !== lang ? `Language fallback applied: ${fallbackLang}` : undefined,
    };
  } catch (err) {
    logError('Error generating Mira response:', err);
    return { error: 'Internal error. Please try again later.', err };
  }
}

module.exports = {
  generateMiraResponse,
};
