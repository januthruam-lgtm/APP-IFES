import React from 'react';
import { Layers, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { useNativeApp } from '../hooks/useNativeApp';

interface NativeTitleBarProps {
  onOpenNativeModal?: () => void;
}

export const NativeTitleBar: React.FC<NativeTitleBarProps> = ({ onOpenNativeModal }) => {
  const { isFullscreen, toggleFullscreen } = useNativeApp();

  return (
    <div
      id="native-app-titlebar"
      className="hidden md:flex w-full bg-[var(--app-card)]/90 backdrop-blur-md border-b border-[var(--app-border)] px-4 py-1.5 items-center justify-between text-xs select-none z-40 transition-colors"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-lg bg-[var(--app-primary)] text-white flex items-center justify-center shadow-2xs">
          <Layers className="w-3 h-3" />
        </div>
        <span className="font-extrabold text-[var(--app-text)] text-[11px] tracking-tight">
          Brain Studio
        </span>
        <span className="hidden sm:inline-block text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
          App Nativo • Sem Navegador
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {onOpenNativeModal && (
          <button
            onClick={onOpenNativeModal}
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer flex items-center gap-1"
            title="Opções do Aplicativo Nativo"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="hidden sm:inline">Opções do App</span>
          </button>
        )}

        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer"
          title={isFullscreen ? "Restaurar Janela" : "Janela Cheia (F11)"}
          aria-label="Alternar tela cheia"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
