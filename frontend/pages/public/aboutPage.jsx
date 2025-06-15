// File: /frontend/pages/public/aboutPage.jsx
// Purpose: GEH brand story, Mira’s origin, ethical standards, and platform values

import React, { useEffect } from "react";
import MetaHead from "../../components/public/MetaHead";
import FooterNavigation from "../../components/public/FooterNavigation";
import analyticsTracker from "../../utils/analyticsTracker";

/**
 * aboutPage.jsx
 *
 * Tells the story of Global Entry Hub and Mira — including our mission,
 * values, human-centered design philosophy, and ethical AI boundaries.
 */

export default function AboutPage() {
  useEffect(() => {
    analyticsTracker.logPageView("about_page");
  }, []);

  return (
    <>
      <MetaHead
        title="About Us | Global Entry Hub"
        description="We're building ethical AI to help every family move forward. Learn the story behind Mira, our mission, and our values."
        canonical="https://www.globalentryhub.com/about"
        ogImage="/static/meta/about-hero.jpg"
        ogUrl="https://www.globalentryhub.com/about"
      />

      <div className="bg-white text-gray-900 w-full">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold mb-6 text-center">Our Mission</h1>
          <p className="text-lg text-center max-w-2xl mx-auto text-gray-600 mb-12">
            We believe legal immigration is a right, not a luxury. Our mission is to give every family
            the power to move forward — with clarity, dignity, and trusted support.
          </p>

          <div className="space-y-16">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Why We Built Mira</h2>
              <p className="text-gray-700 leading-relaxed">
                Mira was born from the frustration we saw — families waiting weeks for help,
                getting charged thousands for basic form prep, or navigating confusing government portals
                without guidance. We built Mira to change that. She’s multilingual, patient, affordable,
                and available to everyone — no appointments needed.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Mira isn’t just software — she’s an AI-powered immigration companion designed to guide, support,
                and simplify your paperwork journey. She learns from real forms, adapts to your language,
                and stays focused — no distractions, no filler.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">What We Stand For</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access over profits:</strong> Our pricing is fair, flat, and human-first.</li>
                <li><strong>Privacy by design:</strong> We never sell your data. Ever.</li>
                <li><strong>Accuracy and accountability:</strong> Mira is tested, monitored, and continuously learning.</li>
                <li><strong>Transparency:</strong> You’ll always know what Mira can and can’t do — no false promises.</li>
                <li><strong>No legal advice — ever:</strong> Mira is not a lawyer and does not provide legal representation. She prepares paperwork, not outcomes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                Global Entry Hub isn’t just an AI company — it’s a human movement. We want to see a world where
                anyone can begin their next chapter without fear or confusion. Whether you're applying for a visa,
                reuniting with loved ones, or starting over, Mira is here to help — ethically, intelligently, and affordably.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                We dream of a world where no one has to wait weeks for help, fear immigration paperwork, or feel lost in translation.
                That’s why Mira meets you where you are — across languages, borders, and life stages — and why this platform will always
                put people over profit.
              </p>
            </section>
          </div>
        </div>

        
      </div>
    </>
  );
}
