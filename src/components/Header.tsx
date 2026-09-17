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
      category: "Maiêutica Socrática",
      title: "Lumina IA",
      subtitle: "Desenvolva e 'dê à luz' suas próprias conclusões através de perguntas",
    },
    sequence: {
      category: "Catálogo Acadêmico IFES",
      title: "Minhas Disciplinas AVA",
      subtitle: "Trilhas socráticas, exclusão e importação direta do AVA",
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
      subtitle: "Documentos, planos de ensino, ementas e diálogos socráticos salvos",
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
                  <Sparkles className="w-3 h-3" /> Maiêutica Ativa
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
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs flex flex-col">
          <div className="bg-[var(--app-card)] text-[var(--app-text)] p-6 rounded-b-3xl border-b border-[var(--app-border)] shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[var(--app-primary)] rounded-full" />
                <span className="font-black text-base uppercase tracking-tight">
                  Brain Studio IFES
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <BrandLogoBanner compact className="w-full" />

            <div className="w-full">
              <PWAInstallButton variant="sidebar" />
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                      active
                        ? "bg-[var(--app-primary)] text-white shadow-sm"
                        : "bg-[var(--app-bg)] text-[var(--app-text)] border border-[var(--app-border)]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
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
                className="w-full py-2.5 bg-[var(--app-bg)] hover:bg-[var(--app-primary)]/10 text-[var(--app-text)] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-[var(--app-border)] cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                <span>Editar Matrícula & Perfil</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-red-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Fazer Logout (Sair da Conta)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
