import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Archive,
  Trash2,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowRight,
  BookOpen,
  Calendar,
  Gift,
  Zap,
  Info,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  NotificacaoItem,
  TipoNotificacao,
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  arquivarNotificacao,
  excluirNotificacao,
} from "../services/notificacoesService";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";

interface CentralNotificacoesViewProps {
  uid: string;
  onNavigateToRoute?: (route: string) => void;
  onOpenPreferences?: () => void;
}

export const CentralNotificacoesView: React.FC<CentralNotificacoesViewProps> = ({
  uid,
  onNavigateToRoute,
  onOpenPreferences,
}) => {
  const { t } = useTranslation();
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "nao_lidas">("todas");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | TipoNotificacao>("todos");

  const carregar = async () => {
    setLoading(true);
    try {
      const lista = await listarNotificacoes(uid);
      setNotificacoes(lista);
    } catch (err) {
      console.warn("Aviso ao carregar notificações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    const handleUpdate = () => {
      carregar();
    };
    window.addEventListener("brain_studio_notificacoes_updated", handleUpdate);
    return () => {
      window.removeEventListener("brain_studio_notificacoes_updated", handleUpdate);
    };
  }, [uid]);

  const handleMarcarLida = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await marcarComoLida(uid, id);
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const handleMarcarTodasLidas = async () => {
    await marcarTodasComoLidas(uid);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const handleArquivar = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await arquivarNotificacao(uid, id);
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleExcluir = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await excluirNotificacao(uid, id);
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleItemClick = async (item: NotificacaoItem) => {
    if (!item.lida) {
      await handleMarcarLida(item.id);
    }
    if (item.rotaDestino && onNavigateToRoute) {
      onNavigateToRoute(item.rotaDestino);
    }
  };

  // Filtragem da lista
  const filtradas = notificacoes.filter((item) => {
    if (filtroStatus === "nao_lidas" && item.lida) return false;
    if (filtroTipo !== "todos" && item.tipo !== filtroTipo) return false;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      return (
        item.titulo.toLowerCase().includes(q) ||
        item.corpo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Agrupamento cronológico (Hoje, Ontem, Esta Semana, Anteriores)
  const agora = Date.now();
  const umDia = 24 * 60 * 60 * 1000;
  const doisDias = 48 * 60 * 60 * 1000;
  const seteDias = 7 * umDia;

  const grupos: { titulo: string; itens: NotificacaoItem[] }[] = [];
  const hojeItens: NotificacaoItem[] = [];
  const ontemItens: NotificacaoItem[] = [];
  const semanaItens: NotificacaoItem[] = [];
  const anterioresItens: NotificacaoItem[] = [];

  for (const item of filtradas) {
    const diff = agora - new Date(item.recebidaEm || item.criadoEm).getTime();
    if (diff < umDia) {
      hojeItens.push(item);
    } else if (diff < doisDias) {
      ontemItens.push(item);
    } else if (diff < seteDias) {
      semanaItens.push(item);
    } else {
      anterioresItens.push(item);
    }
  }

  if (hojeItens.length > 0) grupos.push({ titulo: t("notificacoes.hoje", "Hoje"), itens: hojeItens });
  if (ontemItens.length > 0) grupos.push({ titulo: t("notificacoes.ontem", "Ontem"), itens: ontemItens });
  if (semanaItens.length > 0) grupos.push({ titulo: t("notificacoes.esta_semana", "Esta Semana"), itens: semanaItens });
  if (anterioresItens.length > 0) grupos.push({ titulo: t("notificacoes.anteriores", "Anteriores"), itens: anterioresItens });

  const getTipoIcon = (tipo: TipoNotificacao) => {
    switch (tipo) {
      case "missao":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "agenda":
      case "lembrete":
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case "bau":
        return <Gift className="w-4 h-4 text-purple-500" />;
      case "conexao":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-[var(--app-primary)]" />;
    }
  };

  const formatarHora = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="space-y-6">
      {/* Top Header com Botões de Ação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[var(--app-border)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[var(--app-primary)]" />
            {t("notificacoes.central_titulo", "Central de Notificações")}
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-black bg-[var(--app-primary)] text-white rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
            {t("notificacoes.central_desc", "Histórico de avisos de agenda, lembretes, missões e novidades acadêmicas.")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMarcarTodasLidas}
              className="flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              {t("notificacoes.marcar_todas_lidas", "Marcar todas como lidas")}
            </Button>
          )}

          {onOpenPreferences && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenPreferences}
              className="flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t("notificacoes.preferencias", "Preferências")}
            </Button>
          )}
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={t("notificacoes.buscar_placeholder", "Pesquisar nas notificações...")}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] placeholder-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/50 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Chip
            label={t("notificacoes.filtro_todas", "Todas")}
            selected={filtroStatus === "todas" && filtroTipo === "todos"}
            onClick={() => {
              setFiltroStatus("todas");
              setFiltroTipo("todos");
            }}
            size="sm"
          />
          <Chip
            label={t("notificacoes.filtro_nao_lidas", "Não lidas")}
            selected={filtroStatus === "nao_lidas"}
            onClick={() => setFiltroStatus("nao_lidas")}
            size="sm"
          />
          <Chip
            label={t("notificacoes.tipo_missao", "Missões")}
            selected={filtroTipo === "missao"}
            onClick={() => setFiltroTipo(filtroTipo === "missao" ? "todos" : "missao")}
            size="sm"
          />
          <Chip
            label={t("notificacoes.tipo_agenda", "Agenda & Prazos")}
            selected={filtroTipo === "agenda" || filtroTipo === "lembrete"}
            onClick={() => setFiltroTipo(filtroTipo === "agenda" ? "todos" : "agenda")}
            size="sm"
          />
          <Chip
            label={t("notificacoes.tipo_bau", "Baús & Equipes")}
            selected={filtroTipo === "bau"}
            onClick={() => setFiltroTipo(filtroTipo === "bau" ? "todos" : "bau")}
            size="sm"
          />
        </div>
      </div>

      {/* Conteúdo com Agrupamento por Dia */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton height={64} rounded="xl" />
          <Skeleton height={64} rounded="xl" />
          <Skeleton height={64} rounded="xl" />
        </div>
      ) : grupos.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t("notificacoes.vazio_titulo", "Tudo em dia por aqui!")}
          description={t("notificacoes.vazio_desc", "Nenhuma notificação pendente encontrada com os filtros atuais.")}
          actionLabel={t("notificacoes.atualizar", "Atualizar")}
          onAction={carregar}
        />
      ) : (
        <div className="space-y-6">
          {grupos.map((grupo) => (
            <div key={grupo.titulo} className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] px-1">
                {grupo.titulo}
              </h3>

              <div className="space-y-2">
                {grupo.itens.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                      !item.lida
                        ? "bg-[var(--app-card)] border-[var(--app-primary)]/40 shadow-xs ring-1 ring-[var(--app-primary)]/10"
                        : "bg-[var(--app-card)]/70 border-[var(--app-border)] opacity-85 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-[var(--app-card-secondary)] flex items-center justify-center shrink-0 mt-0.5">
                        {getTipoIcon(item.tipo)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[var(--app-text)] leading-snug">
                            {item.titulo}
                          </h4>
                          {!item.lida && (
                            <span className="w-2 h-2 rounded-full bg-[var(--app-primary)] shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-[var(--app-text-muted)] mt-1 leading-relaxed line-clamp-2">
                          {item.corpo}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--app-text-muted)] font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatarHora(item.recebidaEm || item.criadoEm)}
                          </span>
                          {item.rotaDestino && (
                            <span className="text-[var(--app-primary)] font-bold flex items-center gap-0.5">
                              {t("notificacoes.abrir", "Abrir")}
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação no Item */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!item.lida && (
                        <button
                          type="button"
                          onClick={(e) => handleMarcarLida(item.id, e)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--app-text-muted)] hover:text-emerald-600 hover:bg-emerald-500/10 transition"
                          title={t("notificacoes.marcar_lida", "Marcar como lida")}
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleArquivar(item.id, e)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--app-text-muted)] hover:text-blue-600 hover:bg-blue-500/10 transition"
                        title={t("notificacoes.arquivar", "Arquivar")}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleExcluir(item.id, e)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--app-text-muted)] hover:text-rose-600 hover:bg-rose-500/10 transition"
                        title={t("notificacoes.excluir", "Excluir")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
