import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  Layers,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { MEMORY_CONCEPT_PAIRS, MemoryConceptPair } from "../../data/memoryPairs";
import { gameAudio } from "../../audio";
import { SessionResultPayload } from "../../services/gamesService";

interface MemoryCardsGameProps {
  userId: string;
  userName: string;
  sessionToken: string;
  onFinishGame: (payload: SessionResultPayload) => void;
  onExit: () => void;
}

interface CardItem {
  uid: string;
  pairId: string;
  text: string;
  type: "termA" | "termB";
  hint: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryCardsGame: React.FC<MemoryCardsGameProps> = ({
  sessionToken,
  onFinishGame,
  onExit,
}) => {
  const [phase, setPhase] = useState<number>(1); // 1 = 6 pares (12 cartas), 2 = 8 pares (16 cartas), 3 = 10 pares (20 cartas)
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [matchesCount, setMatchesCount] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());

  const timerRef = useRef<any>(null);

  const getPairsForPhase = (ph: number): MemoryConceptPair[] => {
    const pairCount = ph === 1 ? 6 : ph === 2 ? 8 : 10;
    const shuffledPool = [...MEMORY_CONCEPT_PAIRS].sort(() => Math.random() - 0.5);
    return shuffledPool.slice(0, pairCount);
  };

  const initGame = (ph: number) => {
    const pairs = getPairsForPhase(ph);
    const cardList: CardItem[] = [];

    pairs.forEach((p, idx) => {
      cardList.push({
        uid: `${p.id}_A_${idx}`,
        pairId: p.id,
        text: p.termA,
        type: "termA",
        hint: p.hint,
        isFlipped: false,
        isMatched: false,
      });
      cardList.push({
        uid: `${p.id}_B_${idx}`,
        pairId: p.id,
        text: p.termB,
        type: "termB",
        hint: p.hint,
        isFlipped: false,
        isMatched: false,
      });
    });

    const randomized = cardList.sort(() => Math.random() - 0.5);
    setCards(randomized);
    setFlippedIndices([]);
    setMovesCount(0);
    setMatchesCount(0);
    setSecondsElapsed(0);
    setIsGameRunning(true);
    setIsCompleted(false);
  };

  useEffect(() => {
    initGame(phase);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Cronômetro
  useEffect(() => {
    if (!isGameRunning || isCompleted) return;
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isGameRunning, isCompleted]);

  const handleCardClick = (index: number) => {
    if (!isGameRunning || isCompleted) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    gameAudio.playCardFlip();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMovesCount((prev) => prev + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const card1 = newCards[firstIdx];
      const card2 = newCards[secondIdx];

      if (card1.pairId === card2.pairId && card1.type !== card2.type) {
        // MATCH!
        setTimeout(() => {
          gameAudio.playCorrect();
          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatchesCount((prev) => {
            const nextMatch = prev + 1;
            const totalPairs = cards.length / 2;
            if (nextMatch >= totalPairs) {
              handlePhaseVictory();
            }
            return nextMatch;
          });
        }, 300);
      } else {
        // NO MATCH
        setTimeout(() => {
          gameAudio.playWrong();
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const handlePhaseVictory = () => {
    setIsCompleted(true);
    clearInterval(timerRef.current);
    gameAudio.playVictory();

    const totalPairs = cards.length / 2;
    const efficiencyScore = Math.max(100, Math.round((totalPairs * 100) - (movesCount * 8) - (secondsElapsed * 2)));

    onFinishGame({
      sessionToken,
      gameId: "memory_cards",
      score: efficiencyScore,
      movesCount,
      phasesCompleted: phase,
      extraNote: `Fase ${phase} (${cards.length} cartas) em ${movesCount} movimentos`,
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-500 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--app-text)] leading-tight">Memory Cards</h3>
            <span className="text-xs text-[var(--app-text-muted)]">Nível 3 • Fórmulas & Conceitos</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = gameAudio.toggleMute();
              setIsAudioMuted(muted);
            }}
            className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)]/50 transition cursor-pointer"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onExit}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Barra de Status e Seleção de Fases */}
      <div className="px-6 py-3 border-b border-[var(--app-border)] flex flex-wrap items-center justify-between gap-3 text-xs bg-[var(--app-bg)]/40">
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--app-text-muted)] mr-1">Fase:</span>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() => {
                gameAudio.playClick();
                setPhase(p);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                phase === p
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              {p === 1 ? "12 Cartas" : p === 2 ? "16 Cartas" : "20 Cartas"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 font-mono font-bold">
          <div className="flex items-center gap-1.5 text-purple-500">
            <Timer className="w-3.5 h-3.5" />
            <span>{formatTime(secondsElapsed)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--app-text)]">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>{movesCount} mov</span>
          </div>
          <div className="text-emerald-500">
            {matchesCount} / {cards.length / 2} pares
          </div>
        </div>
      </div>

      {/* Grid de Cartas */}
      <div className="p-4 sm:p-6 lg:p-8 flex-1">
        <div
          className={`grid gap-2.5 sm:gap-3 ${
            cards.length <= 12
              ? "grid-cols-3 sm:grid-cols-4"
              : cards.length <= 16
              ? "grid-cols-4"
              : "grid-cols-4 sm:grid-cols-5"
          }`}
        >
          {cards.map((card, idx) => {
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <div
                key={card.uid}
                onClick={() => handleCardClick(idx)}
                className={`relative aspect-[4/3] rounded-2xl cursor-pointer select-none transition-all duration-300 transform perspective-1000 ${
                  card.isMatched ? "opacity-60 scale-[0.98]" : "hover:scale-[1.02]"
                }`}
              >
                <div
                  className={`w-full h-full rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center border transition-all duration-300 ${
                    isRevealed
                      ? card.isMatched
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                        : "bg-[var(--app-card)] border-purple-500 text-[var(--app-text)] shadow-md"
                      : "bg-[var(--app-card-secondary)] border-[var(--app-border)] hover:border-purple-500/40 text-[var(--app-text-muted)]"
                  }`}
                >
                  {isRevealed ? (
                    <div className="space-y-1 w-full animate-fade-in">
                      <p className="text-xs sm:text-sm font-bold leading-snug line-clamp-3">
                        {card.text}
                      </p>
                      <span className="text-[9px] uppercase tracking-wider text-[var(--app-text-muted)] block truncate font-medium">
                        {card.hint}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="w-7 h-7 rounded-full bg-[var(--app-border)]/60 flex items-center justify-center text-purple-400 font-black text-xs">
                        ?
                      </div>
                      <span className="text-[9px] tracking-widest uppercase font-mono text-[var(--app-text-muted)]">
                        IFES
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Conclusão de Fase */}
      {isCompleted && (
        <div className="p-6 border-t border-[var(--app-border)] bg-[var(--app-card-secondary)]/80 text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-purple-500">
            <Award className="w-6 h-6" />
            <h4 className="text-xl font-black text-[var(--app-text)]">
              Memória Perfeita!
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
            Você completou a fase {phase} em <strong className="text-[var(--app-text)]">{movesCount} movimentos</strong> e{" "}
            <strong className="text-[var(--app-text)]">{formatTime(secondsElapsed)}</strong>.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => initGame(phase)}
              className="px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Jogar Novamente</span>
            </button>
            {phase < 3 && (
              <button
                onClick={() => setPhase((prev) => prev + 1)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Avançar para Fase {phase + 1}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onExit}
              className="px-4 py-2.5 rounded-xl bg-[var(--app-border)] text-[var(--app-text)] font-bold text-xs transition cursor-pointer"
            >
              Voltar ao Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
