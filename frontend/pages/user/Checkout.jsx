// frontend/pages/Checkout.jsx

/**
 * Checkout.jsx
 *
 * GEH Checkout Page — Stripe + PayPal + Tier Logic
 * Includes CLA fallback, token metadata, multilingual support, and accessibility.
 */

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const tierLabels = {
  starter: { price: '$5', label: 'Starter Kit', value: 5 },
  official: { price: '$25', label: 'Official Pack', value: 25 },
  family: { price: '$75', label: 'Friends & Family Plan', value: 75 },
};

const tierMetadata = {
  starter: { tokens: 12000, duration: '24 hours', support: 15 },
  official: { tokens: 160000, duration: '72 hours', support: 30 },
  family: { tokens: 500000, duration: '1 week', support: 100 },
};

export default function Checkout() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [selectedTier, setSelectedTier] = useState('starter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confidence, setConfidence] = useState(1.0);

  const plan = tierLabels[selectedTier];
  const meta = tierMetadata[selectedTier];

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/stripe/checkout', { type: 1, selectedTier });
      const data = res.data;
      if (data.url) {
        window.location.href = data.url;
      } else {
        setConfidence(data.confidence || 0.5);
        setError(data.error || t('checkout.errorFallback'));
      }
    } catch (err) {
      setConfidence(0.3);
      setError(t('checkout.errorStripe'));
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/paypal/create-order', { selectedTier: plan.value });
      const data = res.data;
      if (res.ok && data.orderID) {
        window.location.href = `https://www.paypal.com/checkoutnow?token=${data.orderID}`;
      } else {
        setConfidence(data.confidence || 0.5);
        setError(data.error || t('checkout.errorFallback'));
      }
    } catch (err) {
      setConfidence(0.3);
      setError(t('checkout.errorPayPal'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedTier(params.get('plan') || 'starter');
  }, [params])

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">{t('checkout.title')}</h1>
      <p className="text-gray-600 mb-8">{t('checkout.subtitle')}</p>

      <div role="radiogroup" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.entries(tierLabels).map(([key, tier]) => (
          <button
            key={key}
            aria-label={`Select ${tier.label}`}
            role="radio"
            aria-checked={selectedTier === key}
            onClick={() => setSelectedTier(key)}
            className={`border rounded-xl p-4 focus:outline-none ${
              selectedTier === key ? 'border-blue-600 shadow-lg' : 'border-gray-300'
            }`}
          >
            <h3 className="text-xl font-semibold">{tier.label}</h3>
            <p className="text-gray-500">{tier.price}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>{t('checkout.accessDuration')}: {meta.duration}</p>
        <p>{t('checkout.tokenCap')}: {meta.tokens.toLocaleString()}</p>
        <p>{t('checkout.supportLimit')}: {meta.support}</p>
      </div>

      <div className="mt-2 text-xs text-green-600">
        {t('checkout.selected')} <strong>{plan.label}</strong>
      </div>

      <div className="mt-8 space-y-4">
        <button
          onClick={handleStripeCheckout}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t('checkout.processing') : t('checkout.buttonStripe')}
        </button>
        <button
          onClick={handlePayPalCheckout}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-xl disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t('checkout.redirecting') : t('checkout.buttonPayPal')}
        </button>
      </div>

      {error && (
        <div className="mt-6 text-red-600">
          <p>{error}</p>
          <p className="text-sm text-gray-500">
            {t('checkout.confidence')}: {Math.round(confidence * 100)}%
          </p>
          <button onClick={() => window.location.reload()} className="underline text-sm mt-2">
            {t('checkout.retry')}
          </button>
        </div>
      )}
    </div>
  );
}