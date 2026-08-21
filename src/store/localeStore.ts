import { create } from 'zustand';
import type { SupportedLocale } from '../types';
import { setLocale, getLocale } from '../i18n';

interface LocaleState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: getLocale(),
  setLocale: (locale: SupportedLocale) => {
    setLocale(locale);
    set({ locale });
  },
}));
