import React, { useState } from "react";
import { Palette, Check, Sparkles, RefreshCw } from "lucide-react";
import { CustomThemeColors, UserProfile } from "../../types";
import { PRESET_THEMES, DEFAULT_PAPER_THEME } from "../../utils/themeManager";
import confetti from "canvas-confetti";

interface ColorThemeTabProps {
  currentTheme: CustomThemeColors;
  onThemeChange: (theme: CustomThemeColors) => void;
  user: UserProfile;
}

export const ColorThemeTab: React.FC<ColorThemeTabProps> = ({
  currentTheme,
  onThemeChange,
  user,
}) => {
  const [customColors, setCustomColors] = useState<CustomThemeColors>({ ...currentTheme });

  const handleSelectPreset = (preset: CustomThemeColors) => {
    setCustomColors({ ...preset });
    onThemeChange(preset);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const handleColorChange = (key: keyof CustomThemeColors, value: string) => {
    const updated = { ...customColors, [key]: value, id: "custom", name: "Customizado pelo Usuário" };
    setCustomColors(updated);
    onThemeChange(updated);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 text-white flex items-center justify-center shadow-md">
          <Palette className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[var(--app-text)]">Personalização de Tema & Paleta</h2>
          <p className="text-xs text-[var(--app-text-muted)]">
            Escolha um dos temas otimizados para foco ou configure suas próprias cores CSS.
          </p>
        </div>
      </div>

      {/* Preset Themes Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
          Temas Predefinidos de Foco
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_THEMES.map((preset) => {
            const isSelected = currentTheme.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-5 rounded-3xl border text-left transition flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? "border-[var(--app-primary)] ring-2 ring-[var(--app-primary)]/40 shadow-md"
                    : "border-[var(--app-border)] hover:border-[var(--app-primary)]/50"
                }`}
                style={{ backgroundColor: preset.bgCard, color: preset.textPrimary }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{preset.name}</span>
                  {isSelected && (
                    <span className="w-6 h-6 rounded-full bg-[var(--app-primary)] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Color preview bars */}
                <div className="flex items-center gap-1.5 pt-2">
                  <div
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colorPrimary }}
                    title="Primária"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.bgPrimary }}
                    title="Fundo"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colorSuccess }}
                    title="Sucesso"
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colorAccent }}
                    title="Destaque"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Fine-Tuning */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Ajuste Fino de Cores
          </h3>
          <button
            onClick={() => handleSelectPreset(DEFAULT_PAPER_THEME)}
            className="text-xs text-[var(--app-primary)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Restaurar Padrão IFES
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="text-xs font-bold text-[var(--app-text)] block mb-1.5">Cor Primária (Ações)</label>
            <input
              type="color"
              value={customColors.colorPrimary}
              onChange={(e) => handleColorChange("colorPrimary", e.target.value)}
              className="w-full h-10 rounded-xl cursor-pointer bg-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--app-text)] block mb-1.5">Cor de Fundo da Aplicação</label>
            <input
              type="color"
              value={customColors.bgPrimary}
              onChange={(e) => handleColorChange("bgPrimary", e.target.value)}
              className="w-full h-10 rounded-xl cursor-pointer bg-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--app-text)] block mb-1.5">Cor dos Cards e Painéis</label>
            <input
              type="color"
              value={customColors.bgCard}
              onChange={(e) => handleColorChange("bgCard", e.target.value)}
              className="w-full h-10 rounded-xl cursor-pointer bg-transparent"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--app-text)] block mb-1.5">Cor de Destaque / Alerta</label>
            <input
              type="color"
              value={customColors.colorAccent}
              onChange={(e) => handleColorChange("colorAccent", e.target.value)}
              className="w-full h-10 rounded-xl cursor-pointer bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
