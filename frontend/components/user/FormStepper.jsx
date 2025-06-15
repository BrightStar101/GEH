import { useState } from 'react';

import en from '../locales/en.json';
import es from '../locales/es.json';
import hi from '../locales/hi.json';
import zh from '../locales/zh.json';
import fr from '../locales/fr.json';
import tl from '../locales/tl.json';
import ar from '../locales/ar.json';

const translations = {
  en,
  es,
  hi,
  zh,
  fr,
  tl,
  ar
};

export default function FormStepper({
  question,
  onSubmit,
  value,
  setValue,
  isLast,
  disabledAI = false,
  onHelpClick,
  language = 'en'
}) {
  const [error, setError] = useState('');

  const translatedLabel =
    translations?.[language]?.[question.name] || question.label;

  const handleNext = () => {
    if (question.required && (!value || value.trim() === '')) {
      setError('This field is required.');
      return;
    }

    if (question.type === 'number' && isNaN(value)) {
      setError('Please enter a valid number.');
      return;
    }

    setError('');
    onSubmit(question.name, value);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Fill in the form</h1>
      <label className="block text-lg font-semibold">
        {translatedLabel}
        {question.required && <span className="text-red-500"> *</span>}
      </label>

      {question.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 min-h-[100px]"
        />
      ) : (
        <input
          type={question.type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full border border-gray-300 rounded p-2"
        />
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isLast ? 'Finish' : 'Next'}
        </button>

        {!disabledAI && (
          <button
            onClick={onHelpClick}
            className="text-sm text-gray-500 hover:underline ml-4"
          >
            Need help?
          </button>
        )}
      </div>
    </div>
  );
}
