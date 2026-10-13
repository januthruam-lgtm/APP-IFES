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

  // Clean text from Markdown or emojis
  const clean = text
    .replace(/[#*_~`>[\]()]/g, "")
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ""
    )
    .trim();

  if (!clean) {
    if (onEndCallback) onEndCallback();
    return;
  }

  if (shouldInterrupt) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "pt-BR";
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const ptVoice =
    voices.find((v) => v.lang.startsWith("pt-BR") || v.lang.startsWith("pt_BR")) ||
    voices.find((v) => v.lang.startsWith("pt"));

  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  utterance.onend = () => {
    if (onEndCallback) onEndCallback();
  };

  utterance.onerror = () => {
    if (onEndCallback) onEndCallback();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
