import React from "react";
import {
  BookOpen,
  FlaskConical,
  Telescope,
  Bed,
  Landmark,
  Users,
  Star,
  Sparkles,
  Hammer,
} from "lucide-react";
import {
  obterImagemCidade,
  obterFiltroAtmosfericoCidade,
} from "../../../features/cidade/utils/cidadeImagens";
import { calcularCustoEstagio } from "../../../config/cidade.config";
import { AparenciaEdificacao, obterInfoAparencia } from "./AparenciaEdificacao";
import { AnimacaoFerramentaConstrucao } from "./AnimacaoFerramentaConstrucao";

interface CidadeCenarioIlustradoProps {
  cidadeId: number;
  cidadeNome: string;
  construcoesNiveis: Record<string, number>;
  construcoesChaves: readonly string[];
  construcaoSelecionada: string | null;
  onSelecionarConstrucao: (chave: string) => void;
  onEvoluir?: (chave: string) => void;
  construcaoEmEvolucao: string | null;
  saldoMoedas: number;
}

const POSICOES_CONSTRUCOES: Record<
  string,
  {
    x: number;
    y: number;
    nome: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  biblioteca: {
    x: 22,
    y: 54,
    nome: "Biblioteca Central",
    icon: BookOpen,
  },
  laboratorio: {
    x: 68,
    y: 36,
    nome: "Laboratório",
    icon: FlaskConical,
  },
  observatorio: {
    x: 78,
    y: 64,
    nome: "Observatório",
    icon: Telescope,
  },
  dormitorio: {
    x: 16,
    y: 76,
    nome: "Dormitório",
    icon: Bed,
  },
  auditorio: {
    x: 48,
    y: 30,
    nome: "Auditório",
    icon: Landmark,
  },
  praca: {
    x: 48,
    y: 72,
    nome: "Ágora & Praça",
    icon: Users,
  },
};

export const CidadeCenarioIlustrado: React.FC<CidadeCenarioIlustradoProps> = ({
  cidadeId,
  cidadeNome,
  construcoesNiveis,
  construcoesChaves,
  construcaoSelecionada,
  onSelecionarConstrucao,
  onEvoluir,
  construcaoEmEvolucao,
  saldoMoedas,
}) => {
  const imagemCenario = obterImagemCidade(cidadeId);
  const filtroAtmosferico = obterFiltroAtmosfericoCidade(cidadeId);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-3 border-amber-500/30 bg-slate-950 select-none group">
      {/* 1. Imagem de Fundo Panorâmica da Vila */}
      <div className="relative w-full aspect-[16/11] sm:aspect-[16/8.5] max-h-[540px] min-h-[380px] overflow-hidden">
        <img
          src={imagemCenario}
          alt={`Cenário Ilustrado de ${cidadeNome}`}
          className={`w-full h-full object-cover object-center transform scale-102 group-hover:scale-105 transition-all duration-1000 ease-out ${filtroAtmosferico}`}
          draggable={false}
        />

        {/* Efeitos de Iluminação / Vinheta Atmosférica */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 pointer-events-none" />
        <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay pointer-events-none" />

        {/* Topo da Vila: Nome da Cidade & Saldo de Moedas no Estilo HUD de Jogo */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-3 pointer-events-auto z-30">
          {/* Badge da Cidade */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 shadow-xl">
            <span className="text-xs font-black uppercase tracking-wider">
              Vila {cidadeId} • {cidadeNome}
            </span>
          </div>

          {/* Saldo de Moedas do Estudante */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-400 text-amber-300 shadow-xl animate-in fade-in duration-300">
            <span className="text-base">🪙</span>
            <span className="text-sm font-black font-mono tracking-tight">{saldoMoedas}</span>
          </div>
        </div>

        {/* 2. Marcadores Interativos das Edificações sobre o Cenário */}
        {construcoesChaves.map((chave) => {
          const pos = POSICOES_CONSTRUCOES[chave];
          if (!pos) return null;

          const nivel = Math.max(1, construcoesNiveis[chave] || 1);
          const proximoEstagio = nivel + 1;
          const custoProximo = calcularCustoEstagio(cidadeId, proximoEstagio);
          const podeConstruir = saldoMoedas >= custoProximo;
          const isSelecionado = construcaoSelecionada === chave;
          const isEvoluindo = construcaoEmEvolucao === chave;
          const infoAparencia = obterInfoAparencia(chave, nivel);

          return (
            <div
              key={chave}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
              onClick={() => onSelecionarConstrucao(chave)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-20 ${
                isEvoluindo ? "scale-125 z-40" : "hover:scale-105"
              }`}
            >
              {/* Botão de Construir Logo Acima da Construção */}
              <div className="absolute -top-11 sm:-top-13 left-1/2 -translate-x-1/2 z-40 pointer-events-auto flex flex-col items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEvoluir && !isEvoluindo) {
                      onEvoluir(chave);
                    }
                  }}
                  disabled={isEvoluindo}
                  className={`group/btn relative flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl font-black text-[11px] sm:text-xs transition-all duration-200 cursor-pointer shadow-2xl active:scale-95 ${
                    isEvoluindo
                      ? "bg-amber-400 text-slate-950 border-2 border-white ring-4 ring-amber-400/50 animate-bounce cursor-wait"
                      : podeConstruir
                      ? "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white border-2 border-emerald-200 ring-2 ring-emerald-500/40 hover:scale-108 hover:shadow-[0_0_20px_rgba(16,185,129,0.7)]"
                      : "bg-slate-900/95 hover:bg-slate-800 text-slate-300 border-2 border-slate-700 opacity-90 hover:opacity-100 ring-1 ring-slate-600"
                  }`}
                  title={`Construir ${infoAparencia.rotulo} por ${custoProximo} moedas`}
                >
                  <Hammer
                    className={`w-3.5 h-3.5 ${
                      podeConstruir
                        ? "text-yellow-200 group-hover/btn:rotate-12 transition-transform"
                        : "text-slate-400"
                    }`}
                  />
                  <span className="font-extrabold tracking-tight">
                    {isEvoluindo
                      ? "Construindo..."
                      : nivel >= 5
                      ? "Mestria"
                      : "Construir"}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-black flex items-center gap-0.5 ${
                      podeConstruir
                        ? "bg-emerald-950/60 text-amber-200 border border-emerald-400/40"
                        : "bg-slate-950/80 text-amber-400/90 border border-slate-700"
                    }`}
                  >
                    <span>🪙</span>
                    <span>{custoProximo}</span>
                  </span>
                </button>
                <div
                  className={`w-0 h-0 border-x-4 border-x-transparent border-t-4 transition-colors -mt-0.5 ${
                    podeConstruir ? "border-t-emerald-600" : "border-t-slate-700"
                  }`}
                />
              </div>

              {/* Animação Ativa de Ferramenta Construindo o Monumento */}
              {isEvoluindo && <AnimacaoFerramentaConstrucao chaveConstrucao={chave} />}

              {/* Anel de Seleção Ativa */}
              {isSelecionado && !isEvoluindo && (
                <div className="absolute -inset-3 rounded-2xl border-2 border-amber-400 bg-amber-400/20 animate-ping pointer-events-none" />
              )}

              {/* Card da Edificação com Aparência Variada e Ilustrada */}
              <div
                className={`flex flex-col items-center rounded-2xl p-1.5 transition-all backdrop-blur-md shadow-2xl border-2 ${
                  isSelecionado
                    ? "bg-amber-950/90 border-amber-400 ring-4 ring-amber-400/40"
                    : nivel >= 5
                    ? "bg-gradient-to-b from-amber-950/90 to-slate-900/90 border-amber-400/90"
                    : "bg-slate-900/85 border-slate-700/80 hover:border-amber-400/80"
                }`}
              >
                {/* Visual Especial e Variado Conforme Nível */}
                <AparenciaEdificacao
                  chave={chave}
                  nivel={nivel}
                  tamanho="sm"
                  destaque={isSelecionado}
                />

                {/* Nome & Estrelas da Edificação */}
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-md text-center tracking-tight whitespace-nowrap drop-shadow-md">
                    {infoAparencia.rotulo}
                  </span>

                  {/* As 5 Estrelas Douradas da Obra (ou Badge de Mestria) */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((estrela) => {
                      const preenchida = estrela <= Math.min(5, nivel);
                      return (
                        <Star
                          key={estrela}
                          className={`w-2.5 h-2.5 ${
                            preenchida
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]"
                              : "fill-slate-800 text-slate-700"
                          }`}
                        />
                      );
                    })}

                    {nivel > 5 && (
                      <span className="text-[9px] font-black text-cyan-300 ml-1">
                        +{nivel - 5} 💎
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Rodapé do Cenário: Dica Visual de Toque */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-sm border border-slate-700/60 text-[11px] font-bold text-slate-300 shadow-md">
            <span>Toque no botão 'Construir 🪙' logo acima de cada monumento para evoluir sua vila!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
