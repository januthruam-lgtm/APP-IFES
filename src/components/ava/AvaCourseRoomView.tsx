import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  FolderOpen,
  Calendar,
  Sparkles,
  Brain,
  ExternalLink,
  GraduationCap,
  Users,
  CheckCircle2,
  Lock,
  Layers,
} from "lucide-react";
import { IfesCourse, IfesAssignment, UserProfile } from "../../types";
import { avaApiClient } from "../../utils/avaApi";

interface AvaCourseRoomViewProps {
  course: IfesCourse;
  user: UserProfile;
  assignments: IfesAssignment[];
  onBack: () => void;
  onOpenSubmitModal: (assignment: IfesAssignment) => void;
  onGenerateQuizFromTopic: (topic: string) => void;
  onOpenSocraticWithTopic: (topic: string) => void;
}

export const AvaCourseRoomView: React.FC<AvaCourseRoomViewProps> = ({
  course,
  user,
  assignments,
  onBack,
  onOpenSubmitModal,
  onGenerateQuizFromTopic,
  onOpenSocraticWithTopic,
}) => {
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchContents = async () => {
      setIsLoading(true);
      try {
        const data = await avaApiClient.getCourseContents(
          course.id,
          user.ifesAccount?.campusUrl,
          user.ifesAccount?.token
        );
        if (mounted && Array.isArray(data) && data.length > 0) {
          setSections(data);
        }
      } catch (err) {
        console.warn("Erro ao buscar conteúdos da sala:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchContents();
    return () => {
      mounted = false;
    };
  }, [course.id]);

  const courseAssignments = assignments.filter(
    (a) =>
      a.courseId === course.id ||
      a.courseName?.toLowerCase() === course.name.toLowerCase()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button & Room header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Painel Geral de Cursos</span>
      </button>

      {/* Course Room Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[var(--app-primary)]/15 text-[var(--app-primary)] border border-[var(--app-primary)]/30 rounded-full text-[10px] font-bold uppercase font-mono">
                {course.code}
              </span>
              <span className="text-xs text-[var(--app-text-muted)]">{course.campus || "IFES"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--app-text)] tracking-tight">
              {course.name}
            </h1>
            <p className="text-xs text-[var(--app-text-muted)] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[var(--app-primary)]" /> Docente:{" "}
              <span className="text-[var(--app-text)] font-medium">{course.professor}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onGenerateQuizFromTopic(`${course.name} (${course.code})`)}
              className="px-4 py-2 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-white" /> Gerar 10 Questões
            </button>
            <button
              onClick={() => onOpenSocraticWithTopic(`${course.name} (${course.code})`)}
              className="px-4 py-2 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] border border-[var(--app-border)] font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Brain className="w-4 h-4 text-[var(--app-primary)]" /> Estudo Socrático
            </button>
          </div>
        </div>
      </div>

      {/* Assignments of this course */}
      {courseAssignments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--app-primary)]" />
            Atividades Avaliativas desta Disciplina ({courseAssignments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courseAssignments.map((assign) => (
              <div
                key={assign.id}
                className="bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/30 rounded-2xl p-4 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[var(--app-primary)] bg-[var(--app-primary)]/10 px-2 py-0.5 rounded-full">
                    {assign.type}
                  </span>
                  <span className="text-xs font-mono text-[var(--app-text-muted)]">
                    Prazo: {new Date(assign.dueDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[var(--app-text)]">{assign.title}</h4>
                <p className="text-xs text-[var(--app-text-muted)] line-clamp-2">{assign.description}</p>
                <button
                  onClick={() => onOpenSubmitModal(assign)}
                  className="w-full py-2 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Entregar no AVA</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections and Course Syllabus */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[var(--app-text)] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--app-primary)]" />
          Conteúdos, Aulas e Semanas da Disciplina
        </h3>

        {isLoading ? (
          <div className="p-8 text-center bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] space-y-2">
            <div className="w-6 h-6 border-2 border-[var(--app-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[var(--app-text-muted)]">Carregando sala virtual do Moodle...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div
                key={section.id || idx}
                className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-5 space-y-3"
              >
                <div className="border-b border-[var(--app-border)] pb-3">
                  <h4 className="text-base font-bold text-[var(--app-text)]">{section.name}</h4>
                  {section.summary && (
                    <p className="text-xs text-[var(--app-text-muted)] mt-1 leading-relaxed">
                      {section.summary}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {Array.isArray(section.modules) &&
                    section.modules.map((mod: any, mIdx: number) => {
                      let IconComponent = FileText;
                      let tagColor = "text-[var(--app-text-muted)] bg-[var(--app-card-secondary)]";

                      if (mod.modname === "resource") {
                        IconComponent = BookOpen;
                        tagColor = "text-blue-400 bg-blue-500/10";
                      } else if (mod.modname === "url") {
                        IconComponent = Video;
                        tagColor = "text-cyan-400 bg-cyan-500/10";
                      } else if (mod.modname === "quiz") {
                        IconComponent = HelpCircle;
                        tagColor = "text-amber-400 bg-amber-500/10";
                      } else if (mod.modname === "assign") {
                        IconComponent = FileText;
                        tagColor = "text-[var(--app-primary)] bg-[var(--app-primary)]/10";
                      }

                      return (
                        <div
                          key={mod.id || mIdx}
                          className="flex items-center justify-between p-3 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] rounded-xl transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--app-card)] flex items-center justify-center text-[var(--app-text)] shrink-0 border border-[var(--app-border)]">
                              <IconComponent className="w-4 h-4 text-[var(--app-primary)]" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[var(--app-text)]">{mod.name}</p>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${tagColor}`}>
                                {mod.modname?.toUpperCase() || "MATERIAL"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {mod.url && (
                              <a
                                href={mod.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-lg text-xs font-medium transition flex items-center gap-1 border border-[var(--app-border)]"
                              >
                                <span>Acessar</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
