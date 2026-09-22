import React, { useState, useEffect, useMemo } from "react";
import {
  ExternalLink,
  GraduationCap,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  LogOut,
  Info,
  KeyRound,
  Clipboard,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  QAcademicoAccountInfo,
  QAcademicoGradeItem,
  QAcademicoScheduleItem,
  IfesCourse,
  IfesAccountInfo,
  UserProfile,
} from "../../types";
import { qacademicoApi } from "../../utils/qacademicoApi";
import {
  loadQAcademicoAccount,
  saveQAcademicoAccount,
  loadQAcademicoGrades,
  saveQAcademicoGrades,
  loadQAcademicoSchedules,
  saveQAcademicoSchedules,
  syncQAcademicoCoursesToApp,
  clearAllQAcademicoData,
} from "../../utils/qacademicoStorage";
import { parseQAcademicoContent } from "../../utils/qacademicoParser";
import {
  getUserQAcademicoCreds,
  saveUserQAcademicoCreds,
  subscribeBoletim,
  saveBoletim,
} from "../../lib/firebase";

interface QAcademicoViewProps {
  user: UserProfile;
  onUpdateQAcademicoAccount?: (account: QAcademicoAccountInfo | undefined) => void;
  onUpdateIfesAccount?: (ifesAccount: IfesAccountInfo | undefined) => void;
  onImportCourses?: (courses: IfesCourse[]) => void;
  ifesCourses?: IfesCourse[];
}

function formatSyncDate(date: Date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} às ${hh}:${min}`;
}

export const QAcademicoView: React.FC<QAcademicoViewProps> = ({
  user,
  onUpdateQAcademicoAccount,
  onUpdateIfesAccount,
  onImportCourses,
  ifesCourses = [],
}) => {
  const PORTAL_URL = "https://academico.ifes.edu.br/qacademico/index.asp?t=2000";

  const [activeSubTab, setActiveSubTab] = useState<"boletim" | "horarios" | "sync">("boletim");
  const [account, setAccount] = useState<QAcademicoAccountInfo | null>(() => loadQAcademicoAccount());
  const [grades, setGrades] = useState<QAcademicoGradeItem[]>(() => loadQAcademicoGrades());
  const [schedules, setSchedules] = useState<QAcademicoScheduleItem[]>(() => loadQAcademicoSchedules());

  // Diagnostics state
  const [connectionStatus, setConnectionStatus] = useState<{
    state: "idle" | "checking" | "online" | "offline";
    latencyMs: number;
    message: string;
    lastChecked?: string;
  }>({
    state: "idle",
    latencyMs: 0,
    message: "Status não verificado.",
  });

  // Credentials & Form state
  const [matricula, setMatricula] = useState(user.qacademicoAccount?.matricula || account?.matricula || "");
  const [senha, setSenha] = useState("");
  const [selectedCampus, setSelectedCampus] = useState(user.ifesAccount?.campusName || "IFES");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("Conectando ao IFES...");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual fallback state (discrete toggle)
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [pastedContent, setPastedContent] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [situationFilter, setSituationFilter] = useState<"all" | "cursando" | "aprovado" | "exame">("all");

  // 1. Escuta em tempo real o boletim oficial armazenado no Firestore em boletins/{uid}
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeBoletim(user.id, (boletimDoc) => {
      if (boletimDoc && Array.isArray(boletimDoc.disciplinas) && boletimDoc.disciplinas.length > 0) {
        setGrades(boletimDoc.disciplinas);
        saveQAcademicoGrades(boletimDoc.disciplinas);

        if (Array.isArray(boletimDoc.schedules)) {
          setSchedules(boletimDoc.schedules);
          saveQAcademicoSchedules(boletimDoc.schedules);
        }

        const syncedAccount: QAcademicoAccountInfo = {
          connected: true,
          matricula: boletimDoc.matricula || matricula,
          fullname: boletimDoc.nome || user.name,
          curso: boletimDoc.curso || "Curso IFES",
          campus: boletimDoc.campus || user.ifesAccount?.campusName || "IFES",
          periodo: boletimDoc.periodo || "2026/1",
          coeficienteRendimento: boletimDoc.coeficienteRendimento,
          portalUrl: PORTAL_URL,
          lastSync: boletimDoc.dataFormatada || formatSyncDate(new Date(boletimDoc.sincronizadoEm || Date.now())),
          authMethod: "direct_session",
        };

        setAccount(syncedAccount);
        saveQAcademicoAccount(syncedAccount);
        if (onUpdateQAcademicoAccount) onUpdateQAcademicoAccount(syncedAccount);
        mapAndSaveToIfesAccount(syncedAccount, boletimDoc.disciplinas, boletimDoc.schedules || []);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  // 2. Carrega a matrícula armazenada para facilitar a re-digitação (NUNCA SENHA)
  useEffect(() => {
    if (user?.id) {
      getUserQAcademicoCreds(user.id).then((saved) => {
        if (saved?.matricula && !matricula) {
          setMatricula(saved.matricula);
        }
        if (saved?.campus && !selectedCampus) {
          setSelectedCampus(saved.campus);
        }
      });
    }
  }, [user?.id]);

  // Teste de conectividade
  const handleCheckConnection = async (quiet: boolean = false) => {
    setConnectionStatus((prev) => ({ ...prev, state: "checking" }));
    try {
      const res = await qacademicoApi.checkStatus();
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setConnectionStatus({
        state: res.online ? "online" : "offline",
        latencyMs: res.latencyMs,
        message: res.message,
        lastChecked: now,
      });
      if (!quiet) {
        if (res.online) {
          setSuccessMessage(`Servidor do Q-Acadêmico respondendo (${res.latencyMs}ms).`);
          setTimeout(() => setSuccessMessage(null), 4000);
        } else {
          setErrorMessage(`Aviso de conexão com o Q-Acadêmico: ${res.message}`);
        }
      }
    } catch {
      setConnectionStatus({
        state: "offline",
        latencyMs: 0,
        message: "Erro ao testar gateway com o Q-Acadêmico.",
        lastChecked: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }
  };

  useEffect(() => {
    handleCheckConnection(true);
  }, []);

  // Mapear dados para IfesAccountInfo
  const mapAndSaveToIfesAccount = (
    finalAccount: QAcademicoAccountInfo,
    finalGrades: QAcademicoGradeItem[],
    finalSchedules: QAcademicoScheduleItem[]
  ) => {
    const totalDisciplinas = finalGrades.length;
    const aprovadas = finalGrades.filter((g) => g.situacao === "Aprovado").length;
    const cursando = finalGrades.filter((g) => g.situacao === "Cursando").length;
    const emExame = finalGrades.filter((g) => g.situacao === "Em Exame" || g.situacao === "Reprovado").length;
    const totalFaltas = finalGrades.reduce((acc, curr) => acc + (curr.faltas || 0), 0);

    const validMedias = finalGrades
      .map((g) => g.mediaFinal)
      .filter((m): m is number => typeof m === "number" && !isNaN(m));
    const mediaGeral =
      validMedias.length > 0
        ? (validMedias.reduce((a, b) => a + b, 0) / validMedias.length).toFixed(1)
        : finalAccount.coeficienteRendimento
        ? String(finalAccount.coeficienteRendimento)
        : "0.0";

    if (onUpdateIfesAccount) {
      const updatedIfesAccount: IfesAccountInfo = {
        connected: user.ifesAccount?.connected ?? false,
        username: user.ifesAccount?.username || finalAccount.matricula || "estudante",
        fullname: user.ifesAccount?.fullname || finalAccount.fullname || user.name,
        campusUrl: user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br",
        campusName: user.ifesAccount?.campusName || finalAccount.campus || "IFES",
        token: user.ifesAccount?.token,
        lastSync: finalAccount.lastSync || formatSyncDate(),
        matricula: finalAccount.matricula || user.ifesAccount?.matricula,
        department: finalAccount.curso || user.ifesAccount?.department,
        gradesSummary: {
          totalDisciplinas,
          aprovadas,
          cursando,
          emExame,
          totalFaltas,
          mediaGeral,
          crOficial: finalAccount.coeficienteRendimento,
          lastGradesSync: new Date().toISOString(),
        },
        academicGrades: finalGrades,
        academicSchedules: finalSchedules,
      };
      onUpdateIfesAccount(updatedIfesAccount);
    }
  };

  // 3. Sincronização direta com Q-Acadêmico (Sob Demanda)
  const handleSyncQAcademico = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMatricula = matricula.trim();
    const cleanSenha = senha.trim();

    if (!cleanMatricula || !cleanSenha) {
      setErrorMessage("Por favor, preencha sua matrícula e senha do Q-Acadêmico.");
      return;
    }

    setIsProcessing(true);
    setLoadingStep("Conectando ao IFES...");
    setErrorMessage(null);
    setSuccessMessage(null);

    // Mensagens claras e dinâmicas de progresso
    const stepTimer1 = setTimeout(() => {
      setLoadingStep("Buscando notas e etapas semestrais...");
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep("Atualizando disciplinas e horários...");
    }, 2400);

    try {
      const campusToUse = selectedCampus || user.ifesAccount?.campusName || "IFES";

      // Envia credenciais apenas em trânsito via HTTPS
      const res = await qacademicoApi.connect({
        matricula: cleanMatricula,
        senha: cleanSenha,
        campus: campusToUse,
      });

      // A senha é imediatamente descartada da memória local e NUNCA salva no Firestore
      setSenha("");

      if (res.success && res.account) {
        const syncTimeStr = res.dataFormatada || formatSyncDate();
        const updatedAccount: QAcademicoAccountInfo = {
          ...res.account,
          lastSync: syncTimeStr,
        };

        const finalGrades = res.grades || [];
        const finalSchedules = res.schedules || [];
        const finalCourses = res.courses || [];

        setAccount(updatedAccount);
        saveQAcademicoAccount(updatedAccount);
        if (onUpdateQAcademicoAccount) onUpdateQAcademicoAccount(updatedAccount);

        setGrades(finalGrades);
        saveQAcademicoGrades(finalGrades);

        setSchedules(finalSchedules);
        saveQAcademicoSchedules(finalSchedules);

        mapAndSaveToIfesAccount(updatedAccount, finalGrades, finalSchedules);

        if (finalCourses.length > 0 && onImportCourses) {
          syncQAcademicoCoursesToApp(finalCourses, finalSchedules);
          onImportCourses(finalCourses);
        }

        // 4. Salvar apenas a matrícula em credenciaisQAcademico/{uid}
        if (user?.id) {
          await saveUserQAcademicoCreds(user.id, {
            matricula: cleanMatricula,
            campus: campusToUse,
          });

          // 5. Salvar resultado oficial estruturado no Firestore em boletins/{uid}
          await saveBoletim(user.id, {
            uid: user.id,
            matricula: cleanMatricula,
            nome: res.account.fullname || user.name,
            curso: res.account.curso || "Curso IFES",
            campus: campusToUse,
            periodo: res.account.periodo || "2026/1",
            disciplinas: finalGrades,
            schedules: finalSchedules,
            sincronizadoEm: res.sincronizadoEm || Date.now(),
            dataFormatada: syncTimeStr,
          });
        }

        setSuccessMessage(`Boletim sincronizado com sucesso! Atualizado em ${syncTimeStr}`);
        setActiveSubTab("boletim");
      } else {
        const errTxt =
          res.error ||
          res.message ||
          "Não foi possível autenticar no Q-Acadêmico. Verifique suas credenciais e tente novamente.";
        setErrorMessage(errTxt);
      }
    } catch (err: any) {
      setSenha("");
      setErrorMessage(
        err?.message ||
          "Não foi possível sincronizar com o Q-Acadêmico. Verifique sua conexão com o IFES."
      );
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsProcessing(false);
    }
  };

  // Fallback discreto: Importação manual de boletim colado
  const handleProcessPastedReport = async () => {
    if (!pastedContent.trim()) {
      setErrorMessage("Cole o boletim ou código HTML da página do Q-Acadêmico.");
      return;
    }

    setIsProcessing(true);
    setLoadingStep("Processando conteúdo colado...");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const serverRes = await qacademicoApi.parseReport(
        pastedContent,
        selectedCampus || user.ifesAccount?.campusName || "IFES",
        matricula
      );

      const clientParsed = parseQAcademicoContent(
        pastedContent,
        selectedCampus || user.ifesAccount?.campusName || "IFES"
      );

      const finalGrades =
        serverRes.grades && serverRes.grades.length > 0
          ? serverRes.grades
          : clientParsed.grades;

      const finalSchedules =
        serverRes.schedules && serverRes.schedules.length > 0
          ? serverRes.schedules
          : clientParsed.schedules;

      const finalCourses =
        serverRes.courses && serverRes.courses.length > 0
          ? serverRes.courses
          : clientParsed.courses;

      if (finalGrades.length === 0 && finalSchedules.length === 0) {
        setErrorMessage(
          serverRes.error ||
            serverRes.message ||
            "Nenhuma disciplina válida pôde ser extraída do conteúdo colado. Verifique se copiou a tela de Boletim Escolar (t=2071)."
        );
        return;
      }

      const syncTimeStr = formatSyncDate();

      const finalAccount: QAcademicoAccountInfo = {
        connected: true,
        matricula:
          serverRes.account?.matricula ||
          clientParsed.account.matricula ||
          matricula ||
          "Estudante IFES",
        fullname:
          serverRes.account?.fullname ||
          clientParsed.account.fullname ||
          user.name ||
          "Estudante IFES",
        curso:
          serverRes.account?.curso ||
          clientParsed.account.curso ||
          "Curso Técnico / Superior IFES",
        campus:
          serverRes.account?.campus ||
          clientParsed.account.campus ||
          selectedCampus ||
          "IFES",
        periodo: serverRes.account?.periodo || clientParsed.account.periodo || "2026/1",
        coeficienteRendimento:
          serverRes.account?.coeficienteRendimento ||
          clientParsed.account.coeficienteRendimento,
        portalUrl: PORTAL_URL,
        lastSync: syncTimeStr,
        authMethod: "pasted_report",
      };

      setAccount(finalAccount);
      saveQAcademicoAccount(finalAccount);
      if (onUpdateQAcademicoAccount) onUpdateQAcademicoAccount(finalAccount);

      setGrades(finalGrades);
      saveQAcademicoGrades(finalGrades);

      setSchedules(finalSchedules);
      saveQAcademicoSchedules(finalSchedules);

      mapAndSaveToIfesAccount(finalAccount, finalGrades, finalSchedules);

      if (finalCourses.length > 0 && onImportCourses) {
        syncQAcademicoCoursesToApp(finalCourses, finalSchedules);
        onImportCourses(finalCourses);
      }

      if (user?.id) {
        await saveBoletim(user.id, {
          uid: user.id,
          matricula: finalAccount.matricula,
          nome: finalAccount.fullname,
          curso: finalAccount.curso,
          campus: finalAccount.campus,
          periodo: finalAccount.periodo,
          disciplinas: finalGrades,
          schedules: finalSchedules,
          sincronizadoEm: Date.now(),
          dataFormatada: syncTimeStr,
        });
      }

      setPastedContent("");
      setShowManualFallback(false);
      setSuccessMessage(`Boletim importado com sucesso! Atualizado em ${syncTimeStr}`);
      setActiveSubTab("boletim");
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Não foi possível processar o boletim colado. Verifique se o conteúdo corresponde à tela t=2071."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = () => {
    clearAllQAcademicoData();
    setAccount(null);
    setGrades([]);
    setSchedules([]);
    if (onUpdateQAcademicoAccount) onUpdateQAcademicoAccount(undefined);
    setSuccessMessage("Dados do Q-Acadêmico desconectados.");
  };

  // Extrair rótulos dinâmicos de etapas semestrais reais retornadas pelo scraping
  const dynamicEtapaLabels = useMemo(() => {
    const labelsSet = new Set<string>();
    grades.forEach((g) => {
      if (Array.isArray(g.etapas)) {
        g.etapas.forEach((et, idx) => {
          const label = et.rotulo || `${idx + 1}ª Etapa`;
          labelsSet.add(label);
        });
      }
    });

    const labels = Array.from(labelsSet);
    if (labels.length === 0) {
      // Padrão semestral oficial do IFES: 1ª Etapa e 2ª Etapa
      return ["1ª Etapa", "2ª Etapa"];
    }
    return labels;
  }, [grades]);

  // Filtro de busca nas disciplinas
  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      const matchSearch =
        g.disciplina.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.codigo && g.codigo.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (situationFilter === "cursando") return g.situacao === "Cursando";
      if (situationFilter === "aprovado") return g.situacao === "Aprovado";
      if (situationFilter === "exame") return g.situacao === "Em Exame" || g.situacao === "Reprovado";
      return true;
    });
  }, [grades, searchQuery, situationFilter]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = grades.length;
    const aprovadas = grades.filter((g) => g.situacao === "Aprovado").length;
    const cursando = grades.filter((g) => g.situacao === "Cursando").length;
    const emExame = grades.filter((g) => g.situacao === "Em Exame").length;
    const totalFaltas = grades.reduce((acc, curr) => acc + (curr.faltas || 0), 0);

    const validMedias = grades
      .map((g) => g.mediaFinal)
      .filter((m): m is number => typeof m === "number" && !isNaN(m));
    const mediaGeral =
      validMedias.length > 0
        ? (validMedias.reduce((a, b) => a + b, 0) / validMedias.length).toFixed(1)
        : account?.coeficienteRendimento
        ? String(account.coeficienteRendimento)
        : "0.0";

    return { total, aprovadas, cursando, emExame, totalFaltas, mediaGeral };
  }, [grades, account]);

  const isConnected = !!account?.connected && grades.length > 0;

  return (
    <div id="qacademico-view" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[var(--app-primary)]/15 text-[var(--app-primary)] border border-[var(--app-primary)]/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Q-Acadêmico Web IFES
              </span>
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-0.5 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] border border-[var(--app-border)] rounded-full text-[11px] font-mono flex items-center gap-1 transition"
                title="Acessar portal oficial academico.ifes.edu.br"
              >
                <span>academico.ifes.edu.br</span>
                <ExternalLink className="w-3 h-3 text-[var(--app-primary)]" />
              </a>
              {isConnected ? (
                <span className="text-xs text-[var(--app-success)] font-medium font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sincronizado ({account?.campus || "IFES"})
                </span>
              ) : (
                <span className="text-xs text-[var(--app-text-muted)] font-mono flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Oficial IFES
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--app-text)] tracking-tight">
              Boletim & Sincronização Q-Acadêmico
            </h1>
            <p className="text-sm text-[var(--app-text-muted)] max-w-2xl">
              Acompanhamento semestral com notas por etapa, frequência escolar e horários oficiais do Instituto Federal do Espírito Santo.
            </p>

            {account?.lastSync && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--app-success)]/10 text-[var(--app-success)] border border-[var(--app-success)]/20 rounded-xl text-xs font-medium font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Atualizado em: {account.lastSync}</span>
              </div>
            )}
          </div>

          {/* Action Header Card */}
          {isConnected ? (
            <div className="bg-[var(--app-card-secondary)] p-4 rounded-2xl border border-[var(--app-border)] space-y-3 shrink-0 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center font-bold text-base border border-[var(--app-primary)]/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--app-text)] leading-tight">
                    {account?.fullname || user.name}
                  </h4>
                  <p className="text-[11px] text-[var(--app-text-muted)] font-mono">
                    Matrícula: {account?.matricula} • Semestre: {account?.periodo || "2026/1"}
                  </p>
                  <p className="text-[10px] text-[var(--app-primary)]">{account?.curso || "Curso IFES"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[var(--app-border)] text-xs">
                <button
                  onClick={() => setActiveSubTab("sync")}
                  className="px-3 py-1.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-[var(--btn-primary-text)] font-semibold rounded-xl transition flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3 h-3" /> Re-sincronizar
                </button>
                <a
                  href={PORTAL_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] rounded-xl transition flex items-center gap-1 text-xs border border-[var(--app-border)]"
                >
                  <ExternalLink className="w-3 h-3" /> Portal Oficial
                </a>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 bg-[var(--app-card)] hover:bg-rose-500/20 text-[var(--app-text-muted)] hover:text-rose-500 rounded-xl transition flex items-center gap-1 text-xs cursor-pointer border border-[var(--app-border)]"
                  title="Desconectar dados"
                >
                  <LogOut className="w-3 h-3" /> Desconectar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveSubTab("sync")}
                className="px-4 py-2.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-[var(--btn-primary-text)] font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <KeyRound className="w-4 h-4" /> Sincronizar com Q-Acadêmico
              </button>
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] font-semibold text-xs rounded-xl transition flex items-center gap-1.5 border border-[var(--app-border)]"
              >
                <ExternalLink className="w-4 h-4 text-[var(--app-primary)]" /> Acessar Portal
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 bg-[var(--app-success)]/15 border border-[var(--app-success)]/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-[var(--app-success)] font-semibold">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="p-1 hover:bg-[var(--app-success)]/20 rounded-lg text-[var(--app-success)] transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-600 dark:text-amber-400 font-semibold">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Connection Status Indicator */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full shrink-0 ${
              connectionStatus.state === "checking"
                ? "bg-amber-400 animate-ping"
                : connectionStatus.state === "online"
                ? "bg-[var(--app-success)] shadow-sm"
                : "bg-rose-500"
            }`}
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[var(--app-text)]">Status do Servidor Q-Acadêmico:</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
                  connectionStatus.state === "checking"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                    : connectionStatus.state === "online"
                    ? "bg-[var(--app-success)]/20 text-[var(--app-success)] border border-[var(--app-success)]/30"
                    : "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                }`}
              >
                {connectionStatus.state === "checking"
                  ? "Testando Gateway..."
                  : connectionStatus.state === "online"
                  ? "Servidor Ativo"
                  : "Indisponível"}
              </span>
            </div>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              {connectionStatus.message}
              {connectionStatus.lastChecked ? ` • Verificado às ${connectionStatus.lastChecked}` : ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleCheckConnection(false)}
          disabled={connectionStatus.state === "checking"}
          className="px-3.5 py-1.5 rounded-xl bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] border border-[var(--app-border)] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[var(--app-primary)] ${connectionStatus.state === "checking" ? "animate-spin" : ""}`} />
          <span>Testar Conexão</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Disciplinas do Semestre
          </span>
          <p className="text-2xl font-black text-[var(--app-text)] font-mono">{stats.total}</p>
          <p className="text-[11px] text-[var(--app-text-muted)]">Matriculadas no Q-Acadêmico</p>
        </div>

        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[var(--app-success)]" /> CR / Média Geral
          </span>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-[var(--app-success)] font-mono">{stats.mediaGeral}</p>
            <span className="text-xs text-[var(--app-text-muted)] font-mono">/ 100</span>
          </div>
          <p className="text-[11px] text-[var(--app-text-muted)]">Coeficiente de Rendimento</p>
        </div>

        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--app-accent)]" /> Aprovadas / Cursando
          </span>
          <p className="text-2xl font-black text-[var(--app-text)] font-mono">
            {stats.aprovadas} <span className="text-xs text-[var(--app-text-muted)] font-normal">/ {stats.cursando} cursando</span>
          </p>
          <p className="text-[11px] text-[var(--app-text-muted)]">Critério IFES: Média ≥ 60.0</p>
        </div>

        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-4 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Faltas Acumuladas
          </span>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-[var(--app-text)] font-mono">{stats.totalFaltas}</p>
            <span className="text-xs text-[var(--app-text-muted)]">aulas</span>
          </div>
          <p className="text-[11px] text-[var(--app-text-muted)]">Limite IFES: Máximo 25% de faltas</p>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-1 bg-[var(--app-card)] p-1.5 rounded-2xl border border-[var(--app-border)] overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveSubTab("boletim")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === "boletim"
              ? "bg-[var(--app-primary)] text-[var(--btn-primary-text)] shadow-xs"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Boletim Semestral Oficial ({grades.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("horarios")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === "horarios"
              ? "bg-[var(--app-primary)] text-[var(--btn-primary-text)] shadow-xs"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Horário de Aulas / Grade ({schedules.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("sync")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === "sync"
              ? "bg-[var(--app-primary)] text-[var(--btn-primary-text)] shadow-xs"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Sincronização Q-Acadêmico</span>
        </button>
      </div>

      {/* TAB 1: BOLETIM SEMESTRAL OFICIAL */}
      {activeSubTab === "boletim" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--app-card)] p-3 rounded-2xl border border-[var(--app-border)] shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
              <input
                type="text"
                placeholder="Buscar disciplina no boletim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--app-card-secondary)] text-xs text-[var(--app-text)] pl-9 pr-4 py-2 rounded-xl border border-[var(--app-border)] focus:border-[var(--app-primary)] focus:outline-none placeholder:text-[var(--app-text-muted)]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(["all", "cursando", "aprovado", "exame"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSituationFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                    situationFilter === filter
                      ? "bg-[var(--app-primary)]/15 text-[var(--app-primary)] border border-[var(--app-primary)]/30 font-bold"
                      : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
                  }`}
                >
                  {filter === "all" && "Todas"}
                  {filter === "cursando" && "Cursando"}
                  {filter === "aprovado" && "Aprovadas"}
                  {filter === "exame" && "Exame / Abaixo"}
                </button>
              ))}
            </div>
          </div>

          {filteredGrades.length > 0 ? (
            <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] font-semibold uppercase tracking-wider border-b border-[var(--app-border)] text-[11px]">
                    <tr>
                      <th className="p-4">Componente Curricular</th>
                      <th className="p-4 text-center">C.H.</th>
                      <th className="p-4 text-center">Faltas</th>
                      {dynamicEtapaLabels.map((lbl) => (
                        <th key={lbl} className="p-4 text-center">{lbl}</th>
                      ))}
                      <th className="p-4 text-center">Média Final</th>
                      <th className="p-4 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--app-border)]">
                    {filteredGrades.map((grade) => {
                      const isApproved =
                        grade.situacao === "Aprovado" ||
                        (grade.mediaFinal !== undefined && grade.mediaFinal >= 60);
                      const isExam =
                        grade.situacao === "Em Exame" ||
                        (grade.mediaFinal !== undefined && grade.mediaFinal < 60 && grade.mediaFinal >= 20);
                      const isFailing =
                        grade.situacao === "Reprovado" ||
                        (grade.mediaFinal !== undefined && grade.mediaFinal < 20);

                      return (
                        <tr key={grade.id} className="hover:bg-[var(--app-card-hover)]/40 transition">
                          <td className="p-4">
                            <div className="font-bold text-[var(--app-text)]">{grade.disciplina}</div>
                            <div className="text-[10px] text-[var(--app-text-muted)] font-mono">
                              {grade.codigo || "IFES"} {grade.docente ? `• Prof. ${grade.docente}` : ""}
                            </div>
                          </td>
                          <td className="p-4 text-center font-mono text-[var(--app-text-muted)]">
                            {grade.cargaHoraria || 60}h
                          </td>
                          <td className="p-4 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] ${
                                (grade.faltas || 0) > 15
                                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold"
                                  : (grade.faltas || 0) > 8
                                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                  : "text-[var(--app-text-muted)]"
                              }`}
                            >
                              {grade.faltas || 0}
                            </span>
                          </td>

                          {/* Etapas Semestrais Dinâmicas (1ª Etapa, 2ª Etapa, Prova Final) */}
                          {dynamicEtapaLabels.map((lbl, idx) => {
                            const etapa =
                              grade.etapas?.find((e, i) => (e.rotulo || `${i + 1}ª Etapa`) === lbl) ||
                              grade.etapas?.[idx];

                            return (
                              <td key={lbl} className="p-4 text-center font-mono">
                                {etapa?.nota !== undefined ? (
                                  <span
                                    className={`font-semibold ${
                                      etapa.nota >= 60
                                        ? "text-[var(--app-text)]"
                                        : "text-amber-600 dark:text-amber-400"
                                    }`}
                                  >
                                    {typeof etapa.nota === "number" ? etapa.nota.toFixed(1) : etapa.nota}
                                  </span>
                                ) : (
                                  <span className="text-[var(--app-text-muted)] opacity-60">-</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Média Final */}
                          <td className="p-4 text-center font-mono font-black text-sm">
                            {grade.mediaFinal !== undefined ? (
                              <span
                                className={
                                  isApproved
                                    ? "text-[var(--app-success)]"
                                    : isExam
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }
                              >
                                {typeof grade.mediaFinal === "number"
                                  ? grade.mediaFinal.toFixed(1)
                                  : grade.mediaFinal}
                              </span>
                            ) : (
                              <span className="text-[var(--app-text-muted)] font-normal">--</span>
                            )}
                          </td>

                          {/* Situação */}
                          <td className="p-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                isApproved
                                  ? "bg-[var(--app-success)]/15 text-[var(--app-success)] border border-[var(--app-success)]/30"
                                  : isExam
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                  : isFailing
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                                  : "bg-[var(--app-primary)]/15 text-[var(--app-primary)] border border-[var(--app-primary)]/30"
                              }`}
                            >
                              {grade.situacao}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] flex items-center justify-center mx-auto border border-[var(--app-primary)]/20">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--app-text)]">Nenhum boletim sincronizado ainda</h3>
                <p className="text-xs text-[var(--app-text-muted)] max-w-md mx-auto">
                  Sincronize com sua matrícula e senha do Q-Acadêmico para carregar seus dados reais do IFES.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab("sync")}
                className="px-4 py-2 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-[var(--btn-primary-text)] font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                Sincronizar com Q-Acadêmico
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HORÁRIO DE AULAS */}
      {activeSubTab === "horarios" && (
        <div className="space-y-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[var(--app-text)]">Grade Horária Individual do Estudante</h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                Horários sincronizados do Q-Acadêmico IFES (tela <code>t=2010</code>).
              </p>
            </div>
            <a
              href={`${PORTAL_URL.replace("t=2000", "t=2010")}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] rounded-xl text-xs transition flex items-center gap-1.5 border border-[var(--app-border)]"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Ver no Portal
            </a>
          </div>

          {schedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((dia) => {
                const diaAulas = schedules.filter((s) => s.diaSemana.toLowerCase().includes(dia.toLowerCase()));
                if (diaAulas.length === 0) return null;

                return (
                  <div key={dia} className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
                      <h4 className="text-xs font-bold text-[var(--app-primary)] uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {dia}-feira
                      </h4>
                      <span className="text-[10px] text-[var(--app-text-muted)] font-mono">{diaAulas.length} aula(s)</span>
                    </div>

                    <div className="space-y-2.5">
                      {diaAulas.map((aula) => (
                        <div key={aula.id} className="p-2.5 bg-[var(--app-card-secondary)] rounded-xl border border-[var(--app-border)] space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[var(--app-text)]">{aula.disciplina}</span>
                            <span className="text-[10px] font-mono text-[var(--app-success)] bg-[var(--app-success)]/10 px-1.5 py-0.5 rounded">
                              {aula.horario}
                            </span>
                          </div>
                          {aula.sala && (
                            <p className="text-[11px] text-[var(--app-text-muted)] flex items-center gap-1 font-mono">
                              <span>📍 {aula.sala}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] flex items-center justify-center mx-auto border border-[var(--app-primary)]/20">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--app-text)]">Nenhum horário cadastrado ainda</h3>
                <p className="text-xs text-[var(--app-text-muted)] max-w-md mx-auto">
                  Sincronize com o Q-Acadêmico para carregar seus horários semanais oficiais.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab("sync")}
                className="px-4 py-2 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-[var(--btn-primary-text)] font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
              >
                Sincronizar Horários
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NOVA TELA DE SINCRONIZAÇÃO DO Q-ACADÊMICO */}
      {activeSubTab === "sync" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center mx-auto border border-[var(--app-primary)]/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-[var(--app-text)]">
                Sincronizar com Q-Acadêmico IFES
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] max-w-md mx-auto">
                Informe sua matrícula e senha do portal acadêmico do IFES. Os dados reais são extraídos diretamente do sistema oficial.
              </p>
            </div>

            {/* Formulário Simples Obrigatório */}
            <form onSubmit={handleSyncQAcademico} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--app-text)]">
                  Matrícula do IFES
                </label>
                <input
                  type="text"
                  placeholder="Ex: 20241TI0123"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  disabled={isProcessing}
                  required
                  className="w-full bg-[var(--app-card-secondary)] text-sm text-[var(--app-text)] p-3 rounded-xl border border-[var(--app-border)] focus:border-[var(--app-primary)] focus:outline-none placeholder:text-[var(--app-text-muted)] font-mono disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--app-text)]">
                  Senha do Q-Acadêmico
                </label>
                <input
                  type="password"
                  placeholder="Digite sua senha oficial"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={isProcessing}
                  required
                  className="w-full bg-[var(--app-card-secondary)] text-sm text-[var(--app-text)] p-3 rounded-xl border border-[var(--app-border)] focus:border-[var(--app-primary)] focus:outline-none placeholder:text-[var(--app-text-muted)] font-mono disabled:opacity-50"
                />
              </div>

              {/* Estado de loading com mensagem clara */}
              {isProcessing && (
                <div className="p-3.5 bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20 rounded-xl flex items-center gap-3 text-xs text-[var(--app-primary)] font-medium">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                  <span>{loadingStep}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || !matricula.trim() || !senha.trim()}
                className="w-full py-3 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-[var(--btn-primary-text)] font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm active:scale-98"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{loadingStep}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sincronizar com Q-Acadêmico</span>
                  </>
                )}
              </button>

              {/* Nota de Segurança das Credenciais */}
              <div className="p-3 bg-[var(--app-card-secondary)] rounded-xl border border-[var(--app-border)] flex items-start gap-2.5 text-[11px] text-[var(--app-text-muted)] leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[var(--app-success)] shrink-0 mt-0.5" />
                <span>
                  <strong>Segurança rigorosa:</strong> Sua senha é transmitida com segurança apenas para efetuar o login no Q-Acadêmico e é descartada da memória imediatamente. Ela <strong>nunca</strong> é salva no banco de dados.
                </span>
              </div>
            </form>

            {/* Link discreto de fallback para importar manualmente */}
            <div className="pt-4 border-t border-[var(--app-border)] text-center">
              <button
                type="button"
                onClick={() => setShowManualFallback(!showManualFallback)}
                className="text-xs text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <span>Problemas com o login? Importar manualmente</span>
                {showManualFallback ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showManualFallback && (
                <div className="mt-4 p-4 bg-[var(--app-card-secondary)] rounded-2xl border border-[var(--app-border)] text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--app-text)]">
                      Cole o HTML ou texto do Boletim Escolar (tela t=2071):
                    </label>
                    <a
                      href={PORTAL_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[var(--app-primary)] hover:underline flex items-center gap-1"
                    >
                      <span>Abrir Portal IFES</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Abra https://academico.ifes.edu.br, acesse 'Boletim Escolar', selecione o conteúdo (Ctrl+A e Ctrl+C) e cole aqui."
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                    className="w-full bg-[var(--app-card)] text-xs text-[var(--app-text)] p-3 rounded-xl border border-[var(--app-border)] focus:border-[var(--app-primary)] focus:outline-none placeholder:text-[var(--app-text-muted)] font-mono resize-y"
                  />

                  <button
                    type="button"
                    onClick={handleProcessPastedReport}
                    disabled={isProcessing || !pastedContent.trim()}
                    className="w-full py-2.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-[var(--btn-primary-text)] font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Processar Boletim Colado</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
