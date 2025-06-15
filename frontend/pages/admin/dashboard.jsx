// File: /frontend/pages/admin/dashboard.jsx

import React, { useContext, useEffect, useState } from "react";
import AdminTopBar from "@/components/admin/AdminTopBar";
import axios from "axios";
import { Star } from 'lucide-react';

import { fetchSystemStats } from "../../services/auditLogService";
import { logger } from "../../utils/logger";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * dashboard.jsx
 * GEH Admin home dashboard.
 * Displays platform usage summaries, flagged log counts, and system health.
 *
 * Assumes valid admin authentication has already occurred via page-level gate.
 *
 * Props:
 * - token: JWT auth token (required)
 * - user: { name: string, role: string }
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const response = await fetchSystemStats();
        setStats(response.data);
      } catch (err) {
        if (isMounted) {
          logger.error("AdminDashboard.loadStats failed", err);
          setError("Unable to load dashboard data.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    const fetchReviews = async () => {
      try {
        const res = await axios.get('/api/reviews/');
        setReviews(res.data || []);
      } catch (err) {
        console.error('[Dashboard] Failed to fetch PDFs:', err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Admin Dashboard
        </h1>

        {loading && (
          <p className="text-sm text-gray-600 italic">Loading system data...</p>
        )}

        {error && (
          <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
        )}

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard title="Total Users" value={stats.totalUsers} />
            <SummaryCard title="Forms Completed" value={stats.totalForms} />
            <SummaryCard title="Prompts Used" value={stats.totalPrompts} />
            {/* <SummaryCard title="Pending AI Exports" value={stats.pendingExports} /> */}
            {/* <SummaryCard title="Flagged Logs" value={stats.flaggedLogs} highlight /> */}
            {/* <SummaryCard title="System Uptime" value={stats.uptime} />   */}
          </div>
        )}

        <div className="border rounded-lg bg-white p-4 shadow-sm mt-5 mb-5">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="overflow-x-auto my-5">
              <table className="min-w-full text-sm text-left text-gray-700 border">
                <thead className="bg-gray-100 text-gray-800 font-medium">
                  <tr>
                    <th className="px-4 py-2">User ID</th>
                    <th className="px-4 py-2">Form ID</th>
                    <th className="px-4 py-2">Rating</th>
                    <th className="px-4 py-2">Content</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review._id} className="border-t">
                      <td className="px-4 py-2">
                        {typeof review.userId === 'object' ? review.userId.email || review.userId._id : review.userId}
                      </td>
                      <td className="px-4 py-2">
                        {typeof review.formId === 'object' ? review.formId.formId || <review className="formId _id"></review> : review.formId}
                      </td>
                      <td className="px-4 py-2 flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < review.rating ? '#facc15' : 'none'} // yellow-400 if filled
                            stroke="#facc15"
                          />
                        ))}
                      </td>
                      <td className="px-4 py-2 max-w-md truncate">{review.content}</td>
                      <td className="px-4 py-2">{new Date(review.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !loading && <p className="text-sm text-gray-600">No reviews found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * SummaryCard
 * Internal component for visual stat blocks.
 */
function SummaryCard({ title, value, highlight = false }) {
  return (
    <div
      className={`rounded-lg p-4 shadow-sm border ${highlight ? "bg-yellow-100 border-yellow-400" : "bg-white"
        }`}
    >
      <h3 className="text-sm font-medium text-gray-700">{title}</h3>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
