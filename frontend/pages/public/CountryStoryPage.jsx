import React, { useEffect, useState } from "react";
import StoryCard from "@/components/public/StoryCard.jsx";
import MetaHead from "@/components/public/MetaHead";
import GlobalMetaHelmet from "@/components/GlobalMetaHelmet"; // ✅ Added
import axios from "axios";

export default function CountryStoryPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await axios.get("/api/stories/by-country");
        const data = res.data;
        if (!data.success) throw new Error("Failed to fetch stories.");
        setStories(data.data);
      } catch (err) {
        setError("Unable to load country-specific stories.");
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  return (
    <>
      <GlobalMetaHelmet /> {/* ✅ Injected fallback OG metadata */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <MetaHead
          title="Immigration Stories by Country | Global Entry Hub"
          description="Filter community-submitted immigration stories by country to understand diverse journeys across the globe."
          canonical="https://www.globalentryhub.com/stories/country"
          ogUrl="https://www.globalentryhub.com/stories/country"
        />

        <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          Immigration Stories by Country
        </h1>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story._id} story={story} />
          ))}
        </div>
      </main>
    </>
  );
}
