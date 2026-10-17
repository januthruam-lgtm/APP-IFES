import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

export const SUPPORTED_LANGUAGES = [
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷", dir: "ltr" },
  { code: "en", label: "English (US)", flag: "🇺🇸", dir: "ltr" },
  { code: "es", label: "Español", flag: "🇪🇸", dir: "ltr" },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const resources = {
  "pt-BR": { translation: ptBR },
  pt: { translation: ptBR },
  en: { translation: en },
  es: { translation: es },
};

// Obter idioma inicial salvo ou detector
const savedLang = typeof window !== "undefined" ? localStorage.getItem("brain_studio_lang") : null;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang || "pt-BR",
    fallbackLng: "pt-BR",
    interpolation: {
      escapeValue: false, // React já protege contra XSS
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "brain_studio_lang",
    },
  });

// Atualiza o atributo lang e dir no <html> sempre que o idioma mudar
export function updateDocumentLanguage(langCode: string) {
  if (typeof document === "undefined") return;
  const normalized = langCode.startsWith("pt") ? "pt-BR" : langCode.startsWith("es") ? "es" : "en";
  document.documentElement.lang = normalized;
  document.documentElement.dir = "ltr";
}

// Inicializar atributo no documento
if (typeof document !== "undefined") {
  updateDocumentLanguage(i18n.language || "pt-BR");
  i18n.on("languageChanged", (lng) => {
    updateDocumentLanguage(lng);
    try {
      localStorage.setItem("brain_studio_lang", lng);
    } catch {}
  });
}

export default i18n;
