import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  ShoppingBag,
  ArrowRightLeft,
  Award,
  CheckCircle2,
  Lock,
  Star,
  ChevronRight,
  Info,
  Gift,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CardAlbumCollection, CardDefinition, CardPackType, UserCardInventory } from "../types";
import { COLLECTIONS_DATA, CARDS_MAP } from "../data/cardsData";
import { CARD_PACKS_CONFIG } from "../data/packsData";
import {
  claimAlbumCompletion,
  craftMissingCard,
  openCardPack,
  recycleDuplicateCard,
} from "../services/cardService";
import { CardItem } from "./CardItem";
import { CardDetailModal } from "./CardDetailModal";
import { CardPackOpenerModal } from "./CardPackOpenerModal";

interface CardsAlbumViewProps {
  userCoins: number;
  userLevel: number;
  inventory: UserCardInventory;
  onUpdateInventory: (newInv: UserCardInventory) => void;
  onConsumeCoins: (amount: number) => void;
  onRewardCoins: (coins: number) => void;
  onRewardXp: (xp: number) => void;
  onOpenTradingMarket: () => void;
}

export const CardsAlbumView: React.FC<CardsAlbumViewProps> = ({
  userCoins,
  userLevel,
  inventory,
  onUpdateInventory,
  onConsumeCoins,
  onRewardCoins,
  onRewardXp,
  onOpenTradingMarket,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    COLLECTIONS_DATA[0].id
  );
  const [selectedCardForDetail, setSelectedCardForDetail] = useState<CardDefinition | null>(null);
  const [isPackStoreOpen, setIsPackStoreOpen] = useState(false);

  // Estados de abertura de pacote
  const [packOpenerOpen, setPackOpenerOpen] = useState(false);
  const [currentPackDrops, setCurrentPackDrops] = useState<any[]>([]);
  const [currentPackDef, setCurrentPackDef] = useState<any>(null);
  const [pendingInventory, setPendingInventory] = useState<UserCardInventory | null>(null);

  const selectedCollection =
    COLLECTIONS_DATA.find((c) => c.id === selectedCollectionId) || COLLECTIONS_DATA[0];

  // Estatísticas globais do álbum
  const totalCardsInGame = 90;
  const ownedCardsCount = Object.keys(inventory.cards).filter(
    (k) => (inventory.cards[k] || 0) > 0
  ).length;
  const globalProgress = Math.round((ownedCardsCount / totalCardsInGame) * 100);

  // Estatísticas da coleção atual
  const collectionOwnedCount = selectedCollection.cards.filter(
    (c) => (inventory.cards[c.id] || 0) > 0
  ).length;
  const isCollectionComplete = collectionOwnedCount === selectedCollection.totalCards;
  const isAlreadyClaimed = inventory.completedCollections.includes(selectedCollection.id);

  // Abertura de Pacote
  const handleBuyAndOpenPack = (packType: CardPackType) => {
    const packDef = CARD_PACKS_CONFIG[packType];
    if (!packDef) return;

    if (packDef.canBuyWithCoins && packDef.costCoins > 0) {
      if (userCoins < packDef.costCoins) {
        alert(`Saldo insuficiente! Você precisa de ${packDef.costCoins} IF Coins.`);
        return;
      }
      onConsumeCoins(packDef.costCoins);
    }

    const { drops, updatedInventory } = openCardPack(packType, inventory);
    setCurrentPackDrops(drops);
    setCurrentPackDef(packDef);
    setPendingInventory(updatedInventory);
    setIsPackStoreOpen(false);
    setPackOpenerOpen(true);
  };

  const handleCollectPackDrops = () => {
    if (pendingInventory) {
      onUpdateInventory(pendingInventory);
      setPendingInventory(null);
    }
  };

  // Reivindicar Recompensa de Conclusão do Álbum
  const handleClaimReward = () => {
    const res = claimAlbumCompletion(selectedCollection.id, inventory);
    if (res.success && res.reward) {
      onUpdateInventory(res.updatedInventory);
      onRewardCoins(res.reward.coins);
      onRewardXp(res.reward.xp);

      try {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#EAB308", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"],
        });
      } catch {}
    }
  };

  // Reciclar repetida
  const handleRecycle = (cardId: string) => {
    const res = recycleDuplicateCard(cardId, inventory);
    if (res.success) {
      onUpdateInventory(res.updatedInventory);
      setSelectedCardForDetail(null);
    }
  };

  // Forjar carta faltante
  const handleCraft = (cardId: string) => {
    const res = craftMissingCard(cardId, inventory);
    if (res.success) {
      onUpdateInventory(res.updatedInventory);
      setSelectedCardForDetail(null);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* HUD SUPERIOR: RESUMO DO ÁLBUM & BOTÕES RÁPIDOS */}
      <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/20">
            📖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Álbum de Coleções IFES</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black">
                {globalProgress}% COMPLETO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {ownedCardsCount} de {totalCardsInGame} cartas conquistadas • {inventory.completedCollections.length} de 10 álbuns finalizados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Saldo de Fragmentos Estelares */}
          <div className="px-3.5 py-2 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center gap-2 text-xs font-bold text-purple-200">
            <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
            <span>{inventory.starShards} Fragmentos</span>
          </div>

          {/* Botão Mercado de Trocas */}
          <button
            onClick={onOpenTradingMarket}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <span>Trocas</span>
          </button>

          {/* Botão Loja de Pacotes */}
          <button
            onClick={() => setIsPackStoreOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Comprar Pacotes</span>
          </button>
        </div>
      </div>

      {/* SELETOR CARROSSEL DAS 10 COLEÇÕES */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2.5 min-w-max">
          {COLLECTIONS_DATA.map((col, idx) => {
            const isSelected = col.id === selectedCollection.id;
            const isCompleted = inventory.completedCollections.includes(col.id);
            const count = col.cards.filter((c) => (inventory.cards[c.id] || 0) > 0).length;
            const isLocked = userLevel < col.unlockLevel;

            return (
              <button
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  isSelected
                    ? "bg-white text-slate-950 shadow-lg scale-105"
                    : isLocked
                    ? "bg-slate-900/60 text-slate-500 border border-slate-800"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span className="text-base">{col.icon}</span>
                <span>{col.name}</span>

                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                ) : isLocked ? (
                  <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                    <Lock className="w-3 h-3" /> Nv.{col.unlockLevel}
                  </span>
                ) : (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                      isSelected ? "bg-slate-200 text-slate-900" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {count}/{col.totalCards}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* BANNER HERÓICO DA COLEÇÃO SELECIONADA */}
      <div
        className={`p-6 rounded-3xl bg-gradient-to-r ${selectedCollection.bannerGradient} text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6`}
      >
        <div className="z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-black uppercase tracking-wider text-amber-200 mb-1">
            <span>{selectedCollection.category}</span>
            <span>•</span>
            <span>{collectionOwnedCount} de {selectedCollection.totalCards} Cartas</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black drop-shadow-md">
            {selectedCollection.name}
          </h3>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mt-1">
            {selectedCollection.description}
          </p>
        </div>

        {/* Bloco de Recompensa da Coleção */}
        <div className="z-10 bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center md:items-end text-center md:text-right min-w-[200px]">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
            <Gift className="w-3 h-3" /> Recompensa de Conclusão
          </span>
          <div className="text-sm font-black text-white mt-1">
            +{selectedCollection.completionReward.coins} Moedas • +{selectedCollection.completionReward.xp} XP
          </div>
          <p className="text-[10px] text-white/80">
            Baú {selectedCollection.completionReward.chestType.toUpperCase()} + Insígnia "{selectedCollection.completionReward.badgeTitle}"
          </p>

          {isCollectionComplete && !isAlreadyClaimed && (
            <button
              onClick={handleClaimReward}
              className="mt-3 w-full py-2 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs shadow-lg animate-bounce transition"
            >
              🎉 Reivindicar Recompensa!
            </button>
          )}

          {isAlreadyClaimed && (
            <div className="mt-3 flex items-center gap-1 text-emerald-300 text-xs font-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>Coleção Concluída e Resgatada!</span>
            </div>
          )}
        </div>
      </div>

      {/* GRADE DAS 9 CARTAS DO ÁLBUM (ESTILO COIN MASTER) */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Páginas do Álbum
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Toque em qualquer carta para ver detalhes, reciclar ou forjar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3 sm:gap-4 justify-items-center">
          {selectedCollection.cards.map((card) => {
            const count = inventory.cards[card.id] || 0;
            return (
              <CardItem
                key={card.id}
                card={card}
                count={count}
                onClick={() => setSelectedCardForDetail(card)}
                size="md"
              />
            );
          })}
        </div>
      </div>

      {/* MODAL DETALHADO DE CARTA */}
      <CardDetailModal
        card={selectedCardForDetail}
        count={selectedCardForDetail ? inventory.cards[selectedCardForDetail.id] || 0 : 0}
        userShards={inventory.starShards}
        isOpen={Boolean(selectedCardForDetail)}
        onClose={() => setSelectedCardForDetail(null)}
        onRecycleDuplicate={handleRecycle}
        onCraftCard={handleCraft}
      />

      {/* MODAL DE LOJA DE PACOTES DE CARTAS */}
      {isPackStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-white">Loja de Pacotes de Cartas</h3>
                <p className="text-xs text-slate-400">
                  Adquira pacotes com suas IF Coins para completar coleções e desvendar cartas douradas
                </p>
              </div>
              <button
                onClick={() => setIsPackStoreOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(CARD_PACKS_CONFIG).map((pack) => (
                <div
                  key={pack.id}
                  className={`p-4 rounded-2xl bg-gradient-to-b ${pack.bgGradient} border border-slate-700/80 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-300">
                        {pack.cardCount} CARTAS
                      </span>
                      {pack.guaranteedRarity && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                          Garante {pack.guaranteedRarity.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-white mt-1">{pack.name}</h4>
                    <p className="text-xs text-slate-300 mt-1">{pack.description}</p>

                    {/* Probabilidades Transparentes */}
                    <div className="mt-3 pt-2 border-t border-white/10 text-[10px] text-slate-300 flex flex-wrap gap-2">
                      <span>Rara: {pack.probabilities.rara}%</span>
                      <span>Épica: {pack.probabilities.epica}%</span>
                      <span>Lendária: {pack.probabilities.lendaria}%</span>
                      <span>Dourada: {pack.probabilities.goldenChance}%</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="text-xs font-black text-amber-400">
                      {pack.canBuyWithCoins ? `🪙 ${pack.costCoins} IF Coins` : "⭐ Recompensa de Evento"}
                    </div>

                    {pack.canBuyWithCoins ? (
                      <button
                        onClick={() => handleBuyAndOpenPack(pack.id)}
                        disabled={userCoins < pack.costCoins}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                          userCoins >= pack.costCoins
                            ? "bg-amber-400 hover:bg-yellow-300 text-slate-950 shadow-md"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        Comprar & Abrir
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Disponível em Eventos</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ABERTURA ANIMADA DE PACOTES */}
      <CardPackOpenerModal
        isOpen={packOpenerOpen}
        onClose={() => setPackOpenerOpen(false)}
        packDef={currentPackDef}
        drops={currentPackDrops}
        onCollectAll={handleCollectPackDrops}
      />
    </div>
  );
};
