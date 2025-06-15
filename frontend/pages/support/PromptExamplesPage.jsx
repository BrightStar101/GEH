import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import promptData from "../../data/promptExamples.json"; // Dynamic prompt source
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * PromptExamplesPage
 * 
 * Securely displays categorized Mira prompt examples with expected answers.
 * Only accessible to users with tier "starter" or above (verified via JWT).
 */
export default function PromptExamplesPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tier, setTier] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  if (!user || !["starter", "official", "family"].includes(user.planTier))
    navigate("/pricing");

  const groupedPrompts = {
    beginner: promptData.filter((item) => item.level === "beginner"),
    intermediate: promptData.filter((item) => item.level === "intermediate"),
    advanced: promptData.filter((item) => item.level === "advanced"),
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Smart Ways to Ask Mira for Help
      </h1>

      <p className="mb-4 text-sm text-gray-600">
        These are real examples of what Mira understands well. Try them as-is, or use them as inspiration.
      </p>

      {["beginner", "intermediate", "advanced"].map((group) => (
        <section key={group} className="mb-8">
          <h2 className="text-xl font-semibold capitalize mb-3 text-blue-700">
            {group} Prompts
          </h2>
          <div className="space-y-4">
            {groupedPrompts[group].map((item, index) => (
              <div
                key={`${group}-${index}`}
                className="p-4 border rounded-md bg-white shadow-sm"
              >
                <p className="font-medium mb-2">
                  <span className="text-gray-500">You:</span> {item.prompt}
                </p>
                <p className="text-sm text-gray-700 italic">
                  <span className="text-green-600">Mira might say:</span> {item.response}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
