import { useState, useEffect, useCallback } from "react";

export interface NativeAppInfo {
  isStandalone: boolean;
  isFullscreen: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  promptEvent: any;
  triggerInstall: () => Promise<"accepted" | "dismissed" | "manual_needed">;
  toggleFullscreen: () => void;
}

let globalPromptEvent: any =
  (typeof window !== "undefined" && (window as any).__deferredInstallPrompt) || null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalPromptEvent = e;
    (window as any).__deferredInstallPrompt = e;
    window.dispatchEvent(new CustomEvent("native_install_prompt_ready"));
  });
}

export function useNativeApp(): NativeAppInfo {
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://") ||
      window.location.search.includes("mode=standalone")
    );
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [promptEvent, setPromptEvent] = useState<any>(() => {
    if (typeof window !== "undefined") {
      return (window as any).__deferredInstallPrompt || globalPromptEvent;
    }
    return null;
  });

  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      globalPromptEvent = e;
      (window as any).__deferredInstallPrompt = e;
      setPromptEvent(e);
    };

    const handlePromptReady = () => {
      setPromptEvent((window as any).__deferredInstallPrompt || globalPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      globalPromptEvent = null;
      (window as any).__deferredInstallPrompt = null;
      setPromptEvent(null);
    };

    window.addEventListener("fullscreenchange", checkFullscreen);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("native_install_prompt_ready", handlePromptReady);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("fullscreenchange", checkFullscreen);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("native_install_prompt_ready", handlePromptReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "manual_needed"> => {
    const event = promptEvent || (window as any).__deferredInstallPrompt || globalPromptEvent;
    if (event && typeof event.prompt === "function") {
      try {
        await event.prompt();
        const choice = await event.userChoice;
        if (choice?.outcome === "accepted") {
          setIsStandalone(true);
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
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen toggle error:", err);
    }
  }, []);

  const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
  const isDesktop =
    typeof navigator !== "undefined" && !/android|iphone|ipad|ipod/i.test(navigator.userAgent);

  return {
    isStandalone,
    isFullscreen,
    isAndroid,
    isDesktop,
    promptEvent,
    triggerInstall,
    toggleFullscreen,
  };
}
