import React from "react";

export type BadgeTone = "primary" | "success" | "warning" | "danger" | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  variant?: BadgeTone;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone,
  variant,
  size = "md",
  dot = false,
  className = "",
}) => {
  const activeTone = variant || tone || "neutral";

  const toneStyles: Record<BadgeTone, string> = {
    primary: "bg-[var(--app-primary)]/10 text-[var(--app-primary)] border-[var(--app-primary)]/30",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    neutral: "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] border-[var(--app-border)]",
  };

  const dotStyles: Record<BadgeTone, string> = {
    primary: "bg-[var(--app-primary)]",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    neutral: "bg-[var(--app-text-muted)]",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-[11px]",
    lg: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-bold border ${toneStyles[activeTone]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[activeTone]}`} />}
      <span>{children}</span>
    </span>
  );
};
