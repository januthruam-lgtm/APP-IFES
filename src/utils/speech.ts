// Web Speech API text-to-speech helper

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    } catch (e) {
      console.warn("Speech synthesis cancel error:", e);
    }
  }
}

export function speakText(text: string, isUrgent: boolean = false): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    if (isUrgent || window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const cleanText = text.replace(/[*#_`~\[\]]/g, "").slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "pt-BR";
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick a Portuguese voice if available
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang.startsWith("pt") || v.name.toLowerCase().includes("brazil") || v.name.toLowerCase().includes("portuguese"));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}
