import React, { useState, useEffect } from "react";
import {
  Building2,
  BookOpen,
  Calendar,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Search,
  BookMarked,
  Clipboard,
  Layers,
  Trash2,
  Plus,
  Terminal,
  Copy,
  Check,
  X,
  AlertTriangle,
  Info,
  Globe,
  ExternalLink,
} from "lucide-react";
import { UserProfile, IfesCourse, IfesAssignment, IfesAccountInfo } from "../../types";
import {
  loadSyncedCourses,
  saveSyncedCourses,
  loadSyncedAssignments,
  isMockOrPlaceholderCourse,
  syncIfesMoodleCoursesWithDiagnostics,
  getSyncDiagnosticLogs,
  clearSyncDiagnosticLogs,
  subscribeSyncDiagnosticLogs,
  exportSyncLogsAsText,
  SyncLogEntry,
} from "../../utils/courseSync";
import { avaApiClient } from "../../utils/avaApi";
import { avaConnectionManager } from "../../utils/avaConnectionManager";
import { AvaCalendarView } from "../ava/AvaCalendarView";
import { AvaGradesView } from "../ava/AvaGradesView";
import { AvaMessagesView } from "../ava/AvaMessagesView";
import { CourseWorkspaceView } from "../CourseWorkspaceView";
import { SubmitAssignmentModal } from "../ava/SubmitAssignmentModal";
import { IfesProfileCoursesManager } from "../IfesProfileCoursesManager";
import { AvaForumsView } from "../ava/AvaForumsView";

interface IfesAvaTabProps {
  user: UserProfile;
  courses?: IfesCourse[];
  onUpdateCourses?: (courses: IfesCourse[]) => void;
  onGenerateQuizFromTopic?: (topic: string) => void;
  onOpenSocraticWithTopic?: (topic: string) => void;
  onUpdateIfesAccount?: (account: IfesAccountInfo) => void;
  onRewardXp?: (xp: number) => void;
  onEnterCourse?: (course: IfesCourse) => void;
  onOpenAvaConnect?: () => void;
}

export const IfesAvaTab: React.FC<IfesAvaTabProps> = ({
  user,
  courses: propCourses,
  onUpdateCourses,
  onGenerateQuizFromTopic,
  onOpenSocraticWithTopic,
  onUpdateIfesAccount,
  onRewardXp,
  onOpenAvaConnect,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"courses" | "grades" | "forums" | "calendar" | "messages">("courses");
  const [courses, setCourses] = useState<IfesCourse[]>(() => {
    if (propCourses && propCourses.length > 0) return propCourses;
    return loadSyncedCourses();
  });
  const [assignments, setAssignments] = useState<IfesAssignment[]>(() => loadSyncedAssignments());
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<IfesCourse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittingAssignment, setSubmittingAssignment] = useState<IfesAssignment | null>(null);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [diagLogs, setDiagLogs] = useState<SyncLogEntry[]>(() => getSyncDiagnosticLogs());
  const [copiedLogs, setCopiedLogs] = useState(false);

  useEffect(() => {
    return subscribeSyncDiagnosticLogs((logs) => {
      setDiagLogs(logs);
    });
  }, []);

  // Sync with prop courses if parent updates
  useEffect(() => {
    if (propCourses) {
      setCourses(propCourses);
    }
  }, [propCourses]);

  const campusName = user.ifesAccount?.campusName || "IFES - Cefor / Campus Serra";
  const matricula = user.ifesAccount?.matricula || "20241IFES0482";

  const handleUpdateCourseList = (updated: IfesCourse[]) => {
    setCourses(updated);
    saveSyncedCourses(updated);
    if (onUpdateCourses) {
      onUpdateCourses(updated);
    }
  };

  const [isSyncingApi, setIsSyncingApi] = useState(false);

  const handleDeleteCourse = (courseId: string, courseName: string) => {
    const updated = courses.filter((c) => c.id !== courseId);
    handleUpdateCourseList(updated);
    setSyncToast(`Disciplina "${courseName}" removida.`);
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleSyncFromApi = async () => {
    const userUid = user.id || user.uid || "local-student";
    const stored = await avaConnectionManager.getStoredCredentials(userUid);

    setIsSyncingApi(true);
    setSyncToast("Executando sincronização diagnóstica com o AVA IFES...");

    try {
      const diagResult = await syncIfesMoodleCoursesWithDiagnostics({
        campusUrl: stored?.campusUrl || user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br",
        campusName: stored?.campusName || campusName || "IFES - Cefor (AVA3)",
        username: stored?.username || user.ifesAccount?.matricula || user.ifesAccount?.username || "",
        password: stored?.password,
        token: stored?.token || user.ifesAccount?.token,
        uid: userUid,
        existingCourses: courses,
      });

      if (diagResult.success) {
        if (diagResult.courses && diagResult.courses.length > 0) {
          handleUpdateCourseList(diagResult.courses);
        }
        if (diagResult.assignments && diagResult.assignments.length > 0) {
          setAssignments(diagResult.assignments);
        }
        if (diagResult.account && onUpdateIfesAccount) {
          onUpdateIfesAccount(diagResult.account);
        }
        setSyncToast(diagResult.summary);
      } else {
        setSyncToast(diagResult.summary || diagResult.error || "Falha na sincronização.");
        if (
          diagResult.error?.toLowerCase().includes("credencia") ||
          diagResult.error?.toLowerCase().includes("usuário ou senha") ||
          diagResult.error?.toLowerCase().includes("ausentes")
        ) {
          if (onOpenAvaConnect) {
            onOpenAvaConnect();
          } else {
            setShowProfileManager(true);
          }
        }
      }
    } catch (err: any) {
      setSyncToast(`Erro inesperado durante a sincronização: ${err?.message || err}`);
    } finally {
      setIsSyncingApi(false);
      setTimeout(() => setSyncToast(null), 4500);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.professor && c.professor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Se uma matéria for selecionada, abre a Sala Virtual Completa com Envio de Atividades, Fóruns e Questionários
  if (selectedCourse) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <CourseWorkspaceView
          course={selectedCourse}
          user={user}
          modules={[]}
          onBack={() => setSelectedCourse(null)}
          onRewardXp={onRewardXp || (() => {})}
          onRewardCoins={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Sync Toast Feedback */}
      {syncToast && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{syncToast}</span>
          </div>
          <button
            onClick={() => setSyncToast(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--app-text)]">
              Ambiente Virtual de Aprendizagem (AVA Moodle IFES)
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (!user.ifesAccount?.connected && onOpenAvaConnect) {
                onOpenAvaConnect();
              } else {
                handleSyncFromApi();
              }
            }}
            disabled={isSyncingApi}
            className="px-4 py-2 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Sincronizar matérias e atividades diretamente com o AVA IFES"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingApi ? "animate-spin" : ""}`} />
            <span>{isSyncingApi ? "Sincronizando com AVA..." : "Sincronizar com AVA IFES"}</span>
          </button>
        </div>
      </div>

      {/* Prominent connection request if student is not yet connected */}
      {!user.ifesAccount?.connected && onOpenAvaConnect && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-sm sm:text-base font-bold text-[var(--app-text)]">
                Conexão com o AVA IFES Necessária
              </h3>
            </div>
            <p className="text-xs text-[var(--app-text-muted)] max-w-xl">
              Entre com suas credenciais do AVA IFES (matrícula e senha institucional) para sincronizar suas disciplinas reais, boletim de notas, questionários e fóruns com conexão permanente e renovação automática.
            </p>
          </div>
          <button
            onClick={onOpenAvaConnect}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Building2 className="w-4 h-4" />
            <span>Conectar Perfil AVA IFES Agora</span>
          </button>
        </div>
      )}

      {/* Institutional Links & Campus Guarapari Quick Access */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-bold text-[var(--app-text)]">Link Oficial IFES Campus Guarapari:</span>
          <a
            href="https://guarapari.ifes.edu.br"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
            title="Abrir site oficial do Campus Guarapari em nova aba"
          >
            <span>guarapari.ifes.edu.br</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[var(--app-text-muted)]">
          <span className="hidden sm:inline">Portal Oficial · Cursos Técnicos, Superiores e Notícias</span>
          <a
            href="https://guarapari.ifes.edu.br/horarios-e-calendarios"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--app-primary)] transition hover:underline"
          >
            Horários & Calendários
          </a>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[var(--app-border)] pb-3 scrollbar-none">
        <button
          onClick={() => setActiveSubTab("courses")}
          className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeSubTab === "courses"
              ? "bg-[var(--app-primary)] text-white shadow-xs"
              : "bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Minhas Disciplinas ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("grades")}
          className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeSubTab === "grades"
              ? "bg-[var(--app-primary)] text-white shadow-xs"
              : "bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Boletim de Notas</span>
        </button>

        <button
          onClick={() => setActiveSubTab("forums")}
          className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeSubTab === "forums"
              ? "bg-[var(--app-primary)] text-white shadow-xs"
              : "bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Fóruns de Dúvida & Conversa</span>
        </button>

        <button
          onClick={() => setActiveSubTab("calendar")}
          className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeSubTab === "calendar"
              ? "bg-[var(--app-primary)] text-white shadow-xs"
              : "bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendário Acadêmico</span>
        </button>

        <button
          onClick={() => setActiveSubTab("messages")}
          className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
            activeSubTab === "messages"
              ? "bg-[var(--app-primary)] text-white shadow-xs"
              : "bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Mensagens do Professor</span>
        </button>
      </div>

      {/* Sub-tab views */}
      {activeSubTab === "courses" && (
        <div className="space-y-4">
          {/* Search & filter toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar matéria por nome, sigla ou professor..."
                className="w-full pl-10 pr-4 py-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl text-xs text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none focus:border-[var(--app-primary)] transition"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-[var(--app-text-muted)] font-semibold">
              <span>Exibindo <strong>{filteredCourses.length}</strong> de {courses.length} disciplinas</span>
              <button
                onClick={() => setShowProfileManager(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar / Importar</span>
              </button>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-black text-[var(--app-text)]">
                  Nenhuma Disciplina do AVA IFES Sincronizada
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Insira suas credenciais institucionais do IFES (matrícula e senha) para autenticar no seu perfil e baixar suas matérias e conteúdos reais do AVA Moodle.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={() => {
                    if (onOpenAvaConnect) {
                      onOpenAvaConnect();
                    } else {
                      setShowProfileManager(true);
                    }
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Digitar Credenciais e Sincronizar AVA</span>
                </button>
                <button
                  onClick={() => setShowProfileManager(true)}
                  className="px-4 py-2.5 bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Colar Texto ou Grade Manual</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition flex flex-col justify-between space-y-4 shadow-xs group"
                >
                  <div className="space-y-2.5">
                    {/* Unboxed metadata header adhering to zero-pill rules */}
                    <div className="flex items-center justify-between text-xs text-[var(--app-text-muted)] font-mono">
                      <span>{course.code || "IFES"}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                        {course.progressPercent || 45}% concluído
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--app-text)] group-hover:text-[var(--app-primary)] transition leading-snug">
                      {course.name}
                    </h3>

                    <p className="text-xs text-[var(--app-text-muted)]">
                      <span>{course.professor || "Corpo Docente IFES"}</span>
                      <span className="mx-1.5 opacity-40">·</span>
                      <span>{course.campus || campusName}</span>
                    </p>

                    {/* Progress Track bar */}
                    <div className="w-full bg-[var(--app-bg)] h-1.5 rounded-full overflow-hidden border border-[var(--app-border)]">
                      <div
                        className="bg-[var(--app-primary)] h-full rounded-full transition-all duration-300"
                        style={{ width: `${course.progressPercent || 45}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--app-border)] flex items-center justify-between">
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.name)}
                      className="p-1.5 text-[var(--app-text-muted)] hover:text-red-500 rounded-lg transition cursor-pointer"
                      title={`Remover ${course.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="px-3.5 py-1.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <span>Acessar Sala</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "grades" && (
        <AvaGradesView
          user={user}
          courses={courses}
        />
      )}

      {activeSubTab === "forums" && (
        <AvaForumsView
          courses={courses}
          user={user}
          onRewardXp={onRewardXp}
        />
      )}

      {activeSubTab === "calendar" && (
        <AvaCalendarView
          assignments={assignments}
          onOpenSubmitModal={(assign) => setSubmittingAssignment(assign)}
        />
      )}

      {activeSubTab === "messages" && (
        <AvaMessagesView
          campusName={campusName}
        />
      )}

      {/* Courses Profile Modal */}
      {showProfileManager && (
        <IfesProfileCoursesManager
          isOpen={showProfileManager}
          onClose={() => setShowProfileManager(false)}
          courses={courses}
          onSaveCourses={(updated) => {
            handleUpdateCourseList(updated);
          }}
          campusName={campusName}
        />
      )}

      {/* Diagnostics Logs Modal */}
      {showDiagnosticsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[var(--app-border)] flex items-center justify-between gap-4 bg-[var(--app-bg)]/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shrink-0">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-[var(--app-text)] truncate flex items-center gap-2">
                    <span>Console de Diagnóstico & Logs do AVA IFES</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400">
                      {diagLogs.length} eventos
                    </span>
                  </h3>
                  <p className="text-xs text-[var(--app-text-muted)] truncate">
                    Auditoria técnica de rede, autenticação Moodle e extração de matérias em tempo real
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="p-2 rounded-xl hover:bg-gray-500/15 text-[var(--app-text-muted)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-5 py-3 border-b border-[var(--app-border)] bg-[var(--app-card)] flex items-center justify-between gap-3 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[var(--app-text-muted)]">Servidor alvo:</span>
                <span className="font-mono font-bold text-[var(--app-primary)] bg-[var(--app-primary)]/10 px-2 py-0.5 rounded-md">
                  {user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = exportSyncLogsAsText();
                    navigator.clipboard.writeText(text);
                    setCopiedLogs(true);
                    setTimeout(() => setCopiedLogs(false), 2500);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLogs ? "Copiado!" : "Copiar Logs"}</span>
                </button>

                <button
                  onClick={() => {
                    clearSyncDiagnosticLogs();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 text-[var(--app-text-muted)] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>

                <button
                  onClick={() => handleSyncFromApi()}
                  disabled={isSyncingApi}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingApi ? "animate-spin" : ""}`} />
                  <span>{isSyncingApi ? "Executando..." : "Testar Sincronização"}</span>
                </button>
              </div>
            </div>

            {/* Logs Stream Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 font-mono text-xs bg-[var(--app-bg)]/40">
              {diagLogs.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-[var(--app-text)]">
                    Nenhum registro de diagnóstico capturado ainda nesta sessão.
                  </p>
                  <p className="text-xs text-[var(--app-text-muted)] max-w-md mx-auto">
                    Clique no botão abaixo para rodar uma verificação completa de conexão e capturar as respostas do Moodle.
                  </p>
                  <button
                    onClick={() => handleSyncFromApi()}
                    className="px-4 py-2 rounded-xl bg-[var(--app-primary)] text-white font-sans font-bold text-xs hover:opacity-90 transition cursor-pointer"
                  >
                    Iniciar Teste de Diagnóstico
                  </button>
                </div>
              ) : (
                diagLogs.map((log) => {
                  const levelClasses =
                    log.level === "error"
                      ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
                      : log.level === "warn"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : log.level === "success"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300";

                  const badgeClasses =
                    log.level === "error"
                      ? "bg-red-500 text-white"
                      : log.level === "warn"
                      ? "bg-amber-500 text-white"
                      : log.level === "success"
                      ? "bg-emerald-500 text-white"
                      : "bg-indigo-500 text-white";

                  return (
                    <div
                      key={log.id}
                      className={`p-3.5 rounded-2xl border transition ${levelClasses} shadow-xs space-y-1.5`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${badgeClasses}`}>
                            {log.level}
                          </span>
                          <span className="font-bold text-[var(--app-text)] uppercase tracking-wider text-[10px]">
                            [{log.step}]
                          </span>
                        </div>
                        <span className="text-[var(--app-text-muted)] text-[10px]">
                          {log.timestamp}
                        </span>
                      </div>

                      <p className="font-sans font-medium text-xs leading-relaxed text-[var(--app-text)]">
                        {log.message}
                      </p>

                      {log.details && (
                        <div className="mt-2 p-2.5 rounded-xl bg-black/40 text-slate-200 border border-white/10 text-[10px] whitespace-pre-wrap overflow-x-auto max-h-48 font-mono">
                          {log.details}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--app-border)] bg-[var(--app-card)] flex items-center justify-between text-xs">
              <span className="text-[var(--app-text-muted)]">
                Dica: Erros de autenticação ("credenciais inválidas") são limpos automaticamente para sua segurança.
              </span>
              <button
                onClick={() => setShowDiagnosticsModal(false)}
                className="px-4 py-2 rounded-xl bg-[var(--app-bg)] hover:bg-gray-500/20 text-[var(--app-text)] font-bold transition cursor-pointer border border-[var(--app-border)]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
