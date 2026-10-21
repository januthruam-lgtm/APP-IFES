export type LicencaObra =
  | "Domínio Público"
  | "CC0"
  | "CC BY"
  | "CC BY-SA";

export const LICENCAS_ALLOWLIST: LicencaObra[] = [
  "Domínio Público",
  "CC0",
  "CC BY",
  "CC BY-SA",
];

export interface ObraCapitulo {
  id: string;
  numero: number;
  titulo: string;
  conteudo: string;
}

export interface MarcadorLeitura {
  id: string;
  obraId: string;
  capituloIndex: number;
  progressoPercent: number; // 0 a 100
  criadoEm: string;
  trechoDestaque?: string;
  notaPessoal?: string;
}

export interface ObraBiblioteca {
  id: string;
  titulo: string;
  autor: string;
  anoMorteAutor?: number; // Para cálculo de domínio público (morte + 70 anos a partir de 1º jan seguinte)
  anoPublicacaoOriginal?: number;
  idioma: string; // "pt-BR", "en", "es", etc.
  categoria: string; // "Literatura Brasileira", "Romance", "Ciências", "História", "Filosofia"
  licenca: LicencaObra;
  fonteNome: string; // "Portal Domínio Público (MEC)", "Project Gutenberg", "Wikisource", "SciELO", "OpenStax"
  fonteUrl: string;
  atribuicao: string;
  verificadoEm: string;
  capaUrl?: string;
  sinopseOriginal: string;
  ativo: boolean;
  capitulos: ObraCapitulo[];
  denunciasCount?: number;
  denunciada?: boolean;
}

/**
 * Calcula a elegibilidade estrita de domínio público no Brasil:
 * Pela Lei 9.610/1998, os direitos patrimoniais duram por 70 anos contados
 * de 1º de janeiro do ano subsequente ao falecimento do autor.
 */
export function calcularElegibilidadeDominioPublico(anoMorte?: number): {
  elegivel: boolean;
  anosDesdeInicio: number;
  anoEntradaDominioPublico: number | null;
} {
  if (!anoMorte || isNaN(anoMorte)) {
    return { elegivel: false, anosDesdeInicio: 0, anoEntradaDominioPublico: null };
  }

  const anoEntrada = anoMorte + 71; // 70 anos a contar de 1º de janeiro do ano seguinte
  const anoAtual = new Date().getFullYear();
  const anosPassados = anoAtual - (anoMorte + 1);

  return {
    elegivel: anoAtual >= anoEntrada,
    anosDesdeInicio: Math.max(0, anosPassados),
    anoEntradaDominioPublico: anoEntrada,
  };
}
