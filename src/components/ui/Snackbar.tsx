import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type SnackbarType = "success" | "error" | "info";

export interface SnackbarProps {
  id?: string;
  message: string;
  type?: SnackbarType;
  isOpen?: boolean;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  undoAction?: () => void;
  undoLabel?: string;
  duration?: number;
  durationMs?: number; // Padrão 8000ms (8 segundos)
}

export const Snackbar: React.FC<SnackbarProps> = ({
  message,
  type = "info",
  isOpen = true,
  onClose,
  actionLabel,
  onAction,
  undoAction,
  undoLabel,
  duration,
  durationMs = 8000,
}) => {
  const timeoutMs = duration || durationMs;
  const labelToUse = actionLabel || undoLabel || "Desfazer";
  const actionToExecute = onAction || undoAction;

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isOpen, timeoutMs, onClose]);

  if (!isOpen) return null;

  const typeIcons: Record<SnackbarType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-amber-400 shrink-0" />,
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-neutral-900/95 dark:bg-neutral-800/95 text-white shadow-xl border border-neutral-700/50 backdrop-blur-md min-w-[320px] max-w-[90vw] sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {typeIcons[type]}
        <span className="text-xs sm:text-sm font-medium leading-snug line-clamp-2">
          {message}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {actionToExecute && (
          <button
            type="button"
            onClick={() => {
              actionToExecute();
              onClose();
            }}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 font-bold text-xs transition cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {labelToUse}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar notificação"
          className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
