import React, { useState, useEffect } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Timer,
  ChevronRight,
  Gift,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Shield,
  Sparkles,
} from "lucide-react";
import { TournamentDefinition, TournamentLeaderboardEntry, LeagueTier } from "../types";
import { LEAGUES_CONFIG, TOURNAMENTS_CONFIG } from "../data/tournamentsData";
import { fetchTournamentLeaderboard } from "../services/tournamentService";

interface TournamentViewProps {
  userCoins: number;
  userPoints: number;
  onNavigateToActivity: (type: string) => void;
}

export const TournamentView: React.FC<TournamentViewProps> = ({
  userCoins,
  userPoints,
  onNavigateToActivity,
}) => {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(
    TOURNAMENTS_CONFIG[0].id
  );
  const [leaderboard, setLeaderboard] = useState<TournamentLeaderboardEntry[]>([]);
  const [isPrizesOpen, setIsPrizesOpen] = useState(false);

  const activeTournament =
    TOURNAMENTS_CONFIG.find((t) => t.id === selectedTournamentId) || TOURNAMENTS_CONFIG[0];

  useEffect(() => {
    fetchTournamentLeaderboard(activeTournament.id).then(setLeaderboard);
  }, [activeTournament.id]);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const myEntry = leaderboard.find((e) => e.uid === "local_user") || leaderboard[3];

  return (
    <div className="space-y-6">
      {/* SELETOR DOS 6 TORNEIOS */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2.5 min-w-max">
          {TOURNAMENTS_CONFIG.map((t) => {
            const isSelected = t.id === activeTournament.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTournamentId(t.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all ${
                  isSelected
                    ? "bg-white text-slate-950 shadow-lg scale-105"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span className="text-base">{t.icon}</span>
                <span>{t.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* HERO BANNER DO TORNEIO ATIVO */}
      <div
        className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${activeTournament.bannerGradient} text-white shadow-2xl relative overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-amber-300 font-black text-xs uppercase tracking-wider">
              {activeTournament.tagline}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 drop-shadow-md">
              {activeTournament.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
              {activeTournament.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsPrizesOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/20 text-white font-black text-xs flex items-center gap-1.5 transition"
            >
              <Gift className="w-4 h-4 text-amber-300" />
              <span>Ver Tabela de Prêmios</span>
            </button>
          </div>
        </div>
      </div>

      {/* PÓDIO DOS 3 PRIMEIROS COLOCADOS (COIN MASTER STYLE) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 text-center">
          Pódio dos Líderes do IFES
        </h4>

        <div className="flex justify-center items-end gap-3 sm:gap-6 py-2">
          {/* 2º Lugar (Prata) */}
          {top2 && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-3xl shadow-lg">
                  {top2.avatar}
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow">
                  2
                </span>
              </div>
              <h5 className="font-extrabold text-xs text-white mt-1 max-w-[100px] truncate">
                {top2.name}
              </h5>
              <span className="text-[10px] text-slate-400">{top2.campus}</span>
              <span className="text-xs font-black text-amber-400 mt-0.5">{top2.points} pts</span>
              <div className="w-20 sm:w-24 h-16 bg-gradient-to-t from-slate-800 to-slate-700/60 rounded-t-2xl mt-3 flex items-center justify-center text-slate-400 font-black text-sm">
                🥈 2º
              </div>
            </div>
          )}

          {/* 1º Lugar (Ouro Absoluto) */}
          {top1 && (
            <div className="flex flex-col items-center text-center -translate-y-4">
              <div className="relative mb-2">
                <Crown className="w-7 h-7 text-amber-400 fill-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-yellow-200 text-slate-950 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                  {top1.avatar}
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg">
                  1
                </span>
              </div>
              <h5 className="font-black text-sm text-amber-300 mt-1 max-w-[120px] truncate">
                {top1.name}
              </h5>
              <span className="text-[10px] text-slate-400">{top1.campus}</span>
              <span className="text-sm font-black text-amber-400 mt-0.5">{top1.points} pts</span>
              <div className="w-24 sm:w-28 h-24 bg-gradient-to-t from-amber-600/80 to-amber-500/40 border-t-2 border-amber-300 rounded-t-2xl mt-3 flex items-center justify-center text-amber-200 font-black text-base shadow-lg">
                🥇 1º LUGAR
              </div>
            </div>
          )}

          {/* 3º Lugar (Bronze) */}
          {top3 && (
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center text-3xl shadow-lg">
                  {top3.avatar}
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow">
                  3
                </span>
              </div>
              <h5 className="font-extrabold text-xs text-white mt-1 max-w-[100px] truncate">
                {top3.name}
              </h5>
              <span className="text-[10px] text-slate-400">{top3.campus}</span>
              <span className="text-xs font-black text-amber-400 mt-0.5">{top3.points} pts</span>
              <div className="w-20 sm:w-24 h-12 bg-gradient-to-t from-amber-950 to-amber-900/40 rounded-t-2xl mt-3 flex items-center justify-center text-amber-600 font-black text-sm">
                🥉 3º
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CARD DA POSIÇÃO ATUAL DO USUÁRIO */}
      {myEntry && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900 border-2 border-cyan-500/50 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl font-black">
              #{myEntry.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm text-white">{myEntry.name}</h4>
                <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase">
                  SUA POSIÇÃO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Você está na zona de promoção para a{" "}
                <span className="text-amber-300 font-bold">Liga Ouro</span>!
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-amber-400">{myEntry.points} pts</span>
            <span className="text-[10px] text-emerald-400 font-bold block flex items-center justify-end gap-0.5">
              <ArrowUp className="w-3 h-3" /> Subindo
            </span>
          </div>
        </div>
      )}

      {/* TABELA DE CLASSIFICAÇÃO GERAL */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">
          Tabela de Classificação em Tempo Real
        </h4>

        <div className="divide-y divide-slate-800">
          {leaderboard.map((entry) => {
            const isMe = entry.uid === "local_user";
            return (
              <div
                key={entry.uid}
                className={`py-3 px-3 rounded-xl flex items-center justify-between transition ${
                  isMe ? "bg-cyan-950/30 font-bold" : "hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 text-center font-black text-sm ${
                      entry.rank === 1
                        ? "text-amber-400"
                        : entry.rank === 2
                        ? "text-slate-300"
                        : entry.rank === 3
                        ? "text-amber-600"
                        : "text-slate-500"
                    }`}
                  >
                    #{entry.rank}
                  </span>

                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                    {entry.avatar}
                  </div>

                  <div>
                    <h5
                      className={`text-xs font-bold ${
                        isMe ? "text-cyan-300 font-black" : "text-white"
                      }`}
                    >
                      {entry.name}
                    </h5>
                    <p className="text-[10px] text-slate-400">{entry.campus}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-amber-400">
                    {entry.points} pts
                  </span>

                  {entry.changeDirection === "up" && (
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {entry.changeDirection === "down" && (
                    <ArrowDown className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  {entry.changeDirection === "same" && (
                    <Minus className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL DE TABELA DE PRÊMIOS */}
      {isPrizesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-white mb-2">Prêmios do Torneio</h3>
            <p className="text-xs text-slate-400 mb-6">
              Distribuição automática de recompensas ao término do período da rodada:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 uppercase">
                    🥇 1º Colocado
                  </span>
                  <span className="text-xs font-black text-amber-300">Prêmio Máximo</span>
                </div>
                <p className="text-sm font-bold text-white mt-1">
                  🪙 {activeTournament.prizes.top1.coins} Moedas • ⚡ {activeTournament.prizes.top1.xp} XP
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Baú {activeTournament.prizes.top1.chest.toUpperCase()} + Pacote {activeTournament.prizes.top1.pack.toUpperCase()} + Título "{activeTournament.prizes.top1.title}"
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs font-black text-slate-300 uppercase">
                  🥈 Top 2 e 3
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  🪙 {activeTournament.prizes.top2_3.coins} Moedas • ⚡ {activeTournament.prizes.top2_3.xp} XP
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Baú {activeTournament.prizes.top2_3.chest.toUpperCase()} + Pacote {activeTournament.prizes.top2_3.pack.toUpperCase()}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs font-black text-slate-300 uppercase">
                  🥉 Top 4 ao 10
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  🪙 {activeTournament.prizes.top4_10.coins} Moedas • ⚡ {activeTournament.prizes.top4_10.xp} XP
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Baú {activeTournament.prizes.top4_10.chest.toUpperCase()} + Pacote {activeTournament.prizes.top4_10.pack.toUpperCase()}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs font-black text-slate-400 uppercase">
                  Top 11 ao 50
                </span>
                <p className="text-sm font-bold text-white mt-1">
                  🪙 {activeTournament.prizes.top11_50.coins} Moedas • ⚡ {activeTournament.prizes.top11_50.xp} XP
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Pacote {activeTournament.prizes.top11_50.pack.toUpperCase()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPrizesOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
