import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Gamepad2,
  Users,
  LogOut,
  Zap,
  Coins,
  Settings,
  ChevronRight,
  Shield,
  HelpCircle,
  Eye,
  Sliders,
} from "lucide-react";
import { TopBar } from "./TopBar";
import { TabBar, CanonicalTabId } from "./TabBar";
import { NavigationRail } from "./NavigationRail";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { Snackbar } from "./Snackbar";
import { UserProfile, CustomThemeColors } from "../../types";

export interface AppShellProps {
  currentTab: CanonicalTabId;
  onTabChange: (tab: CanonicalTabId) => void;
  subTitle?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  user: UserProfile;
  currentTheme?: CustomThemeColors;
  modoFoco: boolean;
  onToggleModoFoco: (ativo: boolean) => void;
  onLogout: () => void;
  onOpenNotifications?: () => void;
  onOpenWallet?: () => void;
  onOpenSettings?: () => void;
  onOpenAccessibility?: () => void;
  onNavigateToItem?: (destino: { tab: CanonicalTabId; subView?: string }) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  subTitle,
  canGoBack = false,
  onBack,
  user,
  currentTheme,
  modoFoco,
  onToggleModoFoco,
  onLogout,
  onOpenNotifications,
  onOpenWallet,
  onOpenSettings,
  onOpenAccessibility,
  onNavigateToItem,
  children,
}) => {
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    id: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // Escuta atalho Ctrl+K / Cmd+K para busca global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Escuta evento global de snackbar com desfazer
  useEffect(() => {
    const handleShowSnackbar = (e: any) => {
      if (e.detail) {
        setSnackbar({
          id: String(Date.now()),
          message: e.detail.message,
          actionLabel: e.detail.actionLabel || "Desfazer",
          onAction: e.detail.onUndo,
        });
      }
    };
    window.addEventListener("app:show-snackbar", handleShowSnackbar);
    return () => window.removeEventListener("app:show-snackbar", handleShowSnackbar);
  }, []);

  // Título canônico da aba ativa
  const getTabTitle = (tab: CanonicalTabId): string => {
    switch (tab) {
      case "inicio":
        return t("nav.inicio", "Início");
      case "estudar":
        return t("nav.estudar", "Central de Estudos");
      case "lumina":
        return t("nav.lumina", "Lumina • Tutora Socrática");
      case "jogo":
        return t("nav.jogo", "Vilas do Saber & Conquistas");
      case "perfil":
        return t("nav.perfil", "Perfil & Configurações");
      default:
        return "Brain Studio";
    }
  };

  const navItems = [
    { id: "inicio" as CanonicalTabId, label: t("nav.inicio", "Início"), icon: LayoutDashboard },
    { id: "estudar" as CanonicalTabId, label: t("nav.estudar", "Estudar"), icon: BookOpen },
    { id: "lumina" as CanonicalTabId, label: t("nav.lumina", "Lumina"), icon: Brain, isSpecial: true },
    { id: "jogo" as CanonicalTabId, label: t("nav.jogo", "Jogo"), icon: Gamepad2 },
    { id: "perfil" as CanonicalTabId, label: t("nav.perfil", "Perfil"), icon: Users },
  ];

  return (
    <div className="h-screen flex w-full bg-[var(--app-bg)] text-[var(--app-text)] overflow-hidden transition-colors duration-300">
      {/* 1. Sidebar Desktop (≥ 1024px) */}
      <aside
        role="navigation"
        aria-label="Barra Lateral de Navegação"
        className="hidden lg:flex flex-col justify-between w-64 border-r border-[var(--app-border)] bg-[var(--app-card)] p-4 select-none shrink-0"
      >
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--app-primary)] to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
              B
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-[var(--app-text)] block leading-none">
                Brain Studio
              </span>
              <span className="text-[10px] text-[var(--app-text-muted)] font-medium uppercase tracking-wider">
                {modoFoco ? "Modo Foco Ativo" : "Estudos & Gamificação"}
              </span>
            </div>
          </div>

          {/* Lista das 5 Abas Canônicas */}
          <nav className="space-y-1.5" aria-label="Abas Principais">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-sm font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
                    isActive
                      ? "bg-[var(--app-primary)] text-white shadow-xs"
                      : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${item.isSpecial && isActive ? "animate-pulse" : ""}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.isSpecial && (
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white/20 text-white">
                      IA
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Modo Foco e Status */}
        <div className="pt-4 border-t border-[var(--app-border)] space-y-2">
          {/* Alternador Rápido de Modo Foco */}
          <button
            onClick={() => onToggleModoFoco(!modoFoco)}
            className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              modoFoco
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-card-secondary)]"
            }`}
            title="Oculta contadores de gamificação e foca apenas no estudo"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Modo Foco</span>
            </div>
            <span className="text-[10px] uppercase font-black">
              {modoFoco ? "Ligado" : "Desligado"}
            </span>
          </button>

          {/* Atalho de Acessibilidade */}
          {onOpenAccessibility && (
            <button
              onClick={onOpenAccessibility}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] flex items-center gap-2 transition cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Acessibilidade e Inclusão</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. Navigation Rail Tablet (768px - 1023px) */}
      <NavigationRail currentTab={currentTab} onTabChange={onTabChange} />

      {/* 3. Área Principal do Conteúdo */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* TopBar Enxuta e Acessível */}
        <TopBar
          title={getTabTitle(currentTab)}
          subtitle={subTitle}
          canGoBack={canGoBack}
          onBack={onBack}
          energy={user.energy ?? 50}
          maxEnergy={user.maxEnergy ?? 50}
          coins={modoFoco ? undefined : (user.coins ?? 250)}
          onOpenWallet={onOpenWallet}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={onOpenNotifications}
        />

        {/* Viewport de Conteúdo com Scroll Próprio */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto pb-20 md:pb-6 relative focus:outline-none"
        >
          {children}
        </main>

        {/* 4. TabBar Mobile (< 768px) */}
        <TabBar currentTab={currentTab} onTabChange={onTabChange} />
      </div>

      {/* Modal de Busca Global (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(route: string) => {
          setSearchOpen(false);
          const parts = route.replace(/^\//, "").split("/");
          const tab = (parts[0] || "inicio") as CanonicalTabId;
          const subView = parts[1];
          if (onNavigateToItem) {
            onNavigateToItem({ tab, subView });
          } else {
            onTabChange(tab);
          }
        }}
      />

      {/* Snackbar Global de 8 Segundos com "Desfazer" */}
      {snackbar && (
        <Snackbar
          id={snackbar.id}
          message={snackbar.message}
          actionLabel={snackbar.actionLabel}
          onAction={snackbar.onAction}
          onClose={() => setSnackbar(null)}
          duration={8000}
        />
      )}
    </div>
  );
};
