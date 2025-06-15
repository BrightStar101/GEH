// File: frontend/pages/public/Purchase.jsx
// Global Entry Hub – Tier Selection and Upgrade Interface (One-Time Payment UI)

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderNav from "@/components/shared/HeaderNav";
import FooterNavigation from "@/components/public/FooterNavigation";
import GlobalMetaHelmet from "@/components/GlobalMetaHelmet";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

/**
 * Purchase
 * Displays available one-time plans and initiates upgrade flow.
 * Only shown to logged-in users with JWT present.
 */
export default function Purchase() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [userTier, setUserTier] = useState("free");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("jwt");
      if (!stored) return navigate("/login");

      const decoded = jwtDecode(stored);
      setToken(stored);
      setUserTier(decoded?.planTier || "free");
    } catch (err) {
      console.warn("Purchase: JWT decode failed", err);
      navigate("/login");
    }
  }, []);

  const handlePurchase = async (tierId) => {
    try {
      const res = await axios.post("/api/purchase/checkout", { tierId });
      const data = res.data;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.message || "Unable to start payment session.");
      }
    } catch (err) {
      console.error("Purchase flow error:", err);
      alert("There was a problem starting your upgrade. Please try again.");
    }
  };

  return (
    <>
      <GlobalMetaHelmet title="Upgrade Your Plan – Global Entry Hub" />
      {/* <HeaderNav /> */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Upgrade Your Access</h1>
        <p className="text-gray-600 text-center mb-8">
          Choose the plan that matches your needs. Each plan is a one-time payment with a set time window.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.tierId}
              className="border rounded-lg p-5 shadow-sm flex flex-col items-start"
            >
              <h2 className="text-xl font-semibold text-gray-800">{tier.label}</h2>
              <p className="text-gray-500 text-sm mb-2">{tier.description}</p>
              <ul className="text-sm text-gray-700 mb-4 space-y-1 list-disc list-inside">
                {tier.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <span className="text-lg font-bold text-blue-600">${tier.price}</span>
              <button
                onClick={() => handlePurchase(tier.tierId)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded"
              >
                Upgrade to {tier.label}
              </button>
            </div>
          ))}
        </div>
      </main>
      
    </>
  );
}

// ✅ Local Tier Config (can be externalized later)
const tiers = [
  {
    tierId: "starter",
    label: "Starter Kit",
    price: 5,
    description: "Great for a second form or quick start",
    features: ["2 total forms", "24 hrs Mira access", "Basic PDF download", "gpt-4o Lite"],
  },
  {
    tierId: "official",
    label: "Official Pack",
    price: 25,
    description: "Ideal for most family or solo workflows",
    features: ["20 total forms", "72 hrs Mira access", "OCR + PDF generation", "Multilingual support"],
  },
  {
    tierId: "family",
    label: "Friends & Family",
    price: 75,
    description: "Covers up to 60 forms, great for helpers",
    features: ["60 forms", "1 week Mira access", "AI priority queue", "Unlimited OCR + AI"],
  },
];
