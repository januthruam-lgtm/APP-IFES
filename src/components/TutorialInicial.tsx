import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  BookOpen,
  Lightbulb,
  PawPrint,
  Sparkles,
  Compass,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Pet3DView } from "./pet3d/Pet3DView";

type PetOption = {
  type: string;
  defaultName: string;
  emoji: string;
  badge: string;
  description: string;
  trait: string;
};

export type PetData = {
  type: string;
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  happiness: number;
  hunger: number;
  energy: number;
  totalMeals: number;
  lastFedTimestamp: string;
  lastFed: string;
  unlockedPets: string[];
};

type TutorialInicialProps = {
  isOpen: boolean;
  onComplete: (pet: PetData) => void;
};

export const PETS: PetOption[] = [
  {
    type: "coruja",
    defaultName: "Athena",
    emoji: "🦉",
    badge: "Sabedoria & Síntese",
    description:
      "Símbolo ancestral da sabedoria acadêmica do IFES. Vigia atentamente cada sessão de estudos.",
    trait: "+10% de ganho de XP",
  },
  {
    type: "bunny",
    defaultName: "Bolin",
    emoji: "🐰",
    badge: "Agilidade & Foco",
    description:
      "Rápido nas revisões de flashcards e sempre alerta para sessões de estudo focadas.",
    trait: "+10% de velocidade de foco",
  },
  {
    type: "bird",
    defaultName: "Piu",
    emoji: "🐦",
    badge: "Visão & Síntese",
    description:
      "Perspicaz e com visão panorâmica sobre módulos longos e mapas conceituais.",
    trait: "+10% de absorção de leitura",
  },
  {
    type: "raposa",
    defaultName: "Faísca",
    emoji: "🦊",
    badge: "Astúcia & Resolução",
    description:
      "Extremamente ágil e analítica na resolução de exercícios práticos e lógica.",
    trait: "+15% de rapidez em testes",
  },
  {
    type: "elephant",
    defaultName: "Pipoca",
    emoji: "🐘",
    badge: "Memória Lendária",
    description:
      "Guarda todos os conceitos na memória de longo prazo para as provas do semestre.",
    trait: "+15% de retenção de conceitos",
  },
  {
    type: "tiger",
    defaultName: "Tigrão",
    emoji: "🐯",
    badge: "Garra & Lógica",
    description:
      "Determinado e competitivo, adora questionários difíceis e desafios lógicos.",
    trait: "+15% de garra em simulados",
  },
  {
    type: "gato_robo",
    defaultName: "Byte",
    emoji: "🤖",
    badge: "Precisão Algorítmica",
    description:
      "Forjado nos laboratórios de engenharia e informática do IFES. Otimiza o foco.",
    trait: "Economia de energia em quizzes",
  },
  {
    type: "dragao_livro",
    defaultName: "Ignis",
    emoji: "🐉",
    badge: "Mestre Lendário",
    description:
      "Criatura mítica protetora da sabedoria e do acervo bibliotecário do instituto.",
    trait: "+25% de XP em provas",
  },
];

const MODULES = [
  {
    emoji: "📊",
    title: "Dashboard Geral",
    text: "Visão panorâmica da sua ofensiva (dias seguidos de estudo), barra de energia vital, cartas colecionáveis e status do seu pet.",
    box: "bg-[var(--app-primary)]/15 text-[var(--app-primary)]",
  },
  {
    emoji: "📚",
    title: "Matérias & Trilhas de Aprendizagem",
    text: "Acesse suas matérias com módulos conceituais, simulados automáticos, flashcards e verificação detalhada de respostas com IA.",
    box: "bg-[var(--app-primary)]/15 text-[var(--app-primary)]",
  },
  {
    emoji: "💡",
    title: "Tutor Socrático Lumina",
    text: "Diálogo maiêutico inteligente com histórico instantâneo e sínteses automáticas salvas direto na sua biblioteca.",
    box: "bg-[var(--app-accent)]/15 text-[var(--app-accent)]",
  },
  {
    emoji: "📖",
    title: "Biblioteca & Cadernos",
    text: "Armazenamento dos seus resumos acadêmicos, conversas salvas com o tutor e histórico de exercícios.",
    box: "bg-amber-500/15 text-amber-500",
  },
  {
    emoji: "🐾",
    title: "Loja & Cuidados com o Pet",
    text: "Alimente seu companheiro, compre recargas e expansões permanentes de energia e desbloqueie distintivos exclusivos.",
    box: "bg-purple-500/15 text-purple-500",
  },
];

const STEP_SUBTITLES: Record<number, string> = {
  1: "Boas-vindas ao Brain Studio",
  2: "Conhecendo os Módulos do Sistema",
  3: "Escolha Obrigatória do Pet Companheiro",
};

export default function TutorialInicial({ isOpen, onComplete }: TutorialInicialProps) {
  const [step, setStep] = useState(1);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [petName, setPetName] = useState("");

  if (!isOpen) return null;

  const handleSelectPet = (pet: PetOption) => {
    setSelectedPet(pet.type);
    // Só troca o nome se estiver vazio ou ainda for o nome padrão de algum pet
    if (!petName || PETS.some((p) => p.defaultName === petName)) {
      setPetName(pet.defaultName);
    }
  };

  const handleFinish = () => {
    if (!selectedPet) return;
    const pet = PETS.find((p) => p.type === selectedPet);
    const name = petName.trim() || pet?.defaultName || "Bolin";
    const now = new Date().toISOString();

    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    onComplete({
      type: selectedPet,
      name,
      level: 1,
      exp: 0,
      maxExp: 100,
      happiness: 100,
      hunger: 80,
      energy: 100,
      totalMeals: 0,
      lastFedTimestamp: now,
      lastFed: now,
      unlockedPets: [selectedPet],
    });
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
        {/* Cabeçalho fixo */}
        <div className="p-4 sm:p-6 pb-3 border-b border-[var(--app-border)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center shadow-md shrink-0 border border-[var(--app-primary)]/30">
              <GraduationCap className="w-5 h-5 font-black" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-[var(--app-text)] flex items-center gap-2">
                <span>Tutorial Inicial</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--app-primary)]/15 text-[var(--app-primary)] border border-[var(--app-primary)]/30">
                  Passo {step} de 3
                </span>
              </h2>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                {STEP_SUBTITLES[step]}
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

        {/* Miolo rolável */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] p-5 sm:p-7 flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
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
                    Seu ecossistema inteligente de alta performance acadêmica.
                    Conecte seus estudos, exercite sua mente com mentoria
                    socrática e evolua junto com seu Pet.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] mx-auto flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--app-text)]">
                      Matérias IFES
                    </h4>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Sincronize ou importe suas disciplinas com resumos
                      estruturados.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--app-accent)]/15 text-[var(--app-accent)] mx-auto flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--app-text)]">
                      Tutor Socrático
                    </h4>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      IA Lumina que desafia seu raciocínio com perguntas
                      investigativas.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-center space-y-1.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 mx-auto flex items-center justify-center">
                      <PawPrint className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-[var(--app-text)]">
                      Pet Interativo
                    </h4>
                    <p className="text-[11px] text-[var(--app-text-muted)]">
                      Ganhe XP para alimentar e subir o nível do seu
                      companheiro de estudos.
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
                    Conheça as abas fundamentais que organizam sua jornada
                    acadêmica diária:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {MODULES.map((m) => (
                    <div
                      key={m.title}
                      className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl ${m.box} flex items-center justify-center shrink-0 mt-0.5 font-black text-xs`}
                      >
                        {m.emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[var(--app-text)]">
                          {m.title}
                        </h4>
                        <p className="text-[11px] text-[var(--app-text-muted)]">
                          {m.text}
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
                    <span>Escolha seu Pet Inicial</span>
                  </h3>
                  <p className="text-xs text-[var(--app-text-muted)] max-w-md mx-auto">
                    Selecione obrigatoriamente um pet companheiro para iniciar
                    sua jornada. Ele evoluirá conforme você estuda!
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {PETS.map((pet) => {
                    const active = selectedPet === pet.type;
                    return (
                      <div
                        key={pet.type}
                        onClick={() => handleSelectPet(pet)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSelectPet(pet);
                        }}
                        className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-1.5 select-none ${
                          active
                            ? "border-[var(--app-primary)] bg-[var(--app-primary)]/15 scale-[1.03]"
                            : "border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:border-[var(--app-primary)]/50"
                        }`}
                      >
                        {active && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--app-primary)] text-white flex items-center justify-center shadow-sm z-10">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-xl bg-[var(--app-card)]/40 border border-[var(--app-border)]/50 overflow-hidden flex items-center justify-center pointer-events-none p-1">
                          <Pet3DView
                            petType={pet.type}
                            petName={pet.defaultName}
                            size="sm"
                            className="w-full h-full"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[var(--app-text)]">
                            {pet.defaultName}
                          </h4>
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

                {selectedPet && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-3xl bg-[var(--app-card-secondary)] border-2 border-[var(--app-primary)]/30 flex flex-col sm:flex-row items-center gap-4"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-[var(--app-bg)]/80 border border-[var(--app-border)] overflow-hidden flex items-center justify-center p-1 shadow-inner">
                      <Pet3DView
                        petType={selectedPet}
                        petName={petName || (PETS.find((p) => p.type === selectedPet)?.defaultName)}
                        size="md"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="text-left w-full sm:w-auto flex-1">
                      <label
                        htmlFor="pet-name-input"
                        className="text-xs font-bold text-[var(--app-text)] block"
                      >
                        Nome do seu Mascote 3D:
                      </label>
                      <span className="text-[10px] text-[var(--app-text-muted)]">
                        Você pode manter o nome original ou dar um apelido único
                      </span>
                      <input
                        id="pet-name-input"
                        type="text"
                        maxLength={18}
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        placeholder="Nome do pet..."
                        className="w-full sm:w-60 mt-1 px-3 py-1.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold focus:outline-none focus:border-[var(--app-primary)]"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rodapé fixo: os botões nunca ficam fora da tela */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-[var(--app-border)] bg-[var(--app-card)] flex items-center justify-between gap-3 shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-xs font-bold text-[var(--app-text)] transition flex items-center gap-1.5 cursor-pointer border border-[var(--app-border)]"
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
              className="px-5 py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>Avançar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              disabled={!selectedPet}
              onClick={handleFinish}
              className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg transition cursor-pointer ${
                selectedPet
                  ? "bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white shadow-sm scale-[1.02]"
                  : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] cursor-not-allowed border border-[var(--app-border)]"
              }`}
            >
              <span>
                {selectedPet
                  ? "Concluir e Ir para o Dashboard"
                  : "Selecione um Pet para Começar"}
              </span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}