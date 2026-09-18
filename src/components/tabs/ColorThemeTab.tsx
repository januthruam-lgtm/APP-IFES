import React, { useState } from "react";
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  CheckCircle2,
  Copy,
  Download,
  Upload,
} from "lucide-react";
import { CustomThemeColors, UserProfile } from "../../types";
import { THEME_PRESETS, DEFAULT_THEME } from "../../utils/themeManager";
import confetti from "canvas-confetti";

interface ColorThemeTabProps {
  currentTheme: CustomThemeColors;
  onThemeChange: (newTheme: CustomThemeColors) => void;
  user?: UserProfile;
}

export const ColorThemeTab: React.FC<ColorThemeTabProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const [activeTheme, setActiveTheme] = useState<CustomThemeColors>(currentTheme);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSelectPreset = (preset: CustomThemeColors) => {
    setActiveTheme(preset);
    onThemeChange(preset);
    setSavedSuccess(true);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleColorChange = (key: keyof CustomThemeColors, value: any) => {
    const updated = { ...activeTheme, [key]: value };
    setActiveTheme(updated);
    onThemeChange(updated);
  };

  const handleReset = () => {
    setActiveTheme(DEFAULT_THEME);
    onThemeChange(DEFAULT_THEME);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div
        className="p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-colors"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.borderColor,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: `${activeTheme.colorPrimary}20`,
                borderColor: activeTheme.colorPrimary,
                color: activeTheme.colorAccent || activeTheme.colorPrimary,
              }}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Personalização Visual Global</span>
            </div>
            <h1
              className="text-2xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: activeTheme.textPrimary }}
            >
              Estúdio de Cores & Temas
            </h1>
            <p
              className="text-sm sm:text-base max-w-2xl"
              style={{ color: activeTheme.textMuted }}
            >
              Altere instantaneamente a estética de <strong>todas as telas do aplicativo</strong>,
              incluindo o AVA IFES, Q-Acadêmico, Dashboard, Trilhas e Sala de Estudos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold border transition flex items-center gap-2 hover:opacity-80"
              style={{
                backgroundColor: activeTheme.bgCardSecondary,
                borderColor: activeTheme.borderColor,
                color: activeTheme.textPrimary,
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Padrão</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-bold flex items-center gap-2"
            style={{ color: activeTheme.textPrimary }}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Paletas & Temas Prontos</span>
          </h2>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Tema aplicado em todas as páginas!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEME_PRESETS.map((preset) => {
            const isSelected = activeTheme.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected ? "ring-2 ring-offset-2 scale-[1.01]" : "hover:opacity-90"
                }`}
                style={{
                  backgroundColor: preset.bgCard,
                  borderColor: isSelected ? preset.colorPrimary : preset.borderColor,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm" style={{ color: preset.textPrimary }}>
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span
                      className="p-1 rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: preset.colorPrimary }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Color swatches preview */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: preset.bgMain, borderColor: preset.borderColor }} title="Fundo" />
                  <div className="w-6 h-6 rounded-full border shadow-sm" style={{ backgroundColor: preset.bgCard, borderColor: preset.borderColor }} title="Cards" />
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: preset.colorPrimary }} title="Primária" />
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: preset.colorAccent }} title="Destaque" />
                  <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: preset.colorSuccess }} title="Sucesso" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Granular Color Picker Studio */}
      <div
        className="p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.borderColor,
        }}
      >
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: activeTheme.borderColor }}>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: activeTheme.textPrimary }}>
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Ajuste Fino de Cores Personalizadas</span>
            </h2>
            <p className="text-xs" style={{ color: activeTheme.textMuted }}>
              Escolha cada tom com precisão. As alterações refletem em tempo real no app todo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* bgMain */}
          <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: activeTheme.bgCardSecondary, borderColor: activeTheme.borderColor }}>
            <label className="text-xs font-bold block" style={{ color: activeTheme.textPrimary }}>Fundo Geral (Background)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={activeTheme.bgMain}
                onChange={(e) => handleColorChange("bgMain", e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={activeTheme.bgMain}
                onChange={(e) => handleColorChange("bgMain", e.target.value)}
                className="w-28 text-xs font-mono px-3 py-1.5 rounded-xl border bg-black/20"
                style={{ color: activeTheme.textPrimary, borderColor: activeTheme.borderColor }}
              />
            </div>
          </div>

          {/* bgCard */}
          <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: activeTheme.bgCardSecondary, borderColor: activeTheme.borderColor }}>
            <label className="text-xs font-bold block" style={{ color: activeTheme.textPrimary }}>Cor dos Cards</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={activeTheme.bgCard}
                onChange={(e) => handleColorChange("bgCard", e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={activeTheme.bgCard}
                onChange={(e) => handleColorChange("bgCard", e.target.value)}
                className="w-28 text-xs font-mono px-3 py-1.5 rounded-xl border bg-black/20"
                style={{ color: activeTheme.textPrimary, borderColor: activeTheme.borderColor }}
              />
            </div>
          </div>

          {/* colorPrimary */}
          <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: activeTheme.bgCardSecondary, borderColor: activeTheme.borderColor }}>
            <label className="text-xs font-bold block" style={{ color: activeTheme.textPrimary }}>Botão Primário / Destaque</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={activeTheme.colorPrimary}
                onChange={(e) => handleColorChange("colorPrimary", e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={activeTheme.colorPrimary}
                onChange={(e) => handleColorChange("colorPrimary", e.target.value)}
                className="w-28 text-xs font-mono px-3 py-1.5 rounded-xl border bg-black/20"
                style={{ color: activeTheme.textPrimary, borderColor: activeTheme.borderColor }}
              />
            </div>
          </div>

          {/* textPrimary */}
          <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: activeTheme.bgCardSecondary, borderColor: activeTheme.borderColor }}>
            <label className="text-xs font-bold block" style={{ color: activeTheme.textPrimary }}>Texto Principal</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={activeTheme.textPrimary}
                onChange={(e) => handleColorChange("textPrimary", e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={activeTheme.textPrimary}
                onChange={(e) => handleColorChange("textPrimary", e.target.value)}
                className="w-28 text-xs font-mono px-3 py-1.5 rounded-xl border bg-black/20"
                style={{ color: activeTheme.textPrimary, borderColor: activeTheme.borderColor }}
              />
            </div>
          </div>

          {/* textMuted */}
          <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: activeTheme.bgCardSecondary, borderColor: activeTheme.borderColor }}>
            <label className="text-xs font-bold block" style={{ color: activeTheme.textPrimary }}>Texto Secundário / Mudo</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={activeTheme.textMuted}
                onChange={(e) => handleColorChange("textMuted", e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={activeTheme.textMuted}
                onChange={(e) => handleColorChange("textMuted", e.target.value)}
                className="w-28 text-xs font-mono px-3 py-1.5 rounded-xl border bg-black/20"
                style={{ color: activeTheme.textPrimary, borderColor: activeTheme.borderColor }}
              />
            </div>
          </div>

          {/* colorAccent */}
          <div className="p-4 rounded-2xl border space-y-2" style={{ backgroundColor: activeTheme.bgCardSecondary, borderColor: activeTheme.borderColor }}>
            <label className="text-xs font-bold block" style={{ color: activeTheme.textPrimary }}>Cor de Acento (Badges/Realce)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={activeTheme.colorAccent}
                onChange={(e) => handleColorChange("colorAccent", e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={activeTheme.colorAccent}
                onChange={(e) => handleColorChange("colorAccent", e.target.value)}
                className="w-28 text-xs font-mono px-3 py-1.5 rounded-xl border bg-black/20"
                style={{ color: activeTheme.textPrimary, borderColor: activeTheme.borderColor }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Cross-Page Preview */}
      <div
        className="p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6"
        style={{
          backgroundColor: activeTheme.bgCard,
          borderColor: activeTheme.borderColor,
        }}
      >
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: activeTheme.borderColor }}>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: activeTheme.textPrimary }}>
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>Simulação em Tempo Real (AVA IFES & Q-Acadêmico)</span>
            </h2>
            <p className="text-xs" style={{ color: activeTheme.textMuted }}>
              Veja como os componentes das páginas do AVA e do Q-Acadêmico se adaptam à paleta selecionada.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AVA Preview Card */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: activeTheme.bgMain,
              borderColor: activeTheme.borderColor,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: activeTheme.colorAccent }}>
                AVA IFES Moodle
              </span>
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                style={{ backgroundColor: `${activeTheme.colorSuccess}25`, color: activeTheme.colorSuccess }}
              >
                Sincronizado
              </span>
            </div>
            <h4 className="font-bold text-sm" style={{ color: activeTheme.textPrimary }}>
              Algoritmos e Programação Estruturada
            </h4>
            <p className="text-xs" style={{ color: activeTheme.textMuted }}>
              Prazo de entrega da Lista de Exercícios #03 até amanhã às 23:59.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                style={{
                  backgroundColor: activeTheme.colorPrimary,
                  color: "#ffffff",
                }}
              >
                Entregar Atividade
              </button>
            </div>
          </div>

          {/* Q-Acadêmico Preview Card */}
          <div
            className="p-5 rounded-2xl border space-y-3"
            style={{
              backgroundColor: activeTheme.bgMain,
              borderColor: activeTheme.borderColor,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: activeTheme.colorPrimary }}>
                Q-Acadêmico IFES
              </span>
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                style={{ backgroundColor: `${activeTheme.colorPrimary}25`, color: activeTheme.colorPrimary }}
              >
                CR: 87.5
              </span>
            </div>
            <h4 className="font-bold text-sm" style={{ color: activeTheme.textPrimary }}>
              Boletim Semestral Oficial
            </h4>
            <div className="flex items-center justify-between text-xs py-1 border-t border-b" style={{ borderColor: activeTheme.borderColor }}>
              <span style={{ color: activeTheme.textMuted }}>Média Parcial:</span>
              <span className="font-bold" style={{ color: activeTheme.colorSuccess }}>9.4 (Aprovado)</span>
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                className="px-4 py-2 rounded-xl text-xs font-bold border transition"
                style={{
                  backgroundColor: activeTheme.bgCardSecondary,
                  borderColor: activeTheme.borderColor,
                  color: activeTheme.textPrimary,
                }}
              >
                Ver Horários e Faltas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
