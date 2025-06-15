const axios = require('axios');
const { getUserTierById } = require('../services/subscriptionService');
const { getSecret } = require('../config/gcpSecrets');
const { logEvent } = require('../utils/logEvent');
const confidenceUtils = require('../utils/confidenceUtils'); // ✅ Enhancement

/**
 * Retrieves API key securely from GCP Secret Manager.
 * @returns {Promise<string>}
 */
async function getOpenAIKey() {
  try {
    const secret = await getSecret('OPENAI_API_KEY');
    return secret;
  } catch (err) {
    console.error('Failed to retrieve OpenAI API key from Secret Manager');
    throw new Error('API key unavailable');
  }
}

/**
 * Sends a prompt to the OpenAI API, enforcing token limits and safe response formatting.
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.prompt
 * @param {number} params.maxTokens
 * @param {string} [params.model]
 * @param {string} [params.language]
 * @param {string} [params.agent='mira']
 * @returns {Promise<{ result: string, normalizedScore: number }>}
 */
async function sendPrompt({ userId, prompt, maxTokens, model = 'gpt-4o', language = 'en', agent = 'mira' }) {
  const apiKey = await getOpenAIKey();

  const headers = {
    Authorization: `Bearer ${apiKey.replace('\n', '')}`,
    'Content-Type': 'application/json',
  };

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: `You are Mira, a multilingual AI immigration assistant. Always include disclaimers. Language: ${language}`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
    top_p: 0.9,
    presence_penalty: 0,
    frequency_penalty: 0,
  };

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, { headers });

    const result = response?.data?.choices?.[0]?.message?.content;
    const usage = response?.data?.usage;

    // ✅ Enhancement: Add confidence normalization
    const rawScore = usage?.total_tokens ? 1 - (usage.total_tokens / maxTokens) : 0.5;
    const normalizedScore = confidenceUtils.normalizeScore(rawScore);

    const tierConfig = await getUserTierById(userId);
    const tierId = tierConfig?.tier || 'free';

    await logEvent('gpt_usage', {
      userId,
      agent,
      model,
      tokens_used: usage?.total_tokens || null,
      language,
      tierId,
    });

    if (!result || typeof result !== 'string' || result.trim().length < 5) {
      await logEvent('gpt_fallback_response_used', {
        userId,
        agent,
        reason: 'Blank or unusable GPT output',
        tierId,
      });

      const tierMessage = tierId >= 25
        ? "Mira couldn’t retrieve a full answer this time. Please try again shortly."
        : "Mira encountered an issue. Upgrade your plan for deeper guidance and priority support.";

      return {
        result: `${tierMessage}\n\nThis is not legal advice. Please consult an immigration attorney.`,
        normalizedScore
      };
    }

    return { result, normalizedScore };
  } catch (err) {
    await logEvent('gpt_error', {
      userId,
      agent,
      error: err.response.data,
      prompt,
    });

    return {
      result: `Mira was unable to complete your request right now. Please try again shortly.`,
      normalizedScore: 0.0
    };
  }
}

module.exports = {
  sendPrompt,
};
