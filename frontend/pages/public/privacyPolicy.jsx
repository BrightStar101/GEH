// File: /frontend/pages/public/privacyPolicy.jsx
// Purpose: Renders Global Entry Hub's Privacy Policy in full compliance with GDPR, CCPA, and internal platform controls

import React, { useEffect } from "react";
import MetaHead from "@/components/public/MetaHead";
import FooterNavigation from "@/components/public/FooterNavigation";
import analyticsTracker from "../../utils/analyticsTracker";

/**
 * privacyPolicy.jsx
 *
 * Displays the legally required privacy policy for all users of
 * the Global Entry Hub platform. Outlines how user data is stored,
 * shared, retained, and deleted.
 */

export default function PrivacyPolicy() {
  useEffect(() => {
    analyticsTracker.logPageView("privacy_policy");
  }, []);

  return (
    <>
      <MetaHead
        title="Privacy Policy | Global Entry Hub"
        description="Review how Global Entry Hub protects your privacy, encrypts your data, and complies with GDPR and CCPA."
        canonical="https://www.globalentryhub.com/privacy"
        ogImage="/static/meta/privacy-hero.jpg"
        ogUrl="https://www.globalentryhub.com/privacy"
      />

      <div className="bg-white text-gray-900 w-full">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">
            <p><strong>Effective Date:</strong> April 28, 2025</p>

            <p>
              GoldenKeyHoldCo LLC (“we,” “us,” or “our”) operates the Global Entry Hub platform.
              This Privacy Policy explains how we collect, use, and protect your information.
              By using our services, you agree to the terms outlined here.
            </p>

            <h2 className="text-lg font-semibold mt-6">1. Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Form inputs and uploaded documents</li>
              <li>Basic account information (name, email, country)</li>
              <li>Device/browser metadata (for fraud prevention)</li>
              <li>Analytics events (button clicks, page views)</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6">2. How We Use Your Data</h2>
            <p>Your data is used to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Generate accurate immigration form outputs</li>
              <li>Enable Mira’s multilingual support and guidance</li>
              <li>Fulfill legal requests (e.g., DSAR exports)</li>
              <li>Improve platform quality and AI training (anonymized only)</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6">3. Encryption & Storage</h2>
            <p>
              All data is encrypted at rest and in transit using modern cryptographic standards.
              We use Google Cloud and related infrastructure to ensure secure backups and access control.
              Completed forms are retained for 90 days unless downloaded or deleted sooner by the user.
            </p>

            <h2 className="text-lg font-semibold mt-6">4. Third-Party Vendors</h2>
            <p>
              We may use third-party processors for OCR, analytics, and document rendering. These services
              are contractually obligated to uphold strict data privacy and security standards.
              We do not sell your data — ever.
            </p>

            <h2 className="text-lg font-semibold mt-6">5. Cookies & Tracking</h2>
            <p>
              We use cookies to enhance user experience and support performance monitoring.
              You may opt out of tracking cookies in compliance with CCPA and GDPR.
            </p>

            <h2 className="text-lg font-semibold mt-6">6. Data Export & Deletion</h2>
            <p>
              You may request a copy of your data or ask for deletion at any time.
              Requests can be made by emailing
              <a href="mailto:support@globalentryhub.com" className="text-blue-600 underline"> support@globalentryhub.com</a>.
              We will fulfill these requests within 30 days in accordance with applicable privacy laws.
            </p>

            <h2 className="text-lg font-semibold mt-6">7. Children’s Privacy</h2>
            <p>
              Our platform is not intended for users under the age of 13. If we discover a user account linked to a
              minor without parental consent, we will delete it immediately.
            </p>

            <h2 className="text-lg font-semibold mt-6">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The latest version will always be available at
              this page. Continued use of the platform constitutes acceptance of any revisions.
            </p>

            <h2 className="text-lg font-semibold mt-6">9. Contact Us</h2>
            <p>
              For privacy concerns, data requests, or general questions, contact us at
              <a href="mailto:support@globalentryhub.com" className="text-blue-600 underline"> support@globalentryhub.com</a>.
            </p>
          </div>
        </div>

        
      </div>
    </>
  );
}
