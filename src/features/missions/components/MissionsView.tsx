import React, { useState } from "react";
import { CheckCircle2, Gift, Sparkles, Clock, Target, Award } from "lucide-react";
import confetti from "canvas-confetti";
import { DEFAULT_MISSIONS } from "../data/missionsData";
import { MissionDefinition, MissionType } from "../types";

interface MissionsViewProps {
  onRewardCoins: (amount: number) => void;
  onRewardXp: (amount: number) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  onRewardCoins,
  onRewardXp,
}) => {
  const [missions, setMissions] = useState<MissionDefinition[]>(() => {
    try {
      const raw = localStorage.getItem("brain_studio_missions_v3");
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_MISSIONS;
  });

  const [activeTab, setActiveTab] = useState<MissionType>("diaria");

  const saveMissions = (updated: MissionDefinition[]) => {
    setMissions(updated);
    try {
      localStorage.setItem("brain_studio_missions_v3", JSON.stringify(updated));
    } catch {}
  };

  const handleClaim = (missionId: string) => {
    const target = missions.find((m) => m.id === missionId);
    if (!target || target.isClaimed || target.currentCount < target.targetCount) return;

    const updated = missions.map((m) =>
      m.id === missionId ? { ...m, isClaimed: true } : m
    );

    saveMissions(updated);
    onRewardCoins(target.rewardCoins);
    onRewardXp(target.rewardXp);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const filteredMissions = missions.filter((m) => m.type === activeTab);

  return (
    <div className="space-y-6">
      {/* HEADER DAS MISSÕES */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
            🎯
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Missões & Desafios</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete metas diárias e semanais para acumular moedas, XP e pacotes de cartas.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DE TIPO DE MISSÃO */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("diaria")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            activeTab === "diaria"
              ? "bg-white text-slate-950 shadow-md"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Diárias (Renovam à 00:00)
        </button>
        <button
          onClick={() => setActiveTab("semanal")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            activeTab === "semanal"
              ? "bg-white text-slate-950 shadow-md"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Semanais
        </button>
        <button
          onClick={() => setActiveTab("colecao")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition ${
            activeTab === "colecao"
              ? "bg-white text-slate-950 shadow-md"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Desafios de Coleções
        </button>
      </div>

      {/* LISTA DAS MISSÕES */}
      <div className="space-y-3">
        {filteredMissions.map((m) => {
          const progressPercent = Math.min(
            100,
            Math.round((m.currentCount / m.targetCount) * 100)
          );
          const isComplete = m.currentCount >= m.targetCount;

          return (
            <div
              key={m.id}
              className={`p-5 rounded-3xl bg-slate-900 border ${
                m.isClaimed
                  ? "border-slate-800 opacity-60"
                  : isComplete
                  ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                  : "border-slate-800"
              } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                  {m.icon}
                </div>

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-white">{m.title}</h4>
                  <p className="text-xs text-slate-400">{m.description}</p>

                  {/* Barra de Progresso */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-32 sm:w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      {m.currentCount} / {m.targetCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recompensa e Botão de Ação */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-right">
                  <span className="text-xs font-black text-amber-400 block">
                    🪙 +{m.rewardCoins} • ⚡ +{m.rewardXp}
                  </span>
                  {m.rewardPack && (
                    <span className="text-[10px] text-emerald-400 font-bold block">
                      + Pacote {m.rewardPack.toUpperCase()}
                    </span>
                  )}
                  {m.rewardChest && (
                    <span className="text-[10px] text-yellow-300 font-bold block">
                      + Baú de {m.rewardChest.toUpperCase()}
                    </span>
                  )}
                </div>

                {m.isClaimed ? (
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resgatado</span>
                  </div>
                ) : isComplete ? (
                  <button
                    onClick={() => handleClaim(m.id)}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md animate-bounce"
                  >
                    Resgatar!
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs">
                    Em Andamento
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
