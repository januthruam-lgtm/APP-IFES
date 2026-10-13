import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Download,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  MoreVertical,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNativeApp } from '../hooks/useNativeApp';

interface NativeAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativeAppModal: React.FC<NativeAppModalProps> = ({ isOpen, onClose }) => {
  const { isStandalone, promptEvent, triggerInstall, isAndroid } = useNativeApp();
  const [activeTab, setActiveTab] = useState<'android' | 'manual' | 'desktop'>('android');
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'success' | 'manual'>('idle');

  if (!isOpen) return null;

  const handleInstallApp = async () => {
    setIsInstalling(true);
    const result = await triggerInstall();
    setIsInstalling(false);

    if (result === 'accepted') {
      setInstallStatus('success');
      confetti({ particleCount: 80, spread: 70 });
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      // If prompt was dismissed or not available directly, switch to clear manual steps
      setInstallStatus('manual');
      setActiveTab('manual');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--app-card)] text-[var(--app-text)] rounded-3xl shadow-2xl border border-[var(--app-border)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        id="native-app-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)] text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[var(--app-text)] flex items-center gap-2">
                <span>Instalar Aplicativo Brain Studio</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  APP OFICIAL
                </span>
              </h3>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Instale no seu celular para abrir sem usar navegador ou abas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card)] transition cursor-pointer"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[var(--app-border)] bg-[var(--app-bg)] px-4 pt-2 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('android')}
            className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'android'
                ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-card)]'
                : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Instalar no Celular</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'manual'
                ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-card)]'
                : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <MoreVertical className="w-3.5 h-3.5" />
            <span>Passo a Passo (Menu ⋮)</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'desktop'
                ? 'border-[var(--app-primary)] text-[var(--app-primary)] bg-[var(--app-card)]'
                : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Computador</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: INSTALAR DIRETO */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Aplicativo Autônomo para Celular Android</span>
                </div>
                <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
                  Ao instalar, o Brain Studio é adicionado à tela inicial e gaveta de apps do seu celular com ícone oficial. Ele abre em janela própria, sem barra de endereços, sem abas e sem carregar no navegador.
                </p>
              </div>

              {installStatus === 'success' ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="font-bold text-xs text-emerald-700 dark:text-emerald-300">
                    Aplicativo instalado com sucesso!
                  </div>
                  <p className="text-[11px] text-[var(--app-text-muted)]">
                    Procure o ícone do Brain Studio nos seus aplicativos para abrir direto.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleInstallApp}
                    id="trigger-native-install-btn"
                    disabled={isInstalling}
                    className="w-full py-3.5 px-5 rounded-2xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] active:scale-98 text-white font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {isInstalling
                        ? "Abrindo instalador do sistema..."
                        : "Instalar Aplicativo no Dispositivo"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-[var(--app-text-muted)]">
                    Se o instalador automático não abrir, use a aba <strong>Passo a Passo (Menu ⋮)</strong> logo acima.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASSO A PASSO MANUAL (CHROME MENU) */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-1">
                <div className="text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
                  <MoreVertical className="w-4 h-4 text-[var(--app-primary)]" />
                  <span>Como instalar diretamente pelo Chrome no Android:</span>
                </div>
                <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed">
                  Siga estes 3 passos rápidos para fixar o app no seu celular:
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[var(--app-primary)] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-[var(--app-text)] flex items-center gap-1">
                      <span>Toque nos 3 pontinhos</span>
                      <span className="px-1.5 py-0.2 rounded bg-black/40 text-emerald-400 font-mono font-bold">⋮</span>
                    </div>
                    <div className="text-[11px] text-[var(--app-text-muted)]">
                      No canto superior direito do seu navegador Google Chrome.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[var(--app-primary)] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-[var(--app-text)]">
                      Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"
                    </div>
                    <div className="text-[11px] text-[var(--app-text-muted)]">
                      O Chrome exibirá o nome "Brain Studio" com o logotipo oficial.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[var(--app-primary)] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-[var(--app-text)]">Toque em "Instalar"</div>
                    <div className="text-[11px] text-[var(--app-text-muted)]">
                      O Android vai criar o app oficial. Depois disso, basta abrir pelo ícone no seu celular!
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleInstallApp}
                className="w-full py-3 rounded-2xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Tentar Instalação Automática Novamente</span>
              </button>
            </div>
          )}

          {/* TAB 3: COMPUTADOR (DESKTOP) */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--app-text)]">
                  <Monitor className="w-4 h-4 text-[var(--app-primary)]" />
                  <span>Instalação no Computador (Windows / Mac / Linux)</span>
                </div>
                <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
                  No Chrome ou Edge no computador, clique no ícone de computadorzinho com seta <strong>(⊕ Instalar)</strong> na barra de endereços do topo para instalar o app como programa autônomo na sua barra de tarefas.
                </p>
              </div>

              <button
                onClick={handleInstallApp}
                className="w-full py-3.5 px-5 rounded-2xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-black text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar no Computador</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--app-border)] bg-[var(--app-card-secondary)] flex items-center justify-between text-[11px] text-[var(--app-text-muted)]">
          <span>Brain Studio • IFES • Aplicativo Instalável</span>
          <button
            onClick={onClose}
            className="font-bold text-[var(--app-primary)] hover:underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
