import React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "segmented" | "underline";
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
  variant = "segmented",
}) => {
  if (variant === "underline") {
    return (
      <div
        role="tablist"
        className={`flex items-center gap-4 border-b border-[var(--app-border)] overflow-x-auto select-none ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`min-h-[44px] pb-3 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
                isActive
                  ? "text-[var(--app-primary)]"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && <span className="shrink-0">{tab.badge}</span>}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--app-primary)] rounded-full animate-in fade-in" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={`p-1.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] inline-flex items-center gap-1 overflow-x-auto select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
              isActive
                ? "bg-[var(--app-card)] text-[var(--app-text)] shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="shrink-0">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};
