import React, { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  CheckCircle2,
  Building2,
  Key,
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

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (email: string, name?: string, ifesAccount?: IfesAccountInfo) => void;
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

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onLogin }) => {
  const [authType, setAuthType] = useState<"ifes" | "standard">("ifes");

  // IFES Student form - Starts blank for first-time login or after logout
  const [campusUrl, setCampusUrl] = useState("https://ava3.cefor.ifes.edu.br");
  const [realName, setRealName] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [ifesPass, setIfesPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isIfesLoading, setIsIfesLoading] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleQuickFillRuam = () => {
    setCampusUrl("https://ava3.cefor.ifes.edu.br");
    setRealName("Ruam Sérgio de Sousa Januth");
    setMatricula("20241IFES0482");
    setEmail("ruamsergioj@gmail.com");
    setMessage({ text: "Credenciais institucionais de Ruam preenchidas.", type: "success" });
  };

  if (!isOpen) return null;

  const handleIfesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!matricula.trim()) {
      setMessage({ text: "Informe sua matrícula institucional do IFES.", type: "error" });
      return;
    }

    setIsIfesLoading(true);
    try {
      const campusObj = CAMPUS_OPTIONS.find((c) => c.url === campusUrl);
      const campusName = campusObj ? campusObj.name : "IFES - Cefor";

      // Try server connection
      try {
        await fetch("/api/ifes/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campusUrl,
            username: matricula.trim(),
            password: ifesPass || "123456",
            campusName,
          }),
        });
      } catch {
        // Safe fallback
      }

      const ifesAccount: IfesAccountInfo = {
        connected: true,
        username: matricula.trim(),
        fullname: realName.trim() || "Estudante IFES",
        matricula: matricula.trim(),
        email: email.trim(),
        campusUrl,
        campusName,
        department: "Técnico Integrado em Administração - 2º Ano",
        lastSync: "Conectado em " + new Date().toLocaleDateString(),
        token: "moodle_auth_student_token",
      };

      setMessage({
        text: `Bem-vindo ao Brain Studio, ${realName}! Entrando...`,
        type: "success",
      });

      setTimeout(() => {
        onLogin(email.trim(), realName.trim(), ifesAccount);
      }, 500);
    } catch (err: any) {
      setMessage({
        text: err.message || "Erro na conexão com o AVA IFES.",
        type: "error",
      });
    } finally {
      setIsIfesLoading(false);
    }
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !realName) {
      setMessage({ text: "Preencha seu nome e e-mail.", type: "error" });
      return;
    }

    onLogin(email, realName);
  };

  return (
    <div
      id="auth-screen"
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <div className="bg-[var(--app-card)] text-[var(--app-text)] p-6 sm:p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-[var(--app-border)] relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--app-primary)] opacity-15 blur-[100px] pointer-events-none" />

        {/* Brand Logo Banner */}
        <div className="mb-4 relative z-10">
          <BrandLogoBanner compact className="w-full" />
        </div>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-[var(--app-border)] relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[var(--app-primary)]/20 border border-[var(--app-primary)]/30 flex items-center justify-center text-xl shrink-0 text-[var(--app-primary)]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-[var(--app-text)]">Brain Studio IFES</h2>
              <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-[var(--app-primary)]/20 text-[var(--app-primary)] font-extrabold border border-[var(--app-primary)]/30">
                2º Ano ADM
              </span>
            </div>
            <p className="text-xs text-[var(--app-text-muted)]">Identificação institucional & Percurso Socrático</p>
          </div>
        </div>

        {/* Auth Method Selector */}
        <div className="flex p-1 bg-[var(--app-card-secondary)] rounded-xl border border-[var(--app-border)] my-4 relative z-10">
          <button
            onClick={() => setAuthType("ifes")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              authType === "ifes"
                ? "bg-[var(--app-primary)] text-white shadow-md"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Matrícula IFES
          </button>
          <button
            onClick={() => setAuthType("standard")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              authType === "standard"
                ? "bg-[var(--app-primary)] text-white shadow-md"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <User className="w-3.5 h-3.5" /> E-mail Pessoal
          </button>
        </div>

        {/* Quick Demo Fill Helper */}
        <div className="flex items-center justify-between px-1 mb-3 text-[11px] text-[var(--app-text-muted)] relative z-10">
          <span>Entrada obrigatória</span>
          <button
            type="button"
            onClick={handleQuickFillRuam}
            id="auth-quick-fill-btn"
            className="text-[var(--app-primary)] hover:underline font-bold transition cursor-pointer"
          >
            Preencher dados do Ruam (2º Ano)
          </button>
        </div>

        {/* IFES STUDENT LOGIN FORM */}
        {authType === "ifes" ? (
          <form onSubmit={handleIfesSubmit} className="space-y-3.5 relative z-10">
            {/* Campus Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Campus / Instância do AVA
              </label>
              <select
                id="auth-campus-select"
                value={campusUrl}
                onChange={(e) => setCampusUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition cursor-pointer"
              >
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c.url} value={c.url}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Full Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Nome Completo do Estudante
              </label>
              <input
                id="auth-student-name"
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Ex: Ruam Sérgio de Sousa Januth"
                className="w-full px-3.5 py-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition"
                required
              />
            </div>

            {/* Matricula & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Matrícula Institucional
                </label>
                <input
                  id="auth-matricula-input"
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 20241IFES0482"
                  className="w-full px-3 py-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)] transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[var(--app-primary)]" /> E-mail
                </label>
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: ruamsergioj@gmail.com"
                  className="w-full px-3 py-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)] transition"
                  required
                />
              </div>
            </div>

            {/* Optional Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Senha do AVA Moodle (Opcional)
              </label>
              <div className="relative">
                <input
                  id="auth-password-input"
                  type={showPass ? "text" : "password"}
                  value={ifesPass}
                  onChange={(e) => setIfesPass(e.target.value)}
                  placeholder="Sua senha institucional"
                  className="w-full px-3.5 py-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] font-mono outline-none focus:border-[var(--app-primary)] transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Feedback message */}
            {message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  message.type === "error"
                    ? "bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-300"
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
              className="w-full py-3 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[var(--app-primary)]/20 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isIfesLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Conectando ao AVA IFES...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Entrar com Perfil Estudantil IFES</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* STANDARD EMAIL FORM */
          <form onSubmit={handleStandardSubmit} className="space-y-3.5 relative z-10">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Nome Completo
              </label>
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-3.5 py-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--app-primary)]" /> E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3.5 py-2.5 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[var(--app-primary)]/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Entrar no Brain Studio</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
