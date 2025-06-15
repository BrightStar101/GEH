/**
 * purchaseModel.js
 *
 * Stores purchase metadata for account upgrades, add-ons, or tier access.
 * Can be triggered by Stripe, PayPal, or manual admin upgrades.
 */

const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gateway: {
      type: String,
      enum: ["stripe", "paypal", "admin"],
      required: true,
    },
    gatewayTransactionId: {
      type: String,
      required: true,
      unique: true,
    },
    planTier: {
      type: String,
      enum: ["starter", "official", "family"],
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    durationDays: {
      type: Number,
      default: 90,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    isRefunded: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

PurchaseSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

PurchaseSchema.methods.remainingDays = function () {
  if (!this.expiresAt) return 0;
  const diff = (new Date(this.expiresAt) - new Date()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(diff));
};

module.exports = mongoose.model("Purchase", PurchaseSchema);
