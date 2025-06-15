// File: /frontend/components/ugc/UGCModerationQueue.jsx
// Purpose: Admin moderation panel for reviewing UGC submissions

import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * UGCModerationQueue.jsx
 *
 * Displays flagged/pending UGC stories for admin review.
 * Includes:
 * - Approve/reject buttons
 * - Rejection reason input
 * - Secure admin-only interface
 */

export default function UGCModerationQueue({ queue, onAction }) {
  const [reasonMap, setReasonMap] = useState({});

  const handleReasonChange = (storyId, text) => {
    setReasonMap({ ...reasonMap, [storyId]: text });
  };

  const handleApprove = (storyId) => {
    onAction("approve", storyId);
  };

  const handleReject = (storyId) => {
    const reason = reasonMap[storyId] || "No reason provided.";
    onAction("reject", storyId, reason);
  };

  if (!Array.isArray(queue) || queue.length === 0) {
    return <p className="text-sm text-gray-500">No pending stories found.</p>;
  }

  return (
    <div className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Moderation Queue</h2>
      <ul className="space-y-6">
        {queue.map((entry) => {
          const story = entry.submissionId;
          return (
            <li key={entry._id} className="border-b pb-4">
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium text-gray-900">{story.userName}</span>
                {entry.flagged && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                    Flagged
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-800 whitespace-pre-line mb-2">
                {story.storyText}
              </p>

              <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="Rejection reason (optional)"
                  value={reasonMap[story._id] || ""}
                  onChange={(e) => handleReasonChange(story._id, e.target.value)}
                  className="w-full sm:max-w-xs border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(story._id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(story._id)}
                    className="px-4 py-2 border border-red-600 text-red-600 text-sm rounded hover:bg-red-50 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

UGCModerationQueue.propTypes = {
  queue: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      flagged: PropTypes.bool,
      submissionId: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        storyText: PropTypes.string.isRequired,
        status: PropTypes.string,
      }).isRequired,
    })
  ).isRequired,
  onAction: PropTypes.func.isRequired,
};
