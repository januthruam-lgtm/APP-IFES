import React from "react";
import { Hammer, Lock, Star, Sparkles, CheckCircle2 } from "lucide-react";
import { MonumentoDefinicao } from "../types";

interface BotaoConstruirMonumentoProps {
  monumento: MonumentoDefinicao;
  nivelAtual: number;
  custoProximo: number;
  saldoMoedas: number;
  isEvoluindo: boolean;
  onConstruir: () => void;
}

export const BotaoConstruirMonumento: React.FC<BotaoConstruirMonumentoProps> = ({
  monumento,
  nivelAtual,
  custoProximo,
  saldoMoedas,
  isEvoluindo,
  onConstruir,
}) => {
  const estagio = Math.min(5, Math.max(1, nivelAtual));
  const isFinalizado = estagio >= 5;
  const podeConstruir = saldoMoedas >= custoProximo && !isEvoluindo;
  const moedasFaltantes = Math.max(0, custoProximo - saldoMoedas);

  const nomeEstagio = monumento.estagios[estagio]?.nome || `Estágio ${estagio}`;

  return (
    <div className="flex flex-col items-center mt-1 sm:mt-1.5 pointer-events-auto select-none">
      {/* 1. Nome da Construção & Indicador de Estrelas */}
      <div className="flex flex-col items-center mb-1">
        <span className="text-[11px] sm:text-xs font-black text-white px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-700/60 shadow-lg tracking-tight whitespace-nowrap drop-shadow-md">
          {monumento.nome}
        </span>

        {/* As 5 Estrelas Douradas da Obra */}
        <div className="flex items-center gap-0.5 mt-0.5 bg-slate-950/70 px-1.5 py-0.5 rounded-full border border-slate-800">
          {[1, 2, 3, 4, 5].map((estrela) => {
            const preenchida = estrela <= estagio;
            return (
              <Star
                key={estrela}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                  preenchida
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]"
                    : "fill-slate-800 text-slate-700"
                }`}
              />
            );
          })}
          {nivelAtual > 5 && (
            <span className="text-[9px] font-black text-cyan-300 ml-1">
              +{nivelAtual - 5}
            </span>
          )}
        </div>
      </div>

      {/* 2. Botão Flutuante de Construção (Diretamente Abaixo do Monumento) */}
      {isFinalizado ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-400/60 text-amber-300 text-xs font-black shadow-xl">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Obra Completa!</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (podeConstruir) {
              onConstruir();
            }
          }}
          disabled={!podeConstruir || isEvoluindo}
          aria-label={`Construir ${monumento.nome} por ${custoProximo} IF Coins`}
          className={`group relative flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer shadow-2xl active:scale-95 ${
            isEvoluindo
              ? "bg-amber-400 text-slate-950 border-2 border-white ring-4 ring-amber-400/50 animate-pulse cursor-wait"
              : podeConstruir
              ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-300/60 shadow-[0_4px_16px_rgba(16,185,129,0.5)] hover:scale-105"
              : "bg-slate-900/90 text-slate-400 border border-slate-700 cursor-not-allowed opacity-90"
          }`}
        >
          {isEvoluindo ? (
            <>
              <Hammer className="w-3.5 h-3.5 animate-bounce" />
              <span>Construindo...</span>
            </>
          ) : podeConstruir ? (
            <>
              <Hammer className="w-3.5 h-3.5 text-yellow-300 group-hover:rotate-12 transition-transform" />
              <span>Construir</span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-950/70 text-amber-300 font-mono text-[11px] border border-emerald-400/30">
                <span>🪙</span>
                <span>{custoProximo}</span>
              </span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px]">Faltam {moedasFaltantes} 🪙</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
