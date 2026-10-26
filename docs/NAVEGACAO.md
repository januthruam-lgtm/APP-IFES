# Arquitetura de Navegação (docs/NAVEGACAO.md)

## 1. Princípios de Navegação
O Brain Studio adota uma arquitetura canônica de 5 abas móvel-centrada, com adaptação progressiva para telas médias e grandes:
- **Telas < 768px (Mobile)**: Barra de navegação inferior (`TabBar`) fixa, com alcance imediato do polegar (thumb zone). A Lumina IA fica destacada no centro com elevação e gradiente.
- **Telas 768px - 1023px (Tablet / Foco)**: Trilho de navegação lateral compacto (`NavigationRail`) para maximizar o espaço vertical de leitura e exercícios.
- **Telas ≥ 1024px (Desktop)**: Barra lateral completa (`Sidebar`) com agrupamento hierárquico, permitindo alternância instantânea.

## 2. As 5 Abas Canônicas

### Aba 1: Início (`/inicio`)
- **Propósito**: O cockpit diário do estudante ("Hoje").
- **Componentes**:
  - Saudação personalizada com nível e foto do estudante.
  - Cartão de retomada rápida: "Continuar de onde você parou".
  - Próximos prazos de entrega do AVA IFES (até 3 itens).
  - Missões diárias de estudo (3 missões com barras de progresso).
  - Ofensiva (streak) e bônus ativo.
  - Pet compacto com uma ação de cuidado rápido.
  - Estado do baú cooperativo da equipe.
  - Atalhos rápidos customizáveis (até 4).
  - Checklist "Primeiros Passos" para novos usuários (pulável).

### Aba 2: Estudar (`/estudar`)
- **Propósito**: O polo de produtividade e metodologias ativas.
- **Grupos**:
  1. **Organizar**:
     - *Minhas Disciplinas*: Disciplinas ativas e arquivadas/excluídas do AVA.
     - *Organizador de Tarefas*: Foco e planejamento sem incentivos monetários de farm.
     - *Agenda Compartilhada*: Calendário bimestral/semestral.
  2. **Praticar**:
     - *Flashcards Anki*: Repetição espaçada SM-2.
     - *Simulados 10Q*: Resolução e geração de 10 questões avaliativas.
     - *Métodos de Estudo*: Cronômetro Pomodoro e Técnica Feynman.
  3. **Aprender**:
     - *Biblioteca Digital*: Acervo de obras em domínio público.
     - *Dicionário Escolar*: Busca e léxico gramatical offline.
  4. **Estudar com Outros**:
     - *Sala de Estudos Virtual*: Sessões ao vivo com vídeo, áudio e chat.
  5. **Sistemas Conectados**:
     - *AVA Moodle IFES*: Sincronização de notas, fóruns e boletim.

### Aba 3: Lumina (`/lumina`)
- **Propósito**: Tutoria inteligente individualizada.
- **Componentes**:
  - Botão central elevado na barra inferior com visual vibrante.
  - Chat socrático direto.
  - Histórico de sessões organizadas por tópico e disciplina.
  - Seletor de profundidade didática (Fundamental a Superior).
  - Memória de estudos para personalização.

### Aba 4: Jogo (`/jogo`)
- **Propósito**: Gamificação saudável, cooperação e economia acadêmica.
- **Sub-módulos**:
  1. *Pet 3D*: Cuidados, evolução e personalização do mascote.
  2. *Vilas do Saber*: Obras e monumentos com progressão ilimitada e botões diretos de evolução.
  3. *Equipes & Batalhas*: Guildas, baú coletivo, duelos 1v1 e contagem de colegas online.
  4. *Loja*: Adoção de mascotes, cosméticos e a aba exclusiva de **Fidelidade**.
  5. *Carteira*: Saldo de moedas e **Extrato Completo** (livro-razão com filtros).

### Aba 5: Perfil (`/perfil`)
- **Propósito**: Identidade, preferências e gerenciamento do app.
- **Sub-páginas**:
  1. *Conta & Perfil*: Dados pessoais, matrícula e campus.
  2. *Configurações*: Página com busca interna (Tema, Idioma, Notificações, Cache).
  3. *Acessibilidade e Inclusão*: Alto contraste, tamanho de fonte, redução de movimento, modo dislexia.
  4. *Modo Foco*: Alternância para ocultar elementos de jogo e priorizar estudos puros.
  5. *Planos & Assinaturas*: Benefícios do Brain Studio.
  6. *Ajuda & Suporte*: Tutorial inicial, atalhos e FAQ.

## 3. Busca Global Instantânea (Ctrl+K ou Ícone de Lupa)
- Acessível de qualquer tela através do ícone na TopBar.
- Busca unificada e tolerante a acentos para:
  - Telas e ferramentas do aplicativo.
  - Disciplinas cadastradas.
  - Tarefas pendentes.
  - Decks de flashcards.
  - Seções de configurações.
- Navegável 100% via teclado com teclas de seta e Enter.
