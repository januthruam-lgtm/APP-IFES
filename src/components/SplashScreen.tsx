// src/components/SplashScreen.tsx
//
// Abertura Oficial do Brain Studio:
// Elementos orbitais em movimento contínuo ao redor da logo com neon glow,
// exibindo estritamente as palavras originais da logo: "BRAIN STUDIO" e "Conecte. Estude. Conquiste."

import React, { useEffect, useState, useCallback, useRef } from "react";

export interface SplashScreenProps {
  onFinalizar?: () => void;
  onComplete?: () => void;
  videoSrc?: string;
}

export function SplashScreen({ onFinalizar, onComplete }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const exitCalledRef = useRef(false);

  const handleFinish = useCallback(() => {
    if (exitCalledRef.current) return;
    exitCalledRef.current = true;
    setIsExiting(true);

    try {
      sessionStorage.setItem("brain_studio_splash_shown", "true");
    } catch {}

    setTimeout(() => {
      if (onFinalizar) {
        onFinalizar();
      } else if (onComplete) {
        onComplete();
      }
    }, 450);
  }, [onFinalizar, onComplete]);

  // Duração de 2.8 segundos antes de entrar suavemente no app
  useEffect(() => {
    const timer = setTimeout(handleFinish, 2800);
    return () => clearTimeout(timer);
  }, [handleFinish]);

  return (
    <div
      id="brain-studio-splash-screen"
      onClick={handleFinish}
      className={`fixed inset-0 z-[999999] w-screen h-screen flex items-center justify-center overflow-hidden select-none transition-opacity duration-500 ease-out cursor-pointer ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#030712",
      }}
    >
      {/* Fundo Cósmico com Névoa Radial Esmeralda e Ciano */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,rgba(6,78,59,0.08)_35%,rgba(3,7,18,0.95)_75%)] pointer-events-none" />

      {/* ELEMENTOS ORBITAIS QUE SE MOVEM (Anéis concêntricos com partículas em órbita) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Órbita Externa (Grande) */}
        <div className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] rounded-full border border-emerald-500/20 animate-[spin_12s_linear_infinite]">
          {/* Partícula / Ponto Orbitante 1 */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,1)]" />
          {/* Partícula / Ponto Orbitante 2 */}
          <div className="absolute -bottom-1.5 left-1/3 w-3 h-3 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,0.9)]" />
        </div>

        {/* Órbita Intermediária */}
        <div className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full border border-emerald-500/30 border-dashed animate-[spin_8s_linear_infinite_reverse]">
          {/* Partícula / Ponto Orbitante 3 */}
          <div className="absolute top-1/4 -right-1.5 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,1)]" />
        </div>

        {/* Órbita Interna com Brilho Pulsante */}
        <div className="absolute w-[230px] h-[230px] sm:w-[290px] sm:h-[290px] rounded-full border border-emerald-400/25 shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-pulse" />
      </div>

      {/* CENTRO: CARD OFICIAL DA LOGO BRAIN STUDIO COM PALAVRAS ORIGINAIS */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative p-5 sm:p-7 rounded-3xl bg-neutral-900/80 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] backdrop-blur-md flex flex-col items-center justify-center max-w-sm sm:max-w-md text-center">
          {/* Imagem Oficial da Logo (com cérebro neon e grafias originais) */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
            <img
              src="/logo.png"
              alt="Brain Studio"
              className="h-24 sm:h-28 w-auto object-contain relative z-10 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]"
              onError={(e) => {
                // Fallback caso a imagem local falhe
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          </div>

          {/* PALAVRAS ORIGINAIS DA LOGO */}
          <div className="mt-3.5 space-y-1 text-center">
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
              BRAIN STUDIO
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-widest text-emerald-300/90 font-mono">
              Conecte. Estude. Conquiste.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
