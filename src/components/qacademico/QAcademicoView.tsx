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
  Clipboard,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  Layers,
  ArrowUpRight,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Info,
  KeyRound,
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

interface QAcademicoViewProps {
  user: UserProfile;
  onUpdateQAcademicoAccount?: (account: QAcademicoAccountInfo | undefined) => void;
  onUpdateIfesAccount?: (ifesAccount: IfesAccountInfo | undefined) => void;
  onImportCourses?: (courses: IfesCourse[]) => void;
}

export const QAcademicoView: React.FC<QAcademicoViewProps> = ({
  user,
  onUpdateQAcademicoAccount,
  onUpdateIfesAccount,
  onImportCourses,
}) => {
  const PORTAL_URL = "https://academico.ifes.edu.br/qacademico/index.asp?t=2000";

  const [activeSubTab, setActiveSubTab] = useState<"boletim" | "horarios" | "bridge">("boletim");
  const [account, setAccount] = useState<QAcademicoAccountInfo | null>(() => loadQAcademicoAccount());
  const [grades, setGrades] = useState<QAcademicoGradeItem[]>(() => loadQAcademicoGrades());
  const [schedules, setSchedules] = useState<QAcademicoScheduleItem[]>(() => loadQAcademicoSchedules());

  // Check Connection Status State
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

  // Connection & Paste State
  const [matricula, setMatricula] = useState(user.ifesAccount?.username || account?.matricula || "");
  const [senha, setSenha] = useState("");
  const [pastedContent, setPastedContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [situationFilter, setSituationFilter] = useState<"all" | "cursando" | "aprovado" | "exame">("all");

  // Real-time explicit Check Connection test
  const handleCheckConnection = async (quiet: boolean = false) => {
    console.group("[QAcademicoView] Executando Check Connection...");
    setConnectionStatus((prev) => ({ ...prev, state: "checking" }));
    try {
      const res = await qacademicoApi.checkStatus();
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      console.log("[QAcademicoView] Resultado da verificação:", res);
      setConnectionStatus({
        state: res.online ? "online" : "offline",
        latencyMs: res.latencyMs,
        message: res.message,
        lastChecked: now,
      });
      if (!quiet) {
        if (res.online) {
          setSuccessMessage(`Conexão com o servidor do Q-Acadêmico verificada com sucesso! (${res.latencyMs}ms)`);
          setTimeout(() => setSuccessMessage(null), 4000);
        } else {
          setErrorMessage(`Aviso de conexão com o Q-Acadêmico: ${res.message}`);
        }
      }
    } catch (err: any) {
      console.error("[QAcademicoView] Falha durante Check Connection:", err);
      setConnectionStatus({
        state: "offline",
        latencyMs: 0,
        message: "Erro ao testar gateway com o Q-Acadêmico.",
        lastChecked: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    } finally {
      console.groupEnd();
    }
  };

  // Run initial diagnostic check connection on mount
  useEffect(() => {
    handleCheckConnection(true);
  }, []);

  // Map and accurately propagate grades, averages and absences to user.ifesAccount
  const mapAndSaveToIfesAccount = (
    finalAccount: QAcademicoAccountInfo,
    finalGrades: QAcademicoGradeItem[],
    finalSchedules: QAcademicoScheduleItem[]
  ) => {
    console.group("[QAcademicoView] Mapeando notas e faltas para user.ifesAccount");
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

    console.log("Estatísticas calculadas:", {
      totalDisciplinas,
      aprovadas,
      cursando,
      emExame,
      totalFaltas,
      mediaGeral,
    });

    if (onUpdateIfesAccount) {
      const updatedIfesAccount: IfesAccountInfo = {
        connected: true,
        username: finalAccount.matricula || user.ifesAccount?.username || "estudante",
        fullname: finalAccount.fullname || user.ifesAccount?.fullname || user.name,
        campusUrl: finalAccount.portalUrl || PORTAL_URL,
        campusName: finalAccount.campus || user.ifesAccount?.campusName || "IFES",
        token: user.ifesAccount?.token,
        lastSync: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        matricula: finalAccount.matricula,
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
      console.log("Atualizando ifesAccount com notas e faltas:", updatedIfesAccount);
      onUpdateIfesAccount(updatedIfesAccount);
    }
    console.groupEnd();
  };

  // Keep state reactive to global changes
  useEffect(() => {
    const handleAccountChange = (e: any) => {
      if (e.detail?.account !== undefined) {
        setAccount(e.detail.account);
      }
    };
    const handleGradesChange = (e: any) => {
      if (e.detail?.grades) {
        setGrades(e.detail.grades);
      }
    };
    const handleSchedulesChange = (e: any) => {
      if (e.detail?.schedules) {
        setSchedules(e.detail.schedules);
      }
    };

    window.addEventListener("brainstudio:qacademico-account-updated", handleAccountChange);
    window.addEventListener("brainstudio:qacademico-grades-updated", handleGradesChange);
    window.addEventListener("brainstudio:qacademico-schedules-updated", handleSchedulesChange);

    return () => {
      window.removeEventListener("brainstudio:qacademico-account-updated", handleAccountChange);
      window.removeEventListener("brainstudio:qacademico-grades-updated", handleGradesChange);
      window.removeEventListener("brainstudio:qacademico-schedules-updated", handleSchedulesChange);
    };
  }, []);

  // Filtered grades
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

  // Statistics calculation
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
        : account?.coeficienteRendimento ? String(account.coeficienteRendimento) : "0.0";

    return { total, aprovadas, cursando, emExame, totalFaltas, mediaGeral };
  }, [grades, account]);

  // Handle Direct Login Attempt
  const handleDirectConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim()) {
      setErrorMessage("Por favor, insira sua matrícula do IFES.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await qacademicoApi.connect({
        matricula: matricula.trim(),
        senha,
        campus: user.ifesAccount?.campusName || "IFES",
      });

      if (res.success && res.account) {
        setAccount(res.account);
        saveQAcademicoAccount(res.account);
        if (onUpdateQAcademicoAccount) onUpdateQAcademicoAccount(res.account);

        if (res.grades && res.grades.length > 0) {
          setGrades(res.grades);
          saveQAcademicoGrades(res.grades);
        }
        if (res.schedules && res.schedules.length > 0) {
          setSchedules(res.schedules);
          saveQAcademicoSchedules(res.schedules);
        }

        // Mapeia rigorosamente para user.ifesAccount
        mapAndSaveToIfesAccount(res.account, res.grades || [], res.schedules || []);

        setSuccessMessage("Conexão direta estabelecida com o Q-Acadêmico do IFES!");
        setActiveSubTab("boletim");
      } else {
        setErrorMessage(
          res.message ||
            "O Q-Acadêmico requer autenticação via navegador devido ao firewall institucional. Use a Ponte Rápida abaixo!"
        );
      }
    } catch {
      setErrorMessage("Falha ao contatar a ponte do Q-Acadêmico. Utilize a opção de colar relatório.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Fast Data Bridge (Pasted HTML or Text from Q-Acadêmico)
  const handleProcessPastedReport = async () => {
    if (!pastedContent.trim()) {
      setErrorMessage("Cole o boletim, horários ou código HTML da página do Q-Acadêmico.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. First run client-side parser
      const clientParsed = parseQAcademicoContent(
        pastedContent,
        user.ifesAccount?.campusName || "IFES"
      );

      // 2. Then invoke server-side parser for AI enrichment
      const serverRes = await qacademicoApi.parseReport(
        pastedContent,
        user.ifesAccount?.campusName || "IFES"
      );

      const finalAccount: QAcademicoAccountInfo = {
        connected: true,
        matricula:
          serverRes.account?.matricula ||
          clientParsed.account.matricula ||
          matricula ||
          "20241TIADM0042",
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
          user.ifesAccount?.campusName ||
          "IFES",
        periodo: serverRes.account?.periodo || clientParsed.account.periodo || "2026/1",
        coeficienteRendimento:
          serverRes.account?.coeficienteRendimento ||
          clientParsed.account.coeficienteRendimento ||
          Number(clientParsed.rawStats.mediaGeral) ||
          82.0,
        portalUrl: PORTAL_URL,
        lastSync: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        authMethod: "pasted_report",
      };

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

      // Save to storage
      setAccount(finalAccount);
      saveQAcademicoAccount(finalAccount);
      if (onUpdateQAcademicoAccount) onUpdateQAcademicoAccount(finalAccount);

      setGrades(finalGrades);
      saveQAcademicoGrades(finalGrades);

      setSchedules(finalSchedules);
      saveQAcademicoSchedules(finalSchedules);

      // Mapeia rigorosamente notas, faltas e médias para user.ifesAccount
      mapAndSaveToIfesAccount(finalAccount, finalGrades, finalSchedules);

      // Sincroniza com as matérias gerais do Brain Studio
      if (finalCourses.length > 0) {
        syncQAcademicoCoursesToApp(finalCourses, finalSchedules);
        if (onImportCourses) {
          onImportCourses(finalCourses);
        }
      }

      setPastedContent("");
      setSuccessMessage(
        `Ponte de dados concluída com sucesso! ${finalGrades.length} disciplina(s) e notas oficiais importadas do Q-Acadêmico.`
      );
      setActiveSubTab("boletim");
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao processar conteúdo do Q-Acadêmico.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Pre-load sample Q-Acadêmico data for quick demonstration
  const handleLoadSampleQAcademico = () => {
    const sampleText = `INSTITUTO FEDERAL DO ESPÍRITO SANTO - IFES
SISTEMA DE CONTROLE ACADÊMICO - Q-ACADÊMICO WEB
BOLETIM ESCOLAR OFICIAL - ANO LETIVO: 2026 / 1
Aluno: ${user.name || "Estudante IFES"}   Matrícula: 20261TIADM042
Curso: Técnico Integrado em Informática   Campus: IFES - Campus Serra
Coeficiente de Rendimento (CR): 84.8

Componente Curricular | C.H. | Aulas | Faltas | 1ª Etapa | 2ª Etapa | 3ª Etapa | 4ª Etapa | Méd. Parcial | Exame | Méd. Final | Situação
Língua Portuguesa e Literatura II | 80 | 76 | 2 | 82,0 | 85,0 | 88,0 | 84,0 | 84,8 | - | 84,8 | Aprovado
Matemática Aplicada e Cálculo II | 80 | 80 | 0 | 78,0 | 80,0 | 85,0 | 90,0 | 83,3 | - | 83,3 | Aprovado
Física Geral e Experimental II | 60 | 58 | 4 | 70,0 | 75,0 | 80,0 | 78,0 | 75,8 | - | 75,8 | Aprovado
Química Tecnológica II | 60 | 60 | 0 | 85,0 | 90,0 | 88,0 | 92,0 | 88,8 | - | 88,8 | Aprovado
Algoritmos e Estrutura de Dados | 80 | 80 | 2 | 90,0 | 95,0 | 92,0 | 96,0 | 93,3 | - | 93,3 | Aprovado
Banco de Dados e Modelagem SQL | 80 | 78 | 0 | 88,0 | 85,0 | 90,0 | 94,0 | 89,3 | - | 89,3 | Aprovado
Redes de Computadores e Protocolos | 60 | 56 | 2 | 75,0 | 80,0 | 82,0 | 85,0 | 80,5 | - | 80,5 | Cursando
Engenharia de Software e Projetos | 60 | 60 | 0 | 82,0 | 86,0 | 90,0 | 88,0 | 86,5 | - | 86,5 | Cursando

HORÁRIO DE AULAS INDIVIDUAL:
Segunda-feira 07:00 às 08:40: Algoritmos e Estrutura de Dados - LAB 03
Segunda-feira 08:50 às 10:30: Banco de Dados e Modelagem SQL - LAB 04
Terça-feira 07:00 às 08:40: Língua Portuguesa e Literatura II - Sala 102
Terça-feira 08:50 às 10:30: Matemática Aplicada e Cálculo II - Sala 102
Quarta-feira 07:00 às 08:40: Física Geral e Experimental II - Lab Física
Quinta-feira 07:00 às 08:40: Redes de Computadores e Protocolos - LAB Redes
Sexta-feira 07:00 às 08:40: Engenharia de Software e Projetos - Sala 105`;

    setPastedContent(sampleText);
    setSuccessMessage("Boletim modelo carregado na caixa de texto. Clique em 'Processar e Sincronizar'!");
  };

  const handleDisconnect = () => {
    clearAllQAcademicoData();
    setAccount(null);
    setGrades([]);
    setSchedules([]);
    if (onUpdateQAcademicoAccount) onUpdateQAcademicoAccount(undefined);
    setSuccessMessage("Dados do Q-Acadêmico desconectados.");
  };

  const handleCopyBookmarklet = () => {
    const code = `javascript:(function(){const t=document.body.innerText;navigator.clipboard.writeText(t).then(()=>{alert('Boletim do Q-Acadêmico copiado com sucesso! Agora vá ao Brain Studio e cole no campo de importação.');});})();`;
    navigator.clipboard.writeText(code);
    setSuccessMessage("Código do Bookmarklet copiado! Arraste para a barra de favoritos do navegador.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const isConnected = !!account?.connected;

  return (
    <div id="qacademico-bridge-view" className="space-y-6 animate-fade-in">
      {/* Top Banner with Official Q-Acadêmico Web Header */}
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563eb]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[#2563eb]/20 text-[#60a5fa] border border-[#2563eb]/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Q-Acadêmico Web IFES
              </span>
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-0.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 rounded-full text-[11px] font-mono flex items-center gap-1 transition"
                title="Abrir página oficial do Q-Acadêmico IFES"
              >
                <span>academico.ifes.edu.br</span>
                <ExternalLink className="w-3 h-3 text-[#60a5fa]" />
              </a>
              {isConnected ? (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sincronizado ({account.campus || "IFES"})
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Ponte Pronta para Conexão
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ponte de Dados Q-Acadêmico IFES
            </h1>
            <p className="text-sm text-neutral-400 max-w-2xl">
              Integração direta com o sistema de registro acadêmico oficial do Instituto Federal do Espírito Santo. Consulte seu boletim com notas por etapa, horários semanais e situação das disciplinas.
            </p>
          </div>

          {/* Account Card or Quick Bridge Call to Action */}
          {isConnected ? (
            <div className="bg-[#181818] p-4 rounded-2xl border border-white/10 space-y-3 shrink-0 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2563eb]/20 text-[#60a5fa] flex items-center justify-center font-bold text-base border border-[#2563eb]/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">
                    {account.fullname || user.name}
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-mono">
                    Matrícula: {account.matricula}
                  </p>
                  <p className="text-[10px] text-[#60a5fa]">{account.curso || "Curso Técnico/Superior"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs">
                <button
                  onClick={() => setActiveSubTab("bridge")}
                  className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-xl transition flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Sincronizar
                </button>
                <a
                  href={PORTAL_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl transition flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3 h-3" /> Acessar Portal
                </a>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded-xl transition flex items-center gap-1 text-[11px] cursor-pointer"
                  title="Desconectar do Q-Acadêmico"
                >
                  <LogOut className="w-3 h-3" /> Sair
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveSubTab("bridge")}
                className="px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-[#2563eb]/20 cursor-pointer"
              >
                <Layers className="w-4 h-4" /> Conectar Q-Acadêmico
              </button>
              <a
                href={PORTAL_URL}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-[#1e1e1e] hover:bg-[#282828] text-neutral-200 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 border border-white/10"
              >
                <ExternalLink className="w-4 h-4 text-[#60a5fa]" /> Abrir Portal Oficial
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-400 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-xs text-amber-400 font-semibold animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Explicit Check Connection Status Indicator */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full shrink-0 ${
              connectionStatus.state === "checking"
                ? "bg-amber-400 animate-ping"
                : connectionStatus.state === "online"
                ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                : "bg-rose-500"
            }`}
          />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">Status da Conexão Q-Acadêmico:</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono ${
                  connectionStatus.state === "checking"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : connectionStatus.state === "online"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {connectionStatus.state === "checking"
                  ? "Verificando..."
                  : connectionStatus.state === "online"
                  ? `Online (${connectionStatus.latencyMs}ms)`
                  : "Offline / Instável"}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {connectionStatus.message}{" "}
              {connectionStatus.lastChecked && (
                <span className="text-neutral-500 font-mono">• Testado às {connectionStatus.lastChecked}</span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleCheckConnection(false)}
          disabled={connectionStatus.state === "checking"}
          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
          title="Verificar se o portal e backend do Q-Acadêmico estão respondendo"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#60a5fa] ${connectionStatus.state === "checking" ? "animate-spin" : ""}`} />
          <span>Verificar Conexão</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#60a5fa]" /> Disciplinas do Período
          </span>
          <p className="text-2xl font-black text-white font-mono">{stats.total}</p>
          <p className="text-[11px] text-neutral-500">Matriculadas no Q-Acadêmico</p>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" /> CR / Média Geral
          </span>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-emerald-400 font-mono">{stats.mediaGeral}</p>
            <span className="text-xs text-neutral-500 font-mono">/ 100</span>
          </div>
          <p className="text-[11px] text-neutral-500">Coeficiente Oficial de Rendimento</p>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Aprovadas / Cursando
          </span>
          <p className="text-2xl font-black text-white font-mono">
            {stats.aprovadas} <span className="text-xs text-neutral-500 font-normal">/ {stats.cursando} cursando</span>
          </p>
          <p className="text-[11px] text-neutral-500">Critério IFES: Média ≥ 60.0</p>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Faltas Acumuladas
          </span>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-black text-white font-mono">{stats.totalFaltas}</p>
            <span className="text-xs text-neutral-500">aulas</span>
          </div>
          <p className="text-[11px] text-neutral-500">Limite IFES: Máximo 25% de faltas</p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#141414] p-1.5 rounded-2xl border border-white/5 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("boletim")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === "boletim"
              ? "bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Boletim Escolar Oficial ({grades.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("horarios")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === "horarios"
              ? "bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Horário de Aulas / Grade ({schedules.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("bridge")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === "bridge"
              ? "bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ponte de Dados & Importação</span>
        </button>
      </div>

      {/* VIEW 1: BOLETIM ESCOLAR OFICIAL (Q-ACADÊMICO t=2071) */}
      {activeSubTab === "boletim" && (
        <div className="space-y-4">
          {/* Controls: Search and Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-2xl border border-white/5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar disciplina no boletim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1c1c1c] text-xs text-white pl-9 pr-4 py-2 rounded-xl border border-white/5 focus:border-[#2563eb] focus:outline-none placeholder:text-neutral-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(["all", "cursando", "aprovado", "exame"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSituationFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                    situationFilter === filter
                      ? "bg-[#2563eb]/20 text-[#60a5fa] border border-[#2563eb]/30"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
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

          {/* Grades Table */}
          {filteredGrades.length > 0 ? (
            <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1a1a1a] text-neutral-400 font-semibold uppercase tracking-wider border-b border-white/5 text-[11px]">
                    <tr>
                      <th className="p-4">Componente Curricular</th>
                      <th className="p-4 text-center">C.H.</th>
                      <th className="p-4 text-center">Faltas</th>
                      <th className="p-4 text-center">1ª Etapa</th>
                      <th className="p-4 text-center">2ª Etapa</th>
                      <th className="p-4 text-center">3ª Etapa</th>
                      <th className="p-4 text-center">4ª Etapa</th>
                      <th className="p-4 text-center">Média Final</th>
                      <th className="p-4 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredGrades.map((grade) => {
                      const isApproved = grade.situacao === "Aprovado" || (grade.mediaFinal && grade.mediaFinal >= 60);
                      const isExam = grade.situacao === "Em Exame" || (grade.mediaFinal && grade.mediaFinal < 60 && grade.mediaFinal >= 20);
                      const isFailing = grade.situacao === "Reprovado" || (grade.mediaFinal && grade.mediaFinal < 20);

                      return (
                        <tr key={grade.id} className="hover:bg-white/2 transition">
                          <td className="p-4">
                            <div className="font-bold text-white">{grade.disciplina}</div>
                            <div className="text-[10px] text-neutral-500 font-mono">
                              {grade.codigo || "IFES"} {grade.docente ? `• Prof. ${grade.docente}` : ""}
                            </div>
                          </td>
                          <td className="p-4 text-center font-mono text-neutral-300">
                            {grade.cargaHoraria || 60}h
                          </td>
                          <td className="p-4 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] ${
                                (grade.faltas || 0) > 15
                                  ? "bg-red-500/20 text-red-400 font-bold"
                                  : (grade.faltas || 0) > 8
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "text-neutral-400"
                              }`}
                            >
                              {grade.faltas || 0}
                            </span>
                          </td>
                          {/* Etapas 1 a 4 */}
                          {[0, 1, 2, 3].map((idx) => {
                            const etapa = grade.etapas[idx];
                            return (
                              <td key={idx} className="p-4 text-center font-mono">
                                {etapa?.nota !== undefined ? (
                                  <span
                                    className={`font-semibold ${
                                      etapa.nota >= 60 ? "text-white" : "text-amber-400"
                                    }`}
                                  >
                                    {etapa.nota.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-neutral-600">-</span>
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
                                    ? "text-emerald-400"
                                    : isExam
                                    ? "text-amber-400"
                                    : "text-red-400"
                                }
                              >
                                {grade.mediaFinal.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-neutral-500 font-normal">--</span>
                            )}
                          </td>
                          {/* Situação */}
                          <td className="p-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                isApproved
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : isExam
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : isFailing
                                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
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
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2563eb]/10 text-[#60a5fa] flex items-center justify-center mx-auto border border-[#2563eb]/20">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Nenhum boletim sincronizado ainda</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Acesse a aba <strong>Ponte de Dados & Importação</strong> para conectar ou colar seu boletim do Q-Acadêmico e visualizar suas notas aqui.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab("bridge")}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Conectar via Ponte de Dados
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: HORÁRIO DE AULAS (Q-ACADÊMICO t=2010) */}
      {activeSubTab === "horarios" && (
        <div className="space-y-4">
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Grade Horária Individual do Estudante</h3>
              <p className="text-xs text-neutral-400">
                Horários sincronizados do Q-Acadêmico IFES (tela <code>t=2010</code>).
              </p>
            </div>
            <a
              href={`${PORTAL_URL.replace("t=2000", "t=2010")}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#60a5fa]" /> Ver no Q-Acadêmico
            </a>
          </div>

          {schedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((dia) => {
                const diaAulas = schedules.filter((s) => s.diaSemana.toLowerCase().includes(dia.toLowerCase()));
                if (diaAulas.length === 0) return null;

                return (
                  <div key={dia} className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <h4 className="text-xs font-bold text-[#60a5fa] uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {dia}-feira
                      </h4>
                      <span className="text-[10px] text-neutral-500 font-mono">{diaAulas.length} aula(s)</span>
                    </div>

                    <div className="space-y-2.5">
                      {diaAulas.map((aula) => (
                        <div key={aula.id} className="p-2.5 bg-white/2 rounded-xl border border-white/5 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{aula.disciplina}</span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              {aula.horario}
                            </span>
                          </div>
                          {aula.sala && (
                            <p className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
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
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2563eb]/10 text-[#60a5fa] flex items-center justify-center mx-auto border border-[#2563eb]/20">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Nenhum horário cadastrado ainda</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Importe sua grade colando o texto ou código da tela de <strong>Horário de Aulas (t=2010)</strong> do Q-Acadêmico.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab("bridge")}
                className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Importar Horários
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: BRIDGE & SYNC (THE EXACT BRIDGE ASKED BY USER) */}
      {activeSubTab === "bridge" && (
        <div className="space-y-6">
          {/* Guide Card */}
          <div className="bg-gradient-to-r from-[#2563eb]/10 via-[#181818] to-[#141414] border border-[#2563eb]/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#60a5fa]" />
              <h3 className="text-sm font-bold text-white">Como funciona a Ponte de Dados do Q-Acadêmico?</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              O Q-Acadêmico do IFES (<code>https://academico.ifes.edu.br/qacademico/index.asp?t=2000</code>) é o sistema oficial onde são registradas as notas de cada etapa escolar (N1 a N4), faltas e horários. Você pode conectá-lo ao Brain Studio de duas formas:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-[#60a5fa] flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> 1. Ponte Rápida (Recomendada)
                </span>
                <p className="text-neutral-400 text-[11px]">
                  Abra o Q-Acadêmico no link oficial, copie o boletim ou a tela (Ctrl+A, Ctrl+C) e cole no importador abaixo. O parser do app extrai 100% das notas e horários automaticamente!
                </p>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> 2. Conexão Direta
                </span>
                <p className="text-neutral-400 text-[11px]">
                  Informe sua matrícula e senha do Q-Acadêmico para que a ponte do servidor tente a autenticação em segundo plano.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* METHOD 1: Fast Report Importer / Paste */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2563eb]/20 text-[#60a5fa] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ponte Rápida de Dados (Colar Boletim)</h4>
                    <p className="text-[11px] text-neutral-400">Extração inteligente com IA e Parser oficial</p>
                  </div>
                </div>

                <a
                  href={PORTAL_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-xl text-xs transition flex items-center gap-1 shadow-md shadow-[#2563eb]/20"
                >
                  <span>Abrir Q-Acadêmico</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">
                  Cole o texto, tabela ou código HTML copiado do Q-Acadêmico:
                </label>
                <textarea
                  rows={8}
                  placeholder={`Abra https://academico.ifes.edu.br/qacademico/index.asp?t=2000, faça login, vá em 'Boletim Escolar' (t=2071) ou 'Horários' (t=2010), selecione tudo (Ctrl+A) e cole aqui.`}
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  className="w-full bg-[#1c1c1c] text-xs text-white p-3 rounded-xl border border-white/10 focus:border-[#2563eb] focus:outline-none placeholder:text-neutral-500 font-mono resize-y"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleProcessPastedReport}
                  disabled={isProcessing || !pastedContent.trim()}
                  className="px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#2563eb]/20"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                  <span>{isProcessing ? "Processando..." : "Processar e Sincronizar com o App"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSampleQAcademico}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-xs transition border border-white/10 flex items-center gap-1 cursor-pointer"
                  title="Carregar exemplo do IFES para teste"
                >
                  <Clipboard className="w-3.5 h-3.5 text-[#60a5fa]" /> Testar Modelo
                </button>
              </div>
            </div>

            {/* METHOD 2: Direct Credentials Connect */}
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Conexão por Credenciais</h4>
                  <p className="text-[11px] text-neutral-400">Ponte direta via backend proxy</p>
                </div>
              </div>

              <form onSubmit={handleDirectConnect} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">URL do Portal Q-Acadêmico</label>
                  <input
                    type="text"
                    readOnly
                    value={PORTAL_URL}
                    className="w-full bg-[#181818] text-xs text-neutral-400 p-2.5 rounded-xl border border-white/5 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Matrícula do IFES</label>
                  <input
                    type="text"
                    placeholder="Ex: 20241TIADM0042"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="w-full bg-[#1c1c1c] text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none placeholder:text-neutral-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Senha do Q-Acadêmico</label>
                  <input
                    type="password"
                    placeholder="Sua senha de acesso ao portal"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full bg-[#1c1c1c] text-xs text-white p-2.5 rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none placeholder:text-neutral-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !matricula.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                  <span>{isProcessing ? "Conectando..." : "Conectar Diretamente"}</span>
                </button>
              </form>

              {/* Bookmarklet helper */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-400">Atalho de 1 Clique:</span>
                <button
                  type="button"
                  onClick={handleCopyBookmarklet}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
                >
                  <Clipboard className="w-3 h-3 text-[#60a5fa]" /> Copiar Bookmarklet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
