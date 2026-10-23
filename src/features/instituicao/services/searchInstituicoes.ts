/**
 * Brain Studio - Motor de Busca e Indexação de Instituições Globais (Fase 7)
 * Busca fuzzy no aparelho com tolerância a acentos, digitação e cache em memória.
 * Resposta sub-300ms e suporte a Intl.DisplayNames para nomes de países.
 */

import { Instituicao } from "../types";

export interface FiltrosBuscaInstituicao {
  pais: string; // ISO 3166-1 alfa-2 (ex: "BR")
  query?: string;
  regiao?: string; // UF ou Estado
  cidade?: string;
  tipo?: string;
  limite?: number;
}

// Cache em memória dos arquivos de países carregados
const cachePaises = new Map<string, Instituicao[]>();

export const UFS_BRASIL = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

/**
 * Remove acentos, caracteres especiais e converte para minúsculas.
 */
export function normalizarTexto(texto?: string): string {
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Retorna o nome amigável do país utilizando Intl.DisplayNames no idioma do usuário.
 * Nunca usa listas escritas à mão para países.
 */
export function getNomePais(codigoIso: string, locale: string = "pt-BR"): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(codigoIso.toUpperCase()) || codigoIso.toUpperCase();
  } catch {
    return codigoIso.toUpperCase();
  }
}

/**
 * Carrega a base local do país em public/instituicoes/{PAIS}.json.
 */
export async function carregarBasePais(paisIso: string): Promise<Instituicao[]> {
  const codigo = paisIso.toUpperCase().trim();
  if (cachePaises.has(codigo)) {
    return cachePaises.get(codigo)!;
  }

  try {
    const res = await fetch(`/instituicoes/${codigo}.json`);
    if (res.ok) {
      const data: Instituicao[] = await res.json();
      if (Array.isArray(data)) {
        cachePaises.set(codigo, data);
        return data;
      }
    }
  } catch (err) {
    console.warn(`[searchInstituicoes] Base local para ${codigo} indisponível:`, err);
  }

  return [];
}

/**
 * Calcula similaridade fuzzy simples (contém palavras ou proximidade de substrings).
 */
function calcularScore(inst: Instituicao, termos: string[]): number {
  const nomeNorm = normalizarTexto(inst.nome);
  const siglaNorm = normalizarTexto(inst.sigla);
  const cidadeNorm = normalizarTexto(inst.cidade);
  const alternativos = (inst.nomesAlternativos || []).map(normalizarTexto);

  let score = 0;

  for (const termo of termos) {
    if (!termo) continue;

    // Correspondência exata na sigla é o maior peso
    if (siglaNorm === termo) {
      score += 100;
    } else if (siglaNorm.includes(termo)) {
      score += 40;
    }

    // Correspondência exata no início do nome
    if (nomeNorm.startsWith(termo)) {
      score += 50;
    } else if (nomeNorm.includes(termo)) {
      score += 25;
    }

    // Nomes alternativos
    for (const alt of alternativos) {
      if (alt.includes(termo)) {
        score += 20;
        break;
      }
    }

    // Cidade
    if (cidadeNorm.includes(termo)) {
      score += 10;
    }
  }

  return score;
}

/**
 * Executa a busca de instituições combinando cache local, filtros de região/cidade e fallback de API.
 */
export async function buscarInstituicoes(filtros: FiltrosBuscaInstituicao): Promise<Instituicao[]> {
  const { pais, query, regiao, cidade, tipo, limite = 25 } = filtros;
  const codigoPais = pais.toUpperCase().trim();

  let lista = await carregarBasePais(codigoPais);

  // Se a lista estiver vazia para o país e houver query, tenta a rota do servidor /api/instituicoes
  if (lista.length === 0 && typeof window !== "undefined") {
    try {
      const params = new URLSearchParams({
        pais: codigoPais,
        q: query || "",
      });
      if (regiao) params.set("regiao", regiao);
      if (cidade) params.set("cidade", cidade);

      const res = await fetch(`/api/instituicoes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          lista = data;
        }
      }
    } catch {
      // Ignora falhas de rede do servidor e segue com lista local
    }
  }

  // Filtragem
  let resultados = lista;

  if (regiao) {
    const regiaoNorm = normalizarTexto(regiao);
    resultados = resultados.filter((i) => normalizarTexto(i.regiao) === regiaoNorm);
  }

  if (cidade) {
    const cidadeNorm = normalizarTexto(cidade);
    resultados = resultados.filter((i) => normalizarTexto(i.cidade).includes(cidadeNorm));
  }

  if (tipo) {
    resultados = resultados.filter((i) => i.tipo === tipo);
  }

  if (query && query.trim().length > 0) {
    const qNorm = normalizarTexto(query);
    const termos = qNorm.split(/\s+/).filter(Boolean);

    const comScores = resultados
      .map((inst) => ({
        inst,
        score: calcularScore(inst, termos),
      }))
      .filter((item) => item.score > 0);

    comScores.sort((a, b) => b.score - a.score);
    return comScores.slice(0, limite).map((item) => item.inst);
  }

  return resultados.slice(0, limite);
}

/**
 * Obtém lista única de cidades disponíveis na base carregada para autocompletar.
 */
export async function obterCidadesDisponiveis(paisIso: string, regiao?: string): Promise<string[]> {
  const lista = await carregarBasePais(paisIso);
  const cidades = new Set<string>();

  for (const inst of lista) {
    if (!inst.cidade) continue;
    if (regiao && normalizarTexto(inst.regiao) !== normalizarTexto(regiao)) {
      continue;
    }
    cidades.add(inst.cidade);
  }

  return Array.from(cidades).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/**
 * Obtém lista única de regiões/estados disponíveis para o país.
 */
export async function obterRegioesDisponiveis(paisIso: string): Promise<string[]> {
  const codigo = paisIso.toUpperCase();
  if (codigo === "BR") {
    return UFS_BRASIL.map((uf) => uf.sigla);
  }

  const lista = await carregarBasePais(codigo);
  const regioes = new Set<string>();
  for (const inst of lista) {
    if (inst.regiao) regioes.add(inst.regiao);
  }

  return Array.from(regioes).sort((a, b) => a.localeCompare(b));
}
