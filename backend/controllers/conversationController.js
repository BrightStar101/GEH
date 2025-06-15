/**
 * Controller for handling chat requests to Mira via GPT.
 * Integrates tier logic, multilingual prompt building, and token cap enforcement.
 */

const { buildPrompt, formatFullPrompt } = require('../utils/promptBuilder');
const { sendPrompt, isWithinTokenLimit } = require('../services/openaiService');
const { logEvent } = require('../utils/logEvent');

/**
 * POST /api/chat
 */
async function handleChat(req, res) {
  try {
    const user = req.user;
    if (!user || !user.id || typeof user.tier !== 'number') {
      return res.status(401).json({ error: 'Unauthorized. JWT token missing or invalid.' });
    }

    const { message, lang = 'en', intent } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return res.status(400).json({ error: 'Invalid input: message is required and must be a string.' });
    }

    const tokenCapCheck = await isWithinTokenLimit(user.id, 500);
    if (!tokenCapCheck) {
      await logEvent('token_limit_blocked', { userId: user.id });
      return res.status(403).json({ error: 'Token limit exceeded for your current plan.' });
    }

    await logEvent('chat_request_received', {
      userId: user.id,
      tier: user.tier,
      lang,
      intent,
      message,
    });

    const prompt = await buildPrompt({
      message,
      lang,
      tier: user.tier,
      intent,
    });

    const gptReply = await sendPrompt({
      userId: user.id,
      prompt,
      maxTokens: user.tier >= 25 ? 1000 : 300,
      model: 'gpt-4o',
      language: lang,
    });

    await logEvent('chat_response_success', {
      userId: user.id,
      responsePreview: gptReply?.slice(0, 80) || '',
    });

    return res.status(200).json({
      response: gptReply,
    });
  } catch (err) {
    console.error(`[ConversationController] Error: ${err.message}`);
    await logEvent('chat_response_error', {
      userId: req.user?.id || 'unknown',
      error: err.message,
    });

    return res.status(500).json({
      error: 'Mira encountered an error while preparing your response.',
    });
  }
}

/**
 * Expanded handler to include confidence metadata.
 */
async function handleChatWithMetadata(req, res) {
  try {
    const user = req.user;
    if (!user || !user.id || typeof user.tier !== 'number') {
      return res.status(401).json({ error: 'Unauthorized. JWT token missing or invalid.' });
    }

    const { message, lang = 'en', intent } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return res.status(400).json({ error: 'Invalid input: message is required and must be a string.' });
    }

    const tokenCapCheck = await isWithinTokenLimit(user.id, 500);
    if (!tokenCapCheck) {
      await logEvent('token_limit_blocked', { userId: user.id });
      return res.status(403).json({ error: 'Token limit exceeded for your current plan.' });
    }

    await logEvent('chat_request_received', {
      userId: user.id,
      tier: user.tier,
      lang,
      intent,
      message,
    });

    const prompt = await buildPrompt({
      message,
      lang,
      tier: user.tier,
      intent,
    });

    const gptReply = await sendPrompt({
      userId: user.id,
      prompt,
      maxTokens: user.tier >= 25 ? 1000 : 300,
      model: 'gpt-4o',
      language: lang,
    });

    const confidence = estimateConfidence(gptReply);

    await logEvent('chat_response_success', {
      userId: user.id,
      confidence,
      model: 'gpt-4o',
      responsePreview: gptReply?.slice(0, 80),
    });

    return res.status(200).json({
      response: gptReply,
      confidenceScore: confidence,
      modelUsed: 'gpt-4o',
    });
  } catch (err) {
    console.error(`[ConversationController] handleChatWithMetadata error: ${err.message}`);
    await logEvent('chat_response_error', {
      userId: req.user?.id || 'unknown',
      error: err.message,
    });

    return res.status(500).json({
      error: 'Mira encountered an error while preparing your response.',
    });
  }
}

/**
 * Estimates confidence from GPT output length.
 */
function estimateConfidence(text) {
  if (!text || typeof text !== 'string') return 0.2;
  const length = text.length;
  if (length > 1500) return 0.95;
  if (length > 800) return 0.85;
  if (length > 400) return 0.7;
  if (length > 150) return 0.5;
  return 0.3;
}

module.exports = {
  handleChat,
  handleChatWithMetadata,
};
