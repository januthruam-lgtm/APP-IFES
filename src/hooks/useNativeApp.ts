import { useState, useEffect, useCallback } from "react";
import {
  isInstalledApp,
  APP_INSTALLED_STORAGE_KEY,
  isDontShowInstallPrompt,
  checkInstalledRelatedApps,
} from "../utils/pwaInstall";

export interface NativeAppInfo {
  isStandalone: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  isFullscreen: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  promptEvent: unknown;
  triggerInstall: () => Promise<"accepted" | "dismissed" | "manual_needed">;
  toggleFullscreen: () => void;
  hidePermanently: () => void;
}

let globalPromptEvent: unknown = null;

// Só registrar ouvinte global se ainda NÃO estiver instalado
if (typeof window !== "undefined" && !isInstalledApp()) {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    if (isInstalledApp()) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    globalPromptEvent = e;
    window.dispatchEvent(new CustomEvent("native_install_prompt_ready"));
  });

  window.addEventListener("appinstalled", () => {
    try {
      localStorage.setItem(APP_INSTALLED_STORAGE_KEY, "true");
    } catch {}
    globalPromptEvent = null;
    window.dispatchEvent(new CustomEvent("native_app_installed_event"));
  });
}

export function useNativeApp(): NativeAppInfo {
  const [installed, setInstalled] = useState<boolean>(() => isInstalledApp());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [promptEvent, setPromptEvent] = useState<unknown>(() => (installed ? null : globalPromptEvent));
  const [dismissedPrompt, setDismissedPrompt] = useState<boolean>(() => isDontShowInstallPrompt());

  useEffect(() => {
    // Se já estiver instalado, encerra sem ouvintes
    if (isInstalledApp()) {
      setInstalled(true);
      setPromptEvent(null);
      return;
    }

    checkInstalledRelatedApps().then((isRel) => {
      if (isRel) {
        setInstalled(true);
        setPromptEvent(null);
      }
    });

    const checkFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const handleBeforeInstall = (e: Event) => {
      if (isInstalledApp()) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      globalPromptEvent = e;
      setPromptEvent(e);
    };

    const handlePromptReady = () => {
      if (!isInstalledApp()) {
        setPromptEvent(globalPromptEvent);
      }
    };

    const handleAppInstalled = () => {
      try {
        localStorage.setItem(APP_INSTALLED_STORAGE_KEY, "true");
      } catch {}
      setInstalled(true);
      globalPromptEvent = null;
      setPromptEvent(null);
    };

    window.addEventListener("fullscreenchange", checkFullscreen);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("native_install_prompt_ready", handlePromptReady);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("native_app_installed_event", handleAppInstalled);

    return () => {
      window.removeEventListener("fullscreenchange", checkFullscreen);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("native_install_prompt_ready", handlePromptReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("native_app_installed_event", handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "manual_needed"> => {
    const event = (promptEvent || globalPromptEvent) as {
      prompt?: () => Promise<void>;
      userChoice?: Promise<{ outcome: string }>;
    } | null;

    if (event && typeof event.prompt === "function") {
      try {
        await event.prompt();
        const choice = await event.userChoice;
        if (choice?.outcome === "accepted") {
          try {
            localStorage.setItem(APP_INSTALLED_STORAGE_KEY, "true");
          } catch {}
          setInstalled(true);
          setPromptEvent(null);
          return "accepted";
        }
        return "dismissed";
      } catch (err) {
        console.warn("Native prompt error:", err);
      }
    }
    return "manual_needed";
  }, [promptEvent]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  }, []);

  const hidePermanently = useCallback(() => {
    setDismissedPrompt(true);
  }, []);

  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const isDesktop = typeof navigator !== "undefined" && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const canInstall = !installed && !dismissedPrompt && Boolean(promptEvent);

  return {
    isStandalone: installed,
    isInstalled: installed,
    canInstall,
    isFullscreen,
    isAndroid,
    isDesktop,
    promptEvent,
    triggerInstall,
    toggleFullscreen,
    hidePermanently,
  };
}
