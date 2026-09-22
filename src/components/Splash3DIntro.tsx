import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowRight, GraduationCap, Zap } from "lucide-react";

interface Splash3DIntroProps {
  onComplete: () => void;
  autoCloseDelay?: number; // default 1800ms (1.5 - 2s requirement)
}

export const Splash3DIntro: React.FC<Splash3DIntroProps> = ({
  onComplete,
  autoCloseDelay = 1800,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation from 0% to 100% over the 1.8s duration
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / (autoCloseDelay - 250)) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
      }
    }, 25);

    // Auto trigger exit transition after autoCloseDelay (1.8s)
    const autoCloseTimer = setTimeout(() => {
      triggerExit();
    }, autoCloseDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(autoCloseTimer);
    };
  }, [autoCloseDelay]);

  const triggerExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--app-bg)] text-[var(--app-text)] overflow-hidden select-none cursor-default"
          id="splash-3d-intro"
        >
          {/* Ambient Deep Space Background Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Pulsing Central Core Glow */}
            <motion.div
              animate={{
                scale: [0.9, 1.25, 0.95, 1.15, 1],
                opacity: [0.15, 0.28, 0.2, 0.25, 0.2],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-gradient-to-r from-[var(--app-primary)]/25 via-[var(--app-primary)]/15 to-[var(--app-primary)]/10 rounded-full blur-3xl"
            />

            {/* Subtle Neural Matrix Dots */}
            <div 
              className="absolute inset-0 opacity-[0.06]" 
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, var(--app-primary) 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} 
            />
          </div>

          {/* Quick Skip button top right */}
          <div className="absolute top-5 right-5 z-50">
            <button
              onClick={triggerExit}
              id="splash-skip-btn"
              className="px-3.5 py-1.5 rounded-full bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] active:scale-95 border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>Entrar</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            </button>
          </div>

          {/* Central Stage: Duolingo-style bouncy pulse logo */}
          <div className="relative flex flex-col items-center justify-center z-10 px-4 max-w-sm sm:max-w-md w-full text-center">
            
            {/* Duolingo Fluid Bouncing Scale Logo Container */}
            <motion.div
              initial={{ scale: 0.65, opacity: 0 }}
              animate={{
                scale: [0.65, 1.16, 0.94, 1.05, 1],
                opacity: [0, 1, 1, 1, 1],
              }}
              transition={{
                duration: 1.25,
                times: [0, 0.45, 0.7, 0.88, 1],
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="relative p-6 sm:p-7 rounded-[2.5rem] bg-[var(--app-card)] border border-[var(--app-border)] shadow-2xl cursor-pointer group"
              onClick={triggerExit}
            >
              {/* Shimmer light sweep across logo plate */}
              <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                <div className="w-[150%] h-[150%] bg-gradient-to-r from-transparent via-white/15 to-transparent -rotate-45 animate-sheen-sweep" />
              </div>

              {/* Logo Image with gentle floating pulse */}
              <motion.div
                animate={{
                  y: [-3, 3, -3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "easeInOut",
                }}
                className="flex items-center justify-center"
              >
                <img
                  src="/logo.png"
                  alt="Brain Studio"
                  className="w-[220px] sm:w-[280px] h-auto object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)]"
                />
              </motion.div>

              {/* Tag indicator */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>IFES Cefor</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Ambiente Ativo</span>
                </span>
              </div>
            </motion.div>

            {/* Slogan Entrance */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
              className="mt-6 space-y-1.5"
            >
              <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-black tracking-tight text-white">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Conecte.
                </span>
                <span className="text-neutral-500">•</span>
                <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Estude.
                </span>
                <span className="text-neutral-500">•</span>
                <span className="bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">
                  Conquiste.
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Ecossistema Inteligente de Aprendizagem & Percurso Socrático
              </p>
            </motion.div>

            {/* Synaptic Loading Progress Bar */}
            <div className="mt-5 w-48 sm:w-56 flex flex-col items-center gap-2">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10 backdrop-blur-sm">
                <div
                  className="h-full bg-[var(--app-primary)] rounded-full transition-all duration-100 shadow-[0_0_8px_var(--app-primary)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--app-text-muted)] font-mono">
                <Sparkles className="w-3 h-3 text-[var(--app-primary)] animate-spin" style={{ animationDuration: '3s' }} />
                <span>Iniciando ambiente {progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
