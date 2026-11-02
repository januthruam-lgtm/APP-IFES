import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Layers,
  ArrowRightLeft,
  Gift,
  Sparkles,
  ShoppingBag,
  Award,
  Star,
  ShieldCheck,
} from "lucide-react";
import { UserProfile } from "../../../types";
import { CardsAlbumView } from "../../../features/cards/components/CardsAlbumView";
import { CardTradeMarketView } from "../../../features/cards/components/CardTradeMarketView";
import { ChestsVaultView } from "../../../features/chests/components/ChestsVaultView";
import {
  loadUserCardInventory,
  saveUserCardInventory,
  INITIAL_CARD_INVENTORY,
} from "../../../features/cards/services/cardService";
import { UserCardInventory } from "../../../features/cards/types";
import { loadUserChests } from "../../../features/chests/services/chestService";
import { COLLECTIONS_DATA, CARDS_MAP } from "../../../features/cards/data/cardsData";

export interface ColecaoCanonicalTabProps {
  user: UserProfile;
  initialSubView?: "album" | "trocas" | "baus";
  onRewardCoins: (amount: number) => void;
  onRewardXp: (amount: number) => void;
  onConsumeCoins: (amount: number, origem?: any, descricao?: string, refId?: string, skipLedger?: boolean) => void;
  onEquipBadge?: (badgeName: string) => void;
}

export const ColecaoCanonicalTab: React.FC<ColecaoCanonicalTabProps> = ({
  user,
  initialSubView = "album",
  onRewardCoins,
  onRewardXp,
  onConsumeCoins,
  onEquipBadge,
}) => {
  const { t } = useTranslation();
  const userUid = user.id || user.uid || user.email || "local_user";
  const userLevel = user.level || 1;
  const userCoins = user.coins ?? 250;

  const [activeSubTab, setActiveSubTab] = useState<"album" | "trocas" | "baus">(initialSubView);
  const [inventory, setInventory] = useState<UserCardInventory>(INITIAL_CARD_INVENTORY);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [chestsCount, setChestsCount] = useState<number>(0);

  // Carrega inventário
  useEffect(() => {
    loadUserCardInventory(userUid).then((inv) => {
      setInventory(inv);
      setInventoryLoaded(true);
    });
    try {
      const vault = loadUserChests();
      const total = Object.values(vault.chests).reduce((a, b) => a + b, 0);
      setChestsCount(total);
    } catch {}
  }, [userUid]);

  const handleUpdateInventory = (newInv: UserCardInventory) => {
    setInventory(newInv);
    saveUserCardInventory(newInv, userUid);
  };

  const handleRewardShards = (amount: number) => {
    const updated = {
      ...inventory,
      starShards: (inventory.starShards || 0) + amount,
    };
    handleUpdateInventory(updated);
  };

  // Estatísticas da coleção
  const totalCardsCount = Object.keys(CARDS_MAP).length;
  const ownedCardsCount = Object.keys(inventory.cards).filter(
    (id) => (inventory.cards[id] || 0) > 0
  ).length;
  const completedCollectionsCount = (inventory.completedCollections || []).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Central de Coleção */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-slate-900/80 border border-indigo-500/20 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Central de Coleções IFES
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Oficial
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-1">
              Colecione cartas do saber, troque com a comunidade escolar e abra baús repletos de recompensas
            </p>
          </div>
        </div>

        {/* Resumo Rápido de Cards e Shards */}
        <div className="flex items-center gap-3 bg-black/30 p-2.5 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center px-3 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cartas</span>
            <span className="text-sm font-black text-amber-400">
              {ownedCardsCount}/{totalCardsCount}
            </span>
          </div>
          <div className="w-px h-7 bg-white/10" />
          <div className="text-center px-3 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fragmentos</span>
            <span className="text-sm font-black text-cyan-400 flex items-center gap-1 justify-center">
              <Star className="w-3.5 h-3.5 fill-cyan-400" />
              {inventory.starShards || 0}
            </span>
          </div>
          <div className="w-px h-7 bg-white/10" />
          <div className="text-center px-3 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Baús</span>
            <span className="text-sm font-black text-emerald-400 flex items-center gap-1 justify-center">
              <Gift className="w-3.5 h-3.5" />
              {chestsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navegação em Abas */}
      <div className="flex items-center gap-2 border-b border-[var(--app-border)] pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveSubTab("album")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === "album"
              ? "bg-[var(--app-primary)] text-white shadow-md shadow-[var(--app-primary)]/20"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Álbum de Cartas ({ownedCardsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("trocas")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === "trocas"
              ? "bg-[var(--app-primary)] text-white shadow-md shadow-[var(--app-primary)]/20"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Mercado de Trocas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("baus")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 relative ${
            activeSubTab === "baus"
              ? "bg-[var(--app-primary)] text-white shadow-md shadow-[var(--app-primary)]/20"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Cofre de Baús</span>
          {chestsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>
      </div>

      {/* Conteúdo da Sub-Aba Ativa */}
      {activeSubTab === "album" && (
        <CardsAlbumView
          userCoins={userCoins}
          userLevel={userLevel}
          inventory={inventory}
          onUpdateInventory={handleUpdateInventory}
          onConsumeCoins={(amount, origem, descricao, refId) =>
            onConsumeCoins(amount, origem, descricao, refId)
          }
          onRewardCoins={onRewardCoins}
          onRewardXp={onRewardXp}
          onOpenTradingMarket={() => setActiveSubTab("trocas")}
        />
      )}

      {activeSubTab === "trocas" && (
        <CardTradeMarketView
          userUid={userUid}
          userName={user.name || "Estudante IFES"}
          userCampus={user.ifesAccount?.campusName || "Campus Vitória"}
          inventory={inventory}
          onUpdateInventory={handleUpdateInventory}
          onBackToAlbum={() => setActiveSubTab("album")}
        />
      )}

      {activeSubTab === "baus" && (
        <ChestsVaultView
          userUid={userUid}
          cardInventory={inventory}
          onUpdateCardInventory={handleUpdateInventory}
          onRewardCoins={onRewardCoins}
          onRewardXp={onRewardXp}
          onRewardShards={handleRewardShards}
          onEquipBadge={onEquipBadge}
          onOpenCardPackDirectly={() => setActiveSubTab("album")}
        />
      )}
    </div>
  );
};
