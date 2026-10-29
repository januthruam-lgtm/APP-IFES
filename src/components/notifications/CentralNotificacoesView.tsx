import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  Trophy,
  Users,
  Sparkles,
  Flame,
  BarChart2,
  Settings,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sliders,
  Calendar,
} from "lucide-react";
import {
  NotificationItem,
  NotificationSettings,
  TipoNotificacao,
  obterConfiguracoesNotificacao,
  salvarConfiguracoesNotificacao,
  escutarNotificacoes,
  marcarNotificacaoComoLida,
  marcarTodasComoLidas,
  limparNotificacoesLidas,
} from "../../services/notificationService";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { Switch } from "../ui/Switch";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";

interface CentralNotificacoesViewProps {
  uid: string;
  onNavigateToTab?: (tab: string, subView?: string) => void;
  onBack?: () => void;
}

export const CentralNotificacoesView: React.FC<CentralNotificacoesViewProps> = ({
  uid,
  onNavigateToTab,
  onBack,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<"feed" | "preferencias">("feed");
  const [notificacoes, setNotificacoes] = useState<NotificationItem[]>([]);
  const [config, setConfig] = useState<NotificationSettings>(obterConfiguracoesNotificacao(uid));
  const [filtroTipo, setFiltroTipo] = useState<"todas" | "nao_lidas" | TipoNotificacao>("todas");
  const [loading, setLoading] = useState(false);
  const [salvandoConfig, setSalvandoConfig] = useState(false);
  const [avisoSalvo, setAvisoSalvo] = useState(false);

  useEffect(() => {
    const unsub = escutarNotificacoes(uid, (items) => {
      setNotificacoes(items);
    });
    return () => unsub();
  }, [uid]);

  const naoLidasCount = notificacoes.filter((n) => !n.lida).length;

  const handleUpdateConfig = async (patch: Partial<NotificationSettings>) => {
    const nova = { ...config, ...patch };
    setConfig(nova);
    setSalvandoConfig(true);
    await salvarConfiguracoesNotificacao(uid, nova);
    setSalvandoConfig(false);
    setAvisoSalvo(true);
    setTimeout(() => setAvisoSalvo(false), 2000);
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.lida) {
      await marcarNotificacaoComoLida(uid, item.id);
    }
    if (item.linkTab && onNavigateToTab) {
      onNavigateToTab(item.linkTab, item.linkSubView);
    }
  };

  const handleMarcarTodas = async () => {
    await marcarTodasComoLidas(uid);
  };

  const handleLimparLidas = async () => {
    await limparNotificacoesLidas(uid);
  };

  const notificacoesFiltradas = notificacoes.filter((item) => {
    if (filtroTipo === "todas") return true;
    if (filtroTipo === "nao_lidas") return !item.lida;
    return item.tipo === filtroTipo;
  });

  const getIconForType = (tipo: TipoNotificacao) => {
    switch (tipo) {
      case "prazo":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "conquista":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "equipe":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "pet":
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case "ofensiva":
        return <Flame className="w-5 h-5 text-orange-500" />;
      case "resumo_semanal":
        return <BarChart2 className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatarHora = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("pt-BR", {
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[var(--app-border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)] flex items-center gap-2">
                Central de Notificações
                {naoLidasCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--app-primary)] text-white text-xs font-bold font-mono">
                    {naoLidasCount}
                  </span>
                )}
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Prazos de entrega, lembretes de ofensiva, conquistas e avisos acadêmicos.
              </p>
            </div>
          </div>
        </div>

        {/* Alternador de Modo: Feed vs Configurações */}
        <div className="flex items-center gap-2 bg-[var(--app-card)] p-1 rounded-2xl border border-[var(--app-border)] shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setAbaAtiva("feed")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              abaAtiva === "feed"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Notificações
          </button>
          <button
            type="button"
            onClick={() => setAbaAtiva("preferencias")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              abaAtiva === "preferencias"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Preferências
          </button>
        </div>
      </div>

      {/* ABA 1: FEED DE NOTIFICAÇÕES */}
      {abaAtiva === "feed" && (
        <div className="space-y-4">
          {/* Barra de Ações Rápidas & Filtros */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Chips de Filtro */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              <Chip
                label={`Todas (${notificacoes.length})`}
                selected={filtroTipo === "todas"}
                onClick={() => setFiltroTipo("todas")}
                size="sm"
              />
              <Chip
                label={`Não lidas (${naoLidasCount})`}
                selected={filtroTipo === "nao_lidas"}
                onClick={() => setFiltroTipo("nao_lidas")}
                size="sm"
              />
              <Chip
                label="Prazos"
                selected={filtroTipo === "prazo"}
                onClick={() => setFiltroTipo("prazo")}
                size="sm"
              />
              <Chip
                label="Conquistas"
                selected={filtroTipo === "conquista"}
                onClick={() => setFiltroTipo("conquista")}
                size="sm"
              />
              <Chip
                label="Equipes"
                selected={filtroTipo === "equipe"}
                onClick={() => setFiltroTipo("equipe")}
                size="sm"
              />
            </div>

            {/* Ações: Marcar lidas e Limpar */}
            <div className="flex items-center gap-2 shrink-0">
              {naoLidasCount > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleMarcarTodas}
                  className="flex items-center gap-1.5"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-4 h-4 text-[var(--app-primary)]" />
                  Marcar lidas
                </Button>
              )}
              {notificacoes.some((n) => n.lida) && (
                <Button
                  variant="text"
                  size="sm"
                  onClick={handleLimparLidas}
                  className="flex items-center gap-1 text-[var(--app-text-muted)] hover:text-rose-600"
                  title="Remover notificações lidas"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar lidas
                </Button>
              )}
            </div>
          </div>

          {/* Lista de Notificações */}
          {notificacoesFiltradas.length === 0 ? (
            <EmptyState
              icon={BellOff}
              title="Tudo limpo por aqui!"
              description={
                filtroTipo === "nao_lidas"
                  ? "Você leu todas as notificações recentes."
                  : "Nenhuma notificação encontrada nesta categoria."
              }
              actionLabel="Ver Todas"
              onAction={() => setFiltroTipo("todas")}
            />
          ) : (
            <div className="space-y-2">
              {notificacoesFiltradas.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 group ${
                    !item.lida
                      ? "bg-[var(--app-card)] border-[var(--app-primary)]/50 ring-1 ring-[var(--app-primary)]/20 shadow-xs"
                      : "bg-[var(--app-card)]/60 border-[var(--app-border)] opacity-85 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[var(--app-card-secondary)] flex items-center justify-center shrink-0 mt-0.5">
                      {getIconForType(item.tipo)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[var(--app-text)] leading-snug">
                          {item.titulo}
                        </h4>
                        {!item.lida && (
                          <span className="w-2 h-2 rounded-full bg-[var(--app-primary)] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--app-text-muted)] mt-1 line-clamp-2">
                        {item.mensagem}
                      </p>
                      <div className="text-[10px] text-[var(--app-text-muted)] mt-2 flex items-center gap-2">
                        <span>{formatarHora(item.criadoEm)}</span>
                        {item.linkTab && (
                          <span className="text-[var(--app-primary)] font-semibold flex items-center gap-0.5 group-hover:underline">
                            Ver detalhes <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!item.lida && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        marcarNotificacaoComoLida(uid, item.id);
                      }}
                      className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-card-secondary)] transition shrink-0"
                      title="Marcar como lida"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: PREFERÊNCIAS E CONTROLE PELO USUÁRIO (4.3) */}
      {abaAtiva === "preferencias" && (
        <div className="space-y-4">
          {avisoSalvo && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Preferências de notificação salvas com sucesso!</span>
            </div>
          )}

          {/* Master Switch: Não Perturbe */}
          <Card variant="default" padding="md" className="space-y-2 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <BellOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--app-text)]">Modo Não Perturbe</h3>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    Silencia instantaneamente todas as notificações e lembretes sonoros.
                  </p>
                </div>
              </div>
              <Switch
                checked={config.silenciarTudo}
                onChange={(checked) => handleUpdateConfig({ silenciarTudo: checked })}
              />
            </div>
          </Card>

          {/* Controle Individual por Tipo (4.2 e 4.3) */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-sm font-black text-[var(--app-text)] uppercase tracking-wider text-[11px] text-[var(--app-text-muted)]">
              Gatilhos de Notificação Permitidos
            </h3>

            {/* Prazos 24h */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[var(--app-text)]">Prazos de Entrega: 24h antes</div>
                  <div className="text-[11px] text-[var(--app-text-muted)]">Aviso antecipado de tarefas e trabalhos acadêmicos</div>
                </div>
              </div>
              <Switch
                checked={config.prazo24h}
                disabled={config.silenciarTudo}
                onChange={(checked) => handleUpdateConfig({ prazo24h: checked })}
              />
            </div>

            {/* Prazos 1h */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[var(--app-text)]">Prazos Urgentes: 1h antes</div>
                  <div className="text-[11px] text-[var(--app-text-muted)]">Último aviso antes do fechamento de tarefas e simulados</div>
                </div>
              </div>
              <Switch
                checked={config.prazo1h}
                disabled={config.silenciarTudo}
                onChange={(checked) => handleUpdateConfig({ prazo1h: checked })}
              />
            </div>

            {/* Conquistas */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[var(--app-text)]">Conquistas & Obras da Cidade</div>
                  <div className="text-[11px] text-[var(--app-text-muted)]">Avisos ao desbloquear novos títulos, medalhas e construções</div>
                </div>
              </div>
              <Switch
                checked={config.conquistas}
                disabled={config.silenciarTudo}
                onChange={(checked) => handleUpdateConfig({ conquistas: checked })}
              />
            </div>

            {/* Equipe */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[var(--app-text)]">Mensagens da Equipe & Batalhas</div>
                  <div className="text-[11px] text-[var(--app-text-muted)]">Avisos de novas mensagens e bônus no baú cooperativo</div>
                </div>
              </div>
              <Switch
                checked={config.equipe}
                disabled={config.silenciarTudo}
                onChange={(checked) => handleUpdateConfig({ equipe: checked })}
              />
            </div>

            {/* Pet Evolução */}
            <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[var(--app-text)]">Evolução do Mascote Pet</div>
                  <div className="text-[11px] text-[var(--app-text-muted)]">Quando seu mascote 3D sobe de nível ou desbloqueia acessórios</div>
                </div>
              </div>
              <Switch
                checked={config.petEvolucao}
                disabled={config.silenciarTudo}
                onChange={(checked) => handleUpdateConfig({ petEvolucao: checked })}
              />
            </div>

            {/* Lembrete de Ofensiva + Horário Personalizado */}
            <div className="py-2 border-b border-[var(--app-border)] space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[var(--app-text)]">Lembrete de Ofensiva Diária</div>
                    <div className="text-[11px] text-[var(--app-text-muted)]">Protege seus dias consecutivos de estudo</div>
                  </div>
                </div>
                <Switch
                  checked={config.lembreteOfensiva}
                  disabled={config.silenciarTudo}
                  onChange={(checked) => handleUpdateConfig({ lembreteOfensiva: checked })}
                />
              </div>

              {config.lembreteOfensiva && (
                <div className="pl-8 pt-1 flex items-center gap-3">
                  <span className="text-xs font-semibold text-[var(--app-text-muted)]">Horário do Lembrete:</span>
                  <input
                    type="time"
                    value={config.horarioOfensiva}
                    disabled={config.silenciarTudo}
                    onChange={(e) => handleUpdateConfig({ horarioOfensiva: e.target.value })}
                    className="px-3 py-1.5 rounded-xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-xs font-bold font-mono text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                  />
                </div>
              )}
            </div>

            {/* Resumo Semanal */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[var(--app-text)]">Resumo Semanal de Estudos</div>
                  <div className="text-[11px] text-[var(--app-text-muted)]">Enviado aos domingos à noite com seu progresso e XP</div>
                </div>
              </div>
              <Switch
                checked={config.resumoSemanal}
                disabled={config.silenciarTudo}
                onChange={(checked) => handleUpdateConfig({ resumoSemanal: checked })}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
