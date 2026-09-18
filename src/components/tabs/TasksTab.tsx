import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Tag,
  AlertCircle,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { CourseTrack, UserProfile } from "../../types";
import confetti from "canvas-confetti";

export interface TaskItem {
  id: string;
  title: string;
  courseTitle: string;
  dueDate: string;
  priority: "baixa" | "media" | "alta";
  completed: boolean;
  xpReward: number;
  createdAt: string;
}

const STORAGE_KEY = "brain_studio_tasks_list_v2";

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "Resolver lista de exercícios de Algoritmos (Recursão)",
    courseTitle: "Algoritmos e Estruturas de Dados",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    priority: "alta",
    completed: false,
    xpReward: 35,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Revisar anotações sobre Integrais por Partes",
    courseTitle: "Cálculo Diferencial e Integral",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
    priority: "media",
    completed: false,
    xpReward: 25,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Configurar ambiente de laboratório para Redes (Cisco Packet Tracer)",
    courseTitle: "Redes de Computadores",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    priority: "baixa",
    completed: true,
    xpReward: 20,
    createdAt: new Date().toISOString(),
  },
];

interface TasksTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onRewardXp: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  user,
  courses,
  onRewardXp,
  onRewardCoins,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Error loading tasks:", e);
    }
    return INITIAL_TASKS;
  });

  const [filter, setFilter] = useState<"todas" | "pendentes" | "concluidas">("todas");
  const [selectedCourse, setSelectedCourse] = useState<string>("todas");

  // New task form state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState<"baixa" | "media" | "alta">("media");

  // Save tasks to localStorage when tasks change (pure local effect, never touches parent)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn("Error saving tasks:", e);
    }
  }, [tasks]);

  const handleToggleTask = (task: TaskItem) => {
    const updatedStatus = !task.completed;

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: updatedStatus } : t))
    );

    // Call parent reward handlers ONLY in direct user interaction event
    if (updatedStatus) {
      confetti({ particleCount: 30, spread: 50 });
      onRewardXp(task.xpReward);
      if (onRewardCoins) {
        onRewardCoins(Math.floor(task.xpReward / 2));
      }
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      courseTitle: newCourse || (courses[0]?.title || "Geral"),
      dueDate: newDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      priority: newPriority,
      completed: false,
      xpReward: newPriority === "alta" ? 40 : newPriority === "media" ? 25 : 15,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewDueDate("");
    setIsAdding(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pendentes" && t.completed) return false;
    if (filter === "concluidas" && !t.completed) return false;
    if (selectedCourse !== "todas" && t.courseTitle !== selectedCourse) return false;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--bg-card,#1e293b)] p-6 rounded-3xl border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Gestão Acadêmica de Tarefas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary,#f8fafc)]">
            Minhas Tarefas & Prazos
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted,#94a3b8)]">
            {pendingCount} pendente{pendingCount !== 1 ? "s" : ""} • {completedCount} concluída{completedCount !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[var(--btn-primary,#6366f1)] hover:bg-[var(--btn-primary-hover,#4f46e5)] text-[var(--btn-primary-text,#ffffff)] transition shadow-lg flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? "Fechar Formulário" : "Nova Tarefa"}</span>
        </button>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl space-y-4 animate-in slide-in-from-top-2"
        >
          <h3 className="text-sm font-bold text-[var(--text-primary,#f8fafc)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Cadastrar Nova Tarefa
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted,#94a3b8)] mb-1">
                Título da Tarefa
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Entregar lista de exercícios no AVA..."
                className="w-full bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary,#f8fafc)] placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted,#94a3b8)] mb-1">
                  Matéria / Disciplina
                </label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary,#f8fafc)] focus:outline-none"
                >
                  <option value="Geral">Geral (Todas as Matérias)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted,#94a3b8)] mb-1">
                  Data Limite
                </label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary,#f8fafc)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted,#94a3b8)] mb-1">
                  Prioridade
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary,#f8fafc)] focus:outline-none"
                >
                  <option value="baixa">Baixa (+15 XP)</option>
                  <option value="media">Média (+25 XP)</option>
                  <option value="alta">Alta (+40 XP)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              Salvar Tarefa
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-card,#1e293b)] p-4 rounded-2xl border border-[var(--border-color,rgba(255,255,255,0.1))]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("todas")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === "todas"
                ? "bg-[var(--btn-primary,#6366f1)] text-white"
                : "text-[var(--text-muted,#94a3b8)] hover:text-white"
            }`}
          >
            Todas ({tasks.length})
          </button>
          <button
            onClick={() => setFilter("pendentes")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === "pendentes"
                ? "bg-[var(--btn-primary,#6366f1)] text-white"
                : "text-[var(--text-muted,#94a3b8)] hover:text-white"
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("concluidas")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filter === "concluidas"
                ? "bg-[var(--btn-primary,#6366f1)] text-white"
                : "text-[var(--text-muted,#94a3b8)] hover:text-white"
            }`}
          >
            Concluídas ({completedCount})
          </button>
        </div>

        {courses.length > 0 && (
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary,#f8fafc)] focus:outline-none"
          >
            <option value="todas">Filtrar por Disciplina</option>
            {courses.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg-card,#1e293b)] rounded-3xl border border-[var(--border-color,rgba(255,255,255,0.1))] p-6 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-[var(--text-primary,#f8fafc)]">
              Nenhuma tarefa encontrada neste filtro!
            </h4>
            <p className="text-xs text-[var(--text-muted,#94a3b8)]">
              Você está em dia com seus estudos acadêmicos.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.completed;
            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                  isCompleted
                    ? "bg-[var(--bg-card,#1e293b)]/60 opacity-60 border-white/5"
                    : "bg-[var(--bg-card,#1e293b)] border-[var(--border-color,rgba(255,255,255,0.1))] hover:border-indigo-500/40 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="p-1 text-neutral-400 hover:text-indigo-400 transition cursor-pointer"
                    title={isCompleted ? "Marcar como pendente" : "Marcar como concluída"}
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCompleted
                          ? "line-through text-neutral-500"
                          : "text-[var(--text-primary,#f8fafc)]"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-muted,#94a3b8)]">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        {task.courseTitle}
                      </span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-400" />
                          {task.dueDate}
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === "alta"
                            ? "bg-rose-500/20 text-rose-400"
                            : task.priority === "media"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    +{task.xpReward} XP
                  </span>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Excluir tarefa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
