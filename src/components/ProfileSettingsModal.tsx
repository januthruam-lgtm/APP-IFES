import React, { useState } from "react";
import {
  User,
  Mail,
  Building2,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Save,
  Trash2,
  AlertTriangle,
  QrCode,
  ExternalLink,
  Link,
  Share2,
  RotateCcw,
} from "lucide-react";
import { UserProfile, IfesAccountInfo } from "../types";
import confetti from "canvas-confetti";
import { PWAInstallButton } from "./PWAInstallButton";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveUser: (updatedUser: Partial<UserProfile>) => void;
  onResetCourses?: () => void;
}

const CAMPUS_OPTIONS = [
  { name: "IFES Cefor AVA3 (ava3.cefor.ifes.edu.br)", url: "https://ava3.cefor.ifes.edu.br" },
  { name: "IFES AVA Geral (Presencial e Híbrido)", url: "https://ava.ifes.edu.br" },
  { name: "IFES Campus Serra", url: "https://ava.serra.ifes.edu.br" },
  { name: "IFES Campus Vitória", url: "https://ava.vitoria.ifes.edu.br" },
  { name: "IFES Cefor (EaD e Cursos Abertos)", url: "https://ava.cefor.ifes.edu.br" },
  { name: "IFES Pós-Graduação", url: "https://ava.pos.ifes.edu.br" },
  { name: "IFES EaD", url: "https://avaead.ifes.edu.br" },
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
  onResetCourses,
}) => {
  const [name, setName] = useState(user.name || "Ruam Sérgio de Sousa Januth");
  const [email, setEmail] = useState(user.email || "ruamsergioj@gmail.com");
  const [matricula, setMatricula] = useState(
    user.ifesAccount?.matricula || user.ifesAccount?.username || "20241IFES0482"
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

  if (!isOpen) return null;

  const handleInviteFriends = async () => {
    const shareData = {
      title: "Brain Studio - Moodle IFES",
      text: "Estude comigo no Brain Studio! Chamadas de vídeo estilo Instagram, resumos com Lumina IA e sincronização AVA IFES.",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share dismissed", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setInviteCopiedToast(true);
      setTimeout(() => setInviteCopiedToast(false), 3000);
    }
  };

  const handleFullReset = () => {
    if (
      confirm(
        "ATENÇÃO: Deseja resetar todo o aplicativo? Todos os dados locais, preferências e credenciais serão apagados."
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleCampusChange = (url: string) => {
    setCampusUrl(url);
    setDirectAvaLink(url);
    const found = CAMPUS_OPTIONS.find((c) => c.url === url);
    if (found) {
      setCampusName(found.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = directAvaLink.trim().startsWith("http")
      ? directAvaLink.trim()
      : `https://${directAvaLink.trim()}`;

    const updatedIfesAccount: IfesAccountInfo = {
      connected: true,
      username: matricula.trim() || user.ifesAccount?.username || "20241IFES0482",
      fullname: name.trim() || user.name,
      matricula: matricula.trim(),
      email: email.trim(),
      campusUrl: cleanUrl || campusUrl,
      campusName,
      department: courseProgram.trim(),
      lastSync: "Atualizado manualmente em " + new Date().toLocaleDateString(),
      token: user.ifesAccount?.token || "moodle_mobile_cefor_auth",
    };

    onSaveUser({
      name: name.trim(),
      email: email.trim(),
      ifesAccount: updatedIfesAccount,
    });

    setSavedToast(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  return (
    <>
      <div
        id="profile-settings-modal"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      >
        <div className="bg-[var(--app-card)] text-[var(--app-text)] p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-xl border border-[var(--app-border)] relative overflow-hidden max-h-[90vh] flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)] relative z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20 flex items-center justify-center text-[var(--app-primary)]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-[var(--app-text)] flex items-center gap-2">
                  Perfil & Matrícula IFES
                </h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Altere seu nome, e-mail, matrícula institucional e links do AVA
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--app-bg)] hover:bg-[var(--app-border)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 relative z-10 overflow-y-auto flex-1 pr-1">
            {/* Student Full Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Nome Completo do Estudante
              </label>
              <input
                id="profile-edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ruam Sérgio de Sousa Januth"
                className="w-full px-4 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none transition font-medium"
                required
              />
            </div>

            {/* Matricula & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Matrícula IFES
                </label>
                <input
                  id="profile-edit-matricula"
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 20241IFES0482"
                  className="w-full px-4 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none transition font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--app-primary)]" /> E-mail Institucional / Pessoal
                </label>
                <input
                  id="profile-edit-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: ruamsergioj@gmail.com"
                  className="w-full px-4 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none transition font-mono"
                  required
                />
              </div>
            </div>

            {/* Direct Link do Perfil AVA / Moodle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Link Direto do Perfil/Moodle AVA IFES
                </label>
                {directAvaLink && (
                  <a
                    href={directAvaLink.startsWith("http") ? directAvaLink : `https://${directAvaLink}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[var(--app-primary)] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Testar Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                id="profile-edit-direct-link"
                type="text"
                value={directAvaLink}
                onChange={(e) => setDirectAvaLink(e.target.value)}
                placeholder="Ex: https://ava3.cefor.ifes.edu.br ou link do seu perfil"
                className="w-full px-4 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none transition font-mono"
              />
              <p className="text-[10px] text-[var(--app-text-muted)]">
                O Brain Studio salvará este link oficial e disponibilizará um botão de <strong>Acesso Rápido ao AVA IFES</strong> no seu painel.
              </p>
            </div>

            {/* Campus Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Campus / Instância do AVA Moodle
              </label>
              <select
                id="profile-edit-campus"
                value={campusUrl}
                onChange={(e) => handleCampusChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition cursor-pointer"
              >
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c.url} value={c.url}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Program / Curso */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Curso / Turma / Período
              </label>
              <input
                id="profile-edit-program"
                type="text"
                value={courseProgram}
                onChange={(e) => setCourseProgram(e.target.value)}
                placeholder="Ex: Técnico Integrado em Administração - 2º Ano"
                className="w-full px-4 py-2.5 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none transition"
              />
            </div>

            {/* PWA App Installation & Social Sharing */}
            <div className="pt-2 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider block mb-2">
                  Instalação do Aplicativo (PWA)
                </label>
                <PWAInstallButton variant="card" />
              </div>

              {/* Convidar Amigos (Web Share API) & Resetar App */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleInviteFriends}
                  className="w-full py-2.5 px-3 bg-[#0d1127] hover:bg-[#151c3d] text-[#00f0ff] border border-[#00f0ff]/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-[#00f0ff]" />
                  <span>{inviteCopiedToast ? "Link Copiado!" : "Convidar Amigos"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFullReset}
                  className="w-full py-2.5 px-3 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 text-red-400" />
                  <span>Resetar Aplicativo</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border)]">
              {onResetCourses && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Deseja limpar as matérias para deixar o app limpo e sincronizar seus dados do AVA IFES?")) {
                      onResetCourses();
                      onClose();
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Matérias</span>
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[var(--app-bg)] hover:bg-[var(--app-border)] text-[var(--app-text)] rounded-xl text-xs font-bold transition cursor-pointer border border-[var(--app-border)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[var(--app-primary)] hover:opacity-90 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savedToast ? "Salvo!" : "Salvar Alterações"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
