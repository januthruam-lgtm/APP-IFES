import React, { useState } from "react";
import {
  ShoppingBag,
  Zap,
  Coins,
  Sparkles,
  Award,
  Heart,
  Shield,
  Check,
  ChevronRight,
  Plus,
  Wand2,
  Pencil,
  X,
} from "lucide-react";
import { UserProfile, CustomThemeColors, StoreItem, UserPet } from "../../types";
import { PuppetPetView } from "../PuppetPetView";
import confetti from "canvas-confetti";

interface StoreTabProps {
  user: UserProfile;
  onBuyBadge?: (badgeName: string, cost: number) => void;
  onEquipBadge?: (badgeName: string) => void;
  onAddEnergy?: (amount: number) => void;
  onPermanentEnergyUpgrade?: (additionalMax: number, cost: number) => void;
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
  onStudyOnAva?: () => void;
  onUnlockCard?: (cardId: string) => void;
  onUpdatePet?: (pet: UserPet) => void;
  currentTheme?: CustomThemeColors;
}

export const StoreTab: React.FC<StoreTabProps> = ({
  user,
  onBuyBadge,
  onEquipBadge,
  onAddEnergy,
  onPermanentEnergyUpgrade,
  onRewardCoins,
  onUpdatePet,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isRenamingPet, setIsRenamingPet] = useState(false);
  const [newPetName, setNewPetName] = useState(user.pet?.name || "Mascote");

  React.useEffect(() => {
    if (user.pet?.name) {
      setNewPetName(user.pet.name);
    }
  }, [user.pet?.name]);

  React.useEffect(() => {
    const handlePetUpdated = (e: any) => {
      if (e.detail?.name) {
        setNewPetName(e.detail.name);
      }
    };
    window.addEventListener("pet_updated", handlePetUpdated);
    return () => window.removeEventListener("pet_updated", handlePetUpdated);
  }, []);

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleStartRename = () => {
    setNewPetName(user.pet?.name || "Mascote");
    setIsRenamingPet(true);
  };

  const handleSavePetName = () => {
    const trimmed = newPetName.trim();
    if (!trimmed || !user.pet) return;
    const updatedPet: UserPet = {
      ...user.pet,
      name: trimmed,
    };
    if (onUpdatePet) {
      onUpdatePet(updatedPet);
    }
    setIsRenamingPet(false);
    showToast(`🎉 Nome do mascote alterado para "${trimmed}"!`);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  const handleBuyEnergy = (amount: number, cost: number) => {
    if (user.coins < cost) {
      showToast("Moedas insuficientes! Estude e complete módulos para ganhar mais moedas.");
      return;
    }
    if (onRewardCoins) onRewardCoins(-cost);
    if (onAddEnergy) onAddEnergy(amount);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    showToast(`+${amount} Energias recarregadas com sucesso!`);
  };

  const handleBuyPermanentEnergy = (cost: number) => {
    if (user.coins < cost) {
      showToast("Moedas insuficientes para expansão permanente de bateria.");
      return;
    }
    if (onPermanentEnergyUpgrade) onPermanentEnergyUpgrade(5, cost);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    showToast("Capacidade máxima de energia permanentemente expandida em +5!");
  };

  const handleFeedPet = (cost: number, foodName: string, expGain: number = 25) => {
    if (user.coins < cost) {
      showToast("Moedas insuficientes para petisco.");
      return;
    }
    if (!user.pet) return;

    if (onRewardCoins) onRewardCoins(-cost);
    const currentExp = (user.pet.exp || 0) + expGain;
    let level = user.pet.level || 1;
    let maxExp = user.pet.maxExp || 100;
    let finalExp = currentExp;

    if (finalExp >= maxExp) {
      level += 1;
      finalExp = finalExp - maxExp;
      maxExp = Math.round(maxExp * 1.5);
      showToast(`🎉 Incrível! ${user.pet.name} subiu para o Nível ${level}!`);
    } else {
      showToast(`${user.pet.name} adorou ${foodName}! (+${expGain} EXP)`);
    }

    const updatedPet: UserPet = {
      ...user.pet,
      level,
      exp: finalExp,
      maxExp,
      totalMeals: (user.pet.totalMeals || 0) + 1,
      lastFedTimestamp: new Date().toISOString(),
    };
    if (onUpdatePet) onUpdatePet(updatedPet);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="p-3 bg-[var(--app-primary)] text-white text-xs font-bold rounded-2xl shadow-lg animate-in fade-in flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--app-text)]">Loja & Economia Brain Studio</h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              Use suas moedas ganhas com esforço acadêmico para recarregar baterias e cuidar do mascote.
            </p>
          </div>
        </div>

        {/* User Balance */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-sm font-black">
            <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{user.coins} Moedas</span>
          </div>

          <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-sm font-black">
            <Zap className="w-4 h-4 fill-emerald-500 text-emerald-500" />
            <span>{user.energy}/{user.maxEnergy} Energia</span>
          </div>
        </div>
      </div>

      {/* Pet Interactive Showcase Card na Loja de Pets */}
      {user.pet && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/25 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="cursor-pointer hover:scale-105 transition shrink-0" title="Clique para interagir com o Pet!">
              <PuppetPetView pet={user.pet} size="lg" interactive={true} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {isRenamingPet ? (
                  <div className="flex items-center gap-1.5 bg-[var(--app-bg)] px-2.5 py-1 rounded-xl border border-[var(--app-primary)] shadow-xs">
                    <input
                      type="text"
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSavePetName();
                        if (e.key === "Escape") setIsRenamingPet(false);
                      }}
                      autoFocus
                      placeholder="Nome do Mascote..."
                      className="text-sm font-bold bg-transparent text-[var(--app-text)] outline-none w-32 sm:w-44"
                      maxLength={25}
                    />
                    <button
                      onClick={handleSavePetName}
                      className="p-1 rounded-lg bg-[var(--app-primary)] text-white hover:opacity-90 transition cursor-pointer"
                      title="Salvar novo nome"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsRenamingPet(false)}
                      className="p-1 rounded-lg bg-gray-500/20 text-[var(--app-text-muted)] hover:bg-gray-500/30 transition cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-black text-[var(--app-text)] flex items-center gap-1.5">
                      <span>{user.pet.name || "Mascote"}</span>
                      <button
                        onClick={handleStartRename}
                        className="p-1.5 rounded-xl hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:text-[var(--app-primary)] transition cursor-pointer"
                        title="Alterar nome do Mascote"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </h3>
                  </>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Nível {user.pet.level || 1}
                </span>
              </div>
              <p className="text-xs text-[var(--app-text-muted)] max-w-sm">
                Seu companheiro leal de estudos no IFES! Clique nele para fazer carinho e evolua seu nível dando petiscos da loja.
              </p>
              <div className="w-48 sm:w-64 space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--app-text-muted)]">
                  <span>EXP</span>
                  <span className="font-bold text-[var(--app-primary)]">{user.pet.exp || 0} / {user.pet.maxExp || 100}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(5, ((user.pet.exp || 0) / (user.pet.maxExp || 100)) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0 bg-[var(--app-card)]/70 backdrop-blur-xs p-4 rounded-2xl border border-[var(--app-border)]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--app-text-muted)] block">
              Alimentações Realizadas
            </span>
            <div className="text-2xl font-black text-amber-500">
              {user.pet.totalMeals || 0} 🥕
            </div>
            <span className="text-[10px] text-[var(--app-text-muted)] font-medium">
              Evolui e ganha auras com EXP
            </span>
          </div>
        </div>
      )}

      {/* Grid of Store Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section 1: Energy Recharges */}
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--app-text-muted)] flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Bateria & Energia de Estudo
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[var(--app-text)]">+15 Energias Rápidas</p>
                <span className="text-[10px] text-[var(--app-text-muted)]">Para estudar quizzes e batalhas</span>
              </div>
              <button
                onClick={() => handleBuyEnergy(15, 20)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition cursor-pointer"
              >
                20 🪙
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[var(--app-text)]">Recarga Total de Bateria</p>
                <span className="text-[10px] text-[var(--app-text-muted)]">Restaura 100% da sua barra</span>
              </div>
              <button
                onClick={() => handleBuyEnergy(user.maxEnergy, 45)}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs transition cursor-pointer"
              >
                45 🪙
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <p className="font-black text-xs text-[var(--app-text)]">+5 Capacidade Máxima</p>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Upgrade Permanente!</span>
              </div>
              <button
                onClick={() => handleBuyPermanentEnergy(120)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition cursor-pointer"
              >
                120 🪙
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Mascote Pet Care (Sem índices de saciedade/felicidade) */}
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--app-text-muted)] flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-pink-500" />
            Nutrição & EXP do Pet ({user.pet?.name || "Mascote"})
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[var(--app-text)]">Cenoura Fresca da Horta</p>
                <span className="text-[10px] text-[var(--app-text-muted)]">+25 EXP para o Mascote</span>
              </div>
              <button
                onClick={() => handleFeedPet(10, "Cenoura", 25)}
                className="px-3 py-1.5 rounded-xl bg-[var(--app-primary)] text-white font-black text-xs transition cursor-pointer"
              >
                10 🪙
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[var(--app-text)]">Biscoito da Sabedoria</p>
                <span className="text-[10px] text-[var(--app-text-muted)]">+50 EXP para o Mascote</span>
              </div>
              <button
                onClick={() => handleFeedPet(25, "Biscoito da Sabedoria", 50)}
                className="px-3 py-1.5 rounded-xl bg-[var(--app-primary)] text-white font-black text-xs transition cursor-pointer"
              >
                25 🪙
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[var(--app-text)]">Poção Estelar Cósmica</p>
                <span className="text-[10px] text-[var(--app-text-muted)]">+120 EXP & Salto de Nível</span>
              </div>
              <button
                onClick={() => handleFeedPet(60, "Poção Estelar", 120)}
                className="px-3 py-1.5 rounded-xl bg-[var(--app-primary)] text-white font-black text-xs transition cursor-pointer"
              >
                60 🪙
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Badges & Titles */}
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-[var(--app-text-muted)] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[var(--app-primary)]" />
            Distintivos Honoríficos
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[var(--app-text)]">🎓 Mestre da Maiêutica</p>
                <span className="text-[10px] text-[var(--app-text-muted)]">Para quem pensa por si mesmo</span>
              </div>
              <button
                onClick={() => onBuyBadge && onBuyBadge("Mestre da Maiêutica", 50)}
                className="px-3 py-1.5 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] font-black text-xs transition cursor-pointer"
              >
                50 🪙
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[var(--app-text)]">⚡ Foco Implacável</p>
                <span className="text-[10px] text-[var(--app-text-muted)]">Completar 10 lições seguidas</span>
              </div>
              <button
                onClick={() => onBuyBadge && onBuyBadge("Foco Implacável", 75)}
                className="px-3 py-1.5 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] font-black text-xs transition cursor-pointer"
              >
                75 🪙
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[var(--app-text)]">👑 Guardião do Conhecimento</p>
                <span className="text-[10px] text-[var(--app-text-muted)]">Título especial de prestígio</span>
              </div>
              <button
                onClick={() => onBuyBadge && onBuyBadge("Guardião do Conhecimento", 150)}
                className="px-3 py-1.5 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] font-black text-xs transition cursor-pointer"
              >
                150 🪙
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
