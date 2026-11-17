import React, { useState, useEffect } from "react";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Filter,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  carregarExtrato,
  auditarExtrato,
  garantirSaldoInicialExtrato,
  LancamentoExtrato,
  TipoLancamento,
  OrigemLancamento,
} from "../services/extratoService";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";

interface ExtratoMoedasViewProps {
  uid: string;
  saldoAtual: number;
  onClose?: () => void;
}

export const ExtratoMoedasView: React.FC<ExtratoMoedasViewProps> = ({
  uid,
  saldoAtual,
  onClose,
}) => {
  const { t } = useTranslation();
  const [lancamentos, setLancamentos] = useState<LancamentoExtrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoLancamento>("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<"todos" | "hoje" | "7dias" | "30dias">("todos");
  const [filtroOrigem, setFiltroOrigem] = useState<"todas" | OrigemLancamento>("todas");
  const [itensVisiveis, setItensVisiveis] = useState(15);
  const [resultadoAuditoria, setResultadoAuditoria] = useState<{
    auditado: boolean;
    valido: boolean;
    mensagem: string;
  } | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      await garantirSaldoInicialExtrato(uid, saldoAtual);
      const lista = await carregarExtrato(uid, 120);
      setLancamentos(lista);
    } catch (err) {
      console.error("Erro ao carregar extrato:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();

    const handleUpdate = () => {
      carregarDados();
    };

    window.addEventListener("brain_studio_extrato_updated", handleUpdate);
    return () => {
      window.removeEventListener("brain_studio_extrato_updated", handleUpdate);
    };
  }, [uid, saldoAtual]);

  const handleAuditar = async () => {
    const res = await auditarExtrato(uid, saldoAtual);
    setResultadoAuditoria({
      auditado: true,
      valido: res.valido,
      mensagem: res.valido
        ? t("extrato.auditoria_ok", "Seu livro-razão está 100% equilibrado e verificado!")
        : t("extrato.auditoria_divergencia", `Divergência detectada: ${res.diferenca} moedas de diferença contábil.`),
    });
  };

  const isSaida = (t: string) => t === "gasto" || t === "saida";
  const isEntrada = (t: string) => t === "ganho";

  const agora = Date.now();
  const umDiaMs = 24 * 60 * 60 * 1000;
  const seteDiasMs = 7 * umDiaMs;
  const trintaDiasMs = 30 * umDiaMs;

  // Filtragem da lista
  const lancamentosFiltrados = lancamentos.filter((item) => {
    // Filtro por Tipo
    if (filtroTipo === "gasto" || filtroTipo === "saida") {
      if (!isSaida(item.tipo)) return false;
    } else if (filtroTipo === "ganho") {
      if (!isEntrada(item.tipo)) return false;
    } else if (filtroTipo !== "todos" && item.tipo !== filtroTipo) {
      return false;
    }

    // Filtro por Origem
    if (filtroOrigem !== "todas" && item.origem !== filtroOrigem) {
      return false;
    }

    // Filtro por Período
    const itemTimestamp = new Date(item.criadoEm).getTime();
    if (filtroPeriodo === "hoje" && agora - itemTimestamp > umDiaMs) {
      return false;
    }
    if (filtroPeriodo === "7dias" && agora - itemTimestamp > seteDiasMs) {
      return false;
    }
    if (filtroPeriodo === "30dias" && agora - itemTimestamp > trintaDiasMs) {
      return false;
    }

    return true;
  });

  // Métricas do período filtrado
  const totalGanhos = lancamentosFiltrados
    .filter((l) => isEntrada(l.tipo))
    .reduce((acc, curr) => acc + Math.abs(curr.valor), 0);

  const totalGastos = lancamentosFiltrados
    .filter((l) => isSaida(l.tipo))
    .reduce((acc, curr) => acc + Math.abs(curr.valor), 0);

  const totalCashback = lancamentosFiltrados
    .filter((l) => l.tipo === "cashback")
    .reduce((acc, curr) => acc + Math.abs(curr.valor), 0);

  // Resumos temporais
  const totalSemanal = lancamentos
    .filter((l) => agora - new Date(l.criadoEm).getTime() <= seteDiasMs)
    .reduce((acc, curr) => acc + (isEntrada(curr.tipo) ? Math.abs(curr.valor) : isSaida(curr.tipo) ? -Math.abs(curr.valor) : 0), 0);

  const totalMensal = lancamentos
    .filter((l) => agora - new Date(l.criadoEm).getTime() <= trintaDiasMs)
    .reduce((acc, curr) => acc + (isEntrada(curr.tipo) ? Math.abs(curr.valor) : isSaida(curr.tipo) ? -Math.abs(curr.valor) : 0), 0);

  const formatarData = (isoStr: string) => {
    try {
      const data = new Date(isoStr);
      return data.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Extrato com Saldo e Ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[var(--app-border)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)] flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-500" />
            Extrato Contábil de Moedas
          </h2>
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
            Transparência contábil total: histórico de entradas, saídas, cofre e auditoria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAuditar}
            className="flex items-center gap-1.5"
            title="Verificar consistência matemática do livro-razão"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Auditar Contas
          </Button>
          <Button
            variant="text"
            size="sm"
            onClick={carregarDados}
            title="Atualizar lançamentos"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Alerta de Auditoria se acionado */}
      {resultadoAuditoria && (
        <div
          className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 ${
            resultadoAuditoria.valido
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
          }`}
        >
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{resultadoAuditoria.mensagem}</span>
        </div>
      )}

      {/* Cartões de Indicadores Contábeis */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="default" padding="sm" className="flex flex-col">
          <span className="text-[11px] text-[var(--app-text-muted)] font-medium">{t("extrato.saldo_atual", "Saldo Atual")}</span>
          <div className="text-xl sm:text-2xl font-black text-amber-500 flex items-center gap-1 mt-1">
            <Coins className="w-5 h-5" />
            {saldoAtual}
          </div>
        </Card>

        <Card variant="default" padding="sm" className="flex flex-col">
          <span className="text-[11px] text-[var(--app-text-muted)] font-medium">{t("extrato.entradas", "Entradas")}</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-5 h-5" />
            +{totalGanhos}
          </div>
        </Card>

        <Card variant="default" padding="sm" className="flex flex-col">
          <span className="text-[11px] text-[var(--app-text-muted)] font-medium">{t("extrato.saidas", "Saídas Monetárias")}</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
            <ArrowDownLeft className="w-5 h-5" />
            -{totalGastos}
          </div>
        </Card>

        <Card variant="default" padding="sm" className="flex flex-col">
          <span className="text-[11px] text-[var(--app-text-muted)] font-medium">{t("extrato.cashback", "Cashback / Retorno")}</span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
            <Sparkles className="w-5 h-5" />
            +{totalCashback}
          </div>
        </Card>
      </div>

      {/* Resumo Semanal e Mensal Consolidado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[var(--app-text-muted)] font-medium flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[var(--app-primary)]" />
            {t("extrato.resumo_semanal", "Balanço Últimos 7 dias:")}
          </span>
          <span className={`font-black font-mono ${totalSemanal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {totalSemanal >= 0 ? `+${totalSemanal}` : totalSemanal} 🪙
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--app-text-muted)] font-medium flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            {t("extrato.resumo_mensal", "Balanço Últimos 30 dias:")}
          </span>
          <span className={`font-black font-mono ${totalMensal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {totalMensal >= 0 ? `+${totalMensal}` : totalMensal} 🪙
          </span>
        </div>
      </div>

      {/* Controles de Filtros: Período e Tipo */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider shrink-0 mr-1">
            {t("extrato.periodo", "Período:")}
          </span>
          <Chip
            label={t("extrato.periodo_todos", "Todos")}
            selected={filtroPeriodo === "todos"}
            onClick={() => setFiltroPeriodo("todos")}
            size="sm"
          />
          <Chip
            label={t("extrato.periodo_hoje", "Hoje (24h)")}
            selected={filtroPeriodo === "hoje"}
            onClick={() => setFiltroPeriodo("hoje")}
            size="sm"
          />
          <Chip
            label={t("extrato.periodo_7dias", "7 Dias")}
            selected={filtroPeriodo === "7dias"}
            onClick={() => setFiltroPeriodo("7dias")}
            size="sm"
          />
          <Chip
            label={t("extrato.periodo_30dias", "30 Dias")}
            selected={filtroPeriodo === "30dias"}
            onClick={() => setFiltroPeriodo("30dias")}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider shrink-0 mr-1">
            {t("extrato.tipo", "Tipo:")}
          </span>
          <Chip
            label={t("extrato.tipo_todos", "Todos")}
            selected={filtroTipo === "todos"}
            onClick={() => setFiltroTipo("todos")}
            size="sm"
          />
          <Chip
            label={t("extrato.tipo_entradas", "Entradas (+)")}
            selected={filtroTipo === "ganho"}
            onClick={() => setFiltroTipo("ganho")}
            size="sm"
          />
          <Chip
            label={t("extrato.tipo_saidas", "Saídas (-)")}
            selected={filtroTipo === "gasto" || filtroTipo === "saida"}
            onClick={() => setFiltroTipo("gasto")}
            size="sm"
          />
          <Chip
            label={t("extrato.tipo_cashback", "Cashback & Retorno")}
            selected={filtroTipo === "cashback"}
            onClick={() => setFiltroTipo("cashback")}
            size="sm"
          />
        </div>
      </div>

      {/* Lista de Transações Paginada */}
      {loading ? (
        <div className="space-y-2.5">
          <Skeleton height={56} rounded="xl" />
          <Skeleton height={56} rounded="xl" />
          <Skeleton height={56} rounded="xl" />
          <Skeleton height={56} rounded="xl" />
        </div>
      ) : lancamentosFiltrados.length === 0 ? (
        <EmptyState
          icon={Coins}
          title={t("extrato.vazio_titulo", "Nenhuma movimentação registrada")}
          description={t("extrato.vazio_desc", "Seus ganhos e saídas em estudos, pacotes e obras aparecerão aqui de forma transparente.")}
          actionLabel={t("extrato.atualizar", "Atualizar Extrato")}
          onAction={carregarDados}
        />
      ) : (
        <div className="space-y-2">
          {lancamentosFiltrados.slice(0, itensVisiveis).map((item) => {
            const isGanho = item.tipo === "ganho" || item.tipo === "cashback";
            const valorAbs = Math.abs(item.valor);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] flex items-center justify-between gap-3 hover:border-[var(--app-primary)]/40 transition"
              >
                {/* Ícone de Tipo */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      item.tipo === "ganho"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : item.tipo === "cashback"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {item.tipo === "ganho" ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : item.tipo === "cashback" ? (
                      <Sparkles className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>

                  {/* Detalhes Textuais */}
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[var(--app-text)] truncate">
                      {item.descricao || `Movimentação de ${item.origem}`}
                    </div>
                    <div className="text-[11px] text-[var(--app-text-muted)] flex items-center gap-2 mt-0.5">
                      <span>{formatarData(item.criadoEm)}</span>
                      <span>•</span>
                      <span className="capitalize font-medium">{t("extrato.origem", "Origem")}: {item.origem}</span>
                    </div>
                  </div>
                </div>

                {/* Valor e Saldo Resultante */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-sm sm:text-base font-black font-mono ${
                      isGanho
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isGanho ? "+" : "-"}
                    {valorAbs}
                  </div>
                  <div className="text-[10px] text-[var(--app-text-muted)] font-mono">
                    {t("extrato.saldo", "Saldo")}: {item.saldoApos}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Botão de Paginação / Carregar Mais */}
          {itensVisiveis < lancamentosFiltrados.length && (
            <div className="pt-2 flex justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setItensVisiveis((prev) => prev + 15)}
                className="w-full sm:w-auto"
              >
                {t("extrato.carregar_mais", "Carregar Mais ({{restantes}} restantes)", {
                  restantes: lancamentosFiltrados.length - itensVisiveis,
                })}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
