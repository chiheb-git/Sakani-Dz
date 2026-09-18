import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './locales/fr.json';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const LANGUAGE_STORAGE_KEY = 'sakani_language';
export const LANGUAGE_SETUP_KEY = 'sakani_language_setup';

export type SupportedLanguage = 'fr' | 'ar' | 'en';

const resources = {
  fr: { translation: fr },
  ar: { translation: ar },
  en: { translation: en },
};

const detectLanguage = (): SupportedLanguage => {
  const systemLocale = (Localization.getLocales?.()[0]?.languageCode ?? 'fr').toLowerCase();
  if (systemLocale.startsWith('ar')) return 'ar';
  if (systemLocale.startsWith('en')) return 'en';
  return 'fr';
};

export async function getStoredLanguage(): Promise<SupportedLanguage> {
  const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'fr' || saved === 'ar' || saved === 'en') return saved;
  return detectLanguage();
}

export async function setStoredLanguage(language: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18next.changeLanguage(language);
  I18nManager.allowRTL(language === 'ar');
  I18nManager.forceRTL(language === 'ar');
}

export async function initializeI18n(): Promise<SupportedLanguage> {
  const lang = await getStoredLanguage();
  if (!i18next.isInitialized) {
    i18next.use(initReactI18next).init({
      fallbackLng: 'fr',
      resources,
      lng: lang,
      returnNull: false,
      interpolation: { escapeValue: false },
    });
  } else {
    i18next.changeLanguage(lang);
  }
  I18nManager.allowRTL(lang === 'ar');
  I18nManager.forceRTL(lang === 'ar');
  return lang;
}

export const i18n = i18next;
export const supportedLanguages: SupportedLanguage[] = ['fr', 'ar', 'en'];
