import React from "react";
import { LayoutDashboard, BookOpen, Brain, Gamepad2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CanonicalTabId } from "./TabBar";

export interface NavigationRailProps {
  currentTab: CanonicalTabId;
  onTabChange: (tab: CanonicalTabId) => void;
  className?: string;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentTab,
  onTabChange,
  className = "",
}) => {
  const { t } = useTranslation();

  const tabs: Array<{
    id: CanonicalTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isSpecial?: boolean;
  }> = [
    { id: "inicio", label: t("nav.inicio", "Início"), icon: LayoutDashboard },
    { id: "estudar", label: t("nav.estudar", "Estudar"), icon: BookOpen },
    { id: "lumina", label: t("nav.lumina", "Lumina"), icon: Brain, isSpecial: true },
    { id: "jogo", label: t("nav.jogo", "Jogo"), icon: Gamepad2 },
    { id: "perfil", label: t("nav.perfil", "Perfil"), icon: Users },
  ];

  return (
    <aside
      role="navigation"
      aria-label="Trilho de Navegação Lateral"
      className={`hidden md:flex lg:hidden flex-col items-center justify-between py-6 px-2 w-20 border-r border-[var(--app-border)] bg-[var(--app-card)] shrink-0 select-none ${className}`}
    >
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Logo Icon */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--app-primary)] to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
          B
        </div>

        {/* Tab Items */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={`w-14 min-h-[52px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
                  isActive
                    ? "bg-[var(--app-primary)]/10 text-[var(--app-primary)] font-black"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
                }`}
              >
                <Icon className={`w-5 h-5 ${tab.isSpecial && isActive ? "animate-pulse" : ""}`} />
                <span className="text-[10px] tracking-tight truncate max-w-[50px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
