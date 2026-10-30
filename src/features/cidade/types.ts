/**
 * APP-IFES - Tipos e Estruturas Centrais da Área de Cidades (Vilas do Conhecimento)
 * Experiência imersiva inspirada na construção de vilas do Coin Master, adaptada
 * à jornada acadêmica do Instituto Federal do Espírito Santo (IFES).
 */

export type CidadeId = 1 | 2 | 3 | 4;

export interface MonumentoEstagioInfo {
  nivel: number;
  nome: string;
  descricao: string;
  materiais: string[];
}

export interface MonumentoDefinicao {
  id: string;
  nome: string;
  subtitulo: string;
  categoria: "ciencia" | "historia" | "tecnologia" | "natureza" | "cultura";
  posicao: {
    x: number; // Porcentagem horizontal no cenário (10% a 90%)
    y: number; // Porcentagem vertical no cenário (25% a 85%)
  };
  escala: number; // Fator de perspectiva (0.85 a 1.25)
  materiaisPrincipais: string[];
  estagios: Record<number, MonumentoEstagioInfo>;
}

export interface CidadeTema {
  id: CidadeId;
  nome: string;
  subtitulo: string;
  inspiracao: string;
  bioma: string;
  cenarioImg: string;
  cenarioAlt: string;
  baseCusto: number;
  monumentos: MonumentoDefinicao[];
  recompensaConclusao: {
    moedas: number;
    xp: number;
    titulo: string;
  };
}

export interface EstadoConstrucaoMonumento {
  nivel: number; // 1 a 5 (ou 6+ Mestria)
  totalEvolucoes: number;
  ultimaEvolucaoEm?: string;
}

export interface EstadoCidadeProgresso {
  cidadeAtual: CidadeId;
  construcoes: Record<string, number>; // idMonumento -> nivel
  cidadesCompletadas: number[];
  totalObrasConcluidas: number;
  atualizadoEm: string;
}
