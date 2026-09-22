import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Sparkles,
  Clipboard,
  RefreshCw,
  Search,
  Radio,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import { IfesCourse } from "../types";
import { saveSyncedCourses, isMockOrPlaceholderCourse } from "../utils/courseSync";
import { avaApiClient } from "../utils/avaApi";
import { parseQAcademicoContent } from "../utils/qacademicoParser";
import { qacademicoApi } from "../utils/qacademicoApi";
import { saveQAcademicoGrades, saveQAcademicoAccount, saveQAcademicoSchedules } from "../utils/qacademicoStorage";

interface IfesProfileCoursesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  courses: IfesCourse[];
  onSaveCourses: (updatedCourses: IfesCourse[]) => void;
  campusName: string;
}

export const IfesProfileCoursesManager: React.FC<IfesProfileCoursesManagerProps> = ({
  isOpen,
  onClose,
  courses,
  onSaveCourses,
  campusName,
}) => {
  // Always filter out any residual mock or fictitious courses
  const [currentCourses, setCurrentCourses] = useState<IfesCourse[]>(() =>
    courses.filter((c) => !isMockOrPlaceholderCourse(c))
  );
  const [activeTab, setActiveTab] = useState<"manage" | "apiSync" | "paste" | "qacademico" | "addManual">("manage");
  const [pasteText, setPasteText] = useState("");
  const [qacadText, setQacadText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncingApi, setIsSyncingApi] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");

  // Manual course input state
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseProfessor, setNewCourseProfessor] = useState("");
  const [newCourseProgress, setNewCourseProgress] = useState(0);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleRemoveCourse = (id: string) => {
    setCurrentCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearAll = () => {
    setCurrentCourses([]);
    setFeedbackMessage("Todas as disciplinas foram limpas. Sincronize com o AVA ou Q-Acadêmico para carregar sua grade.");
    setFeedbackType("success");
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newCourse: IfesCourse = {
      id: `ifes-real-${Date.now()}`,
      name: newCourseName.trim(),
      code: newCourseCode.trim() || `IFES-${newCourseName.substring(0, 3).toUpperCase()}`,
      professor: newCourseProfessor.trim() || "Docente IFES",
      campus: campusName || "IFES - AVA",
      progressPercent: Math.min(100, Math.max(0, Number(newCourseProgress) || 0)),
    };

    setCurrentCourses((prev) => [newCourse, ...prev]);
    setNewCourseName("");
    setNewCourseCode("");
    setNewCourseProfessor("");
    setNewCourseProgress(0);
    setFeedbackMessage(`Disciplina "${newCourse.name}" adicionada.`);
    setFeedbackType("success");
    setActiveTab("manage");
  };

  const handleSyncFromApi = async () => {
    setIsSyncingApi(true);
    setFeedbackMessage(null);
    try {
      const res = await avaApiClient.sync();
      if (res.courses && Array.isArray(res.courses)) {
        const real = res.courses.filter((c) => !isMockOrPlaceholderCourse(c));
        setCurrentCourses(real);
        setFeedbackMessage(`Sincronização via API Moodle concluída! ${real.length} disciplina(s) carregada(s).`);
        setFeedbackType("success");
        setActiveTab("manage");
      } else {
        setFeedbackMessage("Nenhuma disciplina retornada pela API do AVA IFES no momento.");
        setFeedbackType("error");
      }
    } catch (err: any) {
      setFeedbackMessage(err?.message || "Erro ao conectar com a API do AVA IFES.");
      setFeedbackType("error");
    } finally {
      setIsSyncingApi(false);
    }
  };

  const handleExtractFromPastedText = async () => {
    if (!pasteText.trim()) return;
    setIsExtracting(true);
    setFeedbackMessage(null);

    try {
      const res = await fetch("/api/ava/import-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: pasteText,
          campusName: campusName || "IFES - AVA",
        }),
      });

      const data = await res.json();
      if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
        const normalized = data.courses
          .filter((c: IfesCourse) => !isMockOrPlaceholderCourse(c))
          .map((c: IfesCourse) => ({
            ...c,
            progressPercent: Number(c.progressPercent) || 0,
          }));
        setCurrentCourses(normalized);
        setFeedbackMessage(`Identificadas com sucesso ${normalized.length} matéria(s) reais do seu AVA!`);
        setFeedbackType("success");
        setActiveTab("manage");
      } else {
        // Line-by-line fallback
        const lines = pasteText
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 3 && !l.startsWith("http") && !l.includes("Detalhes"));

        const extracted: IfesCourse[] = [];
        lines.forEach((line, index) => {
          if (!["Perfil", "Administração", "Mensagens", "Notas", "Painel", "Página inicial"].includes(line)) {
            extracted.push({
              id: `extracted-${index}-${Date.now()}`,
              name: line,
              code: `IFES-${index + 1}`,
              professor: "Docente IFES",
              campus: campusName || "IFES - AVA",
              progressPercent: 0,
            });
          }
        });

        const realExtracted = extracted.filter((c) => !isMockOrPlaceholderCourse(c));
        if (realExtracted.length > 0) {
          setCurrentCourses(realExtracted);
          setFeedbackMessage(`Importadas ${realExtracted.length} matérias do texto.`);
          setFeedbackType("success");
          setActiveTab("manage");
        } else {
          setFeedbackMessage("Não foi possível extrair matérias válidas do texto.");
          setFeedbackType("error");
        }
      }
    } catch {
      setFeedbackMessage("Erro ao processar o texto do AVA.");
      setFeedbackType("error");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtractFromQAcademico = async () => {
    if (!qacadText.trim()) return;
    setIsExtracting(true);
    setFeedbackMessage(null);

    try {
      // 1. Client parser
      const clientParsed = parseQAcademicoContent(qacadText, campusName);

      // 2. Server parse report
      const serverRes = await qacademicoApi.parseReport(qacadText, campusName);

      const finalGrades = serverRes.grades && serverRes.grades.length > 0 ? serverRes.grades : clientParsed.grades;
      const finalCourses = serverRes.courses && serverRes.courses.length > 0 ? serverRes.courses : clientParsed.courses;
      const finalAccount = serverRes.account || clientParsed.account;
      const finalSchedules = serverRes.schedules || clientParsed.schedules;

      if (finalGrades.length > 0) {
        saveQAcademicoGrades(finalGrades);
      }
      if (finalAccount) {
        saveQAcademicoAccount({
          connected: true,
          campusUrl: "https://academico.ifes.edu.br/qacademico",
          portalUrl: finalAccount.portalUrl || "https://academico.ifes.edu.br/qacademico/index.asp?t=2000",
          lastSync: finalAccount.lastSync || new Date().toISOString(),
          matricula: finalAccount.matricula || "",
          fullname: finalAccount.fullname || "Estudante IFES",
          ...finalAccount,
        });
      }
      if (finalSchedules && finalSchedules.length > 0) {
        saveQAcademicoSchedules(finalSchedules);
      }

      if (finalCourses.length > 0) {
        // Merge with existing, avoiding duplicates by code or name
        setCurrentCourses((prev) => {
          const map = new Map<string, IfesCourse>();
          prev.forEach((c) => map.set(c.name.toLowerCase(), c));
          finalCourses.forEach((c) => map.set(c.name.toLowerCase(), c));
          return Array.from(map.values());
        });

        setFeedbackMessage(
          `Ponte Q-Acadêmico concluída! ${finalCourses.length} disciplina(s) e notas importadas com sucesso.`
        );
        setFeedbackType("success");
        setQacadText("");
        setActiveTab("manage");
      } else {
        setFeedbackMessage("Não foi possível identificar matérias no texto do Q-Acadêmico.");
        setFeedbackType("error");
      }
    } catch (e: any) {
      setFeedbackMessage(e?.message || "Erro ao importar do Q-Acadêmico.");
      setFeedbackType("error");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveAndClose = () => {
    const realCourses = currentCourses.filter((c) => !isMockOrPlaceholderCourse(c));
    saveSyncedCourses(realCourses);
    onSaveCourses(realCourses);
    onClose();
  };

  const filteredCurrentCourses = currentCourses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[var(--app-border)] flex items-center justify-between bg-[var(--app-card-secondary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/15 border border-[var(--app-primary)]/30 flex items-center justify-center text-[var(--app-primary)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--app-text)] tracking-tight">
                Gerenciador de Disciplinas do AVA IFES
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                Sincronização estrita via API Moodle do IFES (sem matérias fictícias)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card)] rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--app-border)] bg-[var(--app-card-secondary)] px-4 pt-2 gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("manage")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "manage"
                ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Disciplinas do Perfil ({currentCourses.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("apiSync")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "apiSync"
                ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Radio className="w-4 h-4" />
            Sincronização Direta API
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "paste"
                ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Clipboard className="w-4 h-4" />
            Importar do AVA Moodle
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("qacademico")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "qacademico"
                ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Importar do Q-Acadêmico
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addManual")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "addManual"
                ? "border-[var(--app-primary)] text-[var(--app-primary)]"
                : "border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Plus className="w-4 h-4" />
            Cadastrar Disciplina
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {feedbackMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                feedbackType === "success"
                  ? "bg-[var(--app-success)]/10 text-[var(--app-success)] border border-[var(--app-success)]/20"
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              }`}
            >
              {feedbackType === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <X className="w-4 h-4 shrink-0" />
              )}
              {feedbackMessage}
            </div>
          )}

          {/* TAB 1: MANAGE CURRENT REAL COURSES */}
          {activeTab === "manage" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[var(--app-text-muted)] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrar matérias por nome ou código..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                  />
                </div>

                {currentCourses.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Limpar Grade
                  </button>
                )}
              </div>

              {/* Course Items List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredCurrentCourses.length === 0 ? (
                  <div className="text-center py-10 bg-[var(--app-card-secondary)] rounded-2xl border border-[var(--app-border)] space-y-2 p-4">
                    <BookOpen className="w-8 h-8 text-[var(--app-text-muted)] mx-auto" />
                    <p className="text-xs font-bold text-[var(--app-text)]">
                      Nenhuma matéria cadastrada
                    </p>
                    <p className="text-[11px] text-[var(--app-text-muted)] max-w-md mx-auto">
                      Todas as matérias de exemplo foram removidas. Utilize a aba{" "}
                      <strong className="text-[var(--app-primary)]">"Sincronização Direta API"</strong> para conectar ao Moodle do seu campus ou importe seu histórico pelo Q-Acadêmico.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("apiSync")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-extrabold rounded-xl transition cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" /> Sincronizar via API Moodle
                    </button>
                  </div>
                ) : (
                  filteredCurrentCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] rounded-xl flex items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                          {c.code ? c.code.substring(0, 3) : "IF"}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[var(--app-text)] leading-snug">{c.name}</p>
                          <p className="text-[10px] text-[var(--app-text-muted)] font-mono">
                            {c.code || "IFES"} {c.professor ? `• ${c.professor}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[var(--app-primary)] font-mono">
                          {c.progressPercent || 0}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(c.id)}
                          className="p-1.5 text-[var(--app-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Remover da grade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DIRECT API SYNC */}
          {activeTab === "apiSync" && (
            <div className="space-y-4 bg-[var(--app-card-secondary)] p-5 rounded-2xl border border-[var(--app-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--app-text)]">Sincronização Direta com o AVA IFES</h4>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    Conexão oficial com WebServices REST do Moodle do IFES
                  </p>
                </div>
              </div>

              <div className="text-xs text-[var(--app-text-muted)] space-y-2 border-t border-[var(--app-border)] pt-3">
                <p>
                  O aplicativo faz chamadas diretas aos endpoints do Moodle:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[var(--app-text-muted)] text-[11px] font-mono">
                  <li>core_enrol_get_users_courses (Minhas Disciplinas)</li>
                  <li>core_calendar_get_action_events_by_timesort (Prazos e Tarefas)</li>
                  <li>gradereport_user_get_grades_table (Quadro de Notas)</li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSyncFromApi}
                  disabled={isSyncingApi}
                  className="w-full py-3 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingApi ? "animate-spin" : ""}`} />
                  {isSyncingApi ? "Consultando API Moodle IFES..." : "Sincronizar Agora com a API"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PASTE RAW TEXT FROM AVA PROFILE */}
          {activeTab === "paste" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--app-text)] flex items-center gap-2">
                  <Clipboard className="w-4 h-4 text-[var(--app-primary)]" />
                  Importar do AVA Moodle (Texto ou Meus Cursos)
                </label>
                <p className="text-[11px] text-[var(--app-text-muted)]">
                  Acesse seu AVA Moodle no navegador, vá em <strong>Meus Cursos</strong> ou <strong>Painel</strong>, selecione os nomes das disciplinas e cole abaixo:
                </p>
                <textarea
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Cole aqui as disciplinas do seu perfil do AVA IFES...`}
                  className="w-full p-3 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-2xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleExtractFromPastedText}
                disabled={isExtracting || !pasteText.trim()}
                className="w-full py-2.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processando com API...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Importar Disciplinas Reais
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3.5: IMPORT FROM Q-ACADÊMICO */}
          {activeTab === "qacademico" && (
            <div className="space-y-4">
              <div className="p-4 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[var(--app-primary)]" /> Ponte de Dados Q-Acadêmico Web IFES
                  </span>
                  <a
                    href="https://academico.ifes.edu.br/qacademico/index.asp?t=2000"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <span>Abrir Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Acesse o Q-Acadêmico (<code>index.asp?t=2000</code>), abra a tela de <strong>Boletim Escolar (t=2071)</strong> ou <strong>Horários (t=2010)</strong>, copie o conteúdo e cole abaixo. As matérias e notas por etapa serão sincronizadas com o seu perfil!
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--app-text)]">
                  Texto ou Tabela copiada do Q-Acadêmico IFES:
                </label>
                <textarea
                  rows={6}
                  value={qacadText}
                  onChange={(e) => setQacadText(e.target.value)}
                  placeholder="Cole aqui o conteúdo copiado da tela de Boletim Escolar ou Horários do Q-Acadêmico IFES..."
                  className="w-full p-3 bg-[var(--app-card-secondary)] border border-[var(--app-border)] rounded-2xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExtractFromQAcademico}
                  disabled={isExtracting || !qacadText.trim()}
                  className="w-full py-2.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processando dados...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Importar e Sincronizar Disciplinas
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MANUAL ENTRY OF REAL SUBJECT */}
          {activeTab === "addManual" && (
            <form onSubmit={handleAddCourse} className="space-y-3 bg-[var(--app-card-secondary)] p-4 rounded-2xl border border-[var(--app-border)]">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--app-text)]">Nome da Disciplina Oficial</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Introdução à Administração, Cálculo I, etc."
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--app-text)]">Código no AVA (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: ADM-001"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--app-text)]">Professor(a) (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Prof. João Silva"
                    value={newCourseProfessor}
                    onChange={(e) => setNewCourseProfessor(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-xl text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Adicionar à Minha Grade
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--app-border)] flex items-center justify-between bg-[var(--app-card-secondary)]">
          <span className="text-xs text-[var(--app-text-muted)] font-mono">
            {currentCourses.length} disciplina(s) ativa(s)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-[var(--app-card)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2 bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Salvar Grade no Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
