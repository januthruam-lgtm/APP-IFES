import React from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "function" || (typeof icon === "object" && "render" in (icon as any))) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-7 h-7" />;
    }
    return icon;
  };

  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] space-y-4 max-w-md mx-auto shadow-xs ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-center justify-center text-[var(--app-primary)] shadow-xs">
          {renderIcon()}
        </div>
      )}

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-[var(--app-text)]">{title}</h3>
        <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
