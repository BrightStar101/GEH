// File: frontend/pages/public/Mira.jsx

import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FooterNavigation from "../../components/public/FooterNavigation";
import GlobalMetaHelmet from "../../components/GlobalMetaHelmet";
import { logGptUsage } from "../../utils/usageLoggerUtils";
import SupportQuestionBar from "../../components/shared/SupportQuestionBar";
import { AuthContext } from "../../contexts/AuthContext";
import axios from "axios";
import PurchasePromptModal from "../../components/user/PurchasePromptModal";
import toast from "react-hot-toast";

export default function Mira() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [remaining, setRemaining] = useState(null);
  const [maxAllowed, setMaxAllowed] = useState(null);
  const [percentUsed, setPercentUsed] = useState(null);
  const [language, setLanguage] = useState("en"); // Default to English

  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const { user, token } = useContext(AuthContext);
  const params = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    setLanguage(user.lang || "en");
  }, []);

  const handlePrompt = async () => {
    setError(null);
    setResponse(null);
    setLoading(true);

    if (!prompt || prompt.length < 8) {
      setError("Please enter a more specific question.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/chat", { message: prompt, formId: params.formId });
      const data = res.data;
      if (!data?.message || !data?.supportQuestionUsage) {
        throw new Error(data?.error || "GPT failed to respond.");
      }

      // ✅ Log GPT usage
      logGptUsage({
        prompt,
        response: data.message,
        model: "gpt-4o",
        tier: user.planTier,
        fallbackUsed: !!data.fallbackUsed,
        confidenceScore: data.confidenceScore || null,
      });

      setResponse(data.message);

      // ✅ Track remaining support question usage
      const usage = data.supportQuestionUsage;
      setRemaining(usage.remaining);
      setMaxAllowed(usage.maxAllowed);
      setPercentUsed(usage.percentUsed);

      if(user.role !== 'admin' && usage.remaining <= 2)
        setPurchaseModalOpen(true);
    } catch (err) {
      console.error("Mira Chat Error:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Mira couldn't respond at this time. Please try again later.");

      if(err.response.data.extra)
        setPurchaseModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onPurchase = async () => {
    const res = await axios.post('/api/stripe/checkout', { type: 2 });
    const data = res.data;
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error || t('checkout.errorFallback'));
    }
    setPurchaseModalOpen(false);
  }

  return (
    <>
      <GlobalMetaHelmet title="Mira – Your AI Immigration Assistant" />
      {/* <HeaderNav /> */}
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meet Mira</h1>
        <p className="text-gray-600 mb-6">
          Mira is your personal immigration assistant, trained on forms, timelines, and
          multilingual support. Ask her anything — but remember, she’s not a lawyer.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-sm text-yellow-800 rounded">
          ⚠️ Mira helps you understand immigration steps and paperwork. She does not provide legal advice.
        </div>

        {remaining !== null && maxAllowed !== null && percentUsed !== null && user.role !== 'admin' && (
          <SupportQuestionBar
            remaining={remaining}
            maxAllowed={maxAllowed}
            percentUsed={percentUsed}
            language={language}
            onUpgrade={() => navigate("/pricing")}
          />
        )}

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Type your question for Mira..."
          className="w-full p-3 border rounded mb-3 text-sm resize-none"
        />

        <button
          onClick={handlePrompt}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Thinking..." : "Ask Mira"}
        </button>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        {response && (
          <div className="bg-gray-50 border mt-6 p-4 rounded text-sm text-gray-800 whitespace-pre-line">
            {response}
          </div>
        )}
      </main>
      <PurchasePromptModal open={purchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} onConfirm={onPurchase} />
    </>
  );
}
