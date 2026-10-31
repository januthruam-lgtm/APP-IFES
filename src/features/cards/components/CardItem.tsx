import React from "react";
import { Sparkles, Star } from "lucide-react";
import { CardDefinition, CardRarity } from "../types";

interface CardItemProps {
  card: CardDefinition;
  count?: number; // 0 = não possuída (faltante), 1 = no álbum, 2+ = repetida
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  isRevealing?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  count = 1,
  onClick,
  size = "md",
  isRevealing = false,
}) => {
  const isOwned = count > 0;
  const isDuplicate = count > 1;

  // Estilização temática profissional conforme raridade
  const getRarityStyles = (rarity: CardRarity, isGolden: boolean) => {
    if (isGolden) {
      return {
        border: "border-2 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.6)]",
        bg: "bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-700 text-slate-950",
        badgeBg: "bg-yellow-200 text-yellow-950 font-black",
        badgeText: "DOURADA",
        glow: "animate-pulse",
      };
    }

    switch (rarity) {
      case "mitica":
        return {
          border: "border-2 border-fuchsia-400 shadow-[0_0_18px_rgba(217,70,239,0.5)]",
          bg: "bg-gradient-to-b from-fuchsia-600 via-purple-700 to-indigo-900 text-white",
          badgeBg: "bg-fuchsia-400/30 text-fuchsia-200 border border-fuchsia-400/50",
          badgeText: "MÍTICA",
          glow: "",
        };
      case "lendaria":
        return {
          border: "border-2 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.45)]",
          bg: "bg-gradient-to-b from-amber-600 via-yellow-700 to-amber-950 text-white",
          badgeBg: "bg-amber-400/30 text-amber-200 border border-amber-400/50",
          badgeText: "LENDÁRIA",
          glow: "",
        };
      case "epica":
        return {
          border: "border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]",
          bg: "bg-gradient-to-b from-purple-700 via-indigo-800 to-slate-900 text-white",
          badgeBg: "bg-purple-400/30 text-purple-200 border border-purple-400/50",
          badgeText: "ÉPICA",
          glow: "",
        };
      case "rara":
        return {
          border: "border-2 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]",
          bg: "bg-gradient-to-b from-sky-700 via-blue-800 to-slate-900 text-white",
          badgeBg: "bg-sky-400/30 text-sky-200 border border-sky-400/50",
          badgeText: "RARA",
          glow: "",
        };
      case "comum":
      default:
        return {
          border: "border border-slate-600/80 shadow-md",
          bg: "bg-gradient-to-b from-slate-800 to-slate-900 text-slate-100",
          badgeBg: "bg-slate-700 text-slate-300",
          badgeText: "COMUM",
          glow: "",
        };
    }
  };

  const style = getRarityStyles(card.rarity, card.isGolden);

  const sizeClasses = {
    sm: "w-24 h-36 p-1.5 text-xs rounded-xl",
    md: "w-32 h-48 sm:w-36 sm:h-52 p-2.5 text-xs rounded-2xl",
    lg: "w-48 h-72 sm:w-56 sm:h-80 p-3.5 text-sm rounded-3xl",
  }[size];

  return (
    <div
      onClick={isOwned ? onClick : onClick}
      className={`relative select-none transition-all duration-300 transform active:scale-95 cursor-pointer flex flex-col justify-between overflow-hidden ${sizeClasses} ${
        isOwned
          ? `${style.border} ${style.bg} hover:-translate-y-1 hover:shadow-xl`
          : "border-2 border-dashed border-slate-700/80 bg-slate-900/60 opacity-60 grayscale hover:opacity-80 hover:grayscale-0"
      } ${isRevealing ? "animate-bounce" : ""}`}
    >
      {/* Reflexo holográfico sutil para cartas Lendárias/Míticas/Douradas */}
      {(card.isGolden || card.rarity === "mitica" || card.rarity === "lendaria") && isOwned && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none transform -rotate-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />
      )}

      {/* Header com badge de raridade e contador de repetidas */}
      <div className="flex items-center justify-between w-full z-10">
        <span
          className={`px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-bold ${
            isOwned ? style.badgeBg : "bg-slate-800 text-slate-400"
          }`}
        >
          {isOwned ? style.badgeText : "FALTANDO"}
        </span>

        {isDuplicate && (
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] shadow-sm flex items-center gap-0.5">
            +{count - 1}
          </span>
        )}
      </div>

      {/* Ilustração / Emoji Icon Central */}
      <div className="my-auto flex flex-col items-center justify-center text-center z-10">
        <div
          className={`rounded-2xl flex items-center justify-center shadow-inner ${
            size === "sm" ? "w-10 h-10 text-xl" : size === "md" ? "w-14 h-14 text-3xl" : "w-24 h-24 text-5xl"
          } ${
            card.isGolden
              ? "bg-yellow-100/90 text-amber-900 shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              : "bg-black/25 backdrop-blur-sm"
          }`}
        >
          {isOwned ? card.emoji : "❓"}
        </div>
      </div>

      {/* Rodapé com Nome e Subtítulo */}
      <div className="w-full text-center z-10">
        <h4
          className={`font-black truncate ${
            size === "sm" ? "text-[11px]" : size === "md" ? "text-xs" : "text-sm"
          } ${card.isGolden ? "text-slate-950 font-black" : "text-white"}`}
        >
          {isOwned ? card.name : "Bloqueada"}
        </h4>
        <p
          className={`truncate text-[9px] ${
            card.isGolden ? "text-amber-950 font-semibold" : "text-slate-300"
          }`}
        >
          {isOwned ? card.subtitle : "???"}
        </p>

        {card.isGolden && isOwned && (
          <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[8px] font-extrabold text-amber-950 tracking-tight">
            <Sparkles className="w-2.5 h-2.5" />
            <span>EDIÇÃO DOURADA</span>
          </div>
        )}
      </div>
    </div>
  );
};
