import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  RotateCcw,
  Search,
  BookOpen,
  ListTodo,
  Calendar,
  Layers,
  FileText,
  HelpCircle,
  Paperclip,
  Share2,
  AlertTriangle,
  FolderX,
} from "lucide-react";
import {
  CategoriaExcluida,
  ItemExcluido,
  listarItensExcluidos,
  restaurarItemExcluido,
  excluirDefinitivamente,
  esvaziarCategoriaExcluidos,
} from "../services/excluidosService";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

interface ExcluidosViewProps {
  userId: string;
  onItemRestaurado?: (item: ItemExcluido) => void;
}

const CATEGORIAS_CONFIG: { id: "todas" | CategoriaExcluida; label: string; icon: any }[] = [
  { id: "todas", label: "Todos", icon: Trash2 },
  { id: "materias", label: "Matérias", icon: BookOpen },
  { id: "tarefas", label: "Tarefas", icon: ListTodo },
  { id: "eventos", label: "Eventos", icon: Calendar },
  { id: "cards", label: "Cards", icon: Layers },
  { id: "notas", label: "Notas", icon: FileText },
  { id: "simulados", label: "Simulados", icon: HelpCircle },
  { id: "anexos", label: "Anexos", icon: Paperclip },
  { id: "conexoes", label: "Conexões", icon: Share2 },
];

export const ExcluidosView: React.FC<ExcluidosViewProps> = ({ userId, onItemRestaurado }) => {
  const { t } = useTranslation();
  const [categoriaAtiva, setCategoriaAtiva] = useState<"todas" | CategoriaExcluida>("todas");
  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState<ItemExcluido[]>(() => listarItensExcluidos());
  const [itemParaExcluirDefinitivo, setItemParaExcluirDefinitivo] = useState<ItemExcluido | null>(null);
  const [mostrarConfirmarEsvaziar, setMostrarConfirmarEsvaziar] = useState(false);

  const recarregar = () => {
    setItens(listarItensExcluidos());
  };

  useEffect(() => {
    recarregar();
    window.addEventListener("brain_studio_excluidos_updated", recarregar);
    return () => {
      window.removeEventListener("brain_studio_excluidos_updated", recarregar);
    };
  }, []);

  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      const matchCategoria = categoriaAtiva === "todas" || item.categoria === categoriaAtiva;
      const matchBusca =
        !busca.trim() ||
        item.nome.toLowerCase().includes(busca.toLowerCase().trim()) ||
        (item.materiaOrigem && item.materiaOrigem.toLowerCase().includes(busca.toLowerCase().trim()));
      return matchCategoria && matchBusca;
    });
  }, [itens, categoriaAtiva, busca]);

  const contagemPorCategoria = useMemo(() => {
    const mapa: Record<string, number> = { todas: itens.length };
    for (const c of CATEGORIAS_CONFIG) {
      if (c.id !== "todas") {
        mapa[c.id] = itens.filter((i) => i.categoria === c.id).length;
      }
    }
    return mapa;
  }, [itens]);

  const handleRestaurar = async (item: ItemExcluido) => {
    await restaurarItemExcluido(userId, item.id);
    recarregar();
    if (onItemRestaurado) {
      onItemRestaurado(item);
    }
  };

  const handleConfirmarExclusaoDefinitiva = async () => {
    if (!itemParaExcluirDefinitivo) return;
    await excluirDefinitivamente(userId, itemParaExcluirDefinitivo.id);
    setItemParaExcluirDefinitivo(null);
    recarregar();
  };

  const handleEsvaziarCategoria = async () => {
    if (categoriaAtiva === "todas") {
      for (const c of CATEGORIAS_CONFIG) {
        if (c.id !== "todas") {
          await esvaziarCategoriaExcluidos(userId, c.id as CategoriaExcluida);
        }
      }
    } else {
      await esvaziarCategoriaExcluidos(userId, categoriaAtiva);
    }
    setMostrarConfirmarEsvaziar(false);
    recarregar();
  };

  const formatarData = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[var(--app-border)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)] tracking-tight flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-rose-500" />
            <span>Itens Excluídos (Lixeira Persistente)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-0.5">
            Itens excluídos permanecem aqui e nunca aparecem em matérias, tarefas ou agenda. Você pode restaurar ou apagar definitivamente.
          </p>
        </div>

        {itensFiltrados.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setMostrarConfirmarEsvaziar(true)}
            className="flex items-center gap-1.5"
          >
            <FolderX className="w-4 h-4" />
            <span>{categoriaAtiva === "todas" ? "Esvaziar Lixeira" : `Esvaziar ${categoriaAtiva}`}</span>
          </Button>
        )}
      </div>

      {/* Chips de Categoria */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIAS_CONFIG.map((cat) => {
          const Icon = cat.icon;
          const count = contagemPorCategoria[cat.id] || 0;
          const isActive = categoriaAtiva === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                isActive
                  ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-xs"
                  : "bg-[var(--app-card)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border-[var(--app-border)] hover:bg-[var(--app-card-secondary)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-[var(--app-border)] text-[var(--app-text-muted)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] pointer-events-none" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar itens excluídos por nome ou matéria..."
          className="pl-10"
        />
      </div>

      {/* Lista de Itens */}
      {itensFiltrados.length === 0 ? (
        <Card variant="default" padding="lg" className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6 opacity-60" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[var(--app-text)]">Nenhum item excluído</h4>
            <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
              {busca
                ? "Nenhum resultado corresponde à sua pesquisa."
                : "Sua lixeira está vazia nesta categoria."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {itensFiltrados.map((item) => (
            <Card
              key={item.id}
              variant="default"
              padding="md"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:border-[var(--app-primary)]/40 transition"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    {item.categoria}
                  </span>
                  {item.materiaOrigem && (
                    <span className="text-xs text-[var(--app-text-muted)] font-medium">
                      Matéria: <strong className="text-[var(--app-text)]">{item.materiaOrigem}</strong>
                    </span>
                  )}
                  <span className="text-[11px] text-[var(--app-text-muted)] font-mono">
                    Excluído em {formatarData(item.excluidoEm)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[var(--app-text)] truncate">{item.nome}</h4>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestaurar(item)}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItemParaExcluirDefinitivo(item)}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Definitivamente</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Confirmação: Exclusão Definitiva de 1 Item */}
      {itemParaExcluirDefinitivo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-[var(--app-text)]">
                Excluir definitivamente?
              </h3>
              <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
                Esta ação apagará <strong>"{itemParaExcluirDefinitivo.nome}"</strong> de forma irreversível. Um marcador anônimo será mantido para impedir que sincronizações futuras do AVA ou outros sistemas recriem o item.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="destructive"
                fullWidth
                onClick={handleConfirmarExclusaoDefinitiva}
              >
                Sim, Excluir Definitivamente
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setItemParaExcluirDefinitivo(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação: Esvaziar Categoria */}
      {mostrarConfirmarEsvaziar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center mx-auto">
              <FolderX className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-[var(--app-text)]">
                Esvaziar itens excluídos?
              </h3>
              <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
                Você tem certeza que deseja apagar definitivamente todos os itens em{" "}
                <strong>{categoriaAtiva === "todas" ? "todas as categorias" : categoriaAtiva}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="destructive"
                fullWidth
                onClick={handleEsvaziarCategoria}
              >
                Sim, Esvaziar
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setMostrarConfirmarEsvaziar(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
