import React, { useEffect } from "react";
import {
  Menu,
  X,
  Zap,
  Sparkles,
  Users,
  Building2,
  GitBranch,
  LayoutDashboard,
  Brain,
  Gamepad2,
  ShoppingBag,
  LogOut,
  Settings,
  BookMarked,
  Palette,
  ListTodo,
  Calendar,
  Layers,
  Timer,
  Video,
  Bell,
  GraduationCap,
} from "lucide-react";
import { TabId } from "./Sidebar";
import { UserProfile, CustomThemeColors } from "../types";
import { PWAInstallButton } from "./PWAInstallButton";
import { BrandLogoBanner } from "./BrandLogoBanner";

interface HeaderProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  user: UserProfile;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onLogout?: () => void;
  onRechargeEnergy?: () => void;
  onOpenOfflineModal?: () => void;
  onOpenProfileSettings?: () => void;
  onOpenNotificationSettings?: () => void;
  isOnline?: boolean;
  currentTheme?: CustomThemeColors;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  user,
  voiceEnabled,
  onToggleVoice,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
  onOpenOfflineModal,
  onOpenProfileSettings,
  onOpenNotificationSettings,
  isOnline = true,
}) => {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: user.name,
            level: user.level,
          }),
        });
      } catch {
        // Offline heartbeat fallback
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [user.name, user.level]);

  const titles: Record<TabId, { title: string; subtitle: string; category: string }> = {
    dashboard: {
      category: "Visão Geral",
      title: "Dashboard",
      subtitle: "Progresso acadêmico, horários e status das tarefas do AVA",
    },
    tasks: {
      category: "Produtividade & Foco",
      title: "Organizador de Tarefas",
      subtitle: "Estruture metas diárias, prioridades e entregas com lembretes",
    },
    agenda: {
      category: "Sincronização & Equipe",
      title: "Agenda Compartilhada",
      subtitle: "Provas bimestrais, trabalhos em grupo e sessões de estudo agendadas",
    },
    study_methods: {
      category: "Metodologias Científicas",
      title: "Central de Métodos de Estudo",
      subtitle: "Cronômetro Pomodoro, Técnica Feynman, Active Recall e Repetição Espaçada",
    },
    flashcards: {
      category: "Spaced Repetition SM-2",
      title: "Flashcards Estilo Anki",
      subtitle: "Fixação e revisão de fórmulas e conceitos por repetição espaçada",
    },
    study_room: {
      category: "Estudo Ao Vivo",
      title: "Grupo de Estudos Virtual",
      subtitle: "Vídeo, áudio, compartilhamento de tela e chat colaborativo com colegas",
    },
    lumina: {
      category: "Tutoria Inteligente",
      title: "Lumina IA",
      subtitle: "Aprofunde conceitos, tire dúvidas e revise matérias com tutoria personalizada",
    },
    sequence: {
      category: "Catálogo Acadêmico IFES",
      title: "Minhas Disciplinas AVA",
      subtitle: "Trilhas de disciplinas, organização e importação direta do AVA",
    },
    games: {
      category: "Simulados 10 Questões",
      title: "Desafios por Documento",
      subtitle: "Envie PDFs, apostilas ou temas e resolva 10 questões por prompt",
    },
    teams: {
      category: "Cooperação",
      title: "Equipes & Batalhas",
      subtitle: "Crie sua equipe, troque energias com companheiros e dispute duelos 1v1",
    },
    ifes: {
      category: "Ambiente Virtual",
      title: "AVA Moodle IFES",
      subtitle: "Sincronização de disciplinas, prazos e simulados com o Instituto Federal",
    },
    qacademico: {
      category: "Sistema Acadêmico Oficial",
      title: "Q-Acadêmico IFES",
      subtitle: "Boletim escolar, notas por etapa, histórico e grade horária de aulas",
    },
    store: {
      category: "Recompensas & Pets",
      title: "Loja de Pets & Upgrades",
      subtitle: "Alimente seu pet com XP e expanda permanentemente a energia da conta",
    },
    library: {
      category: "Acervo Digital",
      title: "Biblioteca de Estudos",
      subtitle: "Documentos, planos de ensino, ementas e anotações salvas",
    },
    theme: {
      category: "Identidade Visual",
      title: "Menu de Cores & Temas",
      subtitle: "Alterne paletas prontas ou ajuste os tons da interface instantaneamente",
    },
  };

  const navTabs = [
    { id: "tasks" as TabId, label: "Tarefas", icon: ListTodo },
    { id: "agenda" as TabId, label: "Agenda", icon: Calendar },
    { id: "study_methods" as TabId, label: "Métodos", icon: Timer },
    { id: "flashcards" as TabId, label: "Anki", icon: Layers },
    { id: "study_room" as TabId, label: "Sala Virtual", icon: Video },
    { id: "ifes" as TabId, label: "AVA IFES", icon: Building2 },
    { id: "qacademico" as TabId, label: "Q-Acadêmico", icon: GraduationCap },
    { id: "sequence" as TabId, label: "Disciplinas", icon: GitBranch },
    { id: "dashboard" as TabId, label: "Dashboard", icon: LayoutDashboard },
    { id: "lumina" as TabId, label: "Lumina IA", icon: Brain },
    { id: "games" as TabId, label: "10Q", icon: Gamepad2 },
    { id: "library" as TabId, label: "Biblioteca", icon: BookMarked },
    { id: "teams" as TabId, label: "Equipes", icon: Users },
    { id: "store" as TabId, label: "Loja Pets", icon: ShoppingBag },
    { id: "theme" as TabId, label: "Menu Cores", icon: Palette },
  ];

  const currentInfo = titles[currentTab] || titles.dashboard;

  return (
    <>
      <header
        id="app-header"
        className="bg-[var(--app-card)] border-b border-[var(--app-border)] px-3 sm:px-8 py-2.5 sm:py-3.5 flex justify-between items-center sticky top-0 z-40 text-[var(--app-text)] transition-colors shadow-xs"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] cursor-pointer"
            aria-label="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="uppercase text-[10px] tracking-widest text-[var(--app-primary)] font-extrabold">
                {currentInfo.category}
              </span>
              {currentTab === "lumina" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                  <Sparkles className="w-3 h-3" /> Tutoria Ativa
                </span>
              )}
            </div>
            <h3
              id="current-title"
              className="font-extrabold text-[var(--app-text)] text-base sm:text-lg tracking-tight leading-tight flex items-center gap-2 mt-0.5"
            >
              {currentInfo.title}
            </h3>
          </div>
        </div>

        {/* Top Status Pills - Apenas Energias e Notificação */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* ENERGY METER */}
          <button
            id="header-energy-pill"
            onClick={() => onTabChange("store")}
            className="flex items-center gap-1.5 bg-[var(--app-bg)] hover:bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-primary)]/40 hover:border-[var(--app-primary)] px-3 py-1.5 rounded-full text-xs font-bold transition group cursor-pointer"
            title={`Energia: ${user.energy}/${user.maxEnergy || 50} ⚡. Clique para recarregar.`}
          >
            <Zap className="w-3.5 h-3.5 text-[var(--app-primary)] fill-[var(--app-primary)] group-hover:scale-110 transition-transform" />
            <span className="font-mono font-bold text-[var(--app-primary)]">
              {user.energy}/{user.maxEnergy || 50}
            </span>
          </button>

          {/* NOTIFICATION SETTINGS TRIGGER */}
          {onOpenNotificationSettings && (
            <button
              id="header-notifications-btn"
              onClick={onOpenNotificationSettings}
              title="Notificações & Alertas"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border cursor-pointer bg-[var(--app-bg)] hover:bg-[var(--app-card)] text-[var(--app-text)] hover:text-[var(--app-primary)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40 group"
            >
              <Bell className="w-3.5 h-3.5 text-[var(--app-primary)] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold">Notificações</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 z-50 md:hidden backdrop-blur-md flex flex-col justify-end sm:justify-start transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl sm:rounded-b-3xl border-t sm:border shadow-2xl p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--app-card)",
              color: "var(--app-text)",
              borderColor: "var(--app-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Apenas a Logo do app e o botão fechar X */}
            <div
              className="flex justify-between items-center pb-3 border-b"
              style={{ borderColor: "var(--app-border)" }}
            >
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-9 w-auto object-contain rounded-lg shadow-sm"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = "none";
                  }}
                />
                <span
                  className="text-xs font-black tracking-wider uppercase font-mono"
                  style={{ color: "var(--app-primary)" }}
                >
                  Navegação
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl cursor-pointer border active:scale-95 transition"
                style={{
                  backgroundColor: "var(--app-bg)",
                  color: "var(--app-text)",
                  borderColor: "var(--app-border)",
                }}
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full">
              <PWAInstallButton variant="sidebar" />
            </div>

            {/* Grid dos botões: todos visíveis com excelente contraste e cores do tema */}
            <div className="grid grid-cols-2 gap-2.5">
              {navTabs.map((t) => {
                const Icon = t.icon;
                const active = currentTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onTabChange(t.id);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      backgroundColor: active
                        ? "var(--app-primary)"
                        : "var(--app-bg)",
                      color: active ? "var(--btn-primary-text)" : "var(--app-text)",
                      borderColor: active
                        ? "var(--app-primary)"
                        : "var(--app-border)",
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-extrabold transition-all select-none cursor-pointer border shadow-sm active:scale-95 ${
                      active ? "shadow-md ring-2 ring-[var(--app-primary)]/40" : "hover:brightness-110"
                    }`}
                  >
                    <Icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: active ? "var(--btn-primary-text)" : "var(--app-primary)" }}
                    />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {onOpenProfileSettings && (
              <button
                onClick={() => {
                  onOpenProfileSettings();
                  setMobileMenuOpen(false);
                }}
                style={{
                  backgroundColor: "var(--app-bg)",
                  color: "var(--app-text)",
                  borderColor: "var(--app-border)",
                }}
                className="w-full py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer active:scale-95 hover:brightness-110 shadow-xs"
              >
                <Settings className="w-4 h-4" style={{ color: "var(--app-primary)" }} />
                <span>Editar Matrícula & Perfil</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-red-500/15 hover:bg-red-500/25 text-red-500 dark:text-red-400 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border border-red-500/30 cursor-pointer active:scale-95 shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Fazer Logout (Sair da Conta)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
