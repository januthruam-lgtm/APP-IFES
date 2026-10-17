export interface PetCatalogItem {
  id: string;
  nome: string;
  emoji: string;
  custoMoedas: number;
  descricao: string;
  tituloBadge: string;
  habilidadePassiva: string;
  isDefault?: boolean;
}

/**
 * Catálogo Oficial e Explícito de Mascotes do IFES.
 * Coruja Erudita é o pet padrão e gratuito atribuído a novos usuários.
 */
export const OFFICIAL_PET_CATALOG: PetCatalogItem[] = [
  {
    id: "bunny",
    nome: "Coelhinho Sábio",
    emoji: "🐰",
    custoMoedas: 0,
    descricao: "Mascote veloz e focado, adora leituras rápidas e revisões ágeis.",
    tituloBadge: "Foco Ágil",
    habilidadePassiva: "+10% de agilidade em revisões",
    isDefault: true,
  },
  {
    id: "coruja",
    nome: "Coruja da Sabedoria",
    emoji: "🦉",
    custoMoedas: 50,
    descricao: "Símbolo ancestral da sabedoria acadêmica do IFES. Vigia atentamente cada sessão noturna de estudos.",
    tituloBadge: "Sabedoria & Síntese",
    habilidadePassiva: "+10% de ganho de XP em tarefas e leituras",
  },
  {
    id: "bird",
    nome: "Pássaro Leitor",
    emoji: "🐦",
    custoMoedas: 50,
    descricao: "Alça voos altos no conhecimento, sintetizando textos com leveza e precisão.",
    tituloBadge: "Visão Panorâmica",
    habilidadePassiva: "+10% de retenção de leitura",
  },
  {
    id: "raposa",
    nome: "Raposa Ágil",
    emoji: "🦊",
    custoMoedas: 100,
    descricao: "Extremamente perspicaz e veloz na resolução de problemas lógicos e exercícios práticos.",
    tituloBadge: "Astúcia & Foco",
    habilidadePassiva: "+15% de velocidade de resposta em flashcards",
  },
  {
    id: "elephant",
    nome: "Elefante da Memória",
    emoji: "🐘",
    custoMoedas: 150,
    descricao: "Memória inesquecível para fórmulas complexas e datas históricas.",
    tituloBadge: "Retenção Absoluta",
    habilidadePassiva: "+20% de retenção em repetição espaçada",
  },
  {
    id: "tiger",
    nome: "Tigre Estrategista",
    emoji: "🐯",
    custoMoedas: 180,
    descricao: "Coragem e determinação nas provas e simulados mais difíceis.",
    tituloBadge: "Força Estratégica",
    habilidadePassiva: "+15% de precisão em simulados",
  },
  {
    id: "gato_robo",
    nome: "Gato-Robô",
    emoji: "🤖",
    custoMoedas: 200,
    descricao: "Forjado nos laboratórios de eletrotécnica e informática do IFES. Otimiza cada ciclo de memória.",
    tituloBadge: "Precisão Algorítmica",
    habilidadePassiva: "Reduz o consumo de energia em sessões de quiz",
  },
  {
    id: "dragao_livro",
    nome: "Dragão-Livro",
    emoji: "🐉",
    custoMoedas: 350,
    descricao: "Criatura mítica que respira conhecimento e protege o acervo bibliotecário do instituto.",
    tituloBadge: "Mestre Lendário",
    habilidadePassiva: "+25% de XP e efeito visual dourado em provas",
  },
];

export const DEFAULT_PET_ID = "coruja";

/**
 * Pet Padrão Oficial do sistema IFES.
 * NUNCA é uma planta; é a Coruja Erudita (🦉).
 */
export const DEFAULT_PET_DEFINITION: PetCatalogItem = OFFICIAL_PET_CATALOG[0];

/**
 * Função de busca segura:
 * SEMPRE retorna um pet válido do catálogo.
 * Se o id for inválido, nulo, ou inexistente, retorna SEMPRE o pet padrão (Coruja Erudita 🦉).
 * NUNCA retorna undefined, nem planta, nem asset corrompido.
 */
export function getPetDefinition(petId?: string | null): PetCatalogItem {
  if (!petId) return DEFAULT_PET_DEFINITION;
  const found = OFFICIAL_PET_CATALOG.find((p) => p.id === petId);
  return found || DEFAULT_PET_DEFINITION;
}
