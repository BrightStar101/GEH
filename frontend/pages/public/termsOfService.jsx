// File: /frontend/pages/public/termsOfService.jsx
// Purpose: Renders the Terms of Service agreement for Global Entry Hub with full legal guardrails

import React, { useEffect } from "react";
import MetaHead from "@/components/public/MetaHead";
import FooterNavigation from "@/components/public/FooterNavigation";
import analyticsTracker from "../../utils/analyticsTracker";
import { Link } from "react-router-dom";

/**
 * termsOfService.jsx
 *
 * Displays the legally binding Terms of Service for all Global Entry Hub users.
 * Includes disclaimers, usage limitations, refund policy, data handling rights,
 * AI limitations, tier durations, and privacy alignment.
 */

export default function TermsOfService() {
  useEffect(() => {
    analyticsTracker.logPageView("terms_of_service");
  }, []);

  return (
    <>
      <MetaHead
        title="Terms of Service | Global Entry Hub"
        description="Review the full terms and conditions for using the Global Entry Hub platform and our AI immigration assistant, Mira."
        canonical="https://www.globalentryhub.com/terms"
        ogImage="/static/meta/legal-cover.jpg"
        ogUrl="https://www.globalentryhub.com/terms"
      />

      <div className="bg-white text-gray-900 w-full">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">
            <p><strong>Effective Date:</strong> April 28, 2025</p>

            <p>
              These Terms of Service (“Terms”) govern your access to and use of the Global Entry Hub platform,
              operated by GoldenKeyHoldCo LLC, a Delaware-registered company (“we,” “our,” or “us”), including our
              AI-powered assistant, Mira. By using our services, you agree to these Terms in full.
            </p>

            <h2 className="text-lg font-semibold mt-6">1. Platform Purpose</h2>
            <p>
              Global Entry Hub is an AI-only document preparation tool. It is designed to help you complete
              immigration forms more easily and accurately. We do not provide legal advice, cannot guarantee outcomes,
              and are not affiliated with any government agency.
            </p>
            <p>
              Mira prepares documents based on publicly available immigration form instructions. She is not a lawyer
              and does not replace the advice or services of licensed professionals.
            </p>

            <h2 className="text-lg font-semibold mt-6">2. Eligibility</h2>
            <p>
              You must be at least 18 years old or have the legal consent of a parent or guardian to use this platform.
              You agree to provide accurate information and not impersonate others.
            </p>

            <h2 className="text-lg font-semibold mt-6">3. AI Limitations</h2>
            <p>
              Mira does not offer legal advice, cannot file documents on your behalf, and does not influence processing
              timelines from any government agency. You are responsible for reviewing all generated forms before submission.
            </p>

            <h2 className="text-lg font-semibold mt-6">4. Account Usage</h2>
            <p>
              You may only share your account with one other household member (e.g., spouse or child). Any other account
              sharing or unauthorized access may result in suspension or termination.
            </p>

            <h2 className="text-lg font-semibold mt-6">5. One-Time Plans & Refunds</h2>
            <p>
              We do not offer subscriptions. All plans are one-time purchases that include access to Mira for a fixed duration:
              24 hours (Starter), 72 hours (Official), or 1 week (Friends & Family). These durations begin when AI access starts.
            </p>
            <p>
              Refunds are only available if Mira has not been accessed and no more than one form has been generated.
              Refunds are not issued after the usage window begins or after two forms have been completed.
            </p>

            <h2 className="text-lg font-semibold mt-6">6. Data & Privacy</h2>
            <p>
              You own your data. All uploaded documents, user content, and generated forms are encrypted at rest and in transit.
              You may request a full export or deletion of your data at any time by emailing
              <a href="mailto:support@globalentryhub.com" className="text-blue-600 underline">support@globalentryhub.com</a>.
            </p>
            <p>
              Completed forms are retained on our servers for 90 days unless you delete or download them sooner.
              See our <Link to="/privacy" className="text-blue-600 underline">Privacy Policy</Link> for additional details.
            </p>

            <h2 className="text-lg font-semibold mt-6">7. Intellectual Property</h2>
            <p>
              All software, branding, content, AI logic, and platform design are owned by GoldenKeyHoldCo LLC.
              You may not copy, reverse engineer, resell, or repurpose any part of the platform without written permission.
            </p>

            <h2 className="text-lg font-semibold mt-6">8. Modifications to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the platform after updates go into effect
              constitutes acceptance of the revised terms. It is your responsibility to check for changes periodically.
            </p>

            <h2 className="text-lg font-semibold mt-6">9. Contact Information</h2>
            <p>
              For legal questions, refunds, or user data requests, email us at
              <a href="mailto:support@globalentryhub.com" className="text-blue-600 underline"> support@globalentryhub.com</a>.
            </p>
          </div>
        </div>

        
      </div>
    </>
  );
}
