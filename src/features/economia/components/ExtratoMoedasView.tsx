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
import {
  carregarExtrato,
  auditarExtrato,
  reconciliarSaldoExtrato,
  garantirSaldoInicialExtrato,
  LancamentoExtrato,
  TipoLancamento,
} from "../services/extratoService";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";

interface ExtratoMoedasViewProps {
  uid: string;
  saldoAtual: number;
  onSaldoAtualizado?: (novoSaldo: number) => void;
  onClose?: () => void;
}

export const ExtratoMoedasView: React.FC<ExtratoMoedasViewProps> = ({
  uid,
  saldoAtual,
  onSaldoAtualizado,
  onClose,
}) => {
  const [lancamentos, setLancamentos] = useState<LancamentoExtrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoLancamento>("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<"tudo" | "7d" | "30d">("tudo");
  const [isReconciliando, setIsReconciliando] = useState(false);
  const [resultadoAuditoria, setResultadoAuditoria] = useState<{
    auditado: boolean;
    valido: boolean;
    mensagem: string;
    diferenca?: number;
  } | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      if (saldoAtual > 0) {
        await garantirSaldoInicialExtrato(uid, saldoAtual);
      }
      const lista = await carregarExtrato(uid, 100);
      setLancamentos(lista);
    } catch (err) {
      console.error("Erro ao carregar extrato:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [uid]);

  const handleAuditar = async () => {
    const res = await auditarExtrato(uid, saldoAtual);
    setResultadoAuditoria({
      auditado: true,
      valido: res.valido,
      diferenca: res.diferenca,
      mensagem: res.valido
        ? "Seu livro-razão está 100% equilibrado e verificado!"
        : `Divergência detectada: ${Math.abs(res.diferenca)} moedas de diferença contábil.`,
    });
  };

  const handleReconciliar = async () => {
    setIsReconciliando(true);
    try {
      const res = await reconciliarSaldoExtrato(uid, saldoAtual);
      if (res.corrigido) {
        if (onSaldoAtualizado) onSaldoAtualizado(res.novoSaldo);
        setResultadoAuditoria({
          auditado: true,
          valido: true,
          mensagem: `Saldo reconciliado com sucesso para ${res.novoSaldo} moedas!`,
        });
        await carregarDados();
      }
    } catch (err) {
      console.error("Erro ao reconciliar:", err);
    } finally {
      setIsReconciliando(false);
    }
  };

  // Filtragem da lista por Tipo e Período (7 dias, 30 dias, tudo)
  const lancamentosFiltrados = lancamentos.filter((item) => {
    if (filtroTipo !== "todos" && item.tipo !== filtroTipo) return false;

    if (filtroPeriodo !== "tudo") {
      const itemTime = new Date(item.criadoEm).getTime();
      const now = Date.now();
      const maxAgeMs = filtroPeriodo === "7d" ? 7 * 86400000 : 30 * 86400000;
      if (now - itemTime > maxAgeMs) return false;
    }

    return true;
  });

  // Métricas do período
  const totalGanhos = lancamentos
    .filter((l) => l.tipo === "ganho")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalGastos = lancamentos
    .filter((l) => l.tipo === "gasto")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalCashback = lancamentos
    .filter((l) => l.tipo === "cashback")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const formatarData = (isoStr: string) => {
    try {
      const data = new Date(isoStr);
      return data.toLocaleDateString("pt-BR", {
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
            Transparência contábil total: histórico de ganhos, gastos, cofre e auditoria.
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
          className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            resultadoAuditoria.valido
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>{resultadoAuditoria.mensagem}</span>
          </div>
          {!resultadoAuditoria.valido && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleReconciliar}
              disabled={isReconciliando}
              className="shrink-0"
            >
              {isReconciliando ? "Reconciliando..." : "Corrigir e Reconciliar Agora"}
            </Button>
          )}
        </div>
      )}

      {/* Cartões de Indicadores Contábeis */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card variant="default" padding="sm" className="flex flex-col">
          <span className="text-[11px] text-[var(--app-text-muted)] font-medium">Saldo Atual</span>
          <div className="text-xl sm:text-2xl font-black text-amber-500 flex items-center gap-1 mt-1">
            <Coins className="w-5 h-5" />
            {saldoAtual}
          </div>
        </Card>

        <Card variant="default" padding="sm" className="flex flex-col">
          <span className="text-[11px] text-[var(--app-text-muted)] font-medium">Entradas</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-5 h-5" />
            +{totalGanhos}
          </div>
        </Card>

        <Card variant="default" padding="sm" className="flex flex-col">
          <span className="text-[11px] text-[var(--app-text-muted)] font-medium">Saídas</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
            <ArrowDownLeft className="w-5 h-5" />
            -{totalGastos}
          </div>
        </Card>

        <Card variant="default" padding="sm" className="flex flex-col">
          <span className="text-[11px] text-[var(--app-text-muted)] font-medium">Cashback / Retorno</span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
            <Sparkles className="w-5 h-5" />
            +{totalCashback}
          </div>
        </Card>
      </div>

      {/* Controles de Filtros: Tipo e Período (7 dias, 30 dias, tudo) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        {/* Filtros de Tipo */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
          <Chip
            label="Todos"
            selected={filtroTipo === "todos"}
            onClick={() => setFiltroTipo("todos")}
            size="sm"
          />
          <Chip
            label="Ganhos (+)"
            selected={filtroTipo === "ganho"}
            onClick={() => setFiltroTipo("ganho")}
            size="sm"
          />
          <Chip
            label="Gastos (-)"
            selected={filtroTipo === "gasto"}
            onClick={() => setFiltroTipo("gasto")}
            size="sm"
          />
          <Chip
            label="Cashback"
            selected={filtroTipo === "cashback"}
            onClick={() => setFiltroTipo("cashback")}
            size="sm"
          />
        </div>

        {/* Filtros de Período (7 dias, 30 dias, tudo) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[var(--app-text-muted)]" />
          <Chip
            label="7 dias"
            selected={filtroPeriodo === "7d"}
            onClick={() => setFiltroPeriodo("7d")}
            size="sm"
          />
          <Chip
            label="30 dias"
            selected={filtroPeriodo === "30d"}
            onClick={() => setFiltroPeriodo("30d")}
            size="sm"
          />
          <Chip
            label="Tudo"
            selected={filtroPeriodo === "tudo"}
            onClick={() => setFiltroPeriodo("tudo")}
            size="sm"
          />
        </div>
      </div>

      {/* Lista de Transações */}
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
          title="Nenhuma movimentação registrada"
          description="Seus ganhos e gastos em estudos e obras aparecerão aqui de forma transparente."
          actionLabel="Atualizar Extrato"
          onAction={carregarDados}
        />
      ) : (
        <div className="space-y-2">
          {lancamentosFiltrados.map((item) => {
            const isGanho = item.tipo === "ganho" || item.tipo === "cashback";
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
                      <span className="capitalize font-medium">Origem: {item.origem}</span>
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
                    {item.valor}
                  </div>
                  <div className="text-[10px] text-[var(--app-text-muted)] font-mono">
                    Saldo: {item.saldoApos}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
