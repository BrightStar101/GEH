// File: /frontend/components/public/FeaturedStoryHero.jsx
// Purpose: Displays a featured/pinned public story at the top of the story wall

import React from "react";
import PropTypes from "prop-types";

/**
 * FeaturedStoryHero.jsx
 *
 * Renders the top story on the story wall in a larger “hero” style block.
 * Highlights country, preview text, and contributor.
 */

export default function FeaturedStoryHero({ story }) {
  if (!story) return null;

  const {
    userName,
    storyText,
    countryOfOrigin,
    languageCode,
    createdAt,
  } = story;

  const preview = storyText.length > 400
    ? storyText.slice(0, 400).trim() + "…"
    : storyText;

  const readableDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "Unknown";

  return (
    <section className="mb-10 p-6 md:p-8 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <div className="mb-3 text-xs text-blue-700 flex items-center justify-between">
        <span className="uppercase font-semibold">
          {countryOfOrigin || "Global"}
        </span>
        <span className="text-blue-600">{languageCode?.toUpperCase() || "EN"}</span>
      </div>

      <h2 className="text-xl font-bold text-blue-900 mb-2">
        Featured Story from {countryOfOrigin || "the Community"}
      </h2>

      <p className="text-sm text-gray-800 whitespace-pre-line mb-4">{preview}</p>

      <div className="text-xs text-blue-800 flex justify-between items-center mt-4">
        <span>— {userName}</span>
        <span>{readableDate}</span>
      </div>
    </section>
  );
}

FeaturedStoryHero.propTypes = {
  story: PropTypes.shape({
    userName: PropTypes.string.isRequired,
    storyText: PropTypes.string.isRequired,
    countryOfOrigin: PropTypes.string,
    languageCode: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};
