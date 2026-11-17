import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Gamepad2,
  Building2,
  Trophy,
  Layers,
  Users,
  X,
  Sparkles,
  ChevronRight,
  ListTodo,
  Calendar,
  Timer,
  BookA,
  Library,
  Video,
  Coins,
  Settings,
  Shield,
  Eye,
  Sliders,
  Award,
  Zap,
  Flame,
  Brain,
  History,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { CanonicalTabId } from "./TabBar";

export interface AllMenusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: CanonicalTabId;
  onNavigate: (tab: CanonicalTabId, subView?: string) => void;
  userLevel?: number;
  userCoins?: number;
  userEnergy?: number;
  modoFoco: boolean;
  onToggleModoFoco: (ativo: boolean) => void;
}

export const AllMenusModal: React.FC<AllMenusModalProps> = ({
  isOpen,
  onClose,
  currentTab,
  onNavigate,
  userLevel = 1,
  userCoins = 0,
  userEnergy = 50,
  modoFoco,
  onToggleModoFoco,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSelect = (tab: CanonicalTabId, subView?: string) => {
    onNavigate(tab, subView);
    onClose();
  };

  const menuSections = [
    {
      id: "inicio" as CanonicalTabId,
      title: "1. Início",
      subtitle: "Painel Geral do Jogador",
      icon: LayoutDashboard,
      color: "from-blue-500 to-indigo-600",
      accentText: "text-blue-500",
      badge: "Geral",
      description: "Visão 360° do seu progresso, nível, XP, missões diárias e próximas atividades do IFES.",
      subItems: [
        { label: "Painel Geral", subView: undefined, icon: LayoutDashboard },
        { label: "Missões Diárias", subView: "missoes", icon: Zap },
        { label: "Próximas Atividades", subView: "atividades", icon: ListTodo },
        { label: "Progresso & Nível", subView: "progresso", icon: Award },
      ],
    },
    {
      id: "estudar" as CanonicalTabId,
      title: "2. Estudar",
      subtitle: "Central Acadêmica Oficial",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-600",
      accentText: "text-emerald-500",
      badge: "AVA IFES",
      description: "Matérias matriculadas, ementas, atividades do Moodle, avaliações, notas e ferramentas de estudo.",
      subItems: [
        { label: "Minhas Matérias", subView: "materias", icon: BookOpen },
        { label: "Atividades & Tarefas", subView: "atividades", icon: ListTodo },
        { label: "Avaliações & Notas", subView: "avaliacoes", icon: Award },
        { label: "Desempenho Acadêmico", subView: "desempenho", icon: History },
        { label: "Organizador de Tarefas", subView: "tarefas", icon: ListTodo },
        { label: "Agenda de Aulas", subView: "agenda", icon: Calendar },
        { label: "Flashcards Anki", subView: "flashcards", icon: Layers },
        { label: "Métodos Pomodoro", subView: "metodos", icon: Timer },
        { label: "Biblioteca Digital", subView: "biblioteca", icon: Library },
        { label: "Dicionário de Termos", subView: "dicionario", icon: BookA },
        { label: "Sala de Estudos Virtual", subView: "sala_virtual", icon: Video },
      ],
    },
    {
      id: "games" as CanonicalTabId,
      title: "3. Games",
      subtitle: "Arena de Jogos & Quizzes",
      icon: Gamepad2,
      color: "from-purple-500 to-violet-600",
      accentText: "text-purple-500",
      badge: "Gamificação",
      description: "Quizzes com IA baseados nos conteúdos reais do IFES, minigames cognitivos e Jornada dos 100 Níveis.",
      subItems: [
        { label: "Quiz Battle com IA", subView: "quiz_battle", icon: Brain },
        { label: "Jogo da Memória Acadêmico", subView: "memory_cards", icon: Layers },
        { label: "Mestre das Palavras", subView: "word_master", icon: BookA },
        { label: "Corrida Matemática", subView: "math_rush", icon: Timer },
        { label: "Desafio Mental & Lógica", subView: "brain_challenge", icon: Sparkles },
        { label: "Jornada dos 100 Níveis", subView: "jornada", icon: Flame },
        { label: "Rankings & Placares", subView: "rankings", icon: Trophy },
        { label: "Conquistas do Jogador", subView: "conquistas", icon: Award },
      ],
    },
    {
      id: "cidades" as CanonicalTabId,
      title: "4. Cidades",
      subtitle: "Cidades do Conhecimento",
      icon: Building2,
      color: "from-amber-500 to-orange-600",
      accentText: "text-amber-500",
      badge: "Construção",
      description: "Construa e evolua cidades temáticas de cada disciplina investindo suas moedas de estudo.",
      subItems: [
        { label: "Visão Geral da Cidade", subView: undefined, icon: Building2 },
        { label: "Construções & Upgrades", subView: "construcoes", icon: Sparkles },
        { label: "Monumentos Históricos", subView: "monumentos", icon: Trophy },
      ],
    },
    {
      id: "eventos" as CanonicalTabId,
      title: "5. Eventos",
      subtitle: "IFES Live Events & Torneios",
      icon: Trophy,
      color: "from-rose-500 to-pink-600",
      accentText: "text-rose-500",
      badge: "Ao Vivo",
      description: "Torneios semanais, temporadas competitivas, desafios relâmpago e eventos especiais com a turma.",
      subItems: [
        { label: "Torneios em Destaque", subView: "torneios", icon: Trophy },
        { label: "Temporada Atual", subView: "temporada", icon: Flame },
        { label: "Eventos Especiais", subView: "especiais", icon: Sparkles },
      ],
    },
    {
      id: "colecao" as CanonicalTabId,
      title: "6. Coleção",
      subtitle: "Álbuns, Cartas & Baús",
      icon: Layers,
      color: "from-cyan-500 to-blue-600",
      accentText: "text-cyan-500",
      badge: "Colecionáveis",
      description: "Colecione cartas temáticas de professores, disciplinas e conceitos científicos. Abra baús de recompensas.",
      subItems: [
        { label: "Álbum de Cartas", subView: "album", icon: Layers },
        { label: "Abrir Baús & Pacotes", subView: "baus", icon: Sparkles },
        { label: "Mercado de Trocas", subView: "trocas", icon: Award },
      ],
    },
    {
      id: "perfil" as CanonicalTabId,
      title: "7. Perfil",
      subtitle: "Conta, Extrato & Ajustes",
      icon: Users,
      color: "from-slate-600 to-slate-800",
      accentText: "text-slate-500",
      badge: "Configurações",
      description: "Estatísticas, extrato contábil de moedas, conquistas, amigos conectados, temas e acessibilidade.",
      subItems: [
        { label: "Perfil & Estatísticas", subView: "geral", icon: Users },
        { label: "Extrato de Moedas & Carteira", subView: "extrato", icon: Coins },
        { label: "Configurações Gerais", subView: "config", icon: Settings },
        { label: "Acessibilidade & Inclusão", subView: "acessibilidade", icon: Eye },
        { label: "Minha Instituição", subView: "instituicao", icon: Building2 },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] bg-[var(--app-card)] border border-[var(--app-border)] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Menu Central */}
        <div className="px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--app-primary)] to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-[var(--app-text)] leading-tight">
                  Central de Todos os Menus
                </h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                  7 Áreas
                </span>
              </div>
              <p className="text-xs text-[var(--app-text-muted)]">
                Estrutura de navegação organizada e independente do APP IFES
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Modo Foco */}
            <button
              onClick={() => onToggleModoFoco(!modoFoco)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                modoFoco
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                  : "border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-card-secondary)]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Modo Foco: {modoFoco ? "Ligado" : "Desligado"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)]/50 transition cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Status Rápida do Estudante */}
        <div className="px-5 py-2.5 bg-[var(--app-bg)]/80 border-b border-[var(--app-border)] flex items-center justify-between text-xs font-semibold text-[var(--app-text-muted)] shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[var(--app-text)]">
              <Award className="w-4 h-4 text-indigo-500" />
              Nível {userLevel}
            </span>
            <span className="flex items-center gap-1.5 text-amber-500 font-bold">
              <Coins className="w-4 h-4" />
              {userCoins} Moedas
            </span>
            <span className="flex items-center gap-1.5 text-blue-500 font-bold">
              <Zap className="w-4 h-4" />
              {userEnergy} Energia
            </span>
          </div>
          <span className="text-[11px] text-[var(--app-text-muted)] hidden sm:inline">
            Clique em qualquer área ou atalho abaixo para navegar diretamente
          </span>
        </div>

        {/* Grid de Seções de Menus com Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuSections.map((sec) => {
              const isActive = currentTab === sec.id;
              const Icon = sec.icon;

              return (
                <div
                  key={sec.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                    isActive
                      ? "border-[var(--app-primary)] bg-[var(--app-primary)]/5 shadow-sm ring-1 ring-[var(--app-primary)]/30"
                      : "border-[var(--app-border)] bg-[var(--app-card)] hover:border-[var(--app-primary)]/40 hover:bg-[var(--app-card-secondary)]/40"
                  }`}
                >
                  <div>
                    {/* Header da Seção */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${sec.color} flex items-center justify-center text-white font-bold shadow-xs shrink-0`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-base text-[var(--app-text)] leading-tight">
                              {sec.title}
                            </h4>
                            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                              {sec.badge}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--app-text-muted)] font-medium">
                            {sec.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Botão Principal de Abrir Aba */}
                      <button
                        type="button"
                        onClick={() => handleSelect(sec.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 shrink-0 ${
                          isActive
                            ? "bg-[var(--app-primary)] text-white shadow-xs"
                            : "bg-[var(--app-card-secondary)] text-[var(--app-text)] hover:bg-[var(--app-primary)] hover:text-white"
                        }`}
                      >
                        <span>{isActive ? "Aba Atual" : "Acessar"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-[var(--app-text-muted)] mb-3 leading-relaxed">
                      {sec.description}
                    </p>
                  </div>

                  {/* Sub-itens Rápidos */}
                  <div className="pt-2.5 border-t border-[var(--app-border)]/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] block mb-1.5">
                      Atalhos Rápidos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sec.subItems.map((sub, idx) => {
                        const SubIcon = sub.icon;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelect(sec.id, sub.subView)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--app-card-secondary)] hover:bg-[var(--app-primary)]/15 hover:text-[var(--app-primary)] border border-[var(--app-border)] text-[var(--app-text)] transition cursor-pointer"
                          >
                            <SubIcon className="w-3 h-3 text-[var(--app-text-muted)]" />
                            <span>{sub.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="px-5 py-3 border-t border-[var(--app-border)] bg-[var(--app-card-secondary)]/40 flex items-center justify-between text-xs text-[var(--app-text-muted)] shrink-0">
          <span>Pressione <kbd className="px-1.5 py-0.5 rounded bg-[var(--app-card)] border text-[10px] font-mono">ESC</kbd> para fechar</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[var(--app-primary)] hover:underline cursor-pointer"
          >
            Continuar no App
          </button>
        </div>
      </div>
    </div>
  );
};
