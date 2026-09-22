import React, { useState } from "react";
import {
  ShoppingBag,
  Coins,
  Zap,
  Award,
  Sparkles,
  Check,
  Shield,
  Heart,
  Crown,
  PawPrint,
  CheckCircle2,
} from "lucide-react";
import { CustomThemeColors, UserPet, UserProfile } from "../../types";
import confetti from "canvas-confetti";
import {
  OFFICIAL_PET_CATALOG,
  getPetDefinition,
  DEFAULT_PET_ID,
  PetCatalogItem,
} from "../../features/gamificacao/petCatalog";
import {
  equipUserPet,
  buyAndEquipPet,
} from "../../features/gamificacao/petService";

interface StoreTabProps {
  user: UserProfile;
  onBuyBadge: (badgeId: string, cost: number) => boolean;
  onEquipBadge: (badgeId: string) => void;
  onAddEnergy: (amount: number) => void;
  onPermanentEnergyUpgrade: (cost: number) => boolean;
  onRewardXp: (xp: number) => void;
  onRewardCoins: (coins: number) => void;
  onStudyOnAva: () => void;
  onUnlockCard: (cardId: string) => void;
  onUpdatePet: (pet: UserPet) => void;
  currentTheme?: CustomThemeColors;
}

const STORE_BADGES = [
  { id: "calouro_ifes", name: "Calouro IFES", icon: "🎓", cost: 0, description: "Concedido ao ingressar na jornada acadêmica." },
  { id: "maratonista_dados", name: "Mestre de Algoritmos", icon: "⚡", cost: 80, description: "Dedicação comprovada em estruturas de dados." },
  { id: "coruja_noturna", name: "Coruja da Madrugada", icon: "🦉", cost: 120, description: "Estudos concentrados no período noturno." },
  { id: "mestre_calculo", name: "Sábio do Cálculo", icon: "📐", cost: 150, description: "Domínio de derivadas, integrais e limites." },
  { id: "veterano_ifes", name: "Veterano Lendário", icon: "👑", cost: 250, description: "O maior status honorário do instituto." },
];

export const StoreTab: React.FC<StoreTabProps> = ({
  user,
  onBuyBadge,
  onEquipBadge,
  onAddEnergy,
  onPermanentEnergyUpgrade,
  onUpdatePet,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleBuyPotion = (energyAmount: number, coinCost: number) => {
    if (user.coins < coinCost) {
      showFeedback("Moedas insuficientes para esta poção!");
      return;
    }
    onAddEnergy(energyAmount);
    showFeedback(`+${energyAmount} de Energia restaurada com sucesso!`);
    confetti({ particleCount: 25, spread: 50 });
  };

  const handleUpgradeMaxEnergy = () => {
    const cost = 120;
    const success = onPermanentEnergyUpgrade(cost);
    if (success) {
      showFeedback("Capacidade máxima de energia aumentada em +10!");
      confetti({ particleCount: 40, spread: 60 });
    } else {
      showFeedback("Moedas insuficientes para o aprimoramento!");
    }
  };

  const handleBuyOrEquipBadge = (badgeId: string, cost: number) => {
    const isUnlocked = user.unlockedBadges?.includes(badgeId);
    if (isUnlocked) {
      onEquipBadge(badgeId);
      showFeedback("Emblema equipado no seu perfil!");
      return;
    }

    const bought = onBuyBadge(badgeId, cost);
    if (bought) {
      showFeedback("Emblema adquirido e equipado com sucesso!");
      confetti({ particleCount: 30, spread: 50 });
    } else {
      showFeedback("Moedas insuficientes para desbloquear!");
    }
  };

  const activePetDef = getPetDefinition(user.pet?.activePetId || user.pet?.id);
  const unlockedPetsList = user.pet?.unlockedPets || [DEFAULT_PET_ID];

  const handleEquipPet = async (petItem: PetCatalogItem) => {
    try {
      const updatedPet = await equipUserPet(user.email || "aluno", petItem.id);
      onUpdatePet(updatedPet);
      showFeedback(`Mascote ${petItem.nome} equipado com sucesso!`);
      confetti({ particleCount: 35, spread: 60 });
    } catch {
      showFeedback("Erro ao equipar mascote. Tente novamente.");
    }
  };

  const handleAdoptPet = async (petItem: PetCatalogItem) => {
    if (user.coins < petItem.custoMoedas) {
      showFeedback(`Moedas insuficientes! Você precisa de ${petItem.custoMoedas} moedas para adotar ${petItem.nome}.`);
      return;
    }

    try {
      const result = await buyAndEquipPet(user.email || "aluno", petItem.id);
      if (result.success && result.pet) {
        onUpdatePet(result.pet);
        showFeedback(`Parabéns! ${petItem.nome} foi adotado e equipado.`);
        confetti({ particleCount: 60, spread: 80 });
      } else {
        showFeedback(result.error || "Não foi possível completar a adoção.");
      }
    } catch {
      showFeedback("Erro na transação de adoção.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Loja do Aluno & Recompensas</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary,#f8fafc)]">
            Mercado Acadêmico
          </h1>
          <p className="text-xs text-[var(--text-muted,#94a3b8)]">
            Invista suas moedas ganhas resolvendo tarefas e estudando
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-extrabold text-amber-300">
              {user.coins} Moedas
            </span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold text-center animate-in slide-in-from-top-2">
          {feedback}
        </div>
      )}

      {/* Energy & Power-ups */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary,#f8fafc)] flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span>Poções de Energia & Aprimoramentos</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary,#f8fafc)]">
                Recarga Rápida (+20 Energia)
              </h3>
              <p className="text-xs text-[var(--text-muted,#94a3b8)]">
                Restaura 20 pontos para continuar jogando no Quiz.
              </p>
            </div>
            <button
              onClick={() => handleBuyPotion(20, 25)}
              className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Comprar por 25 Moedas</span>
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary,#f8fafc)]">
                Recarga Total (100% Energia)
              </h3>
              <p className="text-xs text-[var(--text-muted,#94a3b8)]">
                Preenche a barra de energia completamente.
              </p>
            </div>
            <button
              onClick={() => handleBuyPotion(user.maxEnergy, 50)}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Comprar por 50 Moedas</span>
            </button>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-lg space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary,#f8fafc)]">
                Expansão Permanente (+10 Max)
              </h3>
              <p className="text-xs text-[var(--text-muted,#94a3b8)]">
                Aumenta sua barra máxima de energia para sempre.
              </p>
            </div>
            <button
              onClick={handleUpgradeMaxEnergy}
              className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Aprimorar por 120 Moedas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Badges and Titles */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary,#f8fafc)] flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <span>Emblemas & Insígnias Honorárias</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STORE_BADGES.map((b) => {
            const isUnlocked = user.unlockedBadges?.includes(b.id);
            const isEquipped = user.equippedBadge === b.id;

            return (
              <div
                key={b.id}
                className={`p-5 rounded-3xl border transition flex flex-col justify-between gap-3 ${
                  isEquipped
                    ? "bg-[var(--bg-card,#1e293b)] border-indigo-500 ring-2 ring-indigo-500/20"
                    : "bg-[var(--bg-card,#1e293b)] border-[var(--border-color,rgba(255,255,255,0.1))]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{b.icon}</span>
                    {isEquipped && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        EQUIPADO
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[var(--text-primary,#f8fafc)]">
                    {b.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted,#94a3b8)]">
                    {b.description}
                  </p>
                </div>

                <button
                  onClick={() => handleBuyOrEquipBadge(b.id, b.cost)}
                  className={`w-full py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    isEquipped
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      : isUnlocked
                      ? "bg-[var(--bg-card-secondary,#334155)] hover:bg-indigo-600 hover:text-white text-[var(--text-primary,#f8fafc)]"
                      : "bg-amber-500 hover:bg-amber-400 text-black"
                  }`}
                >
                  {isEquipped ? (
                    <span>Emblema em Uso</span>
                  ) : isUnlocked ? (
                    <span>Equipar no Perfil</span>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5" />
                      <span>Adquirir por {b.cost} Moedas</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mascotes Acadêmicos Oficiais do IFES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-bold text-[var(--text-primary,#f8fafc)] flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-emerald-400" />
            <span>Centro de Adoção de Mascotes IFES</span>
          </h2>
          <span className="text-xs text-[var(--text-muted,#94a3b8)]">
            Mascote Ativo Atual: <strong className="text-emerald-400">{activePetDef.emoji} {activePetDef.nome}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFICIAL_PET_CATALOG.map((petItem) => {
            const isEquipped = activePetDef.id === petItem.id;
            const isUnlocked = unlockedPetsList.includes(petItem.id) || petItem.isDefault;

            return (
              <div
                key={petItem.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                  isEquipped
                    ? "bg-[var(--bg-card,#1e293b)] border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                    : "bg-[var(--bg-card,#1e293b)] border-[var(--border-color,rgba(255,255,255,0.1))]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{petItem.emoji}</span>
                    {isEquipped ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        ATIVO
                      </span>
                    ) : petItem.isDefault ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        PADRÃO IFES
                      </span>
                    ) : null}
                  </div>

                  <h3 className="font-bold text-sm text-[var(--text-primary,#f8fafc)]">
                    {petItem.nome}
                  </h3>

                  <div className="inline-block px-2 py-0.5 rounded-md bg-[var(--bg-card-secondary,#334155)] text-[10px] font-semibold text-emerald-300">
                    {petItem.tituloBadge}
                  </div>

                  <p className="text-xs text-[var(--text-muted,#94a3b8)] line-clamp-2">
                    {petItem.descricao}
                  </p>

                  <div className="pt-2 border-t border-[var(--border-color,rgba(255,255,255,0.06))] text-[11px] font-medium text-amber-300/90">
                    ✦ {petItem.habilidadePassiva}
                  </div>
                </div>

                <div className="pt-2">
                  {isEquipped ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mascote em Uso</span>
                    </button>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquipPet(petItem)}
                      className="w-full py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Equipar Mascote</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAdoptPet(petItem)}
                      className="w-full py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Adotar por {petItem.custoMoedas} Moedas</span>
                    </button>
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
