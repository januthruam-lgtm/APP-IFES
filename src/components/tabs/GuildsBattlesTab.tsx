import React, { useState } from "react";
import {
  Shield,
  Trophy,
  Users,
  Zap,
  Sparkles,
  CheckCircle2,
  Gift,
  Crown,
} from "lucide-react";
import { UserProfile } from "../../types";
import confetti from "canvas-confetti";

interface GuildsBattlesTabProps {
  user: UserProfile;
  onRewardXp: (xp: number) => void;
  onConsumeEnergy: (amount: number) => boolean;
  onAddEnergy: (amount: number) => void;
  onUpdateUserTeam: (teamId: string | null) => void;
}

interface Guild {
  id: string;
  name: string;
  tag: string;
  rank: number;
  totalXp: number;
  membersCount: number;
  description: string;
  badgeEmoji: string;
}

const GUILDS: Guild[] = [
  {
    id: "team-1",
    name: "Ordem dos Algorítmicos",
    tag: "ALGO",
    rank: 1,
    totalXp: 18450,
    membersCount: 24,
    description: "Especialistas em estruturas de dados, grafos e maratona de programação.",
    badgeEmoji: "⚔️",
  },
  {
    id: "team-2",
    name: "Guardiões do Silício",
    tag: "SILC",
    rank: 2,
    totalXp: 15200,
    membersCount: 19,
    description: "Arquitetura de computadores, redes e sistemas embarcados.",
    badgeEmoji: "🛡️",
  },
  {
    id: "team-3",
    name: "Confraria de Turing",
    tag: "TURG",
    rank: 3,
    totalXp: 12800,
    membersCount: 16,
    description: "Cálculo vetorial, inteligência artificial e computação científica.",
    badgeEmoji: "🔮",
  },
];

export const GuildsBattlesTab: React.FC<GuildsBattlesTabProps> = ({
  user,
  onRewardXp,
  onConsumeEnergy,
  onUpdateUserTeam,
}) => {
  const [activeTeamId, setActiveTeamId] = useState<string | null>(user.teamId || "team-1");
  const [chestClaimed, setChestClaimed] = useState(false);

  const handleJoin = (teamId: string) => {
    setActiveTeamId(teamId);
    onUpdateUserTeam(teamId);
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleClaimChest = () => {
    if (chestClaimed) return;
    setChestClaimed(true);
    confetti({ particleCount: 50, spread: 70 });
    onRewardXp(100);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Guildas & Batalhas Semanais</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--app-text)]">
            Torneio Acadêmico de Equipes
          </h1>
          <p className="text-xs text-[var(--app-text-muted)]">
            Estude diariamente, complete tarefas e suba a pontuação da sua guilda no IFES
          </p>
        </div>

        {/* Weekly Chest */}
        <button
          onClick={handleClaimChest}
          disabled={chestClaimed}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition flex items-center gap-2 shadow-xs cursor-pointer ${
            chestClaimed
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 opacity-80"
              : "bg-amber-500 hover:bg-amber-400 text-black border-amber-400 animate-pulse"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>{chestClaimed ? "Baú Semanal Resgatado" : "Resgatar Baú da Guilda (+100 XP)"}</span>
        </button>
      </div>

      {/* Guilds List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GUILDS.map((guild) => {
          const isUserInGuild = activeTeamId === guild.id;
          return (
            <div
              key={guild.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                isUserInGuild
                  ? "bg-[var(--app-card)] border-[var(--app-primary)] shadow-md ring-2 ring-[var(--app-primary)]/20"
                  : "bg-[var(--app-card)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{guild.badgeEmoji}</span>
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      guild.rank === 1
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)]"
                    }`}
                  >
                    #{guild.rank} no Ranking
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[var(--app-text)] flex items-center gap-1.5">
                    {guild.name}
                    <span className="text-xs font-semibold text-[var(--app-text-muted)]">[{guild.tag}]</span>
                  </h3>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1 line-clamp-2">
                    {guild.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between text-xs text-[var(--app-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {guild.membersCount} membros
                  </span>
                  <span className="font-bold text-amber-500">{guild.totalXp} XP</span>
                </div>
              </div>

              <button
                onClick={() => handleJoin(guild.id)}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                  isUserInGuild
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-[var(--app-card-secondary)] hover:bg-[var(--app-primary)] hover:text-white text-[var(--app-text)]"
                }`}
              >
                {isUserInGuild ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sua Guilda Atual</span>
                  </>
                ) : (
                  <span>Participar desta Guilda</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
