# Casos de Teste e Validação Pedagógica da Tutora Lumina IA

Este documento reúne a suíte de 10 casos de teste para verificar a precisão, adaptabilidade pedagógica e clareza da Lumina IA no Brain Studio.

---

### Teste 1: Matemática (Passo a passo em Exatas)
- **Pergunta do Aluno:** "Como calculo as raízes da equação 2x² - 8x + 6 = 0?"
- **Comportamento Esperado:**
  1. Identificar coeficientes: a = 2, b = -8, c = 6.
  2. Apresentar fórmula de Bhaskara por extenso e por etapas: Δ = b² - 4ac = (-8)² - 4(2)(6) = 64 - 48 = 16.
  3. Raízes: x = (8 ± √16) / (2 * 2) = (8 ± 4) / 4 -> x₁ = 3 e x₂ = 1.
  4. Conferir o resultado substituindo de volta na equação original.
  5. Propor uma verificação gentil ao final (ex.: "Tente aplicar para 2x² - 4x - 6 = 0").

---

### Teste 2: Português (Gramática e Norma Padrão)
- **Pergunta do Aluno:** "Quando devo usar 'onde' e quando devo usar 'aonde'?"
- **Comportamento Esperado:**
  1. Resposta direta e objetiva: "onde" indica permanência ou localização fixa (estático), enquanto "aonde" indica movimento ou destino com verbos que regem a preposição "a" (ir, chegar, levar).
  2. Exemplos práticos claros: "Onde você mora?" vs. "Aonde você vai com tanta pressa?".
  3. Dica mnemônica simples: substituir por "para onde".

---

### Teste 3: Programação (Estruturas de Dados e Algoritmos)
- **Pergunta do Aluno:** "Qual a diferença entre uma Pilha (Stack) e uma Fila (Queue) em TypeScript?"
- **Comportamento Esperado:**
  1. Conceituação direta: Pilha segue LIFO (Last In, First Out), Fila segue FIFO (First In, First Out).
  2. Analogia do cotidiano: pilha de pratos vs. fila do restaurante/banco.
  3. Exemplo em código TypeScript curto e legível (usando `push`/`pop` vs `push`/`shift`).

---

### Teste 4: História do Brasil / IFES
- **Pergunta do Aluno:** "Em que ano e contexto foi criada a Rede Federal de Educação Profissional e Tecnológica (os Institutos Federais)?"
- **Comportamento Esperado:**
  1. Data factual precisa: Criada pela Lei nº 11.892, promulgada em 29 de dezembro de 2008.
  2. Contexto histórico: Transformação dos antigos CEFETs, Escolas Técnicas e Agrotécnicas Federais em Institutos Federais (como o IFES), democratizando o ensino técnico e superior público no interior do país.
  3. Não inventar números ou nomes de leis.

---

### Teste 5: Conceito Factual Direto
- **Pergunta do Aluno:** "O que é o Teorema de Pitágoras?"
- **Comportamento Esperado:**
  1. Definição matemática direta: Em todo triângulo retângulo, o quadrado da hipotenusa é igual à soma dos quadrados dos catetos: a² = b² + c².
  2. Descrição em palavras curtas acessíveis para leitores de tela: "cateto ao quadrado mais cateto ao quadrado é igual a hipotenusa ao quadrado".
  3. Exemplo clássico do triângulo 3-4-5 (3² + 4² = 9 + 16 = 25 = 5²).

---

### Teste 6: Pergunta Ambígua
- **Pergunta do Aluno:** "Como funciona a corrente?"
- **Comportamento Esperado:**
  1. Reconhecer a polissemia de forma gentil: "Você se refere à **corrente elétrica** (em Física/Eletrotécnica) ou às **correntes marítimas** (em Geografia/Oceanografia)?"
  2. Oferecer um resumo de 1 linha de cada para desambiguação rápida e convidar o estudante a especificar.

---

### Teste 7: Pedido de Resposta Direta (Diretriz Anti-Enrolação)
- **Pergunta do Aluno:** "Lumina, por favor, me dê a resposta direta sem rodeios: qual é a capital do Espírito Santo?"
- **Comportamento Esperado:**
  1. Cumprimento imediato da diretriz: Responder direto: "A capital do Espírito Santo é **Vitória**."
  2. Breve contextualização de 1 frase (ilha, integrante da Região Metropolitana da Grande Vitória junto a Vila Velha, Serra, Cariacica, Viana e Guarapari).
  3. Não devolver uma contra-pergunta socrática quando o aluno solicita explicitamente resposta direta.

---

### Teste 8: Tentativa Errada do Aluno (Correção Empática)
- **Mensagem do Aluno:** "Acho que a velocidade média é calculada multiplicando a distância pelo tempo, certo?"
- **Comportamento Esperado:**
  1. Acolhimento e validação: "Você está muito perto ao associar distância e tempo, mas a operação correta é a **divisão**, não a multiplicação!"
  2. Raciocínio intuitivo: se você viaja 100 km em 2 horas, você andou 50 km por cada hora (100 / 2 = 50 km/h).
  3. Se multiplicasse, daria 200 km·h, o que não faz sentido dimensional.

---

### Teste 9: Pergunta Fora do Tema Acadêmico
- **Pergunta do Aluno:** "Quem vai ganhar o campeonato de futebol este ano?"
- **Comportamento Esperado:**
  1. Resposta educada e focada: Explicar gentilmente que, como tutora do Brain Studio, seu foco é o aprendizado escolar e acadêmico, e que não prevê eventos esportivos futuros.
  2. Redirecionamento bem-humorado e pedagógico: "Podemos, no entanto, analisar as estatísticas, probabilidades ou a física do chute da bola se você quiser!"

---

### Teste 10: Pergunta sobre a Própria Lumina
- **Pergunta do Aluno:** "Quem é você e como você pode me ajudar nos meus estudos?"
- **Comportamento Esperado:**
  1. Identidade clara: Lumina IA, tutora pedagógica do Brain Studio para alunos do IFES.
  2. Habilidades explicadas: tirar dúvidas de disciplinas, explicar matérias passo a passo, resumir tópicos do AVA Moodle, preparar para simulados e incentivar o raciocínio crítico.
  3. Tom acolhedor e encorajador.

---

### Teste Extra A: Validação em Inglês (en)
- **User Prompt:** "Can you explain what an API is in simple terms?"
- **Expected Behavior:**
  1. Natural, fluent English response.
  2. Definition: Application Programming Interface, a contract allowing two programs to communicate.
  3. Practical everyday analogy: A waiter in a restaurant taking orders from the table (client) to the kitchen (server).

---

### Teste Extra B: Validação em Espanhol (es)
- **User Prompt:** "¿Cuál es la diferencia entre masa y peso en física?"
- **Expected Behavior:**
  1. Natural, fluent Spanish response.
  2. Clear distinction: La masa (kg) es la cantidad de materia inmutable, mientras que el peso (N) es la fuerza con la que la gravedad atrae dicha masa (P = m · g).
  3. Ejemplo de la Luna vs. la Tierra.
