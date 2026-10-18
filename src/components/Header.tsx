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
  Eye,
  Globe,
} from "lucide-react";
import { TabId } from "./Sidebar";
import { UserProfile, CustomThemeColors } from "../types";
import { NativeAppButton } from "./NativeAppButton";
import { BrandLogoBanner } from "./BrandLogoBanner";
import { LanguageSelector } from "./LanguageSelector";
import { SettingsTabId } from "./SettingsModal";

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
  onOpenOnlineUsers?: () => void;
  onOpenAvaConnect?: () => void;
  onOpenSettings?: (initialTab?: SettingsTabId) => void;
  onOpenAccessibility?: () => void;
  onlineCount?: number;
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
  onOpenOnlineUsers,
  onOpenAvaConnect,
  onOpenSettings,
  onOpenAccessibility,
  onlineCount = 1,
  isOnline = true,
}) => {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.email || user.name || "user-id",
            userName: user.name,
            level: user.level,
            matricula: user.ifesAccount?.matricula || "",
            campus: user.ifesAccount?.campusName || "IFES",
          }),
        });
      } catch {
        // Offline heartbeat fallback
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [user.name, user.level, user.email, user.ifesAccount?.matricula, user.ifesAccount?.campusName]);

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

          {/* AVA IFES CONNECTION STATUS PILL */}
          {onOpenAvaConnect && (
            <button
              id="header-ava-status-pill"
              onClick={onOpenAvaConnect}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition group cursor-pointer border ${
                user.ifesAccount?.connected
                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse"
              }`}
              title={
                user.ifesAccount?.connected
                  ? `AVA IFES Conectado e Estável: ${user.ifesAccount?.campusName || "IFES"}. Clique para gerenciar.`
                  : "Conectar ao AVA IFES com suas credenciais."
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  user.ifesAccount?.connected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <Building2
                className={`w-3.5 h-3.5 ${
                  user.ifesAccount?.connected ? "text-emerald-500" : "text-amber-500"
                } group-hover:scale-110 transition-transform`}
              />
              <span className="hidden sm:inline font-mono">
                {user.ifesAccount?.connected ? "AVA IFES" : "Conectar AVA"}
              </span>
            </button>
          )}

          {/* REAL ONLINE USERS DRAWER TRIGGER */}
          {onOpenOnlineUsers && (
            <button
              id="header-online-users-btn"
              onClick={onOpenOnlineUsers}
              title="Ver colegas conectados"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border cursor-pointer bg-[var(--app-bg)] hover:bg-[var(--app-card)] text-[var(--app-text)] hover:text-emerald-500 border-[var(--app-border)] hover:border-emerald-500/40 group"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Users className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">{onlineCount} Online</span>
            </button>
          )}

          {/* ACCESSIBILITY TRIGGER */}
          {onOpenAccessibility && (
            <button
              id="header-accessibility-btn"
              onClick={onOpenAccessibility}
              title="Acessibilidade & Inclusão (WCAG AAA)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border cursor-pointer bg-[var(--app-bg)] hover:bg-[var(--app-card)] text-[var(--app-text)] hover:text-[var(--app-primary)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40 group"
            >
              <Eye className="w-3.5 h-3.5 text-[var(--app-primary)] group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline text-xs font-bold">Acessibilidade</span>
            </button>
          )}

          {/* LANGUAGE SELECTOR */}
          <div className="hidden md:flex items-center">
            <LanguageSelector variant="dropdown" />
          </div>

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

          {/* SETTINGS MODAL TRIGGER */}
          {onOpenSettings && (
            <button
              id="header-settings-btn"
              onClick={() => onOpenSettings("idioma")}
              title="Configurações do App"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition border cursor-pointer bg-[var(--app-bg)] hover:bg-[var(--app-card)] text-[var(--app-text)] hover:text-[var(--app-primary)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40 group"
            >
              <Settings className="w-3.5 h-3.5 text-[var(--app-primary)] group-hover:rotate-45 transition-transform" />
              <span className="hidden sm:inline text-xs font-bold">Configurações</span>
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
              <NativeAppButton variant="sidebar" />
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

            {/* Idioma no Mobile */}
            <div
              className="p-3 rounded-2xl border space-y-2"
              style={{
                backgroundColor: "var(--app-bg)",
                borderColor: "var(--app-border)",
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--app-text)" }}>
                <Globe className="w-4 h-4" style={{ color: "var(--app-primary)" }} />
                <span>Idioma do Aplicativo:</span>
              </div>
              <LanguageSelector variant="dropdown" className="w-full" />
            </div>

            {/* Configurações Gerais */}
            {onOpenSettings && (
              <button
                onClick={() => {
                  onOpenSettings("idioma");
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
                <span>Menu de Configurações do App</span>
              </button>
            )}

            {/* Inclusão & Acessibilidade */}
            {onOpenAccessibility && (
              <button
                onClick={() => {
                  onOpenAccessibility();
                  setMobileMenuOpen(false);
                }}
                style={{
                  backgroundColor: "var(--app-bg)",
                  color: "var(--app-text)",
                  borderColor: "var(--app-border)",
                }}
                className="w-full py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer active:scale-95 hover:brightness-110 shadow-xs"
              >
                <Eye className="w-4 h-4" style={{ color: "var(--app-primary)" }} />
                <span>Inclusão & Acessibilidade (WCAG AAA)</span>
              </button>
            )}

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
                <GraduationCap className="w-4 h-4" style={{ color: "var(--app-primary)" }} />
                <span>Editar Matrícula & Perfil IFES</span>
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
