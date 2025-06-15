// File: /frontend/components/public/StoryCard.jsx
// Purpose: Public-facing card for displaying a single user-submitted story preview

import React from "react";
import PropTypes from "prop-types";

/**
 * StoryCard.jsx
 *
 * Displays a single UGC story preview for the public story wall or country page.
 * Includes name, snippet, and metadata (e.g., country, language).
 */

export default function StoryCard({ story }) {
  const { userName, storyText, countryOfOrigin, languageCode, createdAt } = story;

  const preview = storyText.length > 300
    ? storyText.slice(0, 300).trim() + "…"
    : storyText;

  const readableDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "Unknown";

  return (
    <article className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium">{countryOfOrigin?.toUpperCase() || "N/A"}</span>
        <span>{languageCode?.toUpperCase() || "EN"}</span>
      </div>

      <p className="text-sm text-gray-700 whitespace-pre-line mb-4">{preview}</p>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
        <span>— {userName}</span>
        <span>{readableDate}</span>
      </div>
    </article>
  );
}

StoryCard.propTypes = {
  story: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    storyText: PropTypes.string.isRequired,
    countryOfOrigin: PropTypes.string,
    languageCode: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
};
