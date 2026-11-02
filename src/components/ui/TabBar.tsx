import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  Building2,
  Trophy,
  Layers,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export type CanonicalTabId =
  | "inicio"
  | "estudar"
  | "games"
  | "cidades"
  | "eventos"
  | "colecao"
  | "perfil";

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
      id: "games",
      label: t("nav.games", "Games"),
      icon: Gamepad2,
    },
    {
      id: "cidades",
      label: t("nav.cidades", "Cidades"),
      icon: Building2,
    },
    {
      id: "eventos",
      label: t("nav.eventos", "Eventos"),
      icon: Trophy,
    },
    {
      id: "colecao",
      label: t("nav.colecao", "Coleção"),
      icon: Layers,
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
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[var(--app-card)]/95 backdrop-blur-md border-t border-[var(--app-border)] px-1 py-1 flex items-center justify-around select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden overflow-x-auto scrollbar-none ${className}`}
    >
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
            className={`flex flex-col items-center justify-center flex-1 min-w-[46px] min-h-[48px] py-1 px-1 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
              isActive
                ? "text-[var(--app-primary)] font-black bg-[var(--app-primary)]/10"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-semibold"
            }`}
          >
            <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? "scale-110" : ""}`} />
            <span className="text-[9px] tracking-tight mt-0.5 truncate max-w-[50px] leading-tight text-center">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
