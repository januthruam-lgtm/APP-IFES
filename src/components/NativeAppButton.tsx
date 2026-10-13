import React, { useState } from 'react';
import { Layers, Download, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import { NativeAppModal } from './NativeAppModal';
import { useNativeApp } from '../hooks/useNativeApp';

interface NativeAppButtonProps {
  className?: string;
  variant?: 'header' | 'sidebar' | 'banner' | 'pill' | 'card';
}

export const NativeAppButton: React.FC<NativeAppButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isStandalone, triggerInstall, promptEvent } = useNativeApp();
  const [showModal, setShowModal] = useState(false);

  const handleOpen = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (promptEvent) {
      const res = await triggerInstall();
      if (res === 'accepted') return;
    }
    setShowModal(true);
  };

  // SIDEBAR VARIANT
  if (variant === 'sidebar') {
    return (
      <>
        <div
          onClick={handleOpen}
          id="native-app-sidebar-btn"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleOpen();
          }}
          className={`w-full flex items-center justify-between p-3 rounded-2xl bg-[var(--app-primary)]/10 border-2 border-[var(--app-primary)]/40 hover:border-[var(--app-primary)] transition cursor-pointer text-left shadow-xs select-none ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)] text-white flex items-center justify-center shadow-xs shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-[var(--app-text)] flex items-center gap-1.5">
                <span>{isStandalone ? "App Instalado ✓" : "Instalar App Oficial"}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[var(--app-primary)] text-white font-extrabold">
                  {isStandalone ? "INSTALADO" : "INSTALAR"}
                </span>
              </div>
              <div className="text-[10px] text-[var(--app-text-muted)]">
                {isStandalone ? "Rodando fora do navegador" : "Sem navegador • Janela própria"}
              </div>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        </div>

        <NativeAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // PILL VARIANT
  if (variant === 'pill') {
    return (
      <>
        <button
          onClick={handleOpen}
          id="native-app-pill-btn"
          className={`px-3 py-1.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isStandalone ? "App Instalado ✓" : "Instalar App"}</span>
        </button>

        <NativeAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // CARD VARIANT (Dashboard / Profile)
  if (variant === 'card') {
    return (
      <>
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Layers className="w-6 h-6 text-[var(--app-primary)]" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[var(--app-text)] flex items-center gap-1.5">
                <span>Aplicativo Oficial Brain Studio</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[var(--app-primary)] text-white font-bold">
                  Oficial
                </span>
              </h4>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Instale no seu celular Android ou computador: abre direto pelos seus aplicativos, sem precisar do navegador.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpen}
            id="native-app-card-btn"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isStandalone ? "App Já Instalado (Abrir)" : "Instalar Aplicativo Oficial"}</span>
          </button>
        </div>

        <NativeAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // DEFAULT HEADER VARIANT
  return (
    <>
      <button
        onClick={handleOpen}
        id="native-app-header-btn"
        className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-xs hover:scale-[1.03] active:scale-[0.97] transition cursor-pointer border ${
          isStandalone
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            : "bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white border-transparent"
        } ${className}`}
        title="Instalar Brain Studio no seu dispositivo para abrir fora do navegador"
      >
        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">
          {isStandalone ? "App Instalado" : "Instalar App"}
        </span>
        <span className="sm:hidden">{isStandalone ? "Instalado" : "Instalar"}</span>
      </button>

      <NativeAppModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
