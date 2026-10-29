/**
 * Brain Studio - Dados Completos dos 14 Métodos Científicos de Estudo (Bloco 5B)
 * Classificação rigorosa baseada em Dunlosky et al. (2013), Roediger & Karpicke (2006),
 * Kornell & Bjork (2008), Paivio (1986), Robinson (1946) e literatura recente de neurociência cognitiva.
 */

export type NivelEvidencia = "Alta Utilidade" | "Moderada Utilidade" | "Utilidade Específica";
export type CategoriaMetodo = "memorizacao" | "compreensao" | "organizacao" | "foco";

export interface MetodoEstudoInfo {
  id: string;
  nome: string;
  nomeIngles: string;
  categoria: CategoriaMetodo;
  nivelEvidencia: NivelEvidencia;
  referenciaCientifica: string;
  resumoEvidencia: string;
  explicacao: string;
  paraQueServe: string;
  quandoUsar: string[];
  quandoNaoUsar: string[];
  dicaPratica: string;
}

export const METODOS_ESTUDO: MetodoEstudoInfo[] = [
  {
    id: "recuperacao_ativa",
    nome: "Prática de Recuperação",
    nomeIngles: "Retrieval Practice",
    categoria: "memorizacao",
    nivelEvidencia: "Alta Utilidade",
    referenciaCientifica: "Dunlosky et al. (2013); Roediger & Karpicke (2006) - Psychological Science",
    resumoEvidencia: "Efeito do teste (testing effect): puxar ativamente a informação da memória consolida circuitos neurais 200% a 400% mais do que a releitura passiva.",
    explicacao: "Consiste em forçar o cérebro a recuperar fatos, conceitos ou fórmulas sem consultar o material antes. Lembrar é um ato modificador da memória de longo prazo.",
    paraQueServe: "Fixação duradoura de fatos, termos, fórmulas, vocabulário e esquemas conceituais.",
    quandoUsar: [
      "Após ler um capítulo ou assistir uma aula (tampar e listar de cabeça)",
      "Revisões diárias e semanais",
      "Preparação para provas e concursos",
    ],
    quandoNaoUsar: [
      "Antes de entender o significado básico do conceito (recuperar algo não compreendido gera memorização cega)",
      "Em momentos de esgotamento cognitivo total",
    ],
    dicaPratica: "Feche o livro e escreva em uma folha em branco tudo o que lembra. Só depois confira o que faltou.",
  },
  {
    id: "repeticao_espacada",
    nome: "Repetição Espaçada (FSRS / SM-2)",
    nomeIngles: "Spaced Repetition",
    categoria: "memorizacao",
    nivelEvidencia: "Alta Utilidade",
    referenciaCientifica: "Cepeda et al. (2006); Ebbinghaus (1885); Wozniak (1990) - SuperMemo / FSRS Algorithm",
    resumoEvidencia: "A curva do esquecimento é exponencial. Revisões distribuídas em intervalos crescentes (1, 3, 7, 16, 35 dias) resetam o declínio da memória com esforço mínimo.",
    explicacao: "Em vez de maratonar 10 horas na véspera, você estuda 30 minutos em dias espaçados por algoritmos matemáticos como SM-2 ou FSRS.",
    paraQueServe: "Manutenção de conhecimento permanente ao longo de meses ou anos com o menor número possível de revisões.",
    quandoUsar: [
      "Vocabulário de novos idiomas",
      "Terminologias médicas, jurídicas e técnicas",
      "Fórmulas e propriedades matemáticas/físicas",
      "Conteúdos acumulativos para o ENEM e concursos",
    ],
    quandoNaoUsar: [
      "Para redigir ensaios filosóficos abertos sem termos objetivos",
      "Na véspera imediata da prova (requer dias prévios para funcionar)",
    ],
    dicaPratica: "Avalie honestamente a dificuldade de cada cartão: Errei, Difícil, Bom ou Fácil para o algoritmo calcular a data ideal.",
  },
  {
    id: "entrelacamento",
    nome: "Entrelaçamento de Conteúdos",
    nomeIngles: "Interleaved Practice",
    categoria: "compreensao",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Rohrer & Taylor (2007); Dunlosky et al. (2013) - Instructional Science",
    resumoEvidencia: "Alternar entre diferentes tipos de problemas (ex: misturar problemas de matrizes, logaritmos e geometria) desenvolve a capacidade de discriminar qual estratégia aplicar.",
    explicacao: "Em vez de fazer 30 exercícios do mesmo assunto em bloco (estudo blocante), você intercala questões de assuntos distintos.",
    paraQueServe: "Aprender a reconhecer qual fórmula ou método usar em problemas do mundo real.",
    quandoUsar: [
      "Resolução de problemas de exatas (matemática, física, contabilidade)",
      "Diagnósticos clínicos e identificação de casos de direito",
      "Exercícios práticos de programação",
    ],
    quandoNaoUsar: [
      "No exato instante de aprender um conceito novo nunca visto antes (onde um pequeno bloco introdutório é benéfico)",
    ],
    dicaPratica: "Em vez de fazer 10 exercícios do capítulo 1 e depois 10 do capítulo 2, embaralhe 5 de cada.",
  },
  {
    id: "feynman",
    nome: "Método Feynman & Autoexplicação",
    nomeIngles: "Feynman Technique & Self-Explanation",
    categoria: "compreensao",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Chi et al. (1994); Dunlosky et al. (2013); Richard Feynman (1965 Nobel Lectures)",
    resumoEvidencia: "Explicar em linguagem acessível e analogias concretas força o cérebro a identificar lacunas de entendimento ('ilusão de competência').",
    explicacao: "Consiste em explicar o assunto como se estivesse ensinando uma criança de 10 anos, eliminando jargões vazios e usando metáforas do dia a dia.",
    paraQueServe: "Identificar exatamente onde seu raciocínio quebra e simplificar temas de alta complexidade teórica.",
    quandoUsar: [
      "Assuntos abstratos ou difíceis de visualizar",
      "Após terminar a primeira leitura de um tema difícil",
      "Ao estudar em grupo ou para si mesmo em voz alta",
    ],
    quandoNaoUsar: [
      "Para dados brutos puramente mnemônicos (ex: datas históricas, números de leis)",
    ],
    dicaPratica: "Se você usou uma palavra técnica para explicar outra palavra técnica, volte e use uma analogia do cotidiano.",
  },
  {
    id: "elaboracao_interrogativa",
    nome: "Elaboração Interrogativa",
    nomeIngles: "Elaborative Interrogation",
    categoria: "compreensao",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Pressley et al. (1987); Dunlosky et al. (2013) - Journal of Educational Psychology",
    resumoEvidencia: "Fazer perguntas 'Por que isso faz sentido?' e 'Por que esse fato é verdadeiro?' estimula a integração com a memória semântica preexistente.",
    explicacao: "O estudante questiona ativamente o motivo pelo qual determinada afirmação é verdadeira, em vez de aceitá-la passivamente.",
    paraQueServe: "Transformar informações desconexas em redes neurais de causa e efeito.",
    quandoUsar: [
      "Leitura de livros-texto e artigos científicos",
      "Aulas teóricas de história, biologia, economia e direito",
    ],
    quandoNaoUsar: [
      "Quando o estudante possui zero conhecimento prévio sobre o domínio (dificulta encontrar o 'porquê')",
    ],
    dicaPratica: "Ao ler qualquer regra ou fato, pergunte imediatamente: 'Por que o autor afirma isso e qual seria a consequência se fosse o oposto?'",
  },
  {
    id: "cornell",
    nome: "Método Cornell de Anotações",
    nomeIngles: "Cornell Note-Taking System",
    categoria: "organizacao",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Pauk & Owens (1962); Jacobs (2008) - Cornell University",
    resumoEvidencia: "A divisão espacial em Pistas (esquerda), Anotações (direita) e Síntese (rodapé) induz reflexão e síntese durante e após a aula.",
    explicacao: "Folha dividida em 3 seções: durante a aula anota-se à direita; logo após a aula extraem-se pistas à esquerda; ao final resume-se em 3 linhas abaixo.",
    paraQueServe: "Criação de cadernos funcionais que já servem de ferramenta de autoavaliação (tampe a direita e use a esquerda como teste).",
    quandoUsar: [
      "Aulas expositivas presenciais ou gravadas",
      "Palestras e seminários",
      "Leitura analítica de livros",
    ],
    quandoNaoUsar: [
      "Para aulas puramente práticas de laboratório com passo a passo",
    ],
    dicaPratica: "Ao revisar, cubra a coluna da direita com a mão e tente responder às perguntas da coluna esquerda.",
  },
  {
    id: "mapas_conceituais",
    nome: "Mapas Conceituais",
    nomeIngles: "Concept Mapping",
    categoria: "compreensao",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Novak & Cañas (2008); Nesbit & Adesope (2006) - Review of Educational Research",
    resumoEvidencia: "Diferente de mapas mentais soltos, mapas conceituais exigem verbos de ligação explícitos entre nós ('Célula -> produz -> Energia').",
    explicacao: "Rede bidimensional de nós conceituais interconectados por proposições verbais direcionadas.",
    paraQueServe: "Compreender relações hierárquicas e sistêmicas entre conceitos múltiplos.",
    quandoUsar: [
      "Fechamento de unidades temáticas inteiras",
      "Estruturação de projetos e pesquisas científicas",
      "Revisão de sistemas complexos (ex: fisiologia, economia)",
    ],
    quandoNaoUsar: [
      "Para anotações corridas em tempo real durante aulas rápidas",
    ],
    dicaPratica: "Cada seta DEVE conter uma palavra de ação (ex: 'causa', 'inibe', 'deriva de', 'regula').",
  },
  {
    id: "testes_praticos",
    nome: "Testes Práticos & Simulados",
    nomeIngles: "Practice Testing",
    categoria: "memorizacao",
    nivelEvidencia: "Alta Utilidade",
    referenciaCientifica: "Dunlosky et al. (2013); Roediger & Butler (2011) - Trends in Cognitive Sciences",
    resumoEvidencia: "Resolver simulados com o mesmo formato, tempo e regras da prova final reduz a ansiedade de desempenho e calibra a autopercepção.",
    explicacao: "Simular condições reais de avaliação resolvendo provas anteriores com cronômetro, sem consultas e com gabarito comentado.",
    paraQueServe: "Calibragem do tempo por questão, treino de resistência física/mental e familiarização com o estilo da banca avaliadora.",
    quandoUsar: [
      "Semanas que antecedem provas importantes e vestibulares",
      "No meio do semestre para diagnosticar pontos fracos",
    ],
    quandoNaoUsar: [
      "Como única forma de estudo antes de qualquer contato teórico inicial",
    ],
    dicaPratica: "Corrija o simulado anotando o MOTIVO de cada erro: falta de atenção, esquecimento ou conceito não aprendido.",
  },
  {
    id: "pomodoro",
    nome: "Técnica Pomodoro de Hiperfoco",
    nomeIngles: "Pomodoro Technique",
    categoria: "foco",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Cirillo (1992); Sweller (1988) - Teoria da Carga Cognitiva",
    resumoEvidencia: "Ciclos de foco delimitados e pausas obrigatórias impedem a exaustão da memória de trabalho (working memory depletion) e reduzem a procrastinação.",
    explicacao: "Trabalho focado e ininterrupto por 25 (ou 50) minutos com apenas 1 tarefa, seguido por 5 (ou 10) minutos de pausa total sem telas.",
    paraQueServe: "Superar a inércia inicial para começar a estudar e manter a concentração estável por longas jornadas.",
    quandoUsar: [
      "Início de sessões de estudo quando bate a preguiça",
      "Tarefas densas que exigem atenção sustentada",
    ],
    quandoNaoUsar: [
      "Quando você entrou em estado de Flow profundo e interromper quebraria o raciocínio criativo",
    ],
    dicaPratica: "Na pausa de 5 minutos, levante, beba água e estique o corpo. Não use redes sociais para seu cérebro realmente descansar.",
  },
  {
    id: "dual_coding",
    nome: "Codificação Dual (Verbal + Visual)",
    nomeIngles: "Dual Coding Theory",
    categoria: "compreensao",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Paivio (1986, 1991); Clark & Paivio (1991) - Educational Psychology Review",
    resumoEvidencia: "O cérebro humano processa informações verbais e visuais por canais neurológicos separados na memória de trabalho. Combinar os dois dobra as âncoras de recuperação.",
    explicacao: "Associar o texto explicativo a um diagrama, esboço esquemático, infográfico ou linha do tempo.",
    paraQueServe: "Facilitar a compreensão de processos dinâmicos, anatômicos, temporais ou espaciais.",
    quandoUsar: [
      "Ciências biológicas, anatomia, física e química",
      "Linhas do tempo históricas e fluxogramas de processos",
    ],
    quandoNaoUsar: [
      "Adicionar ilustrações puramente decorativas sem valor semântico (efeito 'seductive details' que distrai a atenção)",
    ],
    dicaPratica: "Ao lado de cada definição difícil, desenhe um pequeno diagrama simples ou esquema com caixas e setas.",
  },
  {
    id: "pre_teste",
    nome: "Pré-Teste & Efeito de Geração",
    nomeIngles: "Pre-Testing & Generation Effect",
    categoria: "compreensao",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Kornell, Hays & Bjork (2009); Richland et al. (2009) - Journal of Experimental Psychology",
    resumoEvidencia: "Tentar responder a uma pergunta antes de ser ensinado (mesmo errando) ativa a curiosidade epistêmica e faz o cérebro absorver a resposta correta com 43% mais retenção.",
    explicacao: "Resolver 3 ou 4 questões sobre o tema ANTES de abrir o livro ou assistir à aula.",
    paraQueServe: "Preparar o terreno cognitivo para prestar atenção exatamente nas informações mais relevantes.",
    quandoUsar: [
      "Antes de iniciar um capítulo novo",
      "Antes de aulas expositivas na faculdade ou colégio",
    ],
    quandoNaoUsar: [
      "Se errar provocar frustração excessiva e desmotivação (é preciso entender que errar faz parte do processo)",
    ],
    dicaPratica: "Leia as perguntas do final do capítulo ANTES de ler o texto.",
  },
  {
    id: "resumo_estruturado",
    nome: "Resumo Estruturado com Limite",
    nomeIngles: "Structured Summarization",
    categoria: "organizacao",
    nivelEvidencia: "Utilidade Específica",
    referenciaCientifica: "Dunlosky et al. (2013); Bretzing & Kulhavy (1979) - Journal of Educational Psychology",
    resumoEvidencia: "Resumos livres sem restrição de tamanho costumam virar cópia passiva de parágrafos. Resumos com limite de palavras e formato tabular forçam discernimento do essencial.",
    explicacao: "Sintetizar o tema em no máximo 150 palavras ou em uma matriz de 4 quadrantes (Ideia Central, Evidências, Contra-exemplos, Aplicação).",
    paraQueServe: "Treinar a capacidade de síntese crítica e filtrar ruídos de textos acadêmicos prolixos.",
    quandoUsar: [
      "Artigos científicos extensos",
      "Capítulos longos de livros acadêmicos",
    ],
    quandoNaoUsar: [
      "Copiar e colar trechos do livro (tem utilidade nula comprovada cientificamente)",
    ],
    dicaPratica: "Limite seu resumo a 5 tópicos de no máximo 20 palavras cada.",
  },
  {
    id: "estudo_intercalado",
    nome: "Estudo Intercalado por Disciplinas",
    nomeIngles: "Cross-Subject Interleaving",
    categoria: "foco",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Kornell & Bjork (2008); Taylor & Rohrer (2010) - Applied Cognitive Psychology",
    resumoEvidencia: "Estudar a mesma matéria por 6 horas seguidas gera fadiga atencional e saturação. Alternar entre 2 ou 3 matérias de naturezas diferentes renova o frescor cognitivo.",
    explicacao: "Rotacionar blocos de 50 minutos entre matérias contrastantes (ex: Matemática -> História -> Biologia).",
    paraQueServe: "Manter alto rendimento durante dias inteiros de estudo sem sensação de esgotamento precoce.",
    quandoUsar: [
      "Jornadas de estudo superiores a 3 horas no dia",
      "Rotinas de preparação para vestibulares multivariados",
    ],
    quandoNaoUsar: [
      "Em sessões curtas de menos de 1 hora no total",
    ],
    dicaPratica: "Alterne sempre entre uma matéria de cálculo e uma matéria de leitura para descansar as áreas corticais.",
  },
  {
    id: "sq3r",
    nome: "Método SQ3R de Leitura Ativa",
    nomeIngles: "SQ3R (Survey, Question, Read, Recite, Review)",
    categoria: "organizacao",
    nivelEvidencia: "Moderada Utilidade",
    referenciaCientifica: "Francis P. Robinson (1946) - 'Effective Study'; Dunlosky et al. (2013)",
    resumoEvidencia: "Transforma a leitura passiva em uma investigação ativa através das 5 etapas: Reconhecer, Questionar, Ler, Recitar e Revisar.",
    explicacao: "Protocolo sistemático de estudo de livros: 1. Survey (examinar títulos/figuras); 2. Question (criar perguntas); 3. Read (ler procurando as respostas); 4. Recite (dizer de cabeça); 5. Review (revisar no final).",
    paraQueServe: "Garantir 100% de compreensão em leituras densas e difíceis que costumam dar sono.",
    quandoUsar: [
      "Livros técnicos e manuais de referência",
      "Artigos acadêmicos densos",
    ],
    quandoNaoUsar: [
      "Leitura literária de ficção ou lazer",
    ],
    dicaPratica: "Nunca comece a ler a página 1 sem antes folhear todo o capítulo olhando gráficos e subtítulos por 3 minutos.",
  },
];
