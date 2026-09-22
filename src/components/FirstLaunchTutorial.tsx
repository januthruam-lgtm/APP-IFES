import React, { useState } from "react";
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
    type: "bunny",
    defaultName: "Bolin",
    emoji: "🐰",
    badge: "Agilidade & Foco",
    description: "Rápido nas revisões de flashcards e sempre alerta para sessões de estudo focadas.",
    trait: "+10% de velocidade de foco",
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
    trait: "+15% de retenção de conceitos",
  },
  {
    type: "tiger",
    defaultName: "Tigrão",
    emoji: "🐯",
    badge: "Garra & Lógica",
    description: "Determinado e competitivo, adora questionários difíceis e desafios lógicos.",
    trait: "+15% de garra em simulados",
  },
];

export const FirstLaunchTutorial: React.FC<FirstLaunchTutorialProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedPetType, setSelectedPetType] = useState<PetType | null>(null);
  const [petCustomName, setPetCustomName] = useState<string>("");

  if (!isOpen) return null;

  const handleSelectPet = (pet: StarterPetOption) => {
    setSelectedPetType(pet.type);
    if (!petCustomName || STARTER_PETS.some((p) => p.defaultName === petCustomName)) {
      setPetCustomName(pet.defaultName);
    }
  };

  const handleFinish = () => {
    if (!selectedPetType) return;

    const chosenOption = STARTER_PETS.find((p) => p.type === selectedPetType);
    const finalName = petCustomName.trim() || chosenOption?.defaultName || "Bolin";

    const newPet: UserPet = {
      type: selectedPetType,
      name: finalName,
      level: 1,
      exp: 0,
      maxExp: 100,
      happiness: 100,
      hunger: 80,
      energy: 100,
      totalMeals: 0,
      lastFedTimestamp: new Date().toISOString(),
      lastFed: new Date().toISOString(),
      unlockedPets: [selectedPetType],
    };

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onComplete(newPet);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-2xl text-[var(--app-text)] overflow-hidden my-auto"
      >
        {/* Top Progress Bar & Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-[var(--app-border)] flex items-center justify-between gap-3">
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

        {/* Dynamic Step Content */}
        <div className="p-5 sm:p-7 min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* STEP 1: BOAS-VINDAS */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="inline-flex p-3 rounded-2xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20 mb-1">
                    <img
                      src="/logo.png"
                      alt="Brain Studio Logo"
                      className="w-44 sm:w-52 h-auto object-contain mx-auto"
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[var(--app-text)]">
                    Bem-vindo ao Brain Studio!
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--app-text-muted)] max-w-lg mx-auto leading-relaxed">
                    Seu ecossistema inteligente de alta performance acadêmica. Conecte seus estudos, 
                    exercite sua mente com mentoria socrática e evolua junto com seu Pet.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] mx-auto flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--app-text)]">Matérias IFES</h4>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Sincronize ou importe suas disciplinas com resumos estruturados.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--app-accent)]/15 text-[var(--app-accent)] mx-auto flex items-center justify-center">
                      <MessageSquareCode className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--app-text)]">Tutor Socrático</h4>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      IA Lumina que desafia seu raciocínio com perguntas investigativas.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 mx-auto flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--app-text)]">Pet Interativo</h4>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Ganhe XP para alimentar e subir o nível do seu companheiro de estudos.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: EXPLICAÇÃO DAS ABAS */}
            {currentStep === 2 && (
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
                    Conheça as abas fundamentais que organizam sua jornada acadêmica diária:
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                      📊
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[var(--app-text)]">Dashboard Geral</h4>
                      <p className="text-[11px] text-[var(--app-text-muted)]">
                        Visão panorâmica da sua ofensiva (dias seguidos de estudo), barra de energia vital, cartas colecionáveis e status do seu pet.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                      📚
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[var(--app-text)]">Matérias & Trilhas de Aprendizagem</h4>
                      <p className="text-[11px] text-[var(--app-text-muted)]">
                        Acesse suas matérias com módulos conceituais, simulados automáticos, flashcards e verificação detalhada de respostas com IA.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--app-accent)]/15 text-[var(--app-accent)] flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                      💡
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[var(--app-text)]">Tutor Socrático Lumina</h4>
                      <p className="text-[11px] text-[var(--app-text-muted)]">
                        Diálogo maiêutico inteligente com histórico instantâneo e sínteses automáticas salvas direto na sua biblioteca.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                      📖
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[var(--app-text)]">Biblioteca & Cadernos</h4>
                      <p className="text-[11px] text-[var(--app-text-muted)]">
                        Armazenamento dos seus resumos acadêmicos, conversas salvas com o tutor e histórico de exercícios.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0 mt-0.5 font-black text-xs">
                      🐾
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[var(--app-text)]">Loja & Cuidados com o Pet</h4>
                      <p className="text-[11px] text-[var(--app-text-muted)]">
                        Alimente seu companheiro, compre recargas e expansões permanentes de energia e desbloqueie distintivos exclusivos.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ESCOLHA OBRIGATÓRIA DO PET INICIAL */}
            {currentStep === 3 && (
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
                    <span>Escolha seu Pet Inicial</span>
                  </h3>
                  <p className="text-xs text-[var(--app-text-muted)] max-w-md mx-auto">
                    Selecione obrigatoriamente um pet companheiro para iniciar sua jornada. Ele evoluirá conforme você estuda!
                  </p>
                </div>

                {/* Pet Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {STARTER_PETS.map((pet) => {
                    const isSelected = selectedPetType === pet.type;
                    return (
                      <div
                        key={pet.type}
                        onClick={() => handleSelectPet(pet)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSelectPet(pet);
                        }}
                        className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2 select-none ${
                          isSelected
                            ? "border-[var(--app-primary)] bg-[var(--app-primary)]/15 scale-[1.03]"
                            : "border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:border-[var(--app-primary)]/50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--app-primary)] text-white flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        <div className="text-4xl sm:text-5xl py-1 filter drop-shadow-md transition-transform group-hover:scale-110">
                          {pet.emoji}
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-[var(--app-text)]">{pet.defaultName}</h4>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--app-card)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                            {pet.badge}
                          </span>
                        </div>

                        <p className="text-[10px] text-[var(--app-text-muted)] leading-snug line-clamp-2">
                          {pet.description}
                        </p>

                        <div className="w-full pt-1 border-t border-[var(--app-border)] text-[9px] font-bold text-[var(--app-primary)]">
                          {pet.trait}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Optional Custom Name */}
                {selectedPetType && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex flex-col sm:flex-row items-center justify-between gap-2.5"
                  >
                    <div className="text-left w-full sm:w-auto">
                      <label htmlFor="pet-name-input" className="text-xs font-bold text-[var(--app-text)] block">
                        Nome do seu Pet Companheiro:
                      </label>
                      <span className="text-[10px] text-[var(--app-text-muted)]">
                        Você pode manter o nome original ou dar um apelido único
                      </span>
                    </div>
                    <input
                      id="pet-name-input"
                      type="text"
                      maxLength={18}
                      value={petCustomName}
                      onChange={(e) => setPetCustomName(e.target.value)}
                      placeholder="Nome do pet..."
                      className="w-full sm:w-56 px-3 py-1.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold focus:outline-none focus:border-[var(--app-primary)]"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Navigation Buttons */}
          <div className="pt-6 border-t border-[var(--app-border)] flex items-center justify-between gap-3 mt-4">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
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
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
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
        </div>
      </motion.div>
    </div>
  );
};
