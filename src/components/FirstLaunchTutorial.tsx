import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Compass,
  MessageSquareCode,
  Heart,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { PetType, UserPet } from "../types";
import { Pet3DView } from "./pet3d/Pet3DView";

interface FirstLaunchTutorialProps {
  isOpen: boolean;
  onComplete: (chosenPet: UserPet) => void;
}

interface StarterPetOption {
  type: PetType;
  defaultName: string;
  emoji: string;
  badge: string;
  description: string;
  trait: string;
}

const STARTER_PETS: StarterPetOption[] = [
  {
    type: "coruja",
    defaultName: "Athena",
    emoji: "🦉",
    badge: "Sabedoria & Síntese",
    description: "Símbolo ancestral da sabedoria acadêmica do IFES. Vigia com carinho cada sessão noturna de estudos.",
    trait: "+10% de ganho de XP em tarefas",
  },
  {
    type: "bunny",
    defaultName: "Bolin",
    emoji: "🐰",
    badge: "Agilidade & Foco",
    description: "Rápido nas revisões de flashcards e sempre alerta para sessões de estudo focadas.",
    trait: "+10% de agilidade em revisões",
  },
  {
    type: "raposa",
    defaultName: "Foxy",
    emoji: "🦊",
    badge: "Astúcia & Lógica",
    description: "Veloz e perspicaz na resolução de problemas matemáticos e exercícios práticos.",
    trait: "+15% de velocidade de resposta",
  },
  {
    type: "bird",
    defaultName: "Piu",
    emoji: "🐦",
    badge: "Visão & Síntese",
    description: "Perspicaz e com visão panorâmica sobre módulos longos e mapas conceituais.",
    trait: "+10% de absorção de leitura",
  },
  {
    type: "elephant",
    defaultName: "Pipoca",
    emoji: "🐘",
    badge: "Memória Lendária",
    description: "Guarda todos os conceitos na memória de longo prazo para as provas do semestre.",
    trait: "+20% de retenção de conceitos",
  },
  {
    type: "tiger",
    defaultName: "Tigrão",
    emoji: "🐯",
    badge: "Garra & Força",
    description: "Determinado e competitivo, adora questionários difíceis e desafios lógicos.",
    trait: "+15% de precisão em simulados",
  },
  {
    type: "gato_robo",
    defaultName: "Byte",
    emoji: "🤖",
    badge: "Precisão & Cálculo",
    description: "Forjado nos laboratórios de informática do IFES. Otimiza cada ciclo de aprendizado.",
    trait: "Economiza energia em sessões de estudo",
  },
  {
    type: "dragao_livro",
    defaultName: "Draco",
    emoji: "🐉",
    badge: "Mestria Ancestral",
    description: "Guardião místico dos acervos bibliotecários do IFES. Inspira foco e concentração profunda.",
    trait: "+25% de bônus de XP em leituras densas",
  },
];

export const FirstLaunchTutorial: React.FC<FirstLaunchTutorialProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedPetType, setSelectedPetType] = useState<PetType>("coruja");
  const [petCustomName, setPetCustomName] = useState<string>("Athena");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Ao trocar de passo, volta ao topo da área rolável
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [currentStep]);

  if (!isOpen) return null;

  const handleSelectPet = (pet: StarterPetOption) => {
    setSelectedPetType(pet.type);
    if (!petCustomName || STARTER_PETS.some((p) => p.defaultName === petCustomName)) {
      setPetCustomName(pet.defaultName);
    }
  };

  const handleFinish = () => {
    const chosenOption = STARTER_PETS.find((p) => p.type === selectedPetType) || STARTER_PETS[0];
    const finalName = petCustomName.trim() || chosenOption.defaultName;

    const newPet: UserPet = {
      id: selectedPetType,
      type: selectedPetType,
      activePetId: selectedPetType,
      name: finalName,
      customSpeciesName: chosenOption.badge,
      customSpeciesEmoji: chosenOption.emoji,
      level: 1,
      exp: 0,
      maxExp: 100,
      happiness: 100,
      hunger: 90,
      energy: 100,
      totalMeals: 0,
      lastFedTimestamp: new Date().toISOString(),
      lastFed: new Date().toISOString(),
      unlockedPets: [selectedPetType],
      customAccessory: "none",
    };

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onComplete(newPet);
  };

  return (
    // Fundo: tela cheia, respeitando as áreas seguras do Android
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Card: altura limitada à tela, em coluna. Quem rola é o miolo. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-full flex flex-col bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-2xl text-[var(--app-text)] overflow-hidden"
      >
        {/* Top Progress Bar & Header (fixo) */}
        <div className="p-4 sm:p-6 pb-3 border-b border-[var(--app-border)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center shadow-md shrink-0 border border-[var(--app-primary)]/30">
              <GraduationCap className="w-5 h-5 font-black" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[var(--app-text)] flex items-center gap-2">
                <span>Tutorial Inicial</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--app-primary)]/15 text-[var(--app-primary)] border border-[var(--app-primary)]/30">
                  Passo {currentStep} de 3
                </span>
              </h2>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                {currentStep === 1 && "Boas-vindas ao Brain Studio"}
                {currentStep === 2 && "Conhecendo os Módulos do Sistema"}
                {currentStep === 3 && "Escolha Obrigatória do Pet Companheiro"}
              </p>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? "w-7 bg-[var(--app-primary)]"
                    : currentStep > step
                    ? "w-2.5 bg-[var(--app-primary)]/60"
                    : "w-2.5 bg-[var(--app-border)]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Miolo rolável: é aqui que a rolagem acontece */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] p-5 sm:p-7"
        >
          <AnimatePresence mode="wait">
            {/* STEP 1: BOAS-VINDAS */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"