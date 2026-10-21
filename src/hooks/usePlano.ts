import { useMemo } from "react";
import { UserProfile } from "../types";
import { PLANOS, PlanoConfig, PlanoId } from "../types/planos";

export { PLANOS };
export type { PlanoConfig, PlanoId };

export function temAcesso(
  planoId: PlanoId | undefined | string,
  feature: keyof PlanoConfig["limites"]
): boolean {
  const plano = PLANOS.find((p) => p.id === planoId) || PLANOS[0];
  const valor = plano.limites[feature];

  if (typeof valor === "boolean") return valor;
  if (typeof valor === "number") return valor === -1 || valor > 0;
  return false;
}

export function usePlano(user?: UserProfile | null) {
  const currentPlanoId: PlanoId = (user as any)?.plano || ((user as any)?.isPro ? "pro_mensal" : "gratuito");

  const planoAtual = useMemo(() => {
    return PLANOS.find((p) => p.id === currentPlanoId) || PLANOS[0];
  }, [currentPlanoId]);

  const isPro = planoAtual.id !== "gratuito";

  const verificarAcesso = (feature: keyof PlanoConfig["limites"]): boolean => {
    return temAcesso(currentPlanoId, feature);
  };

  const obterLimite = (feature: keyof PlanoConfig["limites"]): number => {
    const val = planoAtual.limites[feature];
    return typeof val === "number" ? val : 0;
  };

  return {
    plano: planoAtual,
    planoId: planoAtual.id,
    isPro,
    temAcesso: verificarAcesso,
    obterLimite,
    planosDisponiveis: PLANOS,
  };
}
