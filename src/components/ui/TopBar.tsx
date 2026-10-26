import React from "react";
import { ArrowLeft, Search, Bell, Zap, Coins } from "lucide-react";

export interface TopBarProps {
  title: string;
  subtitle?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  energy?: number;
  maxEnergy?: number;
  coins?: number;
  onOpenWallet?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  canGoBack = false,
  onBack,
  energy = 50,
  maxEnergy = 50,
  coins = 100,
  onOpenWallet,
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  className = "",
}) => {
  return (
    <header
      className={`sticky top-0 z-30 w-full min-h-[56px] px-3.5 sm:px-6 bg-[var(--app-bg)]/90 backdrop-blur-md border-b border-[var(--app-border)] flex items-center justify-between gap-3 select-none ${className}`}
    >
      {/* Lado Esquerdo: Botão Voltar Contextual e Título da Tela */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {canGoBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]"
            aria-label="Voltar para a tela anterior"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-black text-[var(--app-text)] tracking-tight truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-[var(--app-text-muted)] truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Lado Direito: Energia, Moedas (Atalho Carteira/Extrato), Notificações e Busca */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Indicador de Energia */}
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold shadow-xs select-none"
          title={`Energia: ${energy}/${maxEnergy}`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="font-mono text-[11px] sm:text-xs">{energy}</span>
        </div>

        {/* Atalho de Moedas -> Abre Carteira & Extrato */}
        <button
          type="button"
          onClick={onOpenWallet}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-amber-600 dark:text-amber-400 text-xs font-black shadow-xs cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] select-none"
          title="Ver saldo e Extrato de Moedas"
          aria-label={`Saldo: ${coins} moedas. Tocar para abrir extrato`}
        >
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-mono text-[11px] sm:text-xs">{coins}</span>
        </button>

        {/* Busca Global Instantânea */}
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] border border-transparent hover:border-[var(--app-border)] transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]"
            title="Buscar matérias, tarefas, flashcards e configurações"
            aria-label="Abrir busca global"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Notificações */}
        {onOpenNotifications && (
          <button
            type="button"
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] border border-transparent hover:border-[var(--app-border)] transition cursor-pointer shrink-0 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)]"
            title="Notificações"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--app-primary)] animate-pulse" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
