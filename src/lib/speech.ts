// Camada Unificada de Audiodescrição e Síntese de Voz (TTS)
// Compatível com Web e WebView Android (Capacitor 8) com tratamento seguro de exceções.
import i18n from "../i18n";

export interface SpeechOptions {
  rate?: number; // 0.5 a 2.0
  pitch?: number; // 0.8 a 1.2
  volume?: number; // 0 a 1.0
  lang?: string;
  onBoundary?: (charIndex: number, charLength: number) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices() || [];
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
      activeUtterance = null;
    } catch {}
  }
}

export function pauseSpeaking(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.pause();
    } catch {}
  }
}

export function resumeSpeaking(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.resume();
    } catch {}
  }
}

export function isSpeaking(): boolean {
  if (!isSpeechSupported()) return false;
  return window.speechSynthesis.speaking;
}

export function speakText(text: string, options: SpeechOptions = {}): void {
  if (!isSpeechSupported() || !text || !text.trim()) return;

  stopSpeaking();

  try {
    const cleanText = text
      .replace(/[#*_`~>\[\]\(\)]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    const targetLang = options.lang || i18n.language || "pt-BR";
    utterance.lang = targetLang;

    // Tentar selecionar a melhor voz no idioma atual
    const voices = getAvailableVoices();
    const matchingVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(targetLang.slice(0, 2).toLowerCase())
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (options.onBoundary) {
      utterance.onboundary = (e) => {
        if (options.onBoundary) {
          options.onBoundary(e.charIndex, (e as any).charLength || 10);
        }
      };
    }

    utterance.onend = () => {
      activeUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      if (options.onError) options.onError(e);
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Falha na síntese de voz:", err);
  }
}

/**
 * Lê a descrição da tela atual estruturada em ordem lógica:
 * título, elementos principais e ações disponíveis.
 */
export function readCurrentScreen(screenTitle: string, mainElements: string[], actions: string[]): void {
  const parts: string[] = [];
  parts.push(`Tela atual: ${screenTitle}.`);
  if (mainElements.length > 0) {
    parts.push(`Conteúdo principal: ${mainElements.join(". ")}.`);
  }
  if (actions.length > 0) {
    parts.push(`Ações disponíveis: ${actions.join(". ")}.`);
  }
  speakText(parts.join(" "));
}
