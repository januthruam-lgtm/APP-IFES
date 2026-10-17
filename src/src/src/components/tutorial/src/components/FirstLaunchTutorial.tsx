import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, ChevronLeft, GraduationCap } from "lucide-react";
import confetti from "canvas-confetti";
import { PetType, UserPet } from "../types";
import { STARTER_PETS, type StarterPetOption } from "./tutorial/starterPets";
import { StepWelcome } from "./tutorial/StepWelcome";
import { StepModules } from "./tutorial/StepModules";
import { StepPet } from "./tutorial/StepPet";

interface FirstLaunchTutorialProps {
  isOpen: boolean;
  onComplete: (chosenPet: UserPet) => void;
}

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

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    onComplete(newPet);
  };

  const subtitles: Record<number, string> = {
    1: "Boas-vindas ao Brain Studio",
    2: "Conhecendo os Módulos do Sistema",
    3: "Escolha Obrigatória do Pet Companheiro",
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
        {/* Cabeçalho (fixo) */}
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
                {subtitles[currentStep]}
              </p>
            </div>
          </div>

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
            {currentStep === 1 && <StepWelcome key="step-1" />}
            {currentStep === 2 && <StepModules key="step-2" />}
            {currentStep === 3 && (
              <StepPet
                key="step-3"
                selectedPetType={selectedPetType}
                petCustomName={petCustomName}
                onSelectPet={handleSelectPet}
                onNameChange={setPetCustomName}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Rodapé fixo: os botões nunca ficam fora da tela */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-[var(--app-border)] bg-[var(--app-card)] flex items-center justify-between gap-3 shrink-0">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3)}
              className="px-4 py-2 rounded-xl bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-xs font-bold text-[var(--app-text)] transition flex items-center gap-1.5 cursor-pointer border border-[var(--app-border)]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3)}
              className="px-5 py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={!selectedPetType}
              onClick={handleFinish}
              className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition cursor-pointer ${
                selectedPetType
                  ? "bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white shadow-sm scale-[1.02]"
                  : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] cursor-not-allowed border border-[var(--app-border)]"
              }`}
            >
              <span>{selectedPetType ? "Concluir e Ir para o Dashboard" : "Selecione um Pet para Começar"}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};