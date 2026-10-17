// Feature Flags de Monetização e Recursos Avançados
// Conforme especificado, TODAS as flags iniciam como FALSE por padrão.
// Nenhuma cobrança ou bloqueio ativo até serem expressamente habilitadas.

export interface AppFeatureFlags {
  PAYWALL_ENABLED: boolean;
  PRO_UPGRADE_ENABLED: boolean;
  COSMETIC_STORE_ENABLED: boolean;
  REWARDED_ADS_ENABLED: boolean;
  INSTITUTIONAL_DASHBOARD_ENABLED: boolean;
  SPONSORED_CHALLENGES_ENABLED: boolean;
}

const STORAGE_KEY = "brain_studio_feature_flags_v1";

const DEFAULT_FLAGS: AppFeatureFlags = {
  PAYWALL_ENABLED: false,
  PRO_UPGRADE_ENABLED: false,
  COSMETIC_STORE_ENABLED: false,
  REWARDED_ADS_ENABLED: false,
  INSTITUTIONAL_DASHBOARD_ENABLED: false,
  SPONSORED_CHALLENGES_ENABLED: false,
};

export function getFeatureFlags(): AppFeatureFlags {
  if (typeof window === "undefined") return { ...DEFAULT_FLAGS };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...DEFAULT_FLAGS };
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_FLAGS, ...parsed };
  } catch {
    return { ...DEFAULT_FLAGS };
  }
}

export function setFeatureFlag<K extends keyof AppFeatureFlags>(
  key: K,
  value: AppFeatureFlags[K]
): AppFeatureFlags {
  const current = getFeatureFlags();
  const next = { ...current, [key]: value };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("brain_studio_flags_updated", { detail: next }));
  } catch {
    // Local storage indisponível
  }
  return next;
}

export const flags = getFeatureFlags();
