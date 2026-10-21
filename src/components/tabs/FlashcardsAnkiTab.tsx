import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Layers,
  RotateCw,
} from "lucide-react";
import { UserProfile, FlashcardItem, CourseTrack } from "../../types";
import { DEFAULT_OFFLINE_DECKS, DEFAULT_OFFLINE_FLASHCARDS, DeckInfo } from "../../data/offlineFlashcards";
import confetti from "canvas-confetti";

interface FlashcardsAnkiTabProps {
  user: UserProfile;
  courses?: CourseTrack[];
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
}

export const FlashcardsAnkiTab: React.FC<FlashcardsAnkiTabProps> = ({
  user,
  onRewardXp,
  onRewardCoins,
}) => {
  const { t } = useTranslation();
  const [decks] = useState<DeckInfo[]>(DEFAULT_OFFLINE_DECKS);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(decks[0]?.id || "");
  const [flashcards] = useState<FlashcardItem[]>(DEFAULT_OFFLINE_FLASHCARDS);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const deckCards = flashcards.filter((c) => c.deckId === selectedDeckId);
  const currentCard = deckCards[currentIndex] || deckCards[0];

  const handleRateCard = (rating: "again" | "hard" | "good" | "easy") => {
    setIsFlipped(false);
    setReviewedCount((r) => r + 1);

    const xpEarned = rating === "easy" ? 20 : rating === "good" ? 15 : 10;
    if (onRewardXp) onRewardXp(xpEarned);
    if (onRewardCoins) onRewardCoins(3);

    if (currentIndex + 1 < deckCards.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      setCurrentIndex(0);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--app-text)]">
              {t("flashcards.titulo", "Flashcards Inteligentes (Anki)")}
            </h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              {t("flashcards.subtitulo", "Repetição espaçada com revisão ativa para fixação permanente")}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[var(--app-primary)] px-3 py-1.5 rounded-xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20">
          {reviewedCount} {t("flashcards.revisar_baralho", "revisões")}
        </span>
      </div>

      {/* Decks Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {decks.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => {
              setSelectedDeckId(d.id);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition shrink-0 cursor-pointer ${
              selectedDeckId === d.id
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text-muted)]"
            }`}
          >
            <span>{d.icon || "🗂️"}</span>
            <span>{d.title}</span>
          </button>
        ))}
      </div>

      {/* Flashcard Area */}
      {currentCard ? (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[280px] sm:min-h-[320px] p-8 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs flex flex-col justify-between cursor-pointer hover:border-[var(--app-primary)] transition select-none"
          >
            <div className="flex items-center justify-between text-xs text-[var(--app-text-muted)]">
              <span className="font-bold uppercase tracking-wider">
                {isFlipped ? t("flashcards.verso", "Verso da Resposta") : t("flashcards.frente", "Frente da Pergunta")}
              </span>
              <span className="flex items-center gap-1 text-[var(--app-primary)] font-bold">
                <RotateCw className="w-3.5 h-3.5" /> {t("flashcards.toque_para_virar", "Toque no cartão para virar")}
              </span>
            </div>

            <div className="py-6 text-center">
              <p className="text-base sm:text-xl font-bold text-[var(--app-text)] leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="text-center text-[11px] text-[var(--app-text-muted)] font-mono">
              Card {currentIndex + 1} de {deckCards.length}
            </div>
          </div>

          {/* Rating Controls */}
          {isFlipped ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-in fade-in">
              <button
                type="button"
                onClick={() => handleRateCard("again")}
                className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold transition cursor-pointer"
              >
                {t("flashcards.errar", "Errei")} (1d)
              </button>
              <button
                type="button"
                onClick={() => handleRateCard("hard")}
                className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
              >
                {t("flashcards.dificil", "Difícil")} (2d)
              </button>
              <button
                type="button"
                onClick={() => handleRateCard("good")}
                className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 text-xs font-bold transition cursor-pointer"
              >
                {t("flashcards.bom", "Bom")} (4d)
              </button>
              <button
                type="button"
                onClick={() => handleRateCard("easy")}
                className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold transition cursor-pointer"
              >
                {t("flashcards.facil", "Fácil")} (7d)
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsFlipped(true)}
                className="px-6 py-2.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {t("flashcards.mostrar_resposta", "Mostrar Resposta")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-[var(--app-card)] rounded-3xl border border-[var(--app-border)]">
          <p className="text-xs text-[var(--app-text-muted)]">
            {t("flashcards.cards_restantes", { count: 0, defaultValue: "Nenhum cartão cadastrado neste baralho ainda." })}
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashcardsAnkiTab;
