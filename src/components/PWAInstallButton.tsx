import React, { useState } from 'react';
import { Smartphone, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PlayStoreInstallModal } from './PlayStoreInstallModal';

// Google Play Official Multi-Color Vector Icon
export const GooglePlayIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.715c-.2-.36-.312-.777-.312-1.221V3.75c0-.444.112-.861.312-1.221.16-.289.37-.536.61-.715z" fill="#00D3FF"/>
    <path d="M17.18 8.613l-3.388 3.387L3.61 1.814C4.01 1.5 4.545 1.333 5.12 1.333c.8 0 1.556.326 2.115.893l9.945 6.387z" fill="#00F076"/>
    <path d="M17.18 15.387L7.235 21.774c-.559.567-1.315.893-2.115.893-.575 0-1.11-.167-1.51-.481l10.182-10.186 3.388 3.387z" fill="#FF3A44"/>
    <path d="M21.285 10.742l-4.105-2.129-3.388 3.387 3.388 3.387 4.105-2.129c.773-.443 1.25-1.272 1.25-2.258s-.477-1.815-1.25-2.258z" fill="#FFE000"/>
  </svg>
);

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'sidebar' | 'banner' | 'pill' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstalled, promptEvent } = usePWAInstall();
  const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);

  // If app is already installed or running in standalone mode, hide the install button
  if (isInstalled) {
    return null;
  }

  // Opens direct installation or Play Store install modal
  const handleOpenPlayStore = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // If native beforeinstallprompt is immediately available, fire direct native installation!
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          return;
        }
      } catch (err) {
        console.warn('Native prompt failed:', err);
      }
    }

    setShowPlayStoreModal(true);
  };

  // SIDEBAR VARIANT
  if (variant === 'sidebar') {
    return (
      <>
        <div
          onClick={handleOpenPlayStore}
          id="pwa-install-sidebar-btn"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleOpenPlayStore(); }}
          className={`w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#01875f]/20 via-[var(--app-primary)]/15 to-emerald-500/15 border-2 border-[#01875f]/50 hover:border-[#01875f] transition cursor-pointer text-left shadow-sm select-none ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#01875f] text-white flex items-center justify-center shadow-xs shrink-0">
              <GooglePlayIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-[var(--app-text)] flex items-center gap-1.5">
                <span>{isInstalled ? "App Instalado ✓" : "Baixar na Play Store"}</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#01875f] text-white font-extrabold">PLAY</span>
              </div>
              <div className="text-[10px] text-[var(--app-text-muted)]">
                {isInstalled ? "Pronto no celular" : "Instalar como app nativo"}
              </div>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        </div>

        <PlayStoreInstallModal
          isOpen={showPlayStoreModal}
          onClose={() => setShowPlayStoreModal(false)}
        />
      </>
    );
  }

  // PILL VARIANT
  if (variant === 'pill') {
    return (
      <>
        <button
          onClick={handleOpenPlayStore}
          id="pwa-install-pill-btn"
          className={`px-3 py-1.5 rounded-xl bg-[#01875f] hover:bg-[#017250] text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer ${className}`}
        >
          <GooglePlayIcon className="w-3.5 h-3.5" />
          <span>{isInstalled ? "Instalado ✓" : "Play Store"}</span>
        </button>

        <PlayStoreInstallModal
          isOpen={showPlayStoreModal}
          onClose={() => setShowPlayStoreModal(false)}
        />
      </>
    );
  }

  // CARD VARIANT (Dashboard)
  if (variant === 'card') {
    return (
      <>
        <div className="bg-[var(--app-bg)] border-2 border-[#01875f]/40 hover:border-[#01875f] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#191919] border border-neutral-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <GooglePlayIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-[var(--app-text)] flex items-center gap-1.5">
                <span>Instalar App do Brain Studio</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#01875f] text-white font-bold">Google Play</span>
              </h4>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Instale como um aplicativo do Play Store direto na tela do seu celular Android.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenPlayStore}
            id="pwa-install-card-btn"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#01875f] hover:bg-[#017250] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <GooglePlayIcon className="w-4 h-4" />
            <span>{isInstalled ? "App Instalado (Abrir)" : "Instalar como no Play Store"}</span>
          </button>
        </div>

        <PlayStoreInstallModal
          isOpen={showPlayStoreModal}
          onClose={() => setShowPlayStoreModal(false)}
        />
      </>
    );
  }

  // DEFAULT HEADER VARIANT - Official Google Play Style
  return (
    <>
      <button
        onClick={handleOpenPlayStore}
        id="pwa-install-header-btn"
        className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-sm hover:scale-[1.03] active:scale-[0.97] transition cursor-pointer border ${
          isInstalled
            ? "bg-[#01875f]/15 text-[#01875f] border-[#01875f]/30 hover:bg-[#01875f]/25"
            : "bg-[#01875f] hover:bg-[#017250] text-white border-transparent shadow-[#01875f]/30"
        } ${className}`}
        title="Instalar Brain Studio no seu celular como app do Play Store"
      >
        <GooglePlayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{isInstalled ? "App Instalado" : "Instalar App"}</span>
        <span className="sm:hidden">{isInstalled ? "Instalado" : "Instalar"}</span>
      </button>

      <PlayStoreInstallModal
        isOpen={showPlayStoreModal}
        onClose={() => setShowPlayStoreModal(false)}
      />
    </>
  );
};
