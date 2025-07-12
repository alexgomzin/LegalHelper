'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

type Language = 'en' | 'ru' | 'de' | 'es' | 'tr';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(language);

  useEffect(() => {
    setCurrentLang(language);
  }, [language]);

  const languages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'ru' as Language, name: 'Русский' },
    { code: 'de' as Language, name: 'Deutsch' },
    { code: 'es' as Language, name: 'Español' },
    { code: 'tr' as Language, name: 'Türkçe' },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const changeLanguage = (code: Language) => {
    console.log('Changing language to:', code);
    setLanguage(code);
    setCurrentLang(code);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
        aria-expanded={isOpen}
      >
        <span>{currentLanguage.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  currentLang === lang.code
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 