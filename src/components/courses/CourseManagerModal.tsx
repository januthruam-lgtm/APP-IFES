/**
 * Brain Studio - Modal de Gerenciamento e Edição de Matérias (Bloco 5.1)
 * Criação, renomeação, reordenação, cor, ícone, arquivamento, ocultação,
 * professor, sala/link, horário semanal, plano de ensino e anotações.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Archive,
  Eye,
  EyeOff,
  Check,
  X,
  Clock,
  MapPin,
  User,
  FileText,
  Palette,
  Sparkles,
  Shield,
  Layers,
} from "lucide-react";
import { CourseTrack, TrackModule, IfesCourse } from "../../types";
import { saveSyncedCourses, loadSyncedCourses, convertIfesCoursesToTracks } from "../../utils/courseSync";
import { excludeCourse } from "../../utils/courseTombstones";

interface CourseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseTrack[];
  onCoursesUpdated: (newCourses: CourseTrack[]) => void;
  onSelectCourse?: (course: CourseTrack) => void;
}

const PALETA_CORES = [
  "#2563eb", // Azul
  "#16a34a", // Verde
  "#9333ea", // Roxo
  "#ea580c", // Laranja
  "#0891b2", // Ciano
  "#e11d48", // Rosa/Vermelho
  "#ca8a04", // Amarelo
  "#4f46e5", // Índigo
  "#059669", // Esmeralda
  "#475569", // Ardósia
];

const PRESETS_ICONES = ["📚", "💻", "🔬", "⚡", "📊", "📐", "🧪", "🎨", "🏛️", "⚖️", "🌐", "🧬", "🧠", "📝", "🌍"];

export const CourseManagerModal: React.FC<CourseManagerModalProps> = ({
  isOpen,
  onClose,
  courses,
  onCoursesUpdated,
  onSelectCourse,
}) => {
  const { t } = useTranslation();
  const [filtro, setFiltro] = useState<"ativas" | "arquivadas" | "ocultas" | "todas">("ativas");
  const [cursoEmEdicao, setCursoEmEdicao] = useState<CourseTrack | null>(null);
  const [isCriandoNovo, setIsCriandoNovo] = useState(false);

  // Form states de edição / criação
  const [editTitle, setEditTitle] = useState("");
  const [editColor, setEditColor] = useState(PALETA_CORES[0]);
  const [editIcon, setEditIcon] = useState(PRESETS_ICONES[0]);
  const [editProfessor, setEditProfessor] = useState("");
  const [editRoom, setEditRoom] = useState("");
  const [editSchedule, setEditSchedule] = useState("");
  const [editSyllabus, setEditSyllabus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editArchived, setEditArchived] = useState(false);
  const [editHidden, setEditHidden] = useState(false);

  if (!isOpen) return null;

  // Iniciar criação de nova matéria
  const iniciarCriacao = () => {
    setIsCriandoNovo(true);
    setCursoEmEdicao(null);
    setEditTitle("");
    setEditColor(PALETA_CORES[Math.floor(Math.random() * PALETA_CORES.length)]);
    setEditIcon(PRESETS_ICONES[Math.floor(Math.random() * PRESETS_ICONES.length)]);
    setEditProfessor("");
    setEditRoom("");
    setEditSchedule("");
    setEditSyllabus("");
    setEditNotes("");
    setEditArchived(false);
    setEditHidden(false);
  };

  // Iniciar edição de matéria existente
  const iniciarEdicao = (c: CourseTrack) => {
    setCursoEmEdicao(c);
    setIsCriandoNovo(false);
    setEditTitle(c.displayName || c.title || c.name);
    setEditColor(c.color || PALETA_CORES[0]);
    setEditIcon(c.icon || "📚");
    setEditProfessor(c.professor || "");
    setEditRoom(c.roomOrLink || "");
    setEditSchedule(c.weeklySchedule || "");
    setEditSyllabus(c.syllabus || "");
    setEditNotes(c.notes || "");
    setEditArchived(Boolean(c.archived));
    setEditHidden(Boolean(c.hidden));
  };

  // Salvar alterações de curso (criação ou edição)
  const handleSalvarCurso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    let updatedList: CourseTrack[] = [];

    if (isCriandoNovo) {
      const novoId = `user_course_${Date.now()}`;
      const novoCurso: CourseTrack = {
        id: novoId,
        title: editTitle.trim(),
        name: editTitle.trim(),
        displayName: editTitle.trim(),
        color: editColor,
        icon: editIcon,
        category: "Criada pelo Estudante",
        description: `Matéria personalizada adicionada pelo usuário.`,
        accentBg: `${editColor}20`,
        tags: ["Personalizada"],
        professor: editProfessor.trim() || undefined,
        roomOrLink: editRoom.trim() || undefined,
        weeklySchedule: editSchedule.trim() || undefined,
        syllabus: editSyllabus.trim() || undefined,
        notes: editNotes.trim() || undefined,
        archived: editArchived,
        hidden: editHidden,
        order: courses.length,
        isSynced: false,
        modules: [
          {
            id: Date.now() % 100000,
            title: "Tópico 1: Introdução à Matéria",
            subtitle: "Conceitos centrais e planejamento do semestre",
            category: "Geral",
            status: "active",
            xpReward: 60,
            estimatedMinutes: 20,
            summary: "Primeiro módulo de estudos para anotações e atividades desta disciplina.",
            keyConcepts: ["Objetivos", "Plano de estudo"],
            lessons: [
              {
                id: `step-${Date.now()}`,
                title: "Início dos Estudos",
                conceptText: `Organize seus resumos e metas de estudo para ${editTitle.trim()}.`,
                socraticPrompt: `Quais são as principais metas que você quer alcançar nesta disciplina?`,
              },
            ],
          },
        ],
      };
      updatedList = [...courses, novoCurso];
    } else if (cursoEmEdicao) {
      updatedList = courses.map((c) => {
        if (c.id === cursoEmEdicao.id) {
          return {
            ...c,
            title: editTitle.trim(),
            displayName: editTitle.trim(),
            color: editColor,
            accentBg: `${editColor}20`,
            icon: editIcon,
            professor: editProfessor.trim() || undefined,
            roomOrLink: editRoom.trim() || undefined,
            weeklySchedule: editSchedule.trim() || undefined,
            syllabus: editSyllabus.trim() || undefined,
            notes: editNotes.trim() || undefined,
            archived: editArchived,
            hidden: editHidden,
          };
        }
        return c;
      });
    }

    persistirCursos(updatedList);
    setCursoEmEdicao(null);
    setIsCriandoNovo(false);
  };

  // Reordenar matérias (subir)
  const moverParaCima = (idx: number) => {
    if (idx === 0) return;
    const list = [...courses];
    const temp = list[idx];
    list[idx] = list[idx - 1];
    list[idx - 1] = temp;
    list.forEach((c, i) => (c.order = i));
    persistirCursos(list);
  };

  // Reordenar matérias (descer)
  const moverParaBaixo = (idx: number) => {
    if (idx >= courses.length - 1) return;
    const list = [...courses];
    const temp = list[idx];
    list[idx] = list[idx + 1];
    list[idx + 1] = temp;
    list.forEach((c, i) => (c.order = i));
    persistirCursos(list);
  };

  // Alternar arquivamento
  const toggleArquivar = (c: CourseTrack) => {
    const list = courses.map((item) =>
      item.id === c.id ? { ...item, archived: !item.archived } : item
    );
    persistirCursos(list);
  };

  // Alternar visibilidade
  const toggleOcultar = (c: CourseTrack) => {
    const list = courses.map((item) =>
      item.id === c.id ? { ...item, hidden: !item.hidden } : item
    );
    persistirCursos(list);
  };

  // Excluir matéria com tombstone (Bloco 6 Excluídos)
  const handleExcluir = (c: CourseTrack) => {
    if (!confirm(`Deseja realmente mover a matéria "${c.title}" para a lixeira de Excluídos?`)) return;
    excludeCourse("local_user", { id: c.id, name: c.displayName || c.title, code: c.tags?.[0] || "" } as any);
    const list = courses.filter((item) => item.id !== c.id);
    persistirCursos(list);
  };

  // Persistência local unificada
  const persistirCursos = (updatedTracks: CourseTrack[]) => {
    onCoursesUpdated(updatedTracks);

    // Mapeia para IfesCourse para persistência no storage local
    const ifesList: IfesCourse[] = updatedTracks.map((tr, idx) => ({
      id: tr.id,
      name: tr.officialName || tr.title,
      shortname: tr.displayName || tr.title,
      code: tr.tags?.[0] || "MAT",
      professor: tr.professor || "Não informado",
      campus: tr.category || "Geral",
      progressPercent: 50,
      room: tr.roomOrLink,
      status: tr.archived ? "archived" : tr.hidden ? "hidden" : "active",
      modules: tr.modules,
    }));

    saveSyncedCourses(ifesList);
    try {
      localStorage.setItem("brain_studio_course_tracks_custom_v2", JSON.stringify(updatedTracks));
      window.dispatchEvent(new CustomEvent("brainstudio:courses-updated", { detail: updatedTracks }));
    } catch {}
  };

  // Filtragem de matérias
  const cursosFiltrados = courses.filter((c) => {
    if (filtro === "ativas") return !c.archived && !c.hidden;
    if (filtro === "arquivadas") return c.archived;
    if (filtro === "ocultas") return c.hidden;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[var(--app-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--app-text)]">Gerenciar Matérias</h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                Personalize nomes, cores, ordem, horários, plano de ensino e matérias sincronizadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCriandoNovo && !cursoEmEdicao && (
              <button
                onClick={iniciarCriacao}
                className="px-3.5 py-2 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Matéria</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--app-bg)] text-[var(--app-text-muted)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Se estiver no modo Formulário de Edição / Criação */}
          {(isCriandoNovo || cursoEmEdicao) ? (
            <form onSubmit={handleSalvarCurso} className="space-y-5 max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
                <h3 className="text-base font-extrabold text-[var(--app-text)] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[var(--app-primary)]" />
                  {isCriandoNovo ? "Cadastrar Nova Matéria" : `Editar Matéria: ${cursoEmEdicao?.title}`}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCriandoNovo(false);
                    setCursoEmEdicao(null);
                  }}
                  className="text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                >
                  Voltar à lista
                </button>
              </div>

              {/* Informação de Sincronizada se for do AVA */}
              {cursoEmEdicao && cursoEmEdicao.officialName && (
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold uppercase text-[10px] block text-blue-400">
                      Matéria Sincronizada (AVA / Moodle)
                    </span>
                    <span className="font-medium">Nome Oficial: {cursoEmEdicao.officialName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-[10px] font-bold">
                    Sincronizada
                  </span>
                </div>
              )}

              {/* Nome de Exibição */}
              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                  Nome de Exibição da Matéria *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Ex: Gestão Financeira, Física I, Redação..."
                  className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] focus:border-[var(--app-primary)] outline-none"
                />
              </div>

              {/* Seletor de Ícone e Cor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5">
                    Ícone / Emoji
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl">
                    {PRESETS_ICONES.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setEditIcon(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition cursor-pointer ${
                          editIcon === emoji
                            ? "bg-[var(--app-primary)] text-white scale-110 shadow-xs"
                            : "hover:bg-[var(--app-card)]"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1.5">
                    Cor de Destaque
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl items-center">
                    {PALETA_CORES.map((cor) => (
                      <button
                        type="button"
                        key={cor}
                        onClick={() => setEditColor(cor)}
                        className={`w-7 h-7 rounded-full transition cursor-pointer flex items-center justify-center ${
                          editColor === cor ? "ring-3 ring-offset-2 ring-white scale-110" : ""
                        }`}
                        style={{ backgroundColor: cor }}
                      >
                        {editColor === cor && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Professor e Sala / Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                    Professor(a)
                  </label>
                  <input
                    type="text"
                    value={editProfessor}
                    onChange={(e) => setEditProfessor(e.target.value)}
                    placeholder="Ex: Profa. Dra. Mariana Siqueira"
                    className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                    Sala ou Link das Aulas
                  </label>
                  <input
                    type="text"
                    value={editRoom}
                    onChange={(e) => setEditRoom(e.target.value)}
                    placeholder="Ex: Sala 204 Bloco A, ou link Meet/Teams"
                    className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] outline-none"
                  />
                </div>
              </div>

              {/* Horário Semanal */}
              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                  Horário Semanal das Aulas
                </label>
                <input
                  type="text"
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
                  placeholder="Ex: Seg e Qua, 07:30 - 09:10"
                  className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] outline-none"
                />
              </div>

              {/* Plano de Ensino / Ementa */}
              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                  Plano de Ensino / Ementa da Disciplina
                </label>
                <textarea
                  rows={3}
                  value={editSyllabus}
                  onChange={(e) => setEditSyllabus(e.target.value)}
                  placeholder="Critérios de avaliação, objetivos pedagógicos e ementa resumida..."
                  className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] outline-none resize-none"
                />
              </div>

              {/* Anotações Gerais */}
              <div>
                <label className="block text-xs font-bold text-[var(--app-text)] mb-1">
                  Anotações Pessoais & Dicas
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Lembretes pessoais, critérios de presença, grupo de WhatsApp..."
                  className="w-full bg-[var(--app-bg)] border border-[var(--app-border)] rounded-xl px-3 py-2 text-xs text-[var(--app-text)] outline-none resize-none"
                />
              </div>

              {/* Toggles de Arquivamento e Ocultação */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--app-text)]">
                  <input
                    type="checkbox"
                    checked={editArchived}
                    onChange={(e) => setEditArchived(e.target.checked)}
                    className="rounded accent-[var(--app-primary)]"
                  />
                  <span>Arquivar Matéria (semestres concluídos)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--app-text)]">
                  <input
                    type="checkbox"
                    checked={editHidden}
                    onChange={(e) => setEditHidden(e.target.checked)}
                    className="rounded accent-[var(--app-primary)]"
                  />
                  <span>Ocultar da Trilha Principal</span>
                </label>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--app-border)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCriandoNovo(false);
                    setCursoEmEdicao(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--app-bg)] text-[var(--app-text-muted)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-extrabold bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white shadow-xs cursor-pointer"
                >
                  Salvar Matéria
                </button>
              </div>
            </form>
          ) : (
            // Lista de Matérias com Reordenação e Ações Rápidas
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {(["ativas", "arquivadas", "ocultas", "todas"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                      filtro === f
                        ? "bg-[var(--app-primary)] text-white shadow-xs"
                        : "bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                    }`}
                  >
                    {f} ({courses.filter((c) => {
                      if (f === "ativas") return !c.archived && !c.hidden;
                      if (f === "arquivadas") return c.archived;
                      if (f === "ocultas") return c.hidden;
                      return true;
                    }).length})
                  </button>
                ))}
              </div>

              {cursosFiltrados.length === 0 ? (
                <div className="text-center py-12 text-[var(--app-text-muted)] space-y-2">
                  <BookOpen className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-sm font-semibold">Nenhuma matéria nesta visualização.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cursosFiltrados.map((c, index) => {
                    return (
                      <div
                        key={c.id}
                        className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--app-card-secondary)] hover:border-[var(--app-border)] ${
                          c.archived ? "opacity-60 bg-[var(--app-bg)]/40" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          {/* Reordenação com botões up/down */}
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                              onClick={() => moverParaCima(courses.indexOf(c))}
                              disabled={courses.indexOf(c) === 0}
                              className="p-1 rounded hover:bg-[var(--app-bg)] text-[var(--app-text-muted)] disabled:opacity-20 cursor-pointer"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moverParaBaixo(courses.indexOf(c))}
                              disabled={courses.indexOf(c) >= courses.length - 1}
                              className="p-1 rounded hover:bg-[var(--app-bg)] text-[var(--app-text-muted)] disabled:opacity-20 cursor-pointer"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Ícone com Cor */}
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-2xs"
                            style={{ backgroundColor: `${c.color}25`, color: c.color }}
                          >
                            {c.icon || "📚"}
                          </div>

                          {/* Título e Metadados */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-[var(--app-text)] truncate">
                                {c.displayName || c.title}
                              </h4>

                              {c.officialName && (
                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                  Sincronizada
                                </span>
                              )}

                              {c.archived && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400">
                                  Arquivada
                                </span>
                              )}

                              {c.hidden && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-500/15 text-neutral-400">
                                  Oculta
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--app-text-muted)]">
                              {c.professor && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" /> {c.professor}
                                </span>
                              )}
                              {c.roomOrLink && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {c.roomOrLink}
                                </span>
                              )}
                              {c.weeklySchedule && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {c.weeklySchedule}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação na Linha */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                          {onSelectCourse && (
                            <button
                              onClick={() => {
                                onSelectCourse(c);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] hover:bg-[var(--app-primary)] hover:text-white text-xs font-bold transition cursor-pointer"
                            >
                              Abrir
                            </button>
                          )}

                          <button
                            onClick={() => iniciarEdicao(c)}
                            className="p-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] transition cursor-pointer"
                            title="Editar matéria"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => toggleArquivar(c)}
                            className="p-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
                            title={c.archived ? "Desarquivar" : "Arquivar"}
                          >
                            <Archive className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => toggleOcultar(c)}
                            className="p-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
                            title={c.hidden ? "Tornar visível" : "Ocultar"}
                          >
                            {c.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => handleExcluir(c)}
                            className="p-2 rounded-xl bg-[var(--app-bg)] hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                            title="Excluir matéria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
