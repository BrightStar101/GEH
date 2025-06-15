// File: /frontend/pages/public/PublicStoryWall.jsx
// Purpose: Renders the global /stories page with filters, pagination, and hero story display

import React, { useEffect, useState } from "react";
import FeaturedStoryHero from "../../components/public/FeaturedStoryHero.jsx";
import StoryCard from "../../components/public/StoryCard.jsx";
import StoryFilters from "../../components/public/StoryFilters.jsx";
import MetaHead from "../../components/public/MetaHead.jsx";
import axios from "axios";

/**
 * PublicStoryWall.jsx
 *
 * Displays a paginated and filterable wall of approved UGC stories.
 * Fetches from /api/stories with country/language/tag params.
 * Uses StoryCard and StoryFilters components.
 */
export default function PublicStoryWall() {
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ country: "", language: "", tag: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStories = async (reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filters.country && { country: filters.country }),
        ...(filters.language && { language: filters.language }),
        ...(filters.tag && { tag: filters.tag }),
        page: reset ? 1 : page,
        limit: 12,
      });

      const res = await axios.get(`/api/stories?${params.toString()}`);
      const data = res.data;

      if (!data.success) throw new Error(data.error || "Failed to fetch stories.");

      const newStories = reset ? data.data : [...stories, ...data.data];

      setStories(newStories);
      setHasMore(data.data.length === 12);
      setPage(reset ? 2 : page + 1);
      setError(null);
    } catch (err) {
      console.error("fetchStories error:", err);
      setError("Could not load stories at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <MetaHead
        title="Immigration Stories | Global Entry Hub"
        description="Real stories submitted by users across the globe. Filter by country, language, or theme and explore how migration connects us all."
        canonical="https://www.globalentryhub.com/stories"
        ogUrl="https://www.globalentryhub.com/stories"
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Immigration Stories from Around the World</h1>

      <StoryFilters filters={filters} onChange={handleFilterChange} />

      {stories.length > 0 && <FeaturedStoryHero story={stories[0]} />}

      {error && <p className="text-red-600 text-center text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {stories.slice(1).map((story) => (
          <StoryCard key={story._id} story={story} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={() => fetchStories()}
            className="px-6 py-3 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Stories"}
          </button>
        </div>
      )}
    </main>
  );
}
