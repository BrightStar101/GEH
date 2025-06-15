import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * FooterNavigation.jsx
 *
 * Public footer used on all Global Entry Hub pages.
 * Includes trust and legal links, contact reference, compliance declarations,
 * and brand ownership disclosures.
 */

export default function FooterNavigation() {
  const { t } = useTranslation();
  const { isAdmin } = useContext(AuthContext);

  return (
    <footer className="bg-gray-100 border-t mt-12 text-gray-700 text-sm static bottom-0 left-0 right-0">
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <p className="font-semibold">Legal</p>
          <ul className="space-y-1">
            <li>
              <Link to="/terms" className="hover:underline text-blue-600">
                {t('footer.terms')}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:underline text-blue-600">
                {t('footer.privacy')}
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin" className="hover:underline text-blue-600">
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">{t('footer.trust')}</p>
          <ul className="space-y-1">
            <li>
              <Link to="/trust" className="hover:underline text-blue-600">
                Trust Center
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:underline text-blue-600">
                AI Support Access
              </Link>
            </li>
            <li>
              <span className="text-gray-600">
                Contact:{" "}
                <a
                  href="mailto:support@globalentryhub.com"
                  className="text-blue-600 underline"
                >
                  support@globalentryhub.com
                </a>
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">Company</p>
          <ul className="space-y-1">
            <li>
              <Link to="/about" className="hover:underline text-blue-600">
                About Us
              </Link>
            </li>
            <li className="text-gray-500">© 2025 GoldenKeyHoldCo LLC</li>
            <li className="text-gray-500 text-xs">
              Patent Pending. All Rights Reserved.
            </li>
            <li className="text-gray-400 text-xs">
              Registered in Delaware, USA.
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
