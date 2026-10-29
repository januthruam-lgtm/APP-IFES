# Registro de Decisões de Arquitetura e Engenharia (docs/DECISOES.md)

Este documento registra todas as decisões tomadas durante a reorganização do Brain Studio e a implementação da economia segura e programa de fidelidade.

---

## 1. Decisão: Arquitetura Canônica de 5 Abas
- **Problema**: O aplicativo possuía um menu com mais de 14 itens no mesmo nível e múltiplos pontos de entrada conflitantes.
- **Opções Analisadas**:
  1. Manter a barra lateral longa com agrupamentos retráteis no desktop e gaveta no mobile.
  2. Adotar a arquitetura canônica de 5 abas (Início, Estudar, Lumina, Jogo, Perfil) com componentes responsivos adaptativos (`TabBar` em <768px, `NavigationRail` entre 768px e 1024px, `Sidebar` em ≥1024px).
- **Decisão Escolhida**: Opção 2.
- **Justificativa**: Permite uso com uma única mão no mobile (polegar), elimina navegações concorrentes, preserva o estado de cada módulo e garante que qualquer funcionalidade seja alcançada em até 3 toques.

---

## 2. Decisão: Remoção das Moedas e XP por Tarefas e Análise de Causa Raiz
- **Problema**: O Organizador de Tarefas apresentava comportamento instável, com créditos repetidos e inflação artificial de saldo.
- **Causa Raiz Identificada**:
  1. **Ausência de idempotência e ausência de verificação de transição de estado única**: No componente `TasksTab.tsx` (linhas 90-97), a função `handleToggleTask` chamava `onRewardXp(20)` e `onRewardCoins(5)` sempre que `nextCompleted` se tornava verdadeiro.
  2. O usuário podia marcar a tarefa como concluída, desmarcá-la e marcá-la novamente infinitamente, ganhando 5 moedas e 20 XP a cada clique ("farming" de tarefas).
  3. A sincronização local/offline via `localStorage` não mantinha um carimbo transacional imutável no Firestore, permitindo repetição descontrolada de recompensas.
- **Decisão Escolhida**:
  - Remoção imediata do ganho de moedas e XP ao concluir tarefas (`tarefas.recompensa = false` e remoção de `tarefas` de `XP_MAXIMO_DIARIO_POR_ATIVIDADE`).
  - O Organizador de Tarefas continua 100% funcional como ferramenta de produtividade e foco pessoal, livre de incentivos artificiais de farming.
  - Missões e conquistas foram redirecionadas para atividades reais de estudo verificáveis (revisão de flashcards, simulados 10Q, leitura acadêmica e métodos de estudo).
  - Regras de segurança no Firestore bloqueiam categoricamente qualquer tentativa de creditar moedas ou XP com origem "tarefa".

---

## 3. Decisão: Extrato de Moedas como Livro-Razão Imutável
- **Problema**: Saldos de moedas eram alterados em múltiplos pontos do código sem rastreabilidade nem histórico auditável.
- **Decisão Escolhida**:
  - Criação da subcoleção `users/{uid}/extrato/{id}` estritamente de **apenas inserção** (append-only, sem permissão de alteração ou exclusão pelo cliente).
  - Toda e qualquer movimentação de moedas deve passar pela função unificada e transacional `movimentarMoedas(uid, delta, origem, refId, idempotencyKey)`.
  - Migração de saldo legado executada de forma idempotente: um lançamento inicial com `origem: "historico"` registra o saldo pré-existente do estudante para conferência contábil exata.

---

## 4. Decisão: Programa de Fidelidade sem Especulação ou Pressão
- **Problema**: Recompensar os estudantes por seus estudos e investimentos na plataforma sem criar vícios de urgência, sorteios ou mecânicas predatórias (respeitando o ECA Digital e a proteção a menores).
- **Decisão Escolhida**:
  - Gasto elegível limitado a itens permanentes (obras da vila, cosméticos duráveis, títulos e evolução do pet); consumíveis (comida, brinquedo) NÃO geram cashback.
  - Níveis de cliente calculados em janela móvel de 30 dias a partir do extrato contábil.
  - Cofre de Retorno com teto máximo de 500 moedas e resgate semanal máximo de 250 moedas, condicionado à conclusão de pelo menos 1 missão de estudo no dia do resgate.
  - Vales-desconto semanais fixos para níveis Prata+, com teto acumulado de desconto (cidade + vale) de 20%.
  - Selos de fidelidade (1 a cada 100 moedas gastas) para desbloqueio exclusivo de itens cosméticos artísticos originais, sem vantagens competitivas mecânicas.

---

## 5. Decisão: Configurações como Página com Busca Interna
- **Problema**: O modal de configurações anterior empilhava abas e abria sobre outras telas interativas, gerando modais sobrepostos.
- **Decisão Escolhida**: Configurações passa a ser uma subpágina canônica dentro da aba Perfil (`/perfil/configuracoes`), com busca em tempo real, agrupamento claro e suporte nativo ao botão voltar do sistema.

---

## 6. Decisão: Preservação de Rótulos de Acessibilidade
- **Problema**: O app afirmava "WCAG AAA" sem auditoria formal externa.
- **Decisão Escolhida**: Substituído por "Acessibilidade e Inclusão", mantendo todos os recursos pré-existentes (alto contraste, dislexia, redução de movimento, temas) com alvos de toque aumentados para ≥ 44x44px.

---

## 7. Decisão: Chaves React Únicas para Seleção de Campus AVA
- **Problema**: A lista de instâncias do Moodle AVA do IFES (`IFES_CAMPUSES_LIST`) possui múltiplos campi que compartilham o mesmo endpoint Moodle centralizado (`https://ava3.cefor.ifes.edu.br`). No `AuthModal.tsx`, a renderização usava `key={c.url}`, gerando colisões de chaves idênticas (`https://ava3.cefor.ifes.edu.br`) e warning de React.
- **Decisão Escolhida**: Atualizada a chave para `key={'auth-campus-' + c.id}`, utilizando o identificador único e estável de cada campus (`guarapari`, `cefor-ava3`, `ava-geral`, `serra`, `vitoria`, etc.). Padronizado também o fallback com índice nos arrays de listas dinâmicas.

---

## 8. Decisão: Conexão com Conta Google e E-mail de Confirmação Obrigatório
- **Problema**: Facilitar a entrada imediata dos estudantes com a conta Google sem perder o controle de autenticidade e validação de e-mails, com aviso instantâneo para o estudante.
- **Decisão Escolhida**:
  - Implementação do `entrarComGoogle()` usando `GoogleAuthProvider` nativo do Firebase Auth com seleção de conta (`prompt: select_account`).
  - Sincronização atômica em `users/{uid}` com avatar, nome de exibição e valores iniciais de gamificação.
  - Despacho automático de e-mail de confirmação via `sendEmailVerification` e notificação de auditoria `/api/auth/send-confirmation-notice`.
  - Tratamento específico de popups bloqueados (`auth/popup-blocked`), janelas canceladas e limites de taxa de reenvio.
  - Artefato de suporte e guia de configuração criado em `/.aistudio/artifacts/brain/76abf6e8-4f73-4011-91a7-7c8e5a183fec/guia_login_google_e_confirmacao_email.md`.

---

## 9. Decisão: Prevenção Definitiva de 'Unexpected token <' em Scripts
- **Problema**: O erro de sintaxe `Uncaught SyntaxError: Unexpected token '<'` ocorre quando um script ou módulo JavaScript tenta carregar e o servidor (ou o Service Worker) responde com uma página HTML (`<!doctype html>`) em vez de código JavaScript válido.
- **Causas Raiz Identificadas**:
  1. O Service Worker (`public/sw.js`) continha um fallback genérico `cached || caches.match('/')` em caso de erro de rede, devolvendo o `index.html` para requisições de scripts e assets.
  2. O Service Worker estava sendo registrado no ambiente de desenvolvimento, interceptando e armazenando módulos dinâmicos do Vite.
  3. O servidor Vite em modo middleware com `appType: 'spa'` e o Express realizavam fallback de SPA para rotas de assets estáticos inexistentes.
- **Decisão Escolhida**:
  - `public/sw.js`: Fallback para `/` restrito estritamente a navegação de páginas inteiras (`event.request.mode === 'navigate'`). Requisições de assets devolvem 404 text/plain.
  - `src/main.tsx` e `index.html`: Auto-recuperação que desregistra ativamente qualquer Service Worker em ambientes de desenvolvimento (`ais-dev`, `localhost`) e purga caches legados.
  - `server.ts`: Middleware global que intercepta requisições com extensão de script/estilo (`.js`, `.css`, etc.) e devolve `404 Not Found` em texto puro em vez de `index.html`.

---

## 10. Decisão: Remoção Integral de Chamadas e Transformação na Sala de Foco em Grupo (Bloco 1B)
- **Problema**: O aplicativo continha chamadas de vídeo e áudio em tempo real via WebRTC e servidores de mídia/sinalização, o que gerava complexidade extrema, instabilidade em conexões móveis, custos de servidor e riscos de privacidade/segurança para menores de idade.
- **Opções Analisadas**:
  1. Manter chamadas com limitação de largura de banda e aviso parental.
  2. Remover completamente áudio/vídeo/WebRTC e transformar o espaço coletivo na "Sala de Foco em Grupo" (Pomodoro + metas de sessão + chat de texto colaborativo + presença).
- **Decisão Escolhida**: Opção 2.
- **Justificativa**:
  - Elimina riscos de assédio audiovisual e exposição para estudantes menores de idade (alinhado com ECA Digital).
  - Elimina necessidade de permissões perigosas (`CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS`) no AndroidManifest e PWA.
  - Reduz drasticamente a latência e o consumo de dados móveis em redes 3G/4G/5G de estudantes de baixa renda.
  - Preserva 100% da colaboração e apoio mútuo através de cronômetro Pomodoro sincronizado, canal de texto e metas de foco em tempo real.

---

## 11. Decisão: Tratamento de Idiomas, Suporte RTL e Eliminação de Texto Invertido (Bloco 2)
- **Problema**: Em alguns idiomas RTL ou scripts não latinos, caracteres e palavras apareciam distorcidos ou espelhados, e ausência de fontes adequadas quebrava renderização.
- **Diagnóstico por Inspeção**:
  1. No `src/index.css`, regras legadas com seletores nth-of-type continham propriedades frágeis (`font-size: 0px`, `line-height: -3px`) que causavam clipping e sobreposição em navegadores móveis.
  2. Faltava uma pilha de fontes tipográficas com cobertura segura de múltiplos alfabetos (Noto Sans Arabic, Noto Sans Hebrew, Noto Sans SC/JP/KR, Devanagari e Thai).
  3. Faltavam regras CSS explícitas para garantir que `dir="rtl"` nunca inverta letras via `transform`, espelhando estritamente ícones direcionais (setas, chevrons, voltar, avançar).
  4. Sincronização de 100% dos 25 arquivos de tradução em `src/locales/` com verificação de ordem lógica dos caracteres Unicode (sem bidi-override).
- **Decisão Escolhida**:
  - `dir="rtl"` aplicado exclusivamente nos 4 idiomas corretos: Árabe (`ar`), Hebraico (`he`), Persa (`fa`) e Urdu (`ur`). Todos os outros 21 idiomas utilizam estritamente `dir="ltr"`.
  - Pilha de fontes declarada em `src/index.css` com suporte para Inter, Roboto, Noto Sans, Noto Sans Arabic, Noto Sans Hebrew, Noto Sans CJK, Devanagari e Thai.
  - Ícones direcionais espelhados com `.rtl-flip`, `[data-rtl-flip="true"]` e seletores Lucide (`svg.lucide-arrow-*`, `svg.lucide-chevron-*`), garantindo que o texto nunca seja transformado.
  - Criado teste automatizado `scripts/test-i18n-rtl.ts` validando 1.275 assertions em todos os 25 idiomas.

---

## 12. Decisão: Extrato de Moedas como Livro-Razão Contábil, Concorrência e Reconciliação (Bloco 3)
- **Problema**: Saldos de moedas precisam de rastreabilidade matemática perfeita, sem permitir saldo negativo, sem perda de integridade sob concorrência e com reconciliação transparente.
- **Solução Implementada**:
  1. **Transações Atômicas**: Toda e qualquer alteração de saldo passa obrigatoriamente por `movimentarMoedas(uid, delta, origem, refId, idempotencyKey)`. O cliente nunca escreve saldo diretamente.
  2. **Idempotência**: Cada lançamento possui uma `idempotencyKey` única; chamadas concorrentes duplicadas são identificadas e não alteram o saldo mais de uma vez.
  3. **Migração Não Destrutiva**: Se o estudante possui saldo legado anterior sem lançamentos, a função `garantirSaldoInicialExtrato` cria um lançamento com `origem: "historico"` de igual valor.
  4. **Filtros Completos no Extrato**: Adicionados filtros combinados por período ("7 dias", "30 dias", "Tudo") e por tipo ("Todos", "Ganhos (+)", "Gastos (-)", "Cashback") no componente `ExtratoMoedasView.tsx`.
  5. **Auditoria e Reconciliação**: Criada a função `reconciliarSaldoExtrato(uid, saldoAtual)`, que recalcula matematicamente o saldo a partir dos lançamentos e, em caso de divergência, registra o ajuste no extrato e corrige o saldo para o valor contábil exato.
  6. **Validação**: Teste automatizado `scripts/test-extrato-concorrencia.ts` validando 10 chamadas assíncronas concorrentes, bloqueio de saldo negativo e reconciliação.

---

## 13. Decisão: Unificação da Central de Notificações, Preferências e Suporte Offline (Bloco 4)
- **Problema**: Havia duplicidade de modais (`NotificationSettingsModal`), notificações espalhadas sem persistência segura, e falta de sincronia entre o ícone de sino do TopBar e a tela de preferências do perfil.
- **Solução Implementada**:
  1. **Fonte Única de Notificações**: Criada a `CentralNotificacoesView.tsx`, unindo em abas fluidas o Feed de Notificações (com histórico de prazos, conquistas, equipe, pet, ofensiva e resumo) e o Painel de Preferências Granular.
  2. **Navegação Consistente**: O clique no sino do TopBar e o item Notificações em Perfil direcionam para a mesma tela canônica (`setCanonicalTab("perfil"); setCanonicalSubView("notificacoes");`). O modal legado foi descontinuado.
  3. **Persistência Híbrida**: Firestore em `users/{uid}/notificacoes/{id}` com fallback em LocalStorage (`brain_studio_notif_feed_v2`), assegurando carregamento instantâneo offline e sincronização em tempo real.
  4. **Não Perturbe & Filtro de Categorias**: Modo "Não Perturbe" suprime a criação de notificações e silencia o app. Desativação de categorias específicas (conquistas, equipe, pet, ofensiva, resumo) impede novas notificações daquela categoria sem perda de dados históricos.
  5. **Capacitor Local Notifications**: Agendamento de lembrete diário de ofensiva sem depender de conexão contínua com a internet, respeitando o horário configurado pelo estudante.
  6. **Contador em Tempo Real**: `AppShell` recebe `unreadNotificationsCount` e exibe o badge numérico no TopBar em tempo real.
  7. **Validação**: Teste automatizado `scripts/test-notificacoes.ts` validando preferências, silenciamento, filtros de categoria, criação, marcação como lida e limpeza.

---

## 14. Decisão: Edição de Matérias, Agenda Anual 12 Meses e Remoção de 'Fundamentação e Conceitos' (Blocos 5 e 5.6)
- **Problema**: Faltava personalização de matérias (criar, renomear, reordenar, cor, ícone, professor, sala, horário, plano de ensino, arquivar e ocultar), a agenda não cobria os 12 meses navegáveis com recorrência e export/import .ics, e o termo "Fundamentação e conceitos" precisava ser substituído por organização clara por matéria e tópicos.
- **Solução Implementada**:
  1. **Gerenciador de Matérias Completo (`CourseManagerModal.tsx`)**:
     - Criação de novas matérias personalizadas e edição de existentes.
     - Suporte a matérias sincronizadas (com tag "Sincronizada" e preservação do nome oficial, permitindo alterar nome de exibição, cor, ícone e ordem).
     - Campos completos: Professor(a), Sala/Link das aulas, Horário semanal, Plano de ensino/ementa e Anotações pessoais.
     - Controles de "Arquivar" (para semestres anteriores) e "Ocultar da Trilha", com filtros ("Ativas", "Arquivadas", "Ocultas", "Todas").
     - Reordenação intuitiva de matérias (subir/descer) persistida em `order`.
  2. **Agenda & Calendário 12 Meses (`src/services/agendaService.ts` e `AgendaTab.tsx`)**:
     - Grade completa dos 12 meses navegáveis por ano e seletor rápido por pílulas (Jan a Dez).
     - 4 visões integradas: Mês (grade com 35/42 células e badges), Semana (7 dias horizontais), Dia (cronograma horário) e Lista (próximos 30 dias em ordem cronológica).
     - Tipos de eventos suportados: aula, prova, trabalho, entrega, revisão, pessoal, feriado, reunião, estudo, plantão.
     - Recorrência configurável: diária, semanal, quinzenal e mensal, com data limite de término.
  3. **Feriados Brasileiros Oficiais e Locais**:
     - Cálculo de feriados nacionais fixos e móveis do Brasil (Carnaval, Sexta-feira Santa, Páscoa, Corpus Christi, etc.).
     - Modal para o estudante cadastrar feriados acadêmicos (ex: semanas de recesso escolar do IFES) e municipais.
  4. **Integração Bidirecional**:
     - Prazos do AVA/Moodle e tarefas ativas são injetados automaticamente na Agenda.
     - Concluir eventos na agenda atualiza as tarefas e atividades correspondentes no armazenamento.
  5. **Exportação e Importação iCalendar RFC 5545 (.ics)**:
     - Geração de arquivos `.ics` compatíveis com Google Agenda, Apple Calendar e Outlook.
     - Importação via upload de arquivo `.ics` com parser de eventos e regras de recorrência.
  6. **Item 5.6 (Remoção de 'Fundamentação e Conceitos')**:
     - Substituído em geradores de módulos e aulas por "Introdução e Visão Geral da Matéria" e "Tópico Teórico", com foco em organização prática por tópicos e problemas reais.
  7. **Validação Automatizada**:
     - Teste `scripts/test-agenda-materias.ts` com validações de feriados, matriz 12 meses, recorrência, sincronização bidirecional e import/export .ics integrado ao `npm test`.
