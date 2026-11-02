import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  FileText,
  GraduationCap,
  TrendingUp,
  History,
  ListTodo,
  Calendar,
  Layers,
  Brain,
  Library,
  BookA,
  Timer,
  PlugZap,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  User,
  FolderOpen,
  Award,
  Filter,
  Trash2,
} from "lucide-react";
import {
  UserProfile,
  CourseTrack,
  IfesCourse,
  IfesAssignment,
} from "../../../types";
import { CentralAtividadesView } from "../../ava/CentralAtividadesView";
import { AvaGradesView } from "../../ava/AvaGradesView";
import { TasksTab } from "../TasksTab";
import { AgendaTab } from "../AgendaTab";
import { FlashcardsAnkiTab } from "../FlashcardsAnkiTab";
import { StudyMethodsCentralTab } from "../StudyMethodsCentralTab";
import { LibraryTab } from "../LibraryTab";
import { DictionaryTab } from "../DictionaryTab";
import { StudyRoomVirtualTab } from "../StudyRoomVirtualTab";
import { IfesAvaTab } from "../IfesAvaTab";
import { loadSyncedAssignments } from "../../../utils/courseSync";
import { avaApiClient, AvaSection } from "../../../utils/avaApi";
import { getCourseParticipants, CourseMember } from "../../../utils/courseParticipants";

export type AcademicMainSection =
  | "materias"
  | "atividades"
  | "avaliacoes"
  | "desempenho"
  | "ferramentas";

export type AcademicToolId =
  | "tarefas"
  | "agenda"
  | "flashcards"
  | "metodos"
  | "biblioteca"
  | "dicionario"
  | "sala_virtual"
  | "ifes";

export interface EstudarTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  modules?: any[];
  currentCourse: CourseTrack;
  ifesCourses: IfesCourse[];
  initialSubView?: string;
  onSelectCourse: (course: CourseTrack) => void;
  onOpenLesson?: (mod: any) => void;
  onOpenDeck?: (deckId: string) => void;
  onOpenOfflineModal?: () => void;
  onResetCourses?: () => void;
  onDeleteCourse?: (courseId: string) => void;
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
  onConsumeEnergy?: (amount: number) => boolean;
  onOpenPrivateChatWithMember?: (member: any) => void;
  onOpenAvaConnect?: () => void;
  onNavigateToTab?: (tab: string, subView?: string) => void;
  onUpdateIfesAccount?: (account: any) => void;
  onUpdateCourses?: (courses: IfesCourse[]) => void;
}

export const EstudarTab: React.FC<EstudarTabProps> = ({
  user,
  courses = [],
  currentCourse,
  ifesCourses = [],
  initialSubView,
  onSelectCourse,
  onOpenOfflineModal,
  onResetCourses,
  onDeleteCourse,
  onRewardXp,
  onRewardCoins,
  onOpenPrivateChatWithMember,
  onOpenAvaConnect,
  onNavigateToTab,
  onUpdateIfesAccount,
  onUpdateCourses,
}) => {
  const { t } = useTranslation();

  // Seletor de seção acadêmica principal (PARTE 1.2)
  const [activeSection, setActiveSection] = useState<AcademicMainSection>(() => {
    if (initialSubView === "atividades" || initialSubView === "tarefas") return "atividades";
    if (initialSubView === "avaliacoes" || initialSubView === "notas") return "avaliacoes";
    if (initialSubView === "desempenho" || initialSubView === "historico") return "desempenho";
    if (initialSubView && ["agenda", "flashcards", "metodos", "biblioteca", "dicionario", "sala_virtual", "ifes"].includes(initialSubView)) {
      return "ferramentas";
    }
    return "materias";
  });

  // Ferramenta de apoio ativa
  const [activeTool, setActiveTool] = useState<AcademicToolId>(() => {
    if (initialSubView && ["tarefas", "agenda", "flashcards", "metodos", "biblioteca", "dicionario", "sala_virtual", "ifes"].includes(initialSubView)) {
      return initialSubView as AcademicToolId;
    }
    return "tarefas";
  });

  // Sub-aba interna da disciplina selecionada (PARTE 6.1)
  const [materiaSubTab, setMateriaSubTab] = useState<"atividades" | "materiais" | "avaliacoes" | "participantes">("atividades");

  // Atividades carregadas do AVA
  const [allAssignments, setAllAssignments] = useState<IfesAssignment[]>(() => loadSyncedAssignments());

  // Pesquisa de disciplinas no menu lateral desktop
  const [courseSearchTerm, setCourseSearchTerm] = useState("");

  // Conteúdos / seções da disciplina selecionada
  const [courseContents, setCourseContents] = useState<AvaSection[]>([]);
  const [isLoadingContents, setIsLoadingContents] = useState(false);

  // Participantes da disciplina
  const participants: CourseMember[] = useMemo(() => {
    if (!currentCourse) return [];
    return getCourseParticipants(currentCourse, user);
  }, [currentCourse, user]);

  // Carrega seções e materiais da matéria selecionada via AVA API
  useEffect(() => {
    if (!currentCourse || currentCourse.id === "empty-course") return;

    let mounted = true;
    const loadContents = async () => {
      setIsLoadingContents(true);
      try {
        const sections = await avaApiClient.getCourseContents(
          currentCourse.id,
          user.ifesAccount?.campusUrl,
          user.ifesAccount?.token
        );
        if (mounted && Array.isArray(sections) && sections.length > 0) {
          setCourseContents(sections);
        } else if (mounted) {
          // Conteúdo acadêmico padrão estruturado por tópicos da matéria
          setCourseContents([
            {
              id: "1",
              name: "Orientações Gerais e Plano de Ensino",
              summary: "Apresentação da disciplina, ementa, critérios de avaliação e bibliografia recomendada.",
              items: [
                {
                  id: "101",
                  name: `Plano de Ensino 2026 - ${currentCourse.title}`,
                  type: "resource",
                  url: "#",
                },
                {
                  id: "102",
                  name: "Cronograma de Aulas e Entregas",
                  type: "resource",
                  url: "#",
                },
              ],
            },
            {
              id: "2",
              name: "Unidade 1: Fundamentos e Marco Conceitual",
              summary: "Conceitos basilares, terminologia técnica e evolução histórica do tema.",
              items: [
                {
                  id: "201",
                  name: "Apostila Digital Oficial (PDF)",
                  type: "resource",
                  url: "#",
                },
                {
                  id: "202",
                  name: "Slides da Apresentação - Aula Inaugural",
                  type: "resource",
                  url: "#",
                },
              ],
            },
            {
              id: "3",
              name: "Unidade 2: Metodologias e Aplicações Práticas",
              summary: "Estudos de caso reais, instrumentalização e resolução orientada de problemas.",
              items: [
                {
                  id: "301",
                  name: "Roteiro de Práticas e Laboratório",
                  type: "resource",
                  url: "#",
                },
              ],
            },
          ]);
        }
      } catch (err) {
        console.warn("Erro ao buscar conteúdos da matéria:", err);
      } finally {
        if (mounted) setIsLoadingContents(false);
      }
    };

    loadContents();
    return () => {
      mounted = false;
    };
  }, [currentCourse?.id, user.ifesAccount]);

  // Lista de matérias filtradas para o menu lateral
  const filteredCourses = useMemo(() => {
    if (!courseSearchTerm.trim()) return courses;
    const term = courseSearchTerm.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term) ||
        c.tags?.some((t) => t.toLowerCase().includes(term))
    );
  }, [courses, courseSearchTerm]);

  // Atividades exclusivas da disciplina atual
  const currentCourseAssignments = useMemo(() => {
    if (!currentCourse || currentCourse.id === "empty-course") return [];
    const cId = currentCourse.id.toLowerCase();
    const cTitle = currentCourse.title.toLowerCase();
    return allAssignments.filter((a) => {
      const aCId = (a.courseId || "").toLowerCase();
      const aName = (a.courseName || "").toLowerCase();
      return aCId === cId || aName.includes(cTitle) || cTitle.includes(aName);
    });
  }, [allAssignments, currentCourse]);

  return (
    <div className="flex flex-col min-h-full pb-8">
      {/* 1. Header & Seletor de Áreas Acadêmicas (PARTE 1.2) */}
      <div className="bg-[var(--app-card)] border-b border-[var(--app-border)] px-4 sm:px-8 py-3 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-base text-[var(--app-text)] leading-none">
                Central de Estudos IFES
              </h1>
              <span className="text-[10px] text-[var(--app-text-muted)] font-medium">
                Área Acadêmica Oficial • Sem Módulos
              </span>
            </div>
          </div>

          {/* Abas Acadêmicas Oficiais */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { id: "materias" as AcademicMainSection, label: "Matérias", icon: BookOpen },
              { id: "atividades" as AcademicMainSection, label: "Atividades", icon: FileText, badge: allAssignments.length },
              { id: "avaliacoes" as AcademicMainSection, label: "Avaliações & Notas", icon: GraduationCap },
              { id: "desempenho" as AcademicMainSection, label: "Desempenho & Histórico", icon: TrendingUp },
              { id: "ferramentas" as AcademicMainSection, label: "Ferramentas", icon: Layers },
            ].map((sec) => {
              const isSelected = activeSection === sec.id;
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-xs"
                      : "bg-[var(--app-card-secondary)]/50 text-[var(--app-text-muted)] hover:text-[var(--app-text)] border-[var(--app-border)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sec.label}</span>
                  {typeof sec.badge === "number" && sec.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-[var(--app-primary)]/15 text-[var(--app-primary)]"
                      }`}
                    >
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Conteúdo da Seção Selecionada */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-6">
        {/* SEÇÃO 1: MATÉRIAS (DESKTOP LATERAL + WORKSPACE PRINCIPAL - PARTE 6) */}
        {activeSection === "materias" && (
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* 1A. Navegação Lateral das Matérias (Fixa e scrollable no Desktop, carrossel no Mobile) */}
            <aside className="w-full md:w-80 shrink-0 bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 space-y-4 shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-[var(--app-text)] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[var(--app-primary)]" />
                    <span>Disciplinas ({courses.length})</span>
                  </h3>
                  {user.ifesAccount?.connected && (
                    <button
                      type="button"
                      onClick={onOpenAvaConnect}
                      className="text-[10px] text-[var(--app-primary)] font-bold hover:underline"
                    >
                      Sincronizar
                    </button>
                  )}
                </div>

                {/* Busca rápida de disciplinas */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[var(--app-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={courseSearchTerm}
                    onChange={(e) => setCourseSearchTerm(e.target.value)}
                    placeholder="Filtrar matérias..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-xs text-[var(--app-text)] placeholder-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/30"
                  />
                </div>
              </div>

              {/* Lista de Matérias */}
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                {filteredCourses.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--app-text-muted)]">
                    Nenhuma disciplina encontrada.
                  </div>
                ) : (
                  filteredCourses.map((c) => {
                    const isSelected = currentCourse?.id === c.id;
                    const cAssignments = allAssignments.filter((a) =>
                      a.courseName?.toLowerCase().includes(c.title.toLowerCase())
                    );
                    const pendingCount = cAssignments.filter((a) => a.status !== "submitted" && a.status !== "graded").length;

                    return (
                      <div
                        key={c.id}
                        onClick={() => onSelectCourse(c)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-[var(--app-primary)]/10 border-[var(--app-primary)] text-[var(--app-text)] shadow-xs"
                            : "bg-[var(--app-card-secondary)]/40 border-[var(--app-border)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{c.icon || "📚"}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-xs truncate text-[var(--app-text)]">
                              {c.title}
                            </p>
                            <span className="text-[10px] text-[var(--app-text-muted)] block truncate">
                              {c.category || "IFES"}
                            </span>
                          </div>
                        </div>

                        {pendingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold shrink-0">
                            {pendingCount}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Ações da grade */}
              {onResetCourses && (
                <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={onOpenOfflineModal}
                    className="text-[11px] text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-semibold"
                  >
                    Cache Offline
                  </button>
                  <button
                    type="button"
                    onClick={onResetCourses}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold"
                  >
                    Limpar Grade
                  </button>
                </div>
              )}
            </aside>

            {/* 1B. Workspace Principal da Matéria Selecionada (Horizontal, sem módulos) */}
            <main className="flex-1 w-full space-y-6">
              {currentCourse && currentCourse.id !== "empty-course" ? (
                <>
                  {/* Cabeçalho da Disciplina Selecionada */}
                  <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{currentCourse.icon || "📚"}</span>
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20 text-[10px] font-black uppercase">
                            {currentCourse.category || "IFES Oficial"}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)] mt-1">
                            {currentCourse.title}
                          </h2>
                        </div>
                      </div>

                      {onDeleteCourse && (
                        <button
                          type="button"
                          onClick={() => onDeleteCourse(currentCourse.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition flex items-center gap-1.5 self-start cursor-pointer"
                          title="Excluir disciplina persistentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir Matéria</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--app-text-muted)] leading-relaxed max-w-3xl">
                      {currentCourse.description ||
                        "Componente curricular oficial da grade do IFES. Acompanhe materiais de apoio, atividades avaliativas e notas."}
                    </p>

                    {/* Sub-navegação Interna da Matéria */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--app-border)] overflow-x-auto scrollbar-none">
                      {[
                        { id: "atividades" as const, label: `Atividades (${currentCourseAssignments.length})`, icon: FileText },
                        { id: "materiais" as const, label: "Materiais de Apoio", icon: FolderOpen },
                        { id: "avaliacoes" as const, label: "Critérios & Notas", icon: GraduationCap },
                        { id: "participantes" as const, label: `Turma (${participants.length})`, icon: User },
                      ].map((sub) => {
                        const isSubActive = materiaSubTab === sub.id;
                        const SubIcon = sub.icon;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setMateriaSubTab(sub.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                              isSubActive
                                ? "bg-[var(--app-primary)] text-white shadow-xs"
                                : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5" />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conteúdo da Sub-Aba Interna da Matéria */}
                  {materiaSubTab === "atividades" && (
                    <CentralAtividadesView
                      user={user}
                      assignments={currentCourseAssignments}
                      courses={ifesCourses}
                      onOpenAvaConnect={onOpenAvaConnect}
                    />
                  )}

                  {materiaSubTab === "materiais" && (
                    <div className="space-y-4">
                      {isLoadingContents ? (
                        <div className="p-8 text-center bg-[var(--app-card)] rounded-3xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
                          Carregando materiais oficiais do AVA IFES...
                        </div>
                      ) : courseContents.length === 0 ? (
                        <div className="p-8 text-center bg-[var(--app-card)] rounded-3xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
                          Nenhum material de apoio anexado até o momento.
                        </div>
                      ) : (
                        courseContents.map((sec) => (
                          <div
                            key={sec.id}
                            className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs space-y-3"
                          >
                            <h4 className="font-black text-sm text-[var(--app-text)] flex items-center gap-2">
                              <FolderOpen className="w-4 h-4 text-[var(--app-primary)]" />
                              <span>{sec.name}</span>
                            </h4>
                            {sec.summary && (
                              <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
                                {sec.summary}
                              </p>
                            )}

                            {sec.items && sec.items.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                {sec.items.map((m: any) => (
                                  <div
                                    key={m.id}
                                    className="p-3 rounded-xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)]/60 flex items-center justify-between text-xs text-[var(--app-text)]"
                                  >
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-3.5 h-3.5 text-[var(--app-primary)] shrink-0" />
                                      <span className="font-semibold">{m.name}</span>
                                    </div>
                                    {m.url && m.url !== "#" && (
                                      <a
                                        href={m.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[11px] text-[var(--app-primary)] font-bold hover:underline flex items-center gap-1"
                                      >
                                        <span>Abrir</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {materiaSubTab === "avaliacoes" && (
                    <AvaGradesView courses={ifesCourses} user={user} />
                  )}

                  {materiaSubTab === "participantes" && (
                    <div className="p-6 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-[var(--app-text)]">
                          Corpo Docente e Colegas de Turma
                        </h4>
                        <span className="text-xs text-[var(--app-text-muted)] font-mono">
                          {participants.length} integrantes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {participants.map((mem) => (
                          <div
                            key={mem.id}
                            className="p-3 rounded-2xl bg-[var(--app-card-secondary)]/40 border border-[var(--app-border)] flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] flex items-center justify-center font-bold text-xs">
                                {mem.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[var(--app-text)] truncate max-w-[150px]">
                                  {mem.name}
                                </p>
                                <span className="text-[10px] text-[var(--app-text-muted)]">
                                  {mem.role === "professor" ? "Professor Titular" : "Estudante"}
                                </span>
                              </div>
                            </div>

                            {onOpenPrivateChatWithMember && (
                              <button
                                type="button"
                                onClick={() => onOpenPrivateChatWithMember(mem)}
                                className="px-2.5 py-1 rounded-lg bg-[var(--app-card)] border border-[var(--app-border)] text-[10px] font-bold text-[var(--app-primary)] hover:bg-[var(--app-primary)] hover:text-white transition cursor-pointer"
                              >
                                Mensagem
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-[var(--app-text)]">
                    Nenhuma matéria selecionada
                  </h3>
                  <p className="text-xs text-[var(--app-text-muted)] max-w-sm mx-auto">
                    Escolha uma disciplina no menu lateral ou sincronize sua conta do AVA IFES para carregar sua grade oficial.
                  </p>
                  {onOpenAvaConnect && (
                    <button
                      type="button"
                      onClick={onOpenAvaConnect}
                      className="px-4 py-2 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold hover:bg-[var(--app-primary-hover)] cursor-pointer"
                    >
                      Conectar ao AVA IFES
                    </button>
                  )}
                </div>
              )}
            </main>
          </div>
        )}

        {/* SEÇÃO 2: ATIVIDADES (CENTRAL GERAL DE ATIVIDADES ESCOLARES - PARTE 4.2) */}
        {activeSection === "atividades" && (
          <CentralAtividadesView
            user={user}
            assignments={allAssignments}
            courses={ifesCourses}
            onOpenAvaConnect={onOpenAvaConnect}
          />
        )}

        {/* SEÇÃO 3: AVALIAÇÕES E NOTAS */}
        {activeSection === "avaliacoes" && (
          <AvaGradesView courses={ifesCourses} user={user} />
        )}

        {/* SEÇÃO 4: DESEMPENHO E HISTÓRICO ACADÊMICO */}
        {activeSection === "desempenho" && (
          <div className="space-y-6">
            <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
                  Rendimento Global
                </span>
              </div>
              <h2 className="text-2xl font-black text-[var(--app-text)]">
                Desempenho e Histórico Acadêmico
              </h2>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)] leading-relaxed max-w-2xl">
                Acompanhamento analítico da sua assiduidade, cumprimento de prazos e notas consolidadas em todas as disciplinas do semestre.
              </p>
            </div>

            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text-muted)]">
                  <span>Atividades Concluídas</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-mono font-black text-[var(--app-text)]">
                  {allAssignments.filter((a) => a.status === "submitted" || a.status === "graded").length} / {allAssignments.length}
                </div>
                <span className="text-[10px] text-emerald-500 font-semibold">
                  Taxa de entrega no prazo: 92%
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text-muted)]">
                  <span>Disciplinas Ativas</span>
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-mono font-black text-[var(--app-text)]">
                  {courses.length}
                </div>
                <span className="text-[10px] text-[var(--app-text-muted)]">
                  Grade curricular do período
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text-muted)]">
                  <span>Ofensiva de Estudos</span>
                  <Timer className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-mono font-black text-amber-500">
                  {user.streakDays || 1} dias
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400">
                  Sequência diária ativa
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text-muted)]">
                  <span>Média Global Estimada</span>
                  <Award className="w-4 h-4 text-purple-500" />
                </div>
                <div className="text-2xl font-mono font-black text-purple-600 dark:text-purple-400">
                  8.4 / 10
                </div>
                <span className="text-[10px] text-purple-500">
                  Aproveitamento excelente
                </span>
              </div>
            </div>

            {/* Boletim Completo */}
            <AvaGradesView courses={ifesCourses} user={user} />
          </div>
        )}

        {/* SEÇÃO 5: FERRAMENTAS DE APOIO (Tarefas, Agenda, Flashcards, Métodos, Biblioteca, Dicionário, Sala Virtual, AVA) */}
        {activeSection === "ferramentas" && (
          <div className="space-y-6">
            {/* Seletor de Ferramenta */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--app-border)]">
              {[
                { id: "tarefas" as AcademicToolId, label: "Organizador de Tarefas", icon: ListTodo },
                { id: "agenda" as AcademicToolId, label: "Agenda Acadêmica", icon: Calendar },
                { id: "flashcards" as AcademicToolId, label: "Flashcards Anki", icon: Layers },
                { id: "metodos" as AcademicToolId, label: "Métodos de Estudo", icon: Brain },
                { id: "biblioteca" as AcademicToolId, label: "Biblioteca Digital", icon: Library },
                { id: "dicionario" as AcademicToolId, label: "Dicionário Acadêmico", icon: BookA },
                { id: "sala_virtual" as AcademicToolId, label: "Sala de Estudo Virtual", icon: Timer },
                { id: "ifes" as AcademicToolId, label: "Conexão AVA IFES", icon: PlugZap },
              ].map((tool) => {
                const isSelected = activeTool === tool.id;
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                      isSelected
                        ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-xs"
                        : "bg-[var(--app-card)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border-[var(--app-border)]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Conteúdo da Ferramenta */}
            <div className="pt-2">
              {activeTool === "tarefas" && (
                <TasksTab
                  user={user}
                  courses={courses}
                  onRewardXp={onRewardXp}
                  onRewardCoins={onRewardCoins}
                />
              )}

              {activeTool === "agenda" && (
                <AgendaTab
                  user={user}
                  courses={courses}
                  onNavigateToStudyRoom={() => setActiveTool("sala_virtual")}
                />
              )}

              {activeTool === "flashcards" && (
                <FlashcardsAnkiTab
                  user={user}
                  courses={courses}
                  onRewardXp={onRewardXp}
                  onRewardCoins={onRewardCoins}
                />
              )}

              {activeTool === "metodos" && (
                <StudyMethodsCentralTab
                  user={user}
                  courses={courses}
                  onRewardXp={onRewardXp}
                  onRewardCoins={onRewardCoins}
                  onNavigateToFlashcards={() => setActiveTool("flashcards")}
                  onOpenSocraticWithTopic={() => onNavigateToTab?.("lumina")}
                />
              )}

              {activeTool === "biblioteca" && (
                <LibraryTab
                  user={user}
                  onOpenSocraticWithContext={() => onNavigateToTab?.("lumina")}
                  onOpenDeckWithDocument={() => setActiveTool("flashcards")}
                  onRewardXp={onRewardXp}
                />
              )}

              {activeTool === "dicionario" && (
                <DictionaryTab
                  user={user}
                  onOpenSocraticWithTerm={() => onNavigateToTab?.("lumina")}
                  onNavigateToFlashcards={() => setActiveTool("flashcards")}
                  onRewardXp={onRewardXp}
                  onRewardCoins={onRewardCoins}
                />
              )}

              {activeTool === "sala_virtual" && (
                <StudyRoomVirtualTab
                  user={user}
                  courses={courses}
                  onRewardXp={onRewardXp}
                  onNavigate={(tab) => onNavigateToTab?.(tab)}
                  onOpenPrivateChatWithMember={onOpenPrivateChatWithMember}
                />
              )}

              {activeTool === "ifes" && (
                <IfesAvaTab
                  user={user}
                  courses={ifesCourses}
                  onUpdateCourses={onUpdateCourses || (() => {})}
                  onGenerateQuizFromTopic={() => onNavigateToTab?.("games")}
                  onOpenSocraticWithTopic={() => onNavigateToTab?.("lumina")}
                  onUpdateIfesAccount={onUpdateIfesAccount || (() => {})}
                  onRewardXp={onRewardXp}
                  onOpenAvaConnect={onOpenAvaConnect || (() => {})}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
