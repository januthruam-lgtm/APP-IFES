/**
 * Brain Studio - Configuração Central de Navegação Guiada por Dados
 * Controla os itens, abas, ícones, rotas, chaves de feature flag e condições de desbloqueio.
 * Itens marcados com isEmBreve entram automaticamente na interface assim que sua feature flag for ativada.
 */

import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Gamepad2,
  Users,
  Building2,
  ShoppingBag,
  ListTodo,
  Calendar,
  Timer,
  Layers,
  Video,
  Castle,
  BookMarked,
  Sparkles,
  Award,
  Wallet,
  Settings,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  FolderLock,
  GraduationCap,
  Hammer,
} from "lucide-react";

import { isFeatureAtiva } from "./features.js";

/**
 * Definição canônica das 5 abas principais do aplicativo
 */
export const ABAS_CANONICAS = [
  {
    id: "inicio",
    labelKey: "nav.inicio",
    labelPadrao: "Início",
    rota: "/inicio",
    icone: LayoutDashboard,
  },
  {
    id: "estudar",
    labelKey: "nav.estudar",
    labelPadrao: "Estudar",
    rota: "/estudar",
    icone: BookOpen,
  },
  {
    id: "lumina",
    labelKey: "nav.lumina",
    labelPadrao: "Lumina",
    rota: "/lumina",
    icone: Brain,
    destaque: true,
  },
  {
    id: "jogo",
    labelKey: "nav.jogo",
    labelPadrao: "Jogo",
    rota: "/jogo",
    icone: Gamepad2,
  },
  {
    id: "perfil",
    labelKey: "nav.perfil",
    labelPadrao: "Perfil",
    rota: "/perfil",
    icone: Users,
  },
];

/**
 * Catálogo completo de itens da aplicação organizados por aba canônica e grupos
 */
export const ITENS_NAVEGACAO = [
  // ==========================================
  // ABA 1: INÍCIO
  // ==========================================
  {
    id: "hoje",
    aba: "inicio",
    labelKey: "nav.hoje",
    labelPadrao: "Hoje",
    rota: "/inicio",
    icone: LayoutDashboard,
    descricao: "Painel diário, tarefas imediatas e ofensiva",
    featureFlag: "fase0_fundacao",
  },

  // ==========================================
  // ABA 2: ESTUDAR
  // ==========================================
  // Grupo: Organizar
  {
    id: "disciplinas",
    aba: "estudar",
    grupo: "organizar",
    grupoKey: "nav.grupo_organizar",
    grupoPadrao: "Organizar",
    labelKey: "nav.disciplinas",
    labelPadrao: "Minhas Disciplinas",
    rota: "/estudar/disciplinas",
    icone: GraduationCap,
    descricao: "Grade curricular, tópicos e disciplinas ativas ou excluídas",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "tarefas",
    aba: "estudar",
    grupo: "organizar",
    grupoKey: "nav.grupo_organizar",
    grupoPadrao: "Organizar",
    labelKey: "nav.tarefas",
    labelPadrao: "Organizador de Tarefas",
    rota: "/estudar/tarefas",
    icone: ListTodo,
    descricao: "Metas de foco, prioridades e prazos sem incentivo financeiro",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "agenda",
    aba: "estudar",
    grupo: "organizar",
    grupoKey: "nav.grupo_organizar",
    grupoPadrao: "Organizar",
    labelKey: "nav.agenda",
    labelPadrao: "Agenda Compartilhada",
    rota: "/estudar/agenda",
    icone: Calendar,
    descricao: "Provas, entregas bimestrais e eventos acadêmicos",
    featureFlag: "fase0_fundacao",
  },

  // Grupo: Praticar
  {
    id: "flashcards",
    aba: "estudar",
    grupo: "praticar",
    grupoKey: "nav.grupo_praticar",
    grupoPadrao: "Praticar",
    labelKey: "nav.flashcards",
    labelPadrao: "Flashcards Anki",
    rota: "/estudar/flashcards",
    icone: Layers,
    descricao: "Repetição espaçada com algoritmo científico SM-2",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "simulados",
    aba: "estudar",
    grupo: "praticar",
    grupoKey: "nav.grupo_praticar",
    grupoPadrao: "Praticar",
    labelKey: "nav.simulados",
    labelPadrao: "Simulados 10Q",
    rota: "/estudar/simulados",
    icone: Gamepad2,
    descricao: "10 questões avaliativas geradas por matéria ou texto",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "quiz_arquivo",
    aba: "estudar",
    grupo: "praticar",
    grupoKey: "nav.grupo_praticar",
    grupoPadrao: "Praticar",
    labelKey: "nav.quiz_arquivo",
    labelPadrao: "Quiz por Arquivo*",
    rota: "/estudar/quiz-arquivo",
    icone: Sparkles,
    descricao: "Geração de questões a partir de PDFs e apostilas",
    featureFlag: "fase9_quiz_arquivo",
    isEmBreve: true,
  },
  {
    id: "metodos",
    aba: "estudar",
    grupo: "praticar",
    grupoKey: "nav.grupo_praticar",
    grupoPadrao: "Praticar",
    labelKey: "nav.metodos_estudo",
    labelPadrao: "Métodos de Estudo",
    rota: "/estudar/metodos",
    icone: Timer,
    descricao: "Cronômetro Pomodoro, Técnica Feynman e Active Recall",
    featureFlag: "fase0_fundacao",
  },

  // Grupo: Aprender
  {
    id: "cursos",
    aba: "estudar",
    grupo: "aprender",
    grupoKey: "nav.grupo_aprender",
    grupoPadrao: "Aprender",
    labelKey: "nav.cursos",
    labelPadrao: "Cursos Preparatórios*",
    rota: "/estudar/cursos",
    icone: BookOpen,
    descricao: "Cursos completos para ENEM, vestibulares e tecnologia",
    featureFlag: "fase10_cursos",
    isEmBreve: true,
  },
  {
    id: "biblioteca",
    aba: "estudar",
    grupo: "aprender",
    grupoKey: "nav.grupo_aprender",
    grupoPadrao: "Aprender",
    labelKey: "nav.biblioteca",
    labelPadrao: "Biblioteca & Acervo",
    rota: "/estudar/biblioteca",
    icone: BookOpen,
    descricao: "Acervo de obras clássicas em domínio público",
    featureFlag: "fase11_biblioteca_dicionario",
  },
  {
    id: "dicionario",
    aba: "estudar",
    grupo: "aprender",
    grupoKey: "nav.grupo_aprender",
    grupoPadrao: "Aprender",
    labelKey: "nav.dicionario",
    labelPadrao: "Dicionário Escolar",
    rota: "/estudar/dicionario",
    icone: BookMarked,
    descricao: "Busca offline, sinônimos e gramática contextual",
    featureFlag: "fase11_biblioteca_dicionario",
  },

  // Grupo: Estudar com outros
  {
    id: "sala_virtual",
    aba: "estudar",
    grupo: "cooperar",
    grupoKey: "nav.grupo_cooperar",
    grupoPadrao: "Estudar com Outros",
    labelKey: "nav.sala_estudos",
    labelPadrao: "Sala Virtual de Estudos",
    rota: "/estudar/sala-virtual",
    icone: Video,
    descricao: "Áudio, vídeo, compartilhamento e chat ao vivo com colegas",
    featureFlag: "fase0_fundacao",
  },

  // Grupo: Sistemas Conectados
  {
    id: "ava_ifes",
    aba: "estudar",
    grupo: "sistemas",
    grupoKey: "nav.grupo_sistemas",
    grupoPadrao: "Sistemas Conectados",
    labelKey: "nav.ava_ifes",
    labelPadrao: "AVA Moodle IFES",
    rota: "/estudar/ava",
    icone: Building2,
    descricao: "Sincronização oficial de notas, fóruns e questionários",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "sistemas_institucionais",
    aba: "estudar",
    grupo: "sistemas",
    grupoKey: "nav.grupo_sistemas",
    grupoPadrao: "Sistemas Conectados",
    labelKey: "nav.sistemas_conectados",
    labelPadrao: "Outros Sistemas Escolares*",
    rota: "/estudar/sistemas",
    icone: Building2,
    descricao: "Conectores com Google Classroom, Canvas e portais acadêmicos",
    featureFlag: "fase7_multi_instituicao",
    isEmBreve: true,
  },

  // ==========================================
  // ABA 3: LUMINA IA
  // ==========================================
  {
    id: "lumina_chat",
    aba: "lumina",
    labelKey: "nav.lumina",
    labelPadrao: "Lumina IA",
    rota: "/lumina",
    icone: Brain,
    descricao: "Tutora socrática, explicações graduadas e memória consentida",
    featureFlag: "fase8_lumina",
    destaque: true,
  },

  // ==========================================
  // ABA 4: JOGO & GAMIFICAÇÃO
  // ==========================================
  {
    id: "pet",
    aba: "jogo",
    labelKey: "nav.mascote",
    labelPadrao: "Mascote 3D",
    rota: "/jogo/pet",
    icone: Sparkles,
    descricao: "Cuidados, carinho, alimentação e evolução do seu companheiro",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "vilas",
    aba: "jogo",
    labelKey: "nav.construcoes",
    labelPadrao: "Construções da Vila",
    rota: "/jogo/vilas",
    icone: Hammer,
    descricao: "Cidades do saber, monumentos infinitos e ajuda comunitária",
    featureFlag: "fase6_cidade",
  },
  {
    id: "equipes",
    aba: "jogo",
    labelKey: "nav.equipes",
    labelPadrao: "Equipes & Batalhas",
    rota: "/jogo/equipes",
    icone: Users,
    descricao: "Guildas escolares, baú cooperativo e duelos amigáveis 1v1",
    featureFlag: "fase4a_bau_equipe",
  },
  {
    id: "loja",
    aba: "jogo",
    labelKey: "nav.loja_pets",
    labelPadrao: "Loja de Mascotes",
    rota: "/jogo/loja",
    icone: ShoppingBag,
    descricao: "Adoção de pets, cosméticos e itens de fidelidade",
    featureFlag: "fase4d_loja_sumidouros",
  },
  {
    id: "fidelidade",
    aba: "jogo",
    labelKey: "nav.fidelidade",
    labelPadrao: "Programa de Fidelidade",
    rota: "/jogo/loja/fidelidade",
    icone: Award,
    descricao: "Devolução de moedas (cashback), níveis de cliente e selos",
    featureFlag: "fase4_economia",
  },
  {
    id: "carteira",
    aba: "jogo",
    labelKey: "nav.carteira",
    labelPadrao: "Carteira & Extrato",
    rota: "/jogo/carteira",
    icone: Wallet,
    descricao: "Livro-razão contábil com histórico completo de moedas",
    featureFlag: "fase4_economia",
  },

  // ==========================================
  // ABA 5: PERFIL
  // ==========================================
  {
    id: "conta",
    aba: "perfil",
    labelKey: "nav.perfil",
    labelPadrao: "Minha Conta",
    rota: "/perfil/conta",
    icone: Users,
    descricao: "Identidade do estudante, dados institucionais e foto",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "configuracoes",
    aba: "perfil",
    labelKey: "nav.configuracoes",
    labelPadrao: "Configurações",
    rota: "/perfil/configuracoes",
    icone: Settings,
    descricao: "Aparência, idiomas, acessibilidade, notificações e dados",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "acessibilidade",
    aba: "perfil",
    labelKey: "nav.acessibilidade",
    labelPadrao: "Acessibilidade e Inclusão",
    rota: "/perfil/configuracoes/acessibilidade",
    icone: ShieldCheck,
    descricao: "Alto contraste, fontes grandes, modo dislexia e redução de movimento",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "planos",
    aba: "perfil",
    labelKey: "nav.planos",
    labelPadrao: "Planos e Assinaturas",
    rota: "/perfil/planos",
    icone: CreditCard,
    descricao: "Estrutura comercial com planos Gratuito, Lite e Pro",
    featureFlag: "fase5_planos",
  },
  {
    id: "ajuda",
    aba: "perfil",
    labelKey: "nav.ajuda",
    labelPadrao: "Ajuda e Suporte",
    rota: "/perfil/ajuda",
    icone: HelpCircle,
    descricao: "Tutoriais, guia do aplicativo e FAQ",
    featureFlag: "fase0_fundacao",
  },
  {
    id: "privacidade",
    aba: "perfil",
    labelKey: "nav.privacidade",
    labelPadrao: "Privacidade e Dados",
    rota: "/perfil/privacidade",
    icone: FolderLock,
    descricao: "Exportação de dados, controle de memória e segurança",
    featureFlag: "fase0_fundacao",
  },
];

/**
 * Obtém todos os itens de navegação ativos com base nas feature flags.
 * Itens marcados com feature flag inativa são omitidos automaticamente.
 */
export function obterItensNavegacaoAtivos() {
  return ITENS_NAVEGACAO.filter((item) => {
    if (!item.featureFlag) return true;
    return isFeatureAtiva(item.featureFlag);
  });
}

/**
 * Retorna os itens de uma aba canônica específica
 * @param {string} abaId Identificador da aba ("inicio", "estudar", "lumina", "jogo", "perfil")
 */
export function obterItensPorAba(abaId) {
  return obterItensNavegacaoAtivos().filter((item) => item.aba === abaId);
}
