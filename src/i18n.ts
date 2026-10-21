import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

export interface LanguageDefinition {
  code: string;
  label: string;
  nativeName: string;
  flag: string;
  dir?: "ltr" | "rtl";
  popular?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageDefinition[] = [
  // Idiomas Principais e Populares
  { code: "pt-BR", label: "Português (Brasil)", nativeName: "Português (Brasil)", flag: "🇧🇷", dir: "ltr", popular: true },
  { code: "pt-PT", label: "Português (Portugal)", nativeName: "Português (Portugal)", flag: "🇵🇹", dir: "ltr", popular: true },
  { code: "en", label: "English (US)", nativeName: "English (US)", flag: "🇺🇸", dir: "ltr", popular: true },
  { code: "en-GB", label: "English (UK)", nativeName: "English (UK)", flag: "🇬🇧", dir: "ltr", popular: true },
  { code: "es", label: "Español", nativeName: "Español", flag: "🇪🇸", dir: "ltr", popular: true },
  { code: "fr", label: "Français (Francês)", nativeName: "Français", flag: "🇫🇷", dir: "ltr", popular: true },
  { code: "de", label: "Deutsch (Alemão)", nativeName: "Deutsch", flag: "🇩🇪", dir: "ltr", popular: true },
  { code: "it", label: "Italiano", nativeName: "Italiano", flag: "🇮🇹", dir: "ltr", popular: true },
  { code: "ja", label: "日本語 (Japonês)", nativeName: "日本語", flag: "🇯🇵", dir: "ltr", popular: true },
  { code: "zh", label: "简体中文 (Chinês Simplificado)", nativeName: "简体中文", flag: "🇨🇳", dir: "ltr", popular: true },
  { code: "zh-TW", label: "繁體中文 (Chinês Tradicional)", nativeName: "繁體中文", flag: "🇹🇼", dir: "ltr", popular: true },
  { code: "ru", label: "Русский (Russo)", nativeName: "Русский", flag: "🇷🇺", dir: "ltr", popular: true },
  { code: "ko", label: "한국어 (Coreano)", nativeName: "한국어", flag: "🇰🇷", dir: "ltr", popular: true },
  { code: "ar", label: "العربية (Árabe)", nativeName: "العربية", flag: "🇸🇦", dir: "rtl", popular: true },
  { code: "hi", label: "हिन्दी (Hindi)", nativeName: "हिन्दी", flag: "🇮🇳", dir: "ltr", popular: true },
  { code: "nl", label: "Nederlands (Holandês)", nativeName: "Nederlands", flag: "🇳🇱", dir: "ltr", popular: true },
  { code: "tr", label: "Türkçe (Turco)", nativeName: "Türkçe", flag: "🇹🇷", dir: "ltr", popular: true },
  { code: "pl", label: "Polski (Polonês)", nativeName: "Polski", flag: "🇵🇱", dir: "ltr", popular: true },
  { code: "sv", label: "Svenska (Sueco)", nativeName: "Svenska", flag: "🇸🇪", dir: "ltr", popular: true },
  { code: "no", label: "Norsk (Norueguês)", nativeName: "Norsk", flag: "🇳🇴", dir: "ltr", popular: true },
  { code: "da", label: "Dansk (Dinamarquês)", nativeName: "Dansk", flag: "🇩🇰", dir: "ltr", popular: true },
  { code: "fi", label: "Suomi (Finlandês)", nativeName: "Suomi", flag: "🇫🇮", dir: "ltr", popular: true },
  { code: "el", label: "Ελληνικά (Grego)", nativeName: "Ελληνικά", flag: "🇬🇷", dir: "ltr", popular: true },
  { code: "cs", label: "Čeština (Tcheco)", nativeName: "Čeština", flag: "🇨🇿", dir: "ltr", popular: true },
  { code: "ro", label: "Română (Romeno)", nativeName: "Română", flag: "🇷🇴", dir: "ltr", popular: true },
  { code: "hu", label: "Magyar (Húngaro)", nativeName: "Magyar", flag: "🇭🇺", dir: "ltr", popular: true },
  { code: "he", label: "עברית (Hebraico)", nativeName: "עברית", flag: "🇮🇱", dir: "rtl", popular: true },
  { code: "id", label: "Bahasa Indonesia", nativeName: "Bahasa Indonesia", flag: "🇮🇩", dir: "ltr", popular: true },
  { code: "th", label: "ไทย (Tailandês)", nativeName: "ไทย", flag: "🇹🇭", dir: "ltr", popular: true },
  { code: "vi", label: "Tiếng Việt (Vietnamita)", nativeName: "Tiếng Việt", flag: "🇻🇳", dir: "ltr", popular: true },
  { code: "uk", label: "Українська (Ucraniano)", nativeName: "Українська", flag: "🇺🇦", dir: "ltr", popular: true },

  // Mais de 90 outros idiomas mundiais completos (Total 120+)
  { code: "af", label: "Afrikaans (Africâner)", nativeName: "Afrikaans", flag: "🇿🇦", dir: "ltr" },
  { code: "am", label: "አማርኛ (Amárico)", nativeName: "አማርኛ", flag: "🇪🇹", dir: "ltr" },
  { code: "ay", label: "Aymar aru (Aimará)", nativeName: "Aymar aru", flag: "🇧🇴", dir: "ltr" },
  { code: "az", label: "Azərbaycan (Azeri)", nativeName: "Azərbaycanca", flag: "🇦🇿", dir: "ltr" },
  { code: "be", label: "Беларуская (Bielorrusso)", nativeName: "Беларуская", flag: "🇧🇾", dir: "ltr" },
  { code: "bg", label: "Български (Búlgaro)", nativeName: "Български", flag: "🇧🇬", dir: "ltr" },
  { code: "bn", label: "বাংলা (Bengali)", nativeName: "বাংলা", flag: "🇧🇩", dir: "ltr" },
  { code: "bo", label: "བོད་སྐད་ (Tibetano)", nativeName: "བོད་སྐད་", flag: "🇨🇳", dir: "ltr" },
  { code: "bs", label: "Bosanski (Bósnio)", nativeName: "Bosanski", flag: "🇧🇦", dir: "ltr" },
  { code: "ca", label: "Català (Catalão)", nativeName: "Català", flag: "🇪🇸", dir: "ltr" },
  { code: "ceb", label: "Cebuano", nativeName: "Sinugboanon", flag: "🇵🇭", dir: "ltr" },
  { code: "co", label: "Corsu (Corso)", nativeName: "Corsu", flag: "🇫🇷", dir: "ltr" },
  { code: "cy", label: "Cymraeg (Galês)", nativeName: "Cymraeg", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", dir: "ltr" },
  { code: "dz", label: "རྫོང་ཁ (Butanês)", nativeName: "རྫོང་ཁ", flag: "🇧🇹", dir: "ltr" },
  { code: "eo", label: "Esperanto", nativeName: "Esperanto", flag: "🌐", dir: "ltr" },
  { code: "et", label: "Eesti (Estoniano)", nativeName: "Eesti", flag: "🇪🇪", dir: "ltr" },
  { code: "eu", label: "Euskara (Basco)", nativeName: "Euskara", flag: "🇪🇸", dir: "ltr" },
  { code: "fa", label: "فارسی (Persa)", nativeName: "فارسی", flag: "🇮🇷", dir: "rtl" },
  { code: "fo", label: "Føroyskt (Feroês)", nativeName: "Føroyskt", flag: "🇫🇴", dir: "ltr" },
  { code: "fy", label: "Frysk (Frísio)", nativeName: "Frysk", flag: "🇳🇱", dir: "ltr" },
  { code: "ga", label: "Gaeilge (Irlandês)", nativeName: "Gaeilge", flag: "🇮🇪", dir: "ltr" },
  { code: "gd", label: "Gàidhlig (Gaélico Escocês)", nativeName: "Gàidhlig", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", dir: "ltr" },
  { code: "gl", label: "Galego", nativeName: "Galego", flag: "🇪🇸", dir: "ltr" },
  { code: "gn", label: "Avañe'ẽ (Guarani)", nativeName: "Avañe'ẽ", flag: "🇵🇾", dir: "ltr" },
  { code: "gu", label: "ગુજરાતી (Guzerate)", nativeName: "ગુજરાતી", flag: "🇮🇳", dir: "ltr" },
  { code: "ha", label: "Hausa (Hauçá)", nativeName: "Hausa", flag: "🇳🇬", dir: "ltr" },
  { code: "haw", label: "ʻŌlelo Hawaiʻi (Havaiano)", nativeName: "ʻŌlelo Hawaiʻi", flag: "🌺", dir: "ltr" },
  { code: "hmn", label: "Hmoob (Hmong)", nativeName: "Hmoob", flag: "🇨🇳", dir: "ltr" },
  { code: "hr", label: "Hrvatski (Croata)", nativeName: "Hrvatski", flag: "🇭🇷", dir: "ltr" },
  { code: "ht", label: "Kreyòl Ayisyen (Crioulo Haitiano)", nativeName: "Kreyòl", flag: "🇭🇹", dir: "ltr" },
  { code: "hy", label: "Հայերեն (Armênio)", nativeName: "Հայերեն", flag: "🇦🇲", dir: "ltr" },
  { code: "ig", label: "Ásụ̀sụ́ Ìgbò (Ibo)", nativeName: "Asụsụ Igbo", flag: "🇳🇬", dir: "ltr" },
  { code: "is", label: "Íslenska (Islandês)", nativeName: "Íslenska", flag: "🇮🇸", dir: "ltr" },
  { code: "jv", label: "Basa Jawa (Javanês)", nativeName: "Basa Jawa", flag: "🇮🇩", dir: "ltr" },
  { code: "ka", label: "ქართული (Georgiano)", nativeName: "ქართული", flag: "🇬🇪", dir: "ltr" },
  { code: "kk", label: "Қазақша (Cazaque)", nativeName: "Қазақ тілі", flag: "🇰🇿", dir: "ltr" },
  { code: "kl", label: "Kalaallisut (Groenlandês)", nativeName: "Kalaallisut", flag: "🇬🇱", dir: "ltr" },
  { code: "km", label: "ភាសាខ្មែរ (Khmer)", nativeName: "ភាសាខ្មែរ", flag: "🇰🇭", dir: "ltr" },
  { code: "kn", label: "ಕನ್ನಡ (Canarim)", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", dir: "ltr" },
  { code: "ku", label: "Kurdî (Curdo)", nativeName: "Kurdî", flag: "🇮🇶", dir: "rtl" },
  { code: "ky", label: "Кыргызча (Quirguiz)", nativeName: "Кыргызча", flag: "🇰🇬", dir: "ltr" },
  { code: "la", label: "Latina (Latim)", nativeName: "Lingua Latina", flag: "🏛️", dir: "ltr" },
  { code: "lb", label: "Lëtzebuergesch (Luxemburguês)", nativeName: "Lëtzebuergesch", flag: "🇱🇺", dir: "ltr" },
  { code: "lo", label: "ພາສາລາວ (Laosiano)", nativeName: "ພາສາລາວ", flag: "🇱🇦", dir: "ltr" },
  { code: "lt", label: "Lietuvių (Lituano)", nativeName: "Lietuvių", flag: "🇱🇹", dir: "ltr" },
  { code: "lv", label: "Latviešu (Letão)", nativeName: "Latviešu", flag: "🇱🇻", dir: "ltr" },
  { code: "mg", label: "Malagasy (Malgaxe)", nativeName: "Malagasy", flag: "🇲🇬", dir: "ltr" },
  { code: "mi", label: "Te Reo Māori (Maori)", nativeName: "Māori", flag: "🇳🇿", dir: "ltr" },
  { code: "mk", label: "Македонски (Macedônio)", nativeName: "Македонски", flag: "🇲🇰", dir: "ltr" },
  { code: "ml", label: "മലയാളം (Malaiala)", nativeName: "മലയാളം", flag: "🇮🇳", dir: "ltr" },
  { code: "mn", label: "Монгол (Mongol)", nativeName: "Монгол хэл", flag: "🇲🇳", dir: "ltr" },
  { code: "mr", label: "मराठी (Marata)", nativeName: "मराठी", flag: "🇮🇳", dir: "ltr" },
  { code: "ms", label: "Bahasa Melayu (Malaio)", nativeName: "Bahasa Melayu", flag: "🇲🇾", dir: "ltr" },
  { code: "mt", label: "Malti (Maltês)", nativeName: "Malti", flag: "🇲🇹", dir: "ltr" },
  { code: "my", label: "မြန်မာ (Birmanês)", nativeName: "မြန်မာစာ", flag: "🇲🇲", dir: "ltr" },
  { code: "ne", label: "नेपाली (Nepalês)", nativeName: "नेपाली", flag: "🇳🇵", dir: "ltr" },
  { code: "ny", label: "Chichewa (Nianja)", nativeName: "Chichewa", flag: "🇲🇼", dir: "ltr" },
  { code: "om", label: "Afaan Oromoo (Oromo)", nativeName: "Oromoo", flag: "🇪🇹", dir: "ltr" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Panjabi)", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳", dir: "ltr" },
  { code: "ps", label: "پښتو (Pashto)", nativeName: "پښتو", flag: "🇦🇫", dir: "rtl" },
  { code: "qu", label: "Runasimi (Quéchua)", nativeName: "Runasimi", flag: "🇵🇪", dir: "ltr" },
  { code: "rw", label: "Ikinyarwanda (Ruandês)", nativeName: "Kinyarwanda", flag: "🇷🇼", dir: "ltr" },
  { code: "sa", label: "संस्कृतम् (Sânscrito)", nativeName: "संस्कृतम्", flag: "🇮🇳", dir: "ltr" },
  { code: "sd", label: "سنڌي (Sindi)", nativeName: "سنڌي", flag: "🇵🇰", dir: "rtl" },
  { code: "si", label: "සිංහල (Cingalês)", nativeName: "සිංහල", flag: "🇱🇰", dir: "ltr" },
  { code: "sk", label: "Slovenčina (Eslovaco)", nativeName: "Slovenčina", flag: "🇸🇰", dir: "ltr" },
  { code: "sl", label: "Slovenščina (Esloveno)", nativeName: "Slovenščina", flag: "🇸🇮", dir: "ltr" },
  { code: "sm", label: "Gagana Sāmoa (Samoano)", nativeName: "Sāmoa", flag: "🇼🇸", dir: "ltr" },
  { code: "sn", label: "ChiShona (Xona)", nativeName: "chiShona", flag: "🇿🇼", dir: "ltr" },
  { code: "so", label: "Soomaali (Somali)", nativeName: "Soomaaliga", flag: "🇸🇴", dir: "ltr" },
  { code: "sq", label: "Shqip (Albanês)", nativeName: "Shqip", flag: "🇦🇱", dir: "ltr" },
  { code: "sr", label: "Српски (Sérvio)", nativeName: "Српски", flag: "🇷🇸", dir: "ltr" },
  { code: "st", label: "Sesotho (Soto)", nativeName: "Sesotho", flag: "🇱🇸", dir: "ltr" },
  { code: "su", label: "Basa Sunda (Sundanês)", nativeName: "Basa Sunda", flag: "🇮🇩", dir: "ltr" },
  { code: "sw", label: "Kiswahili (Suaíli)", nativeName: "Kiswahili", flag: "🇰🇪", dir: "ltr" },
  { code: "ta", label: "தமிழ் (Tâmil)", nativeName: "தமிழ்", flag: "🇮🇳", dir: "ltr" },
  { code: "te", label: "తెలుగు (Telugu)", nativeName: "తెలుగు", flag: "🇮🇳", dir: "ltr" },
  { code: "tg", label: "Тоҷикӣ (Tajique)", nativeName: "Тоҷикӣ", flag: "🇹🇯", dir: "ltr" },
  { code: "ti", label: "ትግርኛ (Tigrínia)", nativeName: "ትግርኛ", flag: "🇪🇷", dir: "ltr" },
  { code: "tk", label: "Türkmençe (Turcomeno)", nativeName: "Türkmen dili", flag: "🇹🇲", dir: "ltr" },
  { code: "tl", label: "Tagalog / Filipino", nativeName: "Wikang Filipino", flag: "🇵🇭", dir: "ltr" },
  { code: "tt", label: "Татарча (Tártaro)", nativeName: "Татар теле", flag: "🇷🇺", dir: "ltr" },
  { code: "ug", label: "ئۇيغۇرچە (Uigur)", nativeName: "ئۇيغۇرچە", flag: "🇨🇳", dir: "rtl" },
  { code: "ur", label: "اردو (Urdu)", nativeName: "اردو", flag: "🇵🇰", dir: "rtl" },
  { code: "uz", label: "Oʻzbekcha (Uzbeque)", nativeName: "Oʻzbek tili", flag: "🇺🇿", dir: "ltr" },
  { code: "xh", label: "isiXhosa (Xhosa)", nativeName: "isiXhosa", flag: "🇿🇦", dir: "ltr" },
  { code: "yi", label: "ייִדיש (Iídiche)", nativeName: "ייִדיש", flag: "🇮🇱", dir: "rtl" },
  { code: "yo", label: "Èdè Yorùbá (Iorubá)", nativeName: "Èdè Yorùbá", flag: "🇳🇬", dir: "ltr" },
  { code: "zu", label: "isiZulu (Zulu)", nativeName: "isiZulu", flag: "🇿🇦", dir: "ltr" },
];

export type SupportedLanguageCode = string;

const resources: Record<string, { translation: Record<string, any> }> = {
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
  const langDef = SUPPORTED_LANGUAGES.find((l) => l.code === langCode || l.code.split("-")[0] === langCode.split("-")[0]);
  document.documentElement.lang = langCode;
  document.documentElement.dir = langDef?.dir || "ltr";
}

/**
 * Carrega dinamicamente o dicionário de tradução completo para o idioma alvo.
 * Utiliza cache local (localStorage) para velocidade instantânea e chama o proxy
 * /api/i18n/translate-bundle quando necessário para verter 100% da interface.
 */
export async function loadLanguageBundle(langCode: string): Promise<void> {
  if (typeof window === "undefined") return;
  const normalized = langCode.trim();

  // Se já for pt-BR, pt, en ou es pré-carregados no bundle, não precisa buscar
  if (normalized === "pt-BR" || normalized === "pt" || normalized === "en" || normalized === "es") {
    return;
  }

  // 1. Verificar se já está carregado na memória do i18next
  if (i18n.hasResourceBundle(normalized, "translation")) {
    return;
  }

  // 2. Verificar cache permanente no localStorage
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

  // 3. Buscar tradução completa e segura via servidor
  try {
    const res = await fetch("/api/i18n/translate-bundle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetLang: normalized,
        sourceBundle: ptBR,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.bundle && typeof data.bundle === "object") {
        i18n.addResourceBundle(normalized, "translation", data.bundle, true, true);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data.bundle));
        } catch {}
        // Forçar atualização reativa da interface
        i18n.changeLanguage(normalized);
      }
    }
  } catch (err) {
    console.warn("Falha ao carregar pacote dinâmico de tradução:", err);
  }
}

/**
 * Troca o idioma de forma centralizada e garantida em todo o aplicativo.
 */
export async function changeAppLanguage(langCode: string): Promise<void> {
  const normalized = langCode.trim();
  updateDocumentLanguage(normalized);
  await i18n.changeLanguage(normalized);
  try {
    localStorage.setItem("brain_studio_lang", normalized);
  } catch {}
  await loadLanguageBundle(normalized);
}

// Inicializar atributo no documento e carregar bundle caso idioma inicial seja dinâmico
if (typeof document !== "undefined") {
  const current = i18n.language || "pt-BR";
  updateDocumentLanguage(current);
  loadLanguageBundle(current);

  i18n.on("languageChanged", (lng) => {
    updateDocumentLanguage(lng);
    try {
      localStorage.setItem("brain_studio_lang", lng);
    } catch {}
  });
}

export default i18n;
