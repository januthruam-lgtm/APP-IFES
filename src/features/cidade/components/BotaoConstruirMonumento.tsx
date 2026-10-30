import React from "react";
import { Hammer, Lock, CheckCircle2 } from "lucide-react";
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

  return (
    <div className="flex flex-col items-center mt-0.5 pointer-events-auto select-none">
      {isFinalizado ? (
        /* Estado Concluído: Selo minimalista e discreto que não polui o cenário */
        <div
          title={`${monumento.nome} - Monumento Concluído (5/5 Estrelas)`}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-xs border border-amber-400/50 text-amber-300 shadow-md text-[10px] font-black tracking-tight"
        >
          <CheckCircle2 className="w-2.5 h-2.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[80px] sm:max-w-[100px] text-slate-100">
            {monumento.nome}
          </span>
          <span className="text-amber-400 font-mono text-[9px] font-extrabold">5/5★</span>
        </div>
      ) : (
        /* Botão Compacto e Discreto de Construção em Linha Única */
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (podeConstruir) {
              onConstruir();
            }
          }}
          disabled={!podeConstruir || isEvoluindo}
          title={`${monumento.nome} (${estagio}/5★) - Custo: ${custoProximo} IF Coins`}
          aria-label={`Construir ${monumento.nome} por ${custoProximo} IF Coins`}
          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all duration-150 shadow-lg active:scale-95 ${
            isEvoluindo
              ? "bg-amber-400 text-slate-950 border border-white ring-2 ring-amber-400/50 cursor-wait animate-pulse"
              : podeConstruir
              ? "bg-slate-950/90 hover:bg-slate-900 text-white border border-emerald-400/70 hover:border-emerald-300 ring-1 ring-emerald-500/30 hover:scale-105 cursor-pointer"
              : "bg-slate-950/80 text-slate-400 border border-slate-700/60 opacity-80 cursor-not-allowed"
          }`}
        >
          {isEvoluindo ? (
            <>
              <Hammer className="w-3 h-3 text-slate-950 animate-bounce" />
              <span className="font-black text-[10px]">Construindo...</span>
            </>
          ) : (
            <>
              {/* Nome compacto da obra */}
              <span className="text-slate-100 font-extrabold tracking-tight truncate max-w-[70px] sm:max-w-[95px]">
                {monumento.nome}
              </span>

              {/* Indicador curto de estágio */}
              <span className="text-amber-400 font-mono text-[9px] font-black">
                {estagio}/5★
              </span>

              <span className="w-px h-2.5 bg-slate-700 shrink-0" />

              {/* Ação com Custo em IF Coins ou Indicador de Moedas Faltantes */}
              {podeConstruir ? (
                <span className="flex items-center gap-0.5 text-emerald-300 font-black font-mono text-[10px]">
                  <Hammer className="w-2.5 h-2.5 text-emerald-400 group-hover:rotate-12 transition-transform shrink-0" />
                  <span>{custoProximo}🪙</span>
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-slate-400 font-mono text-[9px]">
                  <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                  <span>-{moedasFaltantes}🪙</span>
                </span>
              )}
            </>
          )}
        </button>
      )}
    </div>
  );
};
