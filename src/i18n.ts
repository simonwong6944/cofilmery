import { zhHK } from './locales/zh-HK';
import { en } from './locales/en';
import { zhCN } from './locales/zh-CN';

export type SupportedLocale = 'zh-HK' | 'en' | 'zh-CN';

export const locales = { 'zh-HK': zhHK, en, 'zh-CN': zhCN } as const;

export const DEFAULT_LOCALE: SupportedLocale = 'zh-HK';

let currentLocale: SupportedLocale = DEFAULT_LOCALE;

export function setLocale(locale: SupportedLocale) {
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    localStorage.setItem('cofilmery-locale', locale);
  }
}

export function getLocale(): SupportedLocale {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cofilmery-locale') as SupportedLocale;
    if (saved && locales[saved]) return saved;
  }
  return currentLocale;
}

export function t(): typeof zhHK {
  const locale = getLocale();
  return locales[locale] as typeof zhHK;
}

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  'zh-HK': '繁體中文',
  'en': 'English',
  'zh-CN': '简体中文',
};
