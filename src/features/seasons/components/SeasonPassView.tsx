import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, CheckCircle2, Lock, Gift, Timer, Award } from "lucide-react";
import confetti from "canvas-confetti";
import { CURRENT_SEASON } from "../data/seasonsData";
import { claimSeasonTier, loadUserSeasonProgress } from "../services/seasonService";
import { UserSeasonProgress } from "../types";

interface SeasonPassViewProps {
  onRewardCoins: (amount: number) => void;
  onRewardXp: (amount: number) => void;
  onRewardShards?: (amount: number) => void;
}

export const SeasonPassView: React.FC<SeasonPassViewProps> = ({
  onRewardCoins,
  onRewardXp,
  onRewardShards,
}) => {
  const [progress, setProgress] = useState<UserSeasonProgress>(() =>
    loadUserSeasonProgress(CURRENT_SEASON.id)
  );

  const [timeLeftStr, setTimeLeftStr] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const diff = Math.max(0, CURRENT_SEASON.endsAt - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setTimeLeftStr(`${days} dias e ${hours}h restantes`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = (tierLevel: number) => {
    const res = claimSeasonTier(tierLevel, progress);
    if (res.success && res.reward) {
      setProgress(res.updatedProgress);

      if (res.reward.type === "coins") {
        onRewardCoins(res.reward.amount);
      } else if (res.reward.type === "xp") {
        onRewardXp(res.reward.amount);
      } else if (res.reward.type === "shards" && onRewardShards) {
        onRewardShards(res.reward.amount);
      }

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6366F1", "#A855F7", "#EC4899", "#F59E0B"],
        });
      } catch {}
    }
  };

  return (
    <div className="space-y-6">
      {/* BANNER HERÓICO DA TEMPORADA */}
      <div
        className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${CURRENT_SEASON.bannerGradient} text-white shadow-2xl relative overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-amber-300 font-black text-xs uppercase tracking-wider">
                TEMPORADA ATIVA
              </span>
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-cyan-300" />
                <span>{timeLeftStr}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black drop-shadow-md">
              {CURRENT_SEASON.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
              {CURRENT_SEASON.description}
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[200px]">
            <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">
              Seu Nível na Temporada
            </span>
            <div className="text-3xl font-black text-white my-1">
              Nível {progress.currentTier}
            </div>
            <p className="text-xs text-white/80">{progress.seasonXp} XP de Temporada</p>
          </div>
        </div>
      </div>

      {/* TRILHA DOS 30 NÍVEIS DA TEMPORADA */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Trilha de Recompensas Gratuitas (30 Níveis)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {progress.claimedTiers.length} de 30 recompensas resgatadas
          </span>
        </div>

        {/* Grade / Lista de Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {CURRENT_SEASON.tiers.map((tier) => {
            const isUnlocked = progress.currentTier >= tier.level;
            const isClaimed = progress.claimedTiers.includes(tier.level);
            const canClaim = isUnlocked && !isClaimed;

            return (
              <div
                key={tier.level}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isClaimed
                    ? "bg-slate-900/60 border-slate-800 opacity-60"
                    : canClaim
                    ? "bg-gradient-to-b from-indigo-900/60 to-purple-950/60 border-indigo-400 shadow-lg shadow-indigo-500/20"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-black">
                    <span
                      className={`${
                        canClaim ? "text-amber-300 font-black" : "text-slate-400"
                      }`}
                    >
                      NÍVEL {tier.level}
                    </span>
                    <span className="text-xl">{tier.freeReward.icon}</span>
                  </div>

                  <h5 className="font-extrabold text-xs text-white mt-2 leading-tight">
                    {tier.freeReward.label}
                  </h5>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Requer {tier.xpRequired} XP
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80">
                  {isClaimed ? (
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resgatado</span>
                    </div>
                  ) : canClaim ? (
                    <button
                      onClick={() => handleClaim(tier.level)}
                      className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-md animate-pulse"
                    >
                      Coletar!
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloqueado</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
