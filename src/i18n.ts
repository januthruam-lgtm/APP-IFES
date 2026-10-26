import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Pacotes de tradução pré-compilados e integrados para carregamento offline instantâneo
import ptBR from "./locales/pt-BR.json";
import ptPT from "./locales/pt-PT.json";
import en from "./locales/en.json";
import enGB from "./locales/en-GB.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

export interface LanguageDefinition {
  code: string;
  label: string;
  nativeName: string;
  flag: string;
  dir?: "ltr" | "rtl";
  popular?: boolean;
  status: "completo" | "automatica";
}

export type SupportedLanguageCode = string;

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  // 1. Idiomas com Tradução Completa e Revisada (Human-reviewed / Complete)
  {
    code: "pt-BR",
    label: "Português (Brasil)",
    nativeName: "Português (Brasil)",
    flag: "🇧🇷",
    dir: "ltr",
    popular: true,
    status: "completo",
  },
  {
    code: "pt-PT",
    label: "Português (Portugal)",
    nativeName: "Português (Portugal)",
    flag: "🇵🇹",
    dir: "ltr",
    popular: true,
    status: "completo",
  },
  {
    code: "en",
    label: "English (US)",
    nativeName: "English (US)",
    flag: "🇺🇸",
    dir: "ltr",
    popular: true,
    status: "completo",
  },
  {
    code: "en-GB",
    label: "English (UK)",
    nativeName: "English (UK)",
    flag: "🇬🇧",
    dir: "ltr",
    popular: true,
    status: "completo",
  },
  {
    code: "es",
    label: "Español",
    nativeName: "Español",
    flag: "🇪🇸",
    dir: "ltr",
    popular: true,
    status: "completo",
  },
  {
    code: "fr",
    label: "Français",
    nativeName: "Français",
    flag: "🇫🇷",
    dir: "ltr",
    popular: true,
    status: "completo",
  },

  // 2. Idiomas com Tradução Pré-Compilada Completa (RTL, CJK e Globais)
  { code: "ar", label: "العربية (Árabe)", nativeName: "العربية", flag: "🇸🇦", dir: "rtl", popular: true, status: "completo" },
  { code: "he", label: "עברית (Hebraico)", nativeName: "עברית", flag: "🇮🇱", dir: "rtl", popular: true, status: "completo" },
  { code: "fa", label: "فارسی (Persa)", nativeName: "فارسی", flag: "🇮🇷", dir: "rtl", status: "completo" },
  { code: "ur", label: "اردو (Urdu)", nativeName: "اردو", flag: "🇵🇰", dir: "rtl", status: "completo" },
  { code: "de", label: "Deutsch (Alemão)", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr", popular: true, status: "completo" },
  { code: "it", label: "Italiano", nativeName: "Italiano", flag: "🇮🇹", dir: "ltr", popular: true, status: "completo" },
  { code: "ja", label: "日本語 (Japonês)", nativeName: "日本語", flag: "🇯🇵", dir: "ltr", popular: true, status: "completo" },
  { code: "zh", label: "简体中文 (Chinês)", nativeName: "简体中文", flag: "🇨🇳", dir: "ltr", popular: true, status: "completo" },
  { code: "ko", label: "한국어 (Coreano)", nativeName: "한국어", flag: "🇰🇷", dir: "ltr", popular: true, status: "completo" },
  { code: "ru", label: "Русский (Russo)", nativeName: "Русский", flag: "🇷🇺", dir: "ltr", popular: true, status: "completo" },
  { code: "hi", label: "हिन्दी (Hindi)", nativeName: "हिन्दी", flag: "🇮🇳", dir: "ltr", popular: true, status: "completo" },
  { code: "nl", label: "Nederlands (Holandês)", nativeName: "Nederlands", flag: "🇳🇱", dir: "ltr", popular: true, status: "completo" },
  { code: "tr", label: "Türkçe (Turco)", nativeName: "Türkçe", flag: "🇹🇷", dir: "ltr", popular: true, status: "completo" },
  { code: "pl", label: "Polski (Polonês)", nativeName: "Polski", flag: "🇵🇱", dir: "ltr", popular: true, status: "completo" },
  { code: "sv", label: "Svenska (Sueco)", nativeName: "Svenska", flag: "🇸🇪", dir: "ltr", popular: true, status: "completo" },
  { code: "id", label: "Bahasa Indonesia", nativeName: "Bahasa Indonesia", flag: "🇮🇩", dir: "ltr", popular: true, status: "completo" },
  { code: "th", label: "ไทย (Tailandês)", nativeName: "ไทย", flag: "🇹🇭", dir: "ltr", popular: true, status: "completo" },
  { code: "vi", label: "Tiếng Việt (Vietnamita)", nativeName: "Tiếng Việt", flag: "🇻🇳", dir: "ltr", popular: true, status: "completo" },
  { code: "uk", label: "Українська (Ucraniano)", nativeName: "Українська", flag: "🇺🇦", dir: "ltr", popular: true, status: "completo" },
];

export const localeModules: Record<string, () => Promise<{ default: Record<string, any> }>> = {
  "pt-BR": () => import("./locales/pt-BR.json"),
  pt: () => import("./locales/pt-BR.json"),
  "pt-PT": () => import("./locales/pt-PT.json"),
  en: () => import("./locales/en.json"),
  "en-US": () => import("./locales/en.json"),
  "en-GB": () => import("./locales/en-GB.json"),
  es: () => import("./locales/es.json"),
  fr: () => import("./locales/fr.json"),
  de: () => import("./locales/de.json"),
  it: () => import("./locales/it.json"),
  ja: () => import("./locales/ja.json"),
  zh: () => import("./locales/zh.json"),
  ko: () => import("./locales/ko.json"),
  ru: () => import("./locales/ru.json"),
  hi: () => import("./locales/hi.json"),
  ar: () => import("./locales/ar.json"),
  he: () => import("./locales/he.json"),
  fa: () => import("./locales/fa.json"),
  ur: () => import("./locales/ur.json"),
  nl: () => import("./locales/nl.json"),
  tr: () => import("./locales/tr.json"),
  pl: () => import("./locales/pl.json"),
  sv: () => import("./locales/sv.json"),
  id: () => import("./locales/id.json"),
  th: () => import("./locales/th.json"),
  vi: () => import("./locales/vi.json"),
  uk: () => import("./locales/uk.json"),
};

export const resources = {
  "pt-BR": { translation: ptBR },
  pt: { translation: ptBR },
  "pt-PT": { translation: ptPT },
  en: { translation: en },
  "en-US": { translation: en },
  "en-GB": { translation: enGB },
  es: { translation: es },
  fr: { translation: fr },
};

// Obter idioma inicial salvo com validação
const savedLang = typeof window !== "undefined" ? localStorage.getItem("brain_studio_lang") : null;
const initialLanguage = savedLang && (resources[savedLang as keyof typeof resources] || localeModules[savedLang]) ? savedLang : "pt-BR";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    // REGRA INEGOCIÁVEL (FASE 1): Faltou arquivo ou chave, cair em INGLÊS (nunca em português misturado)
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React protege contra XSS
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "brain_studio_lang",
    },
  });

/**
 * Atualiza os atributos lang e dir no documento HTML para suporte total a RTL e SEO.
 */
export function updateDocumentLanguage(langCode: string): void {
  if (typeof document === "undefined") return;
  const langDef = SUPPORTED_LANGUAGES.find(
    (l) => l.code === langCode || l.code.split("-")[0] === langCode.split("-")[0]
  );
  document.documentElement.lang = langCode;
  document.documentElement.dir = langDef?.dir || "ltr";
}

/**
 * Carrega dinamicamente o dicionário de tradução com garantia offline total.
 * Sem chamadas síncronas que possam estourar cotas de IA ou gerar erro 429.
 */
export async function loadLanguageBundle(langCode: string): Promise<void> {
  if (typeof window === "undefined") return;
  const normalized = langCode.trim();

  // Se já estiver em memória no i18next, está pronto
  if (i18n.hasResourceBundle(normalized, "translation")) {
    return;
  }

  // Carregamento dinâmico pré-compilado em chunks Vite
  const loader = localeModules[normalized];
  if (loader) {
    try {
      const module = await loader();
      if (module && module.default) {
        i18n.addResourceBundle(normalized, "translation", module.default, true, true);
        i18n.emit("loaded");
        return;
      }
    } catch (err) {
      console.warn(`[i18n] Carregamento dinâmico de ${normalized} falhou:`, err);
    }
  }

  // Verificar cache local (localStorage)
  const cacheKey = `brain_studio_bundle_${normalized}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      i18n.addResourceBundle(normalized, "translation", parsed, true, true);
      i18n.emit("loaded");
      return;
    }
  } catch {}

  // Fallback seguro: se não estiver compilado localmente, herda de Inglês (en.json)
  i18n.addResourceBundle(normalized, "translation", en, true, false);
}

/**
 * Troca de idioma rápida, segura e reativa em todo o aplicativo.
 */
export async function changeAppLanguage(langCode: string): Promise<void> {
  const normalized = langCode.trim();
  updateDocumentLanguage(normalized);
  await loadLanguageBundle(normalized);
  await i18n.changeLanguage(normalized);
  try {
    localStorage.setItem("brain_studio_lang", normalized);
  } catch {}
}

// Inicializar atributos no elemento raiz do documento
if (typeof document !== "undefined") {
  const current = i18n.language || "pt-BR";
  updateDocumentLanguage(current);

  i18n.on("languageChanged", (lng) => {
    updateDocumentLanguage(lng);
    try {
      localStorage.setItem("brain_studio_lang", lng);
    } catch {}
  });
}

export default i18n;
