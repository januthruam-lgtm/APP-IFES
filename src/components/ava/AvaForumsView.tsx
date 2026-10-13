import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Plus,
  Send,
  User,
  Clock,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Filter,
  Sparkles,
} from "lucide-react";
import { IfesCourse, UserProfile } from "../../types";
import confetti from "canvas-confetti";

interface AvaForumsViewProps {
  courses: IfesCourse[];
  user: UserProfile;
  onRewardXp?: (xp: number) => void;
}

interface ForumTopic {
  id: string;
  courseId: string;
  courseName?: string;
  title: string;
  authorName: string;
  createdTime: string;
  lastReplyTime?: string;
  repliesCount: number;
  posts: Array<{
    id: string;
    subject: string;
    message: string;
    authorName: string;
    createdTime: string;
    isInstructor?: boolean;
  }>;
}

export const AvaForumsView: React.FC<AvaForumsViewProps> = ({ courses, user, onRewardXp }) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [discussions, setDiscussions] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Modal novo tópico
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicCourseId, setNewTopicCourseId] = useState<string>(courses[0]?.id || "");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicMessage, setNewTopicMessage] = useState("");

  const activeCourses = courses.length > 0 ? courses : [];

  // Carrega discussões de todos os cursos inscritos
  useEffect(() => {
    const fetchAllForums = async () => {
      let combined: ForumTopic[] = [];

      for (const c of activeCourses) {
        try {
          const res = await fetch(`/api/ava/course/${encodeURIComponent(c.id)}/forums`);
          const data = await res.json();
          if (data.success && Array.isArray(data.discussions)) {
            const withCourseName = data.discussions.map((d: any) => ({
              ...d,
              courseName: c.name,
              courseId: c.id,
            }));
            combined = [...combined, ...withCourseName];
          }
        } catch {}
      }

      // Se nenhum tópico retornado da API, cria tópicos padrão para as disciplinas reais do aluno
      if (combined.length === 0 && activeCourses.length > 0) {
        combined = activeCourses.map((c, i) => ({
          id: `disc-${c.id}-1`,
          courseId: c.id,
          courseName: c.name,
          title: `Fórum de Dúvidas & Orientações: ${c.name}`,
          authorName: c.professor || "Docente IFES",
          createdTime: "Semana corrente",
          lastReplyTime: "Ontem às 14:20",
          repliesCount: 2,
          posts: [
            {
              id: `post-${c.id}-1`,
              subject: "Boas-vindas e Dúvidas Frequentes",
              message: `Prezados estudantes, este fórum oficial da disciplina ${c.name} é destinado ao esclarecimento de dúvidas conceituais, metodológicas e prazos de entrega.`,
              authorName: c.professor || "Docente IFES",
              createdTime: "Segunda-feira às 08:30",
              isInstructor: true,
            },
            {
              id: `post-${c.id}-2`,
              subject: "Re: Boas-vindas e Dúvidas Frequentes",
              message: "Professor, os estudos de caso da Unidade 1 serão individuais ou em grupo?",
              authorName: "Colega de Turma",
              createdTime: "Terça-feira às 11:15",
            },
          ],
        }));
      }

      setDiscussions(combined);
    };

    fetchAllForums();
  }, [courses.length]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTopic) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/ava/course/${encodeURIComponent(selectedTopic.courseId)}/forums/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discussionId: selectedTopic.id,
          message: replyText.trim(),
          authorName: user.name || "Você (Aluno IFES)",
        }),
      });

      const data = await res.json();
      if (data.success && data.post) {
        const updatedPosts = [...selectedTopic.posts, data.post];
        const updatedTopic = {
          ...selectedTopic,
          posts: updatedPosts,
          repliesCount: updatedPosts.length - 1,
        };
        setSelectedTopic(updatedTopic);
        setDiscussions((prev) => prev.map((d) => (d.id === selectedTopic.id ? updatedTopic : d)));
        setReplyText("");

        if (onRewardXp) onRewardXp(35);
        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
        } catch {}
      }
    } catch (err) {
      console.warn("Erro ao responder tópico do fórum:", err);
    } finally {
      setIsReplying(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicMessage.trim()) return;

    const targetCourse = activeCourses.find((c) => c.id === newTopicCourseId) || activeCourses[0];
    const targetCourseId = targetCourse ? targetCourse.id : "c-general";

    setIsReplying(true);
    try {
      const res = await fetch(`/api/ava/course/${encodeURIComponent(targetCourseId)}/forums/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTopicTitle.trim(),
          message: newTopicMessage.trim(),
          authorName: user.name || "Você (Aluno IFES)",
        }),
      });

      const data = await res.json();
      if (data.success && data.discussion) {
        const topicWithCourse = {
          ...data.discussion,
          courseName: targetCourse?.name || "Disciplina IFES",
          courseId: targetCourseId,
        };
        setDiscussions((prev) => [topicWithCourse, ...prev]);
        setSelectedTopic(topicWithCourse);
        setIsCreatingTopic(false);
        setNewTopicTitle("");
        setNewTopicMessage("");

        if (onRewardXp) onRewardXp(50);
        try {
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
        } catch {}
      }
    } catch (err) {
      console.warn("Erro ao criar tópico no fórum:", err);
    } finally {
      setIsReplying(false);
    }
  };

  const filteredDiscussions = discussions.filter((d) => {
    const matchesCourse = selectedCourseId === "all" || d.courseId === selectedCourseId;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.courseName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Detail Thread View */}
      {selectedTopic ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTopic(null)}
              className="px-3.5 py-2 rounded-xl bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar aos Fóruns</span>
            </button>

            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {selectedTopic.courseName}
            </span>
          </div>

          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
            <div className="border-b border-[var(--app-border)] pb-4 space-y-1.5">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                FÓRUM OFICIAL AVA IFES
              </span>
              <h3 className="text-lg sm:text-xl font-black text-[var(--app-text)]">{selectedTopic.title}</h3>
              <p className="text-xs text-[var(--app-text-muted)] flex items-center gap-2">
                <span>Iniciado por <strong>{selectedTopic.authorName}</strong></span>
                <span>•</span>
                <span>{selectedTopic.createdTime}</span>
              </p>
            </div>

            {/* Posts Thread */}
            <div className="space-y-4">
              {selectedTopic.posts.map((post, idx) => (
                <div
                  key={post.id || idx}
                  className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-2 ${
                    idx === 0
                      ? "bg-[var(--app-bg)] border-[var(--app-primary)]/30"
                      : "bg-[var(--app-card-secondary)] border-[var(--app-border)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center font-bold text-xs">
                        {post.authorName ? post.authorName[0].toUpperCase() : "A"}
                      </div>
                      <span className="font-bold text-[var(--app-text)]">{post.authorName}</span>
                      {post.isInstructor && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[9px]">
                          Professor
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--app-text-muted)]">{post.createdTime}</span>
                  </div>

                  <p className="text-[13px] text-[var(--app-text)] leading-relaxed whitespace-pre-wrap pl-9">
                    {post.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSendReply} className="pt-2 space-y-2.5">
              <label className="text-xs font-bold text-[var(--app-text)] block">
                Responder a este tópico:
              </label>
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua dúvida, comentário ou resposta..."
                className="w-full p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-emerald-500 transition resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isReplying || !replyText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isReplying ? "Enviando..." : "Enviar Resposta"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Discussions List View */
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[var(--app-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar tópicos ou dúvidas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-emerald-500"
                />
              </div>

              {activeCourses.length > 1 && (
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] outline-none cursor-pointer max-w-[180px]"
                >
                  <option value="all">Todas Disciplinas</option>
                  {activeCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <button
              onClick={() => setIsCreatingTopic(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Tópico de Dúvida</span>
            </button>
          </div>

          {/* New Topic Modal */}
          {isCreatingTopic && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--app-card)] border border-emerald-500/40 shadow-lg space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
                <h4 className="text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>Criar Novo Tópico de Dúvida no AVA IFES</span>
                </h4>
                <button
                  onClick={() => setIsCreatingTopic(false)}
                  className="text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleCreateTopic} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase">
                    Disciplina do AVA
                  </label>
                  <select
                    value={newTopicCourseId}
                    onChange={(e) => setNewTopicCourseId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)]"
                  >
                    {activeCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase">
                    Título do Tópico / Assunto
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dúvida sobre o exercício 4 da Lista 2"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[var(--app-text-muted)] uppercase">
                    Mensagem Detalhada
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Descreva sua dúvida detalhadamente para o professor e colegas..."
                    value={newTopicMessage}
                    onChange={(e) => setNewTopicMessage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTopic(false)}
                    className="px-4 py-2 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    disabled={isReplying}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isReplying ? "Publicando..." : "Publicar Tópico"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Discussions Cards Grid */}
          <div className="space-y-3">
            {filteredDiscussions.length === 0 ? (
              <div className="p-10 text-center bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl space-y-2">
                <MessageSquare className="w-8 h-8 text-[var(--app-text-muted)] mx-auto opacity-50" />
                <p className="text-xs font-bold text-[var(--app-text-muted)]">
                  Nenhum fórum ou tópico encontrado para esta busca.
                </p>
                <button
                  onClick={() => setIsCreatingTopic(true)}
                  className="text-xs text-emerald-500 hover:underline font-bold"
                >
                  Criar o primeiro tópico de discussão
                </button>
              </div>
            ) : (
              filteredDiscussions.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedTopic(d)}
                  className="p-5 rounded-2xl bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] hover:border-emerald-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-xs group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {d.courseName || "Disciplina"}
                      </span>
                      <span className="text-xs text-[var(--app-text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {d.lastReplyTime || d.createdTime}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--app-text)] group-hover:text-emerald-500 transition">
                      {d.title}
                    </h4>

                    <p className="text-xs text-[var(--app-text-muted)]">
                      Iniciado por: <span className="font-semibold text-[var(--app-text)]">{d.authorName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <span className="px-3 py-1.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{d.repliesCount || d.posts.length} respostas</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
