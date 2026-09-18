import React, { useState } from "react";
import { UserPet, PuppetRigConfig, PuppetRigPin } from "../types";
import { DEFAULT_PUPPET_CONFIG, getRiggingCssVariables, MASCOT_TEMPLATES } from "../utils/puppetRigging";
import { getPetStageInfo } from "../utils/petEvolution";
import confetti from "canvas-confetti";

interface PuppetPetViewProps {
  pet?: UserPet;
  config?: PuppetRigConfig;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showRigPins?: boolean;
  activePin?: string | null;
  onPinSelect?: (pinKey: keyof PuppetRigConfig) => void;
  onCanvasClick?: (coords: { x: number; y: number }) => void;
  interactive?: boolean;
  onPetClick?: () => void;
  accessory?: "glasses" | "cap" | "crown" | "aura" | "badge" | "none";
  reactionText?: string | null;
  className?: string;
}

export const PuppetPetView: React.FC<PuppetPetViewProps> = ({
  pet,
  config = pet?.customRigConfig || DEFAULT_PUPPET_CONFIG,
  imageUrl = pet?.customImageUrl,
  size = "md",
  showRigPins = false,
  activePin = null,
  onPinSelect,
  onCanvasClick,
  interactive = true,
  onPetClick,
  accessory = pet?.customAccessory || "none",
  reactionText = null,
  className = "",
}) => {
  const [isBouncing, setIsBouncing] = useState(false);
  const [floatingHeart, setFloatingHeart] = useState<{ x: number; y: number; id: number } | null>(null);

  const sizeClasses = {
    sm: "w-16 h-16 text-3xl",
    md: "w-28 h-28 text-5xl",
    lg: "w-40 h-40 text-7xl",
    xl: "w-56 h-56 text-8xl",
    hero: "w-72 h-72 sm:w-80 sm:h-80 text-9xl",
  };

  const cssVariables = getRiggingCssVariables(config);
  const stageInfo = getPetStageInfo(pet);

  // If no custom image, fallback to template or emoji
  const fallbackTemplate = MASCOT_TEMPLATES.find((t) => t.id === pet?.type);
  const displayImage = imageUrl || null;

  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (showRigPins && onCanvasClick) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      onCanvasClick({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      return;
    }

    if (!interactive) return;

    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 850);

    const heartId = Date.now();
    setFloatingHeart({ x: 50, y: 30, id: heartId });
    setTimeout(() => setFloatingHeart(null), 1200);

    try {
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { y: 0.6 },
        ticks: 60,
      });
    } catch {}

    if (onPetClick) {
      onPetClick();
    }
  };

  const pins: { key: keyof PuppetRigConfig; label: string; x: number; y: number; color: string }[] = [
    { key: "bodyRoot", label: "Base / Raiz", x: config.bodyRoot.x, y: config.bodyRoot.y, color: "bg-rose-500" },
    { key: "headPivot", label: "Pivô Cabeça", x: config.headPivot.x, y: config.headPivot.y, color: "bg-blue-500" },
    { key: "leftEarPivot", label: "Orelha/Asa Esq.", x: config.leftEarPivot.x, y: config.leftEarPivot.y, color: "bg-amber-500" },
    { key: "rightEarPivot", label: "Orelha/Asa Dir.", x: config.rightEarPivot.x, y: config.rightEarPivot.y, color: "bg-emerald-500" },
    { key: "leftPawPivot", label: "Pata/Braço Esq.", x: config.leftPawPivot.x, y: config.leftPawPivot.y, color: "bg-purple-500" },
    { key: "rightPawPivot", label: "Pata/Braço Dir.", x: config.rightPawPivot.x, y: config.rightPawPivot.y, color: "bg-cyan-500" },
  ];

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={cssVariables}
    >
      {/* Speech / Reaction Bubble */}
      {reactionText && (
        <div className="absolute -top-12 z-20 px-3.5 py-1.5 rounded-2xl bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] text-xs font-bold shadow-lg flex items-center gap-1.5 animate-bounce">
          <span>💬</span>
          <span>{reactionText}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--app-card)] border-r border-b border-[var(--app-border)] rotate-45" />
        </div>
      )}

      {/* Floating Love Heart Particle */}
      {floatingHeart && (
        <div
          className="absolute z-30 text-2xl pointer-events-none transition-all duration-1000 ease-out"
          style={{
            left: `${floatingHeart.x}%`,
            top: `${floatingHeart.y}%`,
            transform: "translate(-50%, -100%) scale(1.4)",
            opacity: 0,
            animation: "pulseGlow 0.8s ease-out forwards",
          }}
        >
          💖
        </div>
      )}

      {/* Puppet Container Frame */}
      <div
        onClick={handleInteraction}
        className={`relative ${sizeClasses[size]} rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-200 group ${
          isBouncing ? "puppet-bounce-interactive" : ""
        }`}
        title={showRigPins ? "Clique para posicionar o pino de rigging selecionado" : "Clique para interagir com o Pet!"}
      >
        {/* Evolution Aura Glow (if high level or aura accessory) */}
        {(pet?.level && pet.level >= 3) || accessory === "aura" ? (
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/20 via-purple-500/20 to-blue-500/20 blur-xl scale-125 pointer-events-none animate-pulse" />
        ) : null}

        {/* --- PUPPET MULTI-LAYER RIG SYSTEM --- */}
        {displayImage ? (
          <div className="w-full h-full relative flex items-center justify-center">
            {/* 1. Body Base Layer */}
            <div className="w-full h-full relative puppet-body-anim flex items-center justify-center">
              <img
                src={displayImage}
                alt={pet?.name || "Mascote"}
                className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
                draggable={false}
              />

              {/* 2. Head Tilt Sway Node Layer */}
              <div
                className="absolute inset-0 pointer-events-none puppet-head-anim"
                style={{ transformOrigin: `var(--puppet-head-pivot)` }}
              >
                {/* Accessory Overlay on Head */}
                {accessory === "cap" && (
                  <div
                    className="absolute text-2xl sm:text-3xl z-10 filter drop-shadow"
                    style={{
                      left: `calc(${config.headPivot.x}% - 14px)`,
                      top: `calc(${config.headPivot.y}% - 40px)`,
                    }}
                  >
                    🎓
                  </div>
                )}
                {accessory === "glasses" && (
                  <div
                    className="absolute text-xl sm:text-2xl z-10 filter drop-shadow"
                    style={{
                      left: `calc(${config.headPivot.x}% - 12px)`,
                      top: `calc(${config.headPivot.y}% - 10px)`,
                    }}
                  >
                    👓
                  </div>
                )}
                {accessory === "crown" && (
                  <div
                    className="absolute text-2xl sm:text-3xl z-10 filter drop-shadow animate-pulse"
                    style={{
                      left: `calc(${config.headPivot.x}% - 14px)`,
                      top: `calc(${config.headPivot.y}% - 42px)`,
                    }}
                  >
                    👑
                  </div>
                )}
                {accessory === "badge" && (
                  <div
                    className="absolute text-lg sm:text-xl z-10 filter drop-shadow"
                    style={{
                      left: `calc(${config.headPivot.x}% + 16px)`,
                      top: `calc(${config.headPivot.y}% + 10px)`,
                    }}
                  >
                    ⚡
                  </div>
                )}
              </div>

              {/* 3. Left Ear/Wing Micro-Twitch Node */}
              <div
                className="absolute inset-0 pointer-events-none puppet-left-ear-anim"
                style={{ transformOrigin: `var(--puppet-left-ear)` }}
              />

              {/* 4. Right Ear/Wing Micro-Twitch Node */}
              <div
                className="absolute inset-0 pointer-events-none puppet-right-ear-anim"
                style={{ transformOrigin: `var(--puppet-right-ear)` }}
              />

              {/* 5. Left Paw Sway Node */}
              <div
                className="absolute inset-0 pointer-events-none puppet-left-paw-anim"
                style={{ transformOrigin: `var(--puppet-left-paw)` }}
              />

              {/* 6. Right Paw Sway Node */}
              <div
                className="absolute inset-0 pointer-events-none puppet-right-paw-anim"
                style={{ transformOrigin: `var(--puppet-right-paw)` }}
              />
            </div>
          </div>
        ) : (
          /* Standard Built-in Emoji Pet with Puppet Anatomy */
          <div className="relative w-full h-full flex items-center justify-center puppet-body-anim">
            <span className="inline-block select-none transform transition-transform duration-200">
              {stageInfo.avatarEmoji}
            </span>
            <span className="absolute top-2 right-2 text-xl select-none filter drop-shadow">
              {stageInfo.accessoryBadge}
            </span>
          </div>
        )}

        {/* Interactive Rigging Pin Markers (Visible in Mascote Lab Rigging Mode) */}
        {showRigPins && (
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {pins.map((pin) => {
              const isSelected = activePin === pin.key;
              return (
                <div
                  key={pin.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onPinSelect) onPinSelect(pin.key);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                    isSelected ? "scale-125 z-30" : "scale-100 opacity-90 hover:opacity-100"
                  }`}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  title={`${pin.label}: (${pin.x}%, ${pin.y}%)`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-white text-white flex items-center justify-center text-[9px] font-black shadow-lg ${
                      pin.color
                    } ${isSelected ? "ring-4 ring-white shadow-xl animate-pulse" : ""}`}
                  >
                    ✦
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[8px] font-mono whitespace-nowrap pointer-events-none">
                    {pin.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stage Badge & Level Pill below avatar if specified */}
      {pet && !showRigPins && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20 text-[10px] font-extrabold font-mono flex items-center gap-1 shadow-2xs">
            <span>Nv. {pet.level}</span>
            <span>•</span>
            <span>{pet.customSpeciesName || stageInfo.stageName}</span>
          </span>
        </div>
      )}
    </div>
  );
};
