import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * Componente padrão de Exibição de Erro do Brain Studio.
 * Apresenta alertas com suporte a WCAG AA e botão para nova tentativa.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Não foi possível carregar os dados",
  message = "Houve uma oscilação na conexão com o serviço. Verifique sua internet e tente novamente.",
  onRetry,
  retryLabel = "Tentar Novamente",
  className = "",
}) => {
  return (
    <div
      role="alert"
      className={`p-6 sm:p-8 text-center rounded-3xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/25 space-y-3.5 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto shadow-2xs">
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-black text-red-700 dark:text-red-300">
          {title}
        </h4>
        <p className="text-xs text-[var(--app-text-muted,#55645E)] leading-relaxed">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
