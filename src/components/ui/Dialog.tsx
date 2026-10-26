import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  destructive?: boolean;
  children?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  destructive = false,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative z-10 w-full max-w-md bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {destructive && (
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 id="dialog-title" className="text-base font-bold text-[var(--app-text)]">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-[var(--app-text-muted)] mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children && <div className="py-2">{children}</div>}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--app-border)]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button
              variant={destructive ? "destructive" : "primary"}
              size="sm"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
