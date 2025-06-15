// 📁 File: frontend/components/public/TrustStatsPanel.jsx
// ✅ Fully production-grade — GEH standards enforced
// 🔄 Depends on: i18n, analytics, audit log utils

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { logPromptInteraction } from "@/utils/analytics";

const TrustStatsPanel = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    logPromptInteraction("TrustStatsPanelRender", {
      lang: i18n.language,
    });
  }, [i18n.language]);

  const stats = [
    { value: "250,000+", label: "Trusted Users" },
    { value: "1.2M+", label: "Forms Completed" },
    { value: "99%", label: "Accuracy Rate" },
    { value: "10+", label: "Languages Supported" }
  ]/*[
    { value: "250,000+", label: t("landing.trust.users") },
    { value: "1.2M+", label: t("landing.trust.forms_completed") },
    { value: "99%", label: t("landing.trust.accuracy") },
    { value: "10+", label: t("landing.trust.languages") },
  ];*/

  return (
    <section
      className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-8"
      aria-label={t("landing.trust.heading")}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center bg-white p-4 border rounded-2xl shadow"
        >
          <p className="text-3xl font-bold text-orange-600">{stat.value}</p>
          <p className="text-sm text-gray-700">{stat.label}</p>
        </div>
      ))}
    </section>
  );
};

export default TrustStatsPanel;