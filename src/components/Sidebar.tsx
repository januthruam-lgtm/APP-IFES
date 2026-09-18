import React from "react";
import {
  LayoutDashboard,
  Brain,
  GitBranch,
  Gamepad2,
  Users,
  Building2,
  ShoppingBag,
  LogOut,
  Zap,
  RefreshCw,
  Sparkles,
  Layers,
  Database,
  Wifi,
  Settings,
  User,
  BookMarked,
  Palette,
  Wand2,
  ListTodo,
  Calendar,
  Timer,
  Video,
  GraduationCap,
} from "lucide-react";
import { UserProfile, CustomThemeColors } from "../types";
import { getPetStageInfo } from "../utils/petEvolution";
import { PuppetPetView } from "./PuppetPetView";
import { PWAInstallButton } from "./PWAInstallButton";
import { BrandLogoBanner } from "./BrandLogoBanner";

export type TabId =
  | "dashboard"
  | "lumina"
  | "sequence"
  | "tasks"
  | "agenda"
  | "flashcards"
  | "study_methods"
  | "study_room"
  | "games"
  | "teams"
  | "ifes"
  | "qacademico"
  | "store"
  | "library"
  | "theme";

interface SidebarProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  user: UserProfile;
  onLogout: () => void;
  onQuickSyncCourses?: () => void;
  onOpenOfflineModal?: () => void;
  onOpenProfileSettings?: () => void;
  isOnline?: boolean;
  currentTheme?: CustomThemeColors;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  user,
  onLogout,
  onQuickSyncCourses,
  onOpenOfflineModal,
  onOpenProfileSettings,
  isOnline = true,
}) => {
  const navSections = [
    {
      title: "Lock-In & Produtividade",
      items: [
        {
          id: "tasks" as TabId,
          label: "Organizador de Tarefas",
          icon: ListTodo,
          badge: "Foco",
          badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        },
        {
          id: "agenda" as TabId,
          label: "Agenda Compartilhada",
          icon: Calendar,
        },
        {
          id: "study_methods" as TabId,
          label: "Métodos de Estudo",
          icon: Timer,
        },
        {
          id: "flashcards" as TabId,
          label: "Flashcards Anki",
          icon: Layers,
        },
        {
          id: "study_room" as TabId,
          label: "Grupo de Estudos Virtual",
          icon: Video,
          badge: "Ao Vivo",
          badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        },
      ],
    },
    {
      title: "Acadêmico IFES",
      items: [
        {
          id: "ifes" as TabId,
          label: "AVA Moodle IFES",
          badge: user.ifesAccount?.connected ? "Sincronizado" : "Conectar",
          badgeColor: user.ifesAccount?.connected
            ? "text-emerald-700 bg-emerald-100 border-emerald-300"
            : "text-amber-700 bg-amber-100 border-amber-300",
          icon: Building2,
        },
        {
          id: "qacademico" as TabId,
          label: "Q-Acadêmico IFES",
          badge: user.qacademicoAccount?.connected ? "Sincronizado" : "Boletim",
          badgeColor: user.qacademicoAccount?.connected
            ? "text-blue-700 bg-blue-100 border-blue-300"
            : "text-neutral-700 bg-neutral-100 border-neutral-300",
          icon: GraduationCap,
        },
        {
          id: "sequence" as TabId,
          label: "Minhas Disciplinas",
          icon: GitBranch,
        },
        {
          id: "dashboard" as TabId,
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Aprendizado & IA",
      items: [
        {
          id: "lumina" as TabId,
          label: "Lumina IA",
          icon: Brain,
          highlight: true,
          badge: "Tutora IA",
          badgeColor: "text-[var(--app-primary)] bg-[var(--app-primary)]/10 border-[var(--app-primary)]/20",
        },
        {
          id: "games" as TabId,
          label: "Simulados 10Q",
          icon: Gamepad2,
        },
        {
          id: "library" as TabId,
          label: "Biblioteca & Acervo",
          icon: BookMarked,
        },
      ],
    },
    {
      title: "Comunidade & Customização",
      items: [
        {
          id: "teams" as TabId,
          label: "Equipes & Batalhas",
          icon: Users,
        },
        {
          id: "store" as TabId,
          label: "Loja de Pets",
          icon: ShoppingBag,
          badge: `${user.coins ?? 0} 🪙`,
          badgeColor: "text-emerald-700 bg-emerald-100 border-emerald-300",
        },
        {
          id: "theme" as TabId,
          label: "Menu de Cores",
          icon: Palette,
        },
      ],
    },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-72 bg-[var(--app-card)] text-[var(--app-text)] flex flex-col justify-between p-5 hidden md:flex border-r border-[var(--app-border)] select-none z-30 shrink-0 relative shadow-sm"
    >
      <div className="space-y-4">
        {/* Brand Header with Logo Banner */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--app-primary)] font-black">
                IFES CEFOR
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            <button
              onClick={onOpenProfileSettings}
              className="w-7 h-7 rounded-lg bg-[var(--app-bg)] hover:bg-[var(--app-primary)]/10 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition flex items-center justify-center border border-[var(--app-border)] cursor-pointer"
              title="Configurações e Perfil do Aluno"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <BrandLogoBanner compact className="w-full" />
        </div>

        {/* User Mini Profile Card with Pet */}
        <div
          onClick={onOpenProfileSettings}
          className="p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-2.5 cursor-pointer hover:border-[var(--app-primary)]/40 transition group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--app-primary)] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate text-[var(--app-text)] group-hover:text-[var(--app-primary)] transition">
                  {user.name}
                </h4>
                <p className="text-[10px] font-mono text-[var(--app-text-muted)] truncate">
                  {user.ifesAccount?.matricula || "20241IFES0482"}
                </p>
              </div>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                onTabChange("store");
              }}
              title="Abrir Loja de Pets & Upgrades"
              className="hover:scale-110 transition cursor-pointer"
            >
              <PuppetPetView
                pet={user.pet}
                size="sm"
                interactive={false}
                className="w-9 h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--app-border)]">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[var(--app-primary)] fill-[var(--app-primary)]" />
              <span className="text-[11px] font-mono font-bold text-[var(--app-text)]">
                {user.energy}/{user.maxEnergy || 50} ⚡
              </span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[11px] font-mono font-black text-[var(--app-primary)]">
                {user.xp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] font-mono">
                {section.title}
              </span>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group cursor-pointer ${
                        isActive
                          ? "bg-[var(--app-primary)] text-white shadow-sm"
                          : "text-[var(--app-text)] hover:bg-[var(--app-bg)] hover:text-[var(--app-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition ${
                            isActive ? "text-white" : "text-[var(--app-text-muted)] group-hover:text-[var(--app-primary)]"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${
                            isActive ? "bg-white/20 text-white border-white/30" : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Offline status, PWA Install & Logout */}
      <div className="pt-3 border-t border-[var(--app-border)] space-y-2.5">
        <PWAInstallButton variant="sidebar" />

        <div className="flex items-center justify-between text-[11px] px-2 text-[var(--app-text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span>{isOnline ? "Conectado IFES" : "Modo Offline"}</span>
          </div>
          <span className="font-mono text-[10px]">v3.2</span>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
};
