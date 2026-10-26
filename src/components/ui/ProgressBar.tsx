import React from "react";

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: "primary" | "success" | "accent" | "amber";
  variant?: "primary" | "success" | "accent" | "amber";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  color,
  variant,
  size = "md",
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const activeColor = variant || color || "primary";

  const colorStyles: Record<string, string> = {
    primary: "bg-[var(--app-primary)]",
    success: "bg-emerald-500",
    accent: "bg-amber-500",
    amber: "bg-gradient-to-r from-amber-500 to-yellow-400",
  };

  const heightStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text)]">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="font-mono text-[var(--app-text-muted)]">{percentage}%</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full ${heightStyles[size]} rounded-full bg-[var(--app-card-secondary)] overflow-hidden`}
      >
        <div
          style={{ width: `${percentage}%` }}
          className={`h-full ${colorStyles[activeColor] || colorStyles.primary} rounded-full transition-all duration-500 ease-out`}
        />
      </div>
    </div>
  );
};
