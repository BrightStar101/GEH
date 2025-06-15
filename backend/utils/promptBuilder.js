const { logEvent } = require('./logEvent');
const { isSupportedLanguage } = require('./languageValidator');

const languageMap = {
  en: { label: 'English', fallback: 'English' },
  es: { label: 'Spanish', fallback: 'English' },
  hi: { label: 'Hindi', fallback: 'English' },
  zh: { label: 'Mandarin', fallback: 'English' },
};

function detectIntentFromMessage(message) {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('form') || lowerMsg.includes('i-') || lowerMsg.includes('how do i apply')) {
    return 'form_fill';
  }

  if (lowerMsg.includes('help') || lowerMsg.includes('question') || lowerMsg.includes('can i')) {
    return 'general_help';
  }

  return 'fallback';
}

function buildSystemPrompt(lang, tier) {
  const languageLabel = languageMap[lang]?.label || languageMap['en'].label;

  let systemPrompt = `You are Mira, an AI-powered immigration assistant helping users navigate complex paperwork.`;

  if (tier >= 25) {
    systemPrompt += ` You are allowed to explain multiple paths, mention relevant forms, and offer structured guidance.`;
  } else if (tier >= 5) {
    systemPrompt += ` Offer brief, helpful answers and suggest what form might be relevant, but do not walk them through it step-by-step.`;
  } else {
    systemPrompt += ` Respond politely but do not offer any form-specific help. Suggest they upgrade for deeper guidance.`;
  }

  systemPrompt += ` Always include the legal disclaimer: “This is not legal advice. Please consult an immigration attorney for official guidance.”`;
  systemPrompt += ` Your response language must be ${languageLabel}.`;

  return systemPrompt;
}

function getLegalDisclaimer(lang) {
  const disclaimers = {
    en: 'This is not legal advice. Please consult an immigration attorney.',
    es: 'Esto no es asesoramiento legal. Consulte a un abogado de inmigración.',
    hi: 'यह कानूनी सलाह नहीं है। कृपया किसी इमिग्रेशन वकील से परामर्श करें।',
    zh: '这不是法律建议。请咨询移民律师。',
  };
  return disclaimers[lang] || disclaimers['en'];
}

function getFallbackResponse(lang) {
  const messages = {
    en: 'I’m Mira, your friendly immigration assistant. Please upgrade your plan to unlock full guidance.',
    es: 'Soy Mira, tu asistente de inmigración. Actualiza tu plan para obtener ayuda completa.',
    hi: 'मैं मिरा हूँ, आपकी इमिग्रेशन सहायक। कृपया पूरी सहायता प्राप्त करने के लिए अपनी योजना अपग्रेड करें।',
    zh: '我是Mira，你的移民助手。请升级您的计划以获得完整指导。',
  };
  return messages[lang] || messages['en'];
}

function getIntentInstructions(intent, lang) {
  const disclaimer = getLegalDisclaimer(lang);

  const intentTemplates = {
    general_help: `
Answer the user’s immigration-related question in a helpful, friendly tone.
Avoid legal advice. Offer high-level suggestions only.
Always end your reply with: "${disclaimer}"`,
    form_fill: `
If the user is asking about a form, respond with:
- What the form is generally for
- Who usually files it
- Where they can find it
Avoid walking them through every question.
Always end your reply with: "${disclaimer}"`,
    fallback: `
This user may not have access to advanced support.
Be friendly and suggest upgrading their plan to unlock step-by-step help.
Close with: "${disclaimer}"`,
  };

  return intentTemplates[intent] || intentTemplates['general_help'];
}
async function buildPrompt({ message, lang = 'en', tier = 0, intent = 'general_help' }) {
  try {
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid or missing message input');
    }

    if (!['form_fill', 'general_help', 'fallback'].includes(intent)) {
      intent = detectIntentFromMessage(message);
      await logEvent('auto_intent_detected', { message, inferredIntent: intent });
    }

    if (!isSupportedLanguage(lang)) {
      await logEvent('unsupported_language', { lang });
      lang = 'en';
    }

    const header = buildSystemPrompt(lang, tier);

    const prompt = `
Intent: ${intent}
User Message: ${message}

Instructions:
- Respond in ${lang}.
- Use clear, supportive tone.
- Do not provide legal advice or guarantee results.
- If appropriate, suggest relevant immigration forms or next steps.
- Always close with: “This is not legal advice. Please consult an immigration attorney.”
`;

    return `${header}\n\n${prompt}`;
  } catch (err) {
    console.error(`[PromptBuilder] Error: ${err.message}`);
    await logEvent('prompt_builder_error', {
      error: err.message,
      lang,
      tier,
      message,
    });
    throw new Error('Unable to build prompt at this time.');
  }
}

async function formatFullPrompt({ message, lang = 'en', tier = 0, intent = 'general_help' }) {
  try {
    if (!message || typeof message !== 'string') {
      throw new Error('Missing or invalid message');
    }

    if (!['form_fill', 'general_help', 'fallback'].includes(intent)) {
      intent = detectIntentFromMessage(message);
      await logEvent('auto_intent_detected', { message, inferredIntent: intent });
    }

    const systemPrompt = buildSystemPrompt(lang, tier);
    const instructions = getIntentInstructions(intent, lang);
    const fallbackMessage = getFallbackResponse(lang);

    const userPrompt = `
User Message:
"${message}"

Instructions:
${instructions}
`;

    const finalPrompt = `${systemPrompt}\n\n${userPrompt}`;
    if (tier < 5) return `${fallbackMessage}\n\n${finalPrompt}`;
    return finalPrompt;
  } catch (err) {
    console.error(`[PromptBuilder] formatFullPrompt error: ${err.message}`);
    await logEvent('prompt_format_error', {
      message,
      lang,
      intent,
      tier,
      error: err.message,
    });
    throw new Error('Mira was unable to prepare your request.');
  }
}

module.exports = {
  buildPrompt,
  formatFullPrompt,
  detectIntentFromMessage,
  buildSystemPrompt,
  getLegalDisclaimer,
  getFallbackResponse,
  getIntentInstructions,
};
