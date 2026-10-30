import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Star,
  Info,
} from "lucide-react";
import { CidadeTema } from "../types";

interface HudCidadeProps {
  cidade: CidadeTema;
  totalCidades: number;
  cidadesCompletadas: number[];
  saldoMoedas: number;
  totalEstrelas: number;
  maxEstrelas: number;
  somHabilitado: boolean;
  onAlternarSom: () => void;
  onMudarCidade: (id: number) => void;
  onAbrirInfo: () => void;
}

export const HudCidade: React.FC<HudCidadeProps> = ({
  cidade,
  totalCidades,
  cidadesCompletadas,
  saldoMoedas,
  totalEstrelas,
  maxEstrelas,
  somHabilitado,
  onAlternarSom,
  onMudarCidade,
  onAbrirInfo,
}) => {
  const porcentagem = Math.min(100, Math.round((totalEstrelas / maxEstrelas) * 100));
  const temAnterior = cidade.id > 1;
  const temProxima = cidade.id < totalCidades;
  const proximaDesbloqueada = cidadesCompletadas.includes(cidade.id);

  return (
    <div className="absolute top-2.5 left-2.5 right-2.5 z-30 pointer-events-none select-none">
      {/* Barra Única Superior: Minimalista e Elegante em Qualquer Tela */}
      <div className="flex items-center justify-between gap-2">
        {/* Lado Esquerdo: Seletor de Cidades com Indicador de Estrelas Integrado */}
        <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 rounded-2xl p-1 shadow-2xl pointer-events-auto">
          <button
            type="button"
            onClick={() => temAnterior && onMudarCidade(cidade.id - 1)}
            disabled={!temAnterior}
            aria-label="Vila Anterior"
            className="p-1 sm:p-1.5 rounded-xl text-amber-300 hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition active:scale-90"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <div className="px-1.5 sm:px-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-400/90 leading-none">
                Vila {cidade.id}/{totalCidades}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 flex items-center gap-0.5">
                • {totalEstrelas}/{maxEstrelas}★
              </span>
            </div>
            <span className="text-[11px] sm:text-xs md:text-sm font-black text-white tracking-tight whitespace-nowrap block mt-0.5">
              {cidade.nome}
            </span>
          </div>

          <button
            type="button"
            onClick={() => temProxima && onMudarCidade(cidade.id + 1)}
            disabled={!temProxima}
            aria-label="Próxima Vila"
            className={`p-1 sm:p-1.5 rounded-xl text-amber-300 hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition active:scale-90 ${
              proximaDesbloqueada ? "text-emerald-400" : ""
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Centro: Barra de Progresso Dourada (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-amber-500/30 shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-black font-mono text-white">
              {porcentagem}%
            </span>
          </div>
          <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-500"
              style={{ width: `${porcentagem}%` }}
            />
          </div>
        </div>

        {/* Lado Direito: Saldo de IF Coins & Ações Utilitárias */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Saldo de IF Coins */}
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-amber-400 text-amber-300 shadow-2xl">
            <span className="text-sm sm:text-base">🪙</span>
            <span className="text-xs sm:text-sm font-black font-mono tracking-tight text-white">
              {saldoMoedas}
            </span>
          </div>

          {/* Botão de Som */}
          <button
            type="button"
            onClick={onAlternarSom}
            aria-label={somHabilitado ? "Desativar sons" : "Ativar sons"}
            className="p-1.5 sm:p-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900 shadow-lg cursor-pointer transition active:scale-90"
          >
            {somHabilitado ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
            )}
          </button>

          {/* Botão de Informações / Inspiração Geográfica */}
          <button
            type="button"
            onClick={onAbrirInfo}
            aria-label="Informações sobre a cidade"
            className="p-1.5 sm:p-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900 shadow-lg cursor-pointer transition active:scale-90"
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
