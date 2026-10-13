import { CustomThemeColors } from "../types";

export const DEFAULT_PAPER_THEME: CustomThemeColors = {
  id: "paper",
  name: "Papel & Foco (IFES)",
  bgPrimary: "#f8f9fa",
  bgCard: "#ffffff",
  bgCardHover: "#f1f3f5",
  textPrimary: "#1e293b",
  textMuted: "#64748b",
  colorPrimary: "#15803d", // IFES Green
  colorPrimaryHover: "#166534",
  colorSuccess: "#10b981",
  colorAccent: "#dc2626", // IFES Red accent
  borderColor: "#e2e8f0",
  isDark: false,
};

export const PRESET_THEMES: CustomThemeColors[] = [
  DEFAULT_PAPER_THEME,
  {
    id: "default",
    name: "Estúdio Índigo",
    bgPrimary: "#0f172a",
    bgCard: "#1e293b",
    bgCardHover: "#334155",
    textPrimary: "#f8fafc",
    textMuted: "#94a3b8",
    colorPrimary: "#6366f1",
    colorPrimaryHover: "#4f46e5",
    colorSuccess: "#10b981",
    colorAccent: "#ec4899",
    borderColor: "#334155",
    isDark: true,
  },
  {
    id: "cyberpunk",
    name: "Cyber Neon",
    bgPrimary: "#0d0221",
    bgCard: "#190033",
    bgCardHover: "#26004d",
    textPrimary: "#00f0ff",
    textMuted: "#a78bfa",
    colorPrimary: "#00f0ff",
    colorPrimaryHover: "#00c4d4",
    colorSuccess: "#00ff66",
    colorAccent: "#ff007f",
    borderColor: "#4a0072",
    isDark: true,
  },
  {
    id: "solar",
    name: "Solar Dourado",
    bgPrimary: "#fffbeb",
    bgCard: "#ffffff",
    bgCardHover: "#fef3c7",
    textPrimary: "#78350f",
    textMuted: "#92400e",
    colorPrimary: "#d97706",
    colorPrimaryHover: "#b45309",
    colorSuccess: "#059669",
    colorAccent: "#ea580c",
    borderColor: "#fde68a",
    isDark: false,
  },
  {
    id: "emerald",
    name: "Esmeralda Acadêmico",
    bgPrimary: "#064e3b",
    bgCard: "#065f46",
    bgCardHover: "#047857",
    textPrimary: "#ecfdf5",
    textMuted: "#a7f3d0",
    colorPrimary: "#34d399",
    colorPrimaryHover: "#10b981",
    colorSuccess: "#6ee7b7",
    colorAccent: "#fbbf24",
    borderColor: "#047857",
    isDark: true,
  },
  {
    id: "dark",
    name: "Obsidian Puro",
    bgPrimary: "#09090b",
    bgCard: "#18181b",
    bgCardHover: "#27272a",
    textPrimary: "#fafafa",
    textMuted: "#a1a1aa",
    colorPrimary: "#38bdf8",
    colorPrimaryHover: "#0284c7",
    colorSuccess: "#22c55e",
    colorAccent: "#f43f5e",
    borderColor: "#27272a",
    isDark: true,
  },
];

export function loadSavedTheme(): CustomThemeColors {
  try {
    const saved = localStorage.getItem("brain_studio_theme_custom");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Error loading saved theme:", e);
  }
  return DEFAULT_PAPER_THEME;
}

export function saveTheme(theme: CustomThemeColors): void {
  try {
    localStorage.setItem("brain_studio_theme_custom", JSON.stringify(theme));
  } catch (e) {
    console.warn("Error saving theme:", e);
  }
}

export function applyThemeToDOM(theme: CustomThemeColors): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.setProperty("--app-bg", theme.bgPrimary);
  root.style.setProperty("--app-card", theme.bgCard);
  root.style.setProperty("--app-card-hover", theme.bgCardHover);
  root.style.setProperty("--app-text", theme.textPrimary);
  root.style.setProperty("--app-text-muted", theme.textMuted);
  root.style.setProperty("--app-primary", theme.colorPrimary);
  root.style.setProperty("--app-primary-hover", theme.colorPrimaryHover);
  root.style.setProperty("--app-success", theme.colorSuccess);
  root.style.setProperty("--app-accent", theme.colorAccent);
  root.style.setProperty("--app-border", theme.borderColor);

  if (theme.isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}
