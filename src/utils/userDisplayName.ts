/**
 * userDisplayName.ts
 * Utilitário de sanitização e proteção de identidade (Bloco 17)
 * Garante que matrículas (ex: 20251adig0343), logins e e-mails nunca sejam exibidos como nome de exibição.
 */

import { UserProfile } from "../types";

const MATRICULA_REGEX = /^(?:\d{4,}[a-zA-Z0-9]*|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\d{6,})$/i;

/**
 * Verifica se uma string corresponde a uma matrícula institucional, login de sistema ou e-mail.
 */
export function isMatriculaOuLogin(valor?: string | null): boolean {
  if (!valor || typeof valor !== "string") return false;
  const limpo = valor.trim();
  if (limpo.length === 0) return false;
  // E-mail
  if (limpo.includes("@")) return true;
  // Matrícula IFES comum: ex: 20241..., 20251adig0343, 2023..., etc.
  if (MATRICULA_REGEX.test(limpo)) return true;
  // Começa com ano (2020-2030) e contém letras/números sem espaços
  if (/^20[123]\d[a-zA-Z0-9]+$/.test(limpo)) return true;
  // Apenas dígitos numéricos com mais de 5 caracteres
  if (/^\d{5,}$/.test(limpo)) return true;
  return false;
}

/**
 * Retorna o nome seguro e amigável para exibição em qualquer tela, cabeçalho ou saudação.
 * Nunca retorna matrícula, login ou e-mail.
 */
export function getSafeDisplayName(user?: Partial<UserProfile> | null, defaultFallback = "Estudante"): string {
  if (!user) return defaultFallback;

  // Se o usuário tiver apelido cadastrado expressamente ("Como quer ser chamado?")
  const apelido = (user as any).nickname || (user as any).apelido;
  if (apelido && typeof apelido === "string" && !isMatriculaOuLogin(apelido)) {
    return apelido.trim();
  }

  // Se tiver nome e não for matrícula/login
  if (user.name && typeof user.name === "string") {
    const nomeLimpo = user.name.trim();
    if (!isMatriculaOuLogin(nomeLimpo)) {
      // Se for nome completo (ex: "Maria Santos"), retorna o primeiro nome para saudações e cards
      const primeiroNome = nomeLimpo.split(" ")[0];
      if (primeiroNome && primeiroNome.length > 1) {
        return primeiroNome;
      }
    }
  }

  return defaultFallback;
}

/**
 * Retorna o nome completo seguro para a tela de Conta/Perfil.
 */
export function getSafeFullName(user?: Partial<UserProfile> | null, defaultFallback = "Estudante IFES"): string {
  if (!user) return defaultFallback;

  const apelido = (user as any).nickname || (user as any).apelido;
  if (apelido && !isMatriculaOuLogin(apelido)) {
    return apelido.trim();
  }

  if (user.name && typeof user.name === "string") {
    const nomeLimpo = user.name.trim();
    if (!isMatriculaOuLogin(nomeLimpo)) {
      return nomeLimpo;
    }
  }

  return defaultFallback;
}

/**
 * Retorna a inicial segura para avatar.
 */
export function getSafeInitial(user?: Partial<UserProfile> | null): string {
  const nome = getSafeDisplayName(user, "Estudante");
  return nome.charAt(0).toUpperCase() || "E";
}

/**
 * Retorna o nome social seguro para ligas, equipes e duelos (sem identificar menores).
 */
export function getSafeSocialName(user?: Partial<UserProfile> | null): string {
  return getSafeDisplayName(user, "Estudante");
}
