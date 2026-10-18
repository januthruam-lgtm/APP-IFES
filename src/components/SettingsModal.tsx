import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Globe,
  Eye,
  User,
  Bell,
  Database,
  Crown,
  X,
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Share2,
  Trash2,
  CheckCircle2,
  Mail,
  GraduationCap,
  Building2,
  Volume2,
  Type,
  SunMoon,
  Brain,
  Hand,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserProfile, IfesAccountInfo } from "../types";
import { useAccessibility, TextScale, ColorBlindMode } from "../lib/accessibility";
import { LanguageSelector } from "./LanguageSelector";
import { speakText, readCurrentScreen } from "../lib/speech";
import { NativeAppButton } from "./NativeAppButton";
import { saveUserMoodleCreds } from "../lib/firebase";
import { IFES_CAMPUSES_LIST } from "../data/ifesCampuses";

export type SettingsTabId =
  | "idioma"
  | "acessibilidade"
  | "perfil"
  | "notificacoes"
  | "offline"
  | "planos";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveUser: (updatedUser: Partial<UserProfile>) => void;
  onResetCourses?: () => void;
  onReopenTutorial?: () => void;
  onOpenAccessibilityDetail?: () => void;
  onOpenOfflineDetail?: () => void;
  onOpenNotificationDetail?: () => void;
  onOpenPaywall?: () => void;
  initialTab?: SettingsTabId;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
  onResetCourses,
  onReopenTutorial,
  onOpenAccessibilityDetail,
  onOpenOfflineDetail,
  onOpenNotificationDetail,
  onOpenPaywall,
  initialTab = "idioma",
}) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);
  const { settings: a11ySettings, updateSetting, resetDefaults } = useAccessibility();

  // Profile fields state
  const [name, setName] = useState(user.name || "Ruam Sérgio de Sousa Januth");
  const [email, setEmail] = useState(user.email || "ruamsergioj@gmail.com");
  const [moodleUsername, setMoodleUsername] = useState(
    user.ifesAccount?.username || user.ifesAccount?.matricula || "20241IFES0482"
  );
  const [campusUrl, setCampusUrl] = useState(
    user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br"
  );
  const [campusName, setCampusName] = useState(
    user.ifesAccount?.campusName || "IFES - Cefor (AVA3)"
  );
  const [courseProgram, setCourseProgram] = useState(
    user.ifesAccount?.department || "Técnico Integrado em Administração - 2º Ano"
  );
  const [directAvaLink, setDirectAvaLink] = useState(
    user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br"
  );
  const [savedToast, setSavedToast] = useState(false);
  const [inviteCopiedToast, setInviteCopiedToast] = useState(false);

  // Esc key and initial tab sync
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setName(user.name || "Ruam Sérgio de Sousa Januth");
      setEmail(user.email || "ruamsergioj@gmail.com");
      setMoodleUsername(user.ifesAccount?.username || user.ifesAccount?.matricula || "20241IFES0482");
      setCampusUrl(user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br");
      setCampusName(user.ifesAccount?.campusName || "IFES - Cefor (AVA3)");
      setCourseProgram(user.ifesAccount?.department || "Técnico Integrado em Administração - 2º Ano");
      setDirectAvaLink(user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br");
    }
  }, [isOpen, initialTab, user]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCampusChange = (url: string) => {
    setCampusUrl(url);
    setDirectAvaLink(url);
    const found = IFES_CAMPUSES_LIST.find((c) => c.url === url);
    if (found) {
      setCampusName(found.name);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = directAvaLink.trim().startsWith("http")
      ? directAvaLink.trim()
      : `https://${directAvaLink.trim()}`;

    const updatedIfesAccount: IfesAccountInfo = {
      ...user.ifesAccount,
      connected: true,
      username: moodleUsername.trim() || user.ifesAccount?.username || "20241IFES0482",
      fullname: name.trim() || user.name,
      matricula: moodleUsername.trim(),
      email: email.trim(),
      campusUrl: cleanUrl || campusUrl,
      campusName,
      department: courseProgram.trim(),
      lastSync: "Atualizado em " + new Date().toLocaleDateString(),
      token: user.ifesAccount?.token || "moodle_mobile_cefor_auth",
    };

    const userId = user.id || user.uid || "local-user";
    saveUserMoodleCreds(userId, {
      username: moodleUsername.trim(),
      campusUrl: cleanUrl || campusUrl,
      lastUpdated: Date.now(),
    });

    onSaveUser({
      name: name.trim(),
      email: email.trim(),
      ifesAccount: updatedIfesAccount,
    });

    setSavedToast(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setSavedToast(false);
    }, 2000);
  };

  const handleInviteFriends = async () => {
    const shareData = {
      title: "Brain Studio • IFES",
      text: "Estude comigo no Brain Studio! IA pedagógica Lumina, sincronização oficial do AVA IFES e mascotes 3D.",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user dismissed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setInviteCopiedToast(true);
      setTimeout(() => setInviteCopiedToast(false), 3000);
    }
  };

  const handleFullReset = () => {
    if (window.confirm("Deseja realmente redefinir todos os dados locais do aplicativo?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const tabs = [
    {
      id: "idioma" as SettingsTabId,
      label: t("configuracoes.idioma_app"),
      icon: Globe,
    },
    {
      id: "acessibilidade" as SettingsTabId,
      label: t("acessibilidade.titulo"),
      icon: Eye,
    },
    {
      id: "perfil" as SettingsTabId,
      label: t("configuracoes.perfil"),
      icon: User,
    },
    {
      id: "notificacoes" as SettingsTabId,
      label: t("configuracoes.notificacoes"),
      icon: Bell,
    },
    {
      id: "offline" as SettingsTabId,
      label: "Offline & Cache",
      icon: Database,
    },
    {
      id: "planos" as SettingsTabId,
      label: t("loja.planos_titulo"),
      icon: Crown,
    },
  ];

  return (
    <div
      id="settings-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl w-full max-w-3xl max-h-[92dvh] flex flex-col shadow-2xl overflow-hidden text-[var(--app-text)]">
        {/* Cabeçalho Fixo (shrink-0) */}
        <div className="p-4 sm:p-5 border-b border-[var(--app-border)] flex items-center justify-between gap-3 shrink-0 bg-[var(--app-card)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/15 border border-[var(--app-primary)]/30 flex items-center justify-center text-[var(--app-primary)] shrink-0">
              <Settings className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="settings-title" className="text-base sm:text-lg font-black text-[var(--app-text)] flex items-center gap-2">
                {t("configuracoes.titulo")}
              </h2>
              <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-1">
                Idioma, Inclusão, Perfil Institucional IFES, Notificações e Armazenamento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={t("comum.fechar")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer border border-transparent hover:border-[var(--app-border)]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Barra de Navegação entre Abas (Horizontal com rolagem suave) */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-[var(--app-border)] bg-[var(--app-bg)]/60 shrink-0 overflow-x-auto scrollbar-none flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer select-none border ${
                  isActive
                    ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-sm"
                    : "bg-[var(--app-card)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border-[var(--app-border)] hover:bg-[var(--app-card-secondary)]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-[var(--app-primary)]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Miolo com Rolagem (flex-1 min-h-0 overflow-y-auto) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* ABA 1: IDIOMA & REGIÃO */}
          {/* ======================================================== */}
          {activeTab === "idioma" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20 space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--app-primary)]" />
                  <span>{t("configuracoes.idioma_app")}</span>
                </h3>
                <p className="text-[11px] text-[var(--app-text-muted)]">
                  Alterne instantaneamente o idioma de toda a interface do aplicativo. O idioma padrão é o Português do Brasil.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)] block">
                  Selecione o Idioma do Aplicativo:
                </span>
                <LanguageSelector variant="list" />
              </div>

              <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[var(--app-text)]">
                  <span className="text-base">ℹ️</span>
                  <span>Conteúdos Acadêmicos do AVA Moodle</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {t("ava.aviso_idioma_original")}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("acessibilidade")}
                  className="px-4 py-2.5 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] flex items-center gap-2 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[var(--app-primary)]" />
                  <span>Ver Opções de Inclusão & Acessibilidade →</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 2: INCLUSÃO & ACESSIBILIDADE */}
          {/* ======================================================== */}
          {activeTab === "acessibilidade" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Botão de Destaque: Painel Completo de Acessibilidade */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[var(--app-primary)]/15 via-[var(--app-primary)]/10 to-transparent border border-[var(--app-primary)]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--app-primary)] text-white">
                      100% Gratuito
                    </span>
                    <h3 className="text-sm font-black text-[var(--app-text)]">
                      {t("acessibilidade.titulo")}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[var(--app-text-muted)] max-w-lg">
                    {t("acessibilidade.subtitulo")}
                  </p>
                </div>

                {onOpenAccessibilityDetail && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAccessibilityDetail();
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{t("configuracoes.atalho_acessibilidade")}</span>
                  </button>
                )}
              </div>

              {/* Controles Rápidos de Acessibilidade Integrados */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-2">
                  <Type className="w-4 h-4 text-[var(--app-primary)]" />
                  <span>{t("acessibilidade.visual_titulo")}</span>
                </h4>

                {/* Tamanho da Fonte */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--app-text)] block">
                    {t("acessibilidade.tamanho_texto")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: "default" as TextScale, label: t("acessibilidade.tamanho_padrao"), size: "100%" },
                      { key: "large" as TextScale, label: t("acessibilidade.tamanho_grande"), size: "112%" },
                      { key: "larger" as TextScale, label: t("acessibilidade.tamanho_maior"), size: "125%" },
                      { key: "max" as TextScale, label: t("acessibilidade.tamanho_maximo"), size: "140%" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => updateSetting("textSize", item.key)}
                        className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
                          a11ySettings.textSize === item.key
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

                {/* Alto Contraste & Fonte Dislexia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[var(--app-text)] block">
                        {t("acessibilidade.alto_contraste")}
                      </span>
                      <span className="text-[10px] text-[var(--app-text-muted)] block">
                        Contraste WCAG 7:1 reforçado
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={a11ySettings.highContrast}
                      onChange={(e) => updateSetting("highContrast", e.target.checked)}
                      className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[var(--app-text)] block">
                        {t("acessibilidade.fonte_dislexia")}
                      </span>
                      <span className="text-[10px] text-[var(--app-text-muted)] block">
                        Fonte OpenDyslexic amigável
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={a11ySettings.dyslexicFont}
                      onChange={(e) => updateSetting("dyslexicFont", e.target.checked)}
                      className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
                    />
                  </label>
                </div>

                {/* Daltonismo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--app-text)] block">
                    {t("acessibilidade.modo_daltonismo")}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: "none" as ColorBlindMode, label: t("acessibilidade.daltonismo_nenhum") },
                      { key: "protanopia" as ColorBlindMode, label: t("acessibilidade.daltonismo_protanopia") },
                      { key: "deuteranopia" as ColorBlindMode, label: t("acessibilidade.daltonismo_deuteranopia") },
                      { key: "tritanopia" as ColorBlindMode, label: t("acessibilidade.daltonismo_tritanopia") },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => updateSetting("colorBlindness", item.key)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                          a11ySettings.colorBlindness === item.key
                            ? "bg-[var(--app-primary)]/15 border-[var(--app-primary)] text-[var(--app-primary)] ring-1 ring-[var(--app-primary)]"
                            : "bg-[var(--app-card-secondary)] border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-card)]"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audiodescrição & Voz */}
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)] flex items-center gap-2 pt-2">
                  <Volume2 className="w-4 h-4 text-[var(--app-primary)]" />
                  <span>{t("acessibilidade.audiodescricao_titulo")}</span>
                </h4>

                <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-[var(--app-text)]">
                    <span>{t("acessibilidade.velocidade_voz", { val: a11ySettings.speechRate.toFixed(1) })}</span>
                    <button
                      type="button"
                      onClick={() =>
                        speakText(t("acessibilidade.voz_frase_teste"), {
                          rate: a11ySettings.speechRate,
                          pitch: a11ySettings.speechPitch,
                          volume: a11ySettings.speechVolume,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-[var(--app-primary)]/10 text-[var(--app-primary)] hover:bg-[var(--app-primary)]/20 text-[11px] font-bold cursor-pointer transition flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{t("acessibilidade.testar_voz")}</span>
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={a11ySettings.speechRate}
                    onChange={(e) => updateSetting("speechRate", parseFloat(e.target.value))}
                    className="w-full accent-[var(--app-primary)] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--app-text-muted)] font-mono">
                    <span>0.5x (Lenta)</span>
                    <span>1.0x (Normal)</span>
                    <span>2.0x (Rápida)</span>
                  </div>
                </div>

                {/* Cognitivo & Libras */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[var(--app-text)] block">
                        {t("acessibilidade.modo_foco")}
                      </span>
                      <span className="text-[10px] text-[var(--app-text-muted)] block">
                        Oculta mascote animado durante foco
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={a11ySettings.focusMode}
                      onChange={(e) => updateSetting("focusMode", e.target.checked)}
                      className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[var(--app-text)] block">
                        {t("acessibilidade.traducao_libras")}
                      </span>
                      <span className="text-[10px] text-[var(--app-text-muted)] block">
                        Widget Oficial VLibras Brasil
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={a11ySettings.librasEnabled}
                      onChange={(e) => updateSetting("librasEnabled", e.target.checked)}
                      className="w-5 h-5 accent-[var(--app-primary)] rounded cursor-pointer shrink-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 3: PERFIL DO ESTUDANTE & MATRÍCULA IFES */}
          {/* ======================================================== */}
          {activeTab === "perfil" && (
            <form onSubmit={handleProfileSubmit} className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Ruam Sérgio de Sousa Januth"
                    className="w-full px-4 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none transition font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[var(--app-primary)]" /> E-mail Institucional
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: ruamsergioj@gmail.com"
                    className="w-full px-4 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none transition font-mono"
                    required
                  />
                </div>
              </div>

              {/* Moodle AVA IFES Credentials */}
              <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--app-primary)]" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
                      Credenciais AVA Moodle IFES
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                    Moodle Oficial
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Usuário / Matrícula AVA
                  </label>
                  <input
                    type="text"
                    value={moodleUsername}
                    onChange={(e) => setMoodleUsername(e.target.value)}
                    placeholder="Ex: 20241IFES0482"
                    className="w-full px-3.5 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Campus / Instância AVA
                  </label>
                  <select
                    value={campusUrl}
                    onChange={(e) => handleCampusChange(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition cursor-pointer"
                  >
                    {IFES_CAMPUSES_LIST.map((c, idx) => (
                      <option key={`campus-opt-${c.id || idx}`} value={c.url}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                      Link Direto do AVA
                    </label>
                    {directAvaLink && (
                      <a
                        href={directAvaLink.startsWith("http") ? directAvaLink : `https://${directAvaLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-[var(--app-primary)] hover:underline font-bold flex items-center gap-1"
                      >
                        <span>Abrir AVA</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={directAvaLink}
                    onChange={(e) => setDirectAvaLink(e.target.value)}
                    placeholder="Ex: https://ava3.cefor.ifes.edu.br"
                    className="w-full px-3.5 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)]"
                  />
                </div>
              </div>

              {/* Curso / Departamento */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Curso / Turma / Período
                </label>
                <input
                  type="text"
                  value={courseProgram}
                  onChange={(e) => setCourseProgram(e.target.value)}
                  placeholder="Ex: Técnico Integrado em Administração - 2º Ano"
                  className="w-full px-4 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none transition"
                />
              </div>

              {/* Botões de Ações de Perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleInviteFriends}
                  className="w-full py-2.5 px-3 bg-[var(--app-primary)]/10 hover:bg-[var(--app-primary)]/20 text-[var(--app-primary)] border border-[var(--app-primary)]/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{inviteCopiedToast ? "Link Copiado!" : "Convidar Colegas IFES"}</span>
                </button>

                {onReopenTutorial && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onReopenTutorial();
                    }}
                    className="w-full py-2.5 px-3 bg-[var(--app-bg)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] border border-[var(--app-border)] rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-[var(--app-primary)]" />
                    <span>Rever Tutorial & Mascote 3D</span>
                  </button>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-[var(--app-border)]">
                {onResetCourses && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Deseja limpar as matérias sincronizadas e resincronizar?")) {
                        onResetCourses();
                        onClose();
                      }
                    }}
                    className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar Matérias</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="ml-auto px-6 py-2.5 bg-[var(--app-primary)] hover:opacity-90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savedToast ? "Salvo com Sucesso!" : "Salvar Perfil"}</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* ABA 4: NOTIFICAÇÕES & ALERTAS */}
          {/* ======================================================== */}
          {activeTab === "notificacoes" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20 space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[var(--app-primary)]" />
                  <span>Lembretes de Prazos e Atividades</span>
                </h3>
                <p className="text-[11px] text-[var(--app-text-muted)]">
                  Configure alertas Web Push para trabalhos do AVA Moodle, tarefas e simulados com antecedência dinâmica.
                </p>
              </div>

              {onOpenNotificationDetail && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNotificationDetail();
                  }}
                  className="w-full p-4 rounded-2xl bg-[var(--app-card-secondary)] hover:bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)]/15 flex items-center justify-center text-[var(--app-primary)]">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black">Gerenciar Prazos & Antecedência</span>
                      <span className="text-[11px] text-[var(--app-text-muted)]">
                        Ajustar horários de envio e testar notificações push
                      </span>
                    </div>
                  </div>
                  <span className="text-[var(--app-primary)] font-bold">Abrir Painel →</span>
                </button>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 5: ARMAZENAMENTO & CACHE OFFLINE */}
          {/* ======================================================== */}
          {activeTab === "offline" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[var(--app-primary)]" />
                  <span>Armazenamento IndexedDB & Modo Sem Internet</span>
                </h3>
                <p className="text-[11px] text-[var(--app-text-muted)]">
                  O Brain Studio salva suas tarefas, flashcards e trilhas do AVA no seu dispositivo para estudo sem sinal de internet.
                </p>
              </div>

              {onOpenOfflineDetail && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOfflineDetail();
                  }}
                  className="w-full p-4 rounded-2xl bg-[var(--app-card-secondary)] hover:bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)]/15 flex items-center justify-center text-[var(--app-primary)]">
                      <Database className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="block font-black">Gerenciar Cache Offline</span>
                      <span className="text-[11px] text-[var(--app-text-muted)]">
                        Baixar apostilas, módulos e limpar dados locais
                      </span>
                    </div>
                  </div>
                  <span className="text-[var(--app-primary)] font-bold">Gerenciar →</span>
                </button>
              )}

              <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                <h4 className="text-xs font-bold text-rose-500 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Zona de Redefinição</span>
                </h4>
                <p className="text-[11px] text-[var(--app-text-muted)]">
                  Redefinir o aplicativo apagará dados locais salvos em cache neste dispositivo e restaurará as opções de fábrica.
                </p>
                <button
                  type="button"
                  onClick={handleFullReset}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Redefinir Dados Locais</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABA 6: PLANOS & QUOTAS LUMINA */}
          {/* ======================================================== */}
          {activeTab === "planos" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                    Status da Assinatura
                  </span>
                  <span className="text-xs font-bold text-[var(--app-text)]">
                    Plano Gratuito
                  </span>
                </div>
                <h3 className="text-sm font-black text-[var(--app-text)]">
                  Brain Studio Pro • Tutora Lumina IA Ilimitada
                </h3>
                <p className="text-[11px] text-[var(--app-text-muted)]">
                  Estudantes do IFES têm acesso a recursos essenciais gratuitamente. O plano Pro desbloqueia perguntas ilimitadas com a Lumina IA e simulados expandidos.
                </p>
              </div>

              {onOpenPaywall && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPaywall();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Crown className="w-4 h-4" />
                  <span>Conhecer Planos Brain Studio Pro</span>
                </button>
              )}

              <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] space-y-1.5">
                <span className="font-bold text-[var(--app-text)] block">
                  Compromisso com a Acessibilidade e Inclusão:
                </span>
                <p className="text-[11px]">
                  {t("loja.recursos_gratuitos_aviso")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Fixo (shrink-0) */}
        <div className="p-4 sm:p-5 border-t border-[var(--app-border)] bg-[var(--app-card)] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={resetDefaults}
            className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-secondary)] hover:bg-[var(--app-card)] text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-black min-h-[44px] cursor-pointer transition shadow-xs"
          >
            {t("comum.concluir")}
          </button>
        </div>
      </div>
    </div>
  );
};
