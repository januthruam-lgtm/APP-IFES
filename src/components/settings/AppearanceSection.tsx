import React, { useState, useEffect } from "react";
import {
  Palette,
  Sun,
  Moon,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Wand2,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  RefreshCw,
  Eye,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  Base5Colors,
  FullDerivedTheme,
  PRESET_PALETTES,
  deriveFullPalette,
  checkContrast,
  autoFixContrast,
  generateHarmonies,
} from "../../utils/paletteDerivation";
import {
  loadSavedPalettes,
  saveUserPalettes,
  saveTheme,
  applyThemeToDOM,
  fullThemeToCustomTheme,
} from "../../utils/themeManager";
import { PaletteEditorControls } from "./PaletteEditorControls";
import { PalettePreviewCard } from "./PalettePreviewCard";
import { CustomThemeColors, UserProfile } from "../../types";

interface AppearanceSectionProps {
  currentTheme: CustomThemeColors;
  onThemeChange: (theme: CustomThemeColors) => void;
  user: UserProfile;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  currentTheme,
  onThemeChange,
  user,
}) => {
  // Paletas salvas (máx 10)
  const [savedPalettes, setSavedPalettes] = useState<FullDerivedTheme[]>(() =>
    loadSavedPalettes()
  );

  // Cores de edição atual (inicia com o tema atual)
  const [baseColors, setBaseColors] = useState<Base5Colors>({
    bg: currentTheme.bgPrimary || "#0f172a",
    surface: currentTheme.bgCard || "#1e293b",
    text: currentTheme.textPrimary || "#f8fafc",
    primary: currentTheme.colorPrimary || "#6366f1",
    secondary: currentTheme.colorAccent || "#ec4899",
  });

  const [paletteName, setPaletteName] = useState("Minha Paleta");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Paleta derivada completa em tempo real
  const derivedTheme = deriveFullPalette(baseColors, "custom-live", paletteName);

  // Verificação de Contraste WCAG AA
  const textSurfaceContrast = checkContrast(baseColors.text, baseColors.surface);
  const primarySurfaceContrast = checkContrast(baseColors.primary, baseColors.surface);
  const textBgContrast = checkContrast(baseColors.text, baseColors.bg);

  const hasContrastError = !textSurfaceContrast.passesNormal || !textBgContrast.passesNormal;

  // Harmonias de cor sugeridas
  const harmonies = generateHarmonies(baseColors.primary);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Aplicação instantânea
  const handleApplyCurrent = () => {
    const custom = fullThemeToCustomTheme(derivedTheme);
    onThemeChange(custom);
    saveTheme(custom, user.id || user.uid);
    applyThemeToDOM(custom);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    showToast("Paleta aplicada com sucesso!");
  };

  // Correção Automática de Contraste
  const handleAutoFixContrast = () => {
    const fixedText = autoFixContrast(baseColors.text, baseColors.surface, 4.6);
    setBaseColors((prev) => ({
      ...prev,
      text: fixedText,
    }));
    showToast("Contraste ajustado para padrão WCAG AA (≥ 4.5:1)!");
  };

  // Salvar paleta (máx 10)
  const handleSavePalette = () => {
    const newTheme = deriveFullPalette(
      baseColors,
      `custom-${Date.now()}`,
      paletteName.trim() || "Nova Paleta"
    );
    const existingIndex = savedPalettes.findIndex((p) => p.name.toLowerCase() === newTheme.name.toLowerCase());
    let updated: FullDerivedTheme[];
    if (existingIndex >= 0) {
      updated = [...savedPalettes];
      updated[existingIndex] = newTheme;
    } else {
      if (savedPalettes.length >= 10) {
        showToast("Limite de 10 paletas atingido. Exclua uma antes de salvar.");
        return;
      }
      updated = [newTheme, ...savedPalettes];
    }
    setSavedPalettes(updated);
    saveUserPalettes(updated);
    showToast(`Paleta "${newTheme.name}" salva!`);
  };

  // Duplicar paleta salva
  const handleDuplicate = (palette: FullDerivedTheme) => {
    if (savedPalettes.length >= 10) {
      showToast("Limite de 10 paletas atingido.");
      return;
    }
    const dup: FullDerivedTheme = {
      ...palette,
      id: `custom-${Date.now()}`,
      name: `${palette.name} (Cópia)`,
    };
    const updated = [dup, ...savedPalettes];
    setSavedPalettes(updated);
    saveUserPalettes(updated);
    showToast(`Cópia criada: "${dup.name}"`);
  };

  // Excluir paleta
  const handleDeletePalette = (id: string) => {
    const updated = savedPalettes.filter((p) => p.id !== id);
    setSavedPalettes(updated);
    saveUserPalettes(updated);
    showToast("Paleta removida.");
  };

  // Exportar paleta como JSON
  const handleExportJson = () => {
    const dataStr = JSON.stringify(derivedTheme, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      showToast("Código JSON da paleta copiado para a área de transferência!");
    }).catch(() => {
      showToast("Erro ao copiar JSON.");
    });
  };

  // Importar paleta via JSON
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.bg || !parsed.surface || !parsed.text || !parsed.primary) {
        showToast("JSON inválido: campos de cor base ausentes.");
        return;
      }
      setBaseColors({
        bg: parsed.bg,
        surface: parsed.surface,
        text: parsed.text,
        primary: parsed.primary,
        secondary: parsed.secondary || parsed.colorAccent || "#ec4899",
      });
      if (parsed.name) setPaletteName(parsed.name);
      setShowImportDialog(false);
      setImportJsonText("");
      showToast("Paleta importada com sucesso!");
    } catch {
      showToast("Formato JSON inválido. Verifique o texto colado.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast flutuante */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 p-3 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[var(--app-primary)]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. SELEÇÃO DE MODO BASE */}
      <section className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-[var(--app-primary)]" />
          <span>Modo Base de Iluminação</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              id: "claro",
              label: "Claro",
              desc: "Leitura diurna",
              bg: "#f8f9fa",
              surface: "#ffffff",
              text: "#0f172a",
            },
            {
              id: "escuro",
              label: "Escuro",
              desc: "Conforto visual",
              bg: "#0f172a",
              surface: "#1e293b",
              text: "#f8fafc",
            },
            {
              id: "preto",
              label: "Preto Puro",
              desc: "OLED / Bateria",
              bg: "#000000",
              surface: "#121212",
              text: "#ffffff",
            },
            {
              id: "auto",
              label: "Automático",
              desc: "Segue o sistema",
              bg: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "#0f172a" : "#f8f9fa",
              surface: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "#1e293b" : "#ffffff",
              text: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "#f8fafc" : "#0f172a",
            },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setBaseColors((prev) => ({
                  ...prev,
                  bg: mode.bg,
                  surface: mode.surface,
                  text: mode.text,
                }));
              }}
              className="p-3 rounded-2xl border text-left transition cursor-pointer hover:border-[var(--app-primary)]/60 bg-[var(--app-card-secondary)] border-[var(--app-border)]"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: mode.bg }} />
                <span className="text-xs font-bold text-[var(--app-text)]">{mode.label}</span>
              </div>
              <span className="text-[10px] text-[var(--app-text-muted)] block mt-0.5">{mode.desc}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. MODELOS PRONTOS (8 PRESETS) */}
      <section className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--app-primary)]" />
          <span>Modelos Prontos de Alta Qualidade (Presets)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_PALETTES.map((preset) => {
            const isActive = currentTheme.name === preset.name || currentTheme.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setBaseColors({
                    bg: preset.bg,
                    surface: preset.surface,
                    text: preset.text,
                    primary: preset.primary,
                    secondary: preset.secondary,
                  });
                  setPaletteName(preset.name);
                  const custom = fullThemeToCustomTheme(preset);
                  onThemeChange(custom);
                  saveTheme(custom, user.id || user.uid);
                  applyThemeToDOM(custom);
                }}
                className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                  isActive
                    ? "ring-2 ring-[var(--app-primary)] border-[var(--app-primary)] bg-[var(--app-card)]"
                    : "bg-[var(--app-card-secondary)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--app-text)] truncate">
                    {preset.name}
                  </span>
                  {isActive && <Check className="w-3 h-3 text-[var(--app-primary)] shrink-0" />}
                </div>

                {/* Swatch das 5 cores */}
                <div className="flex rounded-md overflow-hidden h-3 w-full border border-black/10">
                  <div style={{ backgroundColor: preset.bg, width: "30%" }} />
                  <div style={{ backgroundColor: preset.surface, width: "30%" }} />
                  <div style={{ backgroundColor: preset.primary, width: "20%" }} />
                  <div style={{ backgroundColor: preset.secondary, width: "20%" }} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. MONTADOR DE PALETA (5 CORES-BASE) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            <span>Montador de Paleta (5 Cores-Base)</span>
          </h4>
          <span className="text-[10px] text-[var(--app-text-muted)]">
            Hover, bordas e tons são derivados com precisão matemática
          </span>
        </div>

        <PaletteEditorControls baseColors={baseColors} onChange={setBaseColors} />
      </section>

      {/* 4. COMBINAÇÕES HARMÔNICAS SUGERIDAS */}
      <section className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            <span>Harmonias Sugeridas para Cor Secundária</span>
          </h4>
          <span className="text-[10px] text-[var(--app-text-muted)]">
            Baseadas na cor primária atual ({baseColors.primary})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { label: "Complementar (+180°)", color: harmonies.complementary },
            { label: "Análoga 1 (+30°)", color: harmonies.analogous1 },
            { label: "Análoga 2 (-30°)", color: harmonies.analogous2 },
            { label: "Tríade (+120°)", color: harmonies.triadic1 },
          ].map((h, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setBaseColors((prev) => ({
                  ...prev,
                  secondary: h.color,
                }));
                showToast(`Secundária ajustada: ${h.label}`);
              }}
              className="p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] flex items-center gap-2 transition cursor-pointer text-left"
            >
              <span className="w-5 h-5 rounded-lg border shrink-0" style={{ backgroundColor: h.color }} />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[var(--app-text)] block truncate">{h.label}</span>
                <span className="text-[10px] font-mono text-[var(--app-text-muted)]">{h.color}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 5. VERIFICAÇÃO DE CONTRASTE WCAG AA & AUTO-CORREÇÃO */}
      <section className="p-4 rounded-2xl border space-y-3 bg-[var(--app-card-secondary)] border-[var(--app-border)]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
              Auditoria de Contraste WCAG 2.1
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasContrastError
                  ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {hasContrastError ? "Requer Ajuste" : "WCAG AA Aprovado ✓"}
            </span>
          </div>

          {hasContrastError && (
            <button
              type="button"
              onClick={handleAutoFixContrast}
              className="px-3 py-1.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Corrigir Automaticamente</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--app-text-muted)]">Texto x Superfície:</span>
            <span
              className={`font-mono font-bold ${
                textSurfaceContrast.passesNormal ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {textSurfaceContrast.ratio}:1 {textSurfaceContrast.passesNormal ? "✓" : "✗ (min 4.5)"}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--app-text-muted)]">Texto x Fundo:</span>
            <span
              className={`font-mono font-bold ${
                textBgContrast.passesNormal ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {textBgContrast.ratio}:1 {textBgContrast.passesNormal ? "✓" : "✗ (min 4.5)"}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--app-text-muted)]">Primária x Superfície:</span>
            <span
              className={`font-mono font-bold ${
                primarySurfaceContrast.passesLarge ? "text-emerald-500" : "text-amber-500"
              }`}
            >
              {primarySurfaceContrast.ratio}:1 {primarySurfaceContrast.passesLarge ? "✓" : "⚠️"}
            </span>
          </div>
        </div>
      </section>

      {/* 6. PRÉ-VISUALIZAÇÃO AO VIVO COM COMPONENTES REAIS */}
      <section className="space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-[var(--app-primary)]" />
          <span>Pré-Visualização ao Vivo da Paleta</span>
        </h4>

        <PalettePreviewCard theme={derivedTheme} />
      </section>

      {/* 7. GERENCIAMENTO DE PALETAS SALVAS (MÁX 10) */}
      <section className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
              Minhas Paletas Salvas ({savedPalettes.length}/10)
            </h4>
            <span className="text-[10px] text-[var(--app-text-muted)]">
              Salve, duplique, renomeie ou exporte suas criações
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-xs font-bold text-[var(--app-text)] flex items-center gap-1 transition cursor-pointer"
              title="Copiar código JSON da paleta"
            >
              <Download className="w-3 h-3" />
              <span>Exportar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportDialog(true)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--app-border)] bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-xs font-bold text-[var(--app-text)] flex items-center gap-1 transition cursor-pointer"
              title="Importar paleta a partir de código JSON"
            >
              <Upload className="w-3 h-3" />
              <span>Importar</span>
            </button>
          </div>
        </div>

        {/* Campo para nomear e salvar paleta atual */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
            placeholder="Nome da sua paleta..."
            className="flex-1 px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
          />
          <button
            type="button"
            onClick={handleSavePalette}
            className="px-4 py-2 bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            <span>Salvar</span>
          </button>
          <button
            type="button"
            onClick={handleApplyCurrent}
            className="px-5 py-2 bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar Agora</span>
          </button>
        </div>

        {/* Lista de paletas salvas */}
        <div className="space-y-2 pt-2">
          {savedPalettes.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex rounded overflow-hidden h-4 w-12 border border-black/10 shrink-0">
                  <div style={{ backgroundColor: p.bg, width: "30%" }} />
                  <div style={{ backgroundColor: p.surface, width: "30%" }} />
                  <div style={{ backgroundColor: p.primary, width: "20%" }} />
                  <div style={{ backgroundColor: p.secondary, width: "20%" }} />
                </div>
                <span className="font-bold text-[var(--app-text)] truncate">{p.name}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setBaseColors({
                      bg: p.bg,
                      surface: p.surface,
                      text: p.text,
                      primary: p.primary,
                      secondary: p.secondary,
                    });
                    setPaletteName(p.name);
                    const custom = fullThemeToCustomTheme(p);
                    onThemeChange(custom);
                    saveTheme(custom, user.id || user.uid);
                    applyThemeToDOM(custom);
                    showToast(`Paleta "${p.name}" aplicada!`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--app-primary)]/15 text-[var(--app-primary)] hover:bg-[var(--app-primary)]/25 font-bold transition cursor-pointer"
                >
                  Aplicar
                </button>

                <button
                  type="button"
                  onClick={() => handleDuplicate(p)}
                  className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                  title="Duplicar paleta"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                {savedPalettes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeletePalette(p.id)}
                    className="p-1 rounded-lg text-rose-500 hover:text-rose-600 cursor-pointer"
                    title="Excluir paleta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DIÁLOGO DE IMPORTAR JSON */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-5 w-full max-w-md space-y-3 shadow-2xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
              Importar Paleta via Código JSON
            </h4>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              Cole aqui o objeto JSON da paleta exportada anteriormente:
            </p>
            <textarea
              rows={5}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"bg": "#0f172a", "surface": "#1e293b", "text": "#ffffff", "primary": "#6366f1", ...}'
              className="w-full p-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs font-mono text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowImportDialog(false)}
                className="px-3 py-1.5 rounded-xl border border-[var(--app-border)] text-xs font-bold text-[var(--app-text-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                className="px-4 py-1.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold shadow-xs"
              >
                Carregar Paleta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
