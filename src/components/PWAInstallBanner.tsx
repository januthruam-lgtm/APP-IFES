import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PlayStoreInstallModal } from './PlayStoreInstallModal';
import { GooglePlayIcon } from './PWAInstallButton';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
      if (isDismissed) {
        setDismissed(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (dismissed || isInstalled) {
    return null;
  }

  return (
    <>
      <aside
        id="pwa-floating-install-banner"
        aria-label="Aviso de instalação do aplicativo no Android"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      >
        <div className="bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] rounded-2xl p-4 shadow-2xl relative overflow-hidden">
          {/* Subtle primary accent glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[var(--app-primary)]/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={handleDismiss}
            id="pwa-banner-dismiss-btn"
            className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer"
            title="Fechar"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-11 h-11 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-[var(--app-text)] flex items-center justify-center shrink-0 shadow-xs">
              <GooglePlayIcon className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 w-full">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold tracking-tight text-[var(--app-text)] flex items-center gap-1.5">
                  <span>Instalar Brain Studio</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-[var(--app-primary)] text-white font-bold uppercase">
                    Play Store
                  </span>
                </h4>
              </div>

              <p className="text-xs text-[var(--app-text-muted)] leading-snug">
                Instale como um aplicativo nativo diretamente no seu celular Android.
              </p>

              {/* Action Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setShowPlayStoreModal(true)}
                  id="pwa-banner-install-now-btn"
                  className="px-4 py-2 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition"
                >
                  <GooglePlayIcon className="w-3.5 h-3.5" />
                  <span>Instalar no Celular</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <PlayStoreInstallModal
        isOpen={showPlayStoreModal}
        onClose={() => setShowPlayStoreModal(false)}
      />
    </>
  );
};
