import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ListTodo,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  AlertTriangle,
  X,
  Search,
  CheckSquare,
  Square,
} from "lucide-react";
import { UserProfile, CourseTrack, TaskItem, TaskPriority } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { moverParaExcluidos, isItemExcluido } from "../../features/excluidos/services/excluidosService";

interface TasksTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
}

const STORAGE_KEY_TASKS = "brain_studio_tasks_v3";

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
  courses = [],
}) => {
  const { t } = useTranslation();
  const userId = user?.id || user?.uid || "local_user";

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t) => !isItemExcluido(t.id, t.title));
        }
      }
    } catch {}
    return DEFAULT_TASKS.filter((t) => !isItemExcluido(t.id, t.title));
  });

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"todas" | "pendentes" | "concluidas">("todas");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");

  // Form de nova tarefa
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState(courses[0]?.title || "Geral");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("média");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split("T")[0]);

  // Modal de edição de tarefa
  const [taskEmEdicao, setTaskEmEdicao] = useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Geral");
  const [editPriority, setEditPriority] = useState<TaskPriority>("média");
  const [editDate, setEditDate] = useState("");

  const updateTasks = (newTasks: TaskItem[] | ((prev: TaskItem[]) => TaskItem[])) => {
    setTasks((prev) => {
      const updated = typeof newTasks === "function" ? newTasks(prev) : newTasks;
      try {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleToggleTask = (id: string) => {
    updateTasks((prev) =>
      prev.map((tItem) => {
        if (tItem.id === id) {
          return { ...tItem, completed: !tItem.completed };
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

  const handleDeleteTask = async (task: TaskItem) => {
    await moverParaExcluidos(userId, {
      id: task.id,
      categoria: "tarefas",
      nome: task.title,
      materiaOrigem: task.category,
      dadosOriginais: task,
    });
    updateTasks((prev) => prev.filter((tItem) => tItem.id !== task.id));
  };

  const handleOpenEdit = (task: TaskItem) => {
    setTaskEmEdicao(task);
    setEditTitle(task.title);
    setEditCategory(task.category || "Geral");
    setEditPriority(task.priority);
    setEditDate(task.dueDate || new Date().toISOString().split("T")[0]);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskEmEdicao || !editTitle.trim()) return;

    updateTasks((prev) =>
      prev.map((tItem) => {
        if (tItem.id === taskEmEdicao.id) {
          return {
            ...tItem,
            title: editTitle.trim(),
            category: editCategory,
            priority: editPriority,
            dueDate: editDate,
          };
        }
        return tItem;
      })
    );

    setTaskEmEdicao(null);
  };

  const tarefasFiltradas = useMemo(() => {
    return tasks.filter((tItem) => {
      if (isItemExcluido(tItem.id, tItem.title)) return false;
      const matchStatus =
        filtroStatus === "todas"
          ? true
          : filtroStatus === "concluidas"
          ? tItem.completed
          : !tItem.completed;
      const matchCat = filtroCategoria === "todas" || tItem.category === filtroCategoria;
      const matchBusca =
        !busca.trim() ||
        tItem.title.toLowerCase().includes(busca.toLowerCase().trim()) ||
        (tItem.category && tItem.category.toLowerCase().includes(busca.toLowerCase().trim()));
      return matchStatus && matchCat && matchBusca;
    });
  }, [tasks, filtroStatus, filtroCategoria, busca]);

  const completedCount = tasks.filter((tItem) => tItem.completed).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)] tracking-tight">
              Gerenciador de Tarefas de Estudo
            </h2>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Organize seus deveres, prazos e entregas por disciplina com total controle.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[var(--app-primary)] px-3 py-1.5 rounded-xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/20">
          {completedCount} de {tasks.length} concluídas
        </span>
      </div>

      {/* Formulário de Criação Rápida */}
      <form
        onSubmit={handleAddTask}
        className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 shadow-xs space-y-3"
      >
        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
          Nova Atividade ou Tarefa
        </h3>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            required
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="O que você precisa estudar ou entregar hoje?..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none"
          />

          <select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold cursor-pointer max-w-[180px] truncate"
          >
            <option value="Geral">Geral (Sem disciplina)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
            className="px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold cursor-pointer"
          >
            <option value="alta">Alta Prioridade</option>
            <option value="média">Média Prioridade</option>
            <option value="baixa">Baixa Prioridade</option>
          </select>

          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold cursor-pointer"
          />

          <Button type="submit" variant="primary" size="sm" className="flex items-center gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </Button>
        </div>
      </form>

      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--app-card)] p-4 rounded-2xl border border-[var(--app-border)]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] pointer-events-none" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar tarefas por título ou matéria..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro Status */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
            {(["todas", "pendentes", "concluidas"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFiltroStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer capitalize ${
                  filtroStatus === st
                    ? "bg-[var(--app-card)] text-[var(--app-primary)] shadow-xs"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Filtro Categoria */}
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="p-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-bold cursor-pointer max-w-[150px] truncate"
          >
            <option value="todas">Todas Disciplinas</option>
            <option value="Geral">Geral</option>
            {courses.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-2.5">
        {tarefasFiltradas.length === 0 ? (
          <Card variant="default" padding="lg" className="py-12 text-center text-xs text-[var(--app-text-muted)]">
            Nenhuma tarefa encontrada com os filtros selecionados.
          </Card>
        ) : (
          tarefasFiltradas.map((tItem) => (
            <Card
              key={tItem.id}
              variant="default"
              padding="md"
              className={`flex items-center justify-between gap-3 group transition ${
                tItem.completed ? "opacity-70 bg-[var(--app-card-secondary)]/50" : ""
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggleTask(tItem.id)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition text-[var(--app-primary)]"
                >
                  {tItem.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--app-text-muted)] group-hover:text-[var(--app-primary)]" />
                  )}
                </button>

                <div className="min-w-0 space-y-1">
                  <h4
                    className={`text-sm font-bold truncate ${
                      tItem.completed
                        ? "line-through text-[var(--app-text-muted)]"
                        : "text-[var(--app-text)]"
                    }`}
                  >
                    {tItem.title}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--app-text-muted)]">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
                      {tItem.category || "Geral"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tItem.priority === "alta"
                          ? "bg-red-500/10 text-red-600"
                          : tItem.priority === "média"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {tItem.priority}
                    </span>
                    {tItem.dueDate && (
                      <span className="font-mono text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[var(--app-text-muted)]" />
                        {tItem.dueDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(tItem)}
                  className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer"
                  title="Editar Tarefa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTask(tItem)}
                  className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Mover para Excluídos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Edição de Tarefa */}
      {taskEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
              <h3 className="text-lg font-black text-[var(--app-text)]">Editar Tarefa</h3>
              <button
                type="button"
                onClick={() => setTaskEmEdicao(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--app-text-muted)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <Input
                label="Título da Tarefa"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--app-text)]">Disciplina</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-bold cursor-pointer"
                >
                  <option value="Geral">Geral (Sem disciplina vinculada)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--app-text)]">Prioridade</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                    className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-bold cursor-pointer"
                  >
                    <option value="alta">Alta</option>
                    <option value="média">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>

                <Input
                  label="Data de Vencimento"
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <Button variant="primary" fullWidth type="submit">
                  Salvar Alterações
                </Button>
                <Button variant="secondary" fullWidth type="button" onClick={() => setTaskEmEdicao(null)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksTab;
