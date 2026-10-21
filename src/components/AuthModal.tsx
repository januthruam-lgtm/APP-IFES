import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Lock,
  User,
  CheckCircle2,
  Building2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Globe,
  Eye,
  EyeOff,
  GraduationCap,
} from "lucide-react";
import { IfesAccountInfo } from "../types";
import { BrandLogoBanner } from "./BrandLogoBanner";
import { IFES_CAMPUSES_LIST } from "../data/ifesCampuses";
import { avaConnectionManager } from "../utils/avaConnectionManager";

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (email: string, name?: string, ifesAccount?: IfesAccountInfo) => void;
}

const CAMPUS_OPTIONS = IFES_CAMPUSES_LIST;

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLogin }) => {
  const { t } = useTranslation();
  const [authType, setAuthType] = useState<"ifes" | "standard">("ifes");

  // Campos rigorosamente vazios por padrão (sem valor prévio, sem conta de exemplo)
  const [campusUrl, setCampusUrl] = useState("https://ava3.cefor.ifes.edu.br");
  const [realName, setRealName] = useState("");
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isIfesLoading, setIsIfesLoading] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // Limpa rigorosamente o formulário ao abrir e elimina qualquer cache residual de último e-mail
  useEffect(() => {
    if (isOpen) {
      setRealName("");
      setMatricula("");
      setPassword("");
      setEmail("");
      setRememberMe(false);
      setMessage(null);
      setIsIfesLoading(false);

      try {
        localStorage.removeItem("brain_studio_last_email");
        localStorage.removeItem("brain_studio_last_user");
        sessionStorage.removeItem("brain_studio_temp_auth");
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleIfesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!matricula.trim()) {
      setMessage({ text: t("auth.erro_matricula", "Informe sua matrícula ou usuário do AVA IFES."), type: "error" });
      return;
    }

    if (!password.trim()) {
      setMessage({ text: t("auth.erro_senha", "Informe sua senha de acesso ao AVA IFES."), type: "error" });
      return;
    }

    setIsIfesLoading(true);
    try {
      const campusObj = CAMPUS_OPTIONS.find((c) => c.url === campusUrl);
      const campusName = campusObj ? campusObj.name : "IFES - Cefor";

      // Conexão segura com o AVA IFES
      const connectRes = await avaConnectionManager.connectAva({
        campusUrl,
        campusName,
        username: matricula.trim(),
        password: password.trim(),
        isPermanent: rememberMe,
        uid: email.trim() || matricula.trim(),
      });

      if (!connectRes.success) {
        setMessage({
          text: connectRes.error || t("auth.erro_credenciais", "Nome de usuário ou senha incorretos no AVA IFES. Verifique seus dados."),
          type: "error",
        });
        setIsIfesLoading(false);
        return;
      }

      const ifesAccount: IfesAccountInfo = connectRes.account || {
        connected: true,
        username: matricula.trim(),
        fullname: realName.trim() || matricula.trim(),
        matricula: matricula.trim(),
        email: email.trim(),
        campusUrl,
        campusName,
        department: "Ensino Técnico / Graduação IFES",
        lastSync: "Conectado em " + new Date().toLocaleDateString(),
        token: "moodle_auth_student_token",
      };

      setMessage({
        text: t("auth.sucesso_login", "Conectado com sucesso ao AVA IFES!"),
        type: "success",
      });

      setTimeout(() => {
        onLogin(email.trim(), realName.trim() || ifesAccount.fullname, ifesAccount);
      }, 400);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : t("auth.erro_conexao", "Erro na conexão com o AVA IFES.");
      setMessage({
        text: errMsg,
        type: "error",
      });
    } finally {
      setIsIfesLoading(false);
    }
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !realName.trim()) {
      setMessage({ text: t("auth.erro_preenchimento", "Preencha seu nome e e-mail."), type: "error" });
      return;
    }

    onLogin(email.trim(), realName.trim());
  };

  return (
    <div
      id="auth-screen"
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[var(--app-card)] text-[var(--app-text)] p-5 sm:p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-[var(--app-border)] relative overflow-hidden max-h-[92dvh] flex flex-col">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--app-primary)] opacity-10 blur-[100px] pointer-events-none" />

        {/* Brand Logo Banner */}
        <div className="mb-3 relative z-10 shrink-0">
          <BrandLogoBanner compact className="w-full" />
        </div>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--app-border)] relative z-10 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/15 border border-[var(--app-primary)]/30 flex items-center justify-center shrink-0 text-[var(--app-primary)]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--app-text)]">
              {t("auth.titulo", "Brain Studio • Acesso IFES")}
            </h2>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              {t("auth.subtitulo", "Identificação institucional e ambiente de estudos")}
            </p>
          </div>
        </div>

        {/* Auth Method Selector */}
        <div className="flex p-1 bg-[var(--app-card-secondary)] rounded-xl border border-[var(--app-border)] my-3 relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => {
              setAuthType("ifes");
              setMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authType === "ifes"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Matrícula IFES</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthType("standard");
              setMessage(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              authType === "standard"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>E-mail Pessoal</span>
          </button>
        </div>

        {/* Formulário com rolagem segura */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {authType === "ifes" ? (
            <form onSubmit={handleIfesSubmit} className="space-y-3 relative z-10" autoComplete="off">
              {/* Campus Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>Campus / Instância AVA</span>
                </label>
                <select
                  id="auth-campus-select"
                  value={campusUrl}
                  onChange={(e) => setCampusUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition cursor-pointer min-h-[44px]"
                >
                  {CAMPUS_OPTIONS.map((c, idx) => (
                    <option key={`auth-campus-opt-${c.id || idx}`} value={c.url}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>Nome do Estudante</span>
                </label>
                <input
                  id="auth-student-name"
                  type="text"
                  autoComplete="off"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder={t("auth.placeholder_nome", "Seu nome completo")}
                  className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                  required
                />
              </div>

              {/* Matricula & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                    <span>Matrícula</span>
                  </label>
                  <input
                    id="auth-matricula-input"
                    type="text"
                    autoComplete="off"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder={t("auth.placeholder_matricula", "Sua matrícula")}
                    className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                    <span>E-mail</span>
                  </label>
                  <input
                    id="auth-email-input"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.placeholder_email", "Seu e-mail")}
                    className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                    required
                  />
                </div>
              </div>

              {/* Password input com autoComplete="new-password" */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                    <span>Senha do AVA IFES</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-[var(--app-text-muted)] hover:text-[var(--app-text)] flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
                  </button>
                </div>
                <input
                  id="auth-password-input"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.placeholder_senha", "Sua senha do AVA")}
                  className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                  required
                />
              </div>

              {/* Lembrar de mim - Inicia sempre desmarcado */}
              <label className="flex items-center gap-2 text-xs text-[var(--app-text-muted)] cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--app-primary)] cursor-pointer"
                />
                <span>Lembrar minhas credenciais neste dispositivo</span>
              </label>

              {/* Mensagem de Feedback */}
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    message.type === "error"
                      ? "bg-rose-500/15 border border-rose-500/30 text-rose-500"
                      : "bg-[var(--app-success)]/15 border border-[var(--app-success)]/30 text-[var(--app-success)]"
                  }`}
                >
                  {message.type === "error" ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isIfesLoading}
                className="w-full py-3 bg-[var(--app-primary)] hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
              >
                {isIfesLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Conectando ao AVA IFES...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Entrar no Brain Studio</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STANDARD EMAIL FORM */
            <form onSubmit={handleStandardSubmit} className="space-y-3.5 relative z-10" autoComplete="off">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>Nome Completo</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  placeholder={t("auth.placeholder_nome", "Seu nome completo")}
                  className="w-full px-3.5 py-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>E-mail</span>
                </label>
                <input
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.placeholder_email", "Seu e-mail")}
                  className="w-full px-3.5 py-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                  required
                />
              </div>

              {message && (
                <div className="p-3 rounded-xl text-xs bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[var(--app-primary)] hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
              >
                <span>Entrar no Brain Studio</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
