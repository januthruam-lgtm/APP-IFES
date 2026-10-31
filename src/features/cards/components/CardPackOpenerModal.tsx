import React, { useState } from "react";
import { Sparkles, X, ChevronRight, CheckCircle2, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { CardDropResult, CardPackDefinition } from "../types";
import { CardItem } from "./CardItem";

interface CardPackOpenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  packDef: CardPackDefinition | null;
  drops: CardDropResult[];
  onCollectAll: () => void;
}

export const CardPackOpenerModal: React.FC<CardPackOpenerModalProps> = ({
  isOpen,
  onClose,
  packDef,
  drops,
  onCollectAll,
}) => {
  if (!isOpen || !packDef || drops.length === 0) return null;

  // Estados da sequência de abertura: 'sealed' -> 'revealing' -> 'summary'
  const [phase, setPhase] = useState<"sealed" | "revealing" | "summary">("sealed");
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

  const handleStartTear = () => {
    setPhase("revealing");
    setRevealedIndices([]);
  };

  const handleRevealCard = (index: number) => {
    if (revealedIndices.includes(index)) return;

    const next = [...revealedIndices, index];
    setRevealedIndices(next);

    const droppedCard = drops[index];
    if (droppedCard?.card.isGolden || droppedCard?.card.rarity === "mitica" || droppedCard?.card.rarity === "lendaria") {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#FBBF24", "#F43F5E", "#10B981", "#8B5CF6"],
        });
      } catch {}
    }

    // Se todas as cartas foram reveladas, avança automaticamente para o resumo
    if (next.length === drops.length) {
      setTimeout(() => {
        setPhase("summary");
      }, 900);
    }
  };

  const handleRevealAll = () => {
    const all = drops.map((_, i) => i);
    setRevealedIndices(all);

    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch {}

    setTimeout(() => {
      setPhase("summary");
    }, 700);
  };

  const handleDone = () => {
    onCollectAll();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col items-center text-center overflow-hidden">
        {/* Glow de fundo */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none blur-3xl"
          style={{ backgroundColor: packDef.accentColor }}
        />

        {/* FASE 1: PACOTE LACRADO */}
        {phase === "sealed" && (
          <div className="flex flex-col items-center py-6 animate-in zoom-in-95 duration-300">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-2">
              IFES Colecionáveis • Edição Especial
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">
              {packDef.name}
            </h2>

            {/* O Pacote 3D em Si */}
            <div
              onClick={handleStartTear}
              className={`w-44 h-64 sm:w-52 sm:h-72 rounded-3xl bg-gradient-to-b ${packDef.bgGradient} border-2 border-slate-500/50 p-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] cursor-pointer select-none transform hover:scale-105 transition-all duration-300 flex flex-col justify-between items-center relative group`}
              style={{ borderColor: packDef.accentColor }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-3xl" />

              <div className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{packDef.cardCount} CARTAS</span>
              </div>

              <div className="my-auto text-center">
                <div className="text-5xl drop-shadow-lg mb-2">🃏✨</div>
                <h3 className="font-black text-lg text-white leading-tight">
                  {packDef.name}
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 max-w-[150px]">
                  {packDef.tagline}
                </p>
              </div>

              <div className="w-full py-2 rounded-xl bg-white/20 backdrop-blur-sm text-xs font-black tracking-wider text-white border border-white/30 group-hover:bg-white group-hover:text-slate-950 transition-colors">
                TOQUE PARA RASGAR
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-6 max-w-sm">
              Toque no pacote para romper o lacre e revelar suas novas cartas acadêmicas!
            </p>
          </div>
        )}

        {/* FASE 2: CARTAS VIRADAS (TOQUE PARA REVELAR) */}
        {phase === "revealing" && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="mb-4">
              <h3 className="text-xl font-black text-white">Toque nas Cartas para Revelar</h3>
              <p className="text-xs text-slate-400">
                {revealedIndices.length} de {drops.length} cartas reveladas
              </p>
            </div>

            {/* Grid responsivo das cartas */}
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 my-4 max-h-[60vh] overflow-y-auto p-2">
              {drops.map((drop, idx) => {
                const isFlipped = revealedIndices.includes(idx);
                return (
                  <div key={idx} className="perspective-1000">
                    {isFlipped ? (
                      <div className="animate-in flip-in-y duration-500">
                        <CardItem card={drop.card} count={drop.duplicateCount} size="md" />
                      </div>
                    ) : (
                      <div
                        onClick={() => handleRevealCard(idx)}
                        className="w-32 h-48 sm:w-36 sm:h-52 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 border-2 border-indigo-500/50 p-3 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-between select-none"
                      >
                        <div className="text-[10px] font-bold text-indigo-300">IFES CARD</div>
                        <div className="text-3xl animate-pulse">✨🃏</div>
                        <div className="text-[11px] font-black text-indigo-200 uppercase tracking-wider">
                          Virar
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleRevealAll}
              className="mt-3 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
            >
              Revelar Todas
            </button>
          </div>
        )}

        {/* FASE 3: RESUMO DE CONQUISTAS */}
        {phase === "summary" && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-black uppercase mb-1">
              <CheckCircle2 className="w-5 h-5" />
              <span>Pacote Aberto com Sucesso!</span>
            </div>

            <h3 className="text-2xl font-black text-white mb-4">
              Cartas Adicionadas ao seu Álbum
            </h3>

            {/* Grid final de cartas com badges de novidade */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 my-2 max-h-[55vh] overflow-y-auto p-2">
              {drops.map((drop, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <div className="absolute -top-2 z-20">
                    {drop.isNew ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px] shadow-lg animate-bounce">
                        NOVA!
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-bold text-[9px] shadow">
                        REPETIDA (+1)
                      </span>
                    )}
                  </div>
                  <CardItem card={drop.card} count={drop.duplicateCount} size="sm" />
                </div>
              ))}
            </div>

            <button
              onClick={handleDone}
              className="mt-5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Coletar e Ir ao Álbum</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
