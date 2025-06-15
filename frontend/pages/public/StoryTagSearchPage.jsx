// File: /frontend/pages/public/StoryTagSearchPage.jsx
// Purpose: Multi-tag search page for UGC stories (/stories/search?tag=family&tag=student)

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import StoryCard from "../../components/public/StoryCard.jsx";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import axios from "axios";

/**
 * StoryTagSearchPage.jsx
 *
 * Renders public UGC stories that match one or more tags via query params.
 * Used for flexible UGC discovery like /stories/search?tag=student&tag=family.
 */

export default function StoryTagSearchPage() {
  const [searchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tags = searchParams.getAll("tag");

  const fetchStories = async () => {
    try {
      setLoading(true);
      const tagParams = tags.map((tag) => `tag=${encodeURIComponent(tag)}`).join("&");
      const res = await axios.get(`/api/stories/search?${tagParams}`);
      const data = res.data;

      if (!data.success) throw new Error(data.message || "Failed to fetch stories.");
      setStories(data.data);
      setError(null);
    } catch (err) {
      console.error("TagSearch fetch error:", err);
      setError("Could not load stories for these tags.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags.join(",")]);

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <HelmetProvider>
        <Helmet>
          <title>Search Stories by Tag | Global Entry Hub</title>
          <meta name="description" content={`Browse stories tagged: ${tags.join(", ")}`} />
        </Helmet>
      </HelmetProvider>

      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        Stories Tagged: {tags.map((tag) => `#${tag}`).join(" ")}
      </h1>

      {loading && <p className="text-sm text-gray-500 text-center">Loading...</p>}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {!loading && stories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story._id} story={story} />
          ))}
        </div>
      )}

      {!loading && stories.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          No stories found for these tags.
        </p>
      )}
    </main>
  );
}
