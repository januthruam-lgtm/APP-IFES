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
  KeyRound,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { IfesAccountInfo } from "../types";
import { BrandLogoBanner } from "./BrandLogoBanner";
import { IFES_CAMPUSES_LIST } from "../data/ifesCampuses";
import { avaConnectionManager } from "../utils/avaConnectionManager";
import {
  cadastrarComEmailESenha,
  entrarComEmailESenha,
  entrarComGoogle,
  enviarEmailRecuperacaoSenha,
  getAuthErrorMessage,
} from "../services/authService";

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (email: string, name?: string, ifesAccount?: IfesAccountInfo, avatar?: string) => void;
}

const CAMPUS_OPTIONS = IFES_CAMPUSES_LIST;

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLogin }) => {
  const { t } = useTranslation();
  const [authType, setAuthType] = useState<"ifes" | "standard">("standard");
  const [standardMode, setStandardMode] = useState<"login" | "cadastro" | "recuperar">("login");

  // Campos de entrada
  const [realName, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Campos IFES
  const [campusUrl, setCampusUrl] = useState("https://ava3.cefor.ifes.edu.br");
  const [matricula, setMatricula] = useState("");

  // Estados de loading e mensagens de feedback
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // Limpa o formulário ao abrir
  useEffect(() => {
    if (isOpen) {
      setRealName("");
      setMatricula("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");
      setRememberMe(false);
      setMessage(null);
      setIsLoading(false);
      setStandardMode("login");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Fluxo de Autenticação com IFES
  const handleIfesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!matricula.trim()) {
      setMessage({
        text: t("auth.erro_matricula", "Informe sua matrícula ou usuário do AVA IFES."),
        type: "error",
      });
      return;
    }

    if (!password.trim()) {
      setMessage({
        text: t("auth.erro_senha", "Informe sua senha de acesso ao AVA IFES."),
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const campusObj = CAMPUS_OPTIONS.find((c) => c.url === campusUrl);
      const campusName = campusObj ? campusObj.name : "IFES - Cefor";

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
          text:
            connectRes.error ||
            t(
              "auth.erro_credenciais",
              "Nome de usuário ou senha incorretos no AVA IFES. Verifique seus dados."
            ),
          type: "error",
        });
        setIsLoading(false);
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
      const errMsg =
        err instanceof Error ? err.message : t("auth.erro_conexao", "Erro na conexão com o AVA IFES.");
      setMessage({ text: errMsg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fluxo de Autenticação com Conta do Google
  const handleGoogleLogin = async () => {
    setMessage(null);
    setIsLoading(true);
    try {
      const { user: fbUser, profile, confirmationMessage } = await entrarComGoogle();
      const studentName = fbUser.displayName || profile.name || "Estudante";
      setMessage({
        text: `Login com Google realizado! ${confirmationMessage}`,
        type: "success",
      });
      setTimeout(() => {
        onLogin(
          fbUser.email || profile.email,
          studentName,
          undefined,
          fbUser.photoURL || undefined
        );
      }, 700);
    } catch (err: any) {
      console.warn("Erro no login com Google:", err);
      setMessage({ text: getAuthErrorMessage(err.code || ""), type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fluxo de Autenticação Padrão (Firebase Auth: Login, Cadastro, Recuperação)
  const handleStandardAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Modo: Redefinição de Senha
    if (standardMode === "recuperar") {
      if (!email.trim()) {
        setMessage({ text: "Informe seu e-mail para receber o link de recuperação.", type: "error" });
        return;
      }
      setIsLoading(true);
      try {
        await enviarEmailRecuperacaoSenha(email.trim());
        setMessage({
          text: "E-mail de recuperação enviado! Verifique sua caixa de entrada e spam.",
          type: "success",
        });
      } catch (err: any) {
        setMessage({ text: getAuthErrorMessage(err.code || ""), type: "error" });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Validações básicas de e-mail e senha
    if (!email.trim() || !password.trim()) {
      setMessage({ text: "Preencha seu e-mail e senha.", type: "error" });
      return;
    }

    // Modo: Cadastro
    if (standardMode === "cadastro") {
      if (!realName.trim()) {
        setMessage({ text: "Informe seu nome completo.", type: "error" });
        return;
      }
      if (password.length < 6) {
        setMessage({ text: "A senha deve conter no mínimo 6 caracteres.", type: "error" });
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ text: "As senhas não coincidem. Digite novamente.", type: "error" });
        return;
      }

      setIsLoading(true);
      try {
        const { user: fbUser, profile, confirmationMessage } = await cadastrarComEmailESenha(
          email.trim(),
          password.trim(),
          realName.trim()
        );
        setMessage({
          text: `Conta criada com sucesso! ${confirmationMessage}`,
          type: "success",
        });
        setTimeout(() => {
          onLogin(fbUser.email || email.trim(), realName.trim() || profile.name);
        }, 700);
      } catch (err: any) {
        setMessage({ text: getAuthErrorMessage(err.code || ""), type: "error" });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Modo: Login
    setIsLoading(true);
    try {
      const { user: fbUser, profile, confirmationMessage } = await entrarComEmailESenha(
        email.trim(),
        password.trim()
      );
      setMessage({
        text: `Login realizado com sucesso! ${confirmationMessage}`,
        type: "success",
      });
      setTimeout(() => {
        onLogin(fbUser.email || email.trim(), fbUser.displayName || profile.name);
      }, 700);
    } catch (err: any) {
      setMessage({ text: getAuthErrorMessage(err.code || ""), type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-screen"
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-[var(--app-card)] text-[var(--app-text)] p-5 sm:p-7 rounded-[2rem] shadow-2xl w-full max-w-md border border-[var(--app-border)] relative overflow-hidden max-h-[94dvh] flex flex-col">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--app-primary)] opacity-10 blur-[100px] pointer-events-none" />

        {/* Brand Logo Banner */}
        <div className="mb-2 relative z-10 shrink-0">
          <BrandLogoBanner compact className="w-full" />
        </div>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[var(--app-border)] relative z-10 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/15 border border-[var(--app-primary)]/30 flex items-center justify-center shrink-0 text-[var(--app-primary)]">
            {authType === "ifes" ? (
              <GraduationCap className="w-5 h-5" />
            ) : (
              <KeyRound className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--app-text)]">
              {authType === "ifes"
                ? "Brain Studio • Acesso IFES"
                : standardMode === "cadastro"
                ? "Criar Conta no Brain Studio"
                : standardMode === "recuperar"
                ? "Recuperar Minha Senha"
                : "Entrar no Brain Studio"}
            </h2>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              {authType === "ifes"
                ? "Identificação institucional e ambiente de estudos"
                : "Ambiente autônomo com IA, gamificação e tutoria socrática"}
            </p>
          </div>
        </div>

        {/* Auth Method Selector */}
        <div className="flex p-1 bg-[var(--app-card-secondary)] rounded-xl border border-[var(--app-border)] my-3 relative z-10 shrink-0">
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
            <Mail className="w-3.5 h-3.5" />
            <span>E-mail e Senha</span>
          </button>
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
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 pr-0.5 space-y-3 relative z-10 scrollbar-none">
          {authType === "ifes" ? (
            /* ================= IFES FORM ================= */
            <form onSubmit={handleIfesSubmit} className="space-y-3" autoComplete="off">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>Campus do IFES</span>
                </label>
                <select
                  value={campusUrl}
                  onChange={(e) => setCampusUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition min-h-[44px] cursor-pointer"
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={`auth-campus-${c.id}`} value={c.url} className="bg-[var(--app-card)] text-[var(--app-text)]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>Matrícula / Usuário AVA</span>
                </label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 20241IFES0482"
                  className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                    <span>Senha do AVA</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-primary)] flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha do AVA IFES"
                  className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                  required
                />
              </div>

              {/* Feedback Message */}
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    message.type === "error"
                      ? "bg-rose-500/15 border border-rose-500/30 text-rose-500"
                      : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
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
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[var(--app-primary)] hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Conectando ao AVA IFES...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Entrar com Matrícula IFES</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= STANDARD FIREBASE AUTH FORM ================= */
            <form onSubmit={handleStandardAuthSubmit} className="space-y-3" autoComplete="off">
              {/* Abas Internas: Entrar vs Cadastrar (quando não está recuperando senha) */}
              {standardMode !== "recuperar" && (
                <div className="flex items-center justify-between pb-1 text-xs">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStandardMode("login");
                        setMessage(null);
                      }}
                      className={`font-bold pb-1 border-b-2 cursor-pointer transition ${
                        standardMode === "login"
                          ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                          : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                      }`}
                    >
                      Já tenho conta (Entrar)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStandardMode("cadastro");
                        setMessage(null);
                      }}
                      className={`font-bold pb-1 border-b-2 cursor-pointer transition ${
                        standardMode === "cadastro"
                          ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                          : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                      }`}
                    >
                      Cadastrar nova conta
                    </button>
                  </div>
                </div>
              )}

              {/* Botão Oficial: Conectar com a Conta do Google */}
              {standardMode !== "recuperar" && (
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 font-bold text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 shadow-xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 min-h-[46px]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar com o Google</span>
                  </button>

                  <div className="relative flex py-0.5 items-center">
                    <div className="flex-grow border-t border-[var(--app-border)]"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                      ou com e-mail
                    </span>
                    <div className="flex-grow border-t border-[var(--app-border)]"></div>
                  </div>
                </div>
              )}

              {/* Botão Voltar caso esteja na tela de recuperação */}
              {standardMode === "recuperar" && (
                <button
                  type="button"
                  onClick={() => {
                    setStandardMode("login");
                    setMessage(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--app-primary)] hover:underline cursor-pointer mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para o login</span>
                </button>
              )}

              {/* Campo Nome (Apenas em Cadastro) */}
              {standardMode === "cadastro" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                    <span>Nome Completo</span>
                  </label>
                  <input
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                    required
                  />
                </div>
              )}

              {/* Campo E-mail */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>E-mail</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                  required
                />
              </div>

              {/* Campo Senha (Em Login e Cadastro) */}
              {standardMode !== "recuperar" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                      <span>Senha</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-primary)] flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      standardMode === "cadastro"
                        ? "Mínimo 6 caracteres"
                        : "Sua senha de acesso"
                    }
                    className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                    required
                  />
                </div>
              )}

              {/* Confirmar Senha (Apenas em Cadastro) */}
              {standardMode === "cadastro" && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                    <span>Confirmar Senha</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita sua senha"
                    className="w-full px-3 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)] transition min-h-[44px]"
                    required
                  />
                </div>
              )}

              {/* Link Esqueci Minha Senha (Apenas em Login) */}
              {standardMode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setStandardMode("recuperar");
                      setMessage(null);
                    }}
                    className="text-[11px] text-[var(--app-primary)] hover:underline font-bold cursor-pointer"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}

              {/* Feedback Message */}
              {message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    message.type === "error"
                      ? "bg-rose-500/15 border border-rose-500/30 text-rose-500"
                      : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
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

              {/* Botão de Envio Principal */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[var(--app-primary)] hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : standardMode === "cadastro" ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Criar Minha Conta</span>
                  </>
                ) : standardMode === "recuperar" ? (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Enviar Link de Recuperação</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Entrar no Brain Studio</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
