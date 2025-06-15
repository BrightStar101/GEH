// File: /frontend/pages/public/CategoryPage.jsx
// Purpose: Displays all stories for a given category slug (e.g. /stories/category/asylum)

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import StoryCard from "../../components/public/StoryCard.jsx";
import FeaturedStoryBanner from "../../components/public/FeaturedStoryBanner.jsx";
import axios from "axios";

/**
 * CategoryPage.jsx
 *
 * Displays stories from a public UGC category route like /stories/category/asylum.
 * SEO meta included via Helmet. Fallbacks for empty states.
 */

export default function CategoryPage() {
  const { slug } = useParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const readableLabel = slug?.replace("-", " ").toUpperCase();

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/stories/category/${slug}`);
      const data = res.data;

      if (!data.success) throw new Error(data.message || "Unable to fetch category stories.");
      setStories(data.data);
      setError(null);
    } catch (err) {
      console.error("CategoryPage fetch error:", err);
      setError("Failed to load category stories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <main className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <HelmetProvider>
        <Helmet>
          <title>Stories About {readableLabel} | Global Entry Hub</title>
          <meta name="description" content={`Read real stories about ${readableLabel} from the Global Entry Hub community.`} />
        </Helmet>
      </HelmetProvider>

      <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
        {readableLabel} Stories
      </h1>

      {loading && <p className="text-sm text-gray-500 text-center">Loading...</p>}
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      {!loading && stories.length > 0 && (
        <>
          <FeaturedStoryBanner story={stories[0]} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {stories.slice(1).map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>
        </>
      )}

      {!loading && stories.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          No stories found in this category yet.
        </p>
      )}
    </main>
  );
}
