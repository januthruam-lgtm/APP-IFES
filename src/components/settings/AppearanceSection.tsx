import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sun, Moon, Check, Laptop, Sparkles } from "lucide-react";
import {
  TemaTipo,
  TEMA_CLARO,
  TEMA_ESCURO,
  getTemaAtual,
  aplicarTema,
} from "../../utils/themeManager";

interface AppearanceSectionProps {
  currentTheme?: any;
  onThemeChange?: (theme: any) => void;
  user?: any;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  onThemeChange,
}) => {
  const { t } = useTranslation();
  const [temaAtivo, setTemaAtivo] = useState<TemaTipo>(getTemaAtual);

  useEffect(() => {
    setTemaAtivo(getTemaAtual());
  }, []);

  const handleSelectTema = (novoTema: TemaTipo) => {
    setTemaAtivo(novoTema);
    aplicarTema(novoTema);
    if (onThemeChange) {
      onThemeChange({ id: novoTema });
    }
  };

  const handleSeguirSistema = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      handleSelectTema(isDark ? "escuro" : "claro");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-black text-[var(--app-text)] flex items-center gap-2">
          <span>{t("ajustes.aparencia", "Aparência do Aplicativo")}</span>
        </h3>
        <p className="text-xs text-[var(--app-text-muted)] mt-1">
          {t(
            "ajustes.aparencia_desc",
            "Escolha entre o Tema Claro (relaxante, sem branco puro) e o Tema Escuro (confortável para a visão noturna). Ambos atendem rigorosamente aos padrões de contraste WCAG AA."
          )}
        </p>
      </div>

      {/* Grid com apenas 2 temas oficiais: Claro e Escuro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CARD TEMA CLARO */}
        <button
          type="button"
          onClick={() => handleSelectTema("claro")}
          className={`relative p-5 rounded-3xl border-2 text-left transition-all cursor-pointer shadow-sm hover:shadow-md ${
            temaAtivo === "claro"
              ? "border-[var(--app-primary)] ring-2 ring-[var(--app-primary)]/30 bg-[#FBFAF5]"
              : "border-[var(--app-border)] bg-[var(--app-card)] hover:border-[var(--app-primary)]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#B8651A]/15 text-[#B8651A] flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#26332F]">
                  {t("ajustes.tema_claro", "Tema Claro")}
                </h4>
                <span className="text-[10px] text-[#55645E]">Contraste 12.5:1 (WCAG AA)</span>
              </div>
            </div>
            {temaAtivo === "claro" && (
              <div className="w-6 h-6 rounded-full bg-[var(--app-primary)] text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Mini Amostra de Cores Claro */}
          <div className="p-3 rounded-2xl bg-[#EEF2EC] border border-[#D9DFD3] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#26332F]">
              <span>Cartão de Estudo</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#3F7D58] text-white">Ativo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#B8651A]" title="Primária" />
              <span className="w-4 h-4 rounded-full bg-[#5F8F86]" title="Acento" />
              <span className="w-4 h-4 rounded-full bg-[#3F7D58]" title="Sucesso" />
              <span className="w-4 h-4 rounded-full bg-[#B7791F]" title="Alerta" />
            </div>
          </div>
        </button>

        {/* CARD TEMA ESCURO */}
        <button
          type="button"
          onClick={() => handleSelectTema("escuro")}
          className={`relative p-5 rounded-3xl border-2 text-left transition-all cursor-pointer shadow-sm hover:shadow-md ${
            temaAtivo === "escuro"
              ? "border-[var(--app-primary)] ring-2 ring-[var(--app-primary)]/30 bg-[#182126]"
              : "border-[var(--app-border)] bg-[var(--app-card)] hover:border-[var(--app-primary)]/40"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#F0A04B]/15 text-[#F0A04B] flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#E4ECE9]">
                  {t("ajustes.tema_escuro", "Tema Escuro")}
                </h4>
                <span className="text-[10px] text-[#9FB0AA]">Contraste 13.4:1 (WCAG AA)</span>
              </div>
            </div>
            {temaAtivo === "escuro" && (
              <div className="w-6 h-6 rounded-full bg-[var(--app-primary)] text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Mini Amostra de Cores Escuro */}
          <div className="p-3 rounded-2xl bg-[#0F1518] border border-[#263238] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#E4ECE9]">
              <span>Cartão de Estudo</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4E9A6F] text-white">Ativo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#F0A04B]" title="Primária" />
              <span className="w-4 h-4 rounded-full bg-[#7FB5AB]" title="Acento" />
              <span className="w-4 h-4 rounded-full bg-[#4E9A6F]" title="Sucesso" />
              <span className="w-4 h-4 rounded-full bg-[#D4902B]" title="Alerta" />
            </div>
          </div>
        </button>
      </div>

      {/* Botão Seguir Preferência do Sistema */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSeguirSistema}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] text-xs font-bold transition cursor-pointer"
        >
          <Laptop className="w-4 h-4 text-[var(--app-primary)]" />
          <span>{t("ajustes.seguir_sistema", "Seguir automaticamente o tema do sistema operacional")}</span>
        </button>
      </div>
    </div>
  );
};

export default AppearanceSection;
