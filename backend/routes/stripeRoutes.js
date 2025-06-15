// enhancements/routes/stripeRoutes.js

/**
 * stripeRoutes.js
 *
 * Routes for Stripe checkout flow — handles pricing tier mapping,
 * session creation, webhook parsing, and monetization enforcement.
 *
 * Enforces CLA triggers, fallback messaging, and multilingual support (EN, ES, HI, ZH).
 */

const express = require('express');
const router = express.Router();
const stripeModule = require('stripe');
const bodyParser = require('body-parser');

const { authenticate } = require('../middleware/authMiddleware');
const { logComplianceTrigger } = require('../services/loggerService');
const { getLocalizedText } = require('../utils/languageUtils');
const { getUserTierConfig } = require('../config/tierConfig');
const User = require('../models/userModel');
const AuditLog = require('../models/AuditLog');

// Tier -> Stripe price mapping (environment-specific IDs)
const stripePriceMap = {
  'starter': process.env.STRIPE_PRICE_ID_5,
  'official': process.env.STRIPE_PRICE_ID_25,
  'family': process.env.STRIPE_PRICE_ID_75,
};

/**
 * @route   POST /api/checkout
 * @desc    Initiates Stripe checkout session for selected tier
 * @access  Protected (JWT)
 */
router.post('/checkout', bodyParser.json(), authenticate, async (req, res) => {
  const stripe = stripeModule(process.env.STRIPE_SECRET_KEY);
  try {
    const { type } = req.body;
    if (type === 1) {
      const { selectedTier } = req.body;
      const userId = req.user.id;
      const language = req.user.language || 'en';

      if (!['starter', 'official', 'family'].includes(selectedTier)) {
        return res.status(400).json({
          error: getLocalizedText(language, 'tier.invalid') || 'Invalid purchase tier.',
          confidence: 0.1,
          claFlagged: true,
        });
      }

      const tierConfig = getUserTierConfig(selectedTier);
      if (!tierConfig || !tierConfig.gptAccess) {
        logComplianceTrigger({
          userId,
          type: 'InvalidTierAttempt',
          attemptedTier: selectedTier,
        });

        return res.status(403).json({
          error: getLocalizedText(language, 'tier.notAllowed') || 'This plan is currently unavailable.',
          confidence: 0.0,
          claFlagged: true,
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripePriceMap[selectedTier],
            quantity: 1,
          },
        ],
        customer_email: req.user.email,
        metadata: {
          type: 1,
          userId: userId.toString(),
          selectedTier: selectedTier,
        },
        success_url: `${process.env.FRONTEND_URL}/dashboard`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?plan=${selectedTier}`,
      });

      return res.status(200).json({ url: session.url });
    } else {
      const userId = req.user.id;
      const language = req.user.language || 'en';

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID_3,
            quantity: 1,
          },
        ],
        customer_email: req.user.email,
        metadata: {
          type: 2,
          userId: userId.toString()
        },
        success_url: `${process.env.FRONTEND_URL}/dashboard`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout`,
      });

      return res.status(200).json({ url: session.url });
    }
  } catch (err) {
    console.error('[Stripe Checkout Error]', err);
    return res.status(500).json({
      error: getLocalizedText('en', 'error.generic') || 'Checkout failed.',
      confidence: 0.2,
      claFlagged: true,
    });
  }
});
// --- CONTINUED FROM Part 1 ---

/**
 * @route   POST /api/stripe/webhook
 * @desc    Stripe webhook listener for checkout completion
 * @access  Public (but protected with Stripe signature verification)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = stripeModule(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Stripe Webhook Error] Invalid signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const type = session.metadata?.type;
    if (Number(type) === 1) {
      const userId = session.metadata?.userId;
      const selectedTier = session.metadata?.selectedTier;

      try {
        const user = await User.findById(userId);
        if (!user) {
          console.warn(`[Stripe Webhook] User not found for ID ${userId}`);
          return res.status(404).end();
        }

        user.planTier = selectedTier;
        user.paymentConfirmed = true;
        user.planActivatedAt = new Date();
        user.tokensUsed = 0;
        user.promptsUsed = 0;
        user.extraPrompts = 0;
        user.formUsed = 0;

        await user.save();

        await new AuditLog({
          userId: user._id,
          action: 'Upgrade Plan',
          metadata: {
            tier: selectedTier
          }
        }).save();

        logComplianceTrigger({
          userId: user._id,
          type: 'TierActivated',
          metadata: {
            tier: selectedTier,
            paymentId: session.payment_intent,
            email: user.email,
          },
        });

        return res.status(200).end();
      } catch (err) {
        console.error('[Stripe Webhook Save Error]', err);
        return res.status(500).send('Internal Error');
      }
    } else {
      const userId = session.metadata?.userId;

      try {
        const user = await User.findById(userId);
        if (!user) {
          console.warn(`[Stripe Webhook] User not found for ID ${userId}`);
          return res.status(404).end();
        }

        user.extraPrompts += 50;

        await user.save();

        await new AuditLog({
          userId: user._id,
          action: 'Purchase Prompts',
          metadata: {
            prompts: 50
          }
        }).save();

        logComplianceTrigger({
          userId: user._id,
          type: 'Extra prompts',
          metadata: {
            paymentId: session.payment_intent,
            email: user.email,
          },
        });

        return res.status(200).end();
      } catch (err) {
        console.error('[Stripe Webhook Save Error]', err);
        return res.status(500).send('Internal Error');
      }
    }
  }

  // Accept other event types silently
  return res.status(200).end();
});

module.exports = router;
