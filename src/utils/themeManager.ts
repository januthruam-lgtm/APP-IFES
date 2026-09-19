import { CustomThemeColors } from "../types";

export const DEFAULT_THEME: CustomThemeColors = {
  id: "academico_clean",
  name: "Acadêmico Clean (Padrão Claro)",
  bgMain: "#f8fafc",
  bgPrimary: "#f8fafc",
  bgCard: "#ffffff",
  bgCardSecondary: "#f1f5f9",
  bgCardHover: "#e2e8f0",
  textPrimary: "#0f172a",
  textMuted: "#475569",
  colorPrimary: "#15803d",
  colorPrimaryHover: "#166534",
  colorSuccess: "#15803d",
  colorAccent: "#0284c7",
  borderColor: "#e2e8f0",
  isDark: false,
};

export const THEME_PRESETS: CustomThemeColors[] = [
  {
    id: "academico_clean",
    name: "Acadêmico Clean (Padrão)",
    bgMain: "#f8fafc",
    bgPrimary: "#f8fafc",
    bgCard: "#ffffff",
    bgCardSecondary: "#f1f5f9",
    bgCardHover: "#e2e8f0",
    textPrimary: "#0f172a",
    textMuted: "#475569",
    colorPrimary: "#15803d",
    colorPrimaryHover: "#166534",
    colorSuccess: "#15803d",
    colorAccent: "#0284c7",
    borderColor: "#e2e8f0",
    isDark: false,
  },
  {
    id: "luz_campus_ifes",
    name: "Luz do Câmpus IFES",
    bgMain: "#f0fdf4",
    bgPrimary: "#f0fdf4",
    bgCard: "#ffffff",
    bgCardSecondary: "#dcfce7",
    bgCardHover: "#bbf7d0",
    textPrimary: "#052e16",
    textMuted: "#166534",
    colorPrimary: "#006633",
    colorPrimaryHover: "#004d26",
    colorSuccess: "#15803d",
    colorAccent: "#d97706",
    borderColor: "#bbf7d0",
    isDark: false,
  },
  {
    id: "alvorada_minimalista",
    name: "Alvorada Minimalista",
    bgMain: "#fafaf9",
    bgPrimary: "#fafaf9",
    bgCard: "#ffffff",
    bgCardSecondary: "#f5f5f4",
    bgCardHover: "#e7e5e4",
    textPrimary: "#1c1917",
    textMuted: "#57534e",
    colorPrimary: "#4f46e5",
    colorPrimaryHover: "#4338ca",
    colorSuccess: "#16a34a",
    colorAccent: "#ea580c",
    borderColor: "#e7e5e4",
    isDark: false,
  },
  {
    id: "ifes_noturno",
    name: "IFES Noturno Calibrado",
    bgMain: "#0b0f19",
    bgPrimary: "#0b0f19",
    bgCard: "#131b2e",
    bgCardSecondary: "#1e293b",
    bgCardHover: "#283548",
    textPrimary: "#f8fafc",
    textMuted: "#94a3b8",
    colorPrimary: "#22c55e",
    colorPrimaryHover: "#16a34a",
    colorSuccess: "#10b981",
    colorAccent: "#38bdf8",
    borderColor: "rgba(255, 255, 255, 0.12)",
    isDark: true,
  },
  {
    id: "paper_focus_dark",
    name: "Paper & Focus (Escuro)",
    bgMain: "#0f172a",
    bgPrimary: "#0f172a",
    bgCard: "#1e293b",
    bgCardSecondary: "#334155",
    bgCardHover: "#283548",
    textPrimary: "#f8fafc",
    textMuted: "#94a3b8",
    colorPrimary: "#6366f1",
    colorPrimaryHover: "#4f46e5",
    colorSuccess: "#10b981",
    colorAccent: "#38bdf8",
    borderColor: "rgba(255, 255, 255, 0.1)",
    isDark: true,
  },
];

const STORAGE_KEY = "brain_studio_custom_theme_v2";

export function loadSavedTheme(): CustomThemeColors {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_THEME, ...parsed };
    }
  } catch (e) {
    console.warn("Error loading saved theme:", e);
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme: CustomThemeColors): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    console.warn("Error saving theme:", e);
  }
}

export function applyThemeToDOM(theme: CustomThemeColors): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const mainBg = theme.bgMain || theme.bgPrimary || "#0f172a";
  const cardBg = theme.bgCard || "#1e293b";
  const cardSecBg = theme.bgCardSecondary || "#334155";
  const textPrimary = theme.textPrimary || "#f8fafc";
  const textMuted = theme.textMuted || "#94a3b8";

  // Set CSS variables that apply globally across all pages and components
  root.style.setProperty("--bg-color", mainBg);
  root.style.setProperty("--bg-main", mainBg);
  root.style.setProperty("--bg-card", cardBg);
  root.style.setProperty("--bg-card-secondary", cardSecBg);
  root.style.setProperty("--bg-card-hover", theme.bgCardHover || cardSecBg);
  root.style.setProperty("--text-color", textPrimary);
  root.style.setProperty("--text-primary", textPrimary);
  root.style.setProperty("--text-muted", textMuted);
  root.style.setProperty("--text-secondary", textMuted);
  root.style.setProperty("--btn-primary", theme.colorPrimary);
  root.style.setProperty("--btn-primary-text", "#ffffff");
  root.style.setProperty("--btn-primary-hover", theme.colorPrimaryHover);
  root.style.setProperty("--color-success", theme.colorSuccess);
  root.style.setProperty("--color-accent", theme.colorAccent);
  root.style.setProperty("--border-color", theme.borderColor);
  root.style.setProperty("--border-subtle", theme.borderColor);

  // Essential --app-* CSS variables used across Header, Sidebar, and App Pages
  root.style.setProperty("--app-bg", mainBg);
  root.style.setProperty("--app-card", cardBg);
  root.style.setProperty("--app-card-secondary", cardSecBg);
  root.style.setProperty("--app-card-hover", theme.bgCardHover || cardSecBg);
  root.style.setProperty("--app-text", textPrimary);
  root.style.setProperty("--app-text-muted", textMuted);
  root.style.setProperty("--app-primary", theme.colorPrimary);
  root.style.setProperty("--app-primary-hover", theme.colorPrimaryHover);
  root.style.setProperty("--app-border", theme.borderColor);
  root.style.setProperty("--app-success", theme.colorSuccess);
  root.style.setProperty("--app-accent", theme.colorAccent);

  // Set body background and color directly
  document.body.style.backgroundColor = mainBg;
  document.body.style.color = textPrimary;

  if (theme.isDark !== false) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Dispatch custom event for reactive UI update
  window.dispatchEvent(new CustomEvent("brain_studio_theme_changed", { detail: theme }));
}
