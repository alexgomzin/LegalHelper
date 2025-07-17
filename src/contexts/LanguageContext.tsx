'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import translations from '@/translations';
import { setCookie, parseCookies } from 'nookies';

// Create a global store for language state to share between router implementations
type Language = 'en' | 'ru' | 'de' | 'es' | 'tr';

// Define a type for the translations object
type TranslationsType = typeof translations;

// Global state for synchronization between multiple context instances
let globalLanguage: Language = 'en';
const languageChangeListeners: ((lang: Language) => void)[] = [];

function notifyLanguageChange(newLanguage: Language) {
  globalLanguage = newLanguage;
  languageChangeListeners.forEach(listener => listener(newLanguage));
}

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key) => key,
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(globalLanguage || defaultLanguage);

  // Listen for changes from other context instances
  useEffect(() => {
    const listener = (newLang: Language) => {
      setLanguageState(newLang);
    };
    
    languageChangeListeners.push(listener);
    
    return () => {
      const index = languageChangeListeners.indexOf(listener);
      if (index > -1) {
        languageChangeListeners.splice(index, 1);
      }
    };
  }, []);

  // Initialize language from cookies and localStorage
  useEffect(() => {
    try {
      // Get from cookies
      const cookies = parseCookies();
      const savedLanguage = cookies.language;
      
      // Fallback to localStorage
      let localStorageLanguage;
      try {
        localStorageLanguage = localStorage.getItem('language');
      } catch (error: unknown) {
        console.log('localStorage not available');
      }
      
      const langToUse = savedLanguage || localStorageLanguage || globalLanguage;
      
      if (langToUse && (langToUse === 'en' || langToUse === 'ru' || langToUse === 'de' || langToUse === 'es' || langToUse === 'tr')) {
        setLanguageState(langToUse as Language);
        globalLanguage = langToUse as Language;
      }
    } catch (error) {
      console.error('Error accessing storage:', error);
    }
  }, []);

  // Set language with proper persistence
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    notifyLanguageChange(newLanguage);
    
    // Store in cookies
    setCookie(null, 'language', newLanguage, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    
    // Also store in localStorage
    try {
      localStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Error setting language in localStorage:', error);
    }
  };

  const t = (key: string): string => {
    // Split key by dots to navigate through the translations object
    const keys = key.split('.');
    
    // Navigate through the translations object
    let translation: Record<string, any> = translations[language];
    
    for (const k of keys) {
      if (!translation || !translation[k]) {
        // If translation not found, return the key
        return key;
      }
      translation = translation[k];
    }
    
    // Ensure we return a string
    return typeof translation === 'string' ? translation : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext; 