import React from "react";
import { X, MapPin, Sparkles, Compass, ShieldCheck } from "lucide-react";
import { CidadeTema } from "../types";

interface CidadeInfoModalProps {
  cidade: CidadeTema;
  onFechar: () => void;
}

export const CidadeInfoModal: React.FC<CidadeInfoModalProps> = ({ cidade, onFechar }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 max-w-lg w-full text-white shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-200">
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Título & Inspiração */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Vila {cidade.id} • Conhecimento Regional
            </span>
            <h3 className="text-xl font-black text-white">{cidade.nome}</h3>
          </div>
        </div>

        {/* Ficha Temática da Cidade */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">Inspiração</span>
            <span className="font-semibold text-amber-200">{cidade.inspiracao}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block">Bioma / Clima</span>
            <span className="font-semibold text-emerald-300">{cidade.bioma}</span>
          </div>
        </div>

        {/* Descrição & Lore */}
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
          <p>
            <strong className="text-white">{cidade.subtitulo}:</strong> Cada edificação desta vila foi
            desenhada com arquitetura, vegetação e materiais inspirados nas paisagens reais e patrimônios
            históricos e ambientais do Espírito Santo.
          </p>
          <p>
            Evolua cada monumento através dos 5 estágios: desde a demarcação inicial do terreno, passando
            pela fundação e estrutura, até a glória da obra finalizada e a conquista da vila!
          </p>
        </div>

        {/* Monumentos da Vila */}
        <div>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-2">
            Monumentos Exclusivos desta Vila
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {cidade.monumentos.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800 text-xs"
              >
                <span className="font-bold text-white">{m.nome}</span>
                <span className="text-[10px] text-slate-400">{m.materiaisPrincipais[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onFechar}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
