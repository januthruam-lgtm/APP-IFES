# Auditoria Completa de UX e Inventário de Funcionalidades (Brain Studio)

## 1. Inventário Completo do Estado Atual

O Brain Studio possui um ecossistema rico de funcionalidades acadêmicas e de gamificação, que antes estavam distribuídas em uma barra lateral com 14+ itens planos, múltiplos cabeçalhos, atalhos concorrentes e modais sobrepostos.

### (a) Telas, Abas e Módulos Existentes
1. **Dashboard** (`dashboard`):
   - Hero com progresso bimestral e horas de estudo.
   - Próximos prazos de entrega do AVA Moodle IFES.
   - Widget do Mascote 3D (PuppetPet).
   - Missões diárias e resumo de ofensiva (streak).
2. **Organizador de Tarefas** (`tasks`):
   - Lista de tarefas com prioridade (baixa, média, alta).
   - Categorização por disciplina do AVA ou geral.
   - Filtros de status (pendentes / concluídas).
   - Criação de novas tarefas com prazo e lembrete.
3. **Agenda Compartilhada** (`agenda`):
   - Visualização semanal/mensal de provas, trabalhos e aulas.
   - Integração com horários de disciplinas e eventos da turma.
4. **Métodos de Estudo** (`study_methods`):
   - Cronômetro Pomodoro configurável com ciclos de foco e pausa.
   - Técnica Feynman para simplificação e auto-explicação.
   - Active Recall e Repetição Espaçada com diretrizes científicas.
5. **Flashcards Anki** (`flashcards`):
   - Algoritmo de repetição espaçada SM-2.
   - Criação e estudo de decks e cartões.
   - Classificação por facilidade (Errei, Difícil, Bom, Fácil).
6. **Grupo de Estudos Virtual / Sala Ao Vivo** (`study_room`):
   - Chamadas WebRTC de áudio e vídeo em tempo real.
   - Compartilhamento de tela e chat textual da sala.
   - Quadro branco colaborativo.
7. **AVA Moodle IFES** (`ifes`):
   - Sincronização oficial de cursos, notas, fóruns e questionários.
   - Status de conexão de matrícula e campus.
   - Importação e cálculo automático de notas na escala 0-100 do IFES.
8. **Minhas Disciplinas AVA** (`sequence`):
   - Catálogo de matérias ativas com código, professor e carga horária.
   - Trilha pedagógica de tópicos e materiais.
9. **Tutora Inteligente Lumina IA** (`lumina`):
   - Chat socrático com histórico de conversas.
   - Níveis de explicação (Fundamental, Médio, Técnico, Superior).
   - Memória de contexto do estudante.
10. **Simulados 10 Questões** (`games`):
    - Geração e resolução de blocos de 10 questões avaliativas.
    - Suporte a envio de tópicos e apostilas com correção imediata.
11. **Biblioteca Digital & Acervo** (`library`):
    - Obras completas em domínio público (Machado de Assis, José de Alencar, etc.).
    - Leitor focado com anotações e exportação para flashcards.
12. **Dicionário Escolar & Léxico** (`dictionary`):
    - Consulta offline de verbetes, sinônimos, classes gramaticais e exemplos.
13. **Equipes & Batalhas** (`teams`):
    - Gestão de guildas acadêmicas e baú cooperativo da equipe.
    - Duelos 1v1 de perguntas rápidas entre estudantes.
    - Chat em grupo da equipe em tempo real com indicador de presença.
14. **Loja de Mascotes & Economia** (`store`):
    - Adoção de pets 3D (Coruja, Raposa, Dragão, etc.).
    - Compra de cosméticos, molduras e melhorias de energia.
15. **Construções da Vila / Cidades do Conhecimento** (`cidade` / `construcoes`):
    - Cenário panorâmico ilustrado com monumentos interativos.
    - Botões flutuantes de construção posicionados logo acima de cada edificação.
    - 5 estrelas por monumento e estágios de Maestria infinita.
    - Mapa ilimitado de vilas do saber e ajuda comunitária diária.
16. **Configurações & Preferências** (`settings`):
    - Alternância de tema (Claro / Escuro).
    - Seletor de idiomas (25 idiomas catalogados com suporte LTR e RTL).
    - Painel de Acessibilidade e Inclusão (alto contraste, fontes grandes, dislexia, redução de movimento).
    - Ajustes de notificações e limpeza de cache offline.

### (b) Problemas Críticos de UX Identificados na Auditoria
1. **Excesso de Itens no Mesmo Nível**:
   A barra lateral anterior apresentava 14+ botões verticais sem agrupamento claro, forçando rolagem vertical excessiva em telas menores e sobrecarregando cognitivamente o estudante novato.
2. **Duplicidade de Atalhos e Contadores Deslocados**:
   - O contador de colegas online ficava no topo do cabeçalho global, gerando ruído visual; seu local natural é dentro de **Equipes & Batalhas**.
   - O seletor de idioma estava tanto no menu lateral quanto nas configurações e modais.
   - Atalhos para a Lumina e para o AVA apareciam simultaneamente no header, sidebar e cartões do dashboard.
3. **Modais Sobrepostos (Stacking)**:
   Abrir Configurações enquanto estava na visualização de um pet ou do AVA abria um modal sobre outro modal, gerando perda de contexto e problemas de toque no mobile.
4. **Rótulos Confusos & Jargões**:
   - Presença de afirmações desnecessárias ("WCAG AAA") sem comprovação formal.
   - Nomes como "Coin Master" desconectavam a proposta pedagógica do app.
5. **Vulnerabilidade Econômica nas Tarefas**:
   Concluir e desmarcar tarefas consecutivamente creditava moedas e XP repetidamente sem trava de idempotência nem extrato unificado.

### (c) Mapa de Migração "Antes e Depois"

| Funcionalidade Anterior | Onde Ficava | Nova Localização Canônica (5 Abas) | Como Acessar (≤ 3 Toques) |
|---|---|---|---|
| Dashboard | Sidebar > Dashboard | **Início (`/inicio`)** | Aba 1 (1 toque) |
| Minhas Disciplinas | Sidebar > Minhas Disciplinas | **Estudar > Organizar > Disciplinas** | Aba Estudar > Sub-aba Disciplinas (2 toques) |
| Organizador de Tarefas | Sidebar > Tarefas | **Estudar > Organizar > Tarefas** | Aba Estudar > Sub-aba Tarefas (2 toques) |
| Agenda Compartilhada | Sidebar > Agenda | **Estudar > Organizar > Agenda** | Aba Estudar > Sub-aba Agenda (2 toques) |
| Flashcards Anki | Sidebar > Flashcards | **Estudar > Praticar > Flashcards** | Aba Estudar > Sub-aba Flashcards (2 toques) |
| Simulados 10Q | Sidebar > Simulados | **Estudar > Praticar > Simulados 10Q** | Aba Estudar > Sub-aba Simulados (2 toques) |
| Métodos de Estudo (Pomodoro) | Sidebar > Métodos | **Estudar > Praticar > Métodos** | Aba Estudar > Sub-aba Métodos (2 toques) |
| Biblioteca Digital | Sidebar > Biblioteca | **Estudar > Aprender > Biblioteca** | Aba Estudar > Sub-aba Biblioteca (2 toques) |
| Dicionário Escolar | Sidebar > Dicionário | **Estudar > Aprender > Dicionário** | Aba Estudar > Sub-aba Dicionário (2 toques) |
| Sala de Estudos Virtual | Sidebar > Sala de Estudos | **Estudar > Estudar com outros > Sala Virtual** | Aba Estudar > Sub-aba Sala Virtual (2 toques) |
| AVA Moodle IFES | Sidebar > AVA Moodle | **Estudar > Sistemas Conectados > AVA IFES** | Aba Estudar > Sistemas Conectados (2 toques) |
| Tutora IA Lumina | Sidebar > Lumina IA | **Lumina (`/lumina`)** | Aba 3 Central em Destaque (1 toque) |
| Pet 3D & Cuidados | Sidebar > Loja > Pet | **Jogo > Mascote 3D (`/jogo/pet`)** | Aba Jogo > Pet (2 toques) ou Card Início (1 toque) |
| Construções da Vila | Sidebar > Cidade do Saber | **Jogo > Vilas & Obras (`/jogo/vilas`)** | Aba Jogo > Vilas (2 toques) |
| Equipes & Batalhas | Sidebar > Equipes | **Jogo > Equipes & Batalhas (`/jogo/equipes`)** | Aba Jogo > Equipes (2 toques) |
| Loja de Mascotes | Sidebar > Loja de Pets | **Jogo > Loja (`/jogo/loja`)** | Aba Jogo > Loja (2 toques) |
| Programa de Fidelidade | Novo | **Jogo > Loja > Fidelidade** | Aba Jogo > Loja > Fidelidade (3 toques) |
| Extrato de Moedas | Novo | **Jogo > Carteira > Extrato** | Aba Jogo > Carteira (2 toques) ou Toque no Saldo (1 toque) |
| Configurações & Temas | Modal flutuante | **Perfil > Configurações (`/perfil/configuracoes`)** | Aba Perfil > Configurações (2 toques) |
| Acessibilidade & Inclusão | Modal de acessibilidade | **Perfil > Configurações > Acessibilidade** | Aba Perfil > Acessibilidade (3 toques) |
| Busca Global | Não existia | **Cabeçalho > Ícone da Lupa** | Qualquer tela > Lupa (1 toque) |

Nenhuma funcionalidade foi removida; 100% do inventário foi preservado e realocado com ergonomia mobile-first.
