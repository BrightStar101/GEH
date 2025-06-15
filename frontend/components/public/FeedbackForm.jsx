// File: /frontend/components/public/FeedbackForm.jsx
// Purpose: Modular feedback submission form for user insight capture

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

/**
 * FeedbackForm.jsx
 * 
 * Renders a secure form where authenticated users can rate their experience and leave optional suggestions.
 * Feedback is submitted to the backend via POST /api/feedback and logged via feedbackAuditLogger.js.
 *
 * @returns JSX.Element
 */
export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwt");

    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      const userId = decoded?.id;

      const res = await axios.post("/api/feedback", {
          userId,
          score,
          message
        });

      const data = res.data;
      if (!data.success) throw new Error("Failed to submit feedback");
      setSubmitted(true);
    } catch (err) {
      console.error("FeedbackForm submission error:", err);
      setError("Could not submit feedback. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="p-6 text-center text-green-700">
        <p className="text-xl font-semibold mb-2">Thank you!</p>
        <p>Your feedback helps Mira improve for everyone.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Help Us Improve Mira</h2>

      <label className="block mb-2 text-sm font-medium text-gray-700">
        How would you rate your experience?
      </label>
      <select
        value={score}
        onChange={(e) => setScore(Number(e.target.value))}
        className="w-full mb-4 p-2 border border-gray-300 rounded"
      >
        {[5, 4, 3, 2, 1].map((val) => (
          <option key={val} value={val}>
            {val} - {val === 5 ? "Excellent" : val === 1 ? "Poor" : ""}
          </option>
        ))}
      </select>

      <label className="block mb-2 text-sm font-medium text-gray-700">
        Anything specific you’d like us to know?
      </label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="4"
        className="w-full mb-4 p-2 border border-gray-300 rounded"
        placeholder="Example: I wanted more detail about Form I-130 timing."
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
      >
        Submit Feedback
      </button>
    </form>
  );
}
