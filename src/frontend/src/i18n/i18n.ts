import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, LANGUAGES } from "@/utils/languages";

const namespaces = [
  "global",
  "home",
  "rooms",
  "recording",
  "settings",
  "notifications",
  "legals",
  "termsOfService",
  "sdk",
  "accessibility",
] as const;

export type AppNamespace = (typeof namespaces)[number];

const supportedLanguages = LANGUAGES.map((l) => l.value);
const defaultLanguage = DEFAULT_LANGUAGE;

const normalizeForPath = (lng: string) => lng.split("-")[0];
const localeModules = import.meta.glob("../locales/*/*.json");

i18n
  .use(
    resourcesToBackend(async (lng: string, ns: string) => {
      const normalized = normalizeForPath(lng);
      const key = `../locales/${normalized}/${ns}.json`;
      const loader = localeModules[key];

      if (!loader) {
        const fallbackKey = `../locales/en/${ns}.json`;
        const fallbackLoader = localeModules[fallbackKey];
        if (!fallbackLoader) {
          throw new Error(`Missing i18n resource file: ${key}`);
        }
        const mod: any = await fallbackLoader();
        return mod.default ?? mod;
      }

      const mod: any = await loader();
      return mod.default ?? mod;
    })
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLanguage,
    supportedLngs: supportedLanguages,
    ns: namespaces,
    defaultNS: "global",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

export default i18n;