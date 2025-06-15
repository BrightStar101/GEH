/**
 * purchaseHistoryModel.js
 *
 * Global Entry Hub (GEH)
 * One-Time Tier Purchase History Schema (Patched)
 */

const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    planLevel: {
      type: String,
      enum: ['free', 'starter', 'official', 'friends-and-family'],
      required: true,
    },
    pricePaid: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    usage: {
      formsUsed: { type: Number, default: 0 },
      pdfDownloads: { type: Number, default: 0 },
    },
    aiAccess: {
      start: { type: Date, default: null },
      end: { type: Date, default: null },
    },
    stripeTransactionId: {
      type: String,
      default: null,
    },
    paypalTransactionId: {
      type: String,
      default: null,
    },
    expiredAt: {
      type: Date,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    product: {
      type: String,
      default: 'GEH',
    },
  },
  {
    collection: 'purchase_history',
    versionKey: false,
  }
);

module.exports = mongoose.model('PurchaseHistory', purchaseSchema);
