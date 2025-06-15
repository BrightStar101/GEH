// File: frontend/pages/public/FormEntry.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlobalMetaHelmet from "@/components/GlobalMetaHelmet";
import HeaderNav from "@/components/shared/HeaderNav";
import FooterNavigation from "@/components/public/FooterNavigation";
import { checkTierAccess } from "@/middleware/tierAccessClient"; // ✅ New
import axios from "axios";

export default function FormEntry() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const [showUpsell, setShowUpsell] = useState(false); // ✅ 2C Patch
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkTierAccess(["starter", "official", "family"])) {
      navigate("/pricing");
    }
  }, []);

  // ✅ 2C Patch: Check if upsell flag should be shown
  useEffect(() => {
    const checkUpsell = async () => {
      try {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const res = await axios.get("/api/forms?checkUpsell=true");
        const data = res.data;
        if (data?.offerLifetimeUpsell) {
          setShowUpsell(true);
        }
      } catch (err) {
        console.warn("Upsell check failed:", err);
      }
    };

    checkUpsell();
  }, []);

  // ✅ 2E Patch: Trigger GDPR data export
  const handleDataExport = () => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Please log in to export your data.");
      return;
    }
    window.open("/api/forms/export-my-data", "_blank");
  };

  const handleUpload = async () => {
    setError(null);
    setUploading(true);
    setResponse(null);

    const token = localStorage.getItem("jwt");
    if (!token || !file) {
      setError("Please log in and select a file.");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("document", file);

      const res = await axios.post("/api/ocr/upload", formData);
      const data = res.data;
      if (!data?.success || !data?.extractedText) {
        throw new Error(data?.message || "Failed to process file.");
      }

      setResponse(data.extractedText);
    } catch (err) {
      console.error("OCR error:", err);
      setError("Failed to upload or parse your document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <GlobalMetaHelmet title="Upload a Document – Global Entry Hub" />
      {/* <HeaderNav /> */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Upload a Document</h1>
        <p className="text-sm text-gray-600 mb-6">
          Upload a photo or PDF of an immigration form. Mira will extract the text and help guide you forward.
        </p>

        {showUpsell && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Notice:</strong> One or more of your saved forms will expire soon.
              You can upgrade to lifetime storage for just $1 per form.
            </p>
          </div>
        )}

        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {uploading ? "Processing..." : "Upload"}
        </button>

        <button
          onClick={handleDataExport}
          className="ml-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
        >
          Export My Data
        </button>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        {response && (
          <div className="bg-gray-50 border mt-6 p-4 rounded text-sm text-gray-800 whitespace-pre-wrap">
            <strong>Extracted Text:</strong>
            <p className="mt-2">{response}</p>
          </div>
        )}
      </main>
      
    </>
  );
}
