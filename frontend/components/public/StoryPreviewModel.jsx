// File: /frontend/components/public/StoryPreviewModal.jsx
// Purpose: Preview modal for submitted UGC story before final submission

import React from "react";
import PropTypes from "prop-types";

/**
 * StoryPreviewModal.jsx
 *
 * Displays a read-only version of a story as it will appear post-submit.
 * Used for preview in UGCComposer.jsx.
 */

export default function StoryPreviewModal({ html, imageUrl, userName, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white max-w-xl w-full p-6 rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Story Preview</h2>

        {imageUrl && (
          <img src={imageUrl} alt="Uploaded" className="mb-4 w-full max-h-64 object-cover rounded" />
        )}

        <div
          className="text-sm text-gray-800 whitespace-pre-line mb-4 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <p className="text-xs text-gray-500 italic mt-4 text-right">— {userName}</p>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

StoryPreviewModal.propTypes = {
  html: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  userName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};
