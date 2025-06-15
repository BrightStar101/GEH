// File: /frontend/components/public/StoryFilters.jsx
// Purpose: Provides country/language/tag filtering controls for story wall or country pages

import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * StoryFilters.jsx
 *
 * Allows users to filter public stories by:
 * - Country
 * - Language
 * - Tag
 * Sends selected filters to parent via `onChange()`.
 */

export default function StoryFilters({ filters, onChange }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const clearFilters = () => {
    const cleared = { country: "", language: "", tag: "" };
    setLocalFilters(cleared);
    onChange(cleared);
  };

  return (
    <div className="mb-6 bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="countryFilter" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            id="countryFilter"
            type="text"
            value={localFilters.country}
            onChange={(e) => handleChange("country", e.target.value.toUpperCase())}
            placeholder="e.g. US, IN"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="languageFilter" className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <input
            id="languageFilter"
            type="text"
            value={localFilters.language}
            onChange={(e) => handleChange("language", e.target.value.toLowerCase())}
            placeholder="e.g. en, es"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="tagFilter" className="block text-sm font-medium text-gray-700">
            Tag
          </label>
          <input
            id="tagFilter"
            type="text"
            value={localFilters.tag}
            onChange={(e) => handleChange("tag", e.target.value.toLowerCase())}
            placeholder="e.g. asylum, family"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition mt-2 md:mt-0"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

StoryFilters.propTypes = {
  filters: PropTypes.shape({
    country: PropTypes.string,
    language: PropTypes.string,
    tag: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
