import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Shield,
  Award,
  Lock,
  CheckCircle2,
  Calendar,
  Gift,
  Coins,
  ArrowRight,
  TrendingUp,
  Info,
  Clock,
  Tag,
  Star,
  Trophy,
  Flame,
  BookOpen,
} from "lucide-react";
import { FIDELIDADE_CONFIG } from "../../../config/fidelidade.config";
import {
  carregarEstadoFidelidade,
  resgatarCofreFidelidade,
  resgatarItemSelos,
  EstadoFidelidadeUsuario,
} from "../services/fidelidadeService";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Badge } from "../../../components/ui/Badge";
import { Skeleton } from "../../../components/ui/Skeleton";

interface FidelidadeViewProps {
  uid: string;
  saldoAtualMoedas: number;
  missaoDiariaConcluidaHoje: boolean;
  onMoedasResgatadas?: (novasMoedas: number) => void;
  onNavigateToCidade?: () => void;
  onNavigateToStore?: () => void;
}

export const FidelidadeView: React.FC<FidelidadeViewProps> = ({
  uid,
  saldoAtualMoedas,
  missaoDiariaConcluidaHoje,
  onMoedasResgatadas,
  onNavigateToCidade,
  onNavigateToStore,
}) => {
  const [estado, setEstado] = useState<EstadoFidelidadeUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [resgatandoCofre, setResgatandoCofre] = useState(false);
  const [feedbackMensagem, setFeedbackMensagem] = useState<{
    tipo: "sucesso" | "erro" | "info";
    texto: string;
  } | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const dados = await carregarEstadoFidelidade(uid);
      setEstado(dados);
    } catch (err) {
      console.error("Erro ao carregar fidelidade:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [uid]);

  const handleResgatarCofre = async () => {
    if (!estado) return;
    setResgatandoCofre(true);
    setFeedbackMensagem(null);

    try {
      const res = await resgatarCofreFidelidade(uid, missaoDiariaConcluidaHoje);
      if (res.sucesso) {
        setFeedbackMensagem({
          tipo: "sucesso",
          texto: res.mensagem,
        });
        if (onMoedasResgatadas) {
          onMoedasResgatadas(res.valorResgatado);
        }
        await carregarDados();
      } else {
        setFeedbackMensagem({
          tipo: "erro",
          texto: res.mensagem,
        });
      }
    } catch (err: any) {
      setFeedbackMensagem({
        tipo: "erro",
        texto: err.message || "Erro ao processar resgate do cofre.",
      });
    } finally {
      setResgatandoCofre(false);
    }
  };

  const handleResgatarSeloItem = async (itemId: string) => {
    setFeedbackMensagem(null);
    try {
      const res = await resgatarItemSelos(uid, itemId);
      if (res.sucesso) {
        setFeedbackMensagem({
          tipo: "sucesso",
          texto: res.mensagem,
        });
        await carregarDados();
      } else {
        setFeedbackMensagem({
          tipo: "erro",
          texto: res.mensagem,
        });
      }
    } catch (err: any) {
      setFeedbackMensagem({
        tipo: "erro",
        texto: err.message || "Erro ao resgatar item.",
      });
    }
  };

  if (loading || !estado) {
    return (
      <div className="space-y-4">
        <Skeleton height={140} rounded="2xl" />
        <Skeleton height={120} rounded="2xl" />
        <Skeleton height={200} rounded="2xl" />
      </div>
    );
  }

  // Nível atual e próximo
  const nivelAtual =
    FIDELIDADE_CONFIG.NIVEIS_CLIENTE.find((n) => n.id === estado.nivelId) ||
    FIDELIDADE_CONFIG.NIVEIS_CLIENTE[0];

  const indiceNivelAtual = FIDELIDADE_CONFIG.NIVEIS_CLIENTE.findIndex(
    (n) => n.id === estado.nivelId
  );
  const proximoNivel =
    indiceNivelAtual < FIDELIDADE_CONFIG.NIVEIS_CLIENTE.length - 1
      ? FIDELIDADE_CONFIG.NIVEIS_CLIENTE[indiceNivelAtual + 1]
      : null;

  const progressoProximoNivel = proximoNivel
    ? Math.min(
        100,
        Math.floor(
          ((estado.gastoElegivel30d - nivelAtual.gastoMinimo30d) /
            (proximoNivel.gastoMinimo30d - nivelAtual.gastoMinimo30d)) *
            100
        )
      )
    : 100;

  // Ícones do catálogo de selos
  const renderItemIcon = (iconName: string) => {
    switch (iconName) {
      case "Award":
        return <Award className="w-5 h-5 text-amber-500" />;
      case "Sparkles":
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case "Star":
        return <Star className="w-5 h-5 text-amber-400" />;
      case "BookOpen":
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case "Trophy":
        return <Trophy className="w-5 h-5 text-amber-600" />;
      case "Shield":
        return <Shield className="w-5 h-5 text-indigo-500" />;
      case "Flame":
        return <Flame className="w-5 h-5 text-rose-500" />;
      default:
        return <Gift className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Feedback */}
      {feedbackMensagem && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 ${
            feedbackMensagem.tipo === "sucesso"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMensagem.tipo === "sucesso" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <Info className="w-5 h-5 shrink-0" />
            )}
            <span>{feedbackMensagem.texto}</span>
          </div>
          <button
            onClick={() => setFeedbackMensagem(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Cartão de Nível e Janela Móvel de 30 Dias */}
      <Card
        variant="elevated"
        padding="lg"
        className="relative overflow-hidden bg-gradient-to-br from-[var(--app-card)] to-[var(--app-card-secondary)] border-[var(--app-border)]"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md">
                Nível {nivelAtual.nome}
              </Badge>
              <span className="text-xs font-bold text-[var(--app-text-muted)]">
                Retorno de {(nivelAtual.porcentagemRetorno * 100).toFixed(0)}% no Cofre
              </span>
            </div>
            <h2 className="text-2xl font-black text-[var(--app-text)] tracking-tight">
              Clube de Fidelidade Brain Studio
            </h2>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)] max-w-xl">
              Suas aquisições e construções acumulam cashback direto no cofre e geram selos exclusivos.
            </p>
          </div>

          <div className="bg-[var(--app-bg)]/80 px-4 py-3 rounded-2xl border border-[var(--app-border)] text-right">
            <div className="text-[11px] text-[var(--app-text-muted)] font-medium">Gasto Elegível (30d)</div>
            <div className="text-xl font-black font-mono text-[var(--app-text)]">
              {estado.gastoElegivel30d} moedas
            </div>
          </div>
        </div>

        {/* Barra de Progresso para o próximo nível */}
        {proximoNivel ? (
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--app-text-muted)]">
                Rumo a {proximoNivel.nome} ({(proximoNivel.porcentagemRetorno * 100).toFixed(0)}% de retorno)
              </span>
              <span className="font-mono text-[var(--app-text)]">
                Faltam {Math.max(0, proximoNivel.gastoMinimo30d - estado.gastoElegivel30d)} moedas
              </span>
            </div>
            <ProgressBar value={progressoProximoNivel} variant="primary" />
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-500">
            <Trophy className="w-4 h-4" />
            <span>Nível Máximo Atingido! Você aproveita o maior retorno de cashback (5%).</span>
          </div>
        )}
      </Card>

      {/* Grid com Cofre de Retorno e Selos de Colecionador */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cofre de Retorno */}
        <Card variant="default" padding="lg" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[var(--app-text)]">Cofre de Retorno</h3>
                  <span className="text-xs text-[var(--app-text-muted)]">
                    Teto máximo: {FIDELIDADE_CONFIG.COFRE.CAPACIDADE_MAXIMA} moedas
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-amber-500">
                  {estado.saldoCofre}
                </span>
                <span className="text-xs text-[var(--app-text-muted)]"> / 500</span>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-[var(--app-text-muted)]">
              <div className="flex items-center justify-between">
                <span>Resgatado nesta semana civil:</span>
                <span className="font-bold text-[var(--app-text)]">
                  {estado.resgateSemanaAtual.valor} / {FIDELIDADE_CONFIG.COFRE.TETO_RESGATE_SEMANAL} moedas
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Missão diária concluída hoje:</span>
                <span className={`font-bold flex items-center gap-1 ${
                  missaoDiariaConcluidaHoje ? "text-emerald-500" : "text-amber-500"
                }`}>
                  {missaoDiariaConcluidaHoje ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Concluída
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" /> Pendente
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Resgates na semana:</span>
                <span className="font-bold text-[var(--app-text)]">
                  {estado.resgateSemanaAtual.resgatesCount} / {FIDELIDADE_CONFIG.COFRE.MAX_RESGATES_SEMANA_CIVIL}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--app-border)]">
            <Button
              variant="primary"
              fullWidth
              disabled={
                estado.saldoCofre <= 0 ||
                !missaoDiariaConcluidaHoje ||
                estado.resgateSemanaAtual.resgatesCount >= FIDELIDADE_CONFIG.COFRE.MAX_RESGATES_SEMANA_CIVIL ||
                estado.resgateSemanaAtual.valor >= FIDELIDADE_CONFIG.COFRE.TETO_RESGATE_SEMANAL ||
                resgatandoCofre
              }
              onClick={handleResgatarCofre}
            >
              {resgatandoCofre
                ? "Processando Resgate..."
                : estado.saldoCofre <= 0
                ? "Cofre Vazio"
                : !missaoDiariaConcluidaHoje
                ? "Faça 1 Missão Hoje para Liberar"
                : estado.resgateSemanaAtual.resgatesCount >= 1
                ? "Resgate da Semana Já Efetuado"
                : `Resgatar ${Math.min(
                    estado.saldoCofre,
                    FIDELIDADE_CONFIG.COFRE.TETO_RESGATE_SEMANAL - estado.resgateSemanaAtual.valor
                  )} Moedas para o Saldo`}
            </Button>
          </div>
        </Card>

        {/* Selos de Fidelidade */}
        <Card variant="default" padding="lg" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-500">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[var(--app-text)]">Selos de Colecionador</h3>
                  <span className="text-xs text-[var(--app-text-muted)]">
                    1 selo a cada 100 moedas de gasto elegível
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
                  {estado.selosDisponiveis}
                </span>
                <span className="text-xs text-[var(--app-text-muted)]"> selos</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[var(--app-text-muted)]">
              <p>
                Use seus selos para resgatar títulos honorários, molduras de avatar exclusivas e itens raros para o mascote.
              </p>
              <div className="flex items-center justify-between pt-1 font-bold text-[var(--app-text)]">
                <span>Total de selos acumulados na história:</span>
                <span>{estado.selosTotalAcumulados}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-[var(--app-text)]">
                <span>Itens exclusivos desbloqueados:</span>
                <span>{estado.itensSelosDesbloqueados.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--app-border)]">
            <span className="text-[11px] font-semibold text-[var(--app-text-muted)]">
              Dica: Obras da cidade e cosméticos da loja acumulam selos automaticamente.
            </span>
          </div>
        </Card>
      </div>

      {/* Catálogo de Selos de Colecionador */}
      <div className="space-y-3">
        <h3 className="text-lg font-black text-[var(--app-text)] flex items-center gap-2">
          <Gift className="w-5 h-5 text-[var(--app-primary)]" />
          Catálogo Exclusivo por Selos
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FIDELIDADE_CONFIG.SELOS.CATALOGO.map((item) => {
            const jaPossui = estado.itensSelosDesbloqueados.includes(item.id);
            const podeComprar = estado.selosDisponiveis >= item.selos;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  jaPossui
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-[var(--app-card)] border-[var(--app-border)] hover:border-[var(--app-primary)]/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[var(--app-card-secondary)] flex items-center justify-center">
                      {renderItemIcon(item.icon)}
                    </div>
                    {jaPossui ? (
                      <Badge variant="success" size="sm">
                        Adquirido
                      </Badge>
                    ) : (
                      <span className="text-xs font-black font-mono text-purple-600 dark:text-purple-400">
                        {item.selos} selos
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--app-text)]">{item.nome}</h4>
                  <span className="text-[11px] text-[var(--app-text-muted)] capitalize">
                    {item.tipo}
                  </span>
                </div>

                <div className="mt-4">
                  {jaPossui ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Desbloqueado</span>
                    </div>
                  ) : (
                    <Button
                      variant={podeComprar ? "primary" : "secondary"}
                      size="sm"
                      fullWidth
                      disabled={!podeComprar}
                      onClick={() => handleResgatarSeloItem(item.id)}
                    >
                      {podeComprar ? "Desbloquear" : `Faltam ${item.selos - estado.selosDisponiveis}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metas Semanais de Gasto */}
      <Card variant="default" padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[var(--app-text)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Metas Semanais de Atividade
            </h3>
            <p className="text-xs text-[var(--app-text-muted)]">
              Alcance marcos de gastos na semana civil para receber injeções diretas no seu cofre.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[var(--app-text-muted)]">Gasto na Semana:</span>
            <div className="text-base font-black font-mono text-[var(--app-text)]">
              {estado.gastoSemanaAtual} moedas
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FIDELIDADE_CONFIG.METAS_SEMANAIS.map((meta) => {
            const concluida = estado.metasSemanaisConcluidas.includes(meta.id);
            const percentual = Math.min(100, Math.floor((estado.gastoSemanaAtual / meta.gastoMinimo) * 100));

            return (
              <div
                key={meta.id}
                className={`p-3.5 rounded-2xl border ${
                  concluida
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-[var(--app-card-secondary)] border-[var(--app-border)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[var(--app-text)]">
                    {meta.gastoMinimo} moedas
                  </span>
                  <Badge variant={concluida ? "success" : "neutral"} size="sm">
                    +{meta.retornoCofre} no cofre
                  </Badge>
                </div>
                <ProgressBar value={percentual} variant={concluida ? "success" : "primary"} />
                <div className="mt-1 text-[10px] text-[var(--app-text-muted)] text-right">
                  {concluida ? "Concluída!" : `${estado.gastoSemanaAtual}/${meta.gastoMinimo}`}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
