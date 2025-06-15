// File: /frontend/components/public/FeaturedStoryBanner.jsx
// Purpose: Highlights a single featured story (top of category or homepage)

import React from "react";
import PropTypes from "prop-types";

/**
 * FeaturedStoryBanner.jsx
 *
 * Displays a large, emotionally engaging hero block for a top UGC story.
 * Typically placed at the top of a category page.
 */

export default function FeaturedStoryBanner({ story }) {
  if (!story) return null;

  const { userName, storyText, countryOfOrigin, createdAt } = story;

  const preview =
    storyText.length > 450 ? storyText.slice(0, 450).trim() + "…" : storyText;

  const readableDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  return (
    <section className="mb-8 p-6 md:p-8 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <div className="text-xs text-blue-600 flex items-center justify-between mb-2">
        <span className="uppercase font-semibold">{countryOfOrigin || "GLOBAL"}</span>
        <span className="text-blue-500">{readableDate}</span>
      </div>

      <h2 className="text-xl font-bold text-blue-900 mb-3">Featured Story</h2>
      <p className="text-sm text-gray-800 whitespace-pre-line mb-4">{preview}</p>

      <div className="text-xs text-blue-800 italic mt-2 text-right">— {userName}</div>
    </section>
  );
}

FeaturedStoryBanner.propTypes = {
  story: PropTypes.shape({
    userName: PropTypes.string.isRequired,
    storyText: PropTypes.string.isRequired,
    countryOfOrigin: PropTypes.string,
    createdAt: PropTypes.string,
  }),
};
