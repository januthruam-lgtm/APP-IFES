import { Capacitor } from "@capacitor/core";

export const APP_INSTALLED_STORAGE_KEY = "brain_studio_app_installed";
export const DONT_SHOW_INSTALL_STORAGE_KEY = "brain_studio_dont_show_install";

/**
 * Retorna true se o app estiver instalado ou rodando nativamente:
 * 1. Capacitor.isNativePlatform()
 * 2. matchMedia "(display-mode: standalone)", "fullscreen" ou "minimal-ui"
 * 3. navigator.standalone === true (iOS)
 * 4. document.referrer começar com "android-app://"
 * 5. Marca gravada pelo evento appinstalled no localStorage
 * 6. navigator.getInstalledRelatedApps indicar instalado
 */
export function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false;

  // 1. Capacitor APK nativo
  try {
    if (typeof Capacitor !== "undefined" && typeof Capacitor.isNativePlatform === "function" && Capacitor.isNativePlatform()) {
      return true;
    }
  } catch {}

  // 2. matchMedia display-mode
  try {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches
    ) {
      return true;
    }
  } catch {}

  // 3. navigator.standalone (iOS Safari PWA)
  try {
    if ((window.navigator as unknown as { standalone?: boolean })?.standalone === true) {
      return true;
    }
  } catch {}

  // 4. document.referrer começando com android-app://
  try {
    if (typeof document !== "undefined" && document.referrer && document.referrer.startsWith("android-app://")) {
      return true;
    }
  } catch {}

  // 5. Marca do evento appinstalled gravada
  try {
    if (localStorage.getItem(APP_INSTALLED_STORAGE_KEY) === "true") {
      return true;
    }
  } catch {}

  return false;
}

/**
 * Consulta assíncrona getInstalledRelatedApps se suportado pelo navegador
 */
export async function checkInstalledRelatedApps(): Promise<boolean> {
  if (typeof navigator !== "undefined" && "getInstalledRelatedApps" in navigator) {
    try {
      const related = await (navigator as unknown as { getInstalledRelatedApps: () => Promise<unknown[]> }).getInstalledRelatedApps();
      if (Array.isArray(related) && related.length > 0) {
        try {
          localStorage.setItem(APP_INSTALLED_STORAGE_KEY, "true");
        } catch {}
        return true;
      }
    } catch {}
  }
  return false;
}

/**
 * Marca que o usuário optou por não ver mais o aviso de instalação
 */
export function setDontShowInstallPrompt(): void {
  try {
    localStorage.setItem(DONT_SHOW_INSTALL_STORAGE_KEY, "true");
  } catch {}
}

export function isDontShowInstallPrompt(): boolean {
  try {
    return localStorage.getItem(DONT_SHOW_INSTALL_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}
