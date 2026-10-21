import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Brain,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Edit2,
  Check,
  X,
  Download,
  AlertCircle,
  Sparkles,
  Lock,
  Plus,
} from "lucide-react";
import { UserProfile } from "../../types";
import { LuminaMemoryItem } from "../../types/lumina";

interface LuminaMemoryModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  memoryEnabled: boolean;
  onToggleMemoryEnabled: (enabled: boolean) => void;
}

const MEMORY_STORAGE_PREFIX = "brain_lumina_memory_";

export const LuminaMemoryModal: React.FC<LuminaMemoryModalProps> = ({
  user,
  isOpen,
  onClose,
  memoryEnabled,
  onToggleMemoryEnabled,
}) => {
  const { t, i18n } = useTranslation();
  const userId = user.id || user.uid || "estudante";
  const storageKey = `${MEMORY_STORAGE_PREFIX}${userId}`;

  const [memories, setMemories] = useState<LuminaMemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "mem-1",
        categoria: "interesses",
        texto: "Estuda disciplinas técnicas e acadêmicas no IFES com foco em tecnologia e ciências.",
        criadoEm: "15/10/2026",
      },
      {
        id: "mem-2",
        categoria: "objetivos",
        texto: "Preparação para o ENEM e obtenção de CR elevado no semestre letivo.",
        criadoEm: "16/10/2026",
      },
      {
        id: "mem-3",
        categoria: "estilo_estudo",
        texto: "Prefere explicações passo a passo com analogias do cotidiano e conferência do resultado final.",
        criadoEm: "17/10/2026",
      },
    ];
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [newItemCat, setNewItemCat] = useState<LuminaMemoryItem["categoria"]>("objetivos");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(memories));
    } catch {}
  }, [memories, storageKey]);

  if (!isOpen) return null;

  const handleDeleteItem = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleStartEdit = (item: LuminaMemoryItem) => {
    setEditingId(item.id);
    setEditText(item.texto);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, texto: editText.trim(), atualizadoEm: new Date().toLocaleDateString() } : m))
    );
    setEditingId(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    // Filtro anti-dados sensíveis
    const lower = newItemText.toLowerCase();
    const sensitiveWords = ["senha", "cartao", "cpf", "doenca", "medicamento", "religiao", "salario"];
    if (sensitiveWords.some((w) => lower.includes(w))) {
      alert(t("memoria.alerta_dado_sensivel", "Por motivos de privacidade e conformidade com a LGPD, a Lumina não armazena dados de saúde, senhas, documentos ou informações sensíveis."));
      return;
    }

    const newItem: LuminaMemoryItem = {
      id: `mem-${Date.now()}`,
      categoria: newItemCat,
      texto: newItemText.trim(),
      criadoEm: new Date().toLocaleDateString(),
    };

    setMemories((prev) => [newItem, ...prev]);
    setNewItemText("");
    setShowAddForm(false);
  };

  const handleForgetEverything = () => {
    if (confirm(t("memoria.confirmar_esquecer", "Tem certeza de que deseja apagar todas as memórias da Lumina? Esta ação tem efeito imediato e não pode ser desfeita."))) {
      setMemories([]);
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    }
  };

  const handleExportData = () => {
    const exportObject = {
      app: "Brain Studio - Lumina IA",
      usuario: user.name,
      email: user.email,
      exportadoEm: new Date().toISOString(),
      politicaPrivacidade: "Conforme com LGPD (Lei 13.709/2018)",
      memorias: memories,
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumina-meus-dados-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categoryLabels: Record<LuminaMemoryItem["categoria"], string> = {
    interesses: t("memoria.cat_interesses", "Disciplinas & Matérias"),
    objetivos: t("memoria.cat_objetivos", "Metas Acadêmicas (ENEM / IFES)"),
    dificuldades: t("memoria.cat_dificuldades", "Dificuldades Recorrentes"),
    estilo_estudo: t("memoria.cat_estilo", "Estilo de Aprendizado"),
    idioma: t("memoria.cat_idioma", "Idioma Preferido"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-2xl space-y-5 max-h-[88vh] flex flex-col overflow-hidden text-[var(--app-text)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">
                {t("memoria.titulo_modal", "O que a Lumina sabe sobre mim")}
              </h2>
              <p className="text-xs text-[var(--app-text-muted)]">
                {t("memoria.subtitulo_modal", "Memória transparente e consentida com controle total pelo estudante")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] cursor-pointer"
            aria-label={t("geral.fechar", "Fechar")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Consent Switch: Lumina Lembra de Mim */}
        <div className="bg-gradient-to-r from-[var(--app-primary)]/10 to-transparent p-4 rounded-2xl border border-[var(--app-primary)]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-[var(--app-primary)]">
                {t("memoria.chave_consentimento", "Lumina lembra de mim")}
              </span>
            </div>
            <p className="text-xs text-[var(--app-text-muted)]">
              {memoryEnabled
                ? t("memoria.status_ativa", "Ativada: a Lumina lembra de objetivos acadêmicos e do seu estilo de estudo.")
                : t("memoria.status_desativada", "Desativada: nenhuma informação prévia é usada ou armazenada nas conversas.")}
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={memoryEnabled}
              onChange={(e) => onToggleMemoryEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--app-primary)]"></div>
          </label>
        </div>

        {/* Strict LGPD Security Notice */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Lock className="w-3.5 h-3.5" />
            {t("memoria.lgpd_garantia", "Conformidade e Sigilo Total (LGPD)")}
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--app-text-muted)]">
            {t("memoria.lgpd_texto", "A Lumina NUNCA armazena dados de saúde, orientação, religião, finanças, documentos ou senhas. Apenas dados úteis para personalizar seu aprendizado.")}
          </p>
        </div>

        {/* Memory List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
              {t("memoria.itens_salvos", "Fatos Acadêmicos Lembrados")} ({memories.length}/50)
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-[var(--app-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("memoria.adicionar_fato", "Adicionar item")}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddItem} className="p-3.5 rounded-2xl bg-[var(--app-card-hover)] border border-[var(--app-border)] space-y-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={newItemCat}
                  onChange={(e) => setNewItemCat(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold"
                >
                  <option value="objetivos">{categoryLabels.objetivos}</option>
                  <option value="interesses">{categoryLabels.interesses}</option>
                  <option value="dificuldades">{categoryLabels.dificuldades}</option>
                  <option value="estilo_estudo">{categoryLabels.estilo_estudo}</option>
                </select>
                <input
                  type="text"
                  required
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Ex: Tenho dificuldade em cálculo de derivadas..."
                  className="px-2.5 py-1.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text)]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-[var(--app-primary)] text-white font-bold cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}

          {memories.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--app-text-muted)]">
              {t("memoria.sem_fatos", "Nenhuma memória armazenada. A Lumina aprenderá conforme você conversa ou você pode cadastrar manualmente acima.")}
            </div>
          ) : (
            memories.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[var(--app-card-hover)]/40 border border-[var(--app-border)] flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded-md bg-[var(--app-accent)]/15 text-[var(--app-accent)]">
                      {categoryLabels[item.categoria] || item.categoria}
                    </span>
                    <span className="text-[10px] text-[var(--app-text-muted)]">{item.criadoEm}</span>
                  </div>

                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded-lg bg-[var(--app-card)] border border-[var(--app-primary)] text-[var(--app-text)] outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="p-1 rounded-lg bg-emerald-500 text-white cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded-lg bg-neutral-500 text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-[var(--app-text)] leading-relaxed">
                      {item.texto}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card)] transition cursor-pointer"
                    title={t("geral.editar", "Editar")}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                    title={t("geral.excluir", "Excluir")}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions: Esquecer Tudo & Exportar Meus Dados */}
        <div className="pt-3 border-t border-[var(--app-border)] flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            onClick={handleForgetEverything}
            disabled={memories.length === 0}
            className="px-3.5 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t("memoria.esquecer_tudo", "Esquecer tudo")}
          </button>

          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-[var(--app-card-hover)] hover:bg-[var(--app-border)] font-bold text-[var(--app-text)] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            {t("memoria.exportar_dados", "Exportar meus dados (LGPD)")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LuminaMemoryModal;
