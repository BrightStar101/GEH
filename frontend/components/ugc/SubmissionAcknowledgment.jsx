// File: /frontend/components/ugc/SubmissionAcknowledgment.jsx
// Purpose: Displays confirmation message after successful story submission

import React from "react";
import { Link } from "react-router-dom";

/**
 * SubmissionAcknowledgment.jsx
 *
 * Displays a thank-you message and post-submission options.
 * Includes community reinforcement, optional CTAs, and responsive layout.
 */

export default function SubmissionAcknowledgment() {
  return (
    <main className="min-h-screen px-6 py-16 bg-white flex flex-col items-center justify-center text-center">
      <div className="max-w-lg">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          🎉 Thank you for sharing your story!
        </h1>

        <p className="text-gray-700 mb-6 text-base">
          Your story has been submitted and will be reviewed by our team.  
          If approved, it may be anonymously featured to inspire others navigating their immigration journey.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition"
          >
            Return to Homepage
          </Link>
          <Link
            to="/ugc/share-your-story"
            className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 text-sm font-medium transition"
          >
            Share Another Story
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8 italic">
          Global Entry Hub is committed to amplifying immigrant voices with dignity, privacy, and care.
        </p>
      </div>
    </main>
  );
}
