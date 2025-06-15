// File: /frontend/components/public/TagFilterBar.jsx
// Purpose: Renders a pill-style UI for toggling active tags in UGC search

import React from "react";
import PropTypes from "prop-types";

/**
 * TagFilterBar.jsx
 *
 * Displays tag buttons for story filtering (e.g. asylum, family).
 * Controlled via props and triggers a change on click.
 */

export default function TagFilterBar({ tags, activeTags, onToggle }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isActive = activeTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`px-4 py-1 text-sm rounded-full border transition ${
              isActive
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
            }`}
          >
            #{tag}
          </button>
        );
      })}
      {activeTags.length > 0 && (
        <button
          onClick={() => onToggle(null)}
          className="px-4 py-1 text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

TagFilterBar.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggle: PropTypes.func.isRequired,
};
