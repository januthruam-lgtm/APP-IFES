import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  Plus,
} from "lucide-react";
import { CourseTrack, UserProfile } from "../../types";
import { OFFLINE_DECKS } from "../../data/offlineFlashcards";
import confetti from "canvas-confetti";

interface FlashcardsAnkiTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onRewardXp: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
}

export const FlashcardsAnkiTab: React.FC<FlashcardsAnkiTabProps> = ({
  user,
  courses,
  onRewardXp,
  onRewardCoins,
}) => {
  const [activeDeckIndex, setActiveDeckIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useState(0);

  const activeDeck = OFFLINE_DECKS[activeDeckIndex] || OFFLINE_DECKS[0];
  const currentCard = activeDeck.cards[currentCardIndex] || activeDeck.cards[0];

  const handleRate = (ease: "errei" | "dificil" | "bom" | "facil") => {
    const xpReward = ease === "facil" ? 15 : ease === "bom" ? 10 : 5;
    onRewardXp(xpReward);
    if (onRewardCoins && ease === "facil") {
      onRewardCoins(2);
    }

    setCardsReviewed((c) => c + 1);
    setIsFlipped(false);

    if (currentCardIndex + 1 < activeDeck.cards.length) {
      setCurrentCardIndex((idx) => idx + 1);
    } else {
      setCurrentCardIndex(0);
      confetti({ particleCount: 35, spread: 60 });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Repetição Espaçada • Algoritmo SM-2</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary,#f8fafc)]">
            Flashcards Anki Pro
          </h1>
          <p className="text-xs text-[var(--text-muted,#94a3b8)]">
            Revise conceitos-chave para memorização duradoura no longo prazo
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-xs font-bold text-emerald-400 flex items-center gap-2 self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4" />
          <span>{cardsReviewed} cards revisados hoje</span>
        </div>
      </div>

      {/* Deck Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {OFFLINE_DECKS.map((deck, idx) => (
          <button
            key={deck.id}
            onClick={() => {
              setActiveDeckIndex(idx);
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer ${
              activeDeckIndex === idx
                ? "bg-[var(--btn-primary,#6366f1)] text-white shadow-md"
                : "bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-muted,#94a3b8)] hover:text-white"
            }`}
          >
            {deck.title}
          </button>
        ))}
      </div>

      {/* Interactive Card */}
      {currentCard && (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[260px] sm:min-h-[300px] p-8 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-2xl flex flex-col justify-between cursor-pointer hover:border-indigo-500/50 transition-all select-none group relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-xs text-[var(--text-muted,#94a3b8)]">
              <span>Card {currentCardIndex + 1} de {activeDeck.cards.length}</span>
              <span className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:underline">
                <RotateCw className="w-3.5 h-3.5" />
                {isFlipped ? "Ver Pergunta" : "Girar para Resposta"}
              </span>
            </div>

            <div className="my-auto text-center py-4 space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 block">
                {isFlipped ? "RESPOSTA" : "PERGUNTA"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary,#f8fafc)] leading-relaxed max-w-xl mx-auto">
                {isFlipped ? currentCard.answer : currentCard.question}
              </h3>
            </div>

            <div className="text-center text-[11px] text-[var(--text-muted,#94a3b8)]">
              Toque no card para revelar o outro lado
            </div>
          </div>

          {/* Rating Buttons */}
          {isFlipped ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in">
              <button
                onClick={() => handleRate("errei")}
                className="p-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>Errei</span>
                <span className="text-[10px] opacity-70">&lt; 1 min (+5 XP)</span>
              </button>
              <button
                onClick={() => handleRate("dificil")}
                className="p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>Difícil</span>
                <span className="text-[10px] opacity-70">1 dia (+8 XP)</span>
              </button>
              <button
                onClick={() => handleRate("bom")}
                className="p-3 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>Bom</span>
                <span className="text-[10px] opacity-70">3 dias (+10 XP)</span>
              </button>
              <button
                onClick={() => handleRate("facil")}
                className="p-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
              >
                <span>Fácil</span>
                <span className="text-[10px] opacity-70">7 dias (+15 XP)</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsFlipped(true)}
              className="w-full py-3.5 rounded-2xl bg-[var(--btn-primary,#6366f1)] hover:bg-[var(--btn-primary-hover,#4f46e5)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
              <span>Mostrar Resposta</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
