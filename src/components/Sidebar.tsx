import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  Sparkles,
  Layers,
  Settings,
  ListTodo,
  Calendar,
  Timer,
  Video,
  Eye,
  Sun,
  Moon,
  Bell,
  X,
  BookOpen,
  BookMarked,
  Plus,
} from "lucide-react";
import { UserProfile, CustomThemeColors } from "../types";
import { Pet3DView } from "./pet3d/Pet3DView";
import { NativeAppButton } from "./NativeAppButton";
import { BrandLogoBanner } from "./BrandLogoBanner";
import { LanguageSelector } from "./LanguageSelector";
import { SettingsTabId } from "./SettingsModal";
import { alternarTema, getTemaAtual, TemaTipo } from "../utils/themeManager";

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
  | "store"
  | "library"
  | "dictionary"
  | "settings";

export interface SidebarProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  user: UserProfile;
  onLogout: () => void;
  onRechargeEnergy?: () => void;
  onQuickSyncCourses?: () => void;
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
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  user,
  onLogout,
  onRechargeEnergy,
  onOpenOfflineModal,
  onOpenProfileSettings,
  onOpenNotificationSettings,
  onOpenOnlineUsers,
  onOpenAvaConnect,
  onOpenSettings,
  onOpenAccessibility,
  onlineCount = 1,
  isOnline = true,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { t } = useTranslation();
  const [temaLocal, setTemaLocal] = useState<TemaTipo>(getTemaAtual);

  const handleToggleTheme = () => {
    const novoTema = alternarTema();
    setTemaLocal(novoTema);
  };

  const navSections = [
    {
      title: t("nav.grupo_produtividade", "Lock-In & Produtividade"),
      items: [
        {
          id: "tasks" as TabId,
          label: t("nav.tarefas", "Organizador de Tarefas"),
          icon: ListTodo,
          badge: t("nav.badge_foco", "Foco"),
          badgeColor: "text-[var(--app-accent)] bg-[var(--app-accent)]/10 border-[var(--app-accent)]/20",
        },
        {
          id: "agenda" as TabId,
          label: t("nav.agenda", "Agenda Compartilhada"),
          icon: Calendar,
        },
        {
          id: "study_methods" as TabId,
          label: t("nav.metodos_estudo", "Métodos de Estudo"),
          icon: Timer,
        },
        {
          id: "flashcards" as TabId,
          label: t("nav.flashcards", "Flashcards Anki"),
          icon: Layers,
        },
        {
          id: "study_room" as TabId,
          label: t("nav.sala_estudos", "Grupo de Estudos Virtual"),
          icon: Video,
          badge: t("nav.badge_aovivo", "Ao Vivo"),
          badgeColor: "text-[var(--app-success)] bg-[var(--app-success)]/10 border-[var(--app-success)]/20",
        },
      ],
    },
    {
      title: t("nav.grupo_academico", "Acadêmico IFES"),
      items: [
        {
          id: "ifes" as TabId,
          label: t("nav.ava_ifes", "AVA Moodle IFES"),
          badge: user.ifesAccount?.connected ? t("nav.badge_sincronizado", "Sincronizado") : t("nav.badge_conectar", "Conectar"),
          badgeColor: user.ifesAccount?.connected
            ? "text-[var(--app-success)] bg-[var(--app-success)]/10 border-[var(--app-success)]/30"
            : "text-amber-600 bg-amber-500/10 border-amber-500/30",
          icon: Building2,
        },
        {
          id: "sequence" as TabId,
          label: t("nav.disciplinas", "Minhas Disciplinas"),
          icon: GitBranch,
        },
        {
          id: "dashboard" as TabId,
          label: t("nav.dashboard", "Dashboard"),
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: t("nav.grupo_ia", "Aprendizado & IA"),
      items: [
        {
          id: "lumina" as TabId,
          label: t("nav.lumina", "Lumina IA"),
          icon: Brain,
          highlight: true,
          badge: t("nav.badge_tutora", "Tutora IA"),
          badgeColor: "text-[var(--app-primary)] bg-[var(--app-primary)]/10 border-[var(--app-primary)]/20",
        },
        {
          id: "games" as TabId,
          label: t("nav.simulados", "Simulados 10Q"),
          icon: Gamepad2,
        },
        {
          id: "library" as TabId,
          label: t("nav.biblioteca", "Biblioteca & Acervo"),
          icon: BookOpen,
        },
        {
          id: "dictionary" as TabId,
          label: t("nav.dicionario", "Dicionário Escolar"),
          icon: BookMarked,
        },
      ],
    },
    {
      title: t("nav.grupo_comunidade", "Comunidade & Mascotes"),
      items: [
        {
          id: "teams" as TabId,
          label: t("nav.equipes", "Equipes & Batalhas"),
          icon: Users,
        },
        {
          id: "store" as TabId,
          label: t("nav.loja_pets", "Loja de Pets"),
          icon: ShoppingBag,
          badge: `${user.coins ?? 0} 🪙`,
          badgeColor: "text-emerald-700 bg-emerald-100 border-emerald-300",
        },
      ],
    },
  ];

  const renderSidebarContent = (isMobileView = false) => (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="space-y-3.5">
        {/* Brand Header with Logo Banner & Utility Controls */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--app-primary)] font-black">
                IFES CEFOR
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-success)] animate-pulse" />
            </div>

            {/* Utility Quick Actions (Tema, Notificações, Acessibilidade, Ajustes, Fechar) */}
            <div className="flex items-center gap-1">
              {/* Theme Toggle (Claro / Escuro) */}
              <button
                type="button"
                onClick={handleToggleTheme}
                className="w-7 h-7 rounded-lg bg-[var(--app-bg)] hover:bg-[var(--app-primary)]/10 text-[var(--app-text)] hover:text-[var(--app-primary)] transition flex items-center justify-center border border-[var(--app-border)] cursor-pointer"
                title={temaLocal === "escuro" ? "Alternar para Tema Claro" : "Alternar para Tema Escuro"}
                aria-label="Alternar tema claro e escuro"
              >
                {temaLocal === "escuro" ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                )}
              </button>

              {/* Notifications */}
              {onOpenNotificationSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenNotificationSettings();
                    if (isMobileView && onCloseMobile) onCloseMobile();
                  }}
                  className="w-7 h-7 rounded-lg bg-[var(--app-bg)] hover:bg-[var(--app-primary)]/10 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition flex items-center justify-center border border-[var(--app-border)] cursor-pointer"
                  title={t("header.notificacoes", "Notificações & Alertas")}
                  aria-label="Abrir notificações"
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Accessibility */}
              {onOpenAccessibility && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAccessibility();
                    if (isMobileView && onCloseMobile) onCloseMobile();
                  }}
                  className="w-7 h-7 rounded-lg bg-[var(--app-bg)] hover:bg-[var(--app-primary)]/10 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition flex items-center justify-center border border-[var(--app-border)] cursor-pointer"
                  title={t("nav.acessibilidade", "Acessibilidade & Inclusão (WCAG AAA)")}
                  aria-label="Abrir acessibilidade"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Settings / Ajustes */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenSettings) onOpenSettings("idioma");
                  else onOpenProfileSettings?.();
                  if (isMobileView && onCloseMobile) onCloseMobile();
                }}
                className="w-7 h-7 rounded-lg bg-[var(--app-bg)] hover:bg-[var(--app-primary)]/10 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition flex items-center justify-center border border-[var(--app-border)] cursor-pointer"
                title={t("nav.configuracoes", "Ajustes & Configurações")}
                aria-label="Abrir configurações"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* Close Button on Mobile */}
              {isMobileView && onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="w-7 h-7 rounded-lg bg-[var(--app-bg)] hover:bg-red-500/10 text-red-500 transition flex items-center justify-center border border-[var(--app-border)] cursor-pointer"
                  aria-label="Fechar menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <BrandLogoBanner compact className="w-full" />
        </div>

        {/* Quick Connection & Online Community Status Strip */}
        <div className="space-y-1.5">
          {/* AVA Connection Status */}
          {onOpenAvaConnect && (
            <button
              type="button"
              onClick={() => {
                onOpenAvaConnect();
                if (isMobileView && onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                user.ifesAccount?.connected
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/20 animate-pulse"
              }`}
              title={
                user.ifesAccount?.connected
                  ? `${t("header.conectado", "Conectado IFES")}: ${user.ifesAccount?.campusName || "IFES"}`
                  : t("nav.badge_conectar", "Conectar AVA IFES")
              }
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {user.ifesAccount?.connected ? "AVA IFES Conectado" : "Conectar AVA IFES"}
                </span>
              </div>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  user.ifesAccount?.connected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </button>
          )}

          {/* Online Users */}
          {onOpenOnlineUsers && (
            <button
              type="button"
              onClick={() => {
                onOpenOnlineUsers();
                if (isMobileView && onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--app-bg)] text-[var(--app-text)] hover:text-emerald-500 border border-[var(--app-border)] hover:border-emerald-500/40 transition cursor-pointer"
              title={t("header.estudantes_online", "Estudantes Online")}
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>{onlineCount} {t("header.estudantes_online", "Estudantes Online")}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}
        </div>

        {/* User Mini Profile & Interactive Energy Card */}
        <div className="p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-3 shadow-xs">
          {/* User & Pet */}
          <div
            onClick={() => {
              onOpenProfileSettings?.();
              if (isMobileView && onCloseMobile) onCloseMobile();
            }}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--app-primary)] text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate text-[var(--app-text)] group-hover:text-[var(--app-primary)] transition">
                  {user.name}
                </h4>
                <p className="text-[10px] font-mono text-[var(--app-text-muted)] truncate flex items-center gap-1">
                  <span>{user.ifesAccount?.matricula || "20241IFES0482"}</span>
                  {user.pet?.name && (
                    <span className="text-[var(--app-primary)] font-bold truncate">• 🐾 {user.pet.name}</span>
                  )}
                </p>
              </div>
            </div>

            <div
              onClick={(e) => {
                e.stopPropagation();
                onTabChange("store");
                if (isMobileView && onCloseMobile) onCloseMobile();
              }}
              title={`Mascote 3D: ${user.pet?.name || "Mascote"} (Loja de Pets)`}
              className="hover:scale-110 transition cursor-pointer w-10 h-10 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] overflow-hidden flex items-center justify-center p-0.5 shadow-xs shrink-0"
            >
              <Pet3DView pet={user.pet} size="xs" className="w-full h-full" />
            </div>
          </div>

          {/* Componente de Energia Vital com Botão de Recarregar */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--app-border)]">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-[var(--app-text)]">
                <Zap className="w-3.5 h-3.5 text-[var(--app-primary)] fill-[var(--app-primary)]" />
                <span>Energia Vital</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[var(--app-primary)]">
                  {user.energy}/{user.maxEnergy || 50} ⚡
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onRechargeEnergy) onRechargeEnergy();
                    else onTabChange("store");
                    if (isMobileView && onCloseMobile) onCloseMobile();
                  }}
                  className="px-2 py-0.5 rounded-lg bg-[var(--app-primary)]/10 hover:bg-[var(--app-primary)]/20 text-[var(--app-primary)] text-[10px] font-extrabold transition cursor-pointer flex items-center gap-0.5"
                  title="Recarregar Energia na Loja"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>Recarregar</span>
                </button>
              </div>
            </div>

            {/* Barra Visual de Energia */}
            <div className="w-full bg-[var(--app-card)] h-2 rounded-full overflow-hidden border border-[var(--app-border)]">
              <div
                className="bg-gradient-to-r from-amber-500 to-[var(--app-primary)] h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, (user.energy / (user.maxEnergy || 50)) * 100))}%`,
                }}
              />
            </div>

            {/* XP and Coins summary */}
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[var(--app-text-muted)] pt-1">
              <span>{user.xp} XP</span>
              <span className="text-amber-500 font-black">{user.coins ?? 0} 🪙</span>
            </div>
          </div>
        </div>

        {/* Language Selector Dropdown */}
        <div className="px-0.5">
          <LanguageSelector variant="dropdown" className="w-full" />
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4 pt-1">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
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
                      type="button"
                      onClick={() => {
                        onTabChange(item.id);
                        if (isMobileView && onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group cursor-pointer ${
                        isActive
                          ? "bg-[var(--app-primary)] text-white shadow-sm"
                          : "text-[var(--app-text)] hover:bg-[var(--app-bg)] hover:text-[var(--app-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition ${
                            isActive
                              ? "text-white"
                              : "text-[var(--app-text-muted)] group-hover:text-[var(--app-primary)]"
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

      {/* Footer / Offline status, Native App & Logout */}
      <div className="pt-3 border-t border-[var(--app-border)] space-y-2.5">
        <div className="grid grid-cols-2 gap-1.5">
          {/* Quick Accessibility Button */}
          {onOpenAccessibility && (
            <button
              type="button"
              onClick={() => {
                onOpenAccessibility();
                if (isMobileView && onCloseMobile) onCloseMobile();
              }}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-bold text-[var(--app-text)] hover:text-[var(--app-primary)] bg-[var(--app-bg)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] transition cursor-pointer"
              title={t("nav.acessibilidade", "Acessibilidade")}
            >
              <Eye className="w-3.5 h-3.5 text-[var(--app-primary)]" />
              <span>{t("nav.acessibilidade", "Acessibilidade")}</span>
            </button>
          )}

          {/* Quick Settings / Ajustes Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSettings) onOpenSettings("idioma");
              else onOpenProfileSettings?.();
              if (isMobileView && onCloseMobile) onCloseMobile();
            }}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-bold text-[var(--app-text)] hover:text-[var(--app-primary)] bg-[var(--app-bg)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] transition cursor-pointer"
            title={t("nav.configuracoes", "Ajustes")}
          >
            <Settings className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            <span>{t("nav.configuracoes", "Ajustes")}</span>
          </button>
        </div>

        {/* 1-Click Theme Toggle Button Full-width in Footer */}
        <button
          type="button"
          onClick={handleToggleTheme}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-bold text-[var(--app-text)] bg-[var(--app-bg)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] transition cursor-pointer"
          title={temaLocal === "escuro" ? "Alternar para Tema Claro" : "Alternar para Tema Escuro"}
        >
          <div className="flex items-center gap-2">
            {temaLocal === "escuro" ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>{temaLocal === "escuro" ? "Tema Escuro Ativo" : "Tema Claro Ativo"}</span>
          </div>
          <span className="text-[10px] text-[var(--app-primary)] font-extrabold uppercase">
            Alternar
          </span>
        </button>

        <NativeAppButton variant="sidebar" />

        <div className="flex items-center justify-between text-[11px] px-2 text-[var(--app-text-muted)]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${isOnline ? "bg-[var(--app-success)]" : "bg-amber-500"}`}
            />
            <span>{isOnline ? t("nav.conectado", "Conectado IFES") : t("nav.modo_offline", "Modo Offline")}</span>
          </div>
          <span className="font-mono text-[10px]">v3.2</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onLogout();
            if (isMobileView && onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t("nav.sair", "Sair da Conta")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Main Sidebar */}
      <aside
        id="main-sidebar"
        className="w-72 bg-[var(--app-card)] text-[var(--app-text)] p-5 hidden md:flex flex-col justify-between border-r border-[var(--app-border)] select-none z-30 shrink-0 relative shadow-sm overflow-y-auto"
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer (Menu Lateral) */}
      {mobileOpen && (
        <div
          id="mobile-sidebar-drawer"
          className="fixed inset-0 bg-black/75 z-50 md:hidden backdrop-blur-md flex flex-col justify-end sm:justify-start transition-opacity"
          onClick={onCloseMobile}
        >
          <div
            className="w-full rounded-t-3xl sm:rounded-b-3xl border-t sm:border shadow-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto bg-[var(--app-card)] text-[var(--app-text)] border-[var(--app-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
