import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, BookOpen, Layers, ListTodo, Settings, Sparkles, Brain, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ITENS_NAVEGACAO } from "../../config/navegacao.config.js";

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  subjects?: Array<{ id: string; title: string }>;
  tasks?: Array<{ id: string; title: string; category?: string }>;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  subjects = [],
  tasks = [],
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalizador Unicode para tolerância estrita a acentos e maiúsculas/minúsculas
  const normalize = (text: string) =>
    (text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    const qNorm = normalize(query);

    // 1. Funcionalidades do App
    const featureResults = ITENS_NAVEGACAO.filter((item) => {
      if (!qNorm) return false;
      const nomeNorm = normalize(item.labelPadrao);
      const descNorm = normalize(item.descricao || "");
      return nomeNorm.includes(qNorm) || descNorm.includes(qNorm);
    }).map((item) => ({
      id: `feature-${item.id}`,
      title: item.labelPadrao,
      subtitle: item.descricao,
      icon: item.icone,
      route: item.rota,
      category: "Funcionalidade",
    }));

    // 2. Disciplinas
    const subjectResults = subjects
      .filter((s) => !qNorm || normalize(s.title).includes(qNorm))
      .map((s) => ({
        id: `subject-${s.id}`,
        title: s.title,
        subtitle: "Disciplina AVA",
        icon: BookOpen,
        route: `/estudar/disciplinas`,
        category: "Disciplinas",
      }));

    // 3. Tarefas
    const taskResults = tasks
      .filter((tsk) => !qNorm || normalize(tsk.title).includes(qNorm))
      .slice(0, 4)
      .map((tsk) => ({
        id: `task-${tsk.id}`,
        title: tsk.title,
        subtitle: tsk.category || "Tarefa pendente",
        icon: ListTodo,
        route: `/estudar/tarefas`,
        category: "Tarefas",
      }));

    if (!qNorm) {
      // Sugestões rápidas padrão
      return [
        {
          id: "sug-lumina",
          title: "Lumina IA - Tutora Socrática",
          subtitle: "Tirar dúvidas e receber explicações",
          icon: Brain,
          route: "/lumina",
          category: "Atalho Rápido",
        },
        {
          id: "sug-flashcards",
          title: "Flashcards Anki",
          subtitle: "Praticar memorização espaçada",
          icon: Layers,
          route: "/estudar/flashcards",
          category: "Atalho Rápido",
        },
        {
          id: "sug-tarefas",
          title: "Organizador de Tarefas",
          subtitle: "Ver pendências de estudo",
          icon: ListTodo,
          route: "/estudar/tarefas",
          category: "Atalho Rápido",
        },
        {
          id: "sug-config",
          title: "Acessibilidade e Inclusão",
          subtitle: "Ajustar contraste, fontes e opções",
          icon: Settings,
          route: "/perfil/configuracoes/acessibilidade",
          category: "Configurações",
        },
      ];
    }

    return [...featureResults, ...subjectResults, ...taskResults].slice(0, 8);
  }, [query, subjects, tasks]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, searchResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % Math.max(1, searchResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = searchResults[selectedIndex];
      if (selected) {
        onNavigate(selected.route);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Search Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Busca Global"
        className="relative z-10 w-full max-w-xl bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-[var(--app-border)] flex items-center gap-3">
          <Search className="w-5 h-5 text-[var(--app-text-muted)] shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("busca.placeholder", "Buscar matérias, tarefas, flashcards, ferramentas...")}
            className="w-full bg-transparent text-sm sm:text-base font-bold text-[var(--app-text)] placeholder:text-[var(--app-text-muted)]/70 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="p-2 sm:p-3 max-h-[60vh] overflow-y-auto space-y-1">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--app-text-muted)]">
              Nenhum resultado encontrado para &quot;{query}&quot;. Tente outro termo.
            </div>
          ) : (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon || Sparkles;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.route);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`min-h-[48px] p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                    isSelected
                      ? "bg-[var(--app-primary)]/10 text-[var(--app-primary)]"
                      : "text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)]"
                          : "bg-[var(--app-card-secondary)] border-[var(--app-border)] text-[var(--app-text-muted)]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold truncate text-[var(--app-text)]">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-[var(--app-text-muted)] truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] px-2 py-0.5 rounded-md bg-[var(--app-card-secondary)]">
                      {item.category}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--app-text-muted)] opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[var(--app-card-secondary)]/50 border-t border-[var(--app-border)] flex items-center justify-between text-[11px] text-[var(--app-text-muted)] select-none">
          <div className="flex items-center gap-2">
            <span>↑↓ para navegar</span>
            <span>·</span>
            <span>Enter para selecionar</span>
            <span>·</span>
            <span>Esc para fechar</span>
          </div>
          <span className="font-bold text-[var(--app-primary)]">Brain Studio</span>
        </div>
      </div>
    </div>
  );
};
