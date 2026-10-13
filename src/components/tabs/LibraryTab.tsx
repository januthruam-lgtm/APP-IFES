import React, { useState } from "react";
import {
  BookMarked,
  FileText,
  Search,
  Upload,
  Brain,
  Gamepad2,
  Trash2,
  ExternalLink,
  Sparkles,
  Plus,
} from "lucide-react";
import { UserProfile, SavedDocument } from "../../types";

interface LibraryTabProps {
  user: UserProfile;
  onOpenSocraticWithContext?: (topic: string) => void;
  onOpenDeckWithDocument?: () => void;
}

export const LibraryTab: React.FC<LibraryTabProps> = ({
  user,
  onOpenSocraticWithContext,
  onOpenDeckWithDocument,
}) => {
  const [search, setSearch] = useState("");
  const [documents, setDocuments] = useState<SavedDocument[]>([
    {
      id: "doc-1",
      title: "Teoria Clássica e Científica da Administração",
      fileName: "apostila_adm_unidade_1.pdf",
      fileType: "pdf",
      uploadDate: "18/09/2026",
      timestamp: Date.now() - 86400000 * 5,
      courseTag: "Teorias da Administração",
      textContent: "A administração científica, fundada por Frederick Winslow Taylor...",
      fileSizeFormatted: "2.4 MB",
      extractedConcepts: ["Estudo de Tempos e Movimentos", "Padronização", "Homo Economicus"],
    },
    {
      id: "doc-2",
      title: "Guia Prático de Estruturas de Dados em C",
      fileName: "estruturas_de_dados_ifes.pdf",
      fileType: "pdf",
      uploadDate: "20/09/2026",
      timestamp: Date.now() - 86400000 * 3,
      courseTag: "Algoritmos e Lógica",
      textContent: "Vetores unidimensionais, matrizes e alocação dinâmica de memória...",
      fileSizeFormatted: "3.8 MB",
      extractedConcepts: ["Vetores", "Ponteiros", "Complexidade O(n)"],
    },
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newText, setNewText] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.courseTag.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const newDoc: SavedDocument = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      fileName: `${newTitle.toLowerCase().replace(/\s+/g, "_")}.txt`,
      fileType: "txt",
      uploadDate: new Date().toLocaleDateString("pt-BR"),
      timestamp: Date.now(),
      courseTag: newTag.trim() || "Geral",
      textContent: newText.trim(),
      fileSizeFormatted: `${Math.round(newText.length / 1024 * 10) / 10 || 1.2} KB`,
      extractedConcepts: ["Conceito Central", "Prática Acadêmica"],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setNewTitle("");
    setNewTag("");
    setNewText("");
    setShowUploadModal(false);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-md">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[var(--app-text)]">Biblioteca & Repositório de Documentos</h2>
            <p className="text-xs text-[var(--app-text-muted)]">
              Centralize PDFs, anotações de aulas e resumos sincronizados com sua conta.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Material</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar nos documentos por título ou disciplina..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:ring-1 focus:ring-[var(--app-primary)]"
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--app-bg)] text-[var(--app-primary)] border border-[var(--app-border)]">
                  {doc.courseTag}
                </span>
                <span className="text-[10px] text-[var(--app-text-muted)] font-mono">
                  {doc.fileSizeFormatted}
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--app-text)]">{doc.title}</h3>
              <p className="text-xs text-[var(--app-text-muted)] line-clamp-2">{doc.textContent}</p>

              {doc.extractedConcepts && doc.extractedConcepts.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {doc.extractedConcepts.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[9px] bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--app-border)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenSocraticWithContext && onOpenSocraticWithContext(doc.title)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/20 transition cursor-pointer"
                  title="Analisar com Tutora Lumina"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Socrático</span>
                </button>

                <button
                  onClick={() => onOpenDeckWithDocument && onOpenDeckWithDocument()}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center gap-1 hover:bg-purple-500/20 transition cursor-pointer"
                  title="Gerar Quiz ou Game"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Quiz Game</span>
                </button>
              </div>

              <button
                onClick={() => handleDelete(doc.id)}
                className="p-1.5 rounded-xl text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                title="Excluir documento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-black text-[var(--app-text)]">Adicionar Material de Estudo</h3>

            <form onSubmit={handleAddDocument} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[var(--app-text)] block mb-1">Título do Documento</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Resumo Aula 03 - Funções de Fayol"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--app-text)] block mb-1">Disciplina / Tag</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Ex: Administração Geral"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--app-text)] block mb-1">Conteúdo do Texto</label>
                <textarea
                  rows={5}
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Cole aqui o texto ou anotações..."
                  className="w-full p-3 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--app-text-muted)] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold cursor-pointer"
                >
                  Salvar no Repositório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
