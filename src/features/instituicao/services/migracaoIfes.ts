/**
 * Brain Studio - Migração Não Destrutiva de Usuários do IFES (Fase 7)
 * Permite a alunos legados do IFES confirmarem sua instituição em 1 toque
 * sem nenhuma perda de matérias, notas, XP, moedas ou progresso da cidade.
 */

import { PerfilInstituicaoUsuario } from "../types";

export const PERFIL_IFES_PADRAO: PerfilInstituicaoUsuario = {
  instituicaoId: "br-ifes-cefor",
  nome: "Instituto Federal do Espírito Santo - Campus Cefor",
  sigla: "IFES",
  tipo: "superior",
  pais: "BR",
  regiao: "ES",
  cidade: "Vitória",
  nivelId: "br_tecnico_integrado",
  cursoOuSerie: "Informática",
  sistemaNotaId: "0_a_100", // Média 60
  periodoId: "semestre",
  confirmada: true,
  atualizadoEm: Date.now(),
};

const STORAGE_CONFIRMACAO_MIGRACAO = "brain_ifes_migration_confirmed_v1";

/**
 * Detecta se o usuário atual é aluno do IFES e se ainda precisa confirmar sua instituição.
 */
export function precisaConfirmarInstituicao(usuario: any): boolean {
  if (!usuario) return false;

  // Se já confirmou a migração localmente
  try {
    if (localStorage.getItem(STORAGE_CONFIRMACAO_MIGRACAO) === "true") {
      return false;
    }
  } catch {}

  // Se o usuário já possui um perfil completo e confirmado gravado
  if (usuario.perfilInstituicao?.confirmada) {
    return false;
  }

  // Verifica se possui indicativos de conta IFES no perfil legado
  const temIndicadorIfes =
    usuario.ifesAccount ||
    usuario.campus ||
    usuario.matricula ||
    usuario.email?.includes("@ifes.edu.br") ||
    usuario.email?.includes("@aluno.ifes.edu.br");

  return Boolean(temIndicadorIfes);
}

/**
 * Confirma a instituição do IFES em 1 toque, preservando 100% dos dados.
 */
export function confirmarMigracaoIfesEmUmToque(
  campusNome = "Campus Cefor",
  cursoNome = "Informática"
): PerfilInstituicaoUsuario {
  const perfil: PerfilInstituicaoUsuario = {
    ...PERFIL_IFES_PADRAO,
    nome: `Instituto Federal do Espírito Santo - ${campusNome}`,
    cursoOuSerie: cursoNome,
    confirmada: true,
    atualizadoEm: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_CONFIRMACAO_MIGRACAO, "true");
    localStorage.setItem("brain_perfil_instituicao_v1", JSON.stringify(perfil));
  } catch {}

  return perfil;
}

/**
 * Carrega o perfil institucional atual do usuário (do cache local ou nulo).
 */
export function carregarPerfilInstituicaoLocal(): PerfilInstituicaoUsuario | null {
  try {
    const raw = localStorage.getItem("brain_perfil_instituicao_v1");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Salva ou remove o perfil institucional.
 */
export function salvarPerfilInstituicaoLocal(perfil: PerfilInstituicaoUsuario | null): void {
  try {
    if (perfil) {
      localStorage.setItem("brain_perfil_instituicao_v1", JSON.stringify(perfil));
      localStorage.setItem(STORAGE_CONFIRMACAO_MIGRACAO, "true");
    } else {
      localStorage.removeItem("brain_perfil_instituicao_v1");
      localStorage.removeItem(STORAGE_CONFIRMACAO_MIGRACAO);
    }
  } catch {}
}
