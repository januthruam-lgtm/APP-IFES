import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FolderKanban,
  PenTool,
  GraduationCap,
  Users2,
  PlugZap,
  BookOpen,
  ListTodo,
  Calendar,
  Layers,
  Gamepad2,
  BrainCircuit,
  Library,
  BookA,
  Timer,
  ExternalLink,
} from "lucide-react";
import {
  UserProfile,
  TrackModule,
  CourseTrack,
  IfesCourse,
  UserPet,
} from "../../../types";
import { SequenceTrackTab } from "../SequenceTrackTab";
import { TasksTab } from "../TasksTab";
import { AgendaTab } from "../AgendaTab";
import { FlashcardsAnkiTab } from "../FlashcardsAnkiTab";
import { PdfGameGeneratorTab } from "../PdfGameGeneratorTab";
import { StudyMethodsCentralTab } from "../StudyMethodsCentralTab";
import { LibraryTab } from "../LibraryTab";
import { DictionaryTab } from "../DictionaryTab";
import { StudyRoomVirtualTab } from "../StudyRoomVirtualTab";
import { IfesAvaTab } from "../IfesAvaTab";
import { Chip } from "../../ui/Chip";

export type GrupoEstudoId = "organizar" | "praticar" | "aprender" | "outros" | "sistemas";
export type SubViewEstudoId =
  | "disciplinas"
  | "tarefas"
  | "agenda"
  | "flashcards"
  | "simulados"
  | "metodos"
  | "biblioteca"
  | "dicionario"
  | "sala_virtual"
  | "ifes";

export interface EstudarTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  modules: TrackModule[];
  currentCourse: CourseTrack;
  ifesCourses: IfesCourse[];
  initialSubView?: string;
  onSelectCourse: (course: CourseTrack) => void;
  onOpenLesson: (mod: TrackModule) => void;
  onOpenDeck: (deckId: string) => void;
  onOpenOfflineModal: () => void;
  onResetCourses: () => void;
  onDeleteCourse: (courseId: string) => void;
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
  onConsumeEnergy?: (amount: number) => boolean;
  onOpenPrivateChatWithMember?: (member: any) => void;
  onOpenAvaConnect?: () => void;
  onNavigateToTab?: (tab: string, subView?: string) => void;
  onUpdateIfesAccount?: (account: any) => void;
  onUpdateCourses?: (courses: any[]) => void;
}

export const EstudarTab: React.FC<EstudarTabProps> = ({
  user,
  courses,
  modules,
  currentCourse,
  ifesCourses,
  initialSubView,
  onSelectCourse,
  onOpenLesson,
  onOpenDeck,
  onOpenOfflineModal,
  onResetCourses,
  onDeleteCourse,
  onRewardXp,
  onRewardCoins,
  onConsumeEnergy,
  onOpenPrivateChatWithMember,
  onOpenAvaConnect,
  onNavigateToTab,
  onUpdateIfesAccount,
  onUpdateCourses,
}) => {
  const { t } = useTranslation();

  // Mapeamento de sub-views para seus respectivos grupos canônicos
  const resolveGrupoFromSubView = (sub?: string): GrupoEstudoId => {
    switch (sub) {
      case "tarefas":
      case "tasks":
      case "agenda":
      case "disciplinas":
      case "sequence":
        return "organizar";
      case "flashcards":
      case "games":
      case "simulados":
      case "study_methods":
      case "metodos":
        return "praticar";
      case "library":
      case "biblioteca":
      case "dictionary":
      case "dicionario":
        return "aprender";
      case "study_room":
      case "sala_virtual":
        return "outros";
      case "ifes":
      case "moodle":
        return "sistemas";
      default:
        return "organizar";
    }
  };

  const resolveSubViewFromInput = (sub?: string): SubViewEstudoId => {
    switch (sub) {
      case "tasks":
      case "tarefas":
        return "tarefas";
      case "agenda":
        return "agenda";
      case "flashcards":
        return "flashcards";
      case "games":
      case "simulados":
        return "simulados";
      case "study_methods":
      case "metodos":
        return "metodos";
      case "library":
      case "biblioteca":
        return "biblioteca";
      case "dictionary":
      case "dicionario":
        return "dicionario";
      case "study_room":
      case "sala_virtual":
        return "sala_virtual";
      case "ifes":
        return "ifes";
      default:
        return "disciplinas";
    }
  };

  const [activeGroup, setActiveGroup] = useState<GrupoEstudoId>(() =>
    resolveGrupoFromSubView(initialSubView)
  );

  const [activeSubView, setActiveSubView] = useState<SubViewEstudoId>(() =>
    resolveSubViewFromInput(initialSubView)
  );

  // Grupos com seus itens correspondentes
  const grupos = [
    {
      id: "organizar" as GrupoEstudoId,
      label: "Organizar",
      icon: FolderKanban,
      subViews: [
        { id: "disciplinas" as SubViewEstudoId, label: "Disciplinas", icon: BookOpen },
        { id: "tarefas" as SubViewEstudoId, label: "Tarefas", icon: ListTodo },
        { id: "agenda" as SubViewEstudoId, label: "Agenda", icon: Calendar },
      ],
    },
    {
      id: "praticar" as GrupoEstudoId,
      label: "Praticar",
      icon: PenTool,
      subViews: [
        { id: "flashcards" as SubViewEstudoId, label: "Flashcards Anki", icon: Layers },
        { id: "simulados" as SubViewEstudoId, label: "Simulados 10Q", icon: Gamepad2 },
        { id: "metodos" as SubViewEstudoId, label: "Métodos de Estudo", icon: BrainCircuit },
      ],
    },
    {
      id: "aprender" as GrupoEstudoId,
      label: "Aprender",
      icon: GraduationCap,
      subViews: [
        { id: "biblioteca" as SubViewEstudoId, label: "Biblioteca", icon: Library },
        { id: "dicionario" as SubViewEstudoId, label: "Dicionário", icon: BookA },
      ],
    },
    {
      id: "outros" as GrupoEstudoId,
      label: "Estudar com outros",
      icon: Users2,
      subViews: [
        { id: "sala_virtual" as SubViewEstudoId, label: "Sala de Foco em Grupo", icon: Timer },
      ],
    },
    {
      id: "sistemas" as GrupoEstudoId,
      label: "Sistemas Conectados",
      icon: PlugZap,
      subViews: [
        { id: "ifes" as SubViewEstudoId, label: "AVA Moodle / IFES", icon: ExternalLink },
      ],
    },
  ];

  const currentGroupObj = grupos.find((g) => g.id === activeGroup) || grupos[0];

  const handleSelectGroup = (grupoId: GrupoEstudoId) => {
    setActiveGroup(grupoId);
    const grupo = grupos.find((g) => g.id === grupoId);
    if (grupo && grupo.subViews.length > 0) {
      setActiveSubView(grupo.subViews[0].id);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Barra de Sub-Navegação por Grupos */}
      <div className="sticky top-0 z-20 bg-[var(--app-bg)]/95 backdrop-blur-md border-b border-[var(--app-border)] px-4 sm:px-6 py-2.5 space-y-2">
        {/* Nível 1: Grupos de Estudo */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
          {grupos.map((g) => {
            const isSelected = activeGroup === g.id;
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                onClick={() => handleSelectGroup(g.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
                  isSelected
                    ? "bg-[var(--app-primary)] text-white shadow-xs"
                    : "bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] border border-[var(--app-border)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{g.label}</span>
              </button>
            );
          })}
        </div>

        {/* Nível 2: Sub-views do Grupo Selecionado */}
        {currentGroupObj.subViews.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {currentGroupObj.subViews.map((sub) => {
              const isSelected = activeSubView === sub.id;
              const SubIcon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubView(sub.id)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-[var(--app-card-secondary)] text-[var(--app-primary)] border border-[var(--app-border)] font-bold"
                      : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]/50"
                  }`}
                >
                  <SubIcon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Conteúdo Renderizado da Sub-View */}
      <div className="flex-1">
        {activeSubView === "disciplinas" && (
          <SequenceTrackTab
            modules={modules}
            user={user}
            courses={courses}
            currentCourse={currentCourse}
            onSelectCourse={onSelectCourse}
            onOpenLesson={onOpenLesson}
            onOpenDeck={onOpenDeck}
            onOpenOfflineModal={onOpenOfflineModal}
            onResetCourses={onResetCourses}
            onDeleteCourse={onDeleteCourse}
            onRewardXp={onRewardXp}
            onRewardCoins={onRewardCoins}
            onOpenPrivateChatWithMember={onOpenPrivateChatWithMember}
            onUpdateCourses={(updated) => {
              if (onUpdateCourses) onUpdateCourses(updated);
            }}
          />
        )}

        {activeSubView === "tarefas" && (
          <TasksTab
            user={user}
            courses={courses}
            onRewardXp={onRewardXp}
            onRewardCoins={onRewardCoins}
          />
        )}

        {activeSubView === "agenda" && (
          <AgendaTab
            user={user}
            courses={courses}
            onNavigateToStudyRoom={() => setActiveSubView("sala_virtual")}
          />
        )}

        {activeSubView === "flashcards" && (
          <FlashcardsAnkiTab
            user={user}
            courses={courses}
            onRewardXp={onRewardXp}
            onRewardCoins={onRewardCoins}
          />
        )}

        {activeSubView === "simulados" && (
          <PdfGameGeneratorTab
            user={user}
            initialDeckId={null}
            onRewardXp={onRewardXp}
            onConsumeEnergy={onConsumeEnergy}
            onNavigateToStore={() => onNavigateToTab?.("jogo", "loja")}
          />
        )}

        {activeSubView === "metodos" && (
          <StudyMethodsCentralTab
            user={user}
            courses={courses}
            onRewardXp={onRewardXp}
            onRewardCoins={onRewardCoins}
            onNavigateToFlashcards={() => setActiveSubView("flashcards")}
            onOpenSocraticWithTopic={(topic) => onNavigateToTab?.("lumina")}
          />
        )}

        {activeSubView === "biblioteca" && (
          <LibraryTab
            user={user}
            onOpenSocraticWithContext={(ctx) => onNavigateToTab?.("lumina")}
            onOpenDeckWithDocument={() => setActiveSubView("simulados")}
            onRewardXp={onRewardXp}
          />
        )}

        {activeSubView === "dicionario" && (
          <DictionaryTab
            user={user}
            onOpenSocraticWithTerm={(term) => onNavigateToTab?.("lumina")}
            onNavigateToFlashcards={() => setActiveSubView("flashcards")}
            onRewardXp={onRewardXp}
            onRewardCoins={onRewardCoins}
          />
        )}

        {activeSubView === "sala_virtual" && (
          <StudyRoomVirtualTab
            user={user}
            courses={courses}
            onRewardXp={onRewardXp}
            onNavigate={(tab) => onNavigateToTab?.(tab)}
            onOpenPrivateChatWithMember={onOpenPrivateChatWithMember}
          />
        )}

        {activeSubView === "ifes" && (
          <IfesAvaTab
            user={user}
            courses={ifesCourses}
            onUpdateCourses={onUpdateCourses || (() => {})}
            onGenerateQuizFromTopic={() => setActiveSubView("simulados")}
            onOpenSocraticWithTopic={() => onNavigateToTab?.("lumina")}
            onUpdateIfesAccount={onUpdateIfesAccount || (() => {})}
            onRewardXp={onRewardXp}
            onOpenAvaConnect={onOpenAvaConnect || (() => {})}
          />
        )}
      </div>
    </div>
  );
};
