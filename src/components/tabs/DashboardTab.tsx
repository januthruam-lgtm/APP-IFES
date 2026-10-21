import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Zap,
  Target,
  Trophy,
  Users,
  ArrowRight,
  Flame,
  CheckCircle2,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  Check,
  AlertCircle,
  Plus,
  Upload,
  Trash2,
  Heart,
  Smile,
  Wand2,
  Pencil,
  X,
} from "lucide-react";
import { UserProfile, TrackModule, CourseTrack, IfesAssignment, IfesClassSchedule, UserPet } from "../../types";
import { TabId } from "../Sidebar";
import { Pet3DView } from "../pet3d/Pet3DView";
import { DailyStudyChallenges } from "../DailyStudyChallenges";
import { NativeAppButton } from "../NativeAppButton";
import {
  loadSyncedAssignments,
  saveSyncedAssignments,
  loadSyncedSchedules,
  calculateCourseProgress,
  calculateOverallProgress,
} from "../../utils/courseSync";
import confetti from "canvas-confetti";
import { getPetDefinition } from "../../features/gamificacao/petCatalog";
import { creditXp } from "../../features/gamificacao/economyService";

interface DashboardTabProps {
  user: UserProfile;
  modules: TrackModule[];
  courses: CourseTrack[];
  currentCourse: CourseTrack;
  onSelectCourse: (course: CourseTrack) => void;
  onNavigate: (tab: TabId) => void;
  onOpenActiveLesson: () => void;
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
  onStudyOnAva?: () => void;
  onDeleteCourse?: (courseId: string) => void;
  onOpenAvaConnect?: () => void;
  onUpdatePet?: (pet: UserPet) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  user,
  modules,
  courses,
  currentCourse,
  onSelectCourse,
  onNavigate,
  onOpenActiveLesson,
  onRewardXp,
  onRewardCoins,
  onStudyOnAva,
  onDeleteCourse,
  onOpenAvaConnect,
  onUpdatePet,
}) => {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState<IfesAssignment[]>(() => loadSyncedAssignments());
  const [schedules] = useState<IfesClassSchedule[]>(() => loadSyncedSchedules());
  const [selectedDay, setSelectedDay] = useState<string>("Segunda");
  const [isRenamingPet, setIsRenamingPet] = useState(false);
  const [petRenameInput, setPetRenameInput] = useState(user.pet?.name || "Mascote");

  React.useEffect(() => {
    if (user.pet?.name) {
      setPetRenameInput(user.pet.name);
    }
  }, [user.pet?.name]);

  // Real-time synchronization when courses, assignments or tasks update elsewhere
  React.useEffect(() => {
    const handleSync = () => {
      setAssignments(loadSyncedAssignments());
    };
    window.addEventListener("assignments_updated", handleSync);
    window.addEventListener("courses_synced", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("assignments_updated", handleSync);
      window.removeEventListener("courses_synced", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleSavePetName = () => {
    const trimmed = petRenameInput.trim();
    if (!trimmed || !user.pet) return;
    const updatedPet: UserPet = {
      ...user.pet,
      name: trimmed,
    };
    if (onUpdatePet) {
      onUpdatePet(updatedPet);
    }
    setIsRenamingPet(false);
  };

  const activeModule = modules.find((m) => m.status === "active") || modules[0];
  const completedCount = modules.filter((m) => m.status === "completed").length;
  const progressPercent =
    modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;
  const overallProgress = calculateOverallProgress(courses, user.completedModules);

  // Complete an assignment from AVA
  const handleCompleteAssignment = (id: string) => {
    const target = assignments.find((a) => a.id === id);
    if (!target || target.status === "submitted" || target.status === "graded") return;

    const updated = assignments.map((a) =>
      a.id === id ? { ...a, status: "submitted" as const } : a
    );
    setAssignments(updated);
    saveSyncedAssignments(updated);

    // Persistência atômica no Firestore via economyService
    const userId = user.email || user.name || "aluno";
    creditXp(userId, 50, "Tarefa AVA IFES Concluída").catch((err) => {
      console.warn("Erro ao persistir XP da tarefa:", err);
    });

    if (onRewardXp) {
      onRewardXp(50);
    }

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const pendingAssignments = assignments.filter(
    (a) => a.status === "pending" || a.status === "urgent"
  );

  const filteredSchedules = schedules.filter(
    (s) => s.dayOfWeek.toLowerCase() === selectedDay.toLowerCase()
  );

  const pet = user.pet;
  const petDef = getPetDefinition((pet as any)?.type || (pet as any)?.activePetId || (pet as any)?.id || "bunny");
  const petEmoji = (pet as any)?.customSpeciesEmoji || petDef.emoji;

  return (
    <section id="tab-dashboard" className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bento Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Hero Bento Card (Span 8) */}
        <div className="lg:col-span-8 bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] rounded-3xl p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-xs">
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="uppercase text-[11px] tracking-widest text-[var(--app-primary)] font-extrabold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--app-primary)] animate-pulse" />
                {t("dashboard.subtitulo_hero", "Brain Studio • Assistente de Aprendizagem IFES")}
              </div>
              <span className="px-3 py-1 rounded-full border border-[var(--app-border)] text-[10px] uppercase tracking-widest text-[var(--app-text-muted)] font-mono">
                {currentCourse?.category || "Técnico / Ensino Médio"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight max-w-xl text-[var(--app-text)]">
              {t("dashboard.titulo_hero", "Potencialize seus estudos com inteligência acadêmica.")}
            </h1>

            {/* Quick Status Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1.5 rounded-full border border-[var(--app-border)] text-[11px] text-[var(--app-text)] bg-[var(--app-bg)] font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[var(--app-primary)] fill-[var(--app-primary)]" />{" "}
                {user.energy}/{user.maxEnergy || 50} ⚡
              </span>
              <span className="px-3 py-1.5 rounded-full border border-[var(--app-border)] text-[11px] text-[var(--app-text)] bg-[var(--app-bg)] font-semibold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {t("dashboard.ofensiva_dias", { count: user.streakDays || 1 })}
              </span>
              <span
                onClick={() => onNavigate("store")}
                className="px-3 py-1.5 rounded-full border border-emerald-500/30 text-[11px] text-emerald-600 bg-emerald-500/10 font-black font-mono flex items-center gap-1.5 cursor-pointer hover:scale-105 transition"
                title={t("dashboard.loja_pets", "Ver Loja de Pets")}
              >
                <span>🪙 {t("comum.moedas", { count: user.coins ?? 250 })}</span>
              </span>
              <span className="px-3 py-1.5 rounded-full border border-[var(--app-primary)]/30 text-[11px] text-[var(--app-primary)] bg-[var(--app-primary)]/10 font-semibold font-mono">
                {progressPercent}% {t("dashboard.progresso_geral", "Progresso Geral")}
              </span>
            </div>
          </div>
        </div>

        {/* Bento Accent Card - 3D Pet & Energy (Span 4) */}
        <div className="lg:col-span-4 bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs relative overflow-hidden">
          {/* Top Header: Chosen Pet Name, Species & Energy */}
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isRenamingPet ? (
                  <div className="flex items-center gap-1 bg-[var(--app-bg)] px-2 py-0.5 rounded-xl border border-[var(--app-primary)] shadow-xs">
                    <input
                      type="text"
                      value={petRenameInput}
                      onChange={(e) => setPetRenameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSavePetName();
                        if (e.key === "Escape") setIsRenamingPet(false);
                      }}
                      autoFocus
                      placeholder="Nome do mascote..."
                      className="text-xs font-bold bg-transparent text-[var(--app-text)] outline-none w-28 sm:w-36"
                      maxLength={25}
                    />
                    <button
                      onClick={handleSavePetName}
                      className="p-1 rounded-md bg-[var(--app-primary)] text-white hover:opacity-90 transition cursor-pointer"
                      title="Salvar novo nome"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setIsRenamingPet(false)}
                      className="p-1 rounded-md bg-gray-500/20 text-[var(--app-text-muted)] hover:bg-gray-500/30 transition cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-black text-base text-[var(--app-text)] flex items-center gap-1.5">
                      <span>{pet?.name || petDef.nome}</span>
                      <button
                        onClick={() => {
                          setPetRenameInput(pet?.name || petDef.nome);
                          setIsRenamingPet(true);
                        }}
                        className="p-1 rounded-lg hover:bg-[var(--app-primary)]/15 text-[var(--app-text-muted)] hover:text-[var(--app-primary)] transition cursor-pointer"
                        title="Alterar nome do Mascote"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[var(--app-primary)]/15 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                      Nível {pet?.level || 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Informações detalhadas do Pet Escolhido */}
              <div className="flex items-center gap-1.5 text-xs text-[var(--app-text-muted)] flex-wrap">
                <span className="font-semibold text-[var(--app-text)] flex items-center gap-1">
                  <span>{petEmoji}</span>
                  <span>{pet?.customSpeciesName || petDef.nome}</span>
                </span>
                <span>•</span>
                <span className="font-mono text-[11px]">
                  {pet?.exp || 0} / {pet?.maxExp || 100} EXP
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-2xl font-black tracking-tight text-[var(--app-primary)]">
                {user.energy}/{user.maxEnergy || 50} ⚡
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--app-text-muted)]">
                {t("dashboard.energia", "Energia")}
              </div>
            </div>
          </div>

          {/* 3D Pet Viewport com movimento fluido (andar, respirar e pular com toque) */}
          <div
            onClick={() => onNavigate("store")}
            className="my-3 py-1.5 flex flex-col items-center justify-center cursor-pointer relative group rounded-2xl bg-[var(--app-bg)]/50 border border-[var(--app-border)]/50 hover:border-[var(--app-primary)]/30 transition"
            title="Toque no Mascote 3D para brincar ou acessar a Loja de Pets"
          >
            <div className="w-52 h-52 sm:w-60 sm:h-60 relative flex items-center justify-center overflow-visible">
              <Pet3DView
                pet={pet}
                size="lg"
                className="w-full h-full"
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--app-text-muted)] font-mono -mt-1 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{petDef.tituloBadge || "Mascote Ativo"} • Toque para interagir</span>
            </div>
          </div>

          {/* Pet EXP Progression Bar & Habilidade Passiva */}
          <div className="space-y-2 mb-4 p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)]">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-[var(--app-text)] text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{petDef.habilidadePassiva || "Bônus de Aprendizagem Ativo"}</span>
              </span>
              <span className="font-mono font-bold text-[var(--app-primary)] text-xs">
                {Math.round(((pet?.exp || 0) / (pet?.maxExp || 100)) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, ((pet?.exp || 0) / (pet?.maxExp || 100)) * 100))}%` }}
              />
            </div>
          </div>

          {/* Botões de Ação do Mascote */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate("store")}
              className="bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition border border-[var(--app-border)] cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-[var(--app-primary)]" />
              <span>Loja de Pets</span>
            </button>
            <button
              onClick={() => onNavigate("store")}
              className="bg-[var(--app-primary)] hover:opacity-90 text-white py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <span>Evoluir Pet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Official Native App Install Card */}
      <NativeAppButton variant="card" />

      {/* Daily Study Challenges & Consistency Streak Section */}
      <DailyStudyChallenges
        user={user}
        onRewardXp={onRewardXp}
        onRewardCoins={onRewardCoins}
        onNavigate={onNavigate}
      />

      {/* AVA IFES Connection Status Banner (Sem menção de campus) */}
      <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
        user.ifesAccount?.connected
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
          : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            user.ifesAccount?.connected
              ? "bg-emerald-500 text-white shadow-xs"
              : "bg-amber-500 text-white shadow-xs animate-pulse"
          }`}>
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${user.ifesAccount?.connected ? "bg-emerald-500" : "bg-amber-500 animate-ping"}`} />
              <h4 className="text-xs sm:text-sm font-extrabold text-[var(--app-text)]">
                {user.ifesAccount?.connected
                  ? t("dashboard.conexao_permanente_ava", "Conexão Permanente com AVA IFES")
                  : t("dashboard.conexao_pendente_ava", "Conexão com AVA IFES Pendente")}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--app-card)] border border-[var(--app-border)] font-bold text-[var(--app-text-muted)]">
                {user.ifesAccount?.connected ? "ESTÁVEL" : "DESCONECTADO"}
              </span>
            </div>
            <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">
              {user.ifesAccount?.connected
                ? `Matrícula: ${user.ifesAccount?.matricula || user.ifesAccount?.username || user.name} • Sincronização contínua de disciplinas, notas e fóruns ativa.`
                : "Insira suas credenciais institucionais para importar suas disciplinas reais, boletim e questionários."}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAvaConnect ? onOpenAvaConnect : () => onNavigate("ifes")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs ${
            user.ifesAccount?.connected
              ? "bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] border border-[var(--app-border)]"
              : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{user.ifesAccount?.connected ? "Gerenciar Conexão AVA" : "Digitar Credenciais AVA"}</span>
        </button>
      </div>

      {/* IFES Assignments & Timetable Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card: Tarefas & Entregas do AVA IFES (Span 7) */}
        <div className="lg:col-span-7 bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20 flex items-center justify-center text-[var(--app-primary)]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--app-text)]">
                  {t("dashboard.atividades_prazos", "Atividades & Prazos")} ({t("dashboard.atividades_pendentes", { count: pendingAssignments.length })})
                </h3>
                <p className="text-[11px] text-[var(--app-text-muted)]">
                  Entregue tarefas para ganhar +50 XP e evoluir seu mascote
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate("ifes")}
              className="text-xs text-[var(--app-primary)] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" /> Sincronizar AVA
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="p-6 text-center bg-[var(--app-bg)] rounded-2xl border border-[var(--app-border)] text-[var(--app-text-muted)] text-xs space-y-2">
              <p>{t("dashboard.nenhuma_atividade", "Nenhuma atividade cadastrada no momento.")}</p>
              <button
                onClick={() => onNavigate("ifes")}
                className="px-4 py-2 bg-[var(--app-primary)] text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                {t("dashboard.conectar_ava", "Acessar AVA IFES")}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {assignments.map((item) => {
                const isSubmitted = item.status === "submitted" || item.status === "graded";
                const isUrgent = item.status === "urgent";

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSubmitted
                        ? "bg-[var(--app-bg)] border-[var(--app-border)] opacity-60"
                        : isUrgent
                        ? "bg-amber-50 border-amber-200"
                        : "bg-[var(--app-bg)] border-[var(--app-border)]"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)]">
                          {item.courseName}
                        </span>
                        {isUrgent && !isSubmitted && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Prazo Próximo
                          </span>
                        )}
                        {isSubmitted && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Entregue (+50 XP)
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-xs font-bold ${
                          isSubmitted ? "line-through text-[var(--app-text-muted)]" : "text-[var(--app-text)]"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-[var(--app-text-muted)] line-clamp-1">
                        Prazo:{" "}
                        {new Date(item.dueDate).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {!isSubmitted && (
                      <button
                        onClick={() => handleCompleteAssignment(item.id)}
                        className="px-3.5 py-2 bg-[var(--app-primary)] hover:opacity-90 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                        title="Marcar como entregue e receber 50 XP"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Entregue</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card: Quadro Semanal de Horários das Aulas (Span 5) */}
        <div className="lg:col-span-5 bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--app-primary)]" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[var(--app-text)]">
                Horários de Aulas IFES
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--app-text-muted)]">Semanal</span>
          </div>

          {/* Day Selector Buttons */}
          <div className="flex gap-1 bg-[var(--app-bg)] p-1 rounded-xl border border-[var(--app-border)]">
            {["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  selectedDay === day
                    ? "bg-[var(--app-primary)] text-white shadow-xs"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Class List for Selected Day */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredSchedules.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--app-text-muted)] bg-[var(--app-bg)] rounded-xl border border-[var(--app-border)]">
                Nenhuma aula mapeada para {selectedDay}.
              </div>
            ) : (
              filteredSchedules.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[var(--app-bg)] rounded-xl border border-[var(--app-border)] text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-[var(--app-primary)] font-bold">
                      {s.timeSlot}
                    </span>
                    {s.room && <span className="text-[10px] text-[var(--app-text-muted)]">{s.room}</span>}
                  </div>
                  <div className="font-bold text-[var(--app-text)]">{s.courseName}</div>
                  {s.professor && (
                    <div className="text-[10px] text-[var(--app-text-muted)]">{s.professor}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* IFES Courses Horizontal Grid / Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-[var(--app-text)] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--app-primary)]" /> {t("dashboard.minhas_materias", "Minhas Matérias do AVA IFES")} {t("dashboard.disciplinas_count", { count: courses.length })}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("ifes")}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              {t("dashboard.gerenciar_materias", "Gerenciar Matérias Reais")}
            </button>
            <button
              onClick={() => onNavigate("sequence")}
              className="text-xs text-[var(--app-primary)] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              {t("dashboard.ver_trilhas", "Ver Trilhas")} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 text-center bg-[var(--app-card)] rounded-3xl border border-[var(--app-border)] space-y-3">
            <div className="text-3xl">📚</div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">
              {t("dashboard.nenhuma_materia", "Nenhuma disciplina cadastrada")}
            </h4>
            <p className="text-xs text-[var(--app-text-muted)] max-w-md mx-auto">
              Conecte sua matrícula institucional no AVA IFES para carregar sua grade curricular e trilhas de aprendizagem.
            </p>
            <button
              onClick={() => onNavigate("ifes")}
              className="px-5 py-2.5 bg-[var(--app-primary)] text-white font-extrabold text-xs uppercase rounded-xl cursor-pointer"
            >
              {t("dashboard.conectar_ava", "Acessar AVA IFES")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {courses.map((course) => {
              const isSelected = currentCourse?.id === course.id;
              const courseProgress = calculateCourseProgress(course, user.completedModules);

              return (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between min-h-[110px] cursor-pointer relative group ${
                    isSelected
                      ? "bg-[var(--app-card)] border-[var(--app-primary)] ring-1 ring-[var(--app-primary)] shadow-sm"
                      : "bg-[var(--app-card)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{course.icon}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--app-primary)] text-white text-[10px] font-black uppercase tracking-wider">
                          Ativa
                        </span>
                      )}
                    </div>

                    {onDeleteCourse && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCourse(course.id);
                        }}
                        className="p-1.5 text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title={`Excluir ${course.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--app-text)] line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-[10px] text-[var(--app-text-muted)] line-clamp-1 mt-0.5">
                        {course.category}
                      </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[var(--app-text-muted)]">Progresso</span>
                        <span className="font-bold text-[var(--app-primary)]">{courseProgress}%</span>
                      </div>
                      <div className="w-full bg-[var(--app-bg)] h-1.5 rounded-full overflow-hidden border border-[var(--app-border)]">
                        <div
                          className="bg-[var(--app-primary)] h-full rounded-full transition-all duration-300"
                          style={{ width: `${courseProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
