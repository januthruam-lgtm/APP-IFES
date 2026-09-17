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
        className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar ao Painel Geral de Cursos</span>
      </button>

      {/* Course Room Banner */}
      <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 rounded-full text-[10px] font-bold uppercase font-mono">
                {course.code}
              </span>
              <span className="text-xs text-neutral-400">{course.campus || "IFES"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {course.name}
            </h1>
            <p className="text-xs text-neutral-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#10b981]" /> Docente:{" "}
              <span className="text-white font-medium">{course.professor}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onGenerateQuizFromTopic(`${course.name} (${course.code})`)}
              className="px-4 py-2 bg-[#e2ff31] hover:bg-[#d4f220] text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-black" /> Gerar 10 Questões
            </button>
            <button
              onClick={() => onOpenSocraticWithTopic(`${course.name} (${course.code})`)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Brain className="w-4 h-4 text-[#10b981]" /> Estudo Socrático
            </button>
          </div>
        </div>
      </div>

      {/* Assignments of this course */}
      {courseAssignments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#10b981]" />
            Atividades Avaliativas desta Disciplina ({courseAssignments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courseAssignments.map((assign) => (
              <div
                key={assign.id}
                className="bg-[#141414] border border-white/5 hover:border-white/20 rounded-2xl p-4 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full">
                    {assign.type}
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Prazo: {new Date(assign.dueDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{assign.title}</h4>
                <p className="text-xs text-neutral-400 line-clamp-2">{assign.description}</p>
                <button
                  onClick={() => onOpenSubmitModal(assign)}
                  className="w-full py-2 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
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
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#e2ff31]" />
          Conteúdos, Aulas e Semanas da Disciplina
        </h3>

        {isLoading ? (
          <div className="p-8 text-center bg-[#141414] rounded-2xl border border-white/5 space-y-2">
            <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Carregando sala virtual do Moodle...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div
                key={section.id || idx}
                className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-3"
              >
                <div className="border-b border-white/5 pb-3">
                  <h4 className="text-base font-bold text-white">{section.name}</h4>
                  {section.summary && (
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {section.summary}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {Array.isArray(section.modules) &&
                    section.modules.map((mod: any, mIdx: number) => {
                      let IconComponent = FileText;
                      let tagColor = "text-neutral-400 bg-white/5";

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
                        tagColor = "text-emerald-400 bg-emerald-500/10";
                      }

                      return (
                        <div
                          key={mod.id || mIdx}
                          className="flex items-center justify-between p-3 bg-black/30 hover:bg-white/[0.03] border border-white/5 rounded-xl transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white shrink-0">
                              <IconComponent className="w-4 h-4 text-[#10b981]" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">{mod.name}</p>
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
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
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
