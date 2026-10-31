import React from "react";
import { CheckCircle2, Lock, Sparkles, Gift } from "lucide-react";
import confetti from "canvas-confetti";
import { EventMilestone, LiveEvent, UserEventParticipation } from "../types";

interface MilestoneTrackBarProps {
  event: LiveEvent;
  participation: UserEventParticipation;
  onClaimMilestone: (step: number) => void;
}

export const MilestoneTrackBar: React.FC<MilestoneTrackBarProps> = ({
  event,
  participation,
  onClaimMilestone,
}) => {
  const currentPoints = participation.points;
  const milestones = event.milestones;
  const maxPoints = milestones[milestones.length - 1]?.pointsRequired || 2500;
  const progressPercent = Math.min(100, Math.round((currentPoints / maxPoints) * 100));

  return (
    <div className="w-full space-y-4">
      {/* Header com Pontuação e Próximo Marco */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
            Trilha de Marcos da Expedição
          </span>
          <h4 className="text-xl font-black text-white">
            {currentPoints} <span className="text-xs text-slate-400 font-normal">Pontos de Evento</span>
          </h4>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Resgate recompensas conforme avança na trilha</span>
        </div>
      </div>

      {/* Trilha Horizontal Rolável Estilo Coin Master */}
      <div className="relative overflow-x-auto pb-4 pt-2 scrollbar-none">
        <div className="min-w-[800px] sm:min-w-[1000px] relative px-6 py-4">
          {/* Linha de Fundo do Progresso */}
          <div className="absolute top-1/2 left-6 right-6 h-3 bg-slate-800 rounded-full -translate-y-1/2 z-0" />

          {/* Linha Preenchida com Gradiente Brilhante */}
          <div
            className="absolute top-1/2 left-6 h-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full -translate-y-1/2 z-0 transition-all duration-700 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            style={{ width: `calc(${progressPercent}% * 0.9 + 10px)` }}
          />

          {/* Nós / Marcos ao longo da Trilha */}
          <div className="relative z-10 flex items-center justify-between">
            {milestones.map((m) => {
              const isClaimed = participation.claimedMilestones.includes(m.step);
              const canClaim = currentPoints >= m.pointsRequired && !isClaimed;
              const isLocked = currentPoints < m.pointsRequired;

              return (
                <div key={m.step} className="flex flex-col items-center text-center group">
                  {/* Ponto / Nó */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black transition-all select-none ${
                      isClaimed
                        ? "bg-emerald-500 text-white shadow-md border-2 border-emerald-300"
                        : canClaim
                        ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 scale-110 animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.8)] border-2 border-white cursor-pointer"
                        : "bg-slate-900 border-2 border-slate-700 text-slate-500"
                    }`}
                    onClick={() => canClaim && onClaimMilestone(m.step)}
                  >
                    {isClaimed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span>{m.icon}</span>
                    )}
                  </div>

                  {/* Informações do Marco */}
                  <div className="mt-2 text-center">
                    <span className="text-[10px] font-black text-slate-400 block">
                      {m.pointsRequired} pts
                    </span>
                    <span
                      className={`text-[11px] font-extrabold truncate max-w-[90px] block ${
                        isClaimed
                          ? "text-slate-400 line-through"
                          : canClaim
                          ? "text-amber-300"
                          : "text-slate-300"
                      }`}
                    >
                      {m.rewardLabel}
                    </span>
                  </div>

                  {/* Botão de Resgate se Elegível */}
                  {canClaim && (
                    <button
                      onClick={() => onClaimMilestone(m.step)}
                      className="mt-1 px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-md animate-pulse"
                    >
                      Resgatar!
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
