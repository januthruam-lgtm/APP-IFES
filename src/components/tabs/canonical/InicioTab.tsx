import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Flame,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ListTodo,
  Layers,
  Gamepad2,
  Users,
  Building2,
  Zap,
  Play,
  Heart,
  Smile,
  Shield,
  HelpCircle,
} from "lucide-react";
import { UserProfile, CourseTrack, TrackModule, UserPet } from "../../../types";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { ProgressBar } from "../../ui/ProgressBar";
import { Badge } from "../../ui/Badge";
import { loadSyncedAssignments } from "../../../utils/courseSync";
import { Pet3DView } from "../../pet3d/Pet3DView";

export interface InicioTabProps {
  user: UserProfile;
  currentCourse?: CourseTrack;
  courses: CourseTrack[];
  modules: TrackModule[];
  onNavigate: (tab: string, subView?: string) => void;
  onOpenActiveLesson: () => void;
  onUpdatePet?: (pet: UserPet) => void;
  onRewardXp?: (xp: number) => void;
}

export const InicioTab: React.FC<InicioTabProps> = ({
  user,
  currentCourse,
  courses,
  modules,
  onNavigate,
  onOpenActiveLesson,
  onUpdatePet,
  onRewardXp,
}) => {
  const { t } = useTranslation();
  const [horaAtual] = useState(() => new Date().getHours());

  // Saudação contextual
  const saudacao =
    horaAtual < 12
      ? t("dashboard.good_morning", "Bom dia")
      : horaAtual < 18
      ? t("dashboard.good_afternoon", "Boa tarde")
      : t("dashboard.good_evening", "Boa noite");

  // Próximos prazos (máximo 3)
  const assignments = loadSyncedAssignments();
  const proximosPrazos = assignments
    .filter((a) => a.status !== "submitted" && a.status !== "graded")
    .slice(0, 3);

  // Missões do dia (3 missões)
  const [missoes, setMissoes] = useState([
    {
      id: "m1",
      titulo: "Estudar 15 minutos em uma matéria",
      progresso: 10,
      total: 15,
      unidade: "min",
      concluida: false,
    },
    {
      id: "m2",
      titulo: "Revisar 10 flashcards no Anki",
      progresso: 7,
      total: 10,
      unidade: "cards",
      concluida: false,
    },
    {
      id: "m3",
      titulo: "Fazer uma pergunta socrática à Lumina",
      progresso: 1,
      total: 1,
      unidade: "pergunta",
      concluida: true,
    },
  ]);

  // Primeiro uso / Checklist Primeiros Passos (se o usuário tem menos de 2 disciplinas ou não completou o tutorial)
  const hasCourses = courses.length > 0;
  const isAvaConnected = Boolean(user.ifesAccount?.connected);
  const checklistItems = [
    {
      id: "c1",
      titulo: "Conectar minha instituição ou matérias",
      concluido: isAvaConnected || hasCourses,
      acao: () => onNavigate("estudar", "ifes"),
    },
    {
      id: "c2",
      titulo: "Criar ou revisar meu primeiro flashcard",
      concluido: false,
      acao: () => onNavigate("estudar", "flashcards"),
    },
    {
      id: "c3",
      titulo: "Conversar com a Lumina sobre um tema difícil",
      concluido: true,
      acao: () => onNavigate("lumina"),
    },
    {
      id: "c4",
      titulo: "Cuidar do meu mascote acadêmico",
      concluido: (user.pet?.happiness ?? 80) >= 90,
      acao: () => onNavigate("jogo", "pet"),
    },
  ];

  const checklistConcluidos = checklistItems.filter((i) => i.concluido).length;

  // Ação rápida com o Mascote
  const handleAcaoRapidaPet = () => {
    if (!user.pet || !onUpdatePet) return;
    const petAtualizado: UserPet = {
      ...user.pet,
      hunger: Math.min(100, (user.pet.hunger || 70) + 15),
      happiness: Math.min(100, (user.pet.happiness || 80) + 10),
      lastFed: new Date().toISOString(),
    };
    onUpdatePet(petAtualizado);
  };

  const activeModule = modules.find((m) => m.status === "active") || modules[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* 1. Cabeçalho com Saudação e Ofensiva */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-text)] tracking-tight">
            {saudacao}, {user.name ? user.name.split(" ")[0] : "Estudante"}!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-0.5">
            Aqui está o panorama dos seus estudos para hoje.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Card Ofensiva / Streak */}
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold select-none cursor-pointer hover:bg-amber-500/15 transition"
            title={`Ofensiva de estudos: ${user.streakDays || 1} dias consecutivos`}
          >
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
            <div className="flex flex-col leading-none">
              <span className="text-base font-black font-mono">{user.streakDays || 1} dias</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                Ofensiva
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cartão de Destaque: Continuar de Onde Parou */}
      <Card
        variant="elevated"
        padding="lg"
        className="relative overflow-hidden bg-gradient-to-r from-[var(--app-card)] to-[var(--app-card-secondary)] border-[var(--app-border)]"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <Badge variant="primary" size="sm">
              Continuar de onde parou
            </Badge>

            <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)]">
              {currentCourse?.name || currentCourse?.title || "Pronto para estudar?"}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--app-text-muted)] line-clamp-2">
              {activeModule
                ? `Módulo atual: ${activeModule.title}. Faltam poucos tópicos para consolidar seus conhecimentos.`
                : "Selecione uma disciplina para retomar seus resumos e exercícios interativos."}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={onOpenActiveLesson}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Continuar Estudo</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => onNavigate("estudar", "sequence")}
              >
                Ver Disciplinas
              </Button>
            </div>
          </div>

          {/* Progresso do curso atual */}
          <div className="w-full md:w-64 p-4 rounded-2xl bg-[var(--app-bg)]/80 border border-[var(--app-border)] shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text)]">
              <span>Progresso Geral</span>
              <span className="font-mono text-[var(--app-primary)]">
                {modules.length > 0
                  ? Math.round(
                      (modules.filter((m) => m.status === "completed").length / modules.length) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <ProgressBar
              value={
                modules.length > 0
                  ? Math.round(
                      (modules.filter((m) => m.status === "completed").length / modules.length) * 100
                    )
                  : 0
              }
              variant="primary"
            />
            <span className="text-[10px] text-[var(--app-text-muted)] block text-right">
              {modules.filter((m) => m.status === "completed").length} de {modules.length} módulos
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Grid Principal: Próximos Prazos & Missões do Dia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Prazos (Máx 3) */}
        <Card variant="default" padding="lg" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--app-primary)]" />
                <h3 className="text-base font-black text-[var(--app-text)]">Próximos Prazos</h3>
              </div>
              <button
                onClick={() => onNavigate("estudar", "agenda")}
                className="text-xs font-bold text-[var(--app-primary)] hover:underline cursor-pointer"
              >
                Ver Agenda
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {proximosPrazos.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--app-text-muted)]">
                  Nenhum prazo acadêmico pendente no momento. Parabéns pelo ritmo em dia!
                </div>
              ) : (
                proximosPrazos.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-[var(--app-text)] truncate">{p.title}</h4>
                      <p className="text-[11px] text-[var(--app-text-muted)] truncate">{p.courseName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-rose-500 font-mono block">
                        {p.dueDate ? new Date(p.dueDate).toLocaleDateString("pt-BR") : "Em breve"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--app-border)] mt-4">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => onNavigate("estudar", "tasks")}
              className="flex items-center justify-center gap-2"
            >
              <ListTodo className="w-4 h-4" />
              <span>Gerenciar Minhas Tarefas</span>
            </Button>
          </div>
        </Card>

        {/* Missões do Dia (3 missões) */}
        <Card variant="default" padding="lg" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-[var(--app-text)]">Missões do Dia</h3>
              </div>
              <Badge variant="warning" size="sm">
                Hoje
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {missoes.map((m) => {
                const perc = Math.min(100, Math.round((m.progresso / m.total) * 100));
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text)]">
                      <div className="flex items-center gap-2">
                        {m.concluida ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className={m.concluida ? "line-through opacity-70" : ""}>
                          {m.titulo}
                        </span>
                      </div>
                      <span className="font-mono text-[var(--app-text-muted)]">
                        {m.progresso}/{m.total} {m.unidade}
                      </span>
                    </div>
                    <ProgressBar
                      value={perc}
                      variant={m.concluida ? "success" : "primary"}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--app-border)] mt-4">
            <span className="text-[11px] text-[var(--app-text-muted)] block text-center">
              Completar 1 missão libera o resgate de moedas do seu Cofre no Clube de Fidelidade.
            </span>
          </div>
        </Card>
      </div>

      {/* 4. Mascote Compacto & Estado do Baú da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mascote Compacto */}
        <Card variant="default" padding="lg" className="flex flex-col justify-between">
          <div className="flex items-start justify-between pb-3 border-b border-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--app-primary)]/10 flex items-center justify-center text-2xl">
                {user.pet?.customSpeciesEmoji || "🦊"}
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--app-text)]">
                  {user.pet?.name || "Mascote Acadêmico"}
                </h3>
                <span className="text-xs text-[var(--app-text-muted)]">
                  Nível {user.pet?.level || 1} • Felicidade: {user.pet?.happiness || 85}%
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleAcaoRapidaPet}
              className="flex items-center gap-1.5"
            >
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Acariciar Mascote</span>
            </Button>
          </div>

          <div className="py-3 flex items-center justify-between text-xs text-[var(--app-text-muted)]">
            <span>Fome: {user.pet?.hunger || 80}%</span>
            <span>XP: {user.pet?.exp || 0}/{user.pet?.maxExp || 100}</span>
          </div>

          <div className="pt-3 border-t border-[var(--app-border)]">
            <Button
              variant="text"
              size="sm"
              fullWidth
              onClick={() => onNavigate("jogo", "pet")}
              className="flex items-center justify-center gap-1"
            >
              <span>Abrir Cuidados e Evolução 3D</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Estado do Baú da Equipe */}
        <Card variant="default" padding="lg" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-black text-[var(--app-text)]">Baú da Equipe</h3>
              </div>
              <Badge variant="neutral" size="sm">
                Liga Semanal
              </Badge>
            </div>

            <div className="py-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text)]">
                <span>Progresso para o Baú Ouro</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  450 / 1000 XP
                </span>
              </div>
              <ProgressBar value={45} variant="primary" />
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Seus estudos e exercícios contribuem diretamente para desbloquear recompensas para todo o grupo.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--app-border)]">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => onNavigate("jogo", "teams")}
            >
              Abrir Equipes & Batalhas
            </Button>
          </div>
        </Card>
      </div>

      {/* 5. Até 4 Atalhos Rápidos Escolhidos */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-[var(--app-text)]">Atalhos Rápidos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate("estudar", "flashcards")}
            className="p-4 rounded-2xl bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">Flashcards</h4>
            <p className="text-[11px] text-[var(--app-text-muted)]">Revisão espaçada Anki</p>
          </button>

          <button
            onClick={() => onNavigate("estudar", "games")}
            className="p-4 rounded-2xl bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">Simulados 10Q</h4>
            <p className="text-[11px] text-[var(--app-text-muted)]">Quiz e desafios rápidos</p>
          </button>

          <button
            onClick={() => onNavigate("jogo", "cidade")}
            className="p-4 rounded-2xl bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">Vilas do Saber</h4>
            <p className="text-[11px] text-[var(--app-text-muted)]">Construir monumentos</p>
          </button>

          <button
            onClick={() => onNavigate("estudar", "tasks")}
            className="p-4 rounded-2xl bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition cursor-pointer text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <ListTodo className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">Tarefas</h4>
            <p className="text-[11px] text-[var(--app-text-muted)]">Produtividade pessoal</p>
          </button>
        </div>
      </div>

      {/* 6. Checklist de Primeiros Passos (Para Onboarding & Conquistas Iniciais) */}
      <Card variant="default" padding="lg" className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-black text-[var(--app-text)]">Primeiros Passos</h3>
          </div>
          <span className="text-xs font-bold text-[var(--app-text-muted)]">
            {checklistConcluidos} de {checklistItems.length} concluídos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              onClick={item.acao}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                item.concluido
                  ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500"
                  : "bg-[var(--app-card-secondary)] border-[var(--app-border)] hover:border-[var(--app-primary)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    item.concluido
                      ? "bg-emerald-500 text-white"
                      : "border-2 border-[var(--app-border)]"
                  }`}
                >
                  {item.concluido && "✓"}
                </div>
                <span
                  className={`text-xs font-bold text-[var(--app-text)] ${
                    item.concluido ? "line-through opacity-70" : ""
                  }`}
                >
                  {item.titulo}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--app-text-muted)] shrink-0" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
