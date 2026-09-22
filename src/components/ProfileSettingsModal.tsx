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
import { loadQAcademicoAccount, saveQAcademicoAccount } from "../utils/qacademicoStorage";
import { saveUserQAcademicoCreds, saveUserMoodleCreds } from "../lib/firebase";

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

  // Separate credentials state
  const [moodleUsername, setMoodleUsername] = useState(
    user.ifesAccount?.username || user.ifesAccount?.matricula || "20241IFES0482"
  );
  const [moodlePassword, setMoodlePassword] = useState(user.ifesAccount?.password || "");

  const existingQAcademico = loadQAcademicoAccount();
  const [qacademicoMatricula, setQacademicoMatricula] = useState(
    user.qacademicoAccount?.matricula || existingQAcademico?.matricula || ""
  );
  const [qacademicoPassword, setQacademicoPassword] = useState("");

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

    // 1. Update Moodle / AVA Account cleanly
    const updatedIfesAccount: IfesAccountInfo = {
      ...user.ifesAccount,
      connected: true,
      username: moodleUsername.trim() || user.ifesAccount?.username || "20241IFES0482",
      password: moodlePassword.trim() || user.ifesAccount?.password,
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

    // 2. Update Q-Acadêmico Account cleanly without touching Moodle credentials
    if (qacademicoMatricula.trim()) {
      const qAccount = {
        connected: true,
        matricula: qacademicoMatricula.trim(),
        fullname: name.trim() || user.name,
        curso: courseProgram.trim(),
        campus: campusName,
        portalUrl: "https://academico.ifes.edu.br/qacademico/index.asp?t=2000",
        lastSync: new Date().toISOString(),
      };
      saveQAcademicoAccount(qAccount);
      saveUserQAcademicoCreds(userId, {
        matricula: qacademicoMatricula.trim(),
        senha: qacademicoPassword ? qacademicoPassword.trim() : undefined,
        campus: campusName,
        lastUpdated: Date.now(),
      });
    }

    // Save Moodle creds to Firebase store if available
    saveUserMoodleCreds(userId, {
      username: moodleUsername.trim(),
      password: moodlePassword ? moodlePassword.trim() : undefined,
      campusUrl: cleanUrl || campusUrl,
      lastUpdated: Date.now(),
    });

    onSaveUser({
      name: name.trim(),
      email: email.trim(),
      ifesAccount: updatedIfesAccount,
      qacademicoAccount: qacademicoMatricula.trim()
        ? {
            connected: true,
            matricula: qacademicoMatricula.trim(),
            fullname: name.trim(),
            curso: courseProgram.trim(),
            campus: campusName,
            portalUrl: "https://academico.ifes.edu.br/qacademico/index.asp?t=2000",
            lastSync: new Date().toISOString(),
          }
        : user.qacademicoAccount,
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
            {/* Student Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Nome Completo
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

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--app-primary)]" /> E-mail Institucional
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

            {/* SEPARATE CREDENTIAL SECTION: AVA MOODLE IFES */}
            <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎓</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
                    Credenciais AVA Moodle IFES
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                  Moodle Oficial
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Usuário / Matrícula AVA
                  </label>
                  <input
                    id="profile-edit-moodle-user"
                    type="text"
                    value={moodleUsername}
                    onChange={(e) => setMoodleUsername(e.target.value)}
                    placeholder="Ex: 20241IFES0482"
                    className="w-full px-3.5 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Senha do AVA (Opcional)
                  </label>
                  <input
                    id="profile-edit-moodle-pass"
                    type="password"
                    value={moodlePassword}
                    onChange={(e) => setMoodlePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                  Campus / Instância AVA
                </label>
                <select
                  id="profile-edit-campus"
                  value={campusUrl}
                  onChange={(e) => handleCampusChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition cursor-pointer"
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c.url} value={c.url}>
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
                      <span>Abrir</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <input
                  id="profile-edit-direct-link"
                  type="text"
                  value={directAvaLink}
                  onChange={(e) => setDirectAvaLink(e.target.value)}
                  placeholder="Ex: https://ava3.cefor.ifes.edu.br"
                  className="w-full px-3.5 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)]"
                />
              </div>
            </div>

            {/* SEPARATE CREDENTIAL SECTION: Q-ACADÊMICO IFES */}
            <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
                    Credenciais Q-Acadêmico IFES
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                  Boletim & Histórico
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Matrícula Q-Acadêmico
                  </label>
                  <input
                    id="profile-edit-qacademico-user"
                    type="text"
                    value={qacademicoMatricula}
                    onChange={(e) => setQacademicoMatricula(e.target.value)}
                    placeholder="Ex: 20241IFES0482"
                    className="w-full px-3.5 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Senha Q-Acadêmico
                  </label>
                  <input
                    id="profile-edit-qacademico-pass"
                    type="password"
                    value={qacademicoPassword}
                    onChange={(e) => setQacademicoPassword(e.target.value)}
                    placeholder="Senha do Portal Acadêmico"
                    className="w-full px-3.5 py-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)]"
                  />
                </div>
              </div>

              <p className="text-[10px] text-[var(--app-text-muted)]">
                Segregação total: o login do Q-Acadêmico é armazenado isoladamente para evitar qualquer interferência nas credenciais do AVA Moodle.
              </p>
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
                  className="w-full py-2.5 px-3 bg-[var(--app-primary)]/10 hover:bg-[var(--app-primary)]/20 text-[var(--app-primary)] border border-[var(--app-primary)]/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-[var(--app-primary)]" />
                  <span>{inviteCopiedToast ? "Link Copiado!" : "Convidar Amigos"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFullReset}
                  className="w-full py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 text-rose-500" />
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
                  className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
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
