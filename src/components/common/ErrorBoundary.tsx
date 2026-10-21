import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home, Copy, Check } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

/**
 * Error Boundary Global do Brain Studio
 * Captura exceções na árvore de renderização do React, previne tela branca
 * e oferece interface acolhedora de recuperação com acessibilidade WCAG AA.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Em produção, aqui integra-se com o serviço de observabilidade (Crashlytics/Sentry) sem dados pessoais
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary] Exceção capturada na árvore de componentes:", error, errorInfo);
    }
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  private handleCopyError = () => {
    const errorDetails = `Brain Studio Error Log\nData: ${new Date().toISOString()}\nErro: ${
      this.state.error?.message || "Desconhecido"
    }\nStack: ${this.state.error?.stack || "N/A"}`;
    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen bg-[var(--app-bg,#EEF2EC)] text-[var(--app-text,#26332F)] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="max-w-md w-full bg-[var(--app-card,#FBFAF5)] border border-[var(--app-border,#D9DFD3)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 text-center">
            {/* Ícone de Alerta */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>

            {/* Cabeçalho */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--app-text,#26332F)] tracking-tight">
                {this.props.fallbackTitle || "Tivemos uma pequena oscilação"}
              </h1>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted,#55645E)] leading-relaxed">
                {this.props.fallbackMessage ||
                  "Ocorreu um imprevisto na visualização desta tela. Seus dados de estudo e progresso permanecem totalmente salvos e seguros."}
              </p>
            </div>

            {/* Detalhe do Erro (colapsável para suporte) */}
            {this.state.error && (
              <div className="text-left bg-[var(--app-bg,#EEF2EC)] p-3.5 rounded-2xl border border-[var(--app-border,#D9DFD3)] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--app-text-muted,#55645E)]">
                  <span>Mensagem Técnica</span>
                  <button
                    type="button"
                    onClick={this.handleCopyError}
                    className="flex items-center gap-1 hover:text-[var(--app-primary,#B8651A)] transition cursor-pointer"
                    title="Copiar log do erro"
                  >
                    {this.state.copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs font-mono font-bold text-red-600 dark:text-red-400 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-2xl bg-[var(--app-primary,#B8651A)] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recarregar Tela</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="py-3 px-4 rounded-2xl bg-[var(--app-bg,#EEF2EC)] hover:bg-[var(--app-border,#D9DFD3)] text-[var(--app-text,#26332F)] font-bold text-xs sm:text-sm border border-[var(--app-border,#D9DFD3)] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Início</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
