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
  Layers,
  ArrowRight,
  School,
  ExternalLink,
} from "lucide-react";
import { IfesCourse } from "../types";
import {
  saveSyncedCourses,
  isMockOrPlaceholderCourse,
  IFES_CURRICULUM_PRESETS,
  extractCoursesFromAvaText,
} from "../utils/courseSync";
import { avaApiClient } from "../utils/avaApi";
import { avaConnectionManager } from "../utils/avaConnectionManager";

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
  const [activeTab, setActiveTab] = useState<"manage" | "paste" | "presets" | "apiSync" | "addManual">("manage");
  const [pasteText, setPasteText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncingApi, setIsSyncingApi] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error">("success");

  // Extracted preview list
  const [extractedPreview, setExtractedPreview] = useState<IfesCourse[]>([]);

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
    if (confirm("Deseja remover todas as matérias da lista para cadastrar apenas as suas matérias reais do AVA?")) {
      setCurrentCourses([]);
      setFeedbackMessage("Todas as matérias foram limpas. Agora você pode importar ou colar as do seu perfil.");
      setFeedbackType("success");
    }
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const newCourse: IfesCourse = {
      id: `ifes-custom-${Date.now()}`,
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
    setFeedbackMessage(`Disciplina real "${newCourse.name}" adicionada ao seu perfil.`);
    setFeedbackType("success");
    setActiveTab("manage");
  };

  const handleSyncFromApi = async () => {
    setIsSyncingApi(true);
    setFeedbackMessage(null);
    try {
      const stored = await avaConnectionManager.getStoredCredentials();
      if (stored && stored.username && stored.password) {
        const connRes = await avaConnectionManager.connectAva(stored);
        if (connRes.success && connRes.courses && connRes.courses.length > 0) {
          setCurrentCourses(connRes.courses);
          setFeedbackMessage(`Sincronização com o AVA IFES concluída! ${connRes.courses.length} matéria(s) sincronizada(s).`);
          setFeedbackType("success");
          setActiveTab("manage");
          return;
        }
      }

      const res = await avaApiClient.sync({
        studentId: stored?.username,
        username: stored?.username,
        password: stored?.password,
        campusUrl: stored?.campusUrl,
        campusName: campusName || "IFES - AVA",
        existingCourses: currentCourses,
      });

      if (res.courses && Array.isArray(res.courses) && res.courses.length > 0) {
        const real = res.courses.filter((c: any) => !isMockOrPlaceholderCourse(c));
        setCurrentCourses(real);
        setFeedbackMessage(`Sincronização com o AVA Moodle concluída! ${real.length} matéria(s) sincronizada(s).`);
        setFeedbackType("success");
        setActiveTab("manage");
      } else {
        setFeedbackMessage("Conexão estabelecida, mas o AVA não retornou matérias inscritas. Tente conectar na modal oficial do AVA IFES ou cole o texto na aba 'Colar do AVA IFES'.");
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
    if (!pasteText.trim()) {
      setFeedbackMessage("Por favor, cole o texto copiado da sua página do AVA IFES.");
      setFeedbackType("error");
      return;
    }

    setIsExtracting(true);
    setFeedbackMessage(null);

    try {
      // 1. First try Gemini server parser
      let extracted: IfesCourse[] = [];
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
          extracted = data.courses.filter((c: IfesCourse) => !isMockOrPlaceholderCourse(c));
        }
      } catch {
        // Fallback to client-side extractor
      }

      // 2. Client-side heuristic parser fallback
      if (extracted.length === 0) {
        extracted = extractCoursesFromAvaText(pasteText, campusName || "IFES - AVA");
      }

      if (extracted.length > 0) {
        setExtractedPreview(extracted);
        setFeedbackMessage(`Identificamos ${extracted.length} matéria(s) real(is) no texto colado. Revise e clique em "Aplicar ao meu Perfil"!`);
        setFeedbackType("success");
      } else {
        setFeedbackMessage("Não conseguimos identificar matérias no texto. Certifique-se de copiar a lista da página 'Meus Cursos' do AVA.");
        setFeedbackType("error");
      }
    } catch (err: any) {
      setFeedbackMessage(err?.message || "Erro ao processar texto.");
      setFeedbackType("error");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyExtractedCourses = () => {
    if (extractedPreview.length === 0) return;
    setCurrentCourses(extractedPreview);
    setExtractedPreview([]);
    setPasteText("");
    setFeedbackMessage(`${extractedPreview.length} matéria(s) do seu AVA foram aplicadas com sucesso ao seu perfil!`);
    setFeedbackType("success");
    setActiveTab("manage");
  };

  const handleSelectPreset = (preset: typeof IFES_CURRICULUM_PRESETS[0]) => {
    setCurrentCourses(preset.courses);
    setFeedbackMessage(`Grade curricular do curso "${preset.name}" carregada com sucesso! (${preset.courses.length} disciplinas)`);
    setFeedbackType("success");
    setActiveTab("manage");
  };

  const handleSaveAndClose = () => {
    saveSyncedCourses(currentCourses);
    onSaveCourses(currentCourses);
    window.dispatchEvent(
      new CustomEvent("brainstudio:courses-updated", {
        detail: { courses: currentCourses },
      })
    );
    onClose();
  };

  const filteredCurrentCourses = currentCourses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.professor && c.professor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      id="profile-courses-manager-modal"
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#121614] border border-emerald-500/25 text-neutral-100 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-emerald-500/20 flex items-center justify-between bg-[#141b17]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Matérias Reais do Perfil AVA IFES
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {currentCourses.length} Disciplinas
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Visualize, importe e mantenha estritamente as matérias reais do seu curso no IFES.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-[#0e1310] px-3 sm:px-4 pt-2 gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("manage")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "manage"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Minhas Matérias ({currentCourses.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "paste"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Clipboard className="w-4 h-4" />
            Colar do AVA IFES
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "presets"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Grades Oficiais IFES
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("apiSync")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "apiSync"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Radio className="w-4 h-4" />
            Sincronização API
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addManual")}
            className={`pb-3 px-3 font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === "addManual"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
            Adicionar Manual
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {feedbackMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 shadow-xs ${
                feedbackType === "success"
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "bg-red-500/15 text-red-300 border border-red-500/30"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackType === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{feedbackMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                className="text-xs opacity-70 hover:opacity-100 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* TAB 1: MANAGE CURRENT REAL COURSES */}
          {activeTab === "manage" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filtrar matérias por nome, sigla ou professor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#171e1a] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("paste")}
                    className="px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Colar do AVA</span>
                  </button>

                  {currentCourses.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Limpar todas as matérias para deixar apenas as reais"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar Tudo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Course Items List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredCurrentCourses.length === 0 ? (
                  <div className="text-center py-10 bg-[#161c18] rounded-2xl border border-white/5 space-y-3 p-6">
                    <BookOpen className="w-10 h-10 text-emerald-400/50 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Nenhuma disciplina cadastrada no momento</h4>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto">
                      Você pode colar a lista do seu AVA IFES, escolher sua grade curricular oficial ou adicionar as matérias que você cursa.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("paste")}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Colar do AVA IFES
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("presets")}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Escolher Grade IFES
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredCurrentCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-[#171e1a] border border-white/10 hover:border-emerald-500/30 flex items-center justify-between gap-3 transition group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white truncate">{c.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/40 text-emerald-300 border border-emerald-500/30">
                            {c.code || "IFES"}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {c.professor || "Corpo Docente IFES"} • {c.campus || campusName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-emerald-400">
                          {c.progressPercent || 0}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(c.id)}
                          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                          title="Remover matéria da lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PASTE FROM AVA IFES */}
          {activeTab === "paste" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Clipboard className="w-4 h-4 text-emerald-400" />
                  <span>Como copiar suas matérias reais diretamente do AVA IFES:</span>
                </div>
                <ol className="text-xs text-neutral-300 space-y-1 list-decimal list-inside leading-relaxed">
                  <li>Abra o seu AVA IFES (ex: <strong>ava3.cefor.ifes.edu.br</strong> ou o do seu campus).</li>
                  <li>Acesse a página <strong>"Painel"</strong> ou <strong>"Meus Cursos"</strong>.</li>
                  <li>Selecione todo o texto da tela (ou copie a lista de matérias) e dê <strong>Ctrl+C</strong>.</li>
                  <li>Cole no campo abaixo e clique em <strong>"Extrair Matérias Reais"</strong>!</li>
                </ol>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Texto copiado do seu AVA IFES:</span>
                  <span className="text-[10px] text-neutral-400">Limpeza inteligente automática</span>
                </label>
                <textarea
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Cole aqui o texto copiado da página do AVA Moodle IFES..."
                  className="w-full p-3.5 bg-[#171e1a] border border-white/10 rounded-2xl text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-400 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExtractFromPastedText}
                  disabled={isExtracting || !pasteText.trim()}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  {isExtracting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processando e identificando matérias...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extrair Matérias Reais</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview of Extracted Courses */}
              {extractedPreview.length > 0 && (
                <div className="p-4 bg-[#171e1a] border border-emerald-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{extractedPreview.length} Matérias Identificadas no Texto:</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleApplyExtractedCourses}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Aplicar ao Meu Perfil</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {extractedPreview.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400">{item.code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OFFICIAL IFES CURRICULUM PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-300">
                Selecione o seu curso no IFES para carregar automaticamente a grade curricular oficial correspondente:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {IFES_CURRICULUM_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl bg-[#171e1a] border border-white/10 hover:border-emerald-500/40 flex flex-col justify-between space-y-3 transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          {preset.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                          {preset.courses.length} Matérias
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full py-2 bg-white/10 hover:bg-emerald-500 hover:text-black text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Carregar esta Grade</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DIRECT MOODLE API SYNC */}
          {activeTab === "apiSync" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  Sincronização Direta com o AVA Moodle IFES
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Conecte-se diretamente com o seu perfil do AVA IFES ({campusName}) para sincronizar suas matérias ativas, notas e prazos em tempo real.
                </p>
              </div>

              <div className="p-4 bg-[#171e1a] border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Campus Configurado:</span>
                  <span className="font-bold text-white font-mono">{campusName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Status da Sessão:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSyncFromApi}
                  disabled={isSyncingApi}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  {isSyncingApi ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sincronizando com o AVA IFES...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Sincronizar Minhas Matérias Agora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: MANUAL ADD */}
          {activeTab === "addManual" && (
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Nome da Matéria / Disciplina *</label>
                <input
                  type="text"
                  placeholder="Ex: Teoria Geral da Administração II, Física II, etc."
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#171e1a] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Código / Sigla no AVA (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: TGA-202 ou INFO-01"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#171e1a] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white">Professor(a) (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Prof. Dr. Roberto Guimarães"
                    value={newCourseProfessor}
                    onChange={(e) => setNewCourseProfessor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#171e1a] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Matéria ao Meu Perfil</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-emerald-500/20 flex items-center justify-between bg-[#141b17]">
          <span className="text-xs text-neutral-300 font-mono">
            {currentCourses.length} disciplina(s) no perfil
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-white/10 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Matérias no Perfil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
