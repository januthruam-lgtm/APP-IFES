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
      {/* 1. Andaime e Faixa Construtiva Luminosa ao Redor da Obra */}
      <div className="absolute -inset-3 rounded-3xl border-2 border-dashed border-amber-400 bg-amber-400/10 animate-pulse pointer-events-none" />

      {/* 2. Nuvem de Poeira e Poeira Levantando na Base */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-10 pointer-events-none flex justify-center items-center">
        <div
          className={`w-24 h-6 rounded-full bg-amber-200/40 blur-md transition-all duration-300 transform ${
            etapa >= 2 ? "scale-150 opacity-70" : "scale-50 opacity-20"
          }`}
        />
      </div>

      {/* 3. Tábuas e Materiais Voando e Encaixando (Etapa 1 & 2) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Tábua voando da esquerda */}
        <div
          className={`absolute transition-all duration-300 transform ${
            etapa === 1
              ? "left-2 top-4 rotate-[-35deg] scale-90 opacity-90"
              : "left-12 top-14 rotate-0 scale-100 opacity-0"
          }`}
        >
          <div className="w-10 h-3 bg-amber-700 rounded-xs shadow-md border border-amber-900" />
        </div>

        {/* Viga voando da direita */}
        <div
          className={`absolute transition-all duration-300 transform ${
            etapa <= 2
              ? "right-2 top-6 rotate-[25deg] scale-90 opacity-90"
              : "right-14 top-16 rotate-0 scale-100 opacity-0"
          }`}
        >
          <div className="w-12 h-3.5 bg-slate-600 rounded-xs shadow-md border border-slate-800" />
        </div>
      </div>

      {/* 4. Serrote Cortando Madeira (Ativo no Início - Etapa 1) */}
      {etapa === 1 && (
        <div className="absolute -left-3 top-8 z-50 animate-bounce">
          <div className="flex items-center gap-1 p-2 rounded-full bg-slate-900/90 border border-amber-400 text-amber-300 shadow-xl transform -rotate-12">
            <Wrench className="w-5 h-5 animate-spin" />
            {/* Partículas de serragem voando */}
            <span className="text-[10px] text-amber-200 animate-ping">🪚</span>
          </div>
        </div>
      )}

      {/* 5. Operário com Capacete Amarelo (Trabalhador Ativo) */}
      <div className="absolute -right-4 bottom-8 z-50 transform hover:scale-110 transition-transform">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 border-2 border-white shadow-xl text-slate-950 animate-bounce">
          <HardHat className="w-5 h-5" />
        </div>
      </div>

      {/* 6. Ferramenta Principal: Martelo Dourado com Rotação, Impacto e Recuo */}
      <div className="relative z-50 flex items-center justify-center">
        <div
          className={`transition-all duration-150 transform ${
            etapa === 1
              ? "rotate-[-45deg] scale-110 -translate-y-3"
              : etapa === 2
              ? "rotate-[20deg] scale-135 translate-y-2"
              : etapa === 3
              ? "rotate-[-30deg] scale-120 -translate-y-2"
              : "rotate-[0deg] scale-150 translate-y-0"
          }`}
        >
          <div className="p-3 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 shadow-2xl border-2 border-white ring-4 ring-amber-400/60">
            <Hammer className="w-9 h-9 filter drop-shadow animate-pulse" />
          </div>
        </div>

        {/* Faíscas Brilhantes nos Impactos */}
        {etapa >= 2 && (
          <>
            <div className="absolute -top-3 -right-3 text-amber-300 animate-ping">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="absolute -bottom-2 -left-2 text-yellow-400 animate-bounce">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
          </>
        )}
      </div>

      {/* 7. Balão de Feedback: Dedução de Moedas e Construção */}
      <div className="relative z-50 mt-2 flex flex-col items-center">
        <div className="px-3 py-1 rounded-full bg-slate-950/95 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400 shadow-2xl flex items-center gap-1.5 animate-bounce">
          <span>🔨 Obras em Andamento!</span>
        </div>

        {custoMoedas && custoMoedas > 0 && (
          <span className="text-xs font-black font-mono text-amber-300 drop-shadow-lg mt-0.5 animate-pulse">
            - {custoMoedas} IF Coins
          </span>
        )}
      </div>
    </div>
  );
};
