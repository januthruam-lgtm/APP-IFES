import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Castle,
  Dog,
  Users,
  ShoppingBag,
  Coins,
  Sparkles,
  Award,
  Radio,
  Gamepad2,
  Flame,
  Layers,
  ArrowRightLeft,
  Trophy,
  Gift,
  Target,
  Compass,
} from "lucide-react";
import { UserProfile, CustomThemeColors, UserPet } from "../../../types";
import { CidadeDoConhecimentoTab } from "../CidadeDoConhecimentoTab";
import { GuildsBattlesTab } from "../GuildsBattlesTab";
import { StoreTab } from "../StoreTab";
import { Pet3DView } from "../../pet3d/Pet3DView";
import { ExtratoMoedasView } from "../../../features/economia/components/ExtratoMoedasView";
import { FidelidadeView } from "../../../features/economia/components/FidelidadeView";
import { GamesHub } from "../../../features/games/components/GamesHub";
import { IfesLiveEventsHub } from "../../../features/events/components/IfesLiveEventsHub";
import { CardsAlbumView } from "../../../features/cards/components/CardsAlbumView";
import { CardTradeMarketView } from "../../../features/cards/components/CardTradeMarketView";
import { TournamentView } from "../../../features/tournaments/components/TournamentView";
import { SeasonPassView } from "../../../features/seasons/components/SeasonPassView";
import { ChestsVaultView } from "../../../features/chests/components/ChestsVaultView";
import { MissionsView } from "../../../features/missions/components/MissionsView";
import {
  loadUserCardInventory,
  saveUserCardInventory,
} from "../../../features/cards/services/cardService";
import { UserCardInventory } from "../../../features/cards/types";
import { Button } from "../../ui/Button";

export type SubViewJogoId =
  | "eventos"
  | "album"
  | "trocas"
  | "torneios"
  | "temporada"
  | "baus"
  | "missoes"
  | "games"
  | "cidade"
  | "pet"
  | "teams"
  | "loja"
  | "carteira"
  | "fidelidade";

export interface JogoTabProps {
  user: UserProfile;
  initialSubView?: string;
  onlineCount?: number;
  currentTheme?: CustomThemeColors;
  onRewardCoins?: (coins: number) => void;
  onRewardXp?: (xp: number) => void;
  onConsumeCoins?: (amount: number) => void;
  onConsumeEnergy?: (amount: number) => boolean;
  onAddEnergy?: (amount: number) => void;
  onUpdateUserTeam?: (teamId: string | null) => void;
  onOpenPrivateChatWithMember?: (member: any) => void;
  onBuyBadge?: (badgeName: string, cost: number) => void;
  onEquipBadge?: (badgeName: string) => void;
  onPermanentEnergyUpgrade?: (additionalMax: number, cost: number) => void;
  onUpdatePet?: (pet: UserPet) => void;
  onOpenOnlineUsers?: () => void;
}

export const JogoTab: React.FC<JogoTabProps> = ({
  user,
  initialSubView,
  onlineCount = 1,
  currentTheme,
  onRewardCoins,
  onRewardXp,
  onConsumeCoins,
  onConsumeEnergy,
  onAddEnergy,
  onUpdateUserTeam,
  onOpenPrivateChatWithMember,
  onBuyBadge,
  onEquipBadge,
  onPermanentEnergyUpgrade,
  onUpdatePet,
  onOpenOnlineUsers,
}) => {
  const { t } = useTranslation();
  const userUid = user.id || user.uid || user.email || "local_user";

  const resolveSubView = (sub?: string): SubViewJogoId => {
    switch (sub) {
      case "eventos":
      case "live":
      case "events":
        return "eventos";
      case "album":
      case "cards":
      case "cartas":
      case "colecoes":
        return "album";
      case "trocas":
      case "trade":
      case "mercado":
        return "trocas";
      case "torneios":
      case "tournaments":
      case "ligas":
        return "torneios";
      case "temporada":
      case "season":
      case "pass":
        return "temporada";
      case "baus":
      case "chests":
      case "cofres":
        return "baus";
      case "missoes":
      case "missions":
      case "desafios":
        return "missoes";
      case "games":
      case "jogos":
      case "minigames":
      case "arena":
        return "games";
      case "cidade":
      case "construcoes":
        return "cidade";
      case "pet":
      case "mascote":
        return "pet";
      case "teams":
      case "equipes":
        return "teams";
      case "loja":
      case "store":
        return "loja";
      case "carteira":
      case "extrato":
        return "carteira";
      case "fidelidade":
        return "fidelidade";
      default:
        return "eventos"; // IFES Live Events como porta de entrada primária!
    }
  };

  const [activeSubView, setActiveSubView] = useState<SubViewJogoId>(() =>
    resolveSubView(initialSubView)
  );

  useEffect(() => {
    if (initialSubView) {
      setActiveSubView(resolveSubView(initialSubView));
    }
  }, [initialSubView]);

  // Inventário de cartas compartilhado
  const [cardInventory, setCardInventory] = useState<UserCardInventory>({
    cards: {},
    starShards: 25,
    completedCollections: [],
    totalPacksOpened: 0,
  });

  useEffect(() => {
    loadUserCardInventory(userUid).then(setCardInventory);
  }, [userUid]);

  const handleUpdateCardInventory = (newInv: UserCardInventory) => {
    setCardInventory(newInv);
    saveUserCardInventory(newInv, userUid);
  };

  const subNavItems = [
    { id: "eventos" as SubViewJogoId, label: "Live Events", icon: Flame, badge: "LIVE" },
    { id: "album" as SubViewJogoId, label: "Álbum & Cartas", icon: Layers, badge: "90" },
    { id: "trocas" as SubViewJogoId, label: "Trocas", icon: ArrowRightLeft },
    { id: "torneios" as SubViewJogoId, label: "Torneios & Ligas", icon: Trophy },
    { id: "temporada" as SubViewJogoId, label: "Temporada 1", icon: Compass },
    { id: "baus" as SubViewJogoId, label: "Baús & Cofres", icon: Gift },
    { id: "missoes" as SubViewJogoId, label: "Missões", icon: Target },
    { id: "games" as SubViewJogoId, label: "Minigames", icon: Gamepad2 },
    { id: "cidade" as SubViewJogoId, label: "Vilas do Saber", icon: Castle },
    { id: "teams" as SubViewJogoId, label: "Equipes", icon: Users },
    { id: "pet" as SubViewJogoId, label: "Mascote 3D", icon: Dog },
    { id: "loja" as SubViewJogoId, label: "Loja", icon: ShoppingBag },
    { id: "carteira" as SubViewJogoId, label: "Carteira", icon: Coins },
    { id: "fidelidade" as SubViewJogoId, label: "Fidelidade", icon: Award },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Sub-navegação das áreas de gamificação */}
      <div className="sticky top-0 z-20 bg-[var(--app-bg)]/95 backdrop-blur-md border-b border-[var(--app-border)] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {subNavItems.map((item) => {
            const isSelected = activeSubView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
                  isSelected
                    ? "bg-[var(--app-primary)] text-white shadow-xs"
                    : "bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] border border-[var(--app-border)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-amber-400/20 text-amber-500 dark:text-amber-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Indicador de Colegas Online */}
        {activeSubView === "teams" && (
          <button
            onClick={onOpenOnlineUsers}
            className="flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0 cursor-pointer hover:bg-emerald-500/20 transition"
            title="Ver colegas de estudo conectados agora"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Radio className="w-3.5 h-3.5" />
            <span>{onlineCount} online</span>
          </button>
        )}
      </div>

      {/* Conteúdo da Área Selecionada */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* 1. CENTRAL DE EVENTOS (IFES LIVE EVENTS) */}
        {activeSubView === "eventos" && (
          <IfesLiveEventsHub
            onRewardCoins={onRewardCoins || (() => {})}
            onRewardXp={onRewardXp || (() => {})}
            onRewardShards={(amount) => {
              handleUpdateCardInventory({
                ...cardInventory,
                starShards: cardInventory.starShards + amount,
              });
            }}
            onNavigateToGames={() => setActiveSubView("games")}
            onNavigateToCity={() => setActiveSubView("cidade")}
            onOpenAlbum={() => setActiveSubView("album")}
          />
        )}

        {/* 2. ÁLBUM DE CARTAS E COLEÇÕES */}
        {activeSubView === "album" && (
          <CardsAlbumView
            userCoins={user.coins ?? 250}
            userLevel={user.level || 1}
            inventory={cardInventory}
            onUpdateInventory={handleUpdateCardInventory}
            onConsumeCoins={onConsumeCoins || (() => {})}
            onRewardCoins={onRewardCoins || (() => {})}
            onRewardXp={onRewardXp || (() => {})}
            onOpenTradingMarket={() => setActiveSubView("trocas")}
          />
        )}

        {/* 3. MERCADO DE TROCAS ENTRE ALUNOS */}
        {activeSubView === "trocas" && (
          <CardTradeMarketView
            userUid={userUid}
            userName={user.name || "Estudante IFES"}
            userCampus={user.ifesAccount?.campusName || "Campus Vitória"}
            inventory={cardInventory}
            onUpdateInventory={handleUpdateCardInventory}
            onBackToAlbum={() => setActiveSubView("album")}
          />
        )}

        {/* 4. TORNEIOS COMPETITIVOS & LIGAS */}
        {activeSubView === "torneios" && (
          <TournamentView
            userCoins={user.coins ?? 250}
            userPoints={user.xp || 1200}
            onNavigateToActivity={(type) => {
              if (type === "conhecimento" || type === "minigames") {
                setActiveSubView("games");
              } else if (type === "construcao") {
                setActiveSubView("cidade");
              } else if (type === "colecionadores") {
                setActiveSubView("album");
              }
            }}
          />
        )}

        {/* 5. PASSE DE TEMPORADA */}
        {activeSubView === "temporada" && (
          <SeasonPassView
            onRewardCoins={onRewardCoins || (() => {})}
            onRewardXp={onRewardXp || (() => {})}
            onRewardShards={(amount) => {
              handleUpdateCardInventory({
                ...cardInventory,
                starShards: cardInventory.starShards + amount,
              });
            }}
          />
        )}

        {/* 6. COFRE DE BAÚS & RECOMPENSAS */}
        {activeSubView === "baus" && (
          <ChestsVaultView
            onRewardCoins={onRewardCoins || (() => {})}
            onRewardXp={onRewardXp || (() => {})}
            onRewardShards={(amount) => {
              handleUpdateCardInventory({
                ...cardInventory,
                starShards: cardInventory.starShards + amount,
              });
            }}
            onOpenCardPackDirectly={() => setActiveSubView("album")}
            onEquipBadge={onEquipBadge}
          />
        )}

        {/* 7. MISSÕES & DESAFIOS */}
        {activeSubView === "missoes" && (
          <MissionsView
            onRewardCoins={onRewardCoins || (() => {})}
            onRewardXp={onRewardXp || (() => {})}
          />
        )}

        {/* 8. MINIGAMES (OS 8 JOGOS DA ARENA) */}
        {activeSubView === "games" && (
          <GamesHub
            user={user}
            onRewardCoins={onRewardCoins}
            onRewardXp={onRewardXp}
            onNavigateToWallet={() => setActiveSubView("carteira")}
          />
        )}

        {/* 9. VILAS DO CONHECIMENTO & CONSTRUÇÃO */}
        {activeSubView === "cidade" && (
          <CidadeDoConhecimentoTab
            user={user}
            onRewardCoins={onRewardCoins}
            onRewardXp={onRewardXp}
            onConsumeCoins={onConsumeCoins}
          />
        )}

        {/* 10. MASCOTE 3D */}
        {activeSubView === "pet" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)]">
                  {user.pet?.name || "Mascote Acadêmico"}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
                  Seu companheiro diário de estudos. Cuide dele para mantê-lo animado!
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[var(--app-text-muted)]">Nível</span>
                <div className="text-2xl font-black font-mono text-[var(--app-primary)]">
                  {user.pet?.level || 1}
                </div>
              </div>
            </div>

            <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs flex flex-col items-center">
              <div className="w-full max-w-md h-72">
                <Pet3DView
                  pet={user.pet}
                  onPetClick={() => {
                    if (user.pet && onUpdatePet) {
                      onUpdatePet({
                        ...user.pet,
                        happiness: Math.min(100, (user.pet.happiness || 80) + 5),
                      });
                    }
                  }}
                />
              </div>

              <div className="w-full max-w-md grid grid-cols-2 gap-3 mt-4">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (user.pet && onUpdatePet) {
                      onUpdatePet({
                        ...user.pet,
                        hunger: Math.min(100, (user.pet.hunger || 70) + 20),
                        lastFed: new Date().toISOString(),
                      });
                    }
                  }}
                >
                  Alimentar Mascote
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (user.pet && onUpdatePet) {
                      onUpdatePet({
                        ...user.pet,
                        happiness: Math.min(100, (user.pet.happiness || 80) + 15),
                      });
                    }
                  }}
                >
                  Brincar / Carinho
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 11. EQUIPES & BATALHAS */}
        {activeSubView === "teams" && (
          <GuildsBattlesTab
            user={user}
            onRewardXp={onRewardXp}
            onConsumeEnergy={onConsumeEnergy}
            onAddEnergy={onAddEnergy}
            onUpdateUserTeam={onUpdateUserTeam}
            onOpenPrivateChatWithMember={onOpenPrivateChatWithMember}
          />
        )}

        {/* 12. LOJA */}
        {activeSubView === "loja" && (
          <StoreTab
            user={user}
            onBuyBadge={onBuyBadge}
            onEquipBadge={onEquipBadge}
            onAddEnergy={onAddEnergy}
            onPermanentEnergyUpgrade={onPermanentEnergyUpgrade}
            onRewardCoins={onRewardCoins}
            onUpdatePet={onUpdatePet}
            currentTheme={currentTheme}
          />
        )}

        {/* 13. CARTEIRA & EXTRATO */}
        {activeSubView === "carteira" && (
          <div className="max-w-4xl mx-auto">
            <ExtratoMoedasView
              uid={userUid}
              saldoAtual={user.coins ?? 250}
            />
          </div>
        )}

        {/* 14. FIDELIDADE */}
        {activeSubView === "fidelidade" && (
          <div className="max-w-5xl mx-auto">
            <FidelidadeView
              uid={userUid}
              saldoAtualMoedas={user.coins ?? 250}
              missaoDiariaConcluidaHoje={true}
              onMoedasResgatadas={(novas) => {
                if (onRewardCoins) onRewardCoins(novas);
              }}
              onNavigateToCidade={() => setActiveSubView("cidade")}
              onNavigateToStore={() => setActiveSubView("loja")}
            />
          </div>
        )}
      </div>
    </div>
  );
};
