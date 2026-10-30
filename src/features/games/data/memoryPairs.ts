export interface MemoryConceptPair {
  id: string;
  category: "Ciências & Exatas" | "Administração & Economia" | "Tecnologia & Computação";
  termA: string; // Ex: Nome do conceito ou teoria
  termB: string; // Ex: Fórmula, autor ou definição
  hint: string;
}

export const MEMORY_CONCEPT_PAIRS: MemoryConceptPair[] = [
  // Ciências & Exatas
  {
    id: "p_pitagoras",
    category: "Ciências & Exatas",
    termA: "Teorema de Pitágoras",
    termB: "a² + b² = c²",
    hint: "Relação métrica no triângulo retângulo",
  },
  {
    id: "p_newton_2",
    category: "Ciências & Exatas",
    termA: "2ª Lei de Newton",
    termB: "F = m · a",
    hint: "Princípio fundamental da dinâmica",
  },
  {
    id: "p_einstein",
    category: "Ciências & Exatas",
    termA: "Equivalência Massa-Energia",
    termB: "E = m · c²",
    hint: "Teoria da relatividade restrita",
  },
  {
    id: "p_termo_1",
    category: "Ciências & Exatas",
    termA: "1ª Lei da Termodinâmica",
    termB: "ΔU = Q - W",
    hint: "Conservação da energia térmica",
  },
  {
    id: "p_clorofila",
    category: "Ciências & Exatas",
    termA: "Fotossíntese Vegetal",
    termB: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
    hint: "Síntese de glicose e oxigênio",
  },
  {
    id: "p_mitocondria",
    category: "Ciências & Exatas",
    termA: "Mitocôndria",
    termB: "Respiração Celular & ATP",
    hint: "Usinas de energia das células",
  },

  // Administração & Economia
  {
    id: "p_podc",
    category: "Administração & Economia",
    termA: "Funções da Administração",
    termB: "Planejar, Organizar, Dirigir, Controlar",
    hint: "Processo administrativo clássico (Fayol)",
  },
  {
    id: "p_swot",
    category: "Administração & Economia",
    termA: "Matriz SWOT / FOFA",
    termB: "Forças, Oportunidades, Fraquezas, Ameaças",
    hint: "Diagnóstico estratégico empresarial",
  },
  {
    id: "p_pib",
    category: "Administração & Economia",
    termA: "PIB (Produto Interno Bruto)",
    termB: "C + I + G + (X - M)",
    hint: "Equação da demanda agregada",
  },
  {
    id: "p_juros_simples",
    category: "Administração & Economia",
    termA: "Juros Simples",
    termB: "J = C · i · t",
    hint: "Cálculo de rendimento linear",
  },
  {
    id: "p_maslow",
    category: "Administração & Economia",
    termA: "Pirâmide de Maslow",
    termB: "Hierarquia das Necessidades Humanas",
    hint: "Da fisiologia à autorrealização",
  },

  // Tecnologia & Computação
  {
    id: "p_algoritmo",
    category: "Tecnologia & Computação",
    termA: "Algoritmo",
    termB: "Sequência Finita de Passos Lógicos",
    hint: "Base computacional para resolução de problemas",
  },
  {
    id: "p_oo",
    category: "Tecnologia & Computação",
    termA: "Orientação a Objetos",
    termB: "Classes, Encapsulamento, Herança, Polimorfismo",
    hint: "Os 4 pilares da POO",
  },
  {
    id: "p_binario",
    category: "Tecnologia & Computação",
    termA: "Sistema Binário",
    termB: "Base 2 (Dígitos 0 e 1)",
    hint: "Lógica booleana digital dos processadores",
  },
];
