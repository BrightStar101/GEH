// pages/FreeFormsPage.jsx

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MetaHead from '../../components/public/MetaHead';
import { AuthContext } from '../../contexts/AuthContext';

const languageMap = {
  en: 'English',
  es: 'Español',
  hi: 'Hindi',
  zh: '中文',
  fr: 'Français',
  tl: 'Tagalog',
  ar: 'العربية',
};

export default function FreeFormsPage() {
  const [forms, setForms] = useState([]);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('en');
  const [countryFilter, setCountryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get('/api/form/free');
      setForms(res.data || []);
    };
    load();
  }, []);

  const filteredForms = forms.filter(f => {
    const matchesLang = f.languages.includes(language);
    const matchesCountry = countryFilter ? f.country === countryFilter : true;
    const matchesSearch =
      f.title?.[language]?.toLowerCase().includes(search.toLowerCase()) ||
      f.formId.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    return matchesLang && matchesCountry && matchesSearch;
  });

  const countries = [...new Set(forms.map(f => f.country))].sort();

  return (
    <>
      <MetaHead
        title="Free Immigration Forms by Country | Global Entry Hub"
        description="Explore our collection of free immigration forms designed to simplify your journey. Use them anytime to get started quickly, powered by AI assistance to guide you every step of the way."
        />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Explore Free Forms by Country</h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-2 flex-wrap items-center">
            <label className="text-sm">Language:</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            >
              {Object.entries(languageMap).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>

            <label className="text-sm ml-4">Country:</label>
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            >
              <option value="">All</option>
              {countries.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="Search by form title, ID, or category"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border px-3 py-1 rounded w-full sm:max-w-md text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full mt-6 text-sm border-t">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-3 py-2">Form ID</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Country</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">AI Support</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.length > 0 ? (
                filteredForms.map(form => (
                  <tr key={form.formId} className="border-b">
                    <td className="px-3 py-2">{form.formId}</td>
                    <td className="px-3 py-2">{form.title?.[language] || form.title?.en}</td>
                    <td className="px-3 py-2">{form.country}</td>
                    <td className="px-3 py-2">{form.category}</td>
                    <td className="px-3 py-2">
                      {form.aiSupport ? (
                        <span className="text-green-600 font-semibold">Mira Available</span>
                      ) : (
                        <span className="text-gray-500">Manual Only</span>
                      )}
                    </td>
                    <td className="text-center hover:text-blue-400">
                      <Link to={`/form/${form.formId}/${language}`}>
                        Try Form
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-center text-gray-500">
                    No forms match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* <div className="text-center mt-8">
          <p className="text-gray-700">
            Want to fill out more forms or get step-by-step help from Mira?
          </p>
          <button
            onClick={(ev) => setModalOpen(true)}
            className="mt-3 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try My Form
          </button>
        </div> */}
      </div>
    </>
  );
}
