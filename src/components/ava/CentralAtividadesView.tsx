import React, { useState, useMemo } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Search,
  Filter,
  Eye,
  Send,
  Calendar,
  User,
  Paperclip,
  Check,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { IfesAssignment, UserProfile, IfesCourse } from "../../types";
import {
  loadSubmissions,
  saveSubmission,
  ActivitySubmission,
} from "../../utils/assignmentSubmissions";
import { SubmitAssignmentModal } from "./SubmitAssignmentModal";

export type StatusAtividadeFiltro =
  | "todas"
  | "pendentes"
  | "em_andamento"
  | "entregues"
  | "concluidas"
  | "atrasadas";

interface CentralAtividadesViewProps {
  user: UserProfile;
  assignments: IfesAssignment[];
  courses?: IfesCourse[];
  onUpdateAssignmentStatus?: (assignmentId: string, newStatus: string) => void;
  onOpenAvaConnect?: () => void;
}

export const CentralAtividadesView: React.FC<CentralAtividadesViewProps> = ({
  user,
  assignments = [],
  courses = [],
  onUpdateAssignmentStatus,
  onOpenAvaConnect,
}) => {
  const [activeStatusTab, setActiveStatusTab] = useState<StatusAtividadeFiltro>("pendentes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [prazoFilter, setPrazoFilter] = useState<"todos" | "urgente" | "semana" | "atrasadas">("todos");

  // Submissões registradas
  const [submissions, setSubmissions] = useState<ActivitySubmission[]>(() => loadSubmissions());

  // Modal de Detalhes
  const [selectedDetailAssignment, setSelectedDetailAssignment] = useState<IfesAssignment | null>(null);

  // Modal de Submissão
  const [selectedSubmitAssignment, setSelectedSubmitAssignment] = useState<IfesAssignment | null>(null);

  // Mapeamento de status canônico
  const isAtrasada = (ass: IfesAssignment) => {
    if (ass.status === "submitted" || ass.status === "graded") {
      return false;
    }
    if (!ass.dueDate) return false;
    const dueTime = new Date(ass.dueDate).getTime();
    return dueTime < Date.now();
  };

  const getCanonicalStatus = (ass: IfesAssignment): "pendente" | "em_andamento" | "entregue" | "concluida" | "atrasada" => {
    const hasSubmission = submissions.some((s) => s.assignmentId === ass.id);
    if (ass.status === "graded") return "concluida";
    if (ass.status === "submitted" || hasSubmission) return "entregue";
    if (isAtrasada(ass)) return "atrasada";
    if (ass.status === "urgent") return "em_andamento";
    return "pendente";
  };

  // Contagens por aba de status
  const counts = useMemo(() => {
    const res = {
      todas: assignments.length,
      pendentes: 0,
      em_andamento: 0,
      entregues: 0,
      concluidas: 0,
      atrasadas: 0,
    };
    for (const a of assignments) {
      const st = getCanonicalStatus(a);
      if (st === "pendente") res.pendentes++;
      else if (st === "em_andamento") res.em_andamento++;
      else if (st === "entregue") res.entregues++;
      else if (st === "concluida") res.concluidas++;
      else if (st === "atrasada") res.atrasadas++;
    }
    return res;
  }, [assignments, submissions]);

  // Filtragem combinada
  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const st = getCanonicalStatus(item);

      // 1. Filtro de Aba
      if (activeStatusTab === "pendentes" && st !== "pendente") return false;
      if (activeStatusTab === "em_andamento" && st !== "em_andamento") return false;
      if (activeStatusTab === "entregues" && st !== "entregue") return false;
      if (activeStatusTab === "concluidas" && st !== "concluida") return false;
      if (activeStatusTab === "atrasadas" && st !== "atrasada") return false;

      // 2. Filtro de Disciplina
      if (selectedCourseId !== "all") {
        const matchesCourse =
          item.courseId === selectedCourseId ||
          item.courseName?.toLowerCase().includes(selectedCourseId.toLowerCase());
        if (!matchesCourse) return false;
      }

      // 3. Filtro de Prazo
      if (prazoFilter === "atrasadas" && st !== "atrasada") return false;
      if (prazoFilter === "urgente") {
        if (!item.dueDate) return false;
        const diffMs = new Date(item.dueDate).getTime() - Date.now();
        if (diffMs < 0 || diffMs > 48 * 3600 * 1000) return false;
      }
      if (prazoFilter === "semana") {
        if (!item.dueDate) return false;
        const diffMs = new Date(item.dueDate).getTime() - Date.now();
        if (diffMs < 0 || diffMs > 7 * 86400 * 1000) return false;
      }

      // 4. Busca por texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(term);
        const matchesCourse = item.courseName?.toLowerCase().includes(term);
        const matchesDesc = item.description?.toLowerCase().includes(term);
        if (!matchesTitle && !matchesCourse && !matchesDesc) return false;
      }

      return true;
    });
  }, [assignments, activeStatusTab, selectedCourseId, prazoFilter, searchTerm, submissions]);

  // Lista única de matérias para o dropdown de filtro
  const uniqueCourseNames = useMemo(() => {
    const names = new Set<string>();
    for (const a of assignments) {
      if (a.courseName) names.add(a.courseName);
    }
    for (const c of courses) {
      if (c.name) names.add(c.name);
    }
    return Array.from(names);
  }, [assignments, courses]);

  const handleSubmissionSuccess = (updatedAssignment: IfesAssignment) => {
    setSubmissions(loadSubmissions());
    onUpdateAssignmentStatus?.(updatedAssignment.id, "submitted");
    setSelectedSubmitAssignment(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal da Central de Atividades */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20 text-xs font-black uppercase tracking-wider">
              Área Acadêmica Oficial
            </span>
            <span className="text-xs font-bold text-[var(--app-text-muted)]">
              {assignments.length} Atividades Cadastradas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-text)] tracking-tight">
            Central de Atividades Escolares
          </h1>
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)] leading-relaxed">
            Consolidação de trabalhos, tarefas, projetos e avaliações oficiais do IFES.
            Acompanhe prazos rigorosos, anexe arquivos de entrega e monitore o status acadêmico sem módulos.
          </p>
        </div>

        {user.ifesAccount?.connected && (
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[11px] font-mono text-emerald-500 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado com AVA IFES
            </span>
            <span className="text-[10px] text-[var(--app-text-muted)]">
              Campus {user.ifesAccount.campusName || "Cefor / Serra"}
            </span>
          </div>
        )}
      </div>

      {/* Navegação por Status de Atividade (PARTE 4.2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--app-border)]">
        {[
          { id: "pendentes" as StatusAtividadeFiltro, label: "Pendentes", count: counts.pendentes, color: "text-blue-500", bg: "bg-blue-500/10" },
          { id: "em_andamento" as StatusAtividadeFiltro, label: "Em Andamento", count: counts.em_andamento, color: "text-amber-500", bg: "bg-amber-500/10" },
          { id: "entregues" as StatusAtividadeFiltro, label: "Entregues", count: counts.entregues, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { id: "concluidas" as StatusAtividadeFiltro, label: "Concluídas / Notas", count: counts.concluidas, color: "text-purple-500", bg: "bg-purple-500/10" },
          { id: "atrasadas" as StatusAtividadeFiltro, label: "Atrasadas", count: counts.atrasadas, color: "text-rose-500", bg: "bg-rose-500/10" },
          { id: "todas" as StatusAtividadeFiltro, label: "Todas", count: counts.todas, color: "text-[var(--app-text)]", bg: "bg-[var(--app-card-secondary)]" },
        ].map((tab) => {
          const isSelected = activeStatusTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 cursor-pointer border ${
                isSelected
                  ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-xs"
                  : "bg-[var(--app-card)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border-[var(--app-border)] hover:bg-[var(--app-card-secondary)]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : `${tab.bg} ${tab.color}`
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Barra de Filtros e Busca (PARTE 4.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Campo de Busca */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-[var(--app-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, matéria ou palavras-chave..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs text-[var(--app-text)] placeholder-[var(--app-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/30"
          />
        </div>

        {/* Filtro por Matéria */}
        <div className="sm:col-span-4">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/30 cursor-pointer"
          >
            <option value="all">Todas as Matérias</option>
            {uniqueCourseNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Prazo */}
        <div className="sm:col-span-3">
          <select
            value={prazoFilter}
            onChange={(e) => setPrazoFilter(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-primary)]/30 cursor-pointer"
          >
            <option value="todos">Todos os Prazos</option>
            <option value="urgente">Urgentes (&lt; 48 horas)</option>
            <option value="semana">Para esta Semana</option>
            <option value="atrasadas">Apenas Vencidas</option>
          </select>
        </div>
      </div>

      {/* Lista de Atividades Escolares (Cards) */}
      {filteredAssignments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <h3 className="font-bold text-base text-[var(--app-text)]">
            Nenhuma atividade encontrada neste filtro
          </h3>
          <p className="text-xs text-[var(--app-text-muted)] max-w-sm mx-auto">
            Você está em dia com todas as atividades escolares selecionadas nesta categoria!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAssignments.map((ass) => {
            const canonicalSt = getCanonicalStatus(ass);
            const userSub = submissions.find((s) => s.assignmentId === ass.id);

            const isDueSoon = ass.dueDate
              ? new Date(ass.dueDate).getTime() - Date.now() < 48 * 3600 * 1000 &&
                new Date(ass.dueDate).getTime() > Date.now()
              : false;

            return (
              <div
                key={ass.id}
                className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                {/* Cabeçalho do Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-[11px] font-bold text-[var(--app-primary)] truncate max-w-[220px]">
                      {ass.courseName || "Disciplina Oficial"}
                    </span>

                    {/* Status Badge */}
                    {canonicalSt === "concluida" && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Nota: {(ass as any).grade || ass.weight || "Concluída"}
                      </span>
                    )}
                    {canonicalSt === "entregue" && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Entregue
                      </span>
                    )}
                    {canonicalSt === "atrasada" && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-black uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Prazo Expirado
                      </span>
                    )}
                    {canonicalSt === "em_andamento" && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Em Andamento
                      </span>
                    )}
                    {canonicalSt === "pendente" && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase">
                        Pendente
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-base text-[var(--app-text)] leading-snug">
                    {ass.title}
                  </h3>

                  <p className="text-xs text-[var(--app-text-muted)] line-clamp-2 leading-relaxed">
                    {ass.description || "Atividade avaliativa acadêmica para consolidação do conteúdo oficial."}
                  </p>
                </div>

                {/* Metadados: Prazo, Professor, Arquivo */}
                <div className="pt-2 border-t border-[var(--app-border)]/60 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--app-text-muted)] font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--app-primary)]" />
                      <span>
                        Prazo:{" "}
                        <strong
                          className={
                            canonicalSt === "atrasada"
                              ? "text-rose-500 font-bold"
                              : isDueSoon
                              ? "text-amber-500 font-bold"
                              : "text-[var(--app-text)] font-semibold"
                          }
                        >
                          {ass.dueDate ? new Date(ass.dueDate).toLocaleDateString("pt-BR") : "A definir"}
                        </strong>
                      </span>
                    </div>

                    {ass.weight && (
                      <span className="px-2 py-0.5 rounded-md bg-[var(--app-card-secondary)] text-[10px] font-bold">
                        Peso: {ass.weight}
                      </span>
                    )}
                  </div>

                  {userSub && userSub.fileName && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Enviado: {userSub.fileName}</span>
                      <span className="text-[10px] text-emerald-500 ml-auto shrink-0">
                        {new Date(userSub.submittedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailAssignment(ass)}
                    className="flex-1 py-2 rounded-xl bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-secondary)]/80 text-[var(--app-text)] font-bold text-xs border border-[var(--app-border)] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Detalhes</span>
                  </button>

                  {canonicalSt !== "concluida" && canonicalSt !== "entregue" && (
                    <button
                      type="button"
                      onClick={() => setSelectedSubmitAssignment(ass)}
                      className="flex-1 py-2 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Enviar Atividade</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes da Atividade */}
      {selectedDetailAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] p-6 text-[var(--app-text)] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
              <div>
                <span className="text-[11px] font-bold text-[var(--app-primary)] uppercase tracking-wider block">
                  {selectedDetailAssignment.courseName}
                </span>
                <h3 className="text-lg font-black">{selectedDetailAssignment.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDetailAssignment(null)}
                className="p-1 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <h4 className="font-bold text-[var(--app-text-muted)] uppercase text-[10px] tracking-wider">
                  Descrição & Instruções da Entrega
                </h4>
                <p className="mt-1 text-sm text-[var(--app-text)] whitespace-pre-wrap">
                  {selectedDetailAssignment.description ||
                    "Esta atividade deve ser realizada e entregue conforme as diretrizes do plano pedagógico do IFES."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
                <div>
                  <span className="text-[10px] text-[var(--app-text-muted)] uppercase font-bold block">
                    Prazo Limite
                  </span>
                  <span className="font-bold text-sm text-[var(--app-text)]">
                    {selectedDetailAssignment.dueDate
                      ? new Date(selectedDetailAssignment.dueDate).toLocaleString("pt-BR")
                      : "Sem prazo fixado"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--app-text-muted)] uppercase font-bold block">
                    Peso Avaliativo
                  </span>
                  <span className="font-bold text-sm text-[var(--app-text)]">
                    {selectedDetailAssignment.weight || "10 pontos"}
                  </span>
                </div>
              </div>

              {selectedDetailAssignment.link && (
                <div className="pt-1">
                  <a
                    href={selectedDetailAssignment.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--app-primary)] hover:underline"
                  >
                    <span>Abrir sala original no AVA IFES Moodle</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--app-border)]">
              <button
                onClick={() => setSelectedDetailAssignment(null)}
                className="px-4 py-2 rounded-xl border border-[var(--app-border)] text-xs font-bold hover:bg-[var(--app-card-secondary)] cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setSelectedSubmitAssignment(selectedDetailAssignment);
                  setSelectedDetailAssignment(null);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold hover:bg-[var(--app-primary-hover)] cursor-pointer"
              >
                Enviar Documento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Envio com Anexo de Arquivo */}
      {selectedSubmitAssignment && (
        <SubmitAssignmentModal
          isOpen={!!selectedSubmitAssignment}
          onClose={() => setSelectedSubmitAssignment(null)}
          assignment={selectedSubmitAssignment}
          user={user}
          onSuccess={handleSubmissionSuccess}
        />
      )}
    </div>
  );
};
