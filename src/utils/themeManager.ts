/**
 * Brain Studio - Sistema Central de Temas (Fase 2)
 * Regra Inegociável: Apenas DOIS temas (Claro e Escuro).
 * Sem cores personalizadas, sem sorteios, sem flicker no carregamento.
 */

import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { CustomThemeColors } from "../types";

export type TemaTipo = "claro" | "escuro";

export interface TemaPaleta extends CustomThemeColors {
  id: TemaTipo;
  name: string;
  nome: string;
  bg: string;
  card: string;
  borda: string;
  texto: string;
  textoSuave: string;
  primaria: string;
  primariaTexto: string;
  acento: string;
  sucesso: string;
  alerta: string;
  erro: string;
}

// 1. TEMA CLARO (Relaxante, sem branco puro, contraste estrito WCAG AA 4.5:1)
export const TEMA_CLARO: Readonly<TemaPaleta> = Object.freeze({
  id: "claro",
  name: "Claro",
  nome: "Claro",
  bg: "#EEF2EC",
  card: "#FBFAF5",
  borda: "#D9DFD3",
  texto: "#26332F",
  textoSuave: "#55645E",
  primaria: "#B8651A",
  primariaTexto: "#FFFFFF",
  acento: "#5F8F86",
  sucesso: "#3F7D58",
  alerta: "#B7791F",
  erro: "#B4443A",

  bgPrimary: "#EEF2EC",
  bgCard: "#FBFAF5",
  bgCardHover: "#E3E9E0",
  textPrimary: "#26332F",
  textMuted: "#55645E",
  colorPrimary: "#B8651A",
  colorPrimaryHover: "#9E5414",
  colorSuccess: "#3F7D58",
  colorAccent: "#5F8F86",
  borderColor: "#D9DFD3",
  isDark: false,
});

// 2. TEMA ESCURO (Confortável para a visão noturna, sem preto puro #000000)
export const TEMA_ESCURO: Readonly<TemaPaleta> = Object.freeze({
  id: "escuro",
  name: "Escuro",
  nome: "Escuro",
  bg: "#0F1518",
  card: "#182126",
  borda: "#263238",
  texto: "#E4ECE9",
  textoSuave: "#9FB0AA",
  primaria: "#F0A04B",
  primariaTexto: "#0F1518",
  acento: "#7FB5AB",
  sucesso: "#4E9A6F",
  alerta: "#D4902B",
  erro: "#D65A4F",

  bgPrimary: "#0F1518",
  bgCard: "#182126",
  bgCardHover: "#26353E",
  textPrimary: "#E4ECE9",
  textMuted: "#9FB0AA",
  colorPrimary: "#F0A04B",
  colorPrimaryHover: "#E08F35",
  colorSuccess: "#4E9A6F",
  colorAccent: "#7FB5AB",
  borderColor: "#263238",
  isDark: true,
});

/**
 * Obtém o tema ativo com migração automática de valores antigos inválidos.
 */
export function getTemaAtual(): TemaTipo {
  if (typeof window === "undefined") return "claro";

  try {
    const salvo = localStorage.getItem("tema");
    if (salvo === "claro" || salvo === "escuro") {
      return salvo;
    }

    // Se houver valor antigo do sistema v1, migra
    const antigo = localStorage.getItem("brain_studio_theme_custom");
    if (antigo) {
      localStorage.removeItem("brain_studio_theme_custom");
    }

    // Primeira abertura: segue a preferência do sistema operacional
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      localStorage.setItem("tema", "escuro");
      return "escuro";
    }
  } catch {}

  return "claro";
}

/**
 * Aplica o tema diretamente nas variáveis CSS do DOM e sincroniza theme-color e StatusBar nativa.
 */
export function aplicarTema(tema: TemaTipo): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const paleta = tema === "escuro" ? TEMA_ESCURO : TEMA_CLARO;

  // Atualiza classes e atributos de tema
  if (tema === "escuro") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "escuro");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "claro");
  }

  // Define todas as variáveis CSS oficiais do Brain Studio
  root.style.setProperty("--bg", paleta.bg);
  root.style.setProperty("--card", paleta.card);
  root.style.setProperty("--borda", paleta.borda);
  root.style.setProperty("--texto", paleta.texto);
  root.style.setProperty("--texto-suave", paleta.textoSuave);
  root.style.setProperty("--primaria", paleta.primaria);
  root.style.setProperty("--acento", paleta.acento);
  root.style.setProperty("--sucesso", paleta.sucesso);
  root.style.setProperty("--alerta", paleta.alerta);
  root.style.setProperty("--erro", paleta.erro);

  // Variáveis canônicas do app para compatibilidade total
  root.style.setProperty("--app-bg", paleta.bg);
  root.style.setProperty("--app-card", paleta.card);
  root.style.setProperty("--app-card-secondary", tema === "escuro" ? "#202C33" : "#EDF2EB");
  root.style.setProperty("--app-card-hover", tema === "escuro" ? "#26353E" : "#E3E9E0");
  root.style.setProperty("--app-border", paleta.borda);
  root.style.setProperty("--app-text", paleta.texto);
  root.style.setProperty("--app-text-muted", paleta.textoSuave);
  root.style.setProperty("--app-primary", paleta.primaria);
  root.style.setProperty("--app-primary-hover", tema === "escuro" ? "#E08F35" : "#9E5414");
  root.style.setProperty("--app-accent", paleta.acento);
  root.style.setProperty("--app-success", paleta.sucesso);
  root.style.setProperty("--app-warning", paleta.alerta);
  root.style.setProperty("--app-danger", paleta.erro);

  // Aliases universais
  root.style.setProperty("--bg-color", paleta.bg);
  root.style.setProperty("--bg-main", paleta.bg);
  root.style.setProperty("--bg-card", paleta.card);
  root.style.setProperty("--bg-card-secondary", tema === "escuro" ? "#202C33" : "#EDF2EB");
  root.style.setProperty("--text-color", paleta.texto);
  root.style.setProperty("--text-primary", paleta.texto);
  root.style.setProperty("--text-muted", paleta.textoSuave);
  root.style.setProperty("--border-color", paleta.borda);
  root.style.setProperty("--btn-primary", paleta.primaria);
  root.style.setProperty("--btn-primary-text", paleta.primariaTexto);

  // 1. Atualizar meta tag theme-color no HTML
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", paleta.bg);
  }

  // 2. Salvar preferência no localStorage
  try {
    localStorage.setItem("tema", tema);
  } catch {}

  // 3. Atualizar Status Bar no Android/iOS via Capacitor
  if (Capacitor.isPluginAvailable("StatusBar")) {
    try {
      StatusBar.setStyle({ style: tema === "escuro" ? Style.Dark : Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: paleta.bg }).catch(() => {});
    } catch {}
  }
}

/**
 * Alterna entre os dois temas suportados.
 */
export function alternarTema(): TemaTipo {
  const atual = getTemaAtual();
  const proximo: TemaTipo = atual === "claro" ? "escuro" : "claro";
  aplicarTema(proximo);
  return proximo;
}

// Funções de compatibilidade para código existente
export function loadSavedTheme(): TemaPaleta {
  const t = getTemaAtual();
  return t === "escuro" ? TEMA_ESCURO : TEMA_CLARO;
}

export function applyThemeToDOM(themeOrId?: any): void {
  if (!themeOrId) {
    aplicarTema(getTemaAtual());
    return;
  }
  const id = typeof themeOrId === "string" ? themeOrId : themeOrId?.id;
  const targetTema: TemaTipo = id === "escuro" || id === "dark" ? "escuro" : "claro";
  aplicarTema(targetTema);
}

export function saveTheme(themeOrId?: any, userId?: string): void {
  const id = typeof themeOrId === "string" ? themeOrId : themeOrId?.id;
  const targetTema: TemaTipo = id === "escuro" || id === "dark" ? "escuro" : "claro";
  aplicarTema(targetTema);
}

// Inicializar na importação caso esteja no browser
if (typeof window !== "undefined") {
  aplicarTema(getTemaAtual());
}
