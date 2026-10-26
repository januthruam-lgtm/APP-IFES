import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Castle,
  Building2,
  Award,
  Sparkles,
  Coins,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  HeartHandshake,
  HelpCircle,
  Landmark,
  Hammer,
  MapPin,
  Trophy,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserProfile } from "../../types";
import {
  CIDADES,
  ESTAGIOS_CIDADE,
  calcularCustoEstagio,
  obterCidadeDefinicao,
  CidadeDefinicao,
} from "../../config/cidade.config";
import {
  EstadoCidadeUsuario,
  carregarEstadoCidade,
  evoluirConstrucao,
  prestarAjudaCooperativa,
  trocarCidadeAtiva,
  calcularProgressoCidade,
} from "../../features/cidade/services/cidadeService";
import {
  tocarSomConstruir,
  tocarSomCompletarCidade,
  tocarSomAjuda,
} from "../../features/cidade/utils/cidadeAudio";
import { CidadeCenarioIlustrado } from "./cidade/CidadeCenarioIlustrado";
import { CidadeMenuConstrucao } from "./cidade/CidadeMenuConstrucao";

interface CidadeDoConhecimentoTabProps {
  user: UserProfile;
  onRewardCoins?: (amount: number) => void;
  onRewardXp?: (amount: number) => void;
  onConsumeCoins?: (amount: number) => void;
}

export const CidadeDoConhecimentoTab: React.FC<CidadeDoConhecimentoTabProps> = ({
  user,
  onRewardCoins,
  onRewardXp,
  onConsumeCoins,
}) => {
  const { t } = useTranslation();
  const userId = user.id || user.uid || "local-user";

  const [estado, setEstado] = useState<EstadoCidadeUsuario | null>(null);
  const [subAba, setSubAba] = useState<"construcoes" | "catalogo" | "mapa" | "ajuda">("construcoes");
  const [cidadeVisualizadaId, setCidadeVisualizadaId] = useState<number>(1);
  const [construcaoSelecionada, setConstrucaoSelecionada] = useState<string | null>(null);
  const [construcaoEmEvolucao, setConstrucaoEmEvolucao] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [notificacao, setNotificacao] = useState<{ texto: string; tipo: "sucesso" | "erro" | "info" } | null>(null);
  const [modalVitoria, setModalVitoria] = useState<{ cidadeNome: string; proximaId: number } | null>(null);
  const [processandoAcao, setProcessandoAcao] = useState<boolean>(false);

  const saldoMoedasAtual = user.coins ?? 100;

  useEffect(() => {
    carregarEstadoCidade(userId).then((res) => {
      setEstado(res);
      setCidadeVisualizadaId(res.cidadeAtual);
      setCarregando(false);
    });
  }, [userId]);

  const exibirNotificacao = (texto: string, tipo: "sucesso" | "erro" | "info" = "info") => {
    setNotificacao({ texto, tipo });
    setTimeout(() => {
      setNotificacao(null);
    }, 3500);
  };

  if (carregando || !estado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center space-y-3">
        <Castle className="w-10 h-10 text-[var(--app-primary)] animate-bounce" />
        <p className="text-sm font-bold text-[var(--app-text)]">Construindo sua Cidade do Conhecimento...</p>
        <p className="text-xs text-[var(--app-text-muted)]">Carregando ilustrações, obras e progresso acadêmico.</p>
      </div>
    );
  }

  const cidadeVisualizada = obterCidadeDefinicao(cidadeVisualizadaId);
  const isCidadeCompletada = estado.cidadesCompletadas.includes(cidadeVisualizada.id);
  const progresso = calcularProgressoCidade(estado, cidadeVisualizada.id);

  const handleSelecionarConstrucao = (chave: string) => {
    setConstrucaoSelecionada(chave);
    // Rolagem suave até o card no menu de construção abaixo
    const elemento = document.getElementById(`card-obra-${chave}`);
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleEvoluir = async (chaveConstrucao: string) => {
    if (processandoAcao) return;
    setProcessandoAcao(true);
    setConstrucaoEmEvolucao(chaveConstrucao);

    // Efeito sonoro rítmico do martelo ao construir
    tocarSomConstruir();

    try {
      const res = await evoluirConstrucao(userId, chaveConstrucao, saldoMoedasAtual);

      if (res.sucesso) {
        setEstado(res.novoEstado);
        if (onConsumeCoins) onConsumeCoins(res.custoMoedas);
        if (onRewardXp) onRewardXp(res.xpGanho);

        confetti({
          particleCount: res.cidadeCompletou ? 100 : 40,
          spread: res.cidadeCompletou ? 120 : 60,
          origin: { y: 0.6 },
        });

        if (res.cidadeCompletou) {
          tocarSomCompletarCidade();
          const proximaId = cidadeVisualizada.id + 1;
          setModalVitoria({
            cidadeNome: cidadeVisualizada.nome,
            proximaId,
          });
        } else {
          exibirNotificacao(res.mensagem, "sucesso");
        }
      } else {
        exibirNotificacao(res.mensagem, "erro");
      }
    } catch {
      exibirNotificacao("Ocorreu um erro ao tentar evoluir a construção.", "erro");
    } finally {
      // Deixar a animação de ferramenta visível por 1.15s para sincronizar com os golpes
      setTimeout(() => {
        setConstrucaoEmEvolucao(null);
        setProcessandoAcao(false);
      }, 1150);
    }
  };

  const handleAjudaCooperativa = async () => {
    if (processandoAcao) return;
    setProcessandoAcao(true);

    try {
      const res = await prestarAjudaCooperativa(userId);
      if (res.sucesso) {
        tocarSomAjuda();
        setEstado(res.novoEstado);
        if (onRewardCoins) onRewardCoins(res.moedasGanhas);
        if (onRewardXp) onRewardXp(res.xpGanho);

        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
        });

        exibirNotificacao(res.mensagem, "sucesso");
      } else {
        exibirNotificacao(res.mensagem, "info");
      }
    } finally {
      setProcessandoAcao(false);
    }
  };

  const handleMudarCidade = async (cidadeId: number) => {
    const desbloqueada = cidadeId === 1 || estado.cidadesCompletadas.includes(cidadeId - 1);
    if (!desbloqueada) {
      exibirNotificacao("Esta vila está bloqueada. Complete as 5 estrelas da vila anterior para acessá-la.", "info");
      return;
    }

    try {
      const novo = await trocarCidadeAtiva(userId, cidadeId);
      setEstado(novo);
      setCidadeVisualizadaId(cidadeId);
      setConstrucaoSelecionada(null);
    } catch (err: any) {
      exibirNotificacao(err.message || "Não foi possível alternar para esta cidade.", "erro");
    }
  };

  const temAnterior = cidadeVisualizada.id > 1;
  const temProxima = true; // Cidades ilimitadas
  const proximaDesbloqueada = estado.cidadesCompletadas.includes(cidadeVisualizada.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notificacao && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 ${
            notificacao.tipo === "sucesso"
              ? "bg-emerald-600 text-white border-emerald-500"
              : notificacao.tipo === "erro"
              ? "bg-rose-600 text-white border-rose-500"
              : "bg-slate-900 text-white border-slate-700"
          }`}
        >
          {notificacao.tipo === "sucesso" && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
          {notificacao.tipo === "erro" && <HelpCircle className="w-4 h-4 shrink-0 text-white" />}
          <span>{notificacao.texto}</span>
        </div>
      )}

      {/* Modal Comemorativo de Vila Conquistada */}
      {modalVitoria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[var(--app-card)] border-3 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-4 border-white text-slate-950 shadow-xl animate-bounce">
                <Trophy className="w-10 h-10" />
              </div>

              <h2 className="text-2xl font-black text-[var(--app-text)] tracking-tight">
                Vila Conquistada! 🏆
              </h2>
              <p className="text-sm font-bold text-amber-500">
                Você completou todas as 5 estrelas de {modalVitoria.cidadeNome}!
              </p>
              <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
                Seu progresso acadêmico elevou a civilização ao estágio de Monumento. A próxima vila do saber já está desbloqueada!
              </p>

              <button
                type="button"
                onClick={() => {
                  const prox = modalVitoria.proximaId;
                  setModalVitoria(null);
                  handleMudarCidade(prox);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Avançar para a Próxima Vila</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-abas de Navegação: Foco Específico em Construções */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setSubAba("construcoes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
            subAba === "construcoes"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md ring-2 ring-amber-400/40"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <Hammer className="w-4 h-4" />
          <span>Construções da Vila</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/20 text-slate-950 font-bold">
            {progresso.concluidos}/{progresso.total} ⭐
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubAba("catalogo")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
            subAba === "catalogo"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md ring-2 ring-amber-400/40"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Menu de Obras</span>
        </button>

        <button
          type="button"
          onClick={() => setSubAba("mapa")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
            subAba === "mapa"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md ring-2 ring-amber-400/40"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Mapa de Vilas</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/20 text-slate-950 font-bold">
            Vila {cidadeVisualizada.id}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubAba("ajuda")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
            subAba === "ajuda"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md ring-2 ring-amber-400/40"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Ajuda Comunitária</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/20 text-slate-950 font-bold">
            {3 - estado.ajudasHoje} hoje
          </span>
        </button>
      </div>

      {/* ABA 1: CONSTRUÇÕES DA VILA (CENÁRIO ILUSTRADO COM BOTÃO DE CONSTRUIR LOGO ACIMA) */}
      {subAba === "construcoes" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Barra de Navegação Entre Vilas */}
          <div className="flex items-center justify-between gap-3 px-1">
            <button
              type="button"
              onClick={() => temAnterior && handleMudarCidade(cidadeVisualizada.id - 1)}
              disabled={!temAnterior}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] text-xs font-bold hover:bg-[var(--app-card-secondary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Vila Anterior</span>
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Castle className="w-4 h-4 text-amber-500" />
                <h1 className="text-base sm:text-lg font-black text-[var(--app-text)] tracking-tight">
                  {cidadeVisualizada.nome}
                </h1>
                {isCidadeCompletada && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                    100% ⭐
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[var(--app-text-muted)] font-medium">
                Vila {cidadeVisualizada.id} • {cidadeVisualizada.desbloqueioDescricao}
              </p>
            </div>

            <button
              type="button"
              onClick={() => temProxima && handleMudarCidade(cidadeVisualizada.id + 1)}
              disabled={!temProxima || !proximaDesbloqueada}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] text-xs font-bold hover:bg-[var(--app-card-secondary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
            >
              <span className="hidden sm:inline">Próxima Vila</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Cenário Ilustrado com Botões Flutuantes Logo Acima de Cada Construção */}
          <CidadeCenarioIlustrado
            cidadeId={cidadeVisualizada.id}
            cidadeNome={cidadeVisualizada.nome}
            construcoesNiveis={estado.construcoes}
            construcoesChaves={cidadeVisualizada.chavesConstrucoes}
            construcaoSelecionada={construcaoSelecionada}
            onSelecionarConstrucao={handleSelecionarConstrucao}
            onEvoluir={handleEvoluir}
            construcaoEmEvolucao={construcaoEmEvolucao}
            saldoMoedas={saldoMoedasAtual}
          />

          {/* Painel de Status & Progresso da Vila */}
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[var(--app-text-muted)]">
                  Progresso da Vila {cidadeVisualizada.id}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-black bg-amber-500/10 text-amber-500">
                  {progresso.concluidos} / {progresso.total} Estrelas ⭐
                </span>
              </div>
              <div className="w-full sm:w-72 h-2.5 rounded-full bg-[var(--app-card-secondary)] overflow-hidden border border-[var(--app-border)]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${progresso.porcentagem}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setSubAba("catalogo")}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:bg-[var(--app-border)] text-[var(--app-text)] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Ver Detalhes das Obras</span>
              </button>

              <button
                type="button"
                onClick={() => setSubAba("ajuda")}
                className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-500 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Ajuda Diária (+15 🪙)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: MENU DE CONSTRUÇÃO E OBRAS DETALHADO */}
      {subAba === "catalogo" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-3 px-1">
            <button
              type="button"
              onClick={() => temAnterior && handleMudarCidade(cidadeVisualizada.id - 1)}
              disabled={!temAnterior}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] text-xs font-bold hover:bg-[var(--app-card-secondary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Vila Anterior</span>
            </button>

            <div className="text-center">
              <h2 className="text-base sm:text-lg font-black text-[var(--app-text)] tracking-tight">
                Catálogo de Obras • {cidadeVisualizada.nome}
              </h2>
              <p className="text-[11px] text-[var(--app-text-muted)] font-medium">
                Selecione cada monumento para ver lore, requisitos e estágios
              </p>
            </div>

            <button
              type="button"
              onClick={() => temProxima && handleMudarCidade(cidadeVisualizada.id + 1)}
              disabled={!temProxima || !proximaDesbloqueada}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] text-[var(--app-text)] text-xs font-bold hover:bg-[var(--app-card-secondary)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition shadow-xs"
            >
              <span className="hidden sm:inline">Próxima Vila</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <CidadeMenuConstrucao
            cidadeId={cidadeVisualizada.id}
            cidadeNome={cidadeVisualizada.nome}
            construcoesNiveis={estado.construcoes}
            construcoesChaves={cidadeVisualizada.chavesConstrucoes}
            construcaoSelecionada={construcaoSelecionada}
            onSelecionarConstrucao={setConstrucaoSelecionada}
            onEvoluir={handleEvoluir}
            construcaoEmEvolucao={construcaoEmEvolucao}
            saldoMoedas={saldoMoedasAtual}
          />
        </div>
      )}

      {/* ABA 3: MAPA DE TODAS AS VILAS DO SABER (PROGRESSÃO ILIMITADA) */}
      {subAba === "mapa" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-2">
              <Landmark className="w-3.5 h-3.5 text-amber-500" />
              <span>Mapa das Vilas do Saber ({estado.cidadesCompletadas.length} Conquistadas)</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-500">
              Níveis Ilimitados • Vilas do Saber
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {(() => {
              const maiorCompletada = estado.cidadesCompletadas.length > 0
                ? Math.max(...estado.cidadesCompletadas)
                : 0;
              const maxExibir = Math.max(10, Math.max(estado.cidadeAtual, maiorCompletada) + 2);
              const listaVilas = Array.from({ length: maxExibir }, (_, i) => obterCidadeDefinicao(i + 1));

              return listaVilas.map((c) => {
                const desbloqueada = c.id === 1 || estado.cidadesCompletadas.includes(c.id - 1);
                const selecionada = cidadeVisualizadaId === c.id;
                const completada = estado.cidadesCompletadas.includes(c.id);

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      handleMudarCidade(c.id);
                      setSubAba("construcoes");
                    }}
                    disabled={!desbloqueada}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between h-24 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      selecionada
                        ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/30 shadow-md"
                        : "bg-[var(--app-card)] border-[var(--app-border)] hover:bg-[var(--app-card-secondary)]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-black uppercase text-[var(--app-text-muted)]">
                        Vila {c.id}
                      </span>
                      {completada ? (
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      ) : !desbloqueada ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[var(--app-text)] truncate">{c.nome}</p>
                      <p className="text-[10px] text-[var(--app-text-muted)]">
                        {completada ? "Completada ⭐" : desbloqueada ? "Em Obras" : "Bloqueada"}
                      </p>
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* ABA 4: AJUDA COMUNITÁRIA DE OBRAS (COOPERATIVA SEM ROUBO OU ATAQUES) */}
      {subAba === "ajuda" && (
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in fade-in duration-200">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Cooperação Acadêmica</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-[var(--app-text)]">
              Ajuda Comunitária de Obras
            </h3>
            <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
              Ajude colegas da turma em suas vilas acadêmicas para receber moedas e pontos de experiência diários. Você pode prestar ajuda até 3 vezes por dia (
              <span className="font-bold text-[var(--app-text)]">{estado.ajudasHoje} de 3 realizadas hoje</span>).
            </p>
          </div>

          <button
            type="button"
            disabled={estado.ajudasHoje >= 3 || processandoAcao}
            onClick={handleAjudaCooperativa}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg border-b-3 border-emerald-800 active:border-b-0 active:translate-y-1 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center gap-2"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>
              {estado.ajudasHoje >= 3 ? "Limite Diário Concluído" : "Prestar Ajuda (+15 🪙)"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
