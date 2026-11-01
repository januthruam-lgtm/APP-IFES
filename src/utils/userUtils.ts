/**
 * Brain Studio - Utilitários de Identidade e Sessão Canônica do Usuário
 * Garante compatibilidade e integridade entre instâncias locais (offline)
 * e o banco de dados remoto (Firebase Firestore).
 */

import { UserProfile } from "../types";

/**
 * Retorna o identificador de usuário canônico para persistência local e no Firestore.
 * Normaliza variações legadas ("local-user", "local-student" -> "local_user").
 */
export function getEffectiveUserId(user?: Partial<UserProfile> | string | null): string {
  if (typeof user === "string") {
    const trimmed = user.trim();
    if (
      !trimmed ||
      trimmed === "local-user" ||
      trimmed === "local-student" ||
      trimmed === "local_student"
    ) {
      return "local_user";
    }
    return trimmed;
  }

  if (!user) return "local_user";

  const resolved =
    user.id ||
    user.uid ||
    user.email ||
    (user as any).ifesAccount?.matricula ||
    "local_user";

  if (
    resolved === "local-user" ||
    resolved === "local-student" ||
    resolved === "local_student" ||
    !resolved
  ) {
    return "local_user";
  }

  return resolved;
}
