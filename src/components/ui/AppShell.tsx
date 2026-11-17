import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Gamepad2,
  Building2,
  Trophy,
  Layers,
  Users,
  LogOut,
  Zap,
  Coins,
  Settings,
  ChevronRight,
  Shield,
  HelpCircle,
  Eye,
  Sliders,
  Menu,
  Sparkles,
  Award,
  ListTodo,
  Calendar,
  Timer,
  ChevronDown,
} from "lucide-react";
import { TopBar } from "./TopBar";
import { TabBar, CanonicalTabId } from "./TabBar";
import { NavigationRail } from "./NavigationRail";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { AllMenusModal } from "./AllMenusModal";
import { Snackbar } from "./Snackbar";
import { UserProfile, CustomThemeColors } from "../../types";
import { calculateLevelFromXp } from "../../features/progression/levelSystem";

export interface AppShellProps {
  currentTab: CanonicalTabId;
  onTabChange: (tab: CanonicalTabId) => void;
  subTitle?: string;
  canGoBack?: boolean;
  onBack?: () => void;
  user: UserProfile;
  currentTheme?: CustomThemeColors;
  modoFoco: boolean;
  onToggleModoFoco: (ativo: boolean) => void;
  onLogout: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onOpenWallet?: () => void;
  onOpenSettings?: () => void;
  onOpenAccessibility?: () => void;
  onNavigateToItem?: (destino: { tab: CanonicalTabId; subView?: string }) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  subTitle,
  canGoBack = false,
  onBack,
  user,
  currentTheme,
  modoFoco,
  onToggleModoFoco,
  onLogout,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenWallet,
  onOpenSettings,
  onOpenAccessibility,
  onNavigateToItem,
  children,
}) => {
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [allMenusOpen, setAllMenusOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    id: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // Informações de nível e XP calculadas
  const progression = useMemo(() => {
    const xpTotal = user.xp || 0;
    return calculateLevelFromXp(xpTotal);
  }, [user.xp]);

  // Escuta atalhos Ctrl+K / Cmd+K (Busca) e tecla M (Todos os Menus)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (
        (e.key.toLowerCase() === "m" || e.key.toLowerCase() === "menu") &&
        !["input", "textarea", "select"].includes((e.target as HTMLElement)?.tagName?.toLowerCase() || "")
      ) {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          // Tecla M abre a central de menus quando não estiver digitando
          // setAllMenusOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Escuta evento global de snackbar com desfazer
  useEffect(() => {
    const handleShowSnackbar = (e: any) => {
      if (e.detail) {
        setSnackbar({
          id: String(Date.now()),
          message: e.detail.message,
          actionLabel: e.detail.actionLabel || "Desfazer",
          onAction: e.detail.onUndo,
        });
      }
    };
    window.addEventListener("app:show-snackbar", handleShowSnackbar);
    return () => window.removeEventListener("app:show-snackbar", handleShowSnackbar);
  }, []);

  // Título canônico da aba ativa
  const getTabTitle = (tab: CanonicalTabId): string => {
    switch (tab) {
      case "inicio":
        return t("nav.inicio", "Início • Painel Geral");
      case "estudar":
        return t("nav.estudar", "Estudar • Central Acadêmica IFES");
      case "games":
        return t("nav.games", "Games & Atividades Gamificadas");
      case "cidades":
        return t("nav.cidades", "Cidades do Conhecimento");
      case "eventos":
        return t("nav.eventos", "IFES Live Events & Torneios");
      case "colecao":
        return t("nav.colecao", "Central de Coleções & Baús");
      case "perfil":
        return t("nav.perfil", "Perfil & Configurações");
      default:
        return "APP IFES Brain Studio";
    }
  };

  const handleSubNavigate = (tab: CanonicalTabId, subView?: string) => {
    if (onNavigateToItem) {
      onNavigateToItem({ tab, subView });
    } else {
      onTabChange(tab);
    }
  };

  // Seções organizadas da navegação desktop
  const navSections = [
    {
      groupTitle: "Área Acadêmica & Painel",
      items: [
        {
          id: "inicio" as CanonicalTabId,
          label: "1. Início",
          badge: "Geral",
          icon: LayoutDashboard,
          subLinks: [
            { label: "Painel Geral", subView: undefined },
            { label: "Missões Diárias", subView: "missoes" },
            { label: "Próximas Atividades", subView: "atividades" },
          ],
        },
        {
          id: "estudar" as CanonicalTabId,
          label: "2. Estudar",
          badge: "AVA IFES",
          icon: BookOpen,
          subLinks: [
            { label: "Minhas Matérias", subView: "materias" },
            { label: "Atividades & Tarefas", subView: "atividades" },
            { label: "Avaliações & Notas", subView: "avaliacoes" },
            { label: "Desempenho", subView: "desempenho" },
            { label: "Ferramentas de Apoio", subView: "ferramentas" },
          ],
        },
      ],
    },
    {
      groupTitle: "Central de Games & Mundo",
      items: [
        {
          id: "games" as CanonicalTabId,
          label: "3. Games",
          badge: "Quizzes & IA",
          icon: Gamepad2,
          subLinks: [
            { label: "Quiz Battle com IA", subView: "quiz_battle" },
            { label: "Jogo da Memória", subView: "memory_cards" },
            { label: "Mestre das Palavras", subView: "word_master" },
            { label: "Corrida Matemática", subView: "math_rush" },
            { label: "Desafio Mental", subView: "brain_challenge" },
            { label: "Jornada 100 Níveis", subView: "jornada" },
            { label: "Rankings", subView: "rankings" },
          ],
        },
        {
          id: "cidades" as CanonicalTabId,
          label: "4. Cidades",
          badge: "Construção",
          icon: Building2,
          subLinks: [
            { label: "Cidade Atual", subView: undefined },
            { label: "Construções", subView: "construcoes" },
            { label: "Monumentos", subView: "monumentos" },
          ],
        },
        {
          id: "eventos" as CanonicalTabId,
          label: "5. Eventos",
          badge: "Live",
          icon: Trophy,
          subLinks: [
            { label: "Torneios ao Vivo", subView: "torneios" },
            { label: "Temporada", subView: "temporada" },
          ],
        },
        {
          id: "colecao" as CanonicalTabId,
          label: "6. Coleção",
          badge: "Cartas",
          icon: Layers,
          subLinks: [
            { label: "Álbum de Figurinhas", subView: "album" },
            { label: "Baús & Pacotes", subView: "baus" },
            { label: "Trocas", subView: "trocas" },
          ],
        },
      ],
    },
    {
      groupTitle: "Conta & Sistema",
      items: [
        {
          id: "perfil" as CanonicalTabId,
          label: "7. Perfil",
          badge: "Config",
          icon: Users,
          subLinks: [
            { label: "Visão Geral & XP", subView: "geral" },
            { label: "Extrato de Moedas", subView: "extrato" },
            { label: "Ajustes & Temas", subView: "config" },
            { label: "Acessibilidade", subView: "acessibilidade" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="h-screen flex w-full bg-[var(--app-bg)] text-[var(--app-text)] overflow-hidden transition-colors duration-300">
      {/* 1. Sidebar Desktop Reorganizada (≥ 1024px) */}
      <aside
        role="navigation"
        aria-label="Barra Lateral de Navegação"
        className="hidden lg:flex flex-col justify-between w-72 border-r border-[var(--app-border)] bg-[var(--app-card)] select-none shrink-0 overflow-y-auto scrollbar-none"
      >
        <div className="p-4 space-y-4">
          {/* Logo Brand Oficial IFES */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-[var(--app-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--app-primary)] to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
                IF
              </div>
              <div>
                <span className="font-black text-base tracking-tight text-[var(--app-text)] block leading-none">
                  APP IFES
                </span>
                <span className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase tracking-wider">
                  {modoFoco ? "Modo Foco Ativo" : "Plataforma de Estudos"}
                </span>
              </div>
            </div>

            {/* Botão de Central de Todos os Menus */}
            <button
              type="button"
              onClick={() => setAllMenusOpen(true)}
              className="p-2 rounded-xl text-[var(--app-primary)] hover:bg-[var(--app-primary)]/10 transition cursor-pointer"
              title="Abrir Central de Todos os Menus (Visualização Completa)"
              aria-label="Central de Menus"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mini Card do Estudante (Nível, XP, Moedas, Energia) */}
          <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)]/60 border border-[var(--app-border)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--app-primary)]/20 text-[var(--app-primary)] font-black text-xs flex items-center justify-center">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : "IF"}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-[var(--app-text)] block truncate leading-tight">
                    {user.name || "Estudante IFES"}
                  </span>
                  <span className="text-[10px] text-indigo-500 font-bold block leading-none">
                    Nível {progression.level} • {progression.currentMilestone.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de XP */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-[var(--app-text-muted)]">
                <span>XP para o Nível {progression.level + 1}</span>
                <span>{progression.progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--app-border)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, Math.min(100, progression.progressPercent))}%` }}
                />
              </div>
            </div>

            {/* Moedas & Energia */}
            <div className="flex items-center justify-between pt-1 border-t border-[var(--app-border)]/50 text-xs font-black">
              <button
                type="button"
                onClick={onOpenWallet}
                className="flex items-center gap-1.5 text-amber-500 hover:text-amber-600 transition cursor-pointer"
                title="Abrir Extrato de Moedas"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>{user.coins ?? 250} IF Coins</span>
              </button>
              <div className="flex items-center gap-1 text-blue-500" title="Energia">
                <Zap className="w-3.5 h-3.5 fill-blue-500" />
                <span>{user.energy ?? 50}/{user.maxEnergy ?? 50}</span>
              </div>
            </div>
          </div>

          {/* Menus Organizados por Grupos */}
          <div className="space-y-4">
            {navSections.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] px-2.5 block mb-1">
                  {group.groupTitle}
                </span>

                <nav className="space-y-1" aria-label={group.groupTitle}>
                  {group.items.map((item) => {
                    const isActive = currentTab === item.id;
                    const Icon = item.icon;

                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => onTabChange(item.id)}
                          aria-current={isActive ? "page" : undefined}
                          className={`w-full min-h-[42px] px-3 py-2 rounded-xl flex items-center justify-between text-xs font-bold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] ${
                            isActive
                              ? "bg-[var(--app-primary)] text-white shadow-xs"
                              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        </button>

                        {/* Sub-itens Rápidos Visíveis quando a Aba Está Ativa */}
                        {isActive && item.subLinks && item.subLinks.length > 0 && (
                          <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-[var(--app-primary)]/30 ml-4 animate-in fade-in duration-200">
                            {item.subLinks.map((sub, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleSubNavigate(item.id, sub.subView)}
                                className="w-full text-left px-2 py-1 rounded-lg text-[11px] font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary)]/10 transition cursor-pointer flex items-center gap-1.5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-primary)]/60" />
                                <span className="truncate">{sub.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé da Sidebar Desktop */}
        <div className="p-4 border-t border-[var(--app-border)] bg-[var(--app-card-secondary)]/30 space-y-2">
          {/* Botão de Central Geral */}
          <button
            type="button"
            onClick={() => setAllMenusOpen(true)}
            className="w-full py-2 px-3 rounded-xl border border-[var(--app-primary)]/30 bg-[var(--app-primary)]/10 hover:bg-[var(--app-primary)]/20 text-[var(--app-primary)] text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Central de Todos os Menus</span>
          </button>

          {/* Toggle de Modo Foco */}
          <button
            type="button"
            onClick={() => onToggleModoFoco(!modoFoco)}
            className={`w-full p-2 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
              modoFoco
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-card-secondary)]"
            }`}
            title="Oculta gamificação para foco estrito nos estudos"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Modo Foco</span>
            </div>
            <span className="text-[10px] uppercase font-black">
              {modoFoco ? "Ligado" : "Desligado"}
            </span>
          </button>

          {/* Atalho de Acessibilidade */}
          {onOpenAccessibility && (
            <button
              type="button"
              onClick={onOpenAccessibility}
              className="w-full px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] flex items-center gap-2 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Acessibilidade</span>
            </button>
          )}
        </div>
      </aside>

      {/* 2. Navigation Rail Tablet (768px - 1023px) */}
      <NavigationRail currentTab={currentTab} onTabChange={onTabChange} />

      {/* 3. Área Principal do Conteúdo */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* TopBar Enxuta e Acessível */}
        <TopBar
          title={getTabTitle(currentTab)}
          subtitle={subTitle}
          canGoBack={canGoBack}
          onBack={onBack}
          energy={user.energy ?? 50}
          maxEnergy={user.maxEnergy ?? 50}
          coins={modoFoco ? undefined : (user.coins ?? 250)}
          onOpenWallet={onOpenWallet}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={onOpenNotifications}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenAllMenus={() => setAllMenusOpen(true)}
        />

        {/* Viewport de Conteúdo com Scroll Próprio */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto pb-20 md:pb-6 relative focus:outline-none"
        >
          {children}
        </main>

        {/* 4. TabBar Mobile (< 768px) */}
        <TabBar currentTab={currentTab} onTabChange={onTabChange} />
      </div>

      {/* Modal Central de Todos os Menus (Visualização 7 Áreas) */}
      <AllMenusModal
        isOpen={allMenusOpen}
        onClose={() => setAllMenusOpen(false)}
        currentTab={currentTab}
        onNavigate={handleSubNavigate}
        userLevel={progression.level}
        userCoins={user.coins ?? 0}
        userEnergy={user.energy ?? 50}
        modoFoco={modoFoco}
        onToggleModoFoco={onToggleModoFoco}
      />

      {/* Modal de Busca Global (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(route: string) => {
          setSearchOpen(false);
          const parts = route.replace(/^\//, "").split("/");
          const tab = (parts[0] || "inicio") as CanonicalTabId;
          const subView = parts[1];
          if (onNavigateToItem) {
            onNavigateToItem({ tab, subView });
          } else {
            onTabChange(tab);
          }
        }}
      />

      {/* Snackbar Global de 8 Segundos com "Desfazer" */}
      {snackbar && (
        <Snackbar
          id={snackbar.id}
          message={snackbar.message}
          actionLabel={snackbar.actionLabel}
          onAction={snackbar.onAction}
          onClose={() => setSnackbar(null)}
          duration={8000}
        />
      )}
    </div>
  );
};
