import React, { useRef } from "react";
import { CidadeTema } from "../types";
import { MonumentoVisual } from "./MonumentoVisual";
import { BotaoConstruirMonumento } from "./BotaoConstruirMonumento";
import { AnimacaoFerramentasObra } from "./AnimacaoFerramentasObra";
import { obterCustoEstagio } from "../data/cidadesData";

interface CenarioMundoCidadeProps {
  cidade: CidadeTema;
  construcoesNiveis: Record<string, number>;
  construcaoEmEvolucao: string | null;
  saldoMoedas: number;
  onConstruir: (monumentoId: string) => void;
}

export const CenarioMundoCidade: React.FC<CenarioMundoCidadeProps> = ({
  cidade,
  construcoesNiveis,
  construcaoEmEvolucao,
  saldoMoedas,
  onConstruir,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-3 border-amber-500/40 bg-slate-950 select-none group">
      {/* Viewport Panorâmico do Cenário da Cidade com Proporção Otimizada */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[480px] sm:min-h-[580px] md:min-h-[640px] max-h-[760px] overflow-hidden"
      >
        {/* 1. Imagem Panorâmica de Fundo de Alta Fidelidade */}
        <img
          src={cidade.cenarioImg}
          alt={cidade.cenarioAlt}
          className="w-full h-full object-cover object-center transform scale-101 group-hover:scale-102 transition-transform duration-1000 ease-out"
          draggable={false}
        />

        {/* 2. Efeitos Atmosféricos, Iluminação Solar e Profundidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/35 pointer-events-none" />
        <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay pointer-events-none" />

        {/* Nuvens Animadas Sutis no Céu Superior */}
        <div className="absolute top-3 left-0 right-0 h-16 pointer-events-none opacity-40 overflow-hidden">
          <div className="w-[200%] h-full flex items-center justify-around animate-pulse">
            <span className="text-3xl filter blur-xs">☁️</span>
            <span className="text-2xl filter blur-xs">☁️</span>
            <span className="text-4xl filter blur-xs">☁️</span>
          </div>
        </div>

        {/* 3. Renderização dos Monumentos Integrados Diretamente na Paisagem */}
        {/* Prioridade total nas construções: tamanho ampliado, sem cards, com botões compactos na base */}
        {cidade.monumentos.map((monumento) => {
          const nivelAtual = Math.max(1, construcoesNiveis[monumento.id] || 1);
          const proximoEstagio = nivelAtual + 1;
          const custoProximo = obterCustoEstagio(cidade.id, proximoEstagio);
          const isEvoluindo = construcaoEmEvolucao === monumento.id;

          return (
            <div
              key={monumento.id}
              style={{
                left: `${monumento.posicao.x}%`,
                top: `${monumento.posicao.y}%`,
                transform: `translate(-50%, -85%) scale(${monumento.escala})`,
                zIndex: isEvoluindo ? 50 : Math.round(monumento.posicao.y),
              }}
              className="absolute flex flex-col items-center transition-transform duration-200 pointer-events-auto"
            >
              {/* O Monumento em Si: Visão Completa e Desobstruída */}
              <div className="relative">
                <MonumentoVisual
                  monumento={monumento}
                  nivel={nivelAtual}
                  emConstrucao={isEvoluindo}
                />

                {/* Animação de Ferramentas Ativa Durante a Obra */}
                {isEvoluindo && (
                  <AnimacaoFerramentasObra custoMoedas={custoProximo} />
                )}
              </div>

              {/* Botão de Construção Compacto Posicionado Logo Abaixo da Base do Monumento */}
              <BotaoConstruirMonumento
                monumento={monumento}
                nivelAtual={nivelAtual}
                custoProximo={custoProximo}
                saldoMoedas={saldoMoedas}
                isEvoluindo={isEvoluindo}
                onConstruir={() => onConstruir(monumento.id)}
              />
            </div>
          );
        })}

        {/* Dica de Toque Discreta no Rodapé da Tela */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-xs border border-slate-700/50 text-[9px] sm:text-[10px] font-bold text-slate-300 shadow-md">
            <span>Toque no botão abaixo de cada monumento para evoluir sua cidade</span>
          </div>
        </div>
      </div>
    </div>
  );
};
