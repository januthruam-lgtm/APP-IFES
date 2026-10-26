import React from "react";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  badge,
  size = "md",
  className = "",
  disabled = false,
}) => {
  const sizeStyles = {
    sm: "min-h-[36px] px-2.5 py-1 text-[11px]",
    md: "min-h-[44px] px-3.5 py-1.5 text-xs",
    lg: "min-h-[48px] px-4 py-2 text-sm",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`${sizeStyles[size]} rounded-xl font-bold transition-all inline-flex items-center gap-2 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] disabled:opacity-40 disabled:cursor-not-allowed ${
        selected
          ? "bg-[var(--app-primary)] text-white shadow-xs"
          : "bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] hover:bg-[var(--app-card-secondary)]"
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {badge && <span className="shrink-0">{badge}</span>}
    </button>
  );
};
