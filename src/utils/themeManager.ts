import { CustomThemeColors } from "../types";
import {
  FullDerivedTheme,
  PRESET_PALETTES,
  deriveFullPalette,
} from "./paletteDerivation";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { saveUserProfileToFirestore } from "../lib/firebase";

export const SAVED_PALETTES_STORAGE_KEY = "brain_studio_saved_palettes_v1";
export const ACTIVE_THEME_STORAGE_KEY = "brain_studio_theme_custom";

export function loadSavedPalettes(): FullDerivedTheme[] {
  try {
    const raw = localStorage.getItem(SAVED_PALETTES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Erro ao carregar paletas salvas:", e);
  }
  return [...PRESET_PALETTES];
}

export function saveUserPalettes(palettes: FullDerivedTheme[]): void {
  try {
    // Limite de 10 paletas personalizadas
    const limited = palettes.slice(0, 10);
    localStorage.setItem(SAVED_PALETTES_STORAGE_KEY, JSON.stringify(limited));
  } catch (e) {
    console.warn("Erro ao salvar paletas:", e);
  }
}

export function loadSavedTheme(): CustomThemeColors {
  try {
    const saved = localStorage.getItem(ACTIVE_THEME_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Error loading saved theme:", e);
  }
  // Padrão Índigo Noturno
  return fullThemeToCustomTheme(PRESET_PALETTES[0]);
}

export function fullThemeToCustomTheme(theme: FullDerivedTheme): CustomThemeColors {
  return {
    id: theme.id,
    name: theme.name,
    bgPrimary: theme.bg,
    bgCard: theme.surface,
    bgCardHover: theme.bgCardHover,
    textPrimary: theme.text,
    textMuted: theme.textMuted,
    colorPrimary: theme.primary,
    colorPrimaryHover: theme.colorPrimaryHover,
    colorSuccess: theme.colorSuccess,
    colorAccent: theme.secondary,
    borderColor: theme.borderColor,
    isDark: theme.isDark,
  };
}

export const PRESET_THEMES: CustomThemeColors[] = PRESET_PALETTES.map(fullThemeToCustomTheme);
export const DEFAULT_PAPER_THEME: CustomThemeColors = PRESET_THEMES[5] || PRESET_THEMES[0];


export function saveTheme(theme: CustomThemeColors, userId?: string): void {
  try {
    localStorage.setItem(ACTIVE_THEME_STORAGE_KEY, JSON.stringify(theme));
    if (userId) {
      saveUserProfileToFirestore(userId, {
        activeTheme: theme.id,
      }).catch(() => {});
    }
  } catch (e) {
    console.warn("Error saving theme:", e);
  }
}

export function applyThemeToDOM(theme: CustomThemeColors): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Variáveis essenciais de cor
  root.style.setProperty("--app-bg", theme.bgPrimary);
  root.style.setProperty("--app-card", theme.bgCard);
  root.style.setProperty("--app-card-secondary", theme.bgCardHover || theme.bgCard);
  root.style.setProperty("--app-card-hover", theme.bgCardHover || theme.bgCard);
  root.style.setProperty("--app-text", theme.textPrimary);
  root.style.setProperty("--app-text-muted", theme.textMuted);
  root.style.setProperty("--app-primary", theme.colorPrimary);
  root.style.setProperty("--app-primary-hover", theme.colorPrimaryHover || theme.colorPrimary);
  root.style.setProperty("--app-success", theme.colorSuccess);
  root.style.setProperty("--app-accent", theme.colorAccent);
  root.style.setProperty("--app-border", theme.borderColor);

  // Botão primário texto de contraste
  root.style.setProperty(
    "--btn-primary-text",
    theme.isDark ? "#ffffff" : "#ffffff"
  );

  // Classe dark para Tailwind
  if (theme.isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // 1. Sincroniza meta theme-color do HTML
  try {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", theme.bgCard || theme.bgPrimary);
  } catch {}

  // 2. Sincroniza StatusBar nativa no Android via Capacitor
  try {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setBackgroundColor({ color: theme.bgCard || theme.bgPrimary }).catch(() => {});
      StatusBar.setStyle({ style: theme.isDark ? Style.Dark : Style.Light }).catch(() => {});
    }
  } catch {}
}
