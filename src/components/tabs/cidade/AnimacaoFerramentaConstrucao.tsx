import React, { useEffect, useState } from "react";
import { Hammer, Wrench, Sparkles, Star } from "lucide-react";

interface AnimacaoFerramentaConstrucaoProps {
  chaveConstrucao: string;
  custoMoedas?: number;
  aoFinalizar?: () => void;
}

export const AnimacaoFerramentaConstrucao: React.FC<AnimacaoFerramentaConstrucaoProps> = ({
  chaveConstrucao,
  custoMoedas,
  aoFinalizar,
}) => {
  const [faseGolpe, setFaseGolpe] = useState<number>(1);

  useEffect(() => {
    // 3 golpes rítmicos de ferramenta (0.0s, 0.35s, 0.7s) e encerramento em 1.1s
    const t1 = setTimeout(() => setFaseGolpe(2), 350);
    const t2 = setTimeout(() => setFaseGolpe(3), 700);
    const t3 = setTimeout(() => {
      if (aoFinalizar) aoFinalizar();
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [aoFinalizar]);

  return (
    <div className="absolute inset-0 z-40 pointer-events-none flex flex-col items-center justify-center">
      {/* 1. Andaime e Faixa de Obras em volta do monumento */}
      <div className="absolute -inset-2 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-400/15 animate-pulse" />

      {/* 2. Ferramenta Principal: Martelo Dourado com Rotação e Golpe */}
      <div className="relative z-50 flex items-center justify-center">
        <div
          className={`transition-all duration-150 transform ${
            faseGolpe === 1
              ? "rotate-[-40deg] scale-110 translate-y-[-8px]"
              : faseGolpe === 2
              ? "rotate-[30deg] scale-125 translate-y-[4px]"
              : "rotate-[0deg] scale-140 translate-y-0"
          }`}
        >
          <div className="p-3 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-2xl border-2 border-white ring-4 ring-amber-400/50">
            <Hammer className="w-8 h-8 filter drop-shadow animate-bounce" />
          </div>
        </div>

        {/* Faíscas / Poeira de Obras a cada golpe */}
        <div className="absolute -top-3 -right-3 text-amber-300 animate-ping">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute -bottom-2 -left-2 text-yellow-400 animate-bounce">
          <Star className="w-5 h-5 fill-amber-400" />
        </div>
      </div>

      {/* 3. Balão de Feedback: "Construindo..." e Moedas Gastas */}
      <div className="relative z-50 mt-2 flex flex-col items-center">
        <div className="px-2.5 py-1 rounded-full bg-slate-950/90 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400 shadow-xl flex items-center gap-1.5 animate-bounce">
          <Wrench className="w-3 h-3 animate-spin" />
          <span>Evoluindo Obra!</span>
        </div>

        {custoMoedas && custoMoedas > 0 && (
          <span className="text-[11px] font-black font-mono text-amber-300 drop-shadow-md animate-out fade-out slide-out-to-top duration-1000 mt-0.5">
            - {custoMoedas} 🪙
          </span>
        )}
      </div>
    </div>
  );
};
