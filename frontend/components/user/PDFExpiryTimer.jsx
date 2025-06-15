// frontend/components/PDFExpiryTimer.jsx

/**
 * PDFExpiryTimer.jsx
 *
 * Countdown component showing how many days remain until a PDF expires.
 * Compliant with CLA fallback, tier display safety, and localized UX.
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNowStrict } from 'date-fns';

export default function PDFExpiryTimer({ expiresAt }) {
  const { t } = useTranslation();
  const [daysLeft, setDaysLeft] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    try {
      const expiration = new Date(expiresAt);
      const now = new Date();
      const msRemaining = expiration - now;
      const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));

      if (days <= 0) {
        setExpired(true);
        setDaysLeft(0);
      } else {
        setDaysLeft(days);
      }
    } catch (err) {
      console.error('[PDFExpiryTimer] Invalid date input:', err.message);
    }
  }, [expiresAt]);

  const urgencyColor = daysLeft <= 7 ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="text-sm mt-2">
      {expired ? (
        <p className="text-red-700 font-medium">{t('pdf.expired')}</p>
      ) : (
        <p className={`${urgencyColor}`}>
          {t('pdf.expiresIn')} <strong>{daysLeft}</strong> {t('pdf.days')} (
          {formatDistanceToNowStrict(new Date(expiresAt), { addSuffix: true })})
        </p>
      )}
    </div>
  );
}
