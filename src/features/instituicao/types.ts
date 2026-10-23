/**
 * Brain Studio - Tipos Oficiais de Instituições e Conexões (Fase 7)
 */

import { TipoSistemaNota } from "../../config/notas.config";

export type TipoInstituicao = "basica" | "tecnica" | "superior" | "idiomas" | "outra";
export type RedeInstituicao = "federal" | "estadual" | "municipal" | "privada" | "publica" | "outra" | null;

export interface CodigosOficiais {
  inep?: string;
  emec?: string;
  ror?: string;
}

export interface Instituicao {
  id: string; // estável
  nome: string;
  nomesAlternativos?: string[];
  sigla?: string;
  tipo: TipoInstituicao;
  rede: RedeInstituicao;
  pais: string; // ISO 3166-1 alfa-2 (ex: BR, PT, US)
  regiao?: string; // UF ou Estado/Província
  cidade?: string;
  site?: string;
  codigos?: CodigosOficiais;
  fonte: string; // "Inep/MEC" | "e-MEC" | "ROR" | "Manual"
  importadoEm: string; // ISO string
}

export interface InstituicaoIndexItem {
  id: string;
  nome: string;
  nomeNormalizado: string;
  sigla?: string;
  siglaNormalizada?: string;
  tipo: TipoInstituicao;
  rede?: RedeInstituicao;
  pais: string;
  regiao?: string;
  cidade?: string;
  site?: string;
}

export interface PerfilInstituicaoUsuario {
  instituicaoId: string;
  nome: string;
  sigla?: string;
  tipo?: TipoInstituicao;
  pais: string;
  regiao?: string;
  cidade?: string;
  nivelId: string;
  cursoOuSerie: string;
  sistemaNotaId: TipoSistemaNota;
  periodoId?: string;
  confirmada: boolean;
  atualizadoEm: number;
}

export interface AtalhoWebInstitucional {
  id: string;
  titulo: string;
  url: string;
  icone?: string;
  categoria?: "portal" | "biblioteca" | "financeiro" | "calendario" | "outro";
}

export interface SistemaConectadoUsuario {
  id: string;
  conectorId: string; // moodle, google_classroom, etc.
  nome: string;
  tipo: string;
  url?: string;
  status: "conectado" | "erro" | "desconectado" | "pendente";
  ultimaSincronizacao?: number;
  erro?: string;
  dataConexao: number;
  disciplinasImportadas?: number;
  tarefasImportadas?: number;
}

export interface CadastroManualInput {
  nome: string;
  pais: string;
  regiao?: string;
  cidade?: string;
  tipo: TipoInstituicao;
  site?: string;
}

export interface InstituicaoPendenteDoc extends CadastroManualInput {
  id: string;
  criadoPorUid: string;
  criadoEm: number;
  status: "pendente" | "aprovada" | "rejeitada";
  revisadoPor?: string;
  revisadoEm?: number;
  motivoRejeicao?: string;
  mescladoComId?: string;
}
