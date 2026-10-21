export type LuminaExplanationLevel = "simple" | "normal" | "technical";

export interface LuminaMemoryItem {
  id: string;
  categoria: "interesses" | "objetivos" | "dificuldades" | "estilo_estudo" | "idioma";
  texto: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface LuminaFeedbackPayload {
  messageId: string;
  rating: 1 | -1; // 1 = positivo, -1 = negativo
  reason?: string;
  topic?: string;
  explanationLevel?: LuminaExplanationLevel;
  timestamp: string;
}
