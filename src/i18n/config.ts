import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bn from './locales/bn.json';
import en from './locales/en.json';

export const LANG_STORAGE_KEY = 'banglarchaka_lang';

function readStoredLng(): string {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const v = localStorage.getItem(LANG_STORAGE_KEY);
  return v === 'bn' || v === 'en' ? v : 'en';
}

function applyDocumentLang(lng: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.lang = lng === 'bn' ? 'bn' : 'en';
}

i18n.on('languageChanged', (lng) => {
  applyDocumentLang(lng);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LANG_STORAGE_KEY, lng);
  }
});

/** Wait for this before calling createRoot().render — avoids white screen when hooks run before i18n is ready. */
export const i18nReady = i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: readStoredLng(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false,
  },
});

void i18nReady.then(() => {
  applyDocumentLang(i18n.language);
});

export default i18n;
