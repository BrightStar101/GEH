// File: /frontend/components/public/StoryCategoryCard.jsx
// Purpose: Renders a clickable card for each story category (icon, title, CTA)

import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * StoryCategoryCard.jsx
 *
 * Displays category metadata: icon, label, description, link to /stories/category/:slug.
 */

export default function StoryCategoryCard({ category }) {
  const { label, slug, icon, description } = category;

  return (
    <Link
      to={`/stories/category/${slug}`}
      className="flex flex-col border border-gray-200 bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="text-4xl mb-2">{icon || "📘"}</div>
      <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
      <p className="text-sm text-gray-600 mt-1 flex-grow">{description}</p>
      <span className="mt-3 text-sm font-medium text-blue-600 hover:underline">
        Explore Stories →
      </span>
    </Link>
  );
}

StoryCategoryCard.propTypes = {
  category: PropTypes.shape({
    label: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    icon: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
};
