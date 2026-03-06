import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, Translations, getTranslations, defaultLocale } from "./index";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = "hwinnwin-locale";

// Deep merge: overlay dynamic content over static translations
function deepMerge<T>(base: T, override: Partial<T>): T {
  if (!override) return base;
  const result = { ...base } as any;
  for (const key of Object.keys(override)) {
    const val = (override as any)[key];
    if (val && typeof val === "object" && !Array.isArray(val) && typeof (base as any)[key] === "object" && !Array.isArray((base as any)[key])) {
      result[key] = deepMerge((base as any)[key], val);
    } else if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Check URL for locale parameter first
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLocale = urlParams.get("lang") as Locale;
      if (urlLocale && ["en", "vi", "zh"].includes(urlLocale)) {
        return urlLocale;
      }

      // Check localStorage
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && ["en", "vi", "zh"].includes(stored)) {
        return stored as Locale;
      }

      // Check browser language
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "vi") return "vi";
      if (browserLang === "zh") return "zh";
    }
    return defaultLocale;
  });

  // Dynamic content from the admin editor API
  const [dynamicContent, setDynamicContent] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    fetch("/api/homepage-content")
      .then(res => res.ok ? res.json() : null)
      .catch(() => null)
      .then(data => {
        if (data) setDynamicContent(data);
      });
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

    // Update URL without page reload
    const url = new URL(window.location.href);
    if (newLocale === defaultLocale) {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", newLocale);
    }
    window.history.replaceState({}, "", url.toString());

    // Update document lang attribute
    document.documentElement.lang = newLocale;
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Start with static translations, overlay any admin-saved content
  const staticT = getTranslations(locale);
  const t = dynamicContent && dynamicContent[locale]
    ? deepMerge(staticT, dynamicContent[locale])
    : staticT;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
