import React, { useState } from "react";
import {
  Library,
  Upload,
  FileText,
  Bot,
  Gamepad2,
  Trash2,
  Sparkles,
  Download,
} from "lucide-react";
import { UserProfile } from "../../types";

interface LibraryTabProps {
  user: UserProfile;
  onOpenSocraticWithContext: (topic: string) => void;
  onOpenDeckWithDocument: () => void;
}

interface DocItem {
  id: string;
  title: string;
  category: string;
  size: string;
  addedAt: string;
}

const INITIAL_DOCS: DocItem[] = [
  {
    id: "doc-1",
    title: "Apostila de Estruturas de Dados e Algoritmos - IFES.pdf",
    category: "Informática",
    size: "4.2 MB",
    addedAt: "Ontem",
  },
  {
    id: "doc-2",
    title: "Tabela de Derivadas e Integrais Imediatas.pdf",
    category: "Matemática",
    size: "1.1 MB",
    addedAt: "Há 3 dias",
  },
  {
    id: "doc-3",
    title: "Resumo Arquitetura Camadas TCP-IP e Roteamento.pdf",
    category: "Redes",
    size: "2.8 MB",
    addedAt: "Semana passada",
  },
];

export const LibraryTab: React.FC<LibraryTabProps> = ({
  onOpenSocraticWithContext,
  onOpenDeckWithDocument,
}) => {
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc: DocItem = {
      id: `doc-${Date.now()}`,
      title: file.name,
      category: "Material do Aluno",
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      addedAt: "Agora",
    };

    setDocs((prev) => [newDoc, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  const handleDelete = (docId: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Library className="w-3.5 h-3.5" />
            <span>Biblioteca Acadêmica & Acervo</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary,#f8fafc)]">
            Apostilas, PDFs & Documentos
          </h1>
          <p className="text-xs text-[var(--text-muted,#94a3b8)]">
            Envie materiais didáticos para gerar quizzes ou estudar com a tutora Lumina
          </p>
        </div>

        <label className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          <span>Upload de Material</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center animate-in slide-in-from-top-2">
          Material acadêmico indexado com sucesso na biblioteca!
        </div>
      )}

      {/* Docs list */}
      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-md hover:border-indigo-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[var(--text-primary,#f8fafc)] truncate">
                  {doc.title}
                </h4>
                <p className="text-xs text-[var(--text-muted,#94a3b8)] mt-0.5">
                  {doc.category} • {doc.size} • Adicionado {doc.addedAt}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => onOpenSocraticWithContext(doc.title)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Debater este conteúdo com Lumina"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Debater</span>
              </button>

              <button
                onClick={onOpenDeckWithDocument}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Gerar quiz gamificado a partir deste documento"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Gerar Quiz</span>
              </button>

              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Remover documento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
