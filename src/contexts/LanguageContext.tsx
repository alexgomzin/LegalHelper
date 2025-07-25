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

// Function to detect user's preferred language (CLIENT-SIDE ONLY)
function detectUserLanguage(): Language {
  // Default fallback
  const defaultLanguage: Language = 'en';
  
  // Check if we're in a browser environment (client-side only)
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return defaultLanguage;
  }

  try {
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
  } catch (error) {
    console.error('Error in language detection:', error);
    return defaultLanguage;
  }
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
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isClient, setIsClient] = useState(false);

  // Track when we're on the client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Initialize language with auto-detection (CLIENT-SIDE ONLY)
  useEffect(() => {
    // Only run on client side to prevent SSR issues
    if (!isClient) return;

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
      
      // If user has saved preference, use it (highest priority)
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru' || savedLanguage === 'de' || savedLanguage === 'es' || savedLanguage === 'tr')) {
        console.log('Using saved language from cookies:', savedLanguage);
        setLanguageState(savedLanguage as Language);
        globalLanguage = savedLanguage as Language;
        return;
      }

      if (localStorageLanguage && (localStorageLanguage === 'en' || localStorageLanguage === 'ru' || localStorageLanguage === 'de' || localStorageLanguage === 'es' || localStorageLanguage === 'tr')) {
        console.log('Using saved language from localStorage:', localStorageLanguage);
        setLanguageState(localStorageLanguage as Language);
        globalLanguage = localStorageLanguage as Language;
        return;
      }

      // If no saved preference, auto-detect based on browser language
      const detectedLanguage = detectUserLanguage();
      console.log('Auto-detected browser language:', navigator.language, '→ Mapped to:', detectedLanguage);
      
      // Only set if different from default to avoid unnecessary updates
      if (detectedLanguage !== defaultLanguage) {
        setLanguageState(detectedLanguage);
        globalLanguage = detectedLanguage;
        
        // Save the auto-detected language for next time
        setCookie(null, 'language', detectedLanguage, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
        
        try {
          localStorage.setItem('language', detectedLanguage);
        } catch (error) {
          console.error('Error setting language in localStorage:', error);
        }
      }

    } catch (error) {
      console.error('Error in language detection:', error);
      // Fallback to default language on any error
      setLanguageState(defaultLanguage);
      globalLanguage = defaultLanguage;
    }
  }, [isClient]); // Only run when isClient changes

  // Set language with proper persistence
  const setLanguage = (newLanguage: Language) => {
    console.log('Manually setting language to:', newLanguage);
    setLanguageState(newLanguage);
    notifyLanguageChange(newLanguage);
    
    // Store in cookies
    setCookie(null, 'language', newLanguage, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
    
    // Also store in localStorage (only on client side)
    if (isClient) {
    try {
      localStorage.setItem('language', newLanguage);
    } catch (error) {
      console.error('Error setting language in localStorage:', error);
      }
    }
  };

  const t = (key: string): string => {
    // Split key by dots to navigate through the translations object
    const keys = key.split('.');
    
    // Debug translation issues for common keys
    if (key.startsWith('common.')) {
      console.log('Translation debug:', {
        key,
        currentLanguage: language,
        keys,
        hasLanguageInTranslations: !!translations[language],
        hasCommonSection: !!(translations[language] && translations[language].common)
      });
    }
    
    // Navigate through the translations object
    let translation: any = translations[language];
    
    for (const k of keys) {
      if (!translation || !translation[k]) {
        // If translation not found, return the key
        console.log(`Translation not found for: ${key} at step: ${k}, current language: ${language}`);
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