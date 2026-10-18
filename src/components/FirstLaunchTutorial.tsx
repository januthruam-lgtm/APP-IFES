import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  Sparkles,
  Compass,
  Check,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Heart,
  Smile,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { PetType, UserPet } from "../types";
import { Pet3DView } from "./pet3d/Pet3DView";

export interface FirstLaunchTutorialProps {
  isOpen: boolean;
  onComplete: (chosenPet: UserPet) => void;
}

export interface StarterPetOption {
  type: PetType;
  defaultName: string;
  emoji: string;
  badge: string;
  description: string;
  trait: string;
}

export const STARTER_PETS: StarterPetOption[] = [
  {
    type: "coruja",
    defaultName: "Athena",
    emoji: "🦉",
    badge: "Sabedoria & Síntese",
    description: "Símbolo ancestral da sabedoria acadêmica do IFES. Vigia atentamente cada sessão de estudos.",
    trait: "+10% de ganho de XP em tarefas e leituras",
  },
  {
    type: "bunny",
    defaultName: "Bolin",
    emoji: "🐰",
    badge: "Foco Ágil",
    description: "Mascote veloz e dedicado, adora revisões com flashcards e sessões focadas.",
    trait: "+10% de agilidade em revisões",
  },
  {
    type: "bird",
    defaultName: "Piu",
    emoji: "🐦",
    badge: "Visão Panorâmica",
    description: "Perspicaz e com visão de longo alcance sobre módulos longos e mapas conceituais.",
    trait: "+10% de absorção de leitura",
  },
  {
    type: "raposa",
    defaultName: "Faísca",
    emoji: "🦊",
    badge: "Astúcia & Resolução",
    description: "Extremamente ágil e analítica na resolução de exercícios práticos e problemas lógicos.",
    trait: "+15% de rapidez em quizzes",
  },
  {
    type: "elephant",
    defaultName: "Pipoca",
    emoji: "🐘",
    badge: "Memória Lendária",
    description: "Guarda todos os conceitos e fórmulas na memória de longo prazo para as provas do semestre.",
    trait: "+20% de retenção de conceitos",
  },
  {
    type: "tiger",
    defaultName: "Tigrão",
    emoji: "🐯",
    badge: "Garra Estratégica",
    description: "Determinado e competitivo, adora questionários difíceis e desafios lógicos de alta pontuação.",
    trait: "+15% de precisão em simulados",
  },
  {
    type: "gato_robo",
    defaultName: "Byte",
    emoji: "🤖",
    badge: "Precisão Algorítmica",
    description: "Forjado nos laboratórios de informática e engenharia do IFES. Otimiza cada ciclo de estudo.",
    trait: "Economia de energia em quizzes",
  },
  {
    type: "dragao_livro",
    defaultName: "Ignis",
    emoji: "🐉",
    badge: "Mestre Lendário",
    description: "Criatura mítica que respira conhecimento e protege o acervo de sabedoria do instituto.",
    trait: "+25% de XP em provas",
  },
];

const TUTORIAL_MODULES = [
  {
    emoji: "📊",
    title: "Dashboard Geral & Ofensiva",
    description: "Acompanhe seus dias seguidos de estudo (streak), barra de energia vital, cartas e status do seu pet.",
  },
  {
    emoji: "📚",
    title: "Matérias & Trilhas AVA IFES",
    description: "Sincronize suas disciplinas do Moodle com resumos estruturados, simulados automáticos e flashcards.",
  },
  {
    emoji: "💡",
    title: "Tutor Socrático Lumina",
    description: "Mentoria de IA que desafia seu raciocínio com perguntas investigativas sem dar respostas prontas.",
  },
  {
    emoji: "🐾",
    title: "Mascote 3D Interativo & Loja",
    description: "Seu companheiro tridimensional em todas as telas que ganha XP, sobe de nível e comemora suas conquistas.",
  },
];

const STEP_TITLES = {
  1: "Bem-vindo ao Brain Studio IFES",
  2: "Recursos Acadêmicos do Sistema",
  3: "Escolha Obrigatória do seu Mascote 3D",
};

export const FirstLaunchTutorial: React.FC<FirstLaunchTutorialProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedPetType, setSelectedPetType] = useState<PetType>("coruja");
  const [petCustomName, setPetCustomName] = useState<string>("Athena");
  const [hasCustomizedName, setHasCustomizedName] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentStarter =
    STARTER_PETS.find((p) => p.type === selectedPetType) || STARTER_PETS[0];

  const handleSelectPet = (pet: StarterPetOption) => {
    setSelectedPetType(pet.type);
    if (!hasCustomizedName) {
      setPetCustomName(pet.defaultName);
    }
  };

  const handleFinish = () => {
    const finalName = petCustomName.trim() || currentStarter.defaultName;
    const now = new Date().toISOString();

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    const chosenPet: UserPet = {
      id: selectedPetType,
      type: selectedPetType,
      activePetId: selectedPetType,
      name: finalName,
      level: 1,
      exp: 0,
      maxExp: 100,
      happiness: 100,
      hunger: 90,
      energy: 100,
      totalMeals: 0,
      lastFedTimestamp: now,
      lastFed: now,
      unlockedPets: [selectedPetType],
      customAccessory: "none",
      customSpeciesName: currentStarter.badge,
      customSpeciesEmoji: currentStarter.emoji,
    };

    onComplete(chosenPet);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-full flex flex-col bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-2xl text-[var(--app-text)] overflow-hidden"
      >
        {/* Cabeçalho fixo */}
        <div className="p-4 sm:p-6 pb-3 border-b border-[var(--app-border)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center shadow-md shrink-0 border border-[var(--app-primary)]/30">
              <GraduationCap className="w-5 h-5 font-black" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[var(--app-text)] flex items-center gap-2">
                <span>Tutorial de Boas-Vindas</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--app-primary)]/15 text-[var(--app-primary)] border border-[var(--app-primary)]/30">
                  Passo {step} de 3
                </span>
              </h2>
              <p className="text-[11px] text-[var(--app-text-muted)] font-medium">
                {STEP_TITLES[step as keyof typeof STEP_TITLES]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === i
                    ? "w-7 bg-[var(--app-primary)]"
                    : step > i
                    ? "w-2.5 bg-[var(--app-primary)]/60"
                    : "w-2.5 bg-[var(--app-border)]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Miolo rolável com scroll suave */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] p-4 sm:p-6 flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center space-y-3">
                  <div className="inline-flex p-3 rounded-2xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20 mb-1">
                    <img
                      src="/logo.png"
                      alt="Brain Studio Logo"
                      className="w-44 sm:w-52 h-auto object-contain mx-auto"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[var(--app-text)]">
                    Bem-vindo ao Brain Studio IFES!
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--app-text-muted)] max-w-lg mx-auto leading-relaxed">
                    Seu ecossistema acadêmico inteligente para estudantes do Instituto Federal.
                    Gerencie suas disciplinas, resolva simulados com mentoria de IA e evolua seu
                    mascote tridimensional exclusivo em cada sessão de estudo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] mx-auto flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--app-text)]">
                      Sincronização AVA
                    </h4>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Suas disciplinas, prazos e notas diretamente integrados.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
                    <div className="w-9 h-9 rounded-xl bg-[var(--app-accent)]/15 text-[var(--app-accent)] mx-auto flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--app-text)]">
                      Tutor Socrático
                    </h4>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Lumina orienta seu raciocínio passo a passo com profundidade.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 mx-auto flex items-center justify-center">
                      <PawPrint className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--app-text)]">
                      Mascote 3D
                    </h4>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Modelos tridimensionais completos presentes em todas as telas.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-[var(--app-text)] flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[var(--app-primary)]" />
                    <span>Navegando no Brain Studio</span>
                  </h3>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    Conheça os módulos principais projetados para sua rotina acadêmica:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {TUTORIAL_MODULES.map((m) => (
                    <div
                      key={m.title}
                      className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center shrink-0 mt-0.5 text-base font-black">
                        {m.emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[var(--app-text)]">
                          {m.title}
                        </h4>
                        <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-[var(--app-text)] flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--app-primary)]" />
                    <span>Escolha Obrigatória do seu Mascote 3D</span>
                  </h3>
                  <p className="text-xs text-[var(--app-text-muted)] max-w-md mx-auto">
                    Selecione seu companheiro inicial em formato 3D e dê um nome a ele.
                    Ele acompanhará você em todas as telas com esse mesmo nome!
                  </p>
                </div>

                {/* Grade de Mascotes com renderização 3D completa */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  {STARTER_PETS.map((pet) => {
                    const isSelected = selectedPetType === pet.type;
                    return (
                      <div
                        key={pet.type}
                        onClick={() => handleSelectPet(pet)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleSelectPet(pet);
                          }
                        }}
                        className={`relative p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-1 select-none ${
                          isSelected
                            ? "border-[var(--app-primary)] bg-[var(--app-primary)]/15 scale-[1.02] shadow-md ring-2 ring-[var(--app-primary)]/30"
                            : "border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:border-[var(--app-primary)]/40 hover:bg-[var(--app-card-hover)]"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--app-primary)] text-white flex items-center justify-center shadow-sm z-10">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Visualizador 3D do pet individual com enquadramento total */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-xl bg-[var(--app-card)]/50 border border-[var(--app-border)]/50 overflow-hidden flex items-center justify-center pointer-events-none p-1">
                          <Pet3DView
                            petType={pet.type}
                            petName={pet.defaultName}
                            size="sm"
                            className="w-full h-full"
                          />
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-[var(--app-text)] truncate max-w-[120px]">
                            {pet.defaultName}
                          </h4>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--app-card)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                            {pet.badge}
                          </span>
                        </div>

                        <p className="text-[10px] text-[var(--app-text-muted)] leading-tight line-clamp-2">
                          {pet.description}
                        </p>

                        <div className="w-full pt-1 border-t border-[var(--app-border)] text-[9px] font-bold text-[var(--app-primary)] truncate">
                          {pet.trait}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Caixa de personalização do nome e visualização em destaque */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-3xl bg-[var(--app-card-secondary)] border-2 border-[var(--app-primary)]/40 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-2xl bg-[var(--app-bg)]/80 border border-[var(--app-border)] overflow-hidden flex items-center justify-center p-1 shadow-inner">
                    <Pet3DView
                      petType={selectedPetType}
                      petName={petCustomName || currentStarter.defaultName}
                      size="md"
                      className="w-full h-full"
                      isJoyful={true}
                    />
                  </div>
                  <div className="text-left w-full sm:w-auto flex-1 space-y-1.5">
                    <label
                      htmlFor="starter-pet-name-input"
                      className="text-xs font-black text-[var(--app-text)] flex items-center gap-1.5"
                    >
                      <span>Nome do seu Mascote 3D:</span>
                      <span className="text-[10px] text-[var(--app-primary)] font-bold">
                        ({currentStarter.badge})
                      </span>
                    </label>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Esse nome será exibido em todas as telas (Dashboard, Loja, Barra Lateral e Tutoria).
                    </p>
                    <input
                      id="starter-pet-name-input"
                      type="text"
                      maxLength={24}
                      value={petCustomName}
                      onChange={(e) => {
                        setPetCustomName(e.target.value);
                        setHasCustomizedName(true);
                      }}
                      placeholder="Ex: Bolin, Athena, Faísca..."
                      className="w-full sm:w-72 px-3.5 py-2 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold focus:outline-none focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary)]/20 transition"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rodapé fixo com botões de navegação */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-[var(--app-border)] bg-[var(--app-card)] flex items-center justify-between gap-3 shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-xs font-bold text-[var(--app-text)] transition flex items-center gap-1.5 cursor-pointer border border-[var(--app-border)] active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-xs font-black text-white transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <span>Avançar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-xs font-black text-white transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Concluir & Começar</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FirstLaunchTutorial;