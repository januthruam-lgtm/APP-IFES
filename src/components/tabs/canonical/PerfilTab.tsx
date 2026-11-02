import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Sun,
  Moon,
  Globe,
  Eye,
  Bell,
  Building2,
  Crown,
  Database,
  Shield,
  HelpCircle,
  Search,
  ChevronRight,
  ArrowLeft,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  LogOut,
  Trash2,
  Save,
  CheckCircle2,
  Volume2,
  Type,
  Maximize2,
  RotateCcw,
  Coins,
  Trophy,
  Flame,
  Zap,
  Award,
  Activity,
  Users,
  Target,
  BookOpen,
} from "lucide-react";
import { UserProfile } from "../../../types";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Switch } from "../../ui/Switch";
import { LanguageSelector } from "../../LanguageSelector";
import { useAccessibility, TextScale, ColorBlindMode } from "../../../lib/accessibility";
import { MeusSistemasView } from "../../../features/instituicao/components/MeusSistemasView";
import { getTemaAtual, alternarTema, TemaTipo, aplicarTema } from "../../../utils/themeManager";
import { ExtratoMoedasView } from "../../../features/economia/components/ExtratoMoedasView";
import { calculateLevelFromXp } from "../../../features/progression/levelSystem";

export type SecaoConfigId =
  | "menu"
  | "conta"
  | "aparencia"
  | "foco"
  | "idioma"
  | "acessibilidade"
  | "notificacoes"
  | "instituicao"
  | "planos"
  | "offline"
  | "privacidade"
  | "sobre";

export interface PerfilTabProps {
  user: UserProfile;
  initialSubView?: string;
  modoFoco: boolean;
  onToggleModoFoco: (ativo: boolean) => void;
  onSaveUser: (updatedUser: Partial<UserProfile>) => void;
  onLogout: () => void;
  onResetCourses?: () => void;
  onReopenTutorial?: () => void;
  onOpenPaywall?: () => void;
  onOpenOfflineDetail?: () => void;
  onOpenOnlineUsers?: () => void;
}

export const PerfilTab: React.FC<PerfilTabProps> = ({
  user,
  initialSubView,
  modoFoco,
  onToggleModoFoco,
  onSaveUser,
  onLogout,
  onResetCourses,
  onReopenTutorial,
  onOpenPaywall,
  onOpenOfflineDetail,
  onOpenOnlineUsers,
}) => {
  const { t, i18n } = useTranslation();
  const [abaPrincipal, setAbaPrincipal] = useState<"geral" | "extrato" | "config">(() => {
    if (initialSubView === "extrato" || initialSubView === "carteira") return "extrato";
    if (initialSubView === "config" || initialSubView === "settings") return "config";
    return "geral";
  });
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoConfigId>("menu");
  const [busca, setBusca] = useState("");
  const [temaAtual, setTemaAtual] = useState<TemaTipo>(getTemaAtual);
  const { settings: a11ySettings, updateSetting, resetDefaults } = useAccessibility();

  // Estados de edição de conta
  const [nome, setNome] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [sucessoSalvar, setSucessoSalvar] = useState(false);

  // Lista canônica de seções de configurações
  const secoes = [
    {
      id: "conta" as SecaoConfigId,
      titulo: "Conta e Perfil",
      descricao: "Gerencie seu nome de exibição, e-mail institucional e dados de estudante.",
      icon: User,
      tags: ["nome", "email", "perfil", "avatar", "estudante", "senha", "logout"],
    },
    {
      id: "aparencia" as SecaoConfigId,
      titulo: "Aparência",
      descricao: "Alterne entre os temas Claro (Creme) e Escuro (Slate & Laranja).",
      icon: Sun,
      tags: ["tema", "escuro", "claro", "cores", "paleta", "modo"],
    },
    {
      id: "foco" as SecaoConfigId,
      titulo: "Modo Foco",
      descricao: "Oculte moedas, XP e elementos de jogo para uma experiência de estudo minimalista.",
      icon: Sliders,
      tags: ["foco", "zen", "minimalista", "esconder moedas", "sem jogo"],
    },
    {
      id: "idioma" as SecaoConfigId,
      titulo: "Idioma do Aplicativo",
      descricao: "Selecione o idioma da interface (Português, Inglês, Espanhol e outros).",
      icon: Globe,
      tags: ["idioma", "lingua", "language", "tradução", "ingles", "espanhol"],
    },
    {
      id: "acessibilidade" as SecaoConfigId,
      titulo: "Acessibilidade e Inclusão",
      descricao: "Tamanho de texto, alto contraste, daltonismo, redução de movimento e leitor de tela.",
      icon: Eye,
      tags: ["acessibilidade", "inclusão", "fonte", "texto grande", "contraste", "daltonismo", "voz"],
    },
    {
      id: "notificacoes" as SecaoConfigId,
      titulo: "Notificações e Lembretes",
      descricao: "Avisos de prazos de trabalhos, lembretes de ofensiva diária e convites de estudo.",
      icon: Bell,
      tags: ["notificacao", "alerta", "lembrete", "prazos", "horarios"],
    },
    {
      id: "instituicao" as SecaoConfigId,
      titulo: "Instituição e Sistemas",
      descricao: "Gerencie a conexão segura com AVA Moodle, IFES e sistemas acadêmicos.",
      icon: Building2,
      tags: ["moodle", "ifes", "ava", "matricula", "sincronizar", "campus"],
    },
    {
      id: "planos" as SecaoConfigId,
      titulo: "Planos e Assinatura",
      descricao: "Conheça os benefícios da Lumina Pro e gerencie sua assinatura.",
      icon: Crown,
      tags: ["pro", "plano", "gratis", "assinatura", "lumina pro", "ilimitado"],
    },
    {
      id: "offline" as SecaoConfigId,
      titulo: "Offline e Armazenamento",
      descricao: "Controle os dados salvos no dispositivo e gerencie o cache de disciplinas.",
      icon: Database,
      tags: ["offline", "cache", "armazenamento", "indexeddb", "limpar dados"],
    },
    {
      id: "privacidade" as SecaoConfigId,
      titulo: "Privacidade e Dados",
      descricao: "Consentimentos de privacidade, criptografia local e exclusão definitiva de conta.",
      icon: Shield,
      tags: ["privacidade", "lgpd", "dados", "excluir conta", "segurança"],
    },
    {
      id: "sobre" as SecaoConfigId,
      titulo: "Sobre e Ajuda",
      descricao: "Perguntas frequentes, canal de suporte, versão do app e tutoriais.",
      icon: HelpCircle,
      tags: ["ajuda", "suporte", "faq", "versao", "tutorial", "contato"],
    },
  ];

  // Filtro de busca interna
  const secoesFiltradas = useMemo(() => {
    if (!busca.trim()) return secoes;
    const termo = busca.toLowerCase().trim();
    return secoes.filter(
      (s) =>
        s.titulo.toLowerCase().includes(termo) ||
        s.descricao.toLowerCase().includes(termo) ||
        s.tags.some((t) => t.toLowerCase().includes(termo))
    );
  }, [busca, secoes]);

  const handleSalvarConta = () => {
    onSaveUser({
      name: nome,
      email: email,
    });
    setSucessoSalvar(true);
    setTimeout(() => setSucessoSalvar(false), 3000);
  };

  const handleToggleTema = () => {
    const novo = alternarTema();
    setTemaAtual(novo);
  };

  const userUid = user.id || user.uid || user.email || "local_user";
  const userXp = user.xp || 0;
  const { level: calculatedLevel, currentMilestone, nextMilestone, progressPercent } = calculateLevelFromXp(userXp);
  const activeLevel = user.level || calculatedLevel;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-3">
          {abaPrincipal === "config" && secaoAtiva !== "menu" && (
            <button
              onClick={() => setSecaoAtiva("menu")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--app-text)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer"
              aria-label="Voltar para a lista de configurações"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-text)] tracking-tight">
              {abaPrincipal === "geral"
                ? "Central do Estudante IFES"
                : abaPrincipal === "extrato"
                ? "Extrato & Carteira de Moedas"
                : secaoAtiva === "menu"
                ? "Perfil e Configurações"
                : secoes.find((s) => s.id === secaoAtiva)?.titulo}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              {abaPrincipal === "geral"
                ? "Acompanhe seu nível, conquistas, histórico de estudos e ofensiva diária."
                : abaPrincipal === "extrato"
                ? "Auditoria e extrato contábil de entradas e saídas de moedas."
                : secaoAtiva === "menu"
                ? "Personalize sua conta, preferências de estudo, acessibilidade e temas."
                : secoes.find((s) => s.id === secaoAtiva)?.descricao}
            </p>
          </div>
        </div>
      </div>

      {/* Navegação Canônica de Sub-Abas do Perfil */}
      <div className="flex items-center gap-2 border-b border-[var(--app-border)] pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => {
            setAbaPrincipal("geral");
            setSecaoAtiva("menu");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            abaPrincipal === "geral"
              ? "bg-[var(--app-primary)] text-white shadow-sm"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Perfil & Estatísticas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAbaPrincipal("extrato");
            setSecaoAtiva("menu");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            abaPrincipal === "extrato"
              ? "bg-[var(--app-primary)] text-white shadow-sm"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <Coins className="w-4 h-4 text-amber-500" />
          <span>Extrato de Moedas</span>
        </button>

        <button
          type="button"
          onClick={() => setAbaPrincipal("config")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
            abaPrincipal === "config"
              ? "bg-[var(--app-primary)] text-white shadow-sm"
              : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-card-secondary)]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Ajustes & Configurações</span>
        </button>
      </div>

      {/* 1. ABA GERAL: ESTATÍSTICAS, NÍVEL, XP, CONQUISTAS E AMIGOS */}
      {abaPrincipal === "geral" && (
        <div className="space-y-6">
          {/* Card Resumo do Estudante */}
          <Card
            variant="elevated"
            padding="lg"
            className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[var(--app-card)] to-[var(--app-card-secondary)]"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-full bg-[var(--app-primary)]/15 border-2 border-[var(--app-primary)] flex items-center justify-center text-2xl font-black text-[var(--app-primary)] shadow-sm">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h2 className="text-xl font-black text-[var(--app-text)]">{user.name || "Estudante"}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/30">
                    {currentMilestone?.title || "Estudante Dedicado"}
                  </span>
                </div>
                <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                  {user.email || "Sem e-mail cadastrado"} • {user.ifesAccount?.campusName || "IFES"}
                </p>
                <div className="mt-1 flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-[11px] font-bold text-[var(--app-primary)]">
                    Nível {activeLevel}
                  </span>
                  <span className="text-xs text-[var(--app-text-muted)]">•</span>
                  <span className="text-[11px] text-[var(--app-text-muted)] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    {user.streakDays || 1} dias de ofensiva
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAbaPrincipal("config");
                setSecaoAtiva("conta");
              }}
            >
              Editar Perfil
            </Button>
          </Card>

          {/* Barra de Experiência e Nível (100 Níveis) */}
          <Card variant="default" padding="lg" className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[var(--app-text)] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                Progresso para o Nível {activeLevel + 1}
              </span>
              <span className="font-mono text-[var(--app-primary)] font-black">
                {userXp} / {nextMilestone?.xpRequired || (activeLevel * 100)} XP ({progressPercent}%)
              </span>
            </div>

            <div className="w-full bg-[var(--app-card-secondary)] h-3 rounded-full overflow-hidden border border-[var(--app-border)]">
              <div
                className="bg-gradient-to-r from-amber-500 to-[var(--app-primary)] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--app-text-muted)]">
              <span>Marco Atual: {currentMilestone?.title}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Bônus de evolução: +{currentMilestone?.coinsReward || 150} moedas
              </span>
            </div>
          </Card>

          {/* Grade de Indicadores Vitais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card variant="default" padding="md" className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--app-text-muted)]">Saldo de Moedas</span>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-amber-500">
                {user.coins ?? 250} 🪙
              </div>
              <button
                type="button"
                onClick={() => setAbaPrincipal("extrato")}
                className="text-[10px] font-bold text-[var(--app-primary)] hover:underline cursor-pointer block pt-1"
              >
                Ver Extrato & Auditoria →
              </button>
            </Card>

            <Card variant="default" padding="md" className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--app-text-muted)]">Energia Vital</span>
                <Zap className="w-4 h-4 text-[var(--app-primary)]" />
              </div>
              <div className="text-xl font-black text-[var(--app-text)] font-mono">
                {user.energy}/{user.maxEnergy || 50} ⚡
              </div>
              <span className="text-[10px] text-[var(--app-text-muted)] block pt-1">
                Regenera 1 a cada 5 min
              </span>
            </Card>

            <Card variant="default" padding="md" className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--app-text-muted)]">Ofensiva Diária</span>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-xl font-black text-orange-500">
                {user.streakDays || 1} Dias 🔥
              </div>
              <span className="text-[10px] text-[var(--app-text-muted)] block pt-1">
                Estudo diário contínuo
              </span>
            </Card>

            <Card variant="default" padding="md" className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[var(--app-text-muted)]">Mascote 3D</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-lg font-black text-[var(--app-text)] truncate">
                {user.pet?.name || "Lumina Pet"}
              </div>
              <span className="text-[10px] text-[var(--app-text-muted)] block pt-1">
                Nível {user.pet?.level || 1} • {user.pet?.happiness ?? 100}% Feliz
              </span>
            </Card>
          </div>

          {/* Conquistas e Insígnias */}
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-[var(--app-text)] tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Conquistas e Insígnias Conquistadas
              </h3>
              <span className="text-xs font-bold text-[var(--app-text-muted)]">
                {(user.unlockedBadges || []).length} Desbloqueadas
              </span>
            </div>

            {(!user.unlockedBadges || user.unlockedBadges.length === 0) ? (
              <div className="p-6 rounded-2xl bg-[var(--app-card-secondary)] text-center text-xs text-[var(--app-text-muted)] space-y-2 border border-dashed border-[var(--app-border)]">
                <Award className="w-8 h-8 text-[var(--app-text-muted)] mx-auto opacity-40" />
                <p>Nenhuma insígnia conquistada ainda.</p>
                <p className="text-[11px]">Jogue minigames e complete tarefas acadêmicas para desbloquear insígnias exclusivas!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {user.unlockedBadges.map((badge: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-sm shrink-0">
                      🏆
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate text-[var(--app-text)]">{badge}</h4>
                      <span className="text-[10px] text-emerald-500 font-semibold">Conquistada</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Comunidade e Colegas Online */}
          {onOpenOnlineUsers && (
            <Card variant="default" padding="lg" className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--app-text)]">Estudantes do IFES Online</h4>
                  <p className="text-xs text-[var(--app-text-muted)]">
                    Converse em tempo real e troque cartas com colegas do campus
                  </p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={onOpenOnlineUsers}>
                Ver Colegas Online
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* 2. ABA EXTRATO DE MOEDAS: AUDITORIA, ENTRADAS E SAÍDAS MONETÁRIAS */}
      {abaPrincipal === "extrato" && (
        <ExtratoMoedasView
          uid={userUid}
          saldoAtual={user.coins ?? 250}
        />
      )}

      {/* 3. ABA AJUSTES & CONFIGURAÇÕES: MENU E SUBPÁGINAS */}
      {abaPrincipal === "config" && (
        <>
          {secaoAtiva === "menu" && (
            <div className="space-y-6">
          {/* Card Resumo do Usuário */}
          <Card
            variant="elevated"
            padding="lg"
            className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[var(--app-card)] to-[var(--app-card-secondary)]"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-full bg-[var(--app-primary)]/15 border-2 border-[var(--app-primary)] flex items-center justify-center text-2xl font-black text-[var(--app-primary)]">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-xl font-black text-[var(--app-text)]">{user.name || "Estudante"}</h2>
                <p className="text-xs text-[var(--app-text-muted)]">{user.email || "Sem e-mail cadastrado"}</p>
                <div className="mt-1 flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-[11px] font-bold text-[var(--app-primary)]">
                    Nível {user.level || 1}
                  </span>
                  <span className="text-xs text-[var(--app-text-muted)]">•</span>
                  <span className="text-[11px] text-[var(--app-text-muted)]">
                    {user.streakDays || 1} dias de ofensiva
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSecaoAtiva("conta")}
            >
              Editar Perfil
            </Button>
          </Card>

          {/* Campo de Busca Interna de Configurações */}
          <div className="relative">
            <Input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar nas configurações (ex: tema, fonte, idioma, moodle)..."
              leftIcon={<Search className="w-4 h-4 text-[var(--app-text-muted)]" />}
            />
          </div>

          {/* Lista Agrupada de Configurações */}
          <div className="space-y-2">
            {secoesFiltradas.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--app-text-muted)]">
                Nenhuma configuração encontrada para "{busca}".
              </div>
            ) : (
              secoesFiltradas.map((secao) => {
                const Icon = secao.icon;
                return (
                  <div
                    key={secao.id}
                    onClick={() => setSecaoAtiva(secao.id)}
                    className="p-4 rounded-2xl bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[var(--app-card-secondary)] group-hover:bg-[var(--app-primary)]/10 text-[var(--app-text)] group-hover:text-[var(--app-primary)] flex items-center justify-center shrink-0 transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[var(--app-text)] group-hover:text-[var(--app-primary)] transition">
                          {secao.titulo}
                        </h3>
                        <p className="text-xs text-[var(--app-text-muted)] truncate">
                          {secao.descricao}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--app-text-muted)] group-hover:translate-x-0.5 transition shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Subpágina: Conta e Perfil */}
      {secaoAtiva === "conta" && (
        <Card variant="default" padding="lg" className="space-y-5">
          {sucessoSalvar && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dados salvos com sucesso!</span>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
            />
            <Input
              label="E-mail Institucional ou Pessoal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button variant="primary" onClick={handleSalvarConta} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </Button>
            <Button variant="secondary" onClick={() => setSecaoAtiva("menu")}>
              Voltar
            </Button>
          </div>

          <div className="pt-6 border-t border-[var(--app-border)] space-y-3">
            <h4 className="text-xs font-black uppercase text-[var(--app-text-muted)] tracking-wider">
              Ações da Conta
            </h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={onReopenTutorial}>
                Rever Tutorial Inicial
              </Button>
              <Button variant="destructive" size="sm" onClick={onLogout} className="flex items-center gap-1.5">
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Subpágina: Aparência (Claro e Escuro) */}
      {secaoAtiva === "aparencia" && (
        <Card variant="default" padding="lg" className="space-y-6">
          <p className="text-sm text-[var(--app-text-muted)]">
            O Brain Studio adota rigorosamente dois temas oficiais com paleta creme e laranja para conforto visual e foco na leitura.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => {
                aplicarTema("claro");
                setTemaAtual("claro");
              }}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between h-36 ${
                temaAtual === "claro"
                  ? "border-[var(--app-primary)] bg-amber-500/5 ring-2 ring-[var(--app-primary)]/20"
                  : "border-[var(--app-border)] bg-[var(--app-card)] hover:border-[var(--app-border)]/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Sun className="w-5 h-5" />
                </div>
                {temaAtual === "claro" && (
                  <span className="text-xs font-bold text-[var(--app-primary)]">Ativo</span>
                )}
              </div>
              <div>
                <h4 className="font-black text-sm text-[var(--app-text)]">Tema Claro (Creme)</h4>
                <p className="text-xs text-[var(--app-text-muted)]">Paleta suave de papel creme e âmbar.</p>
              </div>
            </div>

            <div
              onClick={() => {
                aplicarTema("escuro");
                setTemaAtual("escuro");
              }}
              className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between h-36 ${
                temaAtual === "escuro"
                  ? "border-[var(--app-primary)] bg-amber-500/5 ring-2 ring-[var(--app-primary)]/20"
                  : "border-[var(--app-border)] bg-[var(--app-card)] hover:border-[var(--app-border)]/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                  <Moon className="w-5 h-5" />
                </div>
                {temaAtual === "escuro" && (
                  <span className="text-xs font-bold text-[var(--app-primary)]">Ativo</span>
                )}
              </div>
              <div>
                <h4 className="font-black text-sm text-[var(--app-text)]">Tema Escuro (Slate & Laranja)</h4>
                <p className="text-xs text-[var(--app-text-muted)]">Fundo escuro profundo para estudos noturnos.</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Subpágina: Modo Foco */}
      {secaoAtiva === "foco" && (
        <Card variant="default" padding="lg" className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--app-text)]">Ativar Modo Foco</h3>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-1">
                Ao ativar o Modo Foco, todos os contadores de moedas, XP e notificações de jogo são ocultados da interface, concentrando 100% da sua atenção na leitura e nas matérias acadêmicas.
              </p>
            </div>
            <Switch
              checked={modoFoco}
              onChange={onToggleModoFoco}
              ariaLabel="Alternar Modo Foco"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] space-y-2">
            <p className="font-bold text-[var(--app-text)]">O que muda com o Modo Foco:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Oculta o saldo de moedas e barra de XP do cabeçalho.</li>
              <li>Mantém o foco nas disciplinas, tarefas e leituras.</li>
              <li>Seu progresso, ofensiva e saldo continuam sendo computados em segundo plano.</li>
            </ul>
          </div>
        </Card>
      )}

      {/* Subpágina: Idioma */}
      {secaoAtiva === "idioma" && (
        <Card variant="default" padding="lg" className="space-y-4">
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
            Escolha o idioma de sua preferência. A tradução é aplicada instantaneamente em todas as telas.
          </p>
          <LanguageSelector />
        </Card>
      )}

      {/* Subpágina: Acessibilidade e Inclusão (Todas as opções preservadas, sem alegação WCAG) */}
      {secaoAtiva === "acessibilidade" && (
        <Card variant="default" padding="lg" className="space-y-6">
          <div>
            <h3 className="text-sm font-black uppercase text-[var(--app-text-muted)] tracking-wider">
              Acessibilidade e Inclusão
            </h3>
            <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
              Recursos de apoio visual, motor e cognitivo para tornar sua experiência o mais agradável e acessível possível.
            </p>
          </div>

          {/* Tamanho da Fonte */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--app-text)] flex items-center gap-2">
              <Type className="w-4 h-4 text-[var(--app-primary)]" />
              <span>Escala de Tamanho do Texto</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["default", "large", "larger", "max"] as TextScale[]).map((scale) => (
                <button
                  key={scale}
                  onClick={() => updateSetting("textSize", scale)}
                  className={`p-3 rounded-xl border text-xs font-bold transition cursor-pointer capitalize ${
                    a11ySettings.textSize === scale
                      ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-xs"
                      : "bg-[var(--app-card)] text-[var(--app-text)] border-[var(--app-border)] hover:bg-[var(--app-card-secondary)]"
                  }`}
                >
                  {scale === "default"
                    ? "Normal (100%)"
                    : scale === "large"
                    ? "Médio (125%)"
                    : scale === "larger"
                    ? "Grande (150%)"
                    : "Máximo (200%)"}
                </button>
              ))}
            </div>
          </div>

          {/* Redução de Movimento */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
            <div>
              <h4 className="text-sm font-bold text-[var(--app-text)]">Reduzir Movimento</h4>
              <p className="text-xs text-[var(--app-text-muted)]">
                Desativa animações e transições contínuas para prevenir desconforto visual.
              </p>
            </div>
            <Switch
              checked={a11ySettings.reducedMotion}
              onChange={(val) => updateSetting("reducedMotion", val)}
              ariaLabel="Reduzir Movimento"
            />
          </div>

          {/* Alto Contraste */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
            <div>
              <h4 className="text-sm font-bold text-[var(--app-text)]">Modo Alto Contraste</h4>
              <p className="text-xs text-[var(--app-text-muted)]">
                Aumenta a separação de bordas e contraste entre textos e planos de fundo.
              </p>
            </div>
            <Switch
              checked={a11ySettings.highContrast}
              onChange={(val) => updateSetting("highContrast", val)}
              ariaLabel="Alto Contraste"
            />
          </div>

          {/* Leitura em Voz Alta */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
            <div>
              <h4 className="text-sm font-bold text-[var(--app-text)]">Leitura em Voz Alta</h4>
              <p className="text-xs text-[var(--app-text-muted)]">
                Habilita leitura sintetizada de perguntas e resumos com 1 toque.
              </p>
            </div>
            <Switch
              checked={a11ySettings.screenReaderAuto}
              onChange={(val) => updateSetting("screenReaderAuto", val)}
              ariaLabel="Leitura em Voz Alta"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={resetDefaults}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restaurar Padrões de Acessibilidade</span>
          </Button>
        </Card>
      )}

      {/* Subpágina: Instituição e Sistemas */}
      {secaoAtiva === "instituicao" && (
        <Card variant="default" padding="lg">
          <MeusSistemasView />
        </Card>
      )}

      {/* Subpágina: Planos */}
      {secaoAtiva === "planos" && (
        <Card variant="default" padding="lg" className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-black text-[var(--app-text)]">Planos e Assinatura</h3>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
                Você está no plano Gratuito com acesso completo às matérias e exercícios.
              </p>
            </div>
            <Crown className="w-8 h-8 text-amber-500" />
          </div>

          <Button variant="primary" fullWidth onClick={onOpenPaywall}>
            Conhecer Benefícios do Lumina Pro
          </Button>
        </Card>
      )}

      {/* Subpágina: Offline e Armazenamento */}
      {secaoAtiva === "offline" && (
        <Card variant="default" padding="lg" className="space-y-4">
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
            O Brain Studio mantém suas disciplinas, tarefas e flashcards disponíveis mesmo sem conexão à internet através do IndexedDB.
          </p>

          <Button variant="secondary" onClick={onOpenOfflineDetail}>
            Gerenciar Cache de Disciplinas
          </Button>
        </Card>
      )}

      {/* Subpágina: Privacidade e Sobre */}
      {(secaoAtiva === "privacidade" || secaoAtiva === "sobre") && (
        <Card variant="default" padding="lg" className="space-y-4">
          <h3 className="text-base font-bold text-[var(--app-text)]">
            {secaoAtiva === "privacidade" ? "Privacidade e Segurança" : "Sobre o Brain Studio"}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
            {secaoAtiva === "privacidade"
              ? "Seus dados educacionais e credenciais do AVA Moodle são armazenados estritamente no seu dispositivo, com trânsito criptografado e sem compartilhamento com terceiros."
              : "Brain Studio v3.2.0 • Plataforma Autônoma de Estudos e Produtividade Acadêmica com Tutoria Socrática e Gamificação."}
          </p>
        </Card>
      )}
        </>
      )}
    </div>
  );
};
