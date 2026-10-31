import React, { useState } from "react";
import { Gift, Sparkles, Key, Lock, ChevronRight, Award } from "lucide-react";
import { ChestDropResult, ChestType } from "../types";
import { CHESTS_CONFIG, loadUserChests, openChest, UserChestsVault } from "../services/chestService";
import { ChestOpeningModal } from "./ChestOpeningModal";

interface ChestsVaultViewProps {
  onRewardCoins: (amount: number) => void;
  onRewardXp: (amount: number) => void;
  onRewardShards: (amount: number) => void;
  onOpenCardPackDirectly?: (packType: any) => void;
  onEquipBadge?: (badgeName: string) => void;
}

export const ChestsVaultView: React.FC<ChestsVaultViewProps> = ({
  onRewardCoins,
  onRewardXp,
  onRewardShards,
  onOpenCardPackDirectly,
  onEquipBadge,
}) => {
  const [vault, setVault] = useState<UserChestsVault>(() => loadUserChests());
  const [activeDropResult, setActiveDropResult] = useState<ChestDropResult | null>(null);

  const handleOpenChest = (chestType: ChestType) => {
    const res = openChest(chestType, vault);
    if (res.success && res.dropResult) {
      setVault(res.updatedVault);
      setActiveDropResult(res.dropResult);
    }
  };

  const handleCollectDrops = (drops: ChestDropResult) => {
    onRewardCoins(drops.coins);
    onRewardXp(drops.xp);
    onRewardShards(drops.starShards);
    if (drops.badgeAwarded && onEquipBadge) {
      onEquipBadge(drops.badgeAwarded);
    }
    // Se o baú conferiu pacotes de cartas, abre o primeiro se disponível
    if (drops.packs.length > 0 && onOpenCardPackDirectly) {
      onOpenCardPackDirectly(drops.packs[0]);
    }
    setActiveDropResult(null);
  };

  const totalChestsAvailable = Object.values(vault.chests).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Banner Principal do Cofre de Baús */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Cofre de Baús & Tesouros</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black">
                {totalChestsAvailable} DISPONÍVEIS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Baús conquistados através de torneios, marcos de eventos, temporadas e conquistas de cidades.
            </p>
          </div>
        </div>
      </div>

      {/* Grade com os 6 Baús */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(CHESTS_CONFIG).map((def) => {
          const count = vault.chests[def.id] || 0;
          const hasAvailable = count > 0;

          return (
            <div
              key={def.id}
              className={`p-5 rounded-3xl bg-slate-900 border ${
                hasAvailable
                  ? "border-amber-500/40 shadow-lg shadow-amber-500/5 hover:border-amber-400"
                  : "border-slate-800 opacity-70"
              } flex flex-col justify-between transition-all`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      hasAvailable
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {hasAvailable ? `${count} DISPONÍVEL(IS)` : "0 EM ESTOQUE"}
                  </span>
                  <span className="text-3xl">{def.icon}</span>
                </div>

                <h3 className="text-lg font-black text-white mt-3">{def.name}</h3>
                <p className="text-xs text-cyan-400 font-semibold">{def.subtitle}</p>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{def.description}</p>

                {/* Conteúdo Estimado */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">IF Coins:</span>
                    <span className="font-bold text-amber-400">
                      🪙 {def.coinsRange[0]} - {def.coinsRange[1]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">XP:</span>
                    <span className="font-bold text-blue-400">
                      ⚡ {def.xpRange[0]} - {def.xpRange[1]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pacotes:</span>
                    <span className="font-bold text-emerald-400">
                      {def.guaranteedPacks.map((p) => p.toUpperCase()).join(" + ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão de Abrir */}
              <button
                disabled={!hasAvailable}
                onClick={() => handleOpenChest(def.id)}
                className={`mt-5 w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                  hasAvailable
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md active:scale-95"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Key className="w-4 h-4" />
                <span>{hasAvailable ? "Abrir Baú Agora" : "Bloqueado"}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de Abertura */}
      <ChestOpeningModal
        isOpen={Boolean(activeDropResult)}
        onClose={() => setActiveDropResult(null)}
        dropResult={activeDropResult}
        onCollect={handleCollectDrops}
      />
    </div>
  );
};
