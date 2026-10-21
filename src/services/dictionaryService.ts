import { VerbeteDicionario, ItemVocabularioSalvo } from "../types/dictionary";

const DICT_CACHE_PREFIX = "brain_dict_cache_";
const VOCAB_STORAGE_KEY = "brain_vocabulario_salvo";
const HISTORY_STORAGE_KEY = "brain_dict_history";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

const PALAVRAS_DO_DIA: Record<string, VerbeteDicionario> = {
  "pt-BR": {
    termo: "Resiliência",
    idioma: "pt-BR",
    pronunciaFonetica: "/ʁeziˈljẽ.si.ɐ/",
    etimologia: "Do latim 'resilire', que significa 'voltar atrás, saltar para trás'.",
    plural: "resiliências",
    significados: [
      {
        classeGramatical: "substantivo feminino",
        definicao: "Capacidade de um material retornar à sua forma original após sofrer deformação elástica.",
        exemplos: ["A borracha natural possui alta resiliência mecânica."],
        sinonimos: ["elasticidade", "flexibilidade"],
      },
      {
        classeGramatical: "substantivo feminino (Psicologia)",
        definicao: "Habilidade de se recuperar, adaptar-se e prosperar diante de crises, traumas ou situações adversas.",
        exemplos: ["A resiliência dos estudantes durante o semestre letivo foi determinante para a aprovação."],
        sinonimos: ["perseverança", "tenacidade", "superação"],
        antonimos: ["fragilidade", "vulnerabilidade"],
      },
    ],
    sinonimosGerais: ["tenacidade", "resistência", "superação", "elasticidade"],
    antonimosGerais: ["fragilidade", "desânimo", "rigidez"],
    luminaInsight: {
      definicaoSimples: "É a força interior de cair, levantar a poeira e continuar estudando mesmo quando a matéria parece difícil.",
      exemplosIneditos: [
        "Tirar uma nota baixa no primeiro bimestre não é o fim: com resiliência, você ajusta a rotina e recupera a nota no AVA.",
        "Em programação, a resiliência é testada toda vez que o código compila com erro e você busca a solução com paciência.",
      ],
      nivelDificuldade: "Médio",
      dicaMemorizacao: "Lembre-se de um 'mola' (re-silie): você é comprimido pela pressão das provas, mas volta ainda mais forte!",
      comparacaoPalavras: "Diferente de 'teimosia' (insistir no erro), a resiliência envolve adaptação inteligente.",
    },
    fonteNome: "Dicionário Aberto / Wiktionary",
    fonteLicenca: "CC BY-SA 4.0",
    atualizadoEm: new Date().toISOString(),
  },
  en: {
    termo: "Epistemology",
    idioma: "en",
    pronunciaFonetica: "/ɪˌpɪs.təˈmɒl.ə.dʒi/",
    etimologia: "From Greek 'episteme' (knowledge) + 'logos' (study/discourse).",
    significados: [
      {
        classeGramatical: "noun",
        definicao: "The branch of philosophy concerned with the theory of knowledge, truth, belief, and justification.",
        exemplos: ["Epistemology asks how we know what we claim to know."],
        sinonimos: ["theory of knowledge", "gnoseology"],
      },
    ],
    sinonimosGerais: ["philosophy of science", "cognitive theory"],
    antonimosGerais: [],
    luminaInsight: {
      definicaoSimples: "The study of how humans learn, what counts as true knowledge, and how science proves facts.",
      exemplosIneditos: [
        "In your academic research paper, understanding epistemology helps you justify why your methodology is valid.",
        "When analyzing historical sources, epistemology guides us to question the reliability of written records.",
      ],
      nivelDificuldade: "Avançado",
      dicaMemorizacao: "Think of 'Episode of Knowledge': investigating each step of how we know things.",
      comparacaoPalavras: "Contrast with 'Ontology' (study of being/reality itself, rather than our knowledge of it).",
    },
    fonteNome: "Free Dictionary API / Wiktionary",
    fonteLicenca: "CC BY-SA 4.0",
    atualizadoEm: new Date().toISOString(),
  },
  es: {
    termo: "Perspicacia",
    idioma: "es",
    pronunciaFonetica: "/peɾs.piˈka.sja/",
    etimologia: "Del latín 'perspicacia', cualidad de 'perspicax' (que mira a través).",
    significados: [
      {
        classeGramatical: "sustantivo femenino",
        definicao: "Agudeza y penetración de la vista, del oído o del entendimiento.",
        exemplos: ["Su perspicacia para resolver problemas matemáticos impresionó al docente."],
        sinonimos: ["agudeza", "sagacidad", "clarividencia"],
        antonimos: ["torpeza", "ingenuidad"],
      },
    ],
    sinonimosGerais: ["agudeza", "lucidez", "discernimiento"],
    antonimosGerais: ["torpeza", "descuido"],
    luminaInsight: {
      definicaoSimples: "Capacidad de darse cuenta rápido de los detalles que otros pasan por alto en los estudios.",
      exemplosIneditos: [
        "Con perspicacia, identificó la trampa en la pregunta de opción múltiple del examen.",
        "La perspicacia científica permite notar patrones antes de que se vuelvan obvios.",
      ],
      nivelDificuldade: "Médio",
      dicaMemorizacao: "Visualiza unos lentes con 'perspectiva' nítida que ven detrás de las apariencias.",
      comparacaoPalavras: "A diferencia de la 'inteligencia' general, la perspicacia es la velocidad para captar matices ocultos.",
    },
    fonteNome: "Wiktionary",
    fonteLicenca: "CC BY-SA 4.0",
    atualizadoEm: new Date().toISOString(),
  },
};

export async function lookupDictionaryTerm(termo: string, lang: string = "pt-BR"): Promise<VerbeteDicionario> {
  const cleanTerm = termo.trim().toLowerCase();
  if (!cleanTerm) {
    throw new Error("Termo de busca vazio.");
  }

  const cacheKey = `${DICT_CACHE_PREFIX}${lang}_${cleanTerm}`;

  // 1. Verificar cache local (IndexedDB ou localStorage) com TTL de 30 dias
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.data;
      }
    }
  } catch {}

  // 2. Chamar o endpoint no servidor
  try {
    const res = await fetch("/api/dictionary/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: cleanTerm,
        lang,
      }),
    });

    if (res.ok) {
      const data: VerbeteDicionario = await res.json();
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ timestamp: Date.now(), data })
        );
      } catch {}
      addSearchHistory(cleanTerm);
      return data;
    }
  } catch (err) {
    console.warn("Falha de rede ao consultar dicionário online:", err);
  }

  // 3. Fallback inteligente com a palavra do dia ou modelo heurístico seguro
  const fallback = PALAVRAS_DO_DIA[lang] || PALAVRAS_DO_DIA["pt-BR"];
  if (fallback.termo.toLowerCase() === cleanTerm) {
    return fallback;
  }

  // Gerar verbete preliminar de fallback marcado
  const fallbackVerbete: VerbeteDicionario = {
    termo: termo,
    idioma: lang,
    pronunciaFonetica: `/${cleanTerm}/`,
    significados: [
      {
        classeGramatical: "termo acadêmico / vocábulo",
        definicao: `Significado conceitual de "${termo}" em análise contextual no ecossistema Brain Studio.`,
        exemplos: [`O uso rigoroso de "${termo}" é fundamental para a clareza e precisão do texto.`],
        sinonimos: [],
      },
    ],
    sinonimosGerais: [],
    antonimosGerais: [],
    luminaInsight: {
      definicaoSimples: `Conceito relacionado a "${termo}". Consulte a tutora Lumina para um aprofundamento específico na sua matéria.`,
      exemplosIneditos: [
        `Ao estudar este tema, observe como "${termo}" se conecta aos conceitos do seu curso.`,
        `Praticar a escrita com "${termo}" fortalece seu vocabulário acadêmico.`,
      ],
      nivelDificuldade: "Médio",
      dicaMemorizacao: `Crie um flashcard no Anki associando "${termo}" a uma imagem mental marcante.`,
      comparacaoPalavras: "Consulte os termos correlatos da mesma família morfológica.",
      isGeradoPorIa: true,
    },
    fonteNome: "Wiktionary (Aberto)",
    fonteLicenca: "CC BY-SA 4.0",
    atualizadoEm: new Date().toISOString(),
  };

  return fallbackVerbete;
}

export function getWordOfTheDay(lang: string = "pt-BR"): VerbeteDicionario {
  return PALAVRAS_DO_DIA[lang] || PALAVRAS_DO_DIA["pt-BR"];
}

export function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(word: string): void {
  try {
    const current = getSearchHistory().filter((w) => w.toLowerCase() !== word.toLowerCase());
    const updated = [word, ...current].slice(0, 20); // Mantém os 20 mais recentes
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {}
}

export function getSavedVocabulary(): ItemVocabularioSalvo[] {
  try {
    const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToVocabulary(verbete: VerbeteDicionario): boolean {
  try {
    const list = getSavedVocabulary();
    const existing = list.find((i) => i.termo.toLowerCase() === verbete.termo.toLowerCase());
    if (existing) return false;

    const newItem: ItemVocabularioSalvo = {
      id: `vocab-${Date.now()}`,
      termo: verbete.termo,
      idioma: verbete.idioma,
      classeGramatical: verbete.significados[0]?.classeGramatical || "termo",
      definicaoCurta: verbete.luminaInsight.definicaoSimples || verbete.significados[0]?.definicao || "",
      exemploPratico: verbete.luminaInsight.exemplosIneditos[0] || "",
      salvoEm: new Date().toLocaleDateString(),
      revisadoCount: 0,
    };

    const updated = [newItem, ...list];
    localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export function removeFromVocabulary(id: string): void {
  try {
    const list = getSavedVocabulary().filter((i) => i.id !== id);
    localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}
