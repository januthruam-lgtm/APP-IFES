import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home, Copy, Check, LifeBuoy } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  screenName?: string;
  onNavigateHome?: () => void;
  onReportProblem?: (errorLog: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  reported: boolean;
}

/**
 * ScreenErrorBoundary - Isolamento de Falhas por Tela (Bloco 1C.3 / 1C.4)
 * Impede que a oscilação de uma sub-aba ou tela derrube a aplicação inteira.
 * Oferece ações de recuperação: "Tentar de novo", "Voltar ao Início" e "Relatar problema".
 */
export class ScreenErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    reported: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Salva o último erro técnico sem dados pessoais para consulta em Ajuda/Suporte
    try {
      const sanitizedLog = {
        screen: this.props.screenName || "Tela",
        message: error.message || "Erro desconhecido",
        timestamp: new Date().toISOString(),
        build: "v3.2.0-native",
      };
      localStorage.setItem("brain_studio_last_error", JSON.stringify(sanitizedLog));
    } catch {
      // Ignore storage errors
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[ScreenErrorBoundary] Falha capturada na tela "${this.props.screenName || "desconhecida"}":`, error);
    }
  }

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, reported: false });
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, reported: false });
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      window.location.hash = "#inicio";
    }
  };

  private handleCopyError = () => {
    const errorDetails = `Brain Studio Screen Error Log\nTela: ${this.props.screenName || "Geral"}\nData: ${new Date().toISOString()}\nErro: ${
      this.state.error?.message || "Desconhecido"
    }\nStack: ${this.state.error?.stack || "N/A"}`;
    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  private handleReport = () => {
    const errorDetails = `Erro na tela ${this.props.screenName || "Geral"}: ${this.state.error?.message || "Sem detalhes"}`;
    if (this.props.onReportProblem) {
      this.props.onReportProblem(errorDetails);
    }
    this.setState({ reported: true });
    setTimeout(() => this.setState({ reported: false }), 3000);
  };

  public render() {
    if (this.state.hasError) {
      const screenTitle = this.props.screenName ? `na tela de ${this.props.screenName}` : "nesta tela";

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="p-6 sm:p-8 max-w-xl mx-auto my-8 bg-[var(--app-card,#FBFAF5)] border border-[var(--app-border,#D9DFD3)] rounded-3xl shadow-sm text-center space-y-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xs">
            <AlertTriangle className="w-7 h-7" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-[var(--app-text,#26332F)] tracking-tight">
              Instabilidade temporária {screenTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted,#55645E)] leading-relaxed">
              Ocorreu uma pequena oscilação ao carregar este conteúdo. Seus dados de estudo e saldo permanecem totalmente seguros.
            </p>
          </div>

          {this.state.error && (
            <div className="text-left bg-[var(--app-bg,#EEF2EC)] p-3.5 rounded-2xl border border-[var(--app-border,#D9DFD3)] space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[var(--app-text-muted,#55645E)]">
                <span>Informação Técnica</span>
                <button
                  type="button"
                  onClick={this.handleCopyError}
                  className="flex items-center gap-1 hover:text-[var(--app-primary,#B8651A)] transition cursor-pointer"
                  title="Copiar log técnico"
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
              <p className="text-xs font-mono font-bold text-red-600 dark:text-red-400 break-words line-clamp-2">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={this.handleTryAgain}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tentar de novo</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={this.handleGoHome}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao Início</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={this.handleReport}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>{this.state.reported ? "Relato registrado!" : "Relatar problema"}</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
