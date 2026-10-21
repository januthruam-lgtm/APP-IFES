import React, { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Componente padrão de Estado Vazio (Empty State) do Brain Studio.
 * Exibe orientações didáticas e acolhedoras quando não há dados em uma lista ou aba.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-3xl bg-[var(--app-card,#FBFAF5)] border border-[var(--app-border,#D9DFD3)] space-y-4 max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--app-primary,#B8651A)]/10 text-[var(--app-primary,#B8651A)] flex items-center justify-center mx-auto shadow-2xs">
        {icon || <FolderOpen className="w-7 h-7" aria-hidden="true" />}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-black text-[var(--app-text,#26332F)]">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--app-text-muted,#55645E)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-[var(--app-primary,#B8651A)] hover:opacity-95 text-white font-extrabold text-xs transition cursor-pointer shadow-xs active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
