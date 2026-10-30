import React, { useEffect, useState } from "react";
import { Hammer, Sparkles, Star, Wrench, HardHat } from "lucide-react";

interface AnimacaoFerramentasObraProps {
  custoMoedas?: number;
  aoFinalizar?: () => void;
}

export const AnimacaoFerramentasObra: React.FC<AnimacaoFerramentasObraProps> = ({
  custoMoedas,
  aoFinalizar,
}) => {
  const [etapa, setEtapa] = useState<number>(1);

  useEffect(() => {
    // Sequência de 4 etapas coreografadas (1.35s total)
    const t1 = setTimeout(() => setEtapa(2), 350);  // Primeiro golpe de martelo
    const t2 = setTimeout(() => setEtapa(3), 700);  // Segundo golpe e vigas
    const t3 = setTimeout(() => setEtapa(4), 1050); // Golpe de bigorna e estrelas
    const t4 = setTimeout(() => {
      if (aoFinalizar) aoFinalizar();
    }, 1350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [aoFinalizar]);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-center select-none">
      {/* 1. Andaime e Faixa Construtiva Luminosa ao Redor do Monumento */}
      <div className="absolute -inset-2 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-400/10 animate-pulse pointer-events-none" />

      {/* 2. Nuvem de Poeira Levantando na Base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-6 pointer-events-none flex justify-center items-center">
        <div
          className={`w-20 h-4 rounded-full bg-amber-200/40 blur-sm transition-all duration-300 transform ${
            etapa >= 2 ? "scale-140 opacity-70" : "scale-50 opacity-20"
          }`}
        />
      </div>

      {/* 3. Tábuas e Materiais Voando e Encaixando (Etapas 1 e 2) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute transition-all duration-300 transform ${
            etapa === 1
              ? "left-1 top-2 rotate-[-30deg] scale-90 opacity-90"
              : "left-10 top-10 rotate-0 scale-100 opacity-0"
          }`}
        >
          <div className="w-8 h-2.5 bg-amber-700 rounded-xs shadow-sm border border-amber-900" />
        </div>

        <div
          className={`absolute transition-all duration-300 transform ${
            etapa <= 2
              ? "right-1 top-4 rotate-[20deg] scale-90 opacity-90"
              : "right-10 top-12 rotate-0 scale-100 opacity-0"
          }`}
        >
          <div className="w-9 h-2.5 bg-slate-600 rounded-xs shadow-sm border border-slate-800" />
        </div>
      </div>

      {/* 4. Serrote Cortando Madeira (Etapa 1) */}
      {etapa === 1 && (
        <div className="absolute -left-2 top-6 z-50 animate-bounce">
          <div className="flex items-center gap-1 p-1.5 rounded-full bg-slate-900/95 border border-amber-400 text-amber-300 shadow-xl transform -rotate-12">
            <Wrench className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[9px] text-amber-200 animate-ping">🪚</span>
          </div>
        </div>
      )}

      {/* 5. Operário com Capacete Amarelo */}
      <div className="absolute -right-2 bottom-4 z-50">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 border border-white shadow-lg text-slate-950 animate-bounce">
          <HardHat className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 6. Ferramenta Principal: Martelo Dourado com Rotação, Impacto e Recuo */}
      <div className="relative z-50 flex items-center justify-center">
        <div
          className={`transition-all duration-150 transform ${
            etapa === 1
              ? "rotate-[-45deg] scale-110 -translate-y-2"
              : etapa === 2
              ? "rotate-[20deg] scale-130 translate-y-1"
              : etapa === 3
              ? "rotate-[-25deg] scale-115 -translate-y-1"
              : "rotate-[0deg] scale-135 translate-y-0"
          }`}
        >
          <div className="p-2.5 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 shadow-2xl border border-white ring-2 ring-amber-400/60">
            <Hammer className="w-7 h-7 filter drop-shadow animate-pulse" />
          </div>
        </div>

        {/* Faíscas nos Impactos */}
        {etapa >= 2 && (
          <>
            <div className="absolute -top-2 -right-2 text-amber-300 animate-ping">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-1 -left-1 text-yellow-400 animate-bounce">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </>
        )}
      </div>

      {/* 7. Tag Compacta de Feedback de Obra */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
        <div className="px-2 py-0.5 rounded-full bg-slate-950/95 text-amber-300 text-[9px] font-black tracking-tight border border-amber-400 shadow-xl flex items-center gap-1 animate-bounce whitespace-nowrap">
          <span>🔨 Obras</span>
          {custoMoedas && custoMoedas > 0 && (
            <span className="text-amber-400 font-mono font-bold">-{custoMoedas}🪙</span>
          )}
        </div>
      </div>
    </div>
  );
};
