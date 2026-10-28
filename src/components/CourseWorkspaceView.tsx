import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Paperclip,
  Trash2,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Search,
  Check,
  ChevronRight,
  ChevronDown,
  Shield,
  Send,
  HelpCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAccessibility } from "../lib/accessibility";
import { CourseTrack, IfesCourse, IfesAssignment, UserProfile, TrackModule } from "../types";
import {
  loadSubmissions,
  saveSubmission,
  removeSubmission,
  ActivitySubmission,
} from "../utils/assignmentSubmissions";
import { getCourseParticipants, CourseMember } from "../utils/courseParticipants";
import { loadSyncedAssignments } from "../utils/courseSync";
import { avaApiClient, AvaSection } from "../utils/avaApi";
import FileQuizGeneratorModal from "./quiz/FileQuizGeneratorModal";

interface CourseWorkspaceViewProps {
  course: CourseTrack | IfesCourse;
  user: UserProfile;
  modules?: TrackModule[];
  onBack: () => void;
  onRewardXp: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
  onOpenLesson?: (module: TrackModule) => void;
  onOpenPrivateChatWithMember?: (member: CourseMember) => void;
}

export const CourseWorkspaceView: React.FC<CourseWorkspaceViewProps> = ({
  course,
  user,
  modules = [],
  onBack,
  onRewardXp,
  onRewardCoins,
  onOpenLesson,
  onOpenPrivateChatWithMember,
}) => {
  const [activeTab, setActiveTab] = useState<
    "contents" | "assignments" | "forums" | "quizzes" | "participants" | "modules" | "grades"
  >("contents");

  // Course sections & modules from AVA Moodle
  const [courseSections, setCourseSections] = useState<AvaSection[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

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
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Forums state (Responder e navegar em fóruns do AVA IFES)
  const [forumDiscussions, setForumDiscussions] = useState<any[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<any | null>(null);
  const [forumReplyText, setForumReplyText] = useState("");
  const [isReplyingForum, setIsReplyingForum] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicMessage, setNewTopicMessage] = useState("");

  // Quizzes state (Responder questionários do AVA IFES)
  const [courseQuizzes, setCourseQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [showFileQuizModal, setShowFileQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Participants
  const [participants, setParticipants] = useState<CourseMember[]>([]);
  const [searchParticipant, setSearchParticipant] = useState("");

  const { isReducedMotion } = useAccessibility();
  const sectionStorageKey = `brain_studio_course_sections_${course.id}`;
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(sectionStorageKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { "sec-0": true }; // Padrão: primeiro tópico aberto
  });

  const handleToggleSection = (secKey: string) => {
    setExpandedSectionIds((prev) => {
      const next = { ...prev, [secKey]: !prev[secKey] };
      try {
        localStorage.setItem(sectionStorageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleExpandAllSections = () => {
    const next: Record<string, boolean> = {};
    courseSections.forEach((s, idx) => {
      const k = String(s.id ?? `sec-${idx}`);
      next[k] = true;
    });
    setExpandedSectionIds(next);
    try {
      localStorage.setItem(sectionStorageKey, JSON.stringify(next));
    } catch {}
  };

  const handleCollapseAllSections = () => {
    setExpandedSectionIds({});
    try {
      localStorage.setItem(sectionStorageKey, JSON.stringify({}));
    } catch {}
  };

  const courseTitle = "title" in course ? course.title : "name" in course ? (course as any).name : "Disciplina";
  const courseCategory = (course as any).category || "Técnico em Administração IFES";
  const courseProfessor = (course as any).professor || "Prof. Dr. Cláudio Valério";
  const courseCampus = (course as any).campus || "IFES - Campus Serra / Cefor";
  const courseCode = (course as any).code || "IFES-2026";
  const courseIcon = (course as any).icon || "📚";

  // Load real course contents and topics from AVA Moodle
  useEffect(() => {
    let isMounted = true;
    setIsLoadingSections(true);
    avaApiClient
      .getCourseContents(
        course.id,
        user.ifesAccount?.campusUrl,
        user.ifesAccount?.token
      )
      .then((secs) => {
        if (isMounted) {
          setCourseSections(secs || []);
          setIsLoadingSections(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoadingSections(false);
      });
    return () => {
      isMounted = false;
    };
  }, [course.id, user.ifesAccount]);

  // Load assignments for this course without fake contextual objects
  useEffect(() => {
    const allAssignments = loadSyncedAssignments();
    const relevant = allAssignments.filter(
      (a) =>
        a.courseId === course.id ||
        (a.courseName && a.courseName.toLowerCase().includes(courseTitle.toLowerCase().slice(0, 10))) ||
        (courseTitle && a.courseName && courseTitle.toLowerCase().includes(a.courseName.toLowerCase().slice(0, 10)))
    );
    setCourseAssignments(relevant);
  }, [course.id, courseTitle]);

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

  // Carrega fóruns e questionários da API do AVA IFES ao alternar de aba
  useEffect(() => {
    if (activeTab === "forums") {
      fetch(`/api/ava/course/${encodeURIComponent(course.id)}/forums`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.discussions)) {
            setForumDiscussions(d.discussions);
            if (d.discussions.length > 0 && !selectedDiscussion) {
              setSelectedDiscussion(d.discussions[0]);
            }
          }
        })
        .catch(() => {});
    } else if (activeTab === "quizzes") {
      fetch(`/api/ava/course/${encodeURIComponent(course.id)}/quizzes`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.quizzes)) {
            setCourseQuizzes(d.quizzes);
          }
        })
        .catch(() => {});
    }
  }, [activeTab, course.id]);

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit) return;
    if (!selectedFile && !submissionText.trim()) {
      setSubmitError("Por favor, anexe um arquivo ou insira um texto online para enviar sua atividade.");
      return;
    }
    if (!academicIntegrityChecked) {
      setSubmitError("Por favor, confirme a declaração de autoria própria do trabalho.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

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
      grade: "Aguardando correção docente",
      feedback: "Trabalho registrado com sucesso na plataforma AVA IFES.",
    };

    try {
      await fetch("/api/ava/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubmission),
      });
    } catch {}

    saveSubmission(newSubmission);
    setIsSubmitting(false);
    setSelectedAssignmentForSubmit(null);
    setSubmissionText("");
    setSelectedFile(null);
    setAcademicIntegrityChecked(false);

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
  };

  const handleRemoveSubmission = (assignmentId: string) => {
    removeSubmission(assignmentId);
    setSelectedAssignmentForSubmit(null);
  };

  // Enviar resposta no fórum
  const handleReplyForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscussion || !forumReplyText.trim()) return;
    setIsReplyingForum(true);
    try {
      const res = await fetch(`/api/ava/course/${encodeURIComponent(course.id)}/forums/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discussionId: selectedDiscussion.id,
          message: forumReplyText.trim(),
          authorName: user.name || "Você (Aluno IFES)",
        }),
      });
      const data = await res.json();
      if (data.success && data.post) {
        setSelectedDiscussion((prev: any) => ({
          ...prev,
          posts: [...(prev?.posts || []), data.post],
          repliesCount: (prev?.repliesCount || 0) + 1,
        }));
        setForumDiscussions((prev) =>
          prev.map((d) =>
            d.id === selectedDiscussion.id
              ? { ...d, repliesCount: (d.repliesCount || 0) + 1, posts: [...(d.posts || []), data.post] }
              : d
          )
        );
        setForumReplyText("");
        onRewardXp(30);
        if (onRewardCoins) onRewardCoins(5);
        try {
          confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
        } catch {}
      }
    } catch (err) {
      console.warn("Erro ao responder fórum:", err);
    } finally {
      setIsReplyingForum(false);
    }
  };

  // Criar novo tópico no fórum
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicMessage.trim()) return;
    setIsReplyingForum(true);
    try {
      const res = await fetch(`/api/ava/course/${encodeURIComponent(course.id)}/forums/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTopicTitle.trim(),
          message: newTopicMessage.trim(),
          authorName: user.name || "Você (Aluno IFES)",
        }),
      });
      const data = await res.json();
      if (data.success && data.discussion) {
        setForumDiscussions((prev) => [data.discussion, ...prev]);
        setSelectedDiscussion(data.discussion);
        setIsCreatingTopic(false);
        setNewTopicTitle("");
        setNewTopicMessage("");
        onRewardXp(40);
        if (onRewardCoins) onRewardCoins(10);
        try {
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
        } catch {}
      }
    } catch (err) {
      console.warn("Erro ao criar tópico no fórum:", err);
    } finally {
      setIsReplyingForum(false);
    }
  };

  // Responder questionário
  const handleStartQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleSelectQuizAnswer = (questionId: string, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuizAttempt = async () => {
    if (!activeQuiz) return;
    setIsSubmittingQuiz(true);
    try {
      const answersList = activeQuiz.questions.map((q: any) => ({
        questionId: q.id,
        selectedOptionIndex: quizAnswers[q.id] ?? -1,
      }));

      const res = await fetch(`/api/ava/course/${encodeURIComponent(course.id)}/quizzes/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          studentId: user.email || user.name || "aluno-ifes",
          studentName: user.name || "Estudante IFES",
          answers: answersList,
        }),
      });
      const data = await res.json();
      if (data.success && data.attempt) {
        setQuizResult(data.attempt);
        onRewardXp(60);
        if (onRewardCoins) onRewardCoins(20);
        try {
          confetti({ particleCount: 65, spread: 75, origin: { y: 0.6 } });
        } catch {}
      }
    } catch (err) {
      console.warn("Erro ao submeter questionário:", err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchParticipant.toLowerCase()) ||
      (p.matricula || "").toLowerCase().includes(searchParticipant.toLowerCase()) ||
      p.role.toLowerCase().includes(searchParticipant.toLowerCase())
  );

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
            {(course as any).moodleId ? (
              <a
                href={`${user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br"}/course/view.php?id=${(course as any).moodleId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir no AVA Oficial</span>
              </a>
            ) : null}
          </div>
        </div>

        {/* Navigation Tabs (Estilo AVA IFES Moodle) */}
        <div className="flex items-center gap-1 border-t border-[var(--app-border)] pt-4 mt-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("contents")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "contents"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Conteúdo e Tópicos ({courseSections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "assignments"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Atividades e Envios ({courseAssignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("forums")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "forums"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Fóruns da Disciplina ({forumDiscussions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === "quizzes"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Questionários ({courseQuizzes.length})</span>
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
        </div>
      </div>

      {/* TAB 0: CONTEÚDO E TÓPICOS DO AVA MOODLE */}
      {activeTab === "contents" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-base font-bold text-[var(--app-text)]">
                Conteúdo & Tópicos da Disciplina (AVA Moodle)
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Navegue pelas semanas, materiais de aula, apostilas, tarefas e comunicados oficiais.
              </p>
            </div>
            {(course as any).moodleId && (
              <a
                href={`${user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br"}/course/view.php?id=${(course as any).moodleId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Sala no AVA IFES</span>
              </a>
            )}
          </div>

          {isLoadingSections ? (
            <div className="p-12 text-center bg-[var(--app-card)] rounded-3xl border border-[var(--app-border)] space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-[var(--app-primary)] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-[var(--app-text)]">
                Carregando tópicos e materiais do AVA IFES Moodle...
              </p>
            </div>
          ) : courseSections.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-[var(--app-card)] rounded-3xl border border-[var(--app-border)] space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-black text-[var(--app-text)]">
                  Nenhum Tópico ou Conteúdo Listado
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Esta disciplina ainda não teve seções publicadas pelo professor ou você pode navegar diretamente no portal Moodle do campus.
                </p>
              </div>
              {(course as any).moodleId && (
                <a
                  href={`${user.ifesAccount?.campusUrl || "https://ava3.cefor.ifes.edu.br"}/course/view.php?id=${(course as any).moodleId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Acessar no Portal AVA IFES</span>
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {courseSections.map((section, sIdx) => (
                <div
                  key={section.id || sIdx}
                  className="rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] overflow-hidden shadow-xs"
                >
                  {/* Cabeçalho da Seção */}
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-[var(--app-bg)] to-transparent border-b border-[var(--app-border)] space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
                        Tópico {sIdx + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-[var(--app-text)]">
                        {section.name}
                      </h3>
                    </div>
                    {section.summary && (
                      <p className="text-xs text-[var(--app-text-muted)] line-clamp-2 pt-0.5">
                        {section.summary}
                      </p>
                    )}
                  </div>

                  {/* Lista de Itens/Módulos da Seção */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    {section.items && section.items.length > 0 ? (
                      section.items.map((item, iIdx) => {
                        const isResource = item.type === "resource";
                        const isAssign = item.type === "assign";
                        const isQuiz = item.type === "quiz";
                        const isForum = item.type === "forum";
                        const isUrl = item.type === "url";

                        return (
                          <div
                            key={item.id || iIdx}
                            className="p-3.5 sm:p-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)]/50 hover:bg-[var(--app-bg)] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white ${
                                  isResource
                                    ? "bg-blue-600"
                                    : isAssign
                                    ? "bg-amber-600"
                                    : isQuiz
                                    ? "bg-purple-600"
                                    : isForum
                                    ? "bg-emerald-600"
                                    : "bg-teal-600"
                                }`}
                              >
                                {isResource && <FileText className="w-4 h-4" />}
                                {isAssign && <Upload className="w-4 h-4" />}
                                {isQuiz && <HelpCircle className="w-4 h-4" />}
                                {isForum && <MessageSquare className="w-4 h-4" />}
                                {isUrl && <ExternalLink className="w-4 h-4" />}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-xs sm:text-sm font-bold text-[var(--app-text)] truncate">
                                    {item.name}
                                  </h4>
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10 text-[var(--app-text-muted)] font-mono">
                                    {isResource ? "Arquivo / PDF" : isAssign ? "Tarefa" : isQuiz ? "Questionário" : isForum ? "Fórum" : "Link"}
                                  </span>
                                </div>
                                {item.description && (
                                  <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              {isAssign && (
                                <button
                                  onClick={() => setActiveTab("assignments")}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Ver Atividade</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isForum && (
                                <button
                                  onClick={() => setActiveTab("forums")}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Ir ao Fórum</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {isQuiz && (
                                <button
                                  onClick={() => setActiveTab("quizzes")}
                                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Responder Quiz</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-[var(--app-primary)]/10 hover:bg-[var(--app-primary)]/20 text-[var(--app-primary)] border border-[var(--app-primary)]/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Abrir</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-[var(--app-text-muted)] italic py-2">
                        Nenhum material cadastrado neste tópico ainda.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

      {/* TAB: FÓRUNS DE DISCUSSÃO (INTERATIVO COM API DO AVA IFES) */}
      {activeTab === "forums" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-base font-bold text-[var(--app-text)]">
                Fóruns de Dúvidas e Discussões da Disciplina
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Interaja com o professor e colegas, tire dúvidas ou inicie tópicos temáticos no AVA IFES.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingTopic(!isCreatingTopic)}
              className="px-4 py-2 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-center"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isCreatingTopic ? "Cancelar Tópico" : "+ Novo Tópico no Fórum"}</span>
            </button>
          </div>

          {/* Form to create new discussion topic */}
          {isCreatingTopic && (
            <form onSubmit={handleCreateTopic} className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] space-y-3">
              <h3 className="text-sm font-bold text-[var(--app-text)]">Criar Novo Tópico de Discussão</h3>
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Título do tópico (ex: Dúvida no Exercício 2 da Unidade 1)"
                required
                className="w-full p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
              />
              <textarea
                value={newTopicMessage}
                onChange={(e) => setNewTopicMessage(e.target.value)}
                placeholder="Escreva sua pergunta ou contribuição para a turma e docente..."
                rows={3}
                required
                className="w-full p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTopic(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--app-text-muted)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isReplyingForum}
                  className="px-4 py-2 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isReplyingForum ? "Publicando..." : "Publicar no Fórum"}</span>
                </button>
              </div>
            </form>
          )}

          {/* List of Forum Topics */}
          {forumDiscussions.length === 0 ? (
            <div className="p-8 text-center bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
              Nenhum tópico encontrado no fórum desta disciplina. Seja o primeiro a criar um tópico acima!
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Topics column */}
              <div className="space-y-2 lg:col-span-1">
                {forumDiscussions.map((disc) => (
                  <div
                    key={disc.id}
                    onClick={() => setSelectedDiscussion(disc)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 shadow-xs ${
                      selectedDiscussion?.id === disc.id
                        ? "border-[var(--app-primary)] bg-[var(--app-card)] ring-1 ring-[var(--app-primary)]"
                        : "border-[var(--app-border)] bg-[var(--app-card)] hover:border-[var(--app-primary)]/40"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[var(--app-text)] line-clamp-2">
                        {disc.title}
                      </h4>
                      <span className="text-[10px] text-[var(--app-text-muted)] block mt-1">
                        Por {disc.authorName} • {disc.createdTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--app-primary)] font-semibold pt-1 border-t border-[var(--app-border)]">
                      <span>{disc.repliesCount || 0} respostas</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Discussion Thread & Reply Box */}
              <div className="lg:col-span-2 space-y-4">
                {selectedDiscussion ? (
                  <div className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] space-y-4 shadow-xs">
                    <div className="border-b border-[var(--app-border)] pb-3">
                      <h3 className="text-base font-black text-[var(--app-text)]">
                        {selectedDiscussion.title}
                      </h3>
                      <p className="text-xs text-[var(--app-text-muted)]">
                        Iniciado por <strong className="text-[var(--app-text)]">{selectedDiscussion.authorName}</strong> • {selectedDiscussion.createdTime}
                      </p>
                    </div>

                    {/* Posts in this discussion */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {(selectedDiscussion.posts || []).map((post: any) => (
                        <div
                          key={post.id}
                          className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                            post.isInstructor
                              ? "bg-emerald-500/10 border-emerald-500/25 text-[var(--app-text)]"
                              : "bg-[var(--app-bg)] border-[var(--app-border)] text-[var(--app-text)]"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold flex items-center gap-1.5">
                              {post.authorName}
                              {post.isInstructor && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                  DOCENTE
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-[var(--app-text-muted)]">{post.createdTime}</span>
                          </div>
                          <p className="text-xs leading-relaxed text-[var(--app-text)] whitespace-pre-wrap">
                            {post.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Reply Input Form */}
                    <form onSubmit={handleReplyForum} className="pt-2 border-t border-[var(--app-border)] space-y-2">
                      <label className="text-xs font-bold text-[var(--app-text)] block">
                        Responder neste Fórum:
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          value={forumReplyText}
                          onChange={(e) => setForumReplyText(e.target.value)}
                          placeholder="Digite sua resposta no fórum do AVA IFES..."
                          rows={2}
                          required
                          className="flex-1 p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] resize-none"
                        />
                        <button
                          type="submit"
                          disabled={isReplyingForum || !forumReplyText.trim()}
                          className="px-4 rounded-2xl bg-[var(--app-primary)] hover:opacity-90 text-white font-bold text-xs transition flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-40 shrink-0"
                        >
                          <Send className="w-4 h-4" />
                          <span>Enviar</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
                    Selecione um tópico de discussão ao lado para visualizar e responder.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: QUESTIONÁRIOS AVALIATIVOS (RESPONDER E SUBMETER TENTATIVA) */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-base font-bold text-[var(--app-text)]">
                Questionários Avaliativos (Quizzes AVA IFES)
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Responda às questões online, envie suas tentativas e receba correção pedagógica automática.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowFileQuizModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-xs hover:opacity-95 transition cursor-pointer self-start sm:self-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gerar quiz de um arquivo</span>
            </button>
          </div>

          {activeQuiz ? (
            /* Quiz Active Runner */
            <div className="p-5 sm:p-7 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--app-border)] pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-primary)] font-mono">
                    Tentativa Oficial do AVA IFES
                  </span>
                  <h3 className="text-lg font-black text-[var(--app-text)]">{activeQuiz.title}</h3>
                  <p className="text-xs text-[var(--app-text-muted)]">{activeQuiz.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuiz(null);
                    setQuizResult(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer self-start sm:self-center"
                >
                  Voltar à Lista
                </button>
              </div>

              {quizResult ? (
                /* Results Card */
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <div>
                      <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        Questionário Enviado com Sucesso!
                      </h4>
                      <p className="text-xs text-[var(--app-text)] font-mono">
                        Nota Obtida: <strong className="text-lg font-black">{quizResult.score.toFixed(1)}</strong> / {activeQuiz.maxGrade.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text)]">
                      Gabarito e Justificativas:
                    </h5>
                    {quizResult.evaluatedAnswers.map((ans: any, idx: number) => {
                      const q = activeQuiz.questions[idx];
                      return (
                        <div
                          key={ans.questionId}
                          className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                            ans.isCorrect
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                              : "bg-rose-500/10 border-rose-500/25 text-rose-800 dark:text-rose-200"
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>Questão {idx + 1}: {ans.isCorrect ? "✅ Correta" : "❌ Incorreta"}</span>
                          </div>
                          <p className="text-xs text-[var(--app-text)]">{q?.text}</p>
                          <p className="text-[11px] opacity-90 italic">
                            {ans.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setActiveQuiz(null);
                      setQuizResult(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Concluir e Voltar
                  </button>
                </div>
              ) : (
                /* Questions Form */
                <div className="space-y-6">
                  {activeQuiz.questions.map((quest: any, qIdx: number) => (
                    <div key={quest.id} className="p-4 sm:p-5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-[var(--app-primary)]">
                          Questão {qIdx + 1} de {activeQuiz.questions.length}
                        </span>
                        {quizAnswers[quest.id] !== undefined && (
                          <span className="text-[10px] font-bold text-emerald-500">Respondida</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[var(--app-text)] leading-relaxed">
                        {quest.text}
                      </p>
                      <div className="space-y-2 pt-1">
                        {quest.options.map((opt: string, oIdx: number) => {
                          const isSelected = quizAnswers[quest.id] === oIdx;
                          return (
                            <label
                              key={oIdx}
                              onClick={() => handleSelectQuizAnswer(quest.id, oIdx)}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                                isSelected
                                  ? "bg-[var(--app-primary)]/15 border-[var(--app-primary)] text-[var(--app-text)] font-semibold"
                                  : "bg-[var(--app-card)] border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${quest.id}`}
                                checked={isSelected}
                                onChange={() => handleSelectQuizAnswer(quest.id, oIdx)}
                                className="mt-0.5 accent-[var(--app-primary)] cursor-pointer"
                              />
                              <span className="flex-1 leading-relaxed">{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[var(--app-text-muted)] font-mono">
                      {Object.keys(quizAnswers).length} de {activeQuiz.questions.length} questões respondidas
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmitQuizAttempt}
                      disabled={isSubmittingQuiz || Object.keys(quizAnswers).length < activeQuiz.questions.length}
                      className="px-6 py-2.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
                    >
                      {isSubmittingQuiz ? (
                        <span>Enviando Respostas...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submeter Tentativa no AVA IFES</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Quizzes List */
            <div className="space-y-3">
              {courseQuizzes.length === 0 ? (
                <div className="p-8 text-center bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
                  Nenhum questionário pendente cadastrado para esta disciplina no momento.
                </div>
              ) : (
                courseQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-5 sm:p-6 rounded-3xl border border-[var(--app-border)] bg-[var(--app-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          QUESTIONÁRIO AVALIATIVO
                        </span>
                        <span className="text-xs font-mono text-[var(--app-text-muted)]">
                          Nota Máxima: {quiz.maxGrade || 10} pts • {quiz.questions?.length || 0} questões
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[var(--app-text)]">{quiz.title}</h4>
                      <p className="text-xs text-[var(--app-text-muted)]">{quiz.description}</p>
                    </div>

                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-5 py-2.5 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer shadow-xs active:scale-95"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Responder Questionário</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
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
                Docente e colegas matriculados nesta disciplina. Envie mensagens privadas no chat para tirar dúvidas e colaborar.
              </p>
            </div>

            <div className="flex items-center gap-2">
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
              const isCurrentUser = member.name.includes("(Você)");

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl border transition flex flex-col justify-between gap-3 bg-[var(--app-card)] shadow-xs border-[var(--app-border)] hover:border-[var(--app-primary)]/40"
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
                      </div>
                      <span className="text-[10px] font-semibold text-[var(--app-primary)] block">
                        {member.role} • {member.matricula}
                      </span>
                      <span className="text-[10px] text-[var(--app-text-muted)] block truncate">
                        {member.lastAccess}
                      </span>
                    </div>
                  </div>

                  {!isCurrentUser && onOpenPrivateChatWithMember && (
                    <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--app-border)]">
                      <button
                        onClick={() => onOpenPrivateChatWithMember(member)}
                        className="w-full py-1.5 px-3 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        title="Enviar mensagem privada no estilo WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Conversar no Chat</span>
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

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
                <span>{submitError}</span>
                <button type="button" onClick={() => setSubmitError(null)} className="cursor-pointer">✕</button>
              </div>
            )}

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

      {/* Modal Gerar Quiz a partir de Arquivo (Seção 10) */}
      <FileQuizGeneratorModal
        user={user}
        isOpen={showFileQuizModal}
        onClose={() => setShowFileQuizModal(false)}
        onQuizGenerated={(quizData) => {
          if (quizData.questions && quizData.questions.length > 0) {
            setActiveQuiz({
              id: `custom-file-quiz-${Date.now()}`,
              title: quizData.title,
              description: "Quiz gerado a partir de arquivo acadêmico.",
              maxGrade: 10,
              questions: quizData.questions.map((q, idx) => ({
                id: q.id || `q-${idx}`,
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex,
                explanation: q.explanation,
              })),
            });
            setShowFileQuizModal(false);
          }
        }}
      />
    </div>
  );
};
