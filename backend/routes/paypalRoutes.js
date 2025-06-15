// enhancements/routes/paypalRoutes.js

/**
 * paypalRoutes.js
 *
 * Handles PayPal payment flow using REST API:
 * - Creates PayPal orders
 * - Captures approved orders
 * - Updates user tier and triggers CLA logs
 *
 * Must comply with monetization logic and localized UX messaging.
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/userModel');

const { authenticate } = require('../middleware/authMiddleware');
const { logComplianceTrigger } = require('../services/loggerService');
const { getLocalizedText } = require('../utils/languageUtils');
const { getUserTierConfig } = require('../config/tierConfig');
const purchaseTierConfig = require('../config/purchaseTierConfig.json');

// Map GEH tiers to PayPal plan SKUs
const tierSkuMap = {
  5: 'GEH_PLAN_5',
  25: 'GEH_PLAN_25',
  75: 'GEH_PLAN_75',
};

// Auth for PayPal REST API
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  try {
    const response = await axios.post(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (err) {
    console.log(err.response.data);
  }
}

/**
 * @route POST /api/paypal/create-order
 * @desc Create a PayPal order for a selected tier
 * @access Protected (JWT)
 */
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { selectedTier } = req.body;
    const language = req.user.language || 'en';

    if (!['starter', 'official', 'family'].includes(selectedTier)) {
      return res.status(400).json({
        error: getLocalizedText(language, 'tier.invalid') || 'Invalid tier selected.',
        confidence: 0.1,
        claFlagged: true,
      });
    }

    const tierConfig = getUserTierConfig(selectedTier);
    if (!tierConfig?.gptAccess) {
      logComplianceTrigger({
        userId: req.user._id,
        type: 'InvalidPayPalTierAttempt',
        attemptedTier: selectedTier,
      });

      return res.status(403).json({
        error: getLocalizedText(language, 'tier.notAllowed') || 'Tier not available for PayPal purchase.',
        confidence: 0.0,
        claFlagged: true,
      });
    }

    const token = await getPayPalAccessToken();

    const order = await axios.post(
      'https://api-m.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: String(purchaseTierConfig[selectedTier].price),
            },
            custom_id: req.user.id.toString(),
            description: `GEH Plan - $${purchaseTierConfig[selectedTier].price}`,
          },
        ],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/purchase/success`,
          cancel_url: `${process.env.FRONTEND_URL}/purchase/cancel`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ orderID: order.data.id });
  } catch (err) {
    console.error('[PayPal Create Order Error]', err.message);
    res.status(500).json({
      error: getLocalizedText('en', 'error.generic') || 'Could not create PayPal order.',
      confidence: 0.2,
      claFlagged: true,
    });
  }
});

/**
 * @route POST /api/paypal/capture-order
 * @desc Capture PayPal payment and activate plan
 * @access Protected (JWT)
 */
router.post('/capture-order', authenticate, async (req, res) => {
  try {
    const { orderID, selectedTier } = req.body;
    const userId = req.user._id;
    const language = req.user.language || 'en';

    const token = await getPayPalAccessToken();
    const capture = await axios.post(
      `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.planTier = selectedTier;
    user.paymentConfirmed = true;
    user.planActivatedAt = new Date();
    user.tokensUsed = 0;
    user.promptsUsed = 0;

    await user.save();

    logComplianceTrigger({
      userId,
      type: 'PayPalTierActivated',
      metadata: {
        tier: selectedTier,
        orderID,
        email: user.email,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: getLocalizedText(language, 'purchase.success') || 'Purchase complete!',
    });
  } catch (err) {
    console.error('[PayPal Capture Error]', err.message);
    res.status(500).json({
      error: getLocalizedText('en', 'error.generic') || 'Could not capture PayPal payment.',
      confidence: 0.1,
      claFlagged: true,
    });
  }
});

module.exports = router;
