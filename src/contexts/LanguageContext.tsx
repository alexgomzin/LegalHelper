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

// Function to detect user's preferred language
function detectUserLanguage(): Language {
  // Default fallback
  const defaultLanguage: Language = 'en';
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return defaultLanguage;
  }

  // Get browser language preferences
  const browserLanguage = navigator.language || navigator.languages?.[0] || '';
  
  // Map common language codes to our supported languages
  const languageMap: Record<string, Language> = {
    'en': 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'en-CA': 'en',
    'en-AU': 'en',
    'ru': 'ru',
    'ru-RU': 'ru',
    'de': 'de',
    'de-DE': 'de',
    'de-AT': 'de',
    'de-CH': 'de',
    'es': 'es',
    'es-ES': 'es',
    'es-MX': 'es',
    'es-AR': 'es',
    'es-CO': 'es',
    'es-PE': 'es',
    'es-VE': 'es',
    'es-CL': 'es',
    'tr': 'tr',
    'tr-TR': 'tr',
  };

  // Try exact match first
  if (languageMap[browserLanguage]) {
    return languageMap[browserLanguage];
  }

  // Try language code without region (e.g., 'en' from 'en-US')
  const baseLanguage = browserLanguage.split('-')[0];
  if (languageMap[baseLanguage]) {
    return languageMap[baseLanguage];
  }

  // Check if any of our supported languages match
  const supportedLanguages: Language[] = ['en', 'ru', 'de', 'es', 'tr'];
  for (const lang of supportedLanguages) {
    if (browserLanguage.toLowerCase().startsWith(lang)) {
      return lang;
    }
  }

  // If no match found, return default
  return defaultLanguage;
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

  // Initialize language with auto-detection
  useEffect(() => {
    try {
      // First, check if user has a saved preference
      const cookies = parseCookies();
      const savedLanguage = cookies.language;
      
      // Fallback to localStorage
      let localStorageLanguage;
      try {
        localStorageLanguage = localStorage.getItem('language');
      } catch (error: unknown) {
        console.log('localStorage not available');
      }

      // If user has saved preference, use it
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru' || savedLanguage === 'de' || savedLanguage === 'es' || savedLanguage === 'tr')) {
        setLanguageState(savedLanguage as Language);
        globalLanguage = savedLanguage as Language;
        return;
      }

      if (localStorageLanguage && (localStorageLanguage === 'en' || localStorageLanguage === 'ru' || localStorageLanguage === 'de' || localStorageLanguage === 'es' || localStorageLanguage === 'tr')) {
        setLanguageState(localStorageLanguage as Language);
        globalLanguage = localStorageLanguage as Language;
        return;
      }

      // If no saved preference, auto-detect based on browser language
      const detectedLanguage = detectUserLanguage();
      console.log('Auto-detected language:', detectedLanguage);
      
      setLanguageState(detectedLanguage);
      globalLanguage = detectedLanguage;
      
      // Save the auto-detected language
      setCookie(null, 'language', detectedLanguage, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      
      try {
        localStorage.setItem('language', detectedLanguage);
      } catch (error) {
        console.error('Error setting language in localStorage:', error);
      }

    } catch (error) {
      console.error('Error in language detection:', error);
      // Fallback to default language
      setLanguageState(defaultLanguage);
      globalLanguage = defaultLanguage;
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