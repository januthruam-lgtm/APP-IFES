import React from "react";
import { FullDerivedTheme } from "../../utils/paletteDerivation";
import { Sparkles, Heart, Zap, Check } from "lucide-react";

interface PalettePreviewCardProps {
  theme: FullDerivedTheme;
}

export const PalettePreviewCard: React.FC<PalettePreviewCardProps> = ({ theme }) => {
  return (
    <div
      className="p-4 sm:p-5 rounded-3xl border shadow-lg space-y-4 transition-all duration-200"
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.borderColor,
        color: theme.text,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
          <span className="text-xs font-black uppercase tracking-wider">
            Pré-visualização ao Vivo
          </span>
        </div>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold"
          style={{
            borderColor: theme.borderColor,
            color: theme.textMuted,
          }}
        >
          {theme.isDark ? "Modo Escuro" : "Modo Claro"}
        </span>
      </div>

      {/* Cartão de Exemplo */}
      <div
        className="p-3.5 rounded-2xl border space-y-2 shadow-xs"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.borderColor,
        }}
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold" style={{ color: theme.text }}>
            Cartão de Atividade AVA IFES
          </h4>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: theme.primary + "20",
              color: theme.primary,
            }}
          >
            Pendente
          </span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: theme.textMuted }}>
          Estruture suas metas de estudo com alto contraste e legibilidade balanceada.
        </p>

        {/* Campo de Texto de Exemplo */}
        <div className="pt-1">
          <input
            type="text"
            readOnly
            value="Exemplo de campo de busca..."
            className="w-full px-3 py-1.5 rounded-xl text-xs outline-none border font-medium"
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.borderColor,
              color: theme.text,
            }}
          />
        </div>
      </div>

      {/* Cartão de Pet com Destaque Secundário */}
      <div
        className="p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-xs"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.borderColor,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border shadow-xs"
            style={{
              backgroundColor: theme.primary + "15",
              borderColor: theme.primary + "30",
            }}
          >
            🦉
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: theme.text }}>
              <span>Athena</span>
              <span
                className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold"
                style={{
                  backgroundColor: theme.secondary + "25",
                  color: theme.secondary,
                }}
              >
                NÍVEL 3
              </span>
            </div>
            <div className="text-[10px] flex items-center gap-2" style={{ color: theme.textMuted }}>
              <span className="flex items-center gap-0.5">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> 95%
              </span>
              <span className="flex items-center gap-0.5">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> 100 ⚡
              </span>
            </div>
          </div>
        </div>

        {/* Botão Secundário */}
        <button
          type="button"
          className="px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer"
          style={{
            borderColor: theme.secondary,
            color: theme.secondary,
            backgroundColor: theme.secondary + "15",
          }}
        >
          Brincar
        </button>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          className="flex-1 py-2 px-3 rounded-xl text-xs font-extrabold text-white shadow-xs transition flex items-center justify-center gap-1.5"
          style={{
            backgroundColor: theme.primary,
          }}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Botão Primário</span>
        </button>

        <button
          type="button"
          className="py-2 px-3 rounded-xl text-xs font-bold border transition"
          style={{
            borderColor: theme.borderColor,
            backgroundColor: theme.surface,
            color: theme.text,
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
