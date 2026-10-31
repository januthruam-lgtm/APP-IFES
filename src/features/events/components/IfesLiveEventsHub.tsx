import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Timer,
  Trophy,
  Flame,
  ArrowRight,
  Gift,
  Calendar,
  Layers,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { LiveEvent, UserEventParticipation } from "../types";
import {
  ACTIVE_SURPRISE_BOOSTS,
  PRIMARY_LIVE_EVENT,
  SECONDARY_LIVE_EVENTS,
} from "../data/eventsData";
import {
  claimEventMilestone,
  loadEventParticipation,
} from "../services/eventService";
import { MilestoneTrackBar } from "./MilestoneTrackBar";

interface IfesLiveEventsHubProps {
  onRewardCoins: (amount: number) => void;
  onRewardXp: (amount: number) => void;
  onRewardShards?: (amount: number) => void;
  onNavigateToGames: () => void;
  onNavigateToQuizzes?: () => void;
  onNavigateToCity?: () => void;
  onOpenAlbum?: () => void;
}

export const IfesLiveEventsHub: React.FC<IfesLiveEventsHubProps> = ({
  onRewardCoins,
  onRewardXp,
  onRewardShards,
  onNavigateToGames,
  onNavigateToQuizzes,
  onNavigateToCity,
  onOpenAlbum,
}) => {
  const [participation, setParticipation] = useState<UserEventParticipation>(() =>
    loadEventParticipation(PRIMARY_LIVE_EVENT.id)
  );

  // Contagem regressiva em tempo real
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, PRIMARY_LIVE_EVENT.endsAt - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeftStr(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Resgate de Marco
  const handleClaimMilestone = (step: number) => {
    const res = claimEventMilestone(step, PRIMARY_LIVE_EVENT, participation);
    if (res.success && res.milestone) {
      setParticipation(res.updatedParticipation);

      // Aplica recompensas conforme o tipo
      if (res.milestone.rewardType === "coins") {
        onRewardCoins(res.milestone.rewardAmount);
      } else if (res.milestone.rewardType === "xp") {
        onRewardXp(res.milestone.rewardAmount);
      } else if (res.milestone.rewardType === "shards" && onRewardShards) {
        onRewardShards(res.milestone.rewardAmount);
      }

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#FBBF24", "#10B981", "#3B82F6", "#EC4899"],
        });
      } catch {}
    }
  };

  return (
    <div className="space-y-6">
      {/* BANNER PRINCIPAL HERÓICO COM CONTAGEM REGRESSIVA */}
      <div
        className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${PRIMARY_LIVE_EVENT.bannerGradient} text-white shadow-2xl relative overflow-hidden`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-amber-300 font-black text-xs uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-300" />
                {PRIMARY_LIVE_EVENT.tag}
              </span>

              {/* Temporizador em Tempo Real */}
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-mono text-xs font-bold flex items-center gap-1.5 border border-white/20">
                <Timer className="w-3.5 h-3.5 text-cyan-300" />
                <span>Termina em: {timeLeftStr}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black drop-shadow-md">
              {PRIMARY_LIVE_EVENT.title}
            </h2>

            <p className="text-xs sm:text-sm text-white/90 max-w-2xl leading-relaxed">
              {PRIMARY_LIVE_EVENT.subtitle}
            </p>

            <p className="text-[11px] text-amber-200 font-semibold">
              🎯 {PRIMARY_LIVE_EVENT.metricDescription}
            </p>
          </div>

          {/* Atalhos Rápidos para Ganhar Pontos de Evento */}
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col gap-2 w-full lg:w-auto min-w-[240px]">
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
              Como Ganhar Pontos Agora:
            </span>

            <button
              onClick={onNavigateToGames}
              className="w-full py-2 px-3 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 font-bold text-xs flex items-center justify-between transition"
            >
              <span>🎮 Jogar Minigames</span>
              <span className="text-[10px] text-amber-300 font-black">+25 pts</span>
            </button>

            {onNavigateToCity && (
              <button
                onClick={onNavigateToCity}
                className="w-full py-2 px-3 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 font-bold text-xs flex items-center justify-between transition"
              >
                <span>🏛️ Construir Cidades</span>
                <span className="text-[10px] text-amber-300 font-black">+50 pts</span>
              </button>
            )}

            {onOpenAlbum && (
              <button
                onClick={onOpenAlbum}
                className="w-full py-2 px-3 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-950 font-bold text-xs flex items-center justify-between transition"
              >
                <span>🃏 Abrir Pacotes</span>
                <span className="text-[10px] text-amber-300 font-black">+20 pts</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TRILHA DE MARCOS INTERATIVA */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <MilestoneTrackBar
          event={PRIMARY_LIVE_EVENT}
          participation={participation}
          onClaimMilestone={handleClaimMilestone}
        />
      </div>

      {/* MULTIPLICADORES & BOOSTS ATIVOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACTIVE_SURPRISE_BOOSTS.map((boost) => (
          <div
            key={boost.id}
            className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-black">
                {boost.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-white">{boost.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                    ATIVO
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{boost.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EVENTOS SECUNDÁRIOS EM ANDAMENTO */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Outros Eventos Especiais Ativos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECONDARY_LIVE_EVENTS.map((sec) => (
            <div
              key={sec.id}
              className={`p-6 rounded-3xl bg-gradient-to-br ${sec.bannerGradient} border border-white/20 text-white shadow-xl flex flex-col justify-between`}
            >
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider">
                  {sec.tag}
                </span>
                <h4 className="text-xl font-black mt-2">{sec.title}</h4>
                <p className="text-xs text-white/90 mt-1">{sec.subtitle}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-[11px] text-amber-200 font-semibold">
                  {sec.metricDescription}
                </span>
                <button
                  onClick={onOpenAlbum}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-black text-xs flex items-center gap-1 hover:bg-amber-300 transition"
                >
                  <span>Participar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
