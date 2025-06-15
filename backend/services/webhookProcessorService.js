const fs = require('fs');
const path = require('path');
const Subscription = require('models/subscriptionModel');

async function retrySave(doc, retries = 3, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      await doc.save();
      return true;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

function logWebhookEvent(provider, eventType, userId, extra = '') {
  try {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${provider.toUpperCase()} ${eventType} user=${userId || 'unknown'} ${extra}\n`;
    const logFile = path.join(__dirname, `../../logs/${provider}-events.log`);
    fs.appendFileSync(logFile, entry);
  } catch (err) {
    console.error(`WebhookLogger: Failed to write ${provider} event log`, err.message);
  }
}

async function processStripeEvent(event, options = {}) {
  try {
    const { type, data } = event;
    const obj = data.object;

    switch (type) {
      case 'checkout.session.completed': {
        const userId = obj.metadata?.userId;
        const product = obj.metadata?.product || 'kairo';
        const planTier = obj.metadata?.planTier || 'base';
        const subscriptionId = obj.subscription;
        const currentPeriodEnd = obj.subscription_details?.current_period_end || obj.expires_at;

        if (userId && subscriptionId && currentPeriodEnd) {
          const newSub = new Subscription({
            userId,
            product,
            planTier,
            provider: 'stripe',
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd: new Date(currentPeriodEnd * 1000),
          });
          await retrySave(newSub);
          logWebhookEvent('stripe', type, userId);
        }
        break;
      }

      case 'invoice.paid': {
        const subId = obj.subscription;
        const sub = await Subscription.findOne({ stripeSubscriptionId: subId });
        if (sub) {
          sub.status = 'active';
          sub.currentPeriodEnd = new Date(obj.lines.data[0].period.end * 1000);
          await retrySave(sub);
          logWebhookEvent('stripe', type, sub.userId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const subId = obj.subscription;
        const sub = await Subscription.findOne({ stripeSubscriptionId: subId });
        if (sub) {
          sub.status = 'past_due';
          await retrySave(sub);
          logWebhookEvent('stripe', type, sub.userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subId = obj.id;
        const sub = await Subscription.findOne({ stripeSubscriptionId: subId });
        if (sub) {
          sub.status = 'canceled';
          sub.canceledAt = new Date();
          await retrySave(sub);
          logWebhookEvent('stripe', type, sub.userId);
        }
        break;
      }

      default:
        logWebhookEvent('stripe', type, null, '⚠️ Unhandled');
    }
  } catch (err) {
    console.error('processStripeEvent Error:', err.message);
  }
}

async function processPaypalEvent(event) {
  try {
    const type = event.event_type;
    const resource = event.resource;

    switch (type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const userId = resource.custom_id;
        const product = resource.plan_id.startsWith('kairo') ? 'kairo' : 'lumo';
        const planTier = resource.plan_id.includes('pro') ? 'pro' : 'base';
        const subscriptionId = resource.id;
        const currentPeriodEnd = new Date(resource.billing_info.next_billing_time);

        if (userId && subscriptionId) {
          const newSub = new Subscription({
            userId,
            product,
            planTier,
            provider: 'paypal',
            paypalSubscriptionId: subscriptionId,
            currentPeriodEnd,
          });
          await retrySave(newSub);
          logWebhookEvent('paypal', type, userId);
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subId = resource.id;
        const sub = await Subscription.findOne({ paypalSubscriptionId: subId });
        if (sub) {
          sub.status = 'canceled';
          sub.canceledAt = new Date();
          await retrySave(sub);
          logWebhookEvent('paypal', type, sub.userId);
        }
        break;
      }

      case 'PAYMENT.SALE.DENIED': {
        const subId = resource.billing_agreement_id;
        const sub = await Subscription.findOne({ paypalSubscriptionId: subId });
        if (sub) {
          sub.status = 'past_due';
          await retrySave(sub);
          logWebhookEvent('paypal', type, sub.userId);
        }
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const subId = resource.billing_agreement_id;
        const sub = await Subscription.findOne({ paypalSubscriptionId: subId });
        if (sub) {
          sub.status = 'active';
          await retrySave(sub);
          logWebhookEvent('paypal', type, sub.userId);
        }
        break;
      }

      default:
        logWebhookEvent('paypal', type, null, '⚠️ Unhandled');
    }
  } catch (err) {
    console.error('processPaypalEvent Error:', err.message);
  }
}

module.exports = {
  processStripeEvent,
  processPaypalEvent,
};
