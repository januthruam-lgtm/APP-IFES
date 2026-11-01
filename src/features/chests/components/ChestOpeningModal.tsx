import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Coins,
  Star,
  Gift,
  CheckCircle2,
  ChevronRight,
  Award,
  FastForward,
  Volume2,
  VolumeX,
  X,
  Info,
  Shield,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ChestDropResult, ChestAwardedCard, ChestType } from "../types";
import { CHESTS_CONFIG } from "../services/chestService";
import { CardDefinition, CardRarity } from "../../cards/types";
import {
  isAudioEnabled,
  setAudioEnabled,
  playChestTap,
  playChestRumble,
  playChestOpen,
  playCoinTinkle,
  playXpWhoosh,
  playShardSparkle,
  playCardFlip,
  playNewCardFanfare,
  playSummaryFanfare,
} from "../utils/chestAudio";

interface ChestOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  dropResult: ChestDropResult | null;
  onCollect: (drops: ChestDropResult) => void;
}

type RevealItem =
  | { type: "coins"; amount: number }
  | { type: "xp"; amount: number }
  | { type: "shards"; amount: number }
  | { type: "card"; card: CardDefinition; isNew: boolean; copiesAfter: number }
  | { type: "badge"; name: string };

type ModalPhase = "idle" | "opening" | "revealing" | "summary";

export const ChestOpeningModal: React.FC<ChestOpeningModalProps> = ({
  isOpen,
  onClose,
  dropResult,
  onCollect,
}) => {
  const chestDef = CHESTS_CONFIG[dropResult?.chestType || "madeira"] || CHESTS_CONFIG.madeira;

  const [phase, setPhase] = useState<ModalPhase>("idle");
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [soundActive, setSoundActive] = useState<boolean>(() => isAudioEnabled());
  const [cardFlipAnim, setCardFlipAnim] = useState<boolean>(false);
  const [selectedCardDetail, setSelectedCardDetail] = useState<CardDefinition | null>(null);

  // Prepara a lista sequencial de itens a revelar
  const revealItems = React.useMemo<RevealItem[]>(() => {
    if (!dropResult) return [];
    const list: RevealItem[] = [];
    if (dropResult.coins > 0) {
      list.push({ type: "coins", amount: dropResult.coins });
    }
    if (dropResult.xp > 0) {
      list.push({ type: "xp", amount: dropResult.xp });
    }
    if (dropResult.starShards > 0) {
      list.push({ type: "shards", amount: dropResult.starShards });
    }
    if (dropResult.cardsAwarded && dropResult.cardsAwarded.length > 0) {
      for (const cardDrop of dropResult.cardsAwarded) {
        list.push({
          type: "card",
          card: cardDrop.card,
          isNew: cardDrop.isNew,
          copiesAfter: cardDrop.copiesAfter,
        });
      }
    }
    if (dropResult.badgeAwarded) {
      list.push({ type: "badge", name: dropResult.badgeAwarded });
    }
    return list;
  }, [dropResult]);

  // Reinicia estados quando o modal é aberto
  useEffect(() => {
    if (isOpen && dropResult) {
      setPhase("idle");
      setStepIndex(0);
      setCardFlipAnim(false);
      setSelectedCardDetail(null);
    }
  }, [isOpen, dropResult]);

  if (!isOpen || !dropResult) return null;

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundActive;
    setSoundActive(next);
    setAudioEnabled(next);
  };

  // Disparo de efeitos da abertura do baú
  const handleOpenChest = () => {
    if (phase !== "idle") return;

    playChestTap();
    playChestRumble();
    setPhase("opening");

    // Efeito sonoro do baú abrindo com a tampa
    setTimeout(() => {
      playChestOpen(dropResult.chestType);

      try {
        const confettiColors =
          dropResult.chestType === "mitico"
            ? ["#EC4899", "#8B5CF6", "#3B82F6", "#F43F5E", "#FDE047"]
            : dropResult.chestType === "lendario" || dropResult.chestType === "ouro"
            ? ["#F59E0B", "#FBBF24", "#FEF08A", "#D97706", "#FFFBEB"]
            : dropResult.chestType === "epico"
            ? ["#A855F7", "#C084FC", "#9333EA", "#E9D5FF"]
            : ["#38BDF8", "#FBBF24", "#34D399", "#A78BFA"];

        confetti({
          particleCount: dropResult.chestType === "mitico" ? 120 : 80,
          spread: 85,
          origin: { y: 0.5 },
          colors: confettiColors,
        });
      } catch {}

      // Aguarda o clímax da luz e avança para a sequência de itens
      setTimeout(() => {
        setPhase("revealing");
        setStepIndex(0);
        playRevealSoundForItem(revealItems[0]);
      }, 1000);
    }, 600);
  };

  // Toca o som apropriado para cada item da sequência
  const playRevealSoundForItem = (item?: RevealItem) => {
    if (!item) return;
    if (item.type === "coins") {
      playCoinTinkle();
    } else if (item.type === "xp") {
      playXpWhoosh();
    } else if (item.type === "shards") {
      playShardSparkle();
    } else if (item.type === "card") {
      setCardFlipAnim(true);
      setTimeout(() => {
        playCardFlip(item.card.rarity, item.card.isGolden);
        if (item.isNew) {
          setTimeout(playNewCardFanfare, 250);
        }
      }, 150);
    } else if (item.type === "badge") {
      playSummaryFanfare();
    }
  };

  // Avança para o próximo item
  const handleNextStep = () => {
    if (phase !== "revealing") return;

    const nextIndex = stepIndex + 1;
    if (nextIndex < revealItems.length) {
      setStepIndex(nextIndex);
      setCardFlipAnim(false);
      playRevealSoundForItem(revealItems[nextIndex]);
    } else {
      // Chegou ao fim da sequência: mostra tela de resumo
      setPhase("summary");
      playSummaryFanfare();
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  // Pular animação e ir direto ao resumo
  const handleSkipAnimation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhase("summary");
    playSummaryFanfare();
  };

  // Coleta final e fechamento
  const handleCollectAndClose = () => {
    onCollect(dropResult);
    onClose();
  };

  const currentItem = revealItems[stepIndex];

  return (
    <div
      onClick={phase === "revealing" ? handleNextStep : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300 select-none overflow-y-auto"
    >
      <div
        onClick={(e) => {
          // Permite toque geral na fase revealing, mas previne em outras
          if (phase !== "revealing") e.stopPropagation();
        }}
        className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-[0_0_80px_rgba(0,0,0,0.8)] text-slate-100 flex flex-col items-center text-center overflow-hidden my-auto"
      >
        {/* Glow de ambientação no fundo */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none blur-3xl transition-all duration-700"
          style={{ backgroundColor: chestDef.accentColor }}
        />

        {/* Barra superior de controle (Áudio & Pular) */}
        <div className="w-full flex items-center justify-between z-20 mb-3">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title={soundActive ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros"}
          >
            {soundActive ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Som</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Mudo</span>
              </>
            )}
          </button>

          {phase !== "summary" && (
            <button
              onClick={handleSkipAnimation}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-md shadow-amber-500/10 active:scale-95"
            >
              <span>Pular Animação</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          )}

          {phase === "summary" && (
            <button
              onClick={handleCollectAndClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* FASE 1: BAÚ FECHADO (IDLE) / ABRINDO (OPENING)                */}
        {/* ============================================================ */}
        {(phase === "idle" || phase === "opening") && (
          <div className="w-full flex flex-col items-center py-4">
            <span
              className="text-xs font-black uppercase tracking-widest mb-1.5 px-3 py-1 rounded-full border"
              style={{
                color: chestDef.accentColor,
                borderColor: `${chestDef.accentColor}40`,
                backgroundColor: `${chestDef.accentColor}15`,
              }}
            >
              {chestDef.subtitle}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {chestDef.name}
            </h2>

            <p className="text-xs text-slate-400 max-w-sm mb-6">
              {chestDef.description}
            </p>

            {/* Baú 3D Interativo com Feixe de Luz e Animação */}
            <div className="relative my-4 flex items-center justify-center">
              {/* Feixes de luz girando na abertura */}
              {phase === "opening" && (
                <div
                  className="absolute -inset-16 rounded-full blur-2xl animate-spin pointer-events-none opacity-80"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${chestDef.accentColor}, transparent, ${chestDef.accentColor}, transparent)`,
                    animationDuration: "3s",
                  }}
                />
              )}

              {/* Halo de luz central */}
              <div
                className={`absolute w-44 h-44 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
                  phase === "opening" ? "scale-150 opacity-90" : "scale-100 opacity-40"
                }`}
                style={{ backgroundColor: chestDef.accentColor }}
              />

              {/* Caixa do Baú */}
              <div
                onClick={handleOpenChest}
                className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-b ${
                  chestDef.bgGradient
                } border-2 p-5 cursor-pointer select-none transition-all duration-300 flex flex-col items-center justify-center shadow-2xl ${
                  phase === "opening"
                    ? "animate-pulse scale-105 border-yellow-300 shadow-[0_0_80px_rgba(250,204,21,0.6)]"
                    : "hover:scale-105 active:scale-95 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-bounce"
                }`}
                style={{ borderColor: chestDef.accentColor }}
              >
                {/* Fechadura / Tampa Superior */}
                <div className="text-7xl sm:text-8xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter transition-transform duration-500">
                  {chestDef.icon}
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-black/40 px-3 py-1 rounded-full border border-amber-400/30 shadow-inner">
                    {phase === "opening" ? "Abrindo..." : "Toque para Abrir"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Contém Moedas, XP, Fragmentos e Cartas Garantidas!</span>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FASE 2: REVELAÇÃO SEQUENCIAL (REVEALING)                      */}
        {/* ============================================================ */}
        {phase === "revealing" && currentItem && (
          <div className="w-full flex flex-col items-center py-2 animate-in zoom-in-95 duration-200">
            {/* Barra de Progresso da Sequência */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
              <span className="font-bold text-amber-400">
                Item {stepIndex + 1} de {revealItems.length}
              </span>
              <div className="flex-1 mx-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                  style={{
                    width: `${((stepIndex + 1) / revealItems.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {Math.round(((stepIndex + 1) / revealItems.length) * 100)}%
              </span>
            </div>

            {/* ====================================================== */}
            {/* ITEM TIPO: MOEDAS                                      */}
            {/* ====================================================== */}
            {currentItem.type === "coins" && (
              <div className="flex flex-col items-center my-4 animate-in zoom-in duration-300">
                <div className="relative mb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-6xl sm:text-7xl shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-bounce">
                    🪙
                  </div>
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                    Economia
                  </div>
                </div>

                <span className="text-xs font-black uppercase tracking-widest text-amber-400 mb-1">
                  Moedas Conquistadas
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-1">
                  +{currentItem.amount} IF Coins
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Creditadas em sua carteira acadêmica para construções e minigames.
                </p>
              </div>
            )}

            {/* ====================================================== */}
            {/* ITEM TIPO: EXPERIÊNCIA (XP)                            */}
            {/* ====================================================== */}
            {currentItem.type === "xp" && (
              <div className="flex flex-col items-center my-4 animate-in zoom-in duration-300">
                <div className="relative mb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-6xl sm:text-7xl shadow-[0_0_50px_rgba(59,130,246,0.5)] animate-pulse">
                    ⚡
                  </div>
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-black uppercase">
                    Nível & Status
                  </div>
                </div>

                <span className="text-xs font-black uppercase tracking-widest text-blue-400 mb-1">
                  Experiência Acadêmica
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-1">
                  +{currentItem.amount} XP
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Impulsiona seu perfil rumo ao desbloqueio dos 8 minigames da arena!
                </p>
              </div>
            )}

            {/* ====================================================== */}
            {/* ITEM TIPO: FRAGMENTOS ESTELARES                       */}
            {/* ====================================================== */}
            {currentItem.type === "shards" && (
              <div className="flex flex-col items-center my-4 animate-in zoom-in duration-300">
                <div className="relative mb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-6xl sm:text-7xl shadow-[0_0_50px_rgba(168,85,247,0.5)] animate-bounce">
                    ⭐
                  </div>
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-black uppercase">
                    Álbum
                  </div>
                </div>

                <span className="text-xs font-black uppercase tracking-widest text-purple-300 mb-1">
                  Fragmentos Estelares
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-1">
                  +{currentItem.amount} Fragmentos
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Utilize para forjar cartas faltantes de coleções incompletas!
                </p>
              </div>
            )}

            {/* ====================================================== */}
            {/* ITEM TIPO: CARTA INDIVIDUAL REVELADA (MUITO IMPORTANTE)*/}
            {/* ====================================================== */}
            {currentItem.type === "card" && (
              <div className="w-full flex flex-col items-center my-2 animate-in zoom-in-90 duration-300">
                {/* Status da Carta (NOVA vs REPETIDA) */}
                <div className="mb-2">
                  {currentItem.isNew ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>✨ Carta Nova no Álbum!</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider">
                      <span>Repetida (Possui {currentItem.copiesAfter} cópias)</span>
                    </span>
                  )}
                </div>

                {/* Card Container com visual do Coin Master Album */}
                <div
                  className={`w-56 sm:w-64 rounded-3xl p-4 flex flex-col items-center justify-between shadow-2xl relative border-2 transition-all duration-300 ${
                    currentItem.card.isGolden
                      ? "bg-gradient-to-b from-amber-950 via-yellow-900 to-slate-950 border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.5)] ring-2 ring-yellow-400/50"
                      : "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700"
                  }`}
                  style={{
                    borderColor: currentItem.card.isGolden
                      ? "#FACC15"
                      : currentItem.card.primaryColor,
                  }}
                >
                  {/* Selo Dourado especial se for dourada */}
                  {currentItem.card.isGolden && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                      👑 CARTA DOURADA
                    </div>
                  )}

                  {/* Coleção & Raridade */}
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1">
                    <span className="truncate max-w-[130px]">{currentItem.card.collectionName}</span>
                    <span
                      className="px-2 py-0.5 rounded-full font-black uppercase text-[10px]"
                      style={{
                        backgroundColor: `${currentItem.card.primaryColor}25`,
                        color: currentItem.card.primaryColor,
                      }}
                    >
                      {currentItem.card.rarity}
                    </span>
                  </div>

                  {/* Ilustração e Emoji Grande */}
                  <div
                    className="w-24 h-24 sm:w-28 sm:h-28 my-3 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl border shadow-inner transition-transform hover:scale-105"
                    style={{
                      backgroundColor: `${currentItem.card.primaryColor}15`,
                      borderColor: `${currentItem.card.primaryColor}40`,
                    }}
                  >
                    {currentItem.card.emoji}
                  </div>

                  {/* Nome da Carta */}
                  <h4 className="text-base sm:text-lg font-black text-white text-center leading-tight">
                    {currentItem.card.name}
                  </h4>
                  <p className="text-[11px] text-cyan-400 font-semibold text-center mt-0.5">
                    {currentItem.card.subtitle}
                  </p>

                  {/* Curiosidade / Fato Histórico */}
                  <div className="w-full mt-2.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] text-slate-300 text-center leading-relaxed">
                    <span className="text-amber-400 font-bold block mb-0.5">
                      {currentItem.card.eraOrField}
                    </span>
                    {currentItem.card.triviaFact}
                  </div>
                </div>
              </div>
            )}

            {/* ====================================================== */}
            {/* ITEM TIPO: INSÍGNIA ESPECIAL                           */}
            {/* ====================================================== */}
            {currentItem.type === "badge" && (
              <div className="flex flex-col items-center my-4 animate-in zoom-in duration-300">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-6xl sm:text-7xl shadow-[0_0_50px_rgba(244,63,94,0.5)] mb-4 animate-bounce">
                  🎖️
                </div>

                <span className="text-xs font-black uppercase tracking-widest text-rose-400 mb-1">
                  Insígnia de Prestígio Desbloqueada
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  {currentItem.name}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Adicionada ao seu perfil para ostentar suas conquistas aos colegas do IFES!
                </p>
              </div>
            )}

            {/* Instrução de Toque para Continuar */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-amber-300/90 font-bold animate-pulse">
              <span>Toque na tela para o próximo</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* FASE 3: RESUMO GERAL DAS RECOMPENSAS (SUMMARY)               */}
        {/* ============================================================ */}
        {phase === "summary" && (
          <div className="w-full flex flex-col items-center py-2 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Baú Aberto com Sucesso!</span>
            </div>

            <h3 className="text-2xl font-black text-white mb-4">Suas Recompensas</h3>

            {/* Grid de Totais (Moedas, XP, Fragmentos) */}
            <div className="w-full grid grid-cols-3 gap-2 mb-4">
              {/* Moedas */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center text-center">
                <span className="text-xl mb-1">🪙</span>
                <span className="text-xs text-slate-400 font-bold">IF Coins</span>
                <span className="text-base sm:text-lg font-black text-amber-400">
                  +{dropResult.coins}
                </span>
              </div>

              {/* XP */}
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col items-center text-center">
                <span className="text-xl mb-1">⚡</span>
                <span className="text-xs text-slate-400 font-bold">XP</span>
                <span className="text-base sm:text-lg font-black text-blue-400">
                  +{dropResult.xp}
                </span>
              </div>

              {/* Fragmentos */}
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col items-center text-center">
                <span className="text-xl mb-1">⭐</span>
                <span className="text-xs text-slate-400 font-bold">Fragmentos</span>
                <span className="text-base sm:text-lg font-black text-purple-300">
                  +{dropResult.starShards}
                </span>
              </div>
            </div>

            {/* Insígnia Especial se houver */}
            {dropResult.badgeAwarded && (
              <div className="w-full p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🎖️</span>
                  <div className="text-left">
                    <span className="text-xs font-black text-white block">
                      {dropResult.badgeAwarded}
                    </span>
                    <span className="text-[10px] text-slate-400">Insígnia de Conquista</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase">
                  Desbloqueada
                </span>
              </div>
            )}

            {/* Grade com Todas as Cartas Adquiridas */}
            {dropResult.cardsAwarded && dropResult.cardsAwarded.length > 0 && (
              <div className="w-full text-left my-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cartas Reveladas ({dropResult.cardsAwarded.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Toque na carta para ver detalhes
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {dropResult.cardsAwarded.map((cDrop, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedCardDetail(cDrop.card)}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition hover:scale-[1.02] flex flex-col items-center text-center relative ${
                        cDrop.card.isGolden
                          ? "bg-amber-950/40 border-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Badge Nova ou Qtd */}
                      <div className="absolute top-1.5 right-1.5">
                        {cDrop.isNew ? (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase">
                            NOVA!
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[9px] font-bold">
                            x{cDrop.copiesAfter}
                          </span>
                        )}
                      </div>

                      <span className="text-2xl my-1">{cDrop.card.emoji}</span>
                      <span className="text-xs font-bold text-white truncate max-w-full">
                        {cDrop.card.name}
                      </span>
                      <span
                        className="text-[9px] font-bold uppercase mt-0.5"
                        style={{ color: cDrop.card.primaryColor }}
                      >
                        {cDrop.card.rarity} {cDrop.card.isGolden ? "• Dourada" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal de Detalhes da Carta selecionada na grade */}
            {selectedCardDetail && (
              <div
                onClick={() => setSelectedCardDetail(null)}
                className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-slate-700 p-5 rounded-3xl max-w-xs w-full text-center relative shadow-2xl"
                >
                  <button
                    onClick={() => setSelectedCardDetail(null)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="text-5xl mb-2">{selectedCardDetail.emoji}</div>
                  <h4 className="text-base font-black text-white">{selectedCardDetail.name}</h4>
                  <p className="text-xs text-cyan-400 mb-2">{selectedCardDetail.subtitle}</p>
                  <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-slate-300 leading-relaxed border border-slate-800 text-left">
                    <p className="font-bold text-amber-400 mb-1">{selectedCardDetail.eraOrField}</p>
                    <p>{selectedCardDetail.triviaFact}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCardDetail(null)}
                    className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}

            {/* Botão Final: Continuar */}
            <button
              onClick={handleCollectAndClose}
              className="mt-5 w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Coletar Recompensas & Continuar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
