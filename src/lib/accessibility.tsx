import React, { createContext, useContext, useState, useEffect } from "react";

export type TextScale = "default" | "large" | "larger" | "max";
export type ColorBlindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";

export interface AccessibilitySettings {
  screenReaderAuto: boolean;
  speechRate: number; // 0.5 - 2.0
  speechPitch: number; // 0.8 - 1.2
  speechVolume: number; // 0 - 1.0
  textSize: TextScale;
  dyslexicFont: boolean;
  highContrast: boolean;
  colorBlindness: ColorBlindMode;
  reducedMotion: boolean;
  reduceTransparency: boolean;
  largeButtons: boolean;
  plainLanguage: boolean;
  focusMode: boolean;
  librasEnabled: boolean;
}

const STORAGE_KEY = "brain_studio_accessibility_v1";

const DEFAULT_SETTINGS: AccessibilitySettings = {
  screenReaderAuto: false,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 1.0,
  textSize: "default",
  dyslexicFont: false,
  highContrast: false,
  colorBlindness: "none",
  reducedMotion: false,
  reduceTransparency: false,
  largeButtons: false,
  plainLanguage: false,
  focusMode: false,
  librasEnabled: false,
};

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  resetDefaults: () => void;
  isReducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

function getInitialSettings(): AccessibilitySettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  let initial = { ...DEFAULT_SETTINGS };

  // Detectar preferências do sistema operacional
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      initial.reducedMotion = true;
    }
    if (window.matchMedia("(prefers-contrast: more)").matches) {
      initial.highContrast = true;
    }
  } catch {}

  // Carregar preferências salvas pelo usuário
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      initial = { ...initial, ...JSON.parse(saved) };
    }
  } catch {}

  return initial;
}

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(getInitialSettings);

  // Aplica classes e variáveis CSS na tag <html> antes e durante a navegação
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Tamanho do texto
    root.setAttribute("data-font-scale", settings.textSize);

    // Alto contraste
    if (settings.highContrast) {
      root.setAttribute("data-contrast", "high");
    } else {
      root.removeAttribute("data-contrast");
    }

    // Daltonismo
    if (settings.colorBlindness !== "none") {
      root.setAttribute("data-colorblind", settings.colorBlindness);
    } else {
      root.removeAttribute("data-colorblind");
    }

    // Redução de movimento
    if (settings.reducedMotion) {
      root.setAttribute("data-reduce-motion", "true");
    } else {
      root.removeAttribute("data-reduce-motion");
    }

    // Fonte dislexia
    if (settings.dyslexicFont) {
      root.setAttribute("data-dyslexic", "true");
    } else {
      root.removeAttribute("data-dyslexic");
    }

    // Reduzir transparências
    if (settings.reduceTransparency) {
      root.setAttribute("data-transparency", "solid");
    } else {
      root.removeAttribute("data-transparency");
    }

    // Alvos de toque grandes
    if (settings.largeButtons) {
      root.setAttribute("data-large-touch", "true");
    } else {
      root.removeAttribute("data-large-touch");
    }

    // Modo Foco
    if (settings.focusMode) {
      root.setAttribute("data-focus-mode", "active");
    } else {
      root.removeAttribute("data-focus-mode");
    }

    // Salvar no localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Carregamento dinâmico e seguro do VLibras quando ativado
  useEffect(() => {
    if (!settings.librasEnabled || typeof window === "undefined") return;

    const existingScript = document.getElementById("vlibras-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "vlibras-script";
      script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
      script.async = true;
      script.onload = () => {
        try {
          // @ts-ignore
          if (window.VLibras && window.VLibras.Widget) {
            // @ts-ignore
            new window.VLibras.Widget("https://vlibras.gov.br/app");
          }
        } catch (err) {
          console.warn("Inicialização VLibras:", err);
        }
      };
      document.body.appendChild(script);
    }
  }, [settings.librasEnabled]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetDefaults = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetDefaults,
        isReducedMotion: settings.reducedMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    return {
      settings: DEFAULT_SETTINGS,
      updateSetting: () => {},
      resetDefaults: () => {},
      isReducedMotion: false,
    };
  }
  return context;
}
