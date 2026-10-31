import React from "react";
import { X, Sparkles, Star, BookOpen, Layers, Recycle, Hammer } from "lucide-react";
import { CardDefinition } from "../types";
import { RARITY_SHARD_VALUES } from "../services/cardService";

interface CardDetailModalProps {
  card: CardDefinition | null;
  count: number;
  userShards: number;
  isOpen: boolean;
  onClose: () => void;
  onRecycleDuplicate?: (cardId: string) => void;
  onCraftCard?: (cardId: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  count,
  userShards,
  isOpen,
  onClose,
  onRecycleDuplicate,
  onCraftCard,
}) => {
  if (!isOpen || !card) return null;

  const isOwned = count > 0;
  const isDuplicate = count > 1;
  const craftCost = RARITY_SHARD_VALUES[card.rarity].craft;
  const recycleYield = RARITY_SHARD_VALUES[card.rarity].recycle;
  const canCraft = !isOwned && userShards >= craftCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        {/* Glow de fundo correspondente à raridade */}
        <div
          className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: card.primaryColor }}
        />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título da Coleção */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>{card.collectionName}</span>
        </div>

        {/* Apresentação Principal da Carta */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-5">
          {/* Card Visual Hero */}
          <div
            className={`w-36 h-52 sm:w-40 sm:h-56 rounded-2xl p-3 flex flex-col justify-between shadow-2xl relative select-none transform hover:scale-105 transition-transform duration-300 ${
              card.isGolden
                ? "bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 border-2 border-yellow-200 text-slate-950 shadow-[0_0_25px_rgba(234,179,8,0.7)]"
                : `bg-gradient-to-b ${
                    card.rarity === "mitica"
                      ? "from-fuchsia-600 to-purple-950 border-2 border-fuchsia-400"
                      : card.rarity === "lendaria"
                      ? "from-amber-500 to-yellow-950 border-2 border-amber-400"
                      : card.rarity === "epica"
                      ? "from-purple-600 to-slate-950 border-2 border-purple-400"
                      : card.rarity === "rara"
                      ? "from-sky-600 to-slate-950 border-2 border-sky-400"
                      : "from-slate-700 to-slate-950 border border-slate-600"
                  } text-white`
            }`}
          >
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
              <span>{card.rarity}</span>
              {card.isGolden && (
                <span className="flex items-center gap-0.5 bg-yellow-100 text-amber-950 px-1 py-0.5 rounded">
                  <Sparkles className="w-2.5 h-2.5" /> DOURADA
                </span>
              )}
            </div>

            <div className="text-center my-auto">
              <span className="text-5xl drop-shadow-md">{card.emoji}</span>
            </div>

            <div className="text-center">
              <h4 className="font-extrabold text-sm leading-tight">{card.name}</h4>
              <p className="text-[10px] opacity-80 truncate">{card.eraOrField}</p>
            </div>
          </div>

          {/* Info & Status */}
          <div className="flex-1 text-left space-y-2.5">
            <div>
              <h3 className="text-xl font-black text-white">{card.name}</h3>
              <p className="text-xs text-cyan-400 font-semibold">{card.subtitle}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.eraOrField}</p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  isOwned
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {isOwned ? `No Álbum (${count} ${count === 1 ? "cópia" : "cópias"})` : "Ainda Não Descoberta"}
              </span>

              {card.isGolden && (
                <span className="text-xs px-2.5 py-1 rounded-full font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Carta Dourada
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{card.description}</p>
          </div>
        </div>

        {/* Curiosidade Histórica & Educacional */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curiosidade Acadêmica</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">"{card.triviaFact}"</p>
        </div>

        {/* Ações: Reciclar Repetida ou Forjar Carta Faltante */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          {isDuplicate && onRecycleDuplicate && (
            <button
              onClick={() => onRecycleDuplicate(card.id)}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Recycle className="w-4 h-4 text-purple-400" />
              <span>
                Reciclar 1 Repetida (+{recycleYield} Fragmentos Estelares)
              </span>
            </button>
          )}

          {!isOwned && onCraftCard && (
            <button
              disabled={!canCraft}
              onClick={() => onCraftCard(card.id)}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                canCraft
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed"
              }`}
            >
              <Hammer className="w-4 h-4" />
              <span>
                Forjar Carta ({craftCost} Fragmentos • Saldo: {userShards})
              </span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
