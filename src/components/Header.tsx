import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, Sparkles } from "lucide-react";
import { TabId } from "./Sidebar";
import { UserProfile, CustomThemeColors } from "../types";
import { SettingsTabId } from "./SettingsModal";

interface HeaderProps {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  user: UserProfile;
  voiceEnabled?: boolean;
  onToggleVoice?: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onLogout?: () => void;
  onRechargeEnergy?: () => void;
  onOpenOfflineModal?: () => void;
  onOpenProfileSettings?: () => void;
  onOpenNotificationSettings?: () => void;
  onOpenOnlineUsers?: () => void;
  onOpenAvaConnect?: () => void;
  onOpenSettings?: (initialTab?: SettingsTabId) => void;
  onOpenAccessibility?: () => void;
  onlineCount?: number;
  isOnline?: boolean;
  currentTheme?: CustomThemeColors;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  user,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.email || user.name || "user-id",
            userName: user.name,
            level: user.level,
            matricula: user.ifesAccount?.matricula || "",
            campus: user.ifesAccount?.campusName || "IFES",
          }),
        });
      } catch {
        // Offline heartbeat fallback
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [user.name, user.level, user.email, user.ifesAccount?.matricula, user.ifesAccount?.campusName]);

  const { t } = useTranslation();

  const titles: Record<TabId, { title: string; subtitle: string; category: string }> = {
    dashboard: {
      category: t("nav.dashboard", "Dashboard"),
      title: t("nav.dashboard", "Dashboard"),
      subtitle: t("dashboard.subtitulo_hero", "Progresso acadêmico, horários e status das tarefas do AVA"),
    },
    tasks: {
      category: t("nav.grupo_produtividade", "Produtividade & Foco"),
      title: t("nav.tarefas", "Organizador de Tarefas"),
      subtitle: "Estruture metas diárias, prioridades e entregas com lembretes",
    },
    agenda: {
      category: t("nav.grupo_produtividade", "Sincronização & Equipe"),
      title: t("nav.agenda", "Agenda Compartilhada"),
      subtitle: "Provas bimestrais, trabalhos em grupo e sessões de estudo agendadas",
    },
    study_methods: {
      category: t("nav.grupo_produtividade", "Metodologias Científicas"),
      title: t("nav.metodos_estudo", "Métodos de Estudo"),
      subtitle: "Cronômetro Pomodoro, Técnica Feynman, Active Recall e Repetição Espaçada",
    },
    flashcards: {
      category: t("nav.grupo_produtividade", "Spaced Repetition SM-2"),
      title: t("nav.flashcards", "Flashcards Estilo Anki"),
      subtitle: "Fixação e revisão de fórmulas e conceitos por repetição espaçada",
    },
    study_room: {
      category: t("nav.grupo_produtividade", "Estudo Ao Vivo"),
      title: t("nav.sala_estudos", "Grupo de Estudos Virtual"),
      subtitle: "Vídeo, áudio, compartilhamento de tela e chat colaborativo com colegas",
    },
    lumina: {
      category: t("nav.grupo_ia", "Tutoria Inteligente"),
      title: t("nav.lumina", "Lumina IA"),
      subtitle: t("lumina.descricao", "Tutora inteligente para tirar dúvidas e aprofundar matérias"),
    },
    sequence: {
      category: t("nav.grupo_academico", "Catálogo Acadêmico IFES"),
      title: t("nav.disciplinas", "Minhas Disciplinas AVA"),
      subtitle: "Trilhas de disciplinas, organização e importação direta do AVA",
    },
    games: {
      category: t("nav.grupo_ia", "Simulados 10 Questões"),
      title: t("nav.simulados", "Simulados 10Q"),
      subtitle: "Envie PDFs, apostilas ou temas e resolva 10 questões por prompt",
    },
    teams: {
      category: t("nav.grupo_comunidade", "Cooperação"),
      title: t("nav.equipes", "Equipes & Batalhas"),
      subtitle: "Crie sua equipe, troque energias com companheiros e dispute duelos 1v1",
    },
    ifes: {
      category: t("nav.grupo_academico", "Ambiente Virtual"),
      title: t("nav.ava_ifes", "AVA Moodle IFES"),
      subtitle: "Sincronização automática, notas, fóruns e questionários oficiais",
    },
    store: {
      category: t("nav.grupo_comunidade", "Economia & Mascotes"),
      title: t("nav.loja_pets", "Loja de Mascotes 3D"),
      subtitle: "Adote pets 3D, ganhe bônus de foco e personalize acessórios",
    },
    library: {
      category: t("nav.grupo_academico", "Acervo & Domínio Público"),
      title: t("nav.biblioteca", "Biblioteca Digital"),
      subtitle: "Obras completas em domínio público para leitura acadêmica e vestibular",
    },
    dictionary: {
      category: t("nav.grupo_academico", "Léxico & Dicionário"),
      title: t("nav.dicionario", "Dicionário Escolar"),
      subtitle: "Busca offline, definições com exemplos e sinônimos gramaticais",
    },
    cidade: {
      category: t("nav.grupo_comunidade", "Comunidade & Mascotes"),
      title: t("nav.construcoes", "Construções da Vila"),
      subtitle: "Progressão de obras acadêmicas: evolua monumentos e colabore com sua turma",
    },
    construcoes: {
      category: t("nav.grupo_comunidade", "Comunidade & Mascotes"),
      title: t("nav.construcoes", "Construções da Vila"),
      subtitle: "Progressão de obras acadêmicas: evolua monumentos e colabore com sua turma",
    },
    settings: {
      category: t("nav.grupo_produtividade", "Preferências"),
      title: t("nav.configuracoes", "Configurações"),
      subtitle: "Idioma, tema, acessibilidade e opções do aplicativo",
    },
  };

  const currentInfo = titles[currentTab] || titles.dashboard;

  return (
    <header
      id="app-header"
      className="bg-[var(--app-card)] border-b border-[var(--app-border)] px-4 sm:px-8 py-3 flex justify-between items-center sticky top-0 z-40 text-[var(--app-text)] transition-colors shadow-xs"
    >
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 md:hidden text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] cursor-pointer"
          aria-label="Abrir Menu Lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="uppercase text-[10px] tracking-widest text-[var(--app-primary)] font-extrabold font-mono">
              {currentInfo.category}
            </span>
            {currentTab === "lumina" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                <Sparkles className="w-3 h-3" /> Tutoria Ativa
              </span>
            )}
          </div>
          <h3
            id="current-title"
            className="font-extrabold text-[var(--app-text)] text-base sm:text-lg tracking-tight leading-tight flex items-center gap-2 mt-0.5"
          >
            {currentInfo.title}
          </h3>
        </div>
      </div>
    </header>
  );
};
