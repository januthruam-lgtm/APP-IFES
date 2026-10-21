export interface VerbeteSignificado {
  classeGramatical: string; // "substantivo masculino", "verbo transitivo", "adjetivo", etc.
  definicao: string;
  exemplos: string[];
  sinonimos?: string[];
  antonimos?: string[];
}

export interface VerbeteLuminaInsight {
  definicaoSimples: string; // Explicação em palavras do dia a dia
  exemplosIneditos: [string, string]; // 2 frases de exemplo inéditas no contexto acadêmico
  nivelDificuldade: "Fácil" | "Médio" | "Avançado";
  dicaMemorizacao: string; // Dica mnemônica
  comparacaoPalavras: string; // Parônimos ou palavras parecidas
  isGeradoPorIa?: boolean; // Para gírias, expressões ou neologismos
}

export interface VerbeteDicionario {
  termo: string;
  idioma: string;
  pronunciaFonetica?: string;
  audioPronunciaUrl?: string;
  etimologia?: string;
  plural?: string;
  conjugacaoResumo?: string;
  significados: VerbeteSignificado[];
  sinonimosGerais: string[];
  antonimosGerais: string[];
  luminaInsight: VerbeteLuminaInsight;
  fonteNome: string; // "Wiktionary", "Dicionário Aberto", "Free Dictionary API"
  fonteLicenca: string; // "CC BY-SA 4.0", "Domínio Público"
  fonteUrl?: string;
  atualizadoEm: string;
}

export interface ItemVocabularioSalvo {
  id: string;
  termo: string;
  idioma: string;
  classeGramatical: string;
  definicaoCurta: string;
  exemploPratico: string;
  salvoEm: string;
  revisadoCount: number;
}
