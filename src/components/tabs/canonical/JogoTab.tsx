import React, { useState } from "react";
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
} from "lucide-react";
import { UserProfile, CustomThemeColors, UserPet } from "../../../types";
import { CidadeDoConhecimentoTab } from "../CidadeDoConhecimentoTab";
import { GuildsBattlesTab } from "../GuildsBattlesTab";
import { StoreTab } from "../StoreTab";
import { Pet3DView } from "../../pet3d/Pet3DView";
import { ExtratoMoedasView } from "../../../features/economia/components/ExtratoMoedasView";
import { FidelidadeView } from "../../../features/economia/components/FidelidadeView";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";

export type SubViewJogoId =
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

  const resolveSubView = (sub?: string): SubViewJogoId => {
    switch (sub) {
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
        return "cidade";
    }
  };

  const [activeSubView, setActiveSubView] = useState<SubViewJogoId>(() =>
    resolveSubView(initialSubView)
  );

  const subNavItems = [
    { id: "cidade" as SubViewJogoId, label: "Vilas do Saber", icon: Castle },
    { id: "pet" as SubViewJogoId, label: "Mascote 3D", icon: Dog },
    { id: "teams" as SubViewJogoId, label: "Equipes & Ligas", icon: Users },
    { id: "loja" as SubViewJogoId, label: "Loja", icon: ShoppingBag },
    { id: "carteira" as SubViewJogoId, label: "Carteira & Extrato", icon: Coins },
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
                  isSelected
                    ? "bg-[var(--app-primary)] text-white shadow-xs"
                    : "bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] border border-[var(--app-border)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Indicador de Colegas Online (migrado do cabeçalho) */}
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
      <div className="flex-1">
        {activeSubView === "cidade" && (
          <CidadeDoConhecimentoTab
            user={user}
            onRewardCoins={onRewardCoins}
            onRewardXp={onRewardXp}
            onConsumeCoins={onConsumeCoins}
          />
        )}

        {activeSubView === "pet" && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
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

            {/* Visualizador 3D do Pet */}
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

              {/* Controles de Cuidado */}
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

        {activeSubView === "carteira" && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <ExtratoMoedasView
              uid={user.id || user.uid || "local_user"}
              saldoAtual={user.coins ?? 250}
            />
          </div>
        )}

        {activeSubView === "fidelidade" && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            <FidelidadeView
              uid={user.id || user.uid || "local_user"}
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
