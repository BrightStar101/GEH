/**
 * upsellController.js
 *
 * Global Entry Hub (GEH)
 * Purpose: Handles PDF lifetime upgrades (manual, bulk, webhook-triggered)
 */

const upsellService = require("../services/upsellService");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/upsell/upgrade/:fileId
 */
async function upgradeSingleFileLifetime(req, res) {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const result = await upsellService.markAsLifetime(fileId, userId, "manual");
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({ success: true, message: "File upgraded to lifetime access." });
  } catch (err) {
    console.error("upgradeSingleFileLifetime error:", err);
    res.status(500).json({ success: false, error: "Server error during upgrade." });
  }
}

/**
 * POST /api/upsell/upgrade-all
 */
async function upgradeAllFilesLifetime(req, res) {
  try {
    const userId = req.user.id;

    const result = await upsellService.markAllAsLifetime(userId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: `All eligible files upgraded to lifetime.`,
      upgradedCount: result.upgradedCount,
    });
  } catch (err) {
    console.error("upgradeAllFilesLifetime error:", err);
    res.status(500).json({ success: false, error: "Server error during bulk upgrade." });
  }
}

/**
 * POST /api/upsell/stripe/webhook
 * ❗ Requires raw body middleware
 */
async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const fileId = session.metadata?.fileId;

      if (!userId || !fileId) {
        console.warn("🚨 Webhook missing userId or fileId.");
        return res.status(400).send("Missing metadata.");
      }

      const result = await upsellService.logWebhookUpgrade(userId, fileId, session);

      if (!result.success) {
        console.error("⚠️ Webhook upgrade failed. Flagging for retry.");
        return res.status(500).send("Webhook error.");
      }

      return res.status(200).send("Webhook processed.");
    }

    return res.status(200).send("Event received.");
  } catch (err) {
    console.error("🚨 Stripe webhook validation failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

module.exports = {
  upgradeSingleFileLifetime,
  upgradeAllFilesLifetime,
  handleStripeWebhook,
};
