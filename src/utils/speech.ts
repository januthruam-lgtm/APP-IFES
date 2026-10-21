import i18n from "../i18n";
import { speakText as libSpeakText, stopSpeaking as libStopSpeaking, isSpeaking as libIsSpeaking } from "../lib/speech";

export function speakText(
  text: string,
  onEndOrInterrupt?: (() => void) | boolean,
  interrupt: boolean = true
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (typeof onEndOrInterrupt === "function") onEndOrInterrupt();
    return;
  }

  const shouldInterrupt = typeof onEndOrInterrupt === "boolean" ? onEndOrInterrupt : interrupt;
  const onEndCallback = typeof onEndOrInterrupt === "function" ? onEndOrInterrupt : undefined;

  if (shouldInterrupt) {
    libStopSpeaking();
  }

  // Utiliza o mecanismo unificado de speech que respeita i18n.language e seleção precisa de vozes
  libSpeakText(text, {
    lang: i18n.language || "pt-BR",
    onEnd: onEndCallback,
    onError: onEndCallback,
  });
}

export function stopSpeaking(): void {
  libStopSpeaking();
}

export function isSpeaking(): boolean {
  return libIsSpeaking();
}
