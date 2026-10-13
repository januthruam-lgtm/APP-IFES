import React, { useState, useEffect } from "react";
import {
  Building2,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  X,
  Zap,
  Globe,
  Trash2,
  Sparkles,
  GraduationCap,
  Activity,
  Clipboard,
} from "lucide-react";
import { UserProfile, IfesCourse, IfesAssignment, IfesAccountInfo } from "../../types";
import { IFES_CAMPUSES_LIST, IfesCampusOption } from "../../data/ifesCampuses";
import { avaConnectionManager, AvaCredentialsInput } from "../../utils/avaConnectionManager";
import { extractCoursesFromAvaText, isMockOrPlaceholderCourse, saveSyncedCourses } from "../../utils/courseSync";
import confetti from "canvas-confetti";

interface AvaConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onConnectionSuccess: (account: IfesAccountInfo, courses: IfesCourse[]) => void;
  onDisconnect?: () => void;
}

export const AvaConnectModal: React.FC<AvaConnectModalProps> = ({
  isOpen,
  onClose,
  user,
  onConnectionSuccess,
  onDisconnect,
}) => {
  const [selectedCampusUrl, setSelectedCampusUrl] = useState<string>(
    user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br"
  );
  const [customCampusUrl, setCustomCampusUrl] = useState<string>("");
  const [isCustomCampus, setIsCustomCampus] = useState(false);

  const [username, setUsername] = useState<string>(
    user.ifesAccount?.username || user.ifesAccount?.matricula || ""
  );
  const [password, setPassword] = useState<string>("");
  const [authMode, setAuthMode] = useState<"credentials" | "paste">("credentials");
  const [pastedText, setPastedText] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPermanent, setIsPermanent] = useState(true);

  // States de progresso
  const [isLoading, setIsLoading] = useState(false);
  const [stepMessage, setStepMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Ping de diagnóstico
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [pingStatus, setPingStatus] = useState<string>("Verificando...");
  const [isPinging, setIsPinging] = useState(false);

  // Carrega credenciais salvas no cofre
  useEffect(() => {
    if (isOpen) {
      const loadSaved = async () => {
        const userId = user.id || user.uid || "local-student";
        const stored = await avaConnectionManager.getStoredCredentials(userId);
        if (stored) {
          if (stored.campusUrl) {
            const found = IFES_CAMPUSES_LIST.find((c) => c.url === stored.campusUrl);
            if (found) {
              setSelectedCampusUrl(stored.campusUrl);
              setIsCustomCampus(false);
            } else {
              setIsCustomCampus(true);
              setCustomCampusUrl(stored.campusUrl);
            }
          }
          if (stored.username) setUsername(stored.username);
          if (stored.password) setPassword(stored.password);
          setIsPermanent(stored.isPermanent !== false);
        }
      };
      loadSaved();
      runPingTest();
    }
  }, [isOpen]);

  const runPingTest = async () => {
    setIsPinging(true);
    const activeUrl = isCustomCampus && customCampusUrl ? customCampusUrl : selectedCampusUrl;
    try {
      const res = await avaConnectionManager.pingAva(activeUrl);
      setPingLatency(res.latencyMs);
      setPingStatus(res.statusText);
    } catch {
      setPingLatency(null);
      setPingStatus("Sem resposta");
    } finally {
      setIsPinging(false);
    }
  };

  if (!isOpen) return null;

  const currentCampusObj = IFES_CAMPUSES_LIST.find((c) => c.url === selectedCampusUrl);
  const campusName = isCustomCampus
    ? customCampusUrl || "IFES - URL Personalizada"
    : currentCampusObj?.name || "IFES - Cefor (AVA3)";
  const effectiveCampusUrl = isCustomCampus ? customCampusUrl.trim() : selectedCampusUrl;

  const handleQuickFillRuam = () => {
    setSelectedCampusUrl("https://ava3.cefor.ifes.edu.br");
    setIsCustomCampus(false);
    setUsername("20241IFES0482");
    setPassword("");
    setIsPermanent(true);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const userUid = user.id || user.uid || "local-student";

    if (authMode === "paste") {
      if (!pastedText.trim()) {
        setErrorMessage("Por favor, cole o texto copiado da página 'Meus Cursos' do AVA IFES.");
        return;
      }

      setIsLoading(true);
      setStepMessage("Processando e extraindo disciplinas do texto colado...");

      try {
        let extractedCourses: IfesCourse[] = [];
        try {
          const res = await fetch("/api/ava/import-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rawText: pastedText,
              campusName: campusName || "IFES - AVA",
            }),
          });
          const data = await res.json();
          if (Array.isArray(data.courses) && data.courses.length > 0) {
            extractedCourses = data.courses.filter((c: any) => !isMockOrPlaceholderCourse(c));
          }
        } catch {}

        if (extractedCourses.length === 0) {
          extractedCourses = extractCoursesFromAvaText(pastedText, campusName || "IFES - AVA");
        }

        if (extractedCourses.length === 0) {
          throw new Error("Não foi possível identificar matérias no texto. Copie o conteúdo da página 'Meus Cursos' do AVA.");
        }

        saveSyncedCourses(extractedCourses);

        const account: IfesAccountInfo = {
          connected: true,
          username: username || user.ifesAccount?.username || user.name,
          fullname: user.ifesAccount?.fullname || user.name,
          campusUrl: effectiveCampusUrl,
          campusName,
          matricula: username || user.ifesAccount?.matricula || "20241IFES0482",
          lastSync: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setStepMessage("Matérias importadas com sucesso!");
        setSuccessMessage(`Importadas ${extractedCourses.length} disciplina(s) reais diretamente do seu perfil do AVA!`);

        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {}

        try {
          localStorage.setItem("brain_studio_is_logged_in", "true");
        } catch {}

        setTimeout(() => {
          onConnectionSuccess(account, extractedCourses);
          onClose();
        }, 1200);
      } catch (err: any) {
        setErrorMessage(err.message || "Erro ao processar as matérias.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!username.trim() && authMode === "credentials") {
      setErrorMessage("Por favor, digite seu usuário ou matrícula institucional do IFES.");
      return;
    }

    if (!password.trim() && authMode === "credentials") {
      setErrorMessage("Por favor, digite sua senha de acesso ao AVA IFES.");
      return;
    }

    setIsLoading(true);
    setStepMessage("Conectando ao servidor do campus...");

    try {
      setTimeout(() => setStepMessage("Autenticando credenciais no AVA Moodle..."), 600);
      setTimeout(() => setStepMessage("Sincronizando disciplinas e grade curricular..."), 1300);

      const result = await avaConnectionManager.connectAva({
        campusUrl: effectiveCampusUrl,
        campusName,
        username: username.trim(),
        password: password.trim(),
        isPermanent,
        uid: userUid,
      });

      if (!result.success || !result.account) {
        throw new Error(result.error || "Falha na conexão com o AVA IFES.");
      }

      setStepMessage("Conexão estabelecida com sucesso!");
      const count = result.courses?.length || 0;
      setSuccessMessage(
        count > 0
          ? `Conectado ao perfil de ${result.account.fullname || username}! ${count} disciplinas reais integradas.`
          : `Conectado com sucesso ao perfil de ${result.account.fullname || username}! Nenhuma disciplina ativa retornada pelo Moodle.`
      );

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      try {
        localStorage.setItem("brain_studio_is_logged_in", "true");
      } catch {}

      setTimeout(() => {
        onConnectionSuccess(result.account!, result.courses || []);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Erro ao conectar com o AVA IFES. Verifique os dados digitados e tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm("Deseja realmente desconectar seu perfil do AVA IFES?")) {
      const userUid = user.id || user.uid || "local-student";
      await avaConnectionManager.clearCredentials(userUid);
      if (onDisconnect) {
        onDisconnect();
      }
      onClose();
    }
  };

  const isAlreadyConnected = !!user.ifesAccount?.connected;

  return (
    <div
      id="ava-connect-modal"
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="bg-[var(--app-card)] text-[var(--app-text)] w-full max-w-xl rounded-3xl sm:rounded-[2rem] border border-[var(--app-border)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header com Gradiente Temático do IFES */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600/15 via-teal-500/10 to-transparent border-b border-[var(--app-border)] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[var(--app-text)]">
                  Conexão com AVA IFES
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  PERMANENTE
                </span>
              </div>
              <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                Conexão oficial direta com Matrícula e Senha do AVA IFES. O app sincroniza suas matérias, notas e atividades reais automaticamente.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition border border-[var(--app-border)] cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Card de Status da Conexão Atual se já conectado */}
          {isAlreadyConnected && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                    Conexão Ativa & Estável
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--app-text-muted)]">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {pingLatency !== null ? `${pingLatency}ms` : "OK"} • {pingStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)]">
                  <span className="text-[10px] text-[var(--app-text-muted)] block">Estudante</span>
                  <strong className="font-bold truncate block">{user.ifesAccount?.fullname || user.name}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)]">
                  <span className="text-[10px] text-[var(--app-text-muted)] block">Matrícula / Usuário</span>
                  <strong className="font-mono font-bold truncate block">{user.ifesAccount?.matricula || username}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[var(--app-text-muted)]">
                  Campus: <strong className="text-[var(--app-text)]">{user.ifesAccount?.campusName || campusName}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Desconectar Conta</span>
                </button>
              </div>
            </div>
          )}

          {/* Seletor de Modo: Login Institucional vs Colar do Perfil */}
          <div className="flex p-1 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setAuthMode("credentials")}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === "credentials"
                  ? "bg-[var(--app-card)] text-[var(--app-primary)] shadow-xs"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Conexão Oficial: Matrícula + Senha</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("paste")}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === "paste"
                  ? "bg-[var(--app-card)] text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Colar Texto do Perfil / Meus Cursos</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campus Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--app-text)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Ambiente / Campus do AVA IFES</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomCampus(!isCustomCampus)}
                  className="text-[11px] text-[var(--app-primary)] hover:underline font-semibold cursor-pointer"
                >
                  {isCustomCampus ? "Escolher da lista oficial" : "Digitar outra URL"}
                </button>
              </label>

              {!isCustomCampus ? (
                <select
                  value={selectedCampusUrl}
                  onChange={(e) => {
                    setSelectedCampusUrl(e.target.value);
                    runPingTest();
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {IFES_CAMPUSES_LIST.map((campus, idx) => (
                    <option key={`conn-campus-opt-${campus.id || idx}`} value={campus.url}>
                      {campus.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="url"
                  placeholder="https://ava.seucampus.ifes.edu.br"
                  value={customCampusUrl}
                  onChange={(e) => setCustomCampusUrl(e.target.value)}
                  onBlur={runPingTest}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
              )}

              <div className="flex items-center justify-between text-[11px] text-[var(--app-text-muted)] pt-0.5">
                <span className="truncate mr-2">Servidor Moodle: <strong className="font-mono text-[var(--app-text)]">{effectiveCampusUrl}</strong></span>
                <a
                  href={effectiveCampusUrl.startsWith("http") ? effectiveCampusUrl : `https://${effectiveCampusUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold shrink-0"
                >
                  <span>Abrir Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Conteúdo Dinâmico por Modo */}
            {authMode === "credentials" && (
              <>
                {/* Usuário / Matrícula */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                    <span>Usuário ou Matrícula Institucional</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 20241IFES0482 ou CPF/login institucional"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/40 font-mono"
                  />
                  <p className="text-[11px] text-[var(--app-text-muted)]">
                    Sua matrícula do IFES (ex: 20241IFES0482) usada no login do AVA.
                  </p>
                </div>

                {/* Senha do AVA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--app-text)] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Senha do AVA IFES</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-text)] flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
                    </button>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono pr-10"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Criptografado com AES-GCM (SHA-256) com renovação automática</span>
                  </div>
                </div>
              </>
            )}

            {authMode === "paste" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
                    <Clipboard className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Colar Texto da Página "Meus Cursos"</span>
                  </label>
                  <a
                    href={`${effectiveCampusUrl}/my/courses.php`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Abrir Meus Cursos</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <textarea
                  rows={4}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Selecione o texto ou lista de matérias na página do seu AVA, copie (Ctrl+C) e cole aqui (Ctrl+V)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono"
                />

                <p className="text-[11px] text-[var(--app-text-muted)]">
                  Nosso modelo de IA analisa o texto colado, extrai todas as disciplinas reais, docentes e códigos do seu curso e cadastra no seu perfil.
                </p>
              </div>
            )}

            {/* Checkbox Manter Permanente */}
            {authMode !== "paste" && (
              <div className="p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="keep-permanent"
                  checked={isPermanent}
                  onChange={(e) => setIsPermanent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="keep-permanent" className="text-xs text-[var(--app-text)] leading-snug cursor-pointer">
                  <strong className="block font-bold">Manter conexão permanente e estável</strong>
                  <span className="text-[11px] text-[var(--app-text-muted)]">
                    Renova sua sessão automaticamente em segundo plano para você não precisar digitar a senha toda vez que abrir o app.
                  </span>
                </label>
              </div>
            )}

            {/* Mensagens de Feedback */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Botão de Submissão */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleQuickFillRuam}
                disabled={isLoading}
                className="py-3 px-4 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-xs font-bold transition border border-[var(--app-border)] cursor-pointer text-center"
              >
                Preencher dados de Ruam Januth
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedCampusUrl("https://ava3.cefor.ifes.edu.br");
                  setIsCustomCampus(false);
                  runPingTest();
                }}
                disabled={isLoading}
                className="py-3 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition border border-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                title="Conectar ao IFES Campus Guarapari (Servidor Moodle AVA3)"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>IFES Guarapari (AVA3)</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{stepMessage || "Conectando ao AVA..."}</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>
                      {isAlreadyConnected ? "Atualizar & Sincronizar Conexão" : "Estabelecer Conexão Permanente"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
