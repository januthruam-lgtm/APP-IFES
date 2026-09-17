import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
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
        <div className="bg-[#191919] text-white border border-neutral-700 rounded-2xl p-4 shadow-2xl shadow-black/80 relative overflow-hidden">
          {/* Subtle Google Play green accent glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#01875f]/20 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={handleDismiss}
            id="pwa-banner-dismiss-btn"
            className="absolute top-3 right-3 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            title="Fechar"
            aria-label="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            <div className="w-11 h-11 rounded-2xl bg-[#262626] border border-neutral-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <GooglePlayIcon className="w-6 h-6" />
            </div>

            <div className="space-y-1.5 w-full">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Instalar Brain Studio</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#01875f] text-white font-bold uppercase">
                    Play Store
                  </span>
                </h4>
              </div>

              <p className="text-xs text-neutral-300 leading-snug">
                Instale como um aplicativo nativo diretamente no seu celular Android.
              </p>

              {/* Action Button: Opens the authentic Play Store install modal directly */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setShowPlayStoreModal(true)}
                  id="pwa-banner-install-now-btn"
                  className="px-4 py-2 rounded-xl bg-[#01875f] hover:bg-[#017250] active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition"
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
