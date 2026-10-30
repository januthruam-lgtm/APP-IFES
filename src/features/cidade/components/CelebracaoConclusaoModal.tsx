import React from "react";
import { Trophy, Star, ChevronRight, Award, Sparkles } from "lucide-react";
import { CidadeTema } from "../types";

interface CelebracaoConclusaoModalProps {
  cidade: CidadeTema;
  proximaCidadeId?: number;
  onAvancar: () => void;
  onFechar: () => void;
}

export const CelebracaoConclusaoModal: React.FC<CelebracaoConclusaoModalProps> = ({
  cidade,
  proximaCidadeId,
  onAvancar,
  onFechar,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-3 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Efeitos de Luz de Fundo */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-400/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-emerald-400/25 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center space-y-3">
          {/* Troféu com Animação Dourada */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-4 border-white text-slate-950 shadow-2xl animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vila Conquistada! 🏆
          </h2>

          <div className="flex items-center gap-1 text-amber-300 font-extrabold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Todas as 5 obras de {cidade.nome} completadas!</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
            Seu esforço e dedicação acadêmica elevaram a vila ao patamar máximo de desenvolvimento!
          </p>

          {/* Recompensas Conquistadas */}
          <div className="w-full bg-slate-950/70 rounded-2xl p-3 border border-amber-500/40 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Moedas Bônus</span>
              <span className="text-sm font-black font-mono text-amber-300">
                +{cidade.recompensaConclusao.moedas} 🪙
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">XP Conquistado</span>
              <span className="text-sm font-black font-mono text-emerald-400">
                +{cidade.recompensaConclusao.xp} XP
              </span>
            </div>
          </div>

          {/* Título Acadêmico Desbloqueado */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs font-bold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Título: {cidade.recompensaConclusao.titulo}</span>
          </div>

          {/* Botão de Ação */}
          <div className="w-full space-y-2 pt-2">
            {proximaCidadeId ? (
              <button
                type="button"
                onClick={onAvancar}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Avançar para a Próxima Vila</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onFechar}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition cursor-pointer"
              >
                Continuar Explorando
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
