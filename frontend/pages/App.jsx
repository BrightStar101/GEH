 // File: frontend/pages/App.jsx
// GEH-compliant application router with Mira exposure

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

import CountryStoryPage from "./public/CountryStoryPage";
import SeoRedirect from "./public/seoRedirect";
import NotFoundPage from "./public/404";
import ScrollToTop from "@/components/ScrollToTop";
import GlobalMetaHelmet from "@/components/GlobalMetaHelmet";
import Mira from "./public/Mira"; // ✅ PATCHED: Mira AI assistant interface
import Login from "./public/Login";
import LandingPage from "./public/landingPage";
import Support from "./public/Support";
import { AuthProvider } from "../contexts/AuthContext";
import HeaderNav from "../components/shared/HeaderNav";
import PrivateLayout from "../components/layouts/PrivateLayout";
import AdminLayout from "../components/layouts/AdminLayout";
import PricingPage from "./public/pricingPage";
import PromptExamplesPage from "./support/PromptExamplesPage";
import { ToneProvider } from "../contexts/ToneContext";
import DashboardIndex from "./dashboard";
import AboutPage from "./public/aboutPage";
import FooterNavigation from "../components/public/FooterNavigation";
import TermsOfService from "./public/termsOfService";
import PrivacyPolicy from "./public/privacyPolicy";
import TrustCenterPage from "./public/trustCenterPage";
import AdminDashboard from "./admin/dashboard";
import AuditViewer from "./admin/auditViewer";
import OverridePanel from "./admin/overridePanel";
import PublicLayout from "../components/layouts/PublicLayout";
import Checkout from "./user/Checkout";
import FreeFormsPage from "./public/FreeFormsPage";
import FormPage from "./user/FormPage";
import Register from "./public/Register";

// Inline fallback stubs
// const LandingPage = () => (
//   <main className="min-h-screen flex flex-col items-center justify-center text-center p-6">
//     <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Global Entry Hub</h1>
//     <p className="text-gray-600">Your AI-powered immigration form assistant is ready to help.</p>
//   </main>
// );

// const SupportPage = () => (
//   <main className="min-h-screen flex flex-col items-center justify-center text-center p-6">
//     <h1 className="text-2xl font-semibold text-gray-800 mb-2">Support</h1>
//     <p className="text-gray-600">Please contact us at support@globalentryhub.com or through Mira.</p>
//   </main>
// );

const AdminStubPage = () => (
  <main className="min-h-screen flex flex-col items-center justify-center text-center p-6">
    <h1 className="text-2xl font-semibold text-gray-800 mb-2">Admin Access</h1>
    <p className="text-gray-600">This area is restricted. Admin features are not yet available on this frontend instance.</p>
  </main>
);

/**
 * App
 * Central router for Global Entry Hub frontend.
 * Includes fallback route, Mira AI route, and stubbed pages.
 */
export default function App() {
  try {
    return (
      <AuthProvider>
        <ToneProvider>
          <div className="min-h-screen flex flex-col">
            <BrowserRouter>
              <GlobalMetaHelmet />
              <HeaderNav />
              <div className="flex-1">
                <Routes>

                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/trust" element={<TrustCenterPage />} />

                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/stories/country" element={<CountryStoryPage />} />
                  <Route path="/support" element={<Support />} />

                  <Route element={<PrivateLayout />}>
                    <Route path="/support/prompt-examples" element={<PromptExamplesPage />} />
                    <Route path="/mira" element={<Mira />} /> {/* ✅ PATCHED: Mira route */}
                    <Route path="/dashboard" element={<DashboardIndex />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/free-form" element={<FreeFormsPage />} />
                    <Route path="/form/:formId/:language" element={<FormPage  />} />
                  </Route>

                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/audit" element={<AuditViewer />} />
                    <Route path="/admin/override" element={<OverridePanel />} />
                  </Route>

                  <Route path="/redirect" element={<SeoRedirect />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
              <FooterNavigation />
            </BrowserRouter>
            <Toaster position="top-right" />
          </div>
        </ToneProvider>
      </AuthProvider>
    );
  } catch (err) {
    console.error("App routing error:", err);
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">
          A critical frontend error occurred. Please refresh or contact support.
        </p>
      </main>
    );
  }
}
