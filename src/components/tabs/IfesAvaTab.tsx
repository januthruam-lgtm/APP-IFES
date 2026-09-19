import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  RefreshCw,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Zap,
  Brain,
  Lock,
  User,
  Key,
  LogOut,
  GraduationCap,
  Clock,
  ChevronRight,
  ShieldCheck,
  Globe,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Plus,
  Filter,
  Trash2,
  LogIn,
  Search,
  Award,
  Bell,
  Layers,
  FileText,
  HelpCircle,
} from "lucide-react";
import { IfesAssignment, IfesCourse, IfesAccountInfo, UserProfile } from "../../types";
import { IfesProfileCoursesManager } from "../IfesProfileCoursesManager";
import { avaApiClient } from "../../utils/avaApi";
import {
  loadSyncedCourses,
  saveSyncedCourses,
  loadSyncedAssignments,
  saveSyncedAssignments,
  deleteSingleCourse,
  clearAllSyncedAcademicData,
  calculateCourseProgress,
  calculateOverallProgress,
  purgeAnyFictitiousCourses,
} from "../../utils/courseSync";
import {
  triggerStrictNotification,
  syncDeadlinesWithServiceWorker,
} from "../../utils/notificationScheduler";
import { AvaSubmissionModal } from "../ava/AvaSubmissionModal";
import { AvaGradesView } from "../ava/AvaGradesView";
import { AvaCalendarView } from "../ava/AvaCalendarView";
import { AvaMessagesView } from "../ava/AvaMessagesView";
import { AvaCourseRoomView } from "../ava/AvaCourseRoomView";
import { QAcademicoView } from "../qacademico/QAcademicoView";
import { QAcademicoAccountInfo } from "../../types";

interface IfesAvaTabProps {
  user: UserProfile;
  onGenerateQuizFromTopic: (topic: string) => void;
  onOpenSocraticWithTopic: (topic: string) => void;
  onUpdateIfesAccount?: (account: IfesAccountInfo | undefined) => void;
  onUpdateQAcademicoAccount?: (account: QAcademicoAccountInfo | undefined) => void;
  onImportCourses?: (courses: IfesCourse[]) => void;
  onRewardXp?: (xp: number) => void;
  onEnterCourse?: (course: IfesCourse) => void;
}

const CAMPUS_OPTIONS = [
  { name: "IFES Cefor AVA3 (ava3.cefor.ifes.edu.br)", url: "https://ava3.cefor.ifes.edu.br" },
  { name: "IFES AVA Geral (Presencial e Híbrido)", url: "https://ava.ifes.edu.br" },
  { name: "IFES Cefor (Educação a Distância e Cursos Abertos)", url: "https://ava.cefor.ifes.edu.br" },
  { name: "IFES Campus Serra", url: "https://ava.serra.ifes.edu.br" },
  { name: "IFES Campus Vitória", url: "https://ava.vitoria.ifes.edu.br" },
  { name: "IFES Pós-Graduação", url: "https://ava.pos.ifes.edu.br" },
  { name: "IFES EaD", url: "https://avaead.ifes.edu.br" },
  { name: "Outro Campus IFES (Digitar URL)", url: "custom" },
];

export const IfesAvaTab: React.FC<IfesAvaTabProps> = ({
  user,
  onGenerateQuizFromTopic,
  onOpenSocraticWithTopic,
  onUpdateIfesAccount,
  onUpdateQAcademicoAccount,
  onImportCourses,
  onRewardXp,
  onEnterCourse,
}) => {
  // Navigation Sub-tab inside AVA IFES
  const [avaSubTab, setAvaSubTab] = useState<"courses" | "timeline" | "grades" | "calendar" | "messages" | "connection" | "qacademico">("courses");

  const [selectedCampusPreset, setSelectedCampusPreset] = useState("https://ava3.cefor.ifes.edu.br");
  const [campusUrl, setCampusUrl] = useState(
    user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br"
  );
  const [username, setUsername] = useState(user.ifesAccount?.username || "");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(user.ifesAccount?.token || "");
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"credentials" | "token">("credentials");
  const [showCoursesManager, setShowCoursesManager] = useState(false);

  const [selectedCourseRoom, setSelectedCourseRoom] = useState<IfesCourse | null>(null);
  const [submissionModalAssignment, setSubmissionModalAssignment] = useState<IfesAssignment | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "urgent" | "quiz" | "assign">("all");
  const [courseSearchQuery, setCourseSearchQuery] = useState("");

  const [courses, setCourses] = useState<IfesCourse[]>(() => loadSyncedCourses());

  const [assignments, setAssignments] = useState<IfesAssignment[]>(() => loadSyncedAssignments());

  // Keep courses & assignments reactive to global updates
  useEffect(() => {
    const handleCoursesChange = (e: any) => {
      if (e.detail?.courses) {
        setCourses(e.detail.courses);
      }
    };
    const handleAssignmentsChange = (e: any) => {
      if (e.detail?.assignments) {
        setAssignments(e.detail.assignments);
      }
    };
    window.addEventListener("brainstudio:courses-updated", handleCoursesChange);
    window.addEventListener("brainstudio:assignments-updated", handleAssignmentsChange);
    return () => {
      window.removeEventListener("brainstudio:courses-updated", handleCoursesChange);
      window.removeEventListener("brainstudio:assignments-updated", handleAssignmentsChange);
    };
  }, []);

  const handleCampusPresetChange = (preset: string) => {
    setSelectedCampusPreset(preset);
    if (preset !== "custom") {
      setCampusUrl(preset);
    }
  };

  const getCampusDisplayName = (url: string) => {
    const found = CAMPUS_OPTIONS.find((c) => c.url === url);
    return found ? found.name : "IFES - Campus Personalizado";
  };

  const handleLoginIfes = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authMode === "credentials" && (!username.trim() || !password.trim())) {
      setErrorMessage("Por favor, preencha seu Usuário/Matrícula do IFES e a Senha.");
      return;
    }

    if (authMode === "token" && !token.trim()) {
      setErrorMessage("Por favor, informe seu token de WebService do Moodle.");
      return;
    }

    setIsLoading(true);
    try {
      const selectedName = getCampusDisplayName(campusUrl);
      const data = await avaApiClient.connect({
        campusUrl,
        username: username.trim(),
        password,
        token: authMode === "token" ? token.trim() : undefined,
        campusName: selectedName,
      });

      if (!data.success && data.error) {
        throw new Error(data.error || "Não foi possível autenticar no AVA Moodle IFES.");
      }

      if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
        saveSyncedCourses(data.courses);
      }
      if (data.assignments && Array.isArray(data.assignments)) {
        setAssignments(data.assignments);
        saveSyncedAssignments(data.assignments);
      }

      if (data.account && onUpdateIfesAccount) {
        onUpdateIfesAccount(data.account);
      }

      setSuccessMessage(data.message || `Conectado com sucesso ao ${selectedName}! Disciplinas e prazos integrados.`);
      setPassword("");
      setAvaSubTab("courses");
    } catch (err: any) {
      setErrorMessage(err.message || "Erro de autenticação com o AVA IFES. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await avaApiClient.sync({
        campusUrl: user.ifesAccount?.campusUrl || campusUrl,
        studentId: user.ifesAccount?.username || username,
        token: user.ifesAccount?.token || token,
        campusName: user.ifesAccount?.campusName || getCampusDisplayName(campusUrl),
        existingCourses: courses,
        existingAssignments: assignments,
      });

      if (data.courses && Array.isArray(data.courses)) {
        setCourses(data.courses);
        saveSyncedCourses(data.courses);
      }
      if (data.assignments && Array.isArray(data.assignments)) {
        setAssignments(data.assignments);
        saveSyncedAssignments(data.assignments);
      }

      if (onUpdateIfesAccount && user.ifesAccount) {
        onUpdateIfesAccount({
          ...user.ifesAccount,
          lastSync: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }

      setSuccessMessage(data.message || "Disciplinas e tarefas sincronizadas diretamente com a API do AVA IFES!");
      setTimeout(() => setSuccessMessage(null), 4000);

      // Agendamento dinâmico de prazos com Service Worker
      if (data.assignments && data.assignments.length > 0) {
        syncDeadlinesWithServiceWorker([], data.assignments);
      }
    } catch (err: any) {
      setErrorMessage("Erro ao sincronizar dados com a API do AVA IFES. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (onUpdateIfesAccount) {
      onUpdateIfesAccount(undefined);
    }
    setPassword("");
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSaveCustomCourses = (updatedCourses: IfesCourse[]) => {
    setCourses(updatedCourses);
    saveSyncedCourses(updatedCourses);
    setSuccessMessage(`${updatedCourses.length} matérias reais foram salvas e sincronizadas!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteSingleCourse(courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setSuccessMessage("Matéria excluída com sucesso.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleClearAllCourses = () => {
    clearAllSyncedAcademicData();
    setCourses([]);
    setAssignments([]);
    saveSyncedAssignments([]);
    setSuccessMessage("Todas as matérias e tarefas foram limpas com sucesso.");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const isConnected = !!user.ifesAccount?.connected;
  const studentName = user.ifesAccount?.fullname || user.name;
  const studentUsername = user.ifesAccount?.username || username;
  const currentCampusName = user.ifesAccount?.campusName || getCampusDisplayName(campusUrl);

  const filteredAssignments = assignments.filter((a) => {
    if (activeFilter === "pending") return a.status === "pending" || a.status === "urgent";
    if (activeFilter === "urgent") return a.status === "urgent";
    if (activeFilter === "quiz") return a.type === "questionario";
    if (activeFilter === "assign") return a.type === "tarefa" || a.type === "projeto";
    return true;
  });

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
        (c.professor && c.professor.toLowerCase().includes(courseSearchQuery.toLowerCase()))
    );
  }, [courses, courseSearchQuery]);

  const urgentCount = assignments.filter((a) => a.status === "urgent").length;
  const dynamicOverallProgress = calculateOverallProgress(courses, user.completedModules);

  // If a specific course room is open, render that virtual room
  if (selectedCourseRoom) {
    return (
      <div id="ifes-ava-tab" className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        <AvaCourseRoomView
          course={selectedCourseRoom}
          user={user}
          assignments={assignments}
          onBack={() => setSelectedCourseRoom(null)}
          onOpenSubmitModal={(assign) => setSubmissionModalAssignment(assign)}
          onGenerateQuizFromTopic={onGenerateQuizFromTopic}
          onOpenSocraticWithTopic={onOpenSocraticWithTopic}
        />
        {/* Submission Modal */}
        <AvaSubmissionModal
          isOpen={!!submissionModalAssignment}
          onClose={() => setSubmissionModalAssignment(null)}
          assignment={submissionModalAssignment}
          user={user}
          onSuccess={(updated) => {
            setAssignments((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          }}
        />
      </div>
    );
  }

  return (
    <div id="ifes-ava-tab" className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Authentic AVA IFES Header */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--app-primary)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[var(--app-primary)]/15 text-[var(--app-primary)] border border-[var(--app-primary)]/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Ambiente Virtual de Aprendizagem IFES
              </span>
              {isConnected ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Conectado via API ({currentCampusName})
                </span>
              ) : (
                <span className="text-xs text-[var(--app-text-muted)] font-mono">Não conectado</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--app-text)] tracking-tight">
              Portal Acadêmico AVA IFES (Moodle Oficial)
            </h1>
            <p className="text-sm text-[var(--app-text-muted)] max-w-2xl">
              Acesse suas disciplinas, envie atividades avaliativas, consulte suas notas e acompanhe os prazos com sincronização direta via API Moodle do Instituto Federal do Espírito Santo.
            </p>
          </div>

          {/* User Account Bar & Direct Sync Button */}
          {isConnected ? (
            <div className="bg-[var(--app-card-secondary)] p-4 rounded-2xl border border-[var(--app-border)] space-y-3 shrink-0 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center font-bold text-base border border-[var(--app-primary)]/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--app-text)] leading-tight">{studentName}</h4>
                  <p className="text-[11px] text-[var(--app-text-muted)] font-mono">
                    Matrícula: {studentUsername}
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{currentCampusName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-2 border-t border-[var(--app-border)]">
                <button
                  onClick={handleSyncNow}
                  disabled={isLoading}
                  className="px-3 py-2 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                  title="Sincronizar dados diretamente com a API do Moodle"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>{isLoading ? "Sincronizando..." : "Sincronizar via API"}</span>
                </button>
                <button
                  onClick={() => setShowCoursesManager(true)}
                  className="px-3 py-2 bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] rounded-xl text-xs transition border border-[var(--app-border)] flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Gerenciar matérias reais do seu perfil"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>Matérias ({courses.length})</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-2 bg-[var(--app-card)] hover:bg-rose-500/20 text-[var(--app-text-muted)] hover:text-rose-500 rounded-xl text-xs transition border border-[var(--app-border)] flex items-center justify-center gap-1 cursor-pointer"
                  title="Desconectar do AVA IFES"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="sm:hidden">Sair</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setAvaSubTab("connection")}
                className="px-4 py-2.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-[var(--app-primary)]/20 cursor-pointer"
              >
                <Lock className="w-4 h-4" /> Conectar Conta do AVA IFES
              </button>
              <button
                onClick={() => setShowCoursesManager(true)}
                className="px-4 py-2.5 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] font-semibold text-xs rounded-xl transition flex items-center gap-1.5 border border-[var(--app-border)] cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--app-primary)]" /> Gerenciar Matérias ({courses.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs text-rose-600 dark:text-rose-400 font-semibold animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Official AVA IFES Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#141414] p-1.5 rounded-2xl border border-white/5 overflow-x-auto">
        <button
          onClick={() => setAvaSubTab("courses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            avaSubTab === "courses"
              ? "bg-[#10b981] text-black shadow-md shadow-[#10b981]/15"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Meus Cursos ({courses.length})</span>
        </button>

        <button
          onClick={() => setAvaSubTab("timeline")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            avaSubTab === "timeline"
              ? "bg-[#10b981] text-black shadow-md shadow-[#10b981]/15"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Linha do Tempo / Tarefas ({assignments.length})</span>
        </button>

        <button
          onClick={() => setAvaSubTab("grades")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            avaSubTab === "grades"
              ? "bg-[#10b981] text-black shadow-md shadow-[#10b981]/15"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Quadro de Notas / Boletim</span>
        </button>

        <button
          onClick={() => setAvaSubTab("calendar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            avaSubTab === "calendar"
              ? "bg-[#10b981] text-black shadow-md shadow-[#10b981]/15"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendário Acadêmico</span>
        </button>

        <button
          onClick={() => setAvaSubTab("messages")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            avaSubTab === "messages"
              ? "bg-[#10b981] text-black shadow-md shadow-[#10b981]/15"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Avisos do Campus</span>
        </button>

        <button
          onClick={() => setAvaSubTab("connection")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            avaSubTab === "connection"
              ? "bg-[#10b981] text-black shadow-md shadow-[#10b981]/15"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Conexão API Moodle</span>
        </button>

        <button
          onClick={() => setAvaSubTab("qacademico")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            avaSubTab === "qacademico"
              ? "bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/20"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-[#60a5fa]" />
          <span>Ponte Q-Acadêmico IFES</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Disciplinas do Perfil
          </span>
          <p className="text-2xl font-black text-white font-mono">{courses.length}</p>
          <p className="text-[11px] text-neutral-500">Matriculado no AVA IFES</p>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Tarefas & Questionários
          </span>
          <p className="text-2xl font-black text-[#10b981] font-mono">{assignments.length}</p>
          <p className="text-[11px] text-neutral-500">No Calendário Oficial</p>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Prazos Iminentes
          </span>
          <p className="text-2xl font-black text-amber-400 font-mono">{urgentCount}</p>
          <p className="text-[11px] text-neutral-500">Vencem em menos de 3 dias</p>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Progresso Acadêmico
          </span>
          <p className="text-2xl font-black text-[#e2ff31] font-mono">
            {dynamicOverallProgress}%
          </p>
          <p className="text-[11px] text-neutral-500">Lições & Entregas Concluídas</p>
        </div>
      </div>

      {/* SUB-TAB 1: MEUS CURSOS */}
      {avaSubTab === "courses" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
                placeholder="Buscar disciplina por nome, sigla ou professor..."
                className="w-full pl-10 pr-4 py-2 bg-[#141414] border border-white/10 rounded-xl text-xs text-white placeholder:text-neutral-500 outline-none focus:border-[#10b981] transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCoursesManager(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#10b981]/15 hover:bg-[#10b981]/25 text-[#10b981] border border-[#10b981]/30 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Sincronizar via API ou gerenciar matérias reais"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Gerenciar Matérias</span>
              </button>

              {courses.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Tem certeza que deseja excluir TODAS as matérias?")) {
                      handleClearAllCourses();
                    }
                  }}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition border border-rose-500/20 cursor-pointer"
                  title="Excluir todas as matérias"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="p-12 text-center bg-[#141414] border border-white/5 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">Nenhuma matéria sincronizada no momento</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Todas as matérias fictícias foram totalmente removidas. Para exibir estritamente as matérias do seu perfil real do AVA IFES, clique em <span className="text-[#10b981] font-semibold">Sincronizar via API</span> ou utilize o botão <span className="text-[#10b981] font-semibold">Gerenciar Matérias</span>.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setAvaSubTab("connection")}
                  className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-lg shadow-[#10b981]/20 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Sincronizar via API Moodle
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.map((course) => {
                const singleProgress = calculateCourseProgress(course, user.completedModules);

                return (
                  <div
                    key={course.id}
                    className="bg-[#141414] border border-white/5 hover:border-white/20 rounded-2xl p-5 transition space-y-4 flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                          {course.code}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#e2ff31] font-mono">
                            {singleProgress}%
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja excluir a matéria "${course.name}"?`)) {
                                handleDeleteCourse(course.id);
                              }
                            }}
                            className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                            title={`Excluir ${course.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-white group-hover:text-[#10b981] transition">
                        {course.name}
                      </h4>
                      <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-[#10b981]" />
                        {course.professor}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-400">
                          <span>Conclusão no AVA</span>
                          <span>{singleProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#10b981] rounded-full transition-all duration-500"
                            style={{ width: `${singleProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => setSelectedCourseRoom(course)}
                          className="w-full py-2.5 bg-[#10b981] hover:bg-[#059669] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-[#10b981]/15 cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Entrar na Sala da Matéria</span>
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onGenerateQuizFromTopic(`${course.name} (${course.code})`)}
                            className="flex-1 py-2 bg-[#1a1a1a] hover:bg-[#242424] text-neutral-200 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Gera 10 questões e flashcards com base no conteúdo desta disciplina"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#e2ff31]" /> 10 Questões
                          </button>

                          <button
                            onClick={() => onOpenSocraticWithTopic(`${course.name} (${course.code})`)}
                            className="p-2 bg-[#1a1a1a] hover:bg-[#242424] text-neutral-300 hover:text-white border border-white/10 rounded-xl transition cursor-pointer"
                            title="Tutoria Socrática desta disciplina"
                          >
                            <Brain className="w-4 h-4 text-[#10b981]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: LINHA DO TEMPO / TAREFAS */}
      {avaSubTab === "timeline" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#10b981]" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Tarefas & Questionários do AVA Moodle
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 bg-[#141414] p-1 rounded-xl border border-white/5 text-xs font-semibold">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-white/10 text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Todas ({assignments.length})
              </button>
              <button
                onClick={() => setActiveFilter("urgent")}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  activeFilter === "urgent"
                    ? "bg-red-500/20 text-red-400 font-bold border border-red-500/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-red-400" /> Urgentes ({urgentCount})
              </button>
              <button
                onClick={() => setActiveFilter("quiz")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeFilter === "quiz"
                    ? "bg-white/10 text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Questionários
              </button>
              <button
                onClick={() => setActiveFilter("assign")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeFilter === "assign"
                    ? "bg-white/10 text-white font-bold"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Trabalhos
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAssignments.length === 0 ? (
              <div className="p-10 text-center bg-[#141414] border border-white/5 rounded-3xl space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">Nenhuma atividade com este filtro</p>
                <p className="text-xs text-neutral-400">Você está em dia com os prazos selecionados!</p>
              </div>
            ) : (
              filteredAssignments.map((assign) => {
                const isUrgent = assign.status === "urgent";
                const dueDateObj = new Date(assign.dueDate);
                const diffDays = Math.ceil((dueDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={assign.id}
                    className={`bg-[#141414] rounded-2xl border p-5 transition space-y-3 ${
                      isUrgent
                        ? "border-red-500/30 bg-red-950/10 hover:border-red-500/50"
                        : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#10b981] uppercase tracking-wider">
                            {assign.courseName}
                          </span>
                          {isUrgent ? (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Prazo Iminente ({diffDays}d)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-white/5 text-neutral-300 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-400" /> Entrega em {diffDays}d
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white">{assign.title}</h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-neutral-300">
                          {assign.weight}
                        </span>
                        <p className="text-[11px] text-neutral-400">
                          Entrega: {dueDateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às{" "}
                          {dueDateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {assign.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSubmissionModalAssignment(assign)}
                          className="px-3.5 py-1.5 bg-[#10b981] hover:bg-[#059669] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-md shadow-[#10b981]/20 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" /> Entregar no AVA IFES
                        </button>

                        <button
                          onClick={() => onGenerateQuizFromTopic(`${assign.courseName} - ${assign.title}`)}
                          className="px-3.5 py-1.5 bg-[#e2ff31] hover:bg-[#d4f220] text-black rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-[#e2ff31]/10 cursor-pointer"
                          title="Gera 10 questões e flashcards para treinar esta tarefa"
                        >
                          <Zap className="w-3.5 h-3.5 fill-black" /> Gerar 10 Questões
                        </button>

                        <button
                          onClick={() => onOpenSocraticWithTopic(`${assign.courseName}: ${assign.title}`)}
                          className="px-3.5 py-1.5 bg-[#1f1f1f] hover:bg-[#282828] text-white border border-white/10 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Brain className="w-3.5 h-3.5 text-[#e2ff31]" /> Estudo Socrático
                        </button>
                      </div>

                      {assign.link && (
                        <a
                          href={assign.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-medium transition"
                        >
                          Abrir no AVA IFES <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: LIVRO DE NOTAS / BOLETIM */}
      {avaSubTab === "grades" && (
        <AvaGradesView courses={courses} user={user} />
      )}

      {/* SUB-TAB 4: CALENDÁRIO ACADÊMICO */}
      {avaSubTab === "calendar" && (
        <AvaCalendarView
          assignments={assignments}
          onOpenSubmitModal={(assign) => setSubmissionModalAssignment(assign)}
        />
      )}

      {/* SUB-TAB 5: MURAL DE AVISOS */}
      {avaSubTab === "messages" && (
        <AvaMessagesView campusName={currentCampusName} />
      )}

      {/* SUB-TAB 6: CONEXÃO API & CONFIGURAÇÕES */}
      {avaSubTab === "connection" && (
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#10b981]" />
                Conexão Direta com a API WebService do Moodle IFES
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Autenticação direta com os servidores oficiais do Instituto Federal do Espírito Santo
              </p>
            </div>
            <span className="text-xs text-[#10b981] font-mono">+150 XP de Bônus</span>
          </div>

          <form onSubmit={handleLoginIfes} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#10b981]" /> Selecione seu Campus / AVA IFES
                </label>
                <select
                  value={selectedCampusPreset}
                  onChange={(e) => handleCampusPresetChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#10b981] transition cursor-pointer"
                >
                  {CAMPUS_OPTIONS.map((c) => (
                    <option key={c.url} value={c.url}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                  URL do Moodle
                </label>
                <input
                  type="url"
                  value={campusUrl}
                  onChange={(e) => setCampusUrl(e.target.value)}
                  placeholder="https://ava3.cefor.ifes.edu.br"
                  className="w-full px-3.5 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#10b981] font-mono transition"
                />
              </div>
            </div>

            <div className="flex gap-2 p-1 bg-[#1a1a1a] rounded-xl border border-white/5 w-fit">
              <button
                type="button"
                onClick={() => setAuthMode("credentials")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  authMode === "credentials"
                    ? "bg-[#10b981] text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5" /> Matrícula / CPF e Senha
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("token")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  authMode === "token"
                    ? "bg-[#10b981] text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Key className="w-3.5 h-3.5" /> Token Moodle (WebServices)
              </button>
            </div>

            {authMode === "credentials" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                    Usuário / Matrícula / CPF
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ex: 20241IFES0482 ou seu usuário"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#10b981] transition font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                    Senha do AVA IFES
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha institucional"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#10b981] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
                  Chave Token de Acesso WebService Moodle
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Cole seu token Moodle gerado em Preferências > Chaves de Segurança"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#10b981] font-mono transition"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/5">
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                Conexão criptografada direta com a API do Moodle IFES.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-[#10b981] hover:bg-[#059669] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#10b981]/20 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Autenticando no IFES..." : "Entrar e Sincronizar AVA IFES"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 7: PONTE DE DADOS Q-ACADÊMICO IFES */}
      {avaSubTab === "qacademico" && (
        <div className="space-y-4 animate-fade-in">
          <QAcademicoView
            user={user}
            onUpdateQAcademicoAccount={onUpdateQAcademicoAccount}
            onImportCourses={(newCourses) => {
              if (onImportCourses) {
                onImportCourses(newCourses);
              }
              setCourses(loadSyncedCourses());
            }}
          />
        </div>
      )}

      {/* Submission Modal */}
      <AvaSubmissionModal
        isOpen={!!submissionModalAssignment}
        onClose={() => setSubmissionModalAssignment(null)}
        assignment={submissionModalAssignment}
        user={user}
        onSuccess={(updated) => {
          setAssignments((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a))
          );
        }}
      />

      {/* Modal: Gerenciar / Filtrar Matérias Exatas do Perfil IFES */}
      <IfesProfileCoursesManager
        isOpen={showCoursesManager}
        onClose={() => setShowCoursesManager(false)}
        courses={courses}
        onSaveCourses={handleSaveCustomCourses}
        campusName={currentCampusName}
      />
    </div>
  );
};
