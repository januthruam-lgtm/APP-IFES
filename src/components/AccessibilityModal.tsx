import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Volume2,
  Eye,
  Brain,
  Hand,
  RotateCcw,
  Sparkles,
  Check,
  Type,
  SunMoon,
} from "lucide-react";
import { useAccessibility, TextScale, ColorBlindMode } from "../lib/accessibility";
import { speakText, readCurrentScreen } from "../lib/speech";
import { LanguageSelector } from "./LanguageSelector";

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { settings, updateSetting, resetDefaults } = useAccessibility();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap e tecla Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    closeBtnRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    speakText(t("acessibilidade.voz_frase_teste"), {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      volume: settings.speechVolume,
    });
  };

  const handleReadCurrentScreen = () => {
    readCurrentScreen(
      t("acessibilidade.titulo"),
      [
        t("acessibilidade.audiodescricao_titulo"),
        t("acessibilidade.visual_titulo"),
        t("acessibilidade.linguagem_simples"),
        t("acessibilidade.traducao_libras"),
      ],
      [
        t("acessibilidade.velocidade_voz", { val: settings.speechRate }),
        t("acessibilidade.alto_contraste"),
        t("acessibilidade.tamanho_texto"),
        t("acessibilidade.restaurar_padroes"),
      ]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
      ref={modalRef}
    >
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl w-full max-w-2xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho Fixo (shrink-0) */}
        <div className="p-4 sm:p-5 border-b border-[var(--app-border)] flex items-center justify-between gap-3 shrink-0 bg-[var(--app-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/15 border border-[var(--app-primary)]/30 flex items-center justify-center text-[var(--app-primary)] shrink-0">
              <Eye className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="accessibility-title" className="text-base sm:text-lg font-black text-[var(--app-text)]">
                {t("acessibilidade.titulo")}
              </h2>
              <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-1">
                {t("acessibilidade.subtitulo")}
              </p>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label={t("comum.fechar")}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Miolo com Rolagem (flex-1 min-h-0 overflow-y-auto) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Ação rápida: Ler esta tela */}
          <div className="p-4 rounded-2xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[var(--app-primary)]" aria-hidden="true" />
                <span>{t("acessibilidade.ler_esta_tela")}</span>
              </h3>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Lê em voz alta o título, elementos e opções da tela atual em ordem lógica.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReadCurrentScreen}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-bold transition flex items-center justify-center gap-2 min-h-[48px] cursor-pointer shadow-xs shrink-0"
            >
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>Ouvir Tela</span>
            </button>
          </div>

          {/* SEÇÃO 1: IDIOMA DO APP */}
          <section className="space-y-3" aria-labelledby="sec-lang-title">
            <h3 id="sec-lang-title" className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
              {t("configuracoes.idioma_app")}
            </h3>
            <LanguageSelector variant="list" />
          </section>

          {/* SEÇÃO 2: AUDIODESCRIÇÃO E SÍNTESE DE VOZ */}
          <section className="space-y-4" aria-labelledby="sec-voice-title">
            <h3 id="sec-voice-title" className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[var(--app-primary)]" aria-hidden="true" />
              <span>{t("acessibilidade.audiodescricao_titulo")}</span>
            </h3>

            {/* Leitura automática de novas respostas */}
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] min-h-[48px] cursor-pointer">
              <span className="text-xs font-bold text-[var(--app-text)]">
                {t("acessibilidade.leitura_voz_alta")}
              </span>
              <input
                type="checkbox"
                checked={settings.screenReaderAuto}
                onChange={(e) => updateSetting("screenReaderAuto", e.target.checked)}
                className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer"
              />
            </label>

            {/* Velocidade da voz */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <div className="flex justify-between items-center text-xs font-bold text-[var(--app-text)]">
                <span>{t("acessibilidade.velocidade_voz", { val: settings.speechRate.toFixed(1) })}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.speechRate}
                onChange={(e) => updateSetting("speechRate", parseFloat(e.target.value))}
                aria-label={t("acessibilidade.velocidade_voz", { val: settings.speechRate.toFixed(1) })}
                className="w-full accent-[var(--app-primary)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--app-text-muted)] font-mono">
                <span>0.5x (Lenta)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Rápida)</span>
              </div>
            </div>

            {/* Botão Testar Voz */}
            <button
              type="button"
              onClick={handleTestVoice}
              className="w-full py-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] text-xs font-bold text-[var(--app-text)] flex items-center justify-center gap-2 min-h-[48px] cursor-pointer transition"
            >
              <Volume2 className="w-4 h-4 text-[var(--app-primary)]" aria-hidden="true" />
              <span>{t("acessibilidade.testar_voz")}</span>
            </button>
          </section>

          {/* SEÇÃO 3: VISUAL E LEGIBILIDADE */}
          <section className="space-y-4" aria-labelledby="sec-visual-title">
            <h3 id="sec-visual-title" className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-2">
              <Type className="w-4 h-4 text-[var(--app-primary)]" aria-hidden="true" />
              <span>{t("acessibilidade.visual_titulo")}</span>
            </h3>

            {/* Tamanho da Fonte */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--app-text)] block">
                {t("acessibilidade.tamanho_texto")}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label={t("acessibilidade.tamanho_texto")}>
                {[
                  { key: "default" as TextScale, label: t("acessibilidade.tamanho_padrao"), size: "100%" },
                  { key: "large" as TextScale, label: t("acessibilidade.tamanho_grande"), size: "112%" },
                  { key: "larger" as TextScale, label: t("acessibilidade.tamanho_maior"), size: "125%" },
                  { key: "max" as TextScale, label: t("acessibilidade.tamanho_maximo"), size: "140%" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="radio"
                    aria-checked={settings.textSize === item.key}
                    onClick={() => updateSetting("textSize", item.key)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 min-h-[48px] cursor-pointer transition ${
                      settings.textSize === item.key
                        ? "bg-[var(--app-primary)]/15 border-[var(--app-primary)] text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]"
                        : "bg-[var(--app-card-secondary)] border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-card)]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] opacity-70 font-mono">{item.size}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fonte Dislexia */}
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] min-h-[48px] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--app-text)] block">
                  {t("acessibilidade.fonte_dislexia")}
                </span>
                <span className="text-[11px] text-[var(--app-text-muted)] block">
                  Letras com peso inferior e formatos diferenciados para evitar rotação mental.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.dyslexicFont}
                onChange={(e) => updateSetting("dyslexicFont", e.target.checked)}
                className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
              />
            </label>

            {/* Alto Contraste (7:1) */}
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] min-h-[48px] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--app-text)] block">
                  {t("acessibilidade.alto_contraste")}
                </span>
                <span className="text-[11px] text-[var(--app-text-muted)] block">
                  Bordas marcadas e contraste reforçado para Acessibilidade e Inclusão.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting("highContrast", e.target.checked)}
                className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
              />
            </label>

            {/* Daltonismo */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--app-text)] block">
                {t("acessibilidade.modo_daltonismo")}
              </span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("acessibilidade.modo_daltonismo")}>
                {[
                  { key: "none" as ColorBlindMode, label: t("acessibilidade.daltonismo_nenhum") },
                  { key: "protanopia" as ColorBlindMode, label: t("acessibilidade.daltonismo_protanopia") },
                  { key: "deuteranopia" as ColorBlindMode, label: t("acessibilidade.daltonismo_deuteranopia") },
                  { key: "tritanopia" as ColorBlindMode, label: t("acessibilidade.daltonismo_tritanopia") },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    role="radio"
                    aria-checked={settings.colorBlindness === item.key}
                    onClick={() => updateSetting("colorBlindness", item.key)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition min-h-[48px] cursor-pointer ${
                      settings.colorBlindness === item.key
                        ? "bg-[var(--app-primary)]/15 border-[var(--app-primary)] text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]"
                        : "bg-[var(--app-card-secondary)] border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-card)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reduzir Movimento */}
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] min-h-[48px] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--app-text)] block">
                  {t("acessibilidade.reduzir_movimento")}
                </span>
                <span className="text-[11px] text-[var(--app-text-muted)] block">
                  Desativa confetes, transições bruscas e mantém o mascote 3D em pose estática.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting("reducedMotion", e.target.checked)}
                className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
              />
            </label>

            {/* Botões Maiores (Alvos de toque >= 48px) */}
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] min-h-[48px] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--app-text)] block">
                  {t("acessibilidade.botoes_maiores")}
                </span>
                <span className="text-[11px] text-[var(--app-text-muted)] block">
                  Aumenta a área de toque dos botões para facilitar o toque e evitar erros.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.largeButtons}
                onChange={(e) => updateSetting("largeButtons", e.target.checked)}
                className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
              />
            </label>
          </section>

          {/* SEÇÃO 4: COGNITIVO E ATENÇÃO */}
          <section className="space-y-4" aria-labelledby="sec-cogn-title">
            <h3 id="sec-cogn-title" className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-2">
              <Brain className="w-4 h-4 text-[var(--app-primary)]" aria-hidden="true" />
              <span>Cognitivo e Foco</span>
            </h3>

            {/* Modo Linguagem Simples */}
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] min-h-[48px] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--app-text)] block">
                  {t("acessibilidade.linguagem_simples")}
                </span>
                <span className="text-[11px] text-[var(--app-text-muted)] block">
                  {t("acessibilidade.linguagem_simples_desc")}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.plainLanguage}
                onChange={(e) => updateSetting("plainLanguage", e.target.checked)}
                className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
              />
            </label>

            {/* Modo Foco */}
            <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] min-h-[48px] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--app-text)] block">
                  {t("acessibilidade.modo_foco")}
                </span>
                <span className="text-[11px] text-[var(--app-text-muted)] block">
                  Oculta o mascote animado e cartões secundários durante sessões de concentração.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.focusMode}
                onChange={(e) => updateSetting("focusMode", e.target.checked)}
                className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
              />
            </label>
          </section>

          {/* SEÇÃO 5: LIBRAS */}
          <section className="space-y-3" aria-labelledby="sec-libras-title">
            <h3 id="sec-libras-title" className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-2">
              <Hand className="w-4 h-4 text-[var(--app-primary)]" aria-hidden="true" />
              <span>{t("acessibilidade.traducao_libras")}</span>
            </h3>

            <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] min-h-[48px] cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[var(--app-text)] block">
                  Ativar Widget Oficial VLibras
                </span>
                <span className="text-[11px] text-[var(--app-text-muted)] block">
                  Disponibiliza o avatar em 3D do governo federal para tradução em Libras.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.librasEnabled}
                onChange={(e) => updateSetting("librasEnabled", e.target.checked)}
                className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
              />
            </label>
          </section>
        </div>

        {/* Rodapé Fixo (shrink-0) */}
        <div className="p-4 sm:p-5 border-t border-[var(--app-border)] bg-[var(--app-card)] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={resetDefaults}
            className="px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-xs font-bold text-[var(--app-text)] flex items-center gap-2 min-h-[48px] cursor-pointer transition"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{t("acessibilidade.restaurar_padroes")}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-black min-h-[48px] cursor-pointer transition shadow-xs"
          >
            {t("comum.concluir")}
          </button>
        </div>
      </div>
    </div>
  );
};
