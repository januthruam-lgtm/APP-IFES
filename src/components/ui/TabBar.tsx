import React from "react";
import { LayoutDashboard, BookOpen, Brain, Gamepad2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export type CanonicalTabId = "inicio" | "estudar" | "lumina" | "jogo" | "perfil";

export interface TabBarProps {
  currentTab: CanonicalTabId;
  onTabChange: (tab: CanonicalTabId) => void;
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({
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
    {
      id: "inicio",
      label: t("nav.inicio", "Início"),
      icon: LayoutDashboard,
    },
    {
      id: "estudar",
      label: t("nav.estudar", "Estudar"),
      icon: BookOpen,
    },
    {
      id: "lumina",
      label: t("nav.lumina", "Lumina"),
      icon: Brain,
      isSpecial: true,
    },
    {
      id: "jogo",
      label: t("nav.jogo", "Jogo"),
      icon: Gamepad2,
    },
    {
      id: "perfil",
      label: t("nav.perfil", "Perfil"),
      icon: Users,
    },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Navegação Principal"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[var(--app-card)]/95 backdrop-blur-md border-t border-[var(--app-border)] px-2 py-1 flex items-center justify-around select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;

        if (tab.isSpecial) {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className="relative -top-3 flex flex-col items-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] rounded-full"
            >
              <div
                className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isActive
                    ? "bg-gradient-to-tr from-[var(--app-primary)] to-amber-500 text-white scale-105 ring-4 ring-[var(--app-primary)]/20"
                    : "bg-[var(--app-primary)] text-white hover:scale-105"
                }`}
              >
                <Icon className="w-6 h-6 animate-pulse" />
              </div>
              <span
                className={`text-[10px] font-black tracking-tight mt-1 ${
                  isActive ? "text-[var(--app-primary)]" : "text-[var(--app-text-muted)]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
              isActive
                ? "text-[var(--app-primary)] font-black"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-semibold"
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
            <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-[64px]">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
