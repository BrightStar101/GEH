import React, { useState } from "react";
import MetaHead from "@/components/public/MetaHead";

/**
 * UGCComposer.jsx
 * User-facing story writing sandbox — used for drafts and preview mode
 */
export default function UGCComposer() {
  const [draft, setDraft] = useState("");

  return (
    <main className="max-w-2xl mx-auto p-6 bg-white">
      <MetaHead
        title="UGC Composer | Global Entry Hub"
        description="Create and preview your immigration story with Mira’s story composer. Share anonymously and inspire others."
        canonical="https://www.globalentryhub.com/ugc/compose"
        ogUrl="https://www.globalentryhub.com/ugc/compose"
      />

      <h1 className="text-2xl font-bold text-gray-800 mb-4">Write Your Story</h1>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-3 text-sm"
        rows={10}
        placeholder="Start your story here..."
      />

      <p className="text-xs text-gray-500 mt-2">{draft.length} characters</p>
    </main>
  );
}
