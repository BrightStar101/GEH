// File: /frontend/pages/ugc/ShareYourStory.jsx
// Purpose: Final UGC story intake page with emotional, accessibility, and UX enhancements

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetaHead from "@/components/public/MetaHead";
import axios from "axios";

/**
 * ShareYourStory.jsx
 *
 * Final public-facing UGC form with:
 * - Auto-save draft support
 * - Accessibility upgrades (ARIA/semantic roles)
 * - Pre-form CTA messaging
 * - Word count display
 */
export default function ShareYourStory() {
  const [userName, setUserName] = useState("");
  const [storyText, setStoryText] = useState("");
  const [consentToShare, setConsentToShare] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const DRAFT_KEY = "geh_story_draft";

  // Load draft on mount
  useEffect(() => {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (draft) {
      setUserName(draft.userName || "");
      setStoryText(draft.storyText || "");
      setConsentToShare(draft.consentToShare || false);
    }
  }, []);

  // Auto-save on change
  useEffect(() => {
    const draft = {
      userName,
      storyText,
      consentToShare,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [userName, storyText, consentToShare]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!userName.trim() || storyText.length < 100) {
      return setError("Please enter your name and a story with at least 100 characters.");
    }

    try {
      const res = await axios.post("/api/ugc/share-your-story", { userName, storyText, consentToShare });
      const data = res.data;

      if (!data.success) {
        throw new Error(data.message || "Submission failed.");
      }

      localStorage.removeItem(DRAFT_KEY);
      navigate("/ugc/submitted");
    } catch (err) {
      console.error("Submission error:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 bg-white min-h-screen" role="main">
      <MetaHead
        title="Share Your Story | Global Entry Hub"
        description="Tell us how immigration shaped your journey. Submit your story anonymously to inspire others through Mira."
        canonical="https://www.globalentryhub.com/ugc/share-your-story"
        ogUrl="https://www.globalentryhub.com/ugc/share-your-story"
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Share Your Story</h1>

      <div className="text-center text-gray-600 mb-6">
        <p>Your story could inspire someone else to take the first step. Every voice matters.</p>
        <p className="italic text-sm text-gray-500 mt-2">
          “Sharing helped me reflect on how far my family has come.” — Maria, GEH contributor
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Story submission form">
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="storyText" className="block text-sm font-medium text-gray-700">
            Your Story (min 100 characters)
          </label>
          <textarea
            id="storyText"
            rows={8}
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
            aria-required="true"
            aria-describedby="storyWordCount"
          />
          <p id="storyWordCount" className="text-xs text-gray-500 mt-1">
            Word count: {storyText.trim().split(/\s+/).length} | Characters: {storyText.length}
          </p>
        </div>

        <div className="flex items-start gap-2">
          <input
            id="consentToShare"
            type="checkbox"
            checked={consentToShare}
            onChange={(e) => setConsentToShare(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            aria-label="Consent to anonymously share my story"
          />
          <label htmlFor="consentToShare" className="text-sm text-gray-700">
            I give Global Entry Hub permission to share my story anonymously on public platforms.
          </label>
        </div>

        {error && (
          <p className="text-red-600 text-sm mt-2" role="alert">{error}</p>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-sm transition"
        >
          Submit My Story
        </button>
      </form>
    </main>
  );
}
