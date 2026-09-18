import { CustomThemeColors } from "../types";

export const DEFAULT_THEME: CustomThemeColors = {
  id: "paper_focus",
  name: "Paper & Focus",
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
};

export const THEME_PRESETS: CustomThemeColors[] = [
  {
    id: "paper_focus",
    name: "Paper & Focus (Padrão)",
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
  {
    id: "cyber_ifes",
    name: "IFES Cyber Verde",
    bgMain: "#09140e",
    bgPrimary: "#09140e",
    bgCard: "#0f2319",
    bgCardSecondary: "#173627",
    bgCardHover: "#173c2a",
    textPrimary: "#f0fdf4",
    textMuted: "#86efac",
    colorPrimary: "#22c55e",
    colorPrimaryHover: "#16a34a",
    colorSuccess: "#4ade80",
    colorAccent: "#e2ff31",
    borderColor: "rgba(34, 197, 94, 0.2)",
    isDark: true,
  },
  {
    id: "midnight_indigo",
    name: "Meia-Noite Índigo",
    bgMain: "#0b0f19",
    bgPrimary: "#0b0f19",
    bgCard: "#111827",
    bgCardSecondary: "#1f2937",
    bgCardHover: "#1c2536",
    textPrimary: "#f9fafb",
    textMuted: "#9ca3af",
    colorPrimary: "#818cf8",
    colorPrimaryHover: "#6366f1",
    colorSuccess: "#34d399",
    colorAccent: "#a78bfa",
    borderColor: "rgba(255, 255, 255, 0.08)",
    isDark: true,
  },
  {
    id: "minimal_light",
    name: "Acadêmico Clean Claro",
    bgMain: "#f8fafc",
    bgPrimary: "#f8fafc",
    bgCard: "#ffffff",
    bgCardSecondary: "#f1f5f9",
    bgCardHover: "#e2e8f0",
    textPrimary: "#0f172a",
    textMuted: "#64748b",
    colorPrimary: "#0284c7",
    colorPrimaryHover: "#0369a1",
    colorSuccess: "#16a34a",
    colorAccent: "#f59e0b",
    borderColor: "rgba(0, 0, 0, 0.08)",
    isDark: false,
  },
  {
    id: "sakura_warm",
    name: "Sakura & Calmaria",
    bgMain: "#181116",
    bgPrimary: "#181116",
    bgCard: "#231821",
    bgCardSecondary: "#32222f",
    bgCardHover: "#3d2839",
    textPrimary: "#fdf2f8",
    textMuted: "#f472b6",
    colorPrimary: "#ec4899",
    colorPrimaryHover: "#db2777",
    colorSuccess: "#10b981",
    colorAccent: "#fb7185",
    borderColor: "rgba(236, 72, 153, 0.2)",
    isDark: true,
  },
  {
    id: "sunset_amber",
    name: "Sunset Âmbar",
    bgMain: "#14110d",
    bgPrimary: "#14110d",
    bgCard: "#211a13",
    bgCardSecondary: "#30261c",
    bgCardHover: "#3d2f21",
    textPrimary: "#fffbeb",
    textMuted: "#fcd34d",
    colorPrimary: "#f59e0b",
    colorPrimaryHover: "#d97706",
    colorSuccess: "#22c55e",
    colorAccent: "#fb923c",
    borderColor: "rgba(245, 158, 11, 0.2)",
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
