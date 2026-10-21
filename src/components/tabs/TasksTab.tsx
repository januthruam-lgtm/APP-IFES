import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";
import { UserProfile, CourseTrack, TaskItem, TaskPriority } from "../../types";
import confetti from "canvas-confetti";

interface TasksTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
}

const STORAGE_KEY_TASKS = "brain_studio_tasks_v2";

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "Revisar anotações sobre Ciclo PDCA para o seminário",
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    priority: "alta",
    category: "Gestão da Qualidade",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Exercícios de recursividade no Moodle IFES",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    priority: "média",
    category: "Algoritmos e Lógica",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Formatar relatório da aula prática conforme normas ABNT",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    priority: "baixa",
    category: "Comunicação Técnica",
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

export const TasksTab: React.FC<TasksTabProps> = ({
  user,
  courses,
  onRewardXp,
  onRewardCoins,
}) => {
  const { t } = useTranslation();

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return DEFAULT_TASKS;
  });

  // Salva tarefas sempre que houver alteração
  const updateTasks = (newTasks: TaskItem[] | ((prev: TaskItem[]) => TaskItem[])) => {
    setTasks((prev) => {
      const updated = typeof newTasks === "function" ? newTasks(prev) : newTasks;
      try {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState(courses[0]?.title || t("tarefas.geral", "Geral"));
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("média");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split("T")[0]);

  const handleToggleTask = (id: string) => {
    updateTasks((prev) =>
      prev.map((tItem) => {
        if (tItem.id === id) {
          const nextCompleted = !tItem.completed;
          if (nextCompleted) {
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
            if (onRewardXp) onRewardXp(20);
            if (onRewardCoins) onRewardCoins(5);
          }
          return { ...tItem, completed: nextCompleted };
        }
        return tItem;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      dueDate: newTaskDate,
      priority: newTaskPriority,
      category: newTaskCategory,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    updateTasks((prev) => [task, ...prev]);
    setNewTaskTitle("");
  };

  const handleDeleteTask = (id: string) => {
    updateTasks((prev) => prev.filter((tItem) => tItem.id !== id));
  };

  const completedCount = tasks.filter((tItem) => tItem.completed).length;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--app-text)]">
              {t("tarefas.gerenciador", "Gerenciador de Tarefas de Estudo")}
            </h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              {t("tarefas.gerenciador_desc", "Organize seus deveres, leituras e entregas por disciplina com recompensas em moedas e XP.")}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[var(--app-primary)] px-3 py-1.5 rounded-xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20">
          {t("tarefas.tarefas_concluidas_count", { completed: completedCount, total: tasks.length, defaultValue: `${completedCount} de ${tasks.length} concluídas` })}
        </span>
      </div>

      {/* Add Task Form */}
      <form
        onSubmit={handleAddTask}
        className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            required
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={t("tarefas.placeholder_nova_tarefa", "O que você precisa estudar ou entregar hoje?...")}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none"
          />

          <select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
            <option value="Geral">{t("tarefas.geral", "Geral")}</option>
          </select>

          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
            className="px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold"
          >
            <option value="alta">{t("tarefas.prioridade_alta", "Alta")}</option>
            <option value="média">{t("tarefas.prioridade_media", "Média")}</option>
            <option value="baixa">{t("tarefas.prioridade_baixa", "Baixa")}</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t("tarefas.adicionar_tarefa", "Adicionar")}</span>
          </button>
        </div>
      </form>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="p-8 text-center bg-[var(--app-card)] rounded-2xl border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
            {t("tarefas.sem_tarefas", "Nenhuma tarefa cadastrada nesta categoria.")}
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 bg-[var(--app-card)] shadow-xs ${
                task.completed ? "opacity-60 border-[var(--app-border)]" : "border-[var(--app-border)] hover:border-[var(--app-primary)]/40"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="text-[var(--app-primary)] shrink-0 cursor-pointer"
                  title={task.completed ? t("tarefas.marcar_pendente", "Marcar como pendente") : t("tarefas.marcar_concluida", "Marcar como concluída")}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-400" />
                  )}
                </button>

                <div className="space-y-0.5 min-w-0 flex-1">
                  <p
                    className={`text-xs sm:text-sm font-bold truncate ${
                      task.completed ? "line-through text-[var(--app-text-muted)]" : "text-[var(--app-text)]"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--app-text-muted)] flex-wrap">
                    <span>{task.category}</span>
                    <span>•</span>
                    <span>{t("tarefas.prazo_prefix", "Prazo:")} {task.dueDate}</span>
                    <span>•</span>
                    <span
                      className={`font-bold uppercase ${
                        task.priority === "alta"
                          ? "text-red-500"
                          : task.priority === "média"
                          ? "text-amber-500"
                          : "text-blue-500"
                      }`}
                    >
                      {task.priority === "alta" ? t("tarefas.prioridade_alta", "Alta") : task.priority === "baixa" ? t("tarefas.prioridade_baixa", "Baixa") : t("tarefas.prioridade_media", "Média")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteTask(task.id)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                title={t("tarefas.excluir", "Excluir")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TasksTab;
