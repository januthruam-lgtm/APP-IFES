/**
 * Brain Studio - Configuração Central de Planos e Assinaturas (Fase 5)
 * Array único PLANOS e tipagens estritas.
 * Nível numérico de acesso: Gratuito (0) < Lite (1) < Pro (2).
 * NUNCA alterado pelo cliente diretamente no Firestore.
 */

export type NivelPlano = 0 | 1 | 2;

export interface LimitesPlano {
  questoesPorQuiz: number;
  quizzesPorDia: number;
  arquivosPorMes: number;
  looksSalvos: number;
  correcaoSocratica: boolean;
  estilosLuminaExtras: boolean;
  badgeExclusivo: boolean;
}

export interface PlanoItem {
  id: string;
  nivel: NivelPlano;
  nome: string;
  preco: number;
  periodo: "vitalicio" | "semanal" | "mensal" | "semestral" | "anual";
  precoEquivalenteMensal?: number;
  melhorCusto?: boolean;
  beneficios: string[];
  limites: LimitesPlano;
}

export const PLANOS: readonly PlanoItem[] = Object.freeze([
  {
    id: "gratuito",
    nivel: 0,
    nome: "Gratuito",
    preco: 0,
    periodo: "vitalicio",
    beneficios: [
      "Acesso completo ao AVA Moodle e Q-Acadêmico",
      "Flashcards e repetição espaçada",
      "Lumina IA básica (tutoria socrática)",
      "Até 5 questões de quiz por arquivo (1/dia)",
      "Acesso à biblioteca pública e dicionário",
      "Recursos de acessibilidade e tradução sempre livres",
    ],
    limites: {
      questoesPorQuiz: 5,
      quizzesPorDia: 1,
      arquivosPorMes: 3,
      looksSalvos: 2,
      correcaoSocratica: false,
      estilosLuminaExtras: false,
      badgeExclusivo: false,
    },
  },
  {
    id: "lite",
    nivel: 1,
    nome: "Lite",
    preco: 4.9,
    periodo: "mensal",
    beneficios: [
      "Tudo do plano Gratuito",
      "Até 10 questões de quiz por arquivo (3/dia)",
      "Geração de quiz para arquivos de até 10 MB",
      "Até 4 looks salvos no guarda-roupa dos mascotes",
      "Estatísticas avançadas de retenção e foco",
      "Prioridade moderada no processamento com Lumina IA",
    ],
    limites: {
      questoesPorQuiz: 10,
      quizzesPorDia: 3,
      arquivosPorMes: 30,
      looksSalvos: 4,
      correcaoSocratica: false,
      estilosLuminaExtras: false,
      badgeExclusivo: false,
    },
  },
  {
    id: "pro_semanal",
    nivel: 2,
    nome: "Pro Semanal",
    preco: 3.9,
    periodo: "semanal",
    precoEquivalenteMensal: 15.6,
    beneficios: [
      "Tudo do plano Lite",
      "Até 25 questões de quiz por arquivo (10/dia)",
      "Correção socrática passo a passo das respostas curtas",
      "Até 8 looks salvos no guarda-roupa",
      "Skin exclusiva Aurora e estilos especiais da Lumina",
      "Badge Pro no perfil acadêmico",
    ],
    limites: {
      questoesPorQuiz: 25,
      quizzesPorDia: 10,
      arquivosPorMes: 300,
      looksSalvos: 8,
      correcaoSocratica: true,
      estilosLuminaExtras: true,
      badgeExclusivo: true,
    },
  },
  {
    id: "pro_mensal",
    nivel: 2,
    nome: "Pro Mensal",
    preco: 9.9,
    periodo: "mensal",
    precoEquivalenteMensal: 9.9,
    beneficios: [
      "Tudo do plano Lite",
      "Até 25 questões de quiz por arquivo (10/dia)",
      "Correção socrática de respostas curtas pela Lumina",
      "Até 8 looks salvos no guarda-roupa dos pets",
      "Skin exclusiva Aurora e itens Pro ativos",
      "Prioridade máxima e streaming ultra-rápido de respostas",
    ],
    limites: {
      questoesPorQuiz: 25,
      quizzesPorDia: 10,
      arquivosPorMes: 300,
      looksSalvos: 8,
      correcaoSocratica: true,
      estilosLuminaExtras: true,
      badgeExclusivo: true,
    },
  },
  {
    id: "pro_semestral",
    nivel: 2,
    nome: "Pro Semestral",
    preco: 44.9,
    periodo: "semestral",
    precoEquivalenteMensal: 7.48,
    beneficios: [
      "Todos os recursos do Pro Mensal",
      "Economia de mais de 24% em relação ao mensal",
      "Acesso completo durante todo o semestre letivo",
      "Simulados inéditos ilimitados para ENEM e vestibulares",
    ],
    limites: {
      questoesPorQuiz: 25,
      quizzesPorDia: 10,
      arquivosPorMes: 300,
      looksSalvos: 8,
      correcaoSocratica: true,
      estilosLuminaExtras: true,
      badgeExclusivo: true,
    },
  },
  {
    id: "pro_anual",
    nivel: 2,
    nome: "Pro Anual",
    preco: 79.0,
    periodo: "anual",
    precoEquivalenteMensal: 6.58,
    melhorCusto: true,
    beneficios: [
      "Todos os recursos do Pro com a máxima economia",
      "Equivale a apenas R$ 6,58/mês (mais de 33% de desconto)",
      "Garantia de acesso contínuo durante o ano letivo completo",
      "Prioridade máxima em todos os recursos de IA e cursos",
    ],
    limites: {
      questoesPorQuiz: 25,
      quizzesPorDia: 10,
      arquivosPorMes: 300,
      looksSalvos: 8,
      correcaoSocratica: true,
      estilosLuminaExtras: true,
      badgeExclusivo: true,
    },
  },
]);

/**
 * Verifica se um nível de usuário satisfaz o nível mínimo exigido para um recurso.
 */
export function temAcesso(nivelUsuario: NivelPlano | number, nivelMinimo: NivelPlano): boolean {
  return (nivelUsuario ?? 0) >= nivelMinimo;
}

/**
 * Retorna os limites configurados para o nível de plano do usuário.
 */
export function getLimitesPlano(nivelUsuario: NivelPlano | number): LimitesPlano {
  const plano = PLANOS.find((p) => p.nivel === nivelUsuario) || PLANOS[0];
  return plano.limites;
}

export default PLANOS;
