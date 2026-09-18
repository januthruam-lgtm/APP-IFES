import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Users,
  Award,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Video,
  Phone,
  Paperclip,
  Trash2,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Search,
  Check,
  ChevronRight,
  Shield,
  Send,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CourseTrack, IfesCourse, IfesAssignment, UserProfile, TrackModule } from "../types";
import {
  loadSubmissions,
  saveSubmission,
  removeSubmission,
  ActivitySubmission,
} from "../utils/assignmentSubmissions";
import { getCourseParticipants, CourseMember } from "../utils/courseParticipants";
import { DEFAULT_IFES_ASSIGNMENTS, loadSyncedAssignments } from "../utils/courseSync";

interface CourseWorkspaceViewProps {
  course: CourseTrack | IfesCourse;
  user: UserProfile;
  modules?: TrackModule[];
  onBack: () => void;
  onRewardXp: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
  onStartCallWithMember?: (member: CourseMember, isVideo: boolean) => void;
  onStartGroupCallWithCourse?: (course: CourseTrack | IfesCourse, members: CourseMember[]) => void;
  onOpenLesson?: (module: TrackModule) => void;
}

export const CourseWorkspaceView: React.FC<CourseWorkspaceViewProps> = ({
  course,
  user,
  modules = [],
  onBack,
  onRewardXp,
  onRewardCoins,
  onStartCallWithMember,
  onStartGroupCallWithCourse,
  onOpenLesson,
}) => {
  const [activeTab, setActiveTab] = useState<"assignments" | "participants" | "modules" | "grades">("assignments");

  // Submissions state
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>(() => loadSubmissions());

  // Assignments for this specific course
  const [courseAssignments, setCourseAssignments] = useState<IfesAssignment[]>([]);

  // Selected assignment for submission modal
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<IfesAssignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string; dataUrl?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicIntegrityChecked, setAcademicIntegrityChecked] = useState(false);

  // Participants
  const [participants, setParticipants] = useState<CourseMember[]>([]);
  const [searchParticipant, setSearchParticipant] = useState("");
  const [selectedForGroupCall, setSelectedForGroupCall] = useState<string[]>([]);

  const courseTitle = "title" in course ? course.title : "name" in course ? (course as any).name : "Disciplina";
  const courseCategory = (course as any).category || "Técnico em Administração IFES";
  const courseProfessor = (course as any).professor || "Prof. Dr. Cláudio Valério";
  const courseCampus = (course as any).campus || "IFES - Campus Serra / Cefor";
  const courseCode = (course as any).code || "IFES-2026";
  const courseIcon = (course as any).icon || "📚";

  // Load assignments for this course
  useEffect(() => {
    const allAssignments = [...DEFAULT_IFES_ASSIGNMENTS, ...loadSyncedAssignments()];
    // Deduplicate by id
    const uniqueAssignmentsMap = new Map<string, IfesAssignment>();
    allAssignments.forEach((a) => {
      uniqueAssignmentsMap.set(a.id, a);
    });

    const relevant = Array.from(uniqueAssignmentsMap.values()).filter(
      (a) =>
        a.courseId === course.id ||
        a.courseName.toLowerCase().includes(courseTitle.toLowerCase().slice(0, 10)) ||
        courseTitle.toLowerCase().includes(a.courseName.toLowerCase().slice(0, 10))
    );

    // If no specific assignment found for this course, provide 2 default contextual ones
    if (relevant.length === 0) {
      relevant.push(
        {
          id: `assign-${course.id}-1`,
          courseId: course.id,
          courseName: courseTitle,
          title: `Atividade Prática 1: Diagnóstico e Análise em ${courseTitle}`,
          dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
          description: `Elabore um relatório técnico estruturado abordando os princípios fundamentais de ${courseTitle} e suas aplicações em estudos de caso do IFES.`,
          status: "pending",
          weight: "20 pts",
          type: "tarefa",
        },
        {
          id: `assign-${course.id}-2`,
          courseId: course.id,
          courseName: courseTitle,
          title: `Questionário Avaliativo: Conceitos e Resolução de Problemas`,
          dueDate: new Date(Date.now() + 8 * 86400000).toISOString(),
          description: `Avaliação com questões teóricas e práticas sobre os módulos ministrados pelo ${courseProfessor}.`,
          status: "pending",
          weight: "15 pts",
          type: "questionario",
        }
      );
    }

    setCourseAssignments(relevant);
  }, [course.id, courseTitle, courseProfessor]);

  // Load participants for this course
  useEffect(() => {
    Promise.all([
      fetch("/api/online-status").then((r) => r.json()).catch(() => ({ activeUsers: [] })),
      fetch(`/api/ava/participants/${encodeURIComponent(course.id)}`).then((r) => r.json()).catch(() => ({ participants: [] })),
    ])
      .then(([statusData, avaData]) => {
        const activeUsers = statusData.activeUsers || [];
        const avaParticipants = avaData.participants || [];

        const combinedMap = new Map<string, any>();
        activeUsers.forEach((u: any) => {
          if (u.name) combinedMap.set(u.name.toLowerCase(), u);
        });
        avaParticipants.forEach((p: any) => {
          if (p.name && !combinedMap.has(p.name.toLowerCase())) {
            combinedMap.set(p.name.toLowerCase(), p);
          }
        });

        const mergedList = Array.from(combinedMap.values());
        const parts = getCourseParticipants(course, user, mergedList);
        setParticipants(parts);
      })
      .catch(() => {
        const parts = getCourseParticipants(course, user, []);
        setParticipants(parts);
      });
  }, [course, user]);

  // Listen to submission updates
  useEffect(() => {
    const handleUpdate = () => {
      setSubmissions(loadSubmissions());
    };
    window.addEventListener("brainstudio:submissions-updated", handleUpdate);
    return () => window.removeEventListener("brainstudio:submissions-updated", handleUpdate);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: sizeFormatted,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleOpenSubmissionModal = (assignment: IfesAssignment) => {
    setSelectedAssignmentForSubmit(assignment);
    const existing = submissions.find((s) => s.assignmentId === assignment.id);
    if (existing) {
      setSubmissionText(existing.textContent || "");
      if (existing.fileName) {
        setSelectedFile({
          name: existing.fileName,
          size: existing.fileSize || "1.2 MB",
        });
      } else {
        setSelectedFile(null);
      }
      setAcademicIntegrityChecked(true);
    } else {
      setSubmissionText("");
      setSelectedFile(null);
      setAcademicIntegrityChecked(false);
    }
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit) return;
    if (!selectedFile && !submissionText.trim()) {
      alert("Por favor, anexe um arquivo ou insira um texto online para enviar sua atividade.");
      return;
    }
    if (!academicIntegrityChecked) {
      alert("Por favor, confirme a declaração de autoria própria do trabalho.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newSubmission: ActivitySubmission = {
        id: `sub-${Date.now()}`,
        assignmentId: selectedAssignmentForSubmit.id,
        courseId: course.id,
        courseName: courseTitle,
        studentEmail: user.email,
        studentName: user.name,
        studentMatricula: user.ifesAccount?.matricula || user.ifesAccount?.username || "IFES-Estudante",
        submittedAt: new Date().toISOString(),
        status: "submitted",
        textContent: submissionText.trim() || undefined,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
        fileData: selectedFile?.dataUrl,
        grade: "Aguardando correção do professor",
        feedback: "Trabalho recebido com sucesso no sistema acadêmico.",
      };

      saveSubmission(newSubmission);
      setIsSubmitting(false);
      setSelectedAssignmentForSubmit(null);

      // Reward student
      onRewardXp(50);
      if (onRewardCoins) onRewardCoins(10);

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }, 600);
  };

  const handleRemoveSubmission = (assignmentId: string) => {
    if (confirm("Tem certeza que deseja remover este envio? Você poderá reenviar antes do encerramento do prazo.")) {
      removeSubmission(assignmentId);
      setSelectedAssignmentForSubmit(null);
    }
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchParticipant.toLowerCase()) ||
      (p.matricula || "").toLowerCase().includes(searchParticipant.toLowerCase()) ||
      p.role.toLowerCase().includes(searchParticipant.toLowerCase())
  );

  const toggleSelectForGroup = (memberId: string) => {
    setSelectedForGroupCall((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in-50">
      {/* Top Breadcrumb & Back Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-2xl bg-[var(--app-card)] hover:bg-[var(--app-bg)] text-[var(--app-text)] border border-[var(--app-border)] text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Todas as Disciplinas</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ambiente Virtual AVA IFES</span>
          </span>
        </div>
      </div>

      {/* Course Main Header Card */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-center text-3xl shrink-0 shadow-xs">
              {courseIcon}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                  {courseCategory}
                </span>
                <span className="text-xs font-mono text-[var(--app-text-muted)]">
                  Cód: {courseCode}
                </span>
                <span className="text-xs font-mono text-[var(--app-text-muted)]">
                  • {courseCampus}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-text)] tracking-tight">
                {courseTitle}
              </h1>
              <p className="text-xs text-[var(--app-text-muted)] flex items-center gap-2">
                <span>Docente Responsável:</span>
                <strong className="text-[var(--app-text)] font-semibold">{courseProfessor}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {onStartGroupCallWithCourse && (
              <button
                onClick={() => onStartGroupCallWithCourse(course, participants)}
                className="px-4 py-2.5 rounded-xl bg-[#00f0ff] hover:bg-[#00d6e6] text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm active:scale-95 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Chamada da Turma</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Estilo AVA IFES Moodle) */}
        <div className="flex items-center gap-1 border-t border-[var(--app-border)] pt-4 mt-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "assignments"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Atividades e Trabalhos ({courseAssignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("participants")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "participants"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Participantes da Matéria ({participants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("modules")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "modules"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Módulos e Aulas ({modules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("grades")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "grades"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Quadro de Notas</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ATIVIDADES E TRABALHOS (COM ENVIO REAL) */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-base font-bold text-[var(--app-text)]">
                Atividades Avaliativas da Disciplina
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Envie seus trabalhos, acompanhe prazos de entrega e consulte feedbacks do professor.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--app-text-muted)]">
              <span>
                {submissions.filter((s) => s.courseId === course.id).length} de{" "}
                {courseAssignments.length} atividades enviadas
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {courseAssignments.map((assignment) => {
              const submission = submissions.find((s) => s.assignmentId === assignment.id);
              const isSubmitted = !!submission;
              const isUrgent =
                !isSubmitted &&
                new Date(assignment.dueDate).getTime() - Date.now() < 3 * 86400000;

              return (
                <div
                  key={assignment.id}
                  className={`p-5 sm:p-6 rounded-3xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--app-card)] shadow-xs ${
                    isSubmitted
                      ? "border-emerald-500/30 ring-1 ring-emerald-500/20"
                      : isUrgent
                      ? "border-amber-500/40"
                      : "border-[var(--app-border)]"
                  }`}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)]">
                        {assignment.type.toUpperCase()}
                      </span>
                      {assignment.weight && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] font-mono">
                          Peso: {assignment.weight}
                        </span>
                      )}

                      {isSubmitted ? (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Enviado para Avaliação</span>
                        </span>
                      ) : isUrgent ? (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Prazo Próximo</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          Pendente de Envio
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[var(--app-text)]">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-[var(--app-text-muted)] leading-relaxed max-w-3xl">
                      {assignment.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-mono text-[var(--app-text-muted)] pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                        <span>
                          Data limite:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>

                      {submission && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>
                            Enviado em:{" "}
                            {new Date(submission.submittedAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {submission.fileName && (
                            <span className="font-normal text-[var(--app-text)] underline ml-1">
                              ({submission.fileName})
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Feedback if available */}
                    {submission && submission.feedback && (
                      <div className="p-3 bg-[var(--app-bg)] rounded-2xl border border-[var(--app-border)] text-xs space-y-1 mt-2">
                        <div className="flex items-center justify-between font-bold text-[var(--app-text)]">
                          <span>Status da Avaliação:</span>
                          <span className="text-emerald-600 font-mono">{submission.grade}</span>
                        </div>
                        <p className="text-[var(--app-text-muted)] text-[11px]">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center pt-2 md:pt-0">
                    <button
                      onClick={() => handleOpenSubmissionModal(assignment)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                        isSubmitted
                          ? "bg-[var(--app-bg)] hover:bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)]"
                          : "bg-[var(--app-primary)] hover:opacity-90 text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isSubmitted ? "Editar Envio" : "Enviar Atividade"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PARTICIPANTES DA MATÉRIA (QUEM PARTICIPA DO CURSO) */}
      {activeTab === "participants" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-base font-bold text-[var(--app-text)]">
                Integrantes da Turma ({participants.length})
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Docente e colegas matriculados nesta disciplina. Faça chamadas de áudio, vídeo ou reúna a turma em chamada coletiva.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedForGroupCall.length > 0 && onStartCallWithMember && (
                <button
                  onClick={() => {
                    const firstSelected = participants.find((p) => p.id === selectedForGroupCall[0]);
                    if (firstSelected) onStartCallWithMember(firstSelected, true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#00f0ff] hover:bg-[#00d6e6] text-black font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Chamada em Grupo ({selectedForGroupCall.length} selecionados)</span>
                </button>
              )}

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
                <input
                  type="text"
                  value={searchParticipant}
                  onChange={(e) => setSearchParticipant(e.target.value)}
                  placeholder="Buscar por nome ou matrícula..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] w-48 sm:w-60"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredParticipants.map((member) => {
              const isSelected = selectedForGroupCall.includes(member.id);
              const isCurrentUser = member.name.includes("(Você)");

              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 bg-[var(--app-card)] shadow-xs ${
                    isSelected
                      ? "border-[var(--app-primary)] ring-1 ring-[var(--app-primary)]"
                      : "border-[var(--app-border)] hover:border-[var(--app-primary)]/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${member.avatarColor} flex items-center justify-center font-black text-sm text-white shadow-xs shrink-0 relative`}
                    >
                      {member.initials}
                      {member.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--app-card)]" />
                      )}
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-[var(--app-text)] truncate">
                          {member.name}
                        </h4>
                        {!isCurrentUser && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectForGroup(member.id)}
                            title="Selecionar para chamada em grupo"
                            className="cursor-pointer rounded accent-[var(--app-primary)] w-3.5 h-3.5 shrink-0"
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-[var(--app-primary)] block">
                        {member.role} • {member.matricula}
                      </span>
                      <span className="text-[10px] text-[var(--app-text-muted)] block truncate">
                        {member.lastAccess}
                      </span>
                    </div>
                  </div>

                  {!isCurrentUser && onStartCallWithMember && (
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--app-border)]">
                      <button
                        onClick={() => onStartCallWithMember(member, false)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Fazer chamada de voz"
                      >
                        <Phone className="w-3 h-3 text-emerald-500" />
                        <span>Áudio</span>
                      </button>

                      <button
                        onClick={() => onStartCallWithMember(member, true)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-[var(--app-primary)]/10 hover:bg-[var(--app-primary)]/20 text-[var(--app-primary)] border border-[var(--app-primary)]/30 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Fazer chamada de vídeo no estilo WhatsApp"
                      >
                        <Video className="w-3 h-3" />
                        <span>Vídeo</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MÓDULOS E AULAS */}
      {activeTab === "modules" && (
        <div className="space-y-4">
          <div className="px-1">
            <h2 className="text-base font-bold text-[var(--app-text)]">
              Módulos e Aulas da Disciplina
            </h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              Conteúdos programáticos e lições com tutor socrático interativo.
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="p-8 text-center bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
              Nenhum módulo cadastrado para esta disciplina.
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((mod, index) => (
                <div
                  key={mod.id}
                  className="p-5 rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
                        Módulo {index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--app-text)]">{mod.title}</h4>
                    </div>
                    <p className="text-xs text-[var(--app-text-muted)]">{mod.subtitle}</p>
                  </div>

                  {onOpenLesson && (
                    <button
                      onClick={() => onOpenLesson(mod)}
                      className="px-4 py-2 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer"
                    >
                      <span>Estudar Aula</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: QUADRO DE NOTAS */}
      {activeTab === "grades" && (
        <div className="space-y-4">
          <div className="px-1">
            <h2 className="text-base font-bold text-[var(--app-text)]">
              Relatório de Notas da Disciplina
            </h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              Acompanhamento de conceitos e notas atribuídas pelo docente às atividades entregues.
            </p>
          </div>

          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--app-bg)] border-b border-[var(--app-border)] text-[var(--app-text-muted)] font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Item Avaliativo</th>
                  <th className="p-3.5">Peso</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Nota</th>
                  <th className="p-3.5">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {courseAssignments.map((a) => {
                  const sub = submissions.find((s) => s.assignmentId === a.id);
                  return (
                    <tr key={a.id} className="hover:bg-[var(--app-bg)]/50 transition">
                      <td className="p-3.5 font-bold text-[var(--app-text)]">{a.title}</td>
                      <td className="p-3.5 font-mono text-[var(--app-text-muted)]">{a.weight || "10 pts"}</td>
                      <td className="p-3.5">
                        {sub ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600">
                            Entregue
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700">
                            Não entregue
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[var(--app-primary)]">
                        {sub?.grade || "-"}
                      </td>
                      <td className="p-3.5 text-[var(--app-text-muted)] text-[11px]">
                        {sub?.feedback || "Aguardando envio pelo estudante."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE ENVIO DA ATIVIDADE (IGUAL NO AVA IFES) */}
      {selectedAssignmentForSubmit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                  {courseTitle}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[var(--app-text)]">
                  Enviar Atividade Avaliativa
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  {selectedAssignmentForSubmit.title}
                </p>
              </div>

              <button
                onClick={() => setSelectedAssignmentForSubmit(null)}
                className="p-1.5 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              {/* File Attachment Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>Envio de Arquivo (PDF, DOCX, ZIP, Imagens)</span>
                </label>

                <div className="border-2 border-dashed border-[var(--app-border)] hover:border-[var(--app-primary)] rounded-2xl p-4 text-center bg-[var(--app-bg)] transition relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    accept=".pdf,.docx,.doc,.txt,.zip,.png,.jpg,.jpeg"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <Upload className="w-6 h-6 text-[var(--app-primary)]" />
                    {selectedFile ? (
                      <div>
                        <p className="text-xs font-bold text-[var(--app-text)]">
                          {selectedFile.name}
                        </p>
                        <span className="text-[10px] font-mono text-emerald-600 font-semibold">
                          Tamanho: {selectedFile.size} • Pronto para envio
                        </span>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-[var(--app-text)]">
                          Clique ou arraste seu arquivo aqui
                        </p>
                        <span className="text-[10px] text-[var(--app-text-muted)]">
                          Formatos aceitos: PDF, DOCX, ZIP, imagens (até 50 MB)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remover arquivo selecionado</span>
                  </button>
                )}
              </div>

              {/* Online Text Submission */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                  <span>Texto Online / Resposta / Links de Entrega (Opcional)</span>
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Insira sua resposta textual, justificativa ou links de compartilhamento (ex: Google Drive, GitHub)..."
                  rows={4}
                  className="w-full p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] resize-none"
                />
              </div>

              {/* Academic Integrity Check */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={academicIntegrityChecked}
                  onChange={(e) => setAcademicIntegrityChecked(e.target.checked)}
                  className="mt-0.5 accent-[var(--app-primary)]"
                />
                <span className="leading-snug">
                  Declaro que este trabalho é de minha autoria e cumpre as normas acadêmicas e éticas do Instituto Federal do Espírito Santo (IFES).
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                {submissions.some((s) => s.assignmentId === selectedAssignmentForSubmit.id) ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveSubmission(selectedAssignmentForSubmit.id)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
                  >
                    Remover Envio
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssignmentForSubmit(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Enviando...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Confirmar e Enviar Atividade</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
