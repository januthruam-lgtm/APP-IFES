import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";

interface SpeechRecognitionHookOptions {
  lang?: string;
  onTranscriptChange?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
}

/**
 * Normaliza o código de idioma para o padrão BCP-47 com região.
 * Browsers como Chrome e WebViews Android descartam códigos de 2 letras
 * (como "en" ou "es") e recaem no idioma padrão do sistema operacional.
 */
export function normalizeSpeechLang(lang: string): string {
  if (!lang) return "pt-BR";
  const lower = lang.toLowerCase().trim();
  const map: Record<string, string> = {
    pt: "pt-BR",
    "pt-br": "pt-BR",
    "pt-pt": "pt-PT",
    en: "en-US",
    "en-us": "en-US",
    "en-gb": "en-GB",
    es: "es-ES",
    "es-es": "es-ES",
    "es-419": "es-419",
    fr: "fr-FR",
    "fr-fr": "fr-FR",
    de: "de-DE",
    it: "it-IT",
    ja: "ja-JP",
    zh: "zh-CN",
    "zh-cn": "zh-CN",
    "zh-tw": "zh-TW",
    ru: "ru-RU",
    ko: "ko-KR",
    ar: "ar-SA",
    hi: "hi-IN",
    nl: "nl-NL",
    tr: "tr-TR",
    pl: "pl-PL",
    sv: "sv-SE",
    no: "no-NO",
    da: "da-DK",
    fi: "fi-FI",
    el: "el-GR",
    cs: "cs-CZ",
    ro: "ro-RO",
    hu: "hu-HU",
    he: "he-IL",
    id: "id-ID",
    th: "th-TH",
    vi: "vi-VN",
    uk: "uk-UA",
  };

  if (map[lower]) return map[lower];
  if (lang.length === 2) return `${lang.toLowerCase()}-${lang.toUpperCase()}`;
  return lang;
}

export function useSpeechRecognition(options: SpeechRecognitionHookOptions = {}) {
  const { i18n, t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    setIsSupported(!!SpeechRecognition);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(t("erros.mic_nao_suportado", "Reconhecimento de voz não suportado neste navegador."));
      return;
    }

    // Interrompe se já estiver ouvindo
    if (isListening && recognitionRef.current) {
      stopListening();
      return;
    }

    setError(null);
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Idioma exato selecionado pelo usuário no applet normalizado para BCP-47
      const activeLang = options.lang || i18n.language || "pt-BR";
      recognition.lang = normalizeSpeechLang(activeLang);
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const combined = (final || interim).trim();
        if (combined) {
          setTranscript(combined);
          if (options.onTranscriptChange) {
            options.onTranscriptChange(combined);
          }
          if (final && options.onFinalTranscript) {
            options.onFinalTranscript(final);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("[SpeechRecognition] Evento:", event.error);
        if (event.error !== "no-speech") {
          setError(event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.warn("[SpeechRecognition] Falha ao iniciar:", err);
      setError(err?.message || "Erro ao iniciar microfone");
      setIsListening(false);
    }
  }, [isListening, i18n.language, options, stopListening, t]);

  // Se o idioma do aplicativo mudar enquanto estiver escutando, reinicia com o novo idioma
  useEffect(() => {
    if (isListening) {
      stopListening();
      const timer = setTimeout(() => {
        startListening();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [i18n.language]);

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    setTranscript,
    activeLang: normalizeSpeechLang(options.lang || i18n.language || "pt-BR"),
  };
}

export default useSpeechRecognition;
