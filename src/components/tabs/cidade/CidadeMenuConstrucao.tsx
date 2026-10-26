import React from "react";
import {
  BookOpen,
  FlaskConical,
  Telescope,
  Bed,
  Landmark,
  Users,
  Star,
  Hammer,
  Sparkles,
  CheckCircle2,
  Lock,
  Wrench,
} from "lucide-react";
import {
  calcularCustoEstagio,
  obterEstagio,
  ESTAGIOS_CIDADE,
} from "../../../config/cidade.config";
import { AparenciaEdificacao, obterInfoAparencia } from "./AparenciaEdificacao";

interface CidadeMenuConstrucaoProps {
  cidadeId: number;
  cidadeNome: string;
  construcoesNiveis: Record<string, number>;
  construcoesChaves: readonly string[];
  construcaoSelecionada: string | null;
  onSelecionarConstrucao: (chave: string) => void;
  onEvoluir: (chave: string) => void;
  construcaoEmEvolucao: string | null;
  saldoMoedas: number;
}

const METADADOS_CONSTRUCAO: Record<
  string,
  {
    nome: string;
    subtitulo: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }
> = {
  biblioteca: {
    nome: "Biblioteca Central",
    subtitulo: "Acervo de estudos, artigos raros e incentivo à leitura contínua.",
    icon: BookOpen,
    accentColor: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  laboratorio: {
    nome: "Laboratório de Ciências",
    subtitulo: "Pesquisa prática, método científico e experimentos.",
    icon: FlaskConical,
    accentColor: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  observatorio: {
    nome: "Observatório Astral",
    subtitulo: "Foco a longo prazo, metas acadêmicas e visão ampla.",
    icon: Telescope,
    accentColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30",
  },
  dormitorio: {
    nome: "Dormitório dos Mascotes",
    subtitulo: "Recuperação de energia, refúgio e bem-estar do estudante.",
    icon: Bed,
    accentColor: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  auditorio: {
    nome: "Auditório das Artes",
    subtitulo: "Debates em equipe, apresentações de projetos e eventos.",
    icon: Landmark,
    accentColor: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  },
  praca: {
    nome: "Praça da Convivência",
    subtitulo: "Espaço de cooperação diária e ajuda mútua de estudos.",
    icon: Users,
    accentColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
};

export const CidadeMenuConstrucao: React.FC<CidadeMenuConstrucaoProps> = ({
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
  // Total de estrelas acumuladas na vila
  const totalEstrelas = construcoesChaves.reduce((acc, chave) => {
    return acc + Math.max(1, Math.min(5, construcoesNiveis[chave] || 1));
  }, 0);
  const maxEstrelas = construcoesChaves.length * 5;
  const porcentagemEstrelas = Math.min(100, Math.round((totalEstrelas / maxEstrelas) * 100));

  // Verifica se todas as construções já atingiram o nível 5
  const todasNoNivel5 = construcoesChaves.every(
    (k) => (construcoesNiveis[k] || 1) >= 5
  );

  return (
    <div className="bg-[var(--app-card)] border-2 border-[var(--app-border)] rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
      {/* Cabeçalho do Menu de Obras e Construção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 text-amber-500 shadow-md">
            <Hammer className="w-6 h-6 animate-wiggle" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--app-text)] tracking-tight">
              Menu de Obras & Construção • {cidadeNome}
            </h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              {todasNoNivel5
                ? "Vila Conquistada! Modo de Mestria Celestial ativado para níveis ilimitados."
                : "Complete as 5 estrelas de cada monumento para avançar e conquistar a vila."}
            </p>
          </div>
        </div>

        {/* Contador Geral de Estrelas da Vila */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] shrink-0">
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="text-sm font-black font-mono text-[var(--app-text)]">
              {totalEstrelas} / {maxEstrelas}
            </span>
          </div>
          <div className="w-24 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500"
              style={{ width: `${porcentagemEstrelas}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de Edificações para Construção */}
      <div className="space-y-4">
        {construcoesChaves.map((chave) => {
          const meta = METADADOS_CONSTRUCAO[chave] || {
            nome: chave,
            subtitulo: "Construção acadêmica da vila.",
            icon: Landmark,
            accentColor: "text-amber-500 bg-amber-500/10 border-amber-500/30",
          };

          const nivelAtual = Math.max(1, construcoesNiveis[chave] || 1);
          const proximoNivel = nivelAtual + 1;

          // Se está no nível 5 e a vila ainda não tem todas no 5, deve esperar a vila completar
          const travadoNoNivel5 = nivelAtual >= 5 && !todasNoNivel5;

          const custoProximo = !travadoNoNivel5 ? calcularCustoEstagio(cidadeId, proximoNivel) : 0;
          const podeConstruir = !travadoNoNivel5 && saldoMoedas >= custoProximo;
          const moedasFaltando = Math.max(0, custoProximo - saldoMoedas);

          const estagioAtualDef = obterEstagio(nivelAtual);
          const proximoEstagioDef = !travadoNoNivel5 ? obterEstagio(proximoNivel) : null;
          const infoAparencia = obterInfoAparencia(chave, nivelAtual);
          const infoProximaAparencia = !travadoNoNivel5 ? obterInfoAparencia(chave, proximoNivel) : null;

          const isSelecionado = construcaoSelecionada === chave;
          const isEvoluindo = construcaoEmEvolucao === chave;

          return (
            <div
              key={chave}
              id={`card-obra-${chave}`}
              onClick={() => onSelecionarConstrucao(chave)}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer relative overflow-hidden ${
                isSelecionado
                  ? "bg-[var(--app-primary)]/10 border-[var(--app-primary)] ring-2 ring-[var(--app-primary)]/30 shadow-md"
                  : "bg-[var(--app-card-secondary)] border-[var(--app-border)] hover:border-amber-400/50"
              }`}
            >
              {/* Indicador de ferramenta construindo no card */}
              {isEvoluindo && (
                <div className="absolute inset-0 bg-amber-500/15 backdrop-blur-xs flex items-center justify-center z-20 pointer-events-none">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/95 border-2 border-amber-400 text-amber-300 text-xs font-black uppercase tracking-wider shadow-xl animate-bounce">
                    <Hammer className="w-4 h-4 animate-spin" />
                    <span>Martelando e Construindo...</span>
                  </div>
                </div>
              )}

              {/* Lado Esquerdo: Aparência Visual Variada, Lore e as 5 Estrelas Douradas */}
              <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                <div className="shrink-0">
                  <AparenciaEdificacao
                    chave={chave}
                    nivel={nivelAtual}
                    tamanho="md"
                    destaque={isSelecionado}
                  />
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-[var(--app-text)] tracking-tight truncate">
                      {meta.nome}
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--app-bg)] text-amber-500 border border-[var(--app-border)]">
                      {infoAparencia.rotulo} • Nível {nivelAtual}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--app-text-muted)] line-clamp-2 leading-relaxed">
                    {infoAparencia.descricao}
                  </p>

                  {/* As 5 Grandes Estrelas da Edificação (ou Selo de Mestria) */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((estrela) => {
                      const preenchida = estrela <= Math.min(5, nivelAtual);
                      return (
                        <div
                          key={estrela}
                          className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg border transition-all ${
                            preenchida
                              ? "bg-amber-400/20 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                              : "bg-slate-900/40 border-slate-700/60"
                          }`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                              preenchida
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]"
                                : "text-slate-600 fill-transparent"
                            }`}
                          />
                        </div>
                      );
                    })}

                    {nivelAtual > 5 && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-400 text-cyan-300 text-[10px] font-black">
                        Mestria +{nivelAtual - 5} 💎
                      </span>
                    )}

                    <span className="text-[11px] font-bold text-amber-500 ml-1 truncate">
                      {travadoNoNivel5
                        ? "Nível 5 Concluído! Complete a vila."
                        : `Próximo: ${infoProximaAparencia?.rotulo || proximoEstagioDef?.nome}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Botão Oficial "Construir / Evoluir" */}
              <div className="shrink-0 flex items-center justify-end">
                {travadoNoNivel5 ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-400 text-amber-400 font-black text-xs shadow-sm select-none">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>NÍVEL 5 (CONCLUÍDO)</span>
                  </div>
                ) : podeConstruir ? (
                  <button
                    type="button"
                    disabled={Boolean(construcaoEmEvolucao)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEvoluir(chave);
                    }}
                    className="relative group/btn px-5 sm:px-6 py-3 rounded-2xl font-black text-sm text-white shadow-xl bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center gap-2.5 disabled:opacity-50"
                  >
                    <Hammer className="w-4 h-4 group-hover/btn:rotate-45 transition-transform duration-200" />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="uppercase tracking-wider text-xs">
                        {nivelAtual >= 5 ? "Elevar Mestria" : "Construir"}
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-100 flex items-center gap-1">
                        <span>🪙 {custoProximo}</span>
                        <span className="text-[10px] text-emerald-200 font-normal">
                          (+{proximoNivel * 10} XP)
                        </span>
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="px-4 py-2.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex flex-col items-end opacity-70">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[var(--app-text-muted)]">
                      <Lock className="w-3.5 h-3.5" />
                      <span>🪙 {custoProximo} Moedas</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-400">
                      Faltam {moedasFaltando} 🪙
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
