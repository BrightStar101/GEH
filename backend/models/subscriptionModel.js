/**
 * subscriptionModel.js
 *
 * Global Entry Hub (GEH)
 * Subscription Record Schema (Kairo/Lumo)
 *
 * Tracks active Stripe/PayPal subscriptions and lifecycle state.
 */

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    product: {
      type: String,
      enum: ['kairo', 'lumo'],
      required: true,
    },
    planTier: {
      type: String,
      enum: ['base', 'pro'],
      default: 'base',
    },
    provider: {
      type: String,
      enum: ['stripe', 'paypal'],
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    paypalSubscriptionId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    cancellationRequested: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  {
    collection: 'subscriptions',
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
