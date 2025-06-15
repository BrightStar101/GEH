// components/UpsellCTAComponent.jsx

import { useNavigate } from 'react-router-dom';

export default function UpsellCTAComponent({ language = 'en' }) {
  const navigate = useNavigate();

  const content = {
    en: {
      title: 'Ready to unlock more?',
      subtitle: 'You’ve completed your free form. Upgrade now to:',
      benefits: [
        'Fill up to 60 forms',
        'Chat with Mira for step-by-step help',
        'Store your forms permanently',
        'Access support in 7 languages',
      ],
      button: 'Upgrade My Plan',
    },
    es: {
      title: '¿Listo para más?',
      subtitle: 'Ya completaste tu formulario gratuito. Mejora ahora para:',
      benefits: [
        'Llenar hasta 60 formularios',
        'Chatear con Mira para ayuda paso a paso',
        'Almacenar tus formularios permanentemente',
        'Soporte en 7 idiomas',
      ],
      button: 'Mejorar mi plan',
    },
    // Add more languages here as needed...
  };

  const t = content[language] || content.en;

  return (
    <div className="border border-orange-300 rounded-lg bg-orange-50 p-6 shadow-sm max-w-2xl mx-auto text-center space-y-4">
      <h2 className="text-xl font-bold text-orange-700">{t.title}</h2>
      <p className="text-gray-700">{t.subtitle}</p>
      <ul className="list-disc list-inside text-left text-gray-800 space-y-1 max-w-md mx-auto">
        {t.benefits.map((item, idx) => (
          <li key={idx}>✅ {item}</li>
        ))}
      </ul>
      <button
        onClick={() => navigate('/upgrade')}
        className="mt-4 px-5 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
      >
        {t.button}
      </button>
    </div>
  );
}
