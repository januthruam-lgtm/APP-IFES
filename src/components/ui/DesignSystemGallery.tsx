import React, { useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { ListItem } from "./ListItem";
import { Chip } from "./Chip";
import { Tabs } from "./Tabs";
import { Badge } from "./Badge";
import { Avatar } from "./Avatar";
import { Input } from "./Input";
import { Switch } from "./Switch";
import { ProgressBar } from "./ProgressBar";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { Snackbar } from "./Snackbar";
import { Dialog } from "./Dialog";
import { BottomSheet } from "./BottomSheet";
import { Sparkles, BookOpen, Layers, Trash2 } from "lucide-react";

export const DesignSystemGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState("botoes");
  const [switchChecked, setSwitchChecked] = useState(false);
  const [chipSelected, setChipSelected] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-[var(--app-text)]">
          Design System & Galeria de Componentes
        </h1>
        <p className="text-xs text-[var(--app-text-muted)] mt-1">
          Ambiente interno de desenvolvimento para validação visual dos tokens e componentes primitivos.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: "botoes", label: "Botões & Ações" },
          { id: "superficies", label: "Superfícies & Cartões" },
          { id: "entradas", label: "Inputs & Controles" },
          { id: "feedback", label: "Feedback & Modais" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "botoes" && (
        <Card className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--app-text)]">Variantes de Botão</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primário</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="text">Texto</Button>
              <Button variant="destructive">Destrutivo</Button>
              <Button variant="primary" isLoading>Carregando</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--app-text)]">Tamanhos de Botão</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Pequeno (sm)</Button>
              <Button size="md">Médio (md)</Button>
              <Button size="lg">Grande (lg)</Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--app-text)]">Chips Interativos (Filtros)</h3>
            <div className="flex flex-wrap gap-2">
              <Chip
                label="Filtro Ativo"
                selected={chipSelected}
                onClick={() => setChipSelected(!chipSelected)}
                icon={<Sparkles className="w-3.5 h-3.5" />}
              />
              <Chip label="Matemática" icon={<BookOpen className="w-3.5 h-3.5" />} />
              <Chip label="Física" icon={<Layers className="w-3.5 h-3.5" />} />
            </div>
          </div>
        </Card>
      )}

      {activeTab === "superficies" && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-[var(--app-text)]">Card com Padding Padrão</h3>
            <p className="text-xs text-[var(--app-text-muted)] mt-1">
              Superfície limpa com borda adaptativa nos dois temas (Claro e Escuro).
            </p>
          </Card>

          <Card padding="none">
            <div className="p-4 border-b border-[var(--app-border)] text-xs font-bold text-[var(--app-text-muted)] uppercase">
              Lista de Itens
            </div>
            <div className="divide-y divide-[var(--app-border)]">
              <ListItem
                title="Cálculo I"
                subtitle="Prof. Dr. Ricardo • Próxima aula amanhã"
                leftElement={<Avatar name="Cálculo" size="md" />}
                showChevron
                onClick={() => {}}
              />
              <ListItem
                title="Física Quântica"
                subtitle="Laboratório de Óptica • 4 tarefas pendentes"
                leftElement={<Avatar name="Física" size="md" />}
                showChevron
                onClick={() => {}}
              />
            </div>
          </Card>
        </div>
      )}

      {activeTab === "entradas" && (
        <Card className="space-y-5">
          <Input label="Nome Completo" placeholder="Digite seu nome..." />
          <Input label="E-mail Institucional" placeholder="aluno@ifes.edu.br" helperText="Utilize seu e-mail acadêmico oficial." />
          <Input label="Campo com Erro" defaultValue="Valor inválido" errorMessage="Este formato de matrícula não foi reconhecido." />
          <Switch
            label="Modo Noturno Automático"
            description="Alterna automaticamente conforme a preferência do sistema operacional."
            checked={switchChecked}
            onChange={setSwitchChecked}
          />
        </Card>
      )}

      {activeTab === "feedback" && (
        <Card className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--app-text)]">Badges de Notificação & Status</h3>
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary">Primário</Badge>
              <Badge tone="success" dot>Sucesso</Badge>
              <Badge tone="warning" dot>Aviso</Badge>
              <Badge tone="danger" dot>Perigo</Badge>
              <Badge tone="neutral">Neutro</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--app-text)]">Barra de Progresso</h3>
            <ProgressBar value={65} showPercentage label="Meta Semanal de Flashcards" />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--app-text)]">Esqueleto de Carregamento (Skeleton)</h3>
            <div className="space-y-2">
              <Skeleton height={20} className="w-3/4" />
              <Skeleton height={14} className="w-1/2" />
              <Skeleton height={14} className="w-full" />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-[var(--app-text)]">Diálogos e Avisos</h3>
            <div className="flex flex-wrap gap-3">
              <Button size="sm" variant="secondary" onClick={() => setIsSnackbarOpen(true)}>
                Testar Snackbar com Desfazer (8s)
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setIsDialogOpen(true)}>
                Testar Diálogo de Exclusão
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setIsSheetOpen(true)}>
                Testar BottomSheet Móvel
              </Button>
            </div>
          </div>

          <EmptyState
            title="Nenhuma pendência encontrada"
            description="Você concluiu todos os seus deveres de estudo programados para hoje."
            actionLabel="Criar Nova Tarefa"
            onAction={() => {}}
          />
        </Card>
      )}

      {/* Snackbar Demo */}
      <Snackbar
        isOpen={isSnackbarOpen}
        onClose={() => setIsSnackbarOpen(false)}
        message="Disciplina arquivada com sucesso."
        type="success"
        undoAction={() => alert("Ação desfeita com sucesso!")}
      />

      {/* Dialog Demo */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Excluir Permanentemente?"
        description="Esta ação removerá a disciplina e todos os arquivos associados. Esta operação não pode ser desfeita."
        destructive
        confirmLabel="Sim, Excluir"
        onConfirm={() => alert("Excluído")}
      />

      {/* BottomSheet Demo */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Opções da Disciplina"
      >
        <div className="space-y-3">
          <p className="text-xs text-[var(--app-text-muted)]">
            Ações rápidas disponíveis para esta matéria:
          </p>
          <div className="space-y-1">
            <ListItem title="Ver Plano de Ensino" showChevron onClick={() => {}} />
            <ListItem title="Sincronizar Notas com o AVA" showChevron onClick={() => {}} />
            <ListItem title="Arquivar Disciplina" showChevron onClick={() => {}} />
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
