import React from "react";
import { ChevronRight } from "lucide-react";

export interface ListItemProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftElement,
  rightElement,
  showChevron = false,
  onClick,
  disabled = false,
  className = "",
}) => {
  const isInteractive = Boolean(onClick && !disabled);

  return (
    <div
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`min-h-[52px] p-3 sm:p-4 rounded-xl flex items-center justify-between gap-3.5 transition-all select-none ${
        isInteractive
          ? "cursor-pointer hover:bg-[var(--app-card-secondary)] active:bg-[var(--app-card-secondary)]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]"
          : ""
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {leftElement && <div className="shrink-0">{leftElement}</div>}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-[var(--app-text)] truncate">{title}</div>
          {subtitle && (
            <div className="text-xs text-[var(--app-text-muted)] truncate mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {rightElement}
        {showChevron && <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />}
      </div>
    </div>
  );
};
