// ✅ GEH Dashboard Index — Fully Production-Ready (Upgraded)
// Path: frontend/pages/dashboard/index.jsx

import { useContext, useEffect, useMemo, useState } from "react";
import { ToneContext } from "../../contexts/ToneContext";
import { getTierConfig } from "../../utils/pricingConfig";
import { logEvent } from "../../utils/analytics";
import useUserTier from "../../hooks/useUserTier";
import PlanUpgradePanel from "./planUpgradePanel";
import UsageStatus from "./usageStatus";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import PDFExpiryTimer from '../../components/user/PDFExpiryTimer';
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Star } from 'lucide-react';

export default function DashboardIndex() {
  const { user, token } = useContext(AuthContext);
  const { tone } = useContext(ToneContext);
  const { tierId, promptCount, maxPrompts, formsUsed, formHistory } = useUserTier();
  const [currentTier, setCurrentTier] = useState({});
  const [error, setError] = useState(null);
  const [forms, setForms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tempState, setTempState] = useState(0);

  const onDownload = async (formId) => {
    try {
      setError('');
      setLoading(true);

      const res = await axios.get(`/api/download/${formId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Download failed. You may need to upgrade your plan.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }

    const fetchPDFs = async () => {
      try {
        const res = await axios.get('/api/form/');
        setForms(res.data || []);
      } catch (err) {
        console.error('[Dashboard] Failed to fetch PDFs:', err.message);
        setError('Failed to fetch PDFs.');
      } finally {
        setLoading(false);
      }
    }

    const fetchReviews = async () => {
      try {
        const res = await axios.get('/api/reviews/');
        setReviews(res.data || []);
      } catch (err) {
        console.error('[Dashboard] Failed to fetch PDFs:', err.message);
        setError('Failed to fetch PDFs.');
      } finally {
        setLoading(false);
      }
    }

    fetchPDFs();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (tierId) {
      const tier = getTierConfig(tierId);
      setCurrentTier(tier);
    }
  }, [tierId]);

  useEffect(() => {
    logEvent("Dashboard", "Viewed", tierId || "unknown");
  }, [tierId]);

  if (!token || !currentTier?.name) return null;

  const formsRemaining = Math.max(currentTier.formsIncluded - formsUsed, 0);
  return (
    <div className="min-h-screen px-4 py-6 bg-white text-gray-800">
      <h1 className="text-2xl font-bold mb-4">
        {tone === "friendly"
          ? "Welcome back to your dashboard!"
          : tone === "formal"
            ? "Account Dashboard"
            : "Dashboard"}
      </h1>

      {loading && <p className="italic text-sm text-gray-500">{t('dashboard.loading')}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <UsageStatus token={token} />

      {/*forms.length > 0 ? (
        <div className="space-y-4 my-5">
          {forms.map((form) => (
            <div
              key={form._id}
              className="border rounded-xl p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <h3 className="font-medium text-gray-800">{form.filePath.slice(form.filePath.lastIndexOf('\\') + 1) || t('dashboard.defaultLabel')}</h3>
                <PDFExpiryTimer expiresAt={form.expiresAt || form.createdAt} />
              </div>
              <button
                onClick={e => onDownload(form.formId)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-md disabled:opacity-50 cursor-pointer"
                download
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-sm text-gray-600">{t('dashboard.noFiles')}</p>
        )
      )*/}

      <div className="border rounded-lg bg-white p-4 shadow-sm mt-5">
        <h2 className="text-base font-semibold text-gray-800 mb-2">My Forms</h2>
        {forms.length > 0 ? (
          <div className="overflow-x-auto my-5">
            <table className="min-w-full text-sm text-left text-gray-700 border">
              <thead className="bg-gray-100 text-gray-800 font-medium">
                <tr>
                  <th className="px-4 py-2">File Name</th>
                  <th className="px-4 py-2">Expires</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form._id} className="border-t">
                    <td className="px-4 py-2">
                      {form.filePath.slice(form.filePath.lastIndexOf('\\') + 1) || t('dashboard.defaultLabel')}
                    </td>
                    <td className="px-4 py-2">
                      <PDFExpiryTimer expiresAt={form.expiresAt || form.createdAt} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={e => onDownload(form.formId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-md disabled:opacity-50"
                        download
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && (
            <p className="text-sm text-gray-600">{t('dashboard.noFiles')}</p>
          )
        )}
      </div>

      <div className="border rounded-lg bg-white p-4 shadow-sm mt-5 mb-5">
        <h2 className="text-base font-semibold text-gray-800 mb-2">Reviews</h2>
        {reviews.length > 0 ? (
          <div className="overflow-x-auto my-5">
            <table className="min-w-full text-sm text-left text-gray-700 border">
              <thead className="bg-gray-100 text-gray-800 font-medium">
                <tr>
                  <th className="px-4 py-2">User ID</th>
                  <th className="px-4 py-2">Form ID</th>
                  <th className="px-4 py-2">Rating</th>
                  <th className="px-4 py-2">Content</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id} className="border-t">
                    <td className="px-4 py-2">
                      {typeof review.userId === 'object' ? review.userId.email || review.userId._id : review.userId}
                    </td>
                    <td className="px-4 py-2">
                      {typeof review.formId === 'object' ? review.formId.formId || <review className="formId _id"></review> : review.formId}
                    </td>
                    <td className="px-4 py-2 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < review.rating ? '#facc15' : 'none'} // yellow-400 if filled
                          stroke="#facc15"
                        />
                      ))}
                    </td>
                    <td className="px-4 py-2 max-w-md truncate">{review.content}</td>
                    <td className="px-4 py-2">{new Date(review.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p className="text-sm text-gray-600">No reviews found.</p>
        )}
      </div>

      <PlanUpgradePanel
        token={token}
        currentTier={tierId}
        promptCount={promptCount}
        maxPrompts={currentTier.promptLimit}
        formsUsed={formsUsed}
        formsRemaining={formsRemaining}
      />

      {promptCount >= currentTier.promptLimit && (
        <div className="mt-6 p-4 border border-red-400 text-red-700 bg-red-50 rounded-xl">
          <p className="font-semibold">
            You've reached your prompt limit for this plan.
          </p>
          <p className="text-sm mt-2">
            Upgrade to a higher tier to continue using Mira and receive additional support.
          </p>
        </div>
      )}
    </div>
  );
}
