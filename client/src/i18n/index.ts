import { en } from "./locales/en";
import { vi } from "./locales/vi";
import { zh } from "./locales/zh";

export type Locale = "en" | "vi" | "zh";
export type Translations = typeof en;

export const locales: Record<Locale, Translations> = {
  en,
  vi,
  zh,
};

export const localeNames: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
  zh: "中文",
};

export const defaultLocale: Locale = "en";

export function getTranslations(locale: Locale): Translations {
  return locales[locale] || locales[defaultLocale];
}
