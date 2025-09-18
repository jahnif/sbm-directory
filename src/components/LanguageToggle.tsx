'use client';

import { useState, useEffect } from 'react';

type Locale = 'en' | 'es';

export default function LanguageToggle() {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    // Get saved language from localStorage or default to English
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['en', 'es'].includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  const toggleLanguage = () => {
    const newLocale: Locale = locale === 'en' ? 'es' : 'en';
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);

    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }));
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
      title={locale === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
    >
      <span className="text-base">{locale === 'en' ? '🇪🇸' : '🇺🇸'}</span>
      <span>{locale === 'en' ? 'Español' : 'English'}</span>
    </button>
  );
}

// Hook for getting current locale in components
export function useLocale() {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    // Get initial locale
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['en', 'es'].includes(savedLocale)) {
      setLocale(savedLocale);
    }

    // Listen for locale changes
    const handleLocaleChange = (event: CustomEvent<Locale>) => {
      setLocale(event.detail);
    };

    window.addEventListener('localeChange', handleLocaleChange as EventListener);
    return () => {
      window.removeEventListener('localeChange', handleLocaleChange as EventListener);
    };
  }, []);

  return locale;
}
