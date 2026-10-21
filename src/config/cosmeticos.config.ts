/**
 * Brain Studio - Catálogo Oficial de Cosméticos e Guarda-Roupa dos Mascotes (Fase 12)
 * Apenas estético, sem vantagem competitiva, sem sorteio aleatório (ECA Digital art. 20).
 * Preços fixos e transparentes.
 */

export type EspacoCosmetico =
  | "skin"
  | "cabeca"
  | "rosto"
  | "pescoco"
  | "corpo"
  | "costas"
  | "fundo";

export type RaridadeCosmetico =
  | "comum"
  | "incomum"
  | "raro"
  | "epico"
  | "lendario";

export interface ItemCosmetico {
  id: string;
  nome: string;
  espaco: EspacoCosmetico;
  raridade: RaridadeCosmetico;
  precoMoedas?: number;
  origem: "gratis" | "loja" | "plano_pro" | "conquista" | "cidade" | "oficina_fragmentos" | "temporada";
  requisitoDescricao?: string;
  conjunto?: "estudante" | "cientista" | "mago_do_saber";
  descricaoAcessibilidade: string;
}

export const COSMETICOS_CONFIG = Object.freeze({
  // Tabela oficial de preços por raridade
  PRECOS_POR_RARIDADE: Object.freeze({
    comum: 300,
    incomum: 500,
    raro: 900,
    epico: 1500,
    lendario: null, // Lendários nunca são vendidos diretamente por moedas
  }),

  // Cotação na Oficina de Fragmentos Cosméticos (conquistados por mérito acadêmico)
  FRAGMENTOS_NECESSARIOS: Object.freeze({
    raro: 3,
    epico: 6,
    lendario: 12,
  }),

  // Limite de looks salvos por plano
  MAX_LOOKS_SALVOS_POR_PLANO: Object.freeze({
    gratuito: 2,
    lite: 4,
    pro: 8,
  }),
});

export const CATALOGO_COSMETICOS: readonly ItemCosmetico[] = Object.freeze([
  // Skins
  {
    id: "skin_padrao",
    nome: "Pelagem Clássica",
    espaco: "skin",
    raridade: "comum",
    precoMoedas: 0,
    origem: "gratis",
    descricaoAcessibilidade: "Pelagem clássica padrão do mascote.",
  },
  {
    id: "skin_nevoa",
    nome: "Névoa Suave",
    espaco: "skin",
    raridade: "incomum",
    precoMoedas: 500,
    origem: "loja",
    descricaoAcessibilidade: "Pelagem suave com gradiente acinzentado.",
  },
  {
    id: "skin_caramelo",
    nome: "Caramelo Dourado",
    espaco: "skin",
    raridade: "incomum",
    precoMoedas: 500,
    origem: "loja",
    descricaoAcessibilidade: "Pelagem em tons quentes de caramelo.",
  },
  {
    id: "skin_salvia",
    nome: "Sálvia Zen",
    espaco: "skin",
    raridade: "incomum",
    precoMoedas: 500,
    origem: "loja",
    descricaoAcessibilidade: "Pelagem relaxante em tonalidade verde sálvia.",
  },
  {
    id: "skin_meia_noite",
    nome: "Meia-Noite Cósmica",
    espaco: "skin",
    raridade: "raro",
    precoMoedas: 900,
    origem: "loja",
    descricaoAcessibilidade: "Pelagem azul escura profunda com microestrelas.",
  },
  {
    id: "skin_aurora",
    nome: "Aurora Boreal",
    espaco: "skin",
    raridade: "raro",
    origem: "plano_pro",
    requisitoDescricao: "Exclusivo enquanto a assinatura Pro estiver ativa",
    descricaoAcessibilidade: "Pelagem brilhante com gradientes iridescentes da aurora boreal.",
  },
  {
    id: "skin_dourado",
    nome: "Mestre Dourado",
    espaco: "skin",
    raridade: "lendario",
    origem: "cidade",
    requisitoDescricao: "Desbloqueado ao completar a Metrópole Acadêmica (Cidade 10)",
    descricaoAcessibilidade: "Pelagem dourada reluzente reservada a mestres acadêmicos.",
  },
  {
    id: "skin_cristal",
    nome: "Cristal Prismático",
    espaco: "skin",
    raridade: "lendario",
    origem: "oficina_fragmentos",
    requisitoDescricao: "Forjado na Oficina com 12 fragmentos cosméticos",
    descricaoAcessibilidade: "Pelagem translúcida com reflexos prismáticos de diamante.",
  },

  // Cabeça
  {
    id: "cabeca_bone_foco",
    nome: "Boné do Foco",
    espaco: "cabeca",
    raridade: "comum",
    precoMoedas: 300,
    origem: "loja",
    conjunto: "estudante",
    descricaoAcessibilidade: "Boné esportivo simples com aba curvada para estudos intensos.",
  },
  {
    id: "cabeca_laco_seda",
    nome: "Laço de Seda",
    espaco: "cabeca",
    raridade: "comum",
    precoMoedas: 300,
    origem: "loja",
    descricaoAcessibilidade: "Elegante laço de fita de seda acetinada.",
  },
  {
    id: "cabeca_fone_foco",
    nome: "Headphone Anti-Ruído",
    espaco: "cabeca",
    raridade: "incomum",
    precoMoedas: 500,
    origem: "loja",
    descricaoAcessibilidade: "Fones de ouvido acolchoados para concentração.",
  },
  {
    id: "cabeca_chapeu_mago",
    nome: "Chapéu do Mago do Saber",
    espaco: "cabeca",
    raridade: "raro",
    precoMoedas: 900,
    origem: "loja",
    conjunto: "mago_do_saber",
    descricaoAcessibilidade: "Chapéu pontiagudo azul com estrelas douradas de erudição.",
  },
  {
    id: "cabeca_coroa_louros",
    nome: "Coroa de Louros Triunfante",
    espaco: "cabeca",
    raridade: "lendario",
    origem: "conquista",
    requisitoDescricao: "Conquista de 100 dias consecutivos de ofensiva",
    descricaoAcessibilidade: "Coroa clássica de louros dourados simbolizando perseverança extrema.",
  },

  // Rosto
  {
    id: "rosto_oculos_leitura",
    nome: "Óculos Redondos de Leitura",
    espaco: "rosto",
    raridade: "comum",
    precoMoedas: 300,
    origem: "loja",
    conjunto: "estudante",
    descricaoAcessibilidade: "Armação fina redonda para conforto visual em leituras longas.",
  },
  {
    id: "rosto_oculos_cientista",
    nome: "Óculos de Proteção Científica",
    espaco: "rosto",
    raridade: "incomum",
    precoMoedas: 500,
    origem: "loja",
    conjunto: "cientista",
    descricaoAcessibilidade: "Goggles de laboratório com lentes transparentes resistentes.",
  },
  {
    id: "rosto_monoculo_sabio",
    nome: "Monóculo do Filósofo",
    espaco: "rosto",
    raridade: "raro",
    precoMoedas: 900,
    origem: "loja",
    descricaoAcessibilidade: "Monóculo clássico dourado preso por correntinha fina.",
  },

  // Pescoço
  {
    id: "pescoco_cachecol",
    nome: "Cachecol de Tricô",
    espaco: "pescoco",
    raridade: "comum",
    precoMoedas: 300,
    origem: "loja",
    descricaoAcessibilidade: "Cachecol aconchegante enrolado no pescoço do pet.",
  },
  {
    id: "pescoco_gravata_borboleta",
    nome: "Gravata Borboleta Elegante",
    espaco: "pescoco",
    raridade: "incomum",
    precoMoedas: 500,
    origem: "loja",
    conjunto: "cientista",
    descricaoAcessibilidade: "Pequena gravata borboleta formal de veludo escuro.",
  },
  {
    id: "pescoco_medalha_sabedoria",
    nome: "Medalha da Sabedoria",
    espaco: "pescoco",
    raridade: "lendario",
    origem: "cidade",
    requisitoDescricao: "Conquista ao inaugurar a Cidade das Artes (Cidade 5)",
    descricaoAcessibilidade: "Medalha de honra com insígnia gravada do Brain Studio.",
  },

  // Corpo
  {
    id: "corpo_moletom",
    nome: "Moletom do Estudante",
    espaco: "corpo",
    raridade: "comum",
    precoMoedas: 300,
    origem: "loja",
    conjunto: "estudante",
    descricaoAcessibilidade: "Moletom universitário casual de algodão com capuz.",
  },
  {
    id: "corpo_jaleco",
    nome: "Jaleco de Laboratório",
    espaco: "corpo",
    raridade: "incomum",
    precoMoedas: 500,
    origem: "loja",
    conjunto: "cientista",
    descricaoAcessibilidade: "Jaleco branco tradicional de pesquisa científica.",
  },
  {
    id: "corpo_capa_aventureiro",
    nome: "Capa do Explorador do Saber",
    espaco: "corpo",
    raridade: "raro",
    precoMoedas: 900,
    origem: "loja",
    conjunto: "mago_do_saber",
    descricaoAcessibilidade: "Capa fluida com fecho metálico esculpido.",
  },
  {
    id: "corpo_toga_formatura",
    nome: "Toga Solene de Formatura",
    espaco: "corpo",
    raridade: "epico",
    precoMoedas: 1500,
    origem: "loja",
    descricaoAcessibilidade: "Toga acadêmica preta com faixa de colação de grau.",
  },

  // Costas
  {
    id: "costas_mochila",
    nome: "Mochila Escolar Compacta",
    espaco: "costas",
    raridade: "comum",
    precoMoedas: 300,
    origem: "loja",
    conjunto: "estudante",
    descricaoAcessibilidade: "Mochila funcional com zíperes e bolso para garrafinha.",
  },
  {
    id: "costas_asas_papel",
    nome: "Asas de Origami Literário",
    espaco: "costas",
    raridade: "raro",
    precoMoedas: 900,
    origem: "loja",
    descricaoAcessibilidade: "Pequenas asas estilizadas dobradas a partir de páginas de livros.",
  },
  {
    id: "costas_livro_flutuante",
    nome: "Grimório Flutuante do Saber",
    espaco: "costas",
    raridade: "epico",
    precoMoedas: 1500,
    origem: "loja",
    conjunto: "mago_do_saber",
    descricaoAcessibilidade: "Grande compêndio com páginas iluminadas levitando atrás do pet.",
  },

  // Fundos
  {
    id: "fundo_quarto_estudos",
    nome: "Quarto de Estudos Tranquilo",
    espaco: "fundo",
    raridade: "comum",
    precoMoedas: 300,
    origem: "loja",
    descricaoAcessibilidade: "Cenário ilustrado de uma mesa de estudos com luminária e livros.",
  },
  {
    id: "fundo_biblioteca_noturna",
    nome: "Biblioteca Noturna Aconchegante",
    espaco: "fundo",
    raridade: "incomum",
    precoMoedas: 500,
    origem: "loja",
    descricaoAcessibilidade: "Estantes altas de madeira escura iluminadas por abajures clássicos.",
  },
  {
    id: "fundo_jardim_zen",
    nome: "Jardim Zen do Foco",
    espaco: "fundo",
    raridade: "raro",
    precoMoedas: 900,
    origem: "loja",
    descricaoAcessibilidade: "Bambuzal sereno com lago de carpas e ponte de madeira.",
  },
  {
    id: "fundo_observatorio",
    nome: "Observatório das Estrelas",
    espaco: "fundo",
    raridade: "epico",
    precoMoedas: 1500,
    origem: "loja",
    descricaoAcessibilidade: "Cúpula astronômica com telescópio apontado para galáxias distantes.",
  },
  {
    id: "fundo_metropole_amanhecer",
    nome: "Metrópole ao Amanhecer",
    espaco: "fundo",
    raridade: "lendario",
    origem: "cidade",
    requisitoDescricao: "Conquista ao inaugurar a Cidade dos Campeões (Cidade 8)",
    descricaoAcessibilidade: "Horizonte arquitetônico moderno banhado pelos primeiros raios de sol.",
  },
]);

/**
 * Valida se um preço pago pelo item condiz exatamente com a tabela oficial de cosméticos.
 */
export function validarPrecoCosmetico(itemId: string, moedasPagas: number): boolean {
  const item = CATALOGO_COSMETICOS.find((c) => c.id === itemId);
  if (!item) return false;
  if (item.precoMoedas === undefined || item.precoMoedas === null) return false;
  return item.precoMoedas === moedasPagas;
}

export default CATALOGO_COSMETICOS;
