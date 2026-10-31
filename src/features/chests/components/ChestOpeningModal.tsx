import React, { useState } from "react";
import { Sparkles, Coins, Star, Gift, CheckCircle2, ChevronRight, Award } from "lucide-react";
import confetti from "canvas-confetti";
import { ChestDropResult } from "../types";
import { CHESTS_CONFIG } from "../services/chestService";

interface ChestOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  dropResult: ChestDropResult | null;
  onCollect: (drops: ChestDropResult) => void;
}

export const ChestOpeningModal: React.FC<ChestOpeningModalProps> = ({
  isOpen,
  onClose,
  dropResult,
  onCollect,
}) => {
  if (!isOpen || !dropResult) return null;

  const [phase, setPhase] = useState<"locked" | "opened">("locked");
  const chestDef = CHESTS_CONFIG[dropResult.chestType] || CHESTS_CONFIG.madeira;

  const handleOpenChest = () => {
    setPhase("opened");

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#F59E0B", "#FBBF24", "#10B981", "#3B82F6", "#EC4899"],
      });
    } catch {}
  };

  const handleFinish = () => {
    onCollect(dropResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col items-center text-center overflow-hidden">
        {/* Glow de fundo */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none blur-3xl"
          style={{ backgroundColor: chestDef.accentColor }}
        />

        {phase === "locked" ? (
          <div className="flex flex-col items-center py-6 animate-in zoom-in-95 duration-300">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-2">
              Baú Conquistado
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">
              {chestDef.name}
            </h2>

            {/* O Baú Vibrando */}
            <div
              onClick={handleOpenChest}
              className={`w-44 h-44 sm:w-52 sm:h-52 rounded-3xl bg-gradient-to-b ${chestDef.bgGradient} border-2 border-amber-500/60 p-5 shadow-[0_0_50px_rgba(245,158,11,0.3)] cursor-pointer select-none transform hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col justify-center items-center relative group animate-bounce`}
            >
              <div className="text-7xl drop-shadow-2xl mb-2">{chestDef.icon}</div>
              <div className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Toque para Destrancar
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-6 max-w-xs">
              Gire a chave para liberar moedas, pontos de experiência e pacotes de cartas exclusivos!
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center py-2 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Baú Aberto com Sucesso!</span>
            </div>

            <h3 className="text-2xl font-black text-white mb-5">Recompensas Liberadas</h3>

            {/* Drops em Cards Resplandecentes */}
            <div className="w-full space-y-2.5 my-2">
              {/* Moedas */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-black">
                    🪙
                  </div>
                  <div className="text-left">
                    <h5 className="font-extrabold text-sm text-white">IF Coins</h5>
                    <p className="text-[10px] text-slate-400">Moeda oficial da economia</p>
                  </div>
                </div>
                <div className="text-lg font-black text-amber-400">+{dropResult.coins}</div>
              </div>

              {/* XP */}
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-black">
                    ⚡
                  </div>
                  <div className="text-left">
                    <h5 className="font-extrabold text-sm text-white">Pontos de XP</h5>
                    <p className="text-[10px] text-slate-400">Avanço na progressão de nível</p>
                  </div>
                </div>
                <div className="text-lg font-black text-blue-400">+{dropResult.xp}</div>
              </div>

              {/* Fragmentos Estelares */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-black">
                    ⭐
                  </div>
                  <div className="text-left">
                    <h5 className="font-extrabold text-sm text-white">Fragmentos Estelares</h5>
                    <p className="text-[10px] text-slate-400">Para forjar cartas nos álbuns</p>
                  </div>
                </div>
                <div className="text-lg font-black text-purple-300">+{dropResult.starShards}</div>
              </div>

              {/* Pacotes de Cartas Ganhos */}
              {dropResult.packs.map((packType, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black">
                      🃏
                    </div>
                    <div className="text-left">
                      <h5 className="font-extrabold text-sm text-white">
                        Pacote {packType.toUpperCase()}
                      </h5>
                      <p className="text-[10px] text-slate-400">Adicionado à sua coleção</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black">
                    GARANTIDO
                  </span>
                </div>
              ))}

              {/* Insígnia Especial (se conquistada) */}
              {dropResult.badgeAwarded && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-black">
                      🎖️
                    </div>
                    <div className="text-left">
                      <h5 className="font-extrabold text-sm text-white">
                        Insígnia: {dropResult.badgeAwarded}
                      </h5>
                      <p className="text-[10px] text-slate-400">Título honorífico de prestígio</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black">
                    DESBLOQUEADA
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleFinish}
              className="mt-5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Coletar Recompensas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
