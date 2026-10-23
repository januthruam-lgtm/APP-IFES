/**
 * Brain Studio - Sistemas de Avaliação e Notas (Fase 7)
 * Configuração pura e testável para suporte a escalas globais de notas.
 * Suporta 0-10 (Brasil padrão), 0-100 (IFES e Federais), 0-20 (Portugal/França),
 * Letras A-F, GPA 4.0 e Escalas Personalizadas.
 */

export type TipoSistemaNota =
  | "0_a_10"
  | "0_a_100"
  | "0_a_20"
  | "a_a_f"
  | "gpa_4_0"
  | "personalizado";

export interface SistemaNotaConfig {
  id: TipoSistemaNota;
  nome: string;
  descricao: string;
  minimo: number;
  maximo: number;
  mediaPadraoAprovacao: number;
  casasDecimaisPadrao: number;
  sufixo?: string;
  tabelaEquivalencia?: Array<{
    letra: string;
    gpa: number;
    percentualMin: number;
    percentualMax: number;
  }>;
}

export const SISTEMAS_NOTAS: Readonly<Record<TipoSistemaNota, SistemaNotaConfig>> = Object.freeze({
  "0_a_10": {
    id: "0_a_10",
    nome: "0 a 10 (Brasil Padrão)",
    descricao: "Escala decimal padrão de 0,0 a 10,0 com aprovação comum em 6,0 ou 7,0.",
    minimo: 0,
    maximo: 10,
    mediaPadraoAprovacao: 6.0,
    casasDecimaisPadrao: 1,
  },
  "0_a_100": {
    id: "0_a_100",
    nome: "0 a 100 Pontos (IFES e Redes Federais)",
    descricao: "Escala centesimal de 0 a 100 pontos com média padrão de aprovação em 60 pontos.",
    minimo: 0,
    maximo: 100,
    mediaPadraoAprovacao: 60,
    casasDecimaisPadrao: 0,
    sufixo: " pts",
  },
  "0_a_20": {
    id: "0_a_20",
    nome: "0 a 20 (Portugal, França e Angola)",
    descricao: "Escala clássica de 0 a 20 valores, com aprovação comum em 10 valores.",
    minimo: 0,
    maximo: 20,
    mediaPadraoAprovacao: 10,
    casasDecimaisPadrao: 1,
    sufixo: " val",
  },
  "a_a_f": {
    id: "a_a_f",
    nome: "Letras (A, B, C, D, F - EUA e Internacional)",
    descricao: "Classificação por letras de A (excelente) a F (reprovado), com D/C como aprovação.",
    minimo: 0,
    maximo: 4.0,
    mediaPadraoAprovacao: 2.0, // Equivalente a C
    casasDecimaisPadrao: 0,
    tabelaEquivalencia: [
      { letra: "A+", gpa: 4.0, percentualMin: 97, percentualMax: 100 },
      { letra: "A", gpa: 4.0, percentualMin: 93, percentualMax: 96.9 },
      { letra: "A-", gpa: 3.7, percentualMin: 90, percentualMax: 92.9 },
      { letra: "B+", gpa: 3.3, percentualMin: 87, percentualMax: 89.9 },
      { letra: "B", gpa: 3.0, percentualMin: 83, percentualMax: 86.9 },
      { letra: "B-", gpa: 2.7, percentualMin: 80, percentualMax: 82.9 },
      { letra: "C+", gpa: 2.3, percentualMin: 77, percentualMax: 79.9 },
      { letra: "C", gpa: 2.0, percentualMin: 73, percentualMax: 76.9 },
      { letra: "C-", gpa: 1.7, percentualMin: 70, percentualMax: 72.9 },
      { letra: "D+", gpa: 1.3, percentualMin: 67, percentualMax: 69.9 },
      { letra: "D", gpa: 1.0, percentualMin: 60, percentualMax: 66.9 },
      { letra: "F", gpa: 0.0, percentualMin: 0, percentualMax: 59.9 },
    ],
  },
  "gpa_4_0": {
    id: "gpa_4_0",
    nome: "GPA 4.0 (Grade Point Average)",
    descricao: "Padrão universitário dos EUA de 0.0 a 4.0.",
    minimo: 0.0,
    maximo: 4.0,
    mediaPadraoAprovacao: 2.0,
    casasDecimaisPadrao: 2,
  },
  "personalizado": {
    id: "personalizado",
    nome: "Escala Personalizada",
    descricao: "Definida livremente pela instituição ou pelo estudante.",
    minimo: 0,
    maximo: 100,
    mediaPadraoAprovacao: 60,
    casasDecimaisPadrao: 1,
  },
});

/**
 * Retorna o sistema de notas padrão para determinado país (código ISO 3166-1 alfa-2).
 */
export function getSistemaNotaPadraoPorPais(paisIso?: string): TipoSistemaNota {
  if (!paisIso) return "0_a_10";
  const code = paisIso.toUpperCase();
  switch (code) {
    case "BR":
      return "0_a_10"; // Ou 0_a_100 para IFES
    case "PT":
    case "FR":
    case "AO":
    case "CV":
    case "MZ":
      return "0_a_20";
    case "US":
    case "GB":
    case "CA":
      return "a_a_f";
    default:
      return "0_a_10";
  }
}

/**
 * Formata um valor numérico ou letra de acordo com o sistema de avaliação.
 */
export function formatarNota(
  valor: number | string | null | undefined,
  sistemaId: TipoSistemaNota = "0_a_10",
  casasDecimais?: number
): string {
  if (valor === null || valor === undefined || valor === "") {
    return "—";
  }

  // Se já for string de letra em sistema A-F
  if (typeof valor === "string") {
    const limpo = valor.trim().toUpperCase();
    if (sistemaId === "a_a_f") return limpo;
    const parsed = parseFloat(limpo.replace(",", "."));
    if (isNaN(parsed)) return limpo;
    valor = parsed;
  }

  const config = SISTEMAS_NOTAS[sistemaId] || SISTEMAS_NOTAS["0_a_10"];
  const decimais = casasDecimais !== undefined ? casasDecimais : config.casasDecimaisPadrao;

  if (sistemaId === "a_a_f" && config.tabelaEquivalencia) {
    // Se o valor estiver em escala 0-100 ou 0-4
    let percentual = valor;
    if (valor <= 4.0 && valor >= 0) {
      // Converte gpa 4.0 para percentual aproximado
      percentual = (valor / 4.0) * 100;
    }
    const match = config.tabelaEquivalencia.find(
      (item) => percentual >= item.percentualMin && percentual <= item.percentualMax + 0.1
    );
    return match ? match.letra : `${valor.toFixed(1)}`;
  }

  const numFormatado = valor.toLocaleString("pt-BR", {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  });

  return config.sufixo ? `${numFormatado}${config.sufixo}` : numFormatado;
}

/**
 * Verifica de forma pura se o estudante está aprovado na nota informada.
 */
export function estaAprovado(
  nota: number | string | null | undefined,
  sistemaId: TipoSistemaNota = "0_a_10",
  notaMinimaCustomizada?: number
): boolean | null {
  if (nota === null || nota === undefined || nota === "") return null;

  const config = SISTEMAS_NOTAS[sistemaId] || SISTEMAS_NOTAS["0_a_10"];
  const corte = notaMinimaCustomizada !== undefined ? notaMinimaCustomizada : config.mediaPadraoAprovacao;

  if (sistemaId === "a_a_f" && typeof nota === "string") {
    const letra = nota.trim().toUpperCase();
    if (["A+", "A", "A-", "B+", "B", "B-", "C+", "C"].includes(letra)) return true;
    if (["C-", "D+", "D", "F"].includes(letra)) return false;
  }

  const valorNumerico = typeof nota === "string" ? parseFloat(nota.replace(",", ".")) : nota;
  if (isNaN(valorNumerico)) return null;

  return valorNumerico >= corte;
}

/**
 * Converte notas percentualmente entre sistemas para interoperabilidade.
 */
export function normalizarParaPercentual(
  nota: number,
  sistemaId: TipoSistemaNota
): number {
  const config = SISTEMAS_NOTAS[sistemaId] || SISTEMAS_NOTAS["0_a_10"];
  const range = config.maximo - config.minimo;
  if (range <= 0) return 0;
  const clamped = Math.max(config.minimo, Math.min(config.maximo, nota));
  return ((clamped - config.minimo) / range) * 100;
}
