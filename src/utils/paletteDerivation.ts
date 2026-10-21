/**
 * Utilitário de derivação matemática exata de cores, contraste WCAG AA e harmonias
 */

export interface Base5Colors {
  bg: string;        // Fundo
  surface: string;   // Superfície / Cartão
  text: string;      // Texto principal
  primary: string;   // Destaque primário
  secondary: string; // Destaque secundário
}

export interface FullDerivedTheme extends Base5Colors {
  id: string;
  name: string;
  isDark: boolean;
  bgCardHover: string;
  colorPrimaryHover: string;
  colorSecondaryHover: string;
  borderColor: string;
  textMuted: string;
  colorSuccess: string;
  colorError: string;
  colorWarning: string;
}

export interface ContrastResult {
  ratio: number;
  passesNormal: boolean; // >= 4.5:1
  passesLarge: boolean;  // >= 3.0:1
}

// ==========================================
// CONVERSÕES RGB / HEX / HSL
// ==========================================

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0, g1 = 0, b1 = 0;
  if (h >= 0 && h < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (h >= 60 && h < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (h >= 120 && h < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (h >= 180 && h < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (h >= 240 && h < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// ==========================================
// CÁLCULO DE LUMINÂNCIA E CONTRASTE WCAG 2.1
// ==========================================

export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return parseFloat(ratio.toFixed(2));
}

export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  return {
    ratio,
    passesNormal: ratio >= 4.5,
    passesLarge: ratio >= 3.0,
  };
}

/**
 * Ajusta a luminosidade da cor do texto até atingir o contraste mínimo exigido (4.5:1 ou 7:1)
 */
export function autoFixContrast(textColor: string, bgColor: string, targetRatio: number = 4.5): string {
  const bgLum = getRelativeLuminance(bgColor);
  const isBgDark = bgLum < 0.5;
  const { r, g, b } = hexToRgb(textColor);
  const { h, s } = rgbToHsl(r, g, b);

  // Se o fundo for escuro, clarear o texto (l: 50 -> 100); se for claro, escurecer (l: 50 -> 0)
  if (isBgDark) {
    for (let l = 60; l <= 100; l += 2) {
      const candidate = hslToHex(h, s, l);
      if (getContrastRatio(candidate, bgColor) >= targetRatio) {
        return candidate;
      }
    }
    return "#ffffff";
  } else {
    for (let l = 40; l >= 0; l -= 2) {
      const candidate = hslToHex(h, s, l);
      if (getContrastRatio(candidate, bgColor) >= targetRatio) {
        return candidate;
      }
    }
    return "#09090b";
  }
}

// ==========================================
// HARMONIAS DE COR A PARTIR DA COR PRIMÁRIA
// ==========================================

export function generateHarmonies(primaryHex: string): {
  complementary: string;
  analogous1: string;
  analogous2: string;
  triadic1: string;
  triadic2: string;
} {
  const { r, g, b } = hexToRgb(primaryHex);
  const { h, s, l } = rgbToHsl(r, g, b);

  return {
    complementary: hslToHex((h + 180) % 360, s, l),
    analogous1: hslToHex((h + 30) % 360, s, l),
    analogous2: hslToHex((h - 30 + 360) % 360, s, l),
    triadic1: hslToHex((h + 120) % 360, s, l),
    triadic2: hslToHex((h + 240) % 360, s, l),
  };
}

// ==========================================
// DERIVAÇÃO COMPLETA DE VARIÁVEIS DE TEMA
// ==========================================

export function deriveFullPalette(
  base: Base5Colors,
  id: string = "custom-palette",
  name: string = "Minha Paleta"
): FullDerivedTheme {
  const bgLum = getRelativeLuminance(base.bg);
  const isDark = bgLum < 0.35;

  const surfaceRgb = hexToRgb(base.surface);
  const surfaceHsl = rgbToHsl(surfaceRgb.r, surfaceRgb.g, surfaceRgb.b);

  const primaryRgb = hexToRgb(base.primary);
  const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  const secondaryRgb = hexToRgb(base.secondary);
  const secondaryHsl = rgbToHsl(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);

  const textRgb = hexToRgb(base.text);
  const textHsl = rgbToHsl(textRgb.r, textRgb.g, textRgb.b);

  // Derivações exatas:
  // 1. Superfície hover: clareia levemente no escuro (+6% L), escurece no claro (-5% L)
  const bgCardHover = hslToHex(
    surfaceHsl.h,
    surfaceHsl.s,
    isDark ? Math.min(100, surfaceHsl.l + 7) : Math.max(0, surfaceHsl.l - 5)
  );

  // 2. Primária hover
  const colorPrimaryHover = hslToHex(
    primaryHsl.h,
    primaryHsl.s,
    isDark ? Math.min(100, primaryHsl.l + 8) : Math.max(0, primaryHsl.l - 8)
  );

  // 3. Secundária hover
  const colorSecondaryHover = hslToHex(
    secondaryHsl.h,
    secondaryHsl.s,
    isDark ? Math.min(100, secondaryHsl.l + 8) : Math.max(0, secondaryHsl.l - 8)
  );

  // 4. Borda: contraste sutil com a superfície
  const borderColor = hslToHex(
    surfaceHsl.h,
    Math.max(0, surfaceHsl.s - 10),
    isDark ? Math.min(100, surfaceHsl.l + 12) : Math.max(0, surfaceHsl.l - 12)
  );

  // 5. Texto secundário / muted: 60% de opacidade perceptual
  const textMuted = hslToHex(
    textHsl.h,
    Math.max(0, textHsl.s - 20),
    isDark ? Math.max(45, textHsl.l - 25) : Math.min(55, textHsl.l + 25)
  );

  // 6. Estados de Sucesso, Erro e Aviso harmônicos
  const colorSuccess = isDark ? "#34d399" : "#059669";
  const colorError = isDark ? "#f87171" : "#dc2626";
  const colorWarning = isDark ? "#fbbf24" : "#d97706";

  return {
    ...base,
    id,
    name,
    isDark,
    bgCardHover,
    colorPrimaryHover,
    colorSecondaryHover,
    borderColor,
    textMuted,
    colorSuccess,
    colorError,
    colorWarning,
  };
}

// ==========================================
// 8 MODELOS PRONTOS DE ALTA QUALIDADE
// ==========================================

export const PRESET_PALETTES: FullDerivedTheme[] = [
  // 1. Índigo (Modo Escuro Clássico)
  deriveFullPalette(
    {
      bg: "#0f172a",
      surface: "#1e293b",
      text: "#f8fafc",
      primary: "#6366f1",
      secondary: "#ec4899",
    },
    "indigo",
    "Índigo Noturno"
  ),

  // 2. Oceano (Frescor e Clareza)
  deriveFullPalette(
    {
      bg: "#f0f9ff",
      surface: "#ffffff",
      text: "#0c4a6e",
      primary: "#0284c7",
      secondary: "#0d9488",
    },
    "oceano",
    "Oceano Pacífico"
  ),

  // 3. Floresta (IFES & Natureza)
  deriveFullPalette(
    {
      bg: "#064e3b",
      surface: "#065f46",
      text: "#ecfdf5",
      primary: "#10b981",
      secondary: "#fbbf24",
    },
    "floresta",
    "Floresta Esmeralda"
  ),

  // 4. Pôr do sol (Criatividade e Foco Quente)
  deriveFullPalette(
    {
      bg: "#fff7ed",
      surface: "#ffffff",
      text: "#7c2d12",
      primary: "#ea580c",
      secondary: "#db2777",
    },
    "por-do-sol",
    "Pôr do Sol"
  ),

  // 5. Rosa Neon / Pastel (Dinamismo Jovem)
  deriveFullPalette(
    {
      bg: "#180d1e",
      surface: "#2a1535",
      text: "#fdf2f8",
      primary: "#f43f5e",
      secondary: "#a855f7",
    },
    "rosa",
    "Rosa Carmim"
  ),

  // 6. Grafite / Minimalista (Paper Focus)
  deriveFullPalette(
    {
      bg: "#f8f9fa",
      surface: "#ffffff",
      text: "#1e293b",
      primary: "#15803d",
      secondary: "#dc2626",
    },
    "grafite",
    "Grafite & Papel IFES"
  ),

  // 7. Alto Contraste (WCAG AAA - 7:1)
  deriveFullPalette(
    {
      bg: "#000000",
      surface: "#121212",
      text: "#ffffff",
      primary: "#38bdf8",
      secondary: "#facc15",
    },
    "alto-contraste",
    "Alto Contraste AAA"
  ),

  // 8. Segura para Daltonismo (Evita pares vermelho-verde problemáticos)
  deriveFullPalette(
    {
      bg: "#0b192c",
      surface: "#1e3e62",
      text: "#ffffff",
      primary: "#ff6500", // Laranja visível para protanopia e deuteranopia
      secondary: "#000000",
    },
    "daltonismo-seguro",
    "Seguro para Daltonismo"
  ),
];
