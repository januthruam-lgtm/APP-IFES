# Progresso da Execução Autônoma • Brain Studio

Status consolidado de implementação da **PARTE I (Reorganização Completa do App)** e da **PARTE II (Ajuste de Tarefas, Extrato e Fidelidade)**.

---

## PARTE I · Reorganização Completa do App

- [x] **Auditoria de UX**: Inventário completo de telas, problemas e mapa antes/depois registrado em `docs/AUDITORIA-UX.md`.
- [x] **Decisões Arquiteturais**: Eliminadas duplicatas e decisões registradas em `docs/DECISOES.md`.
- [x] **Nova Arquitetura de Informação**:
  - Aba 1: `Início` (Tela "Hoje" com saudação, continuar estudo, 3 prazos, 3 missões do dia, ofensiva, pet compacto, baú da equipe, 4 atalhos e checklist de primeiros passos).
  - Aba 2: `Estudar` (Central com 4 grupos: Organizar [Disciplinas, Tarefas, Agenda], Praticar [Flashcards Anki, Simulados 10Q, Métodos], Aprender [Biblioteca, Dicionário], Estudar com outros [Sala Virtual], Sistemas Conectados [AVA IFES]).
  - Aba 3: `Lumina` (Tutora socrática destacada no centro, histórico e níveis de explicação).
  - Aba 4: `Jogo` (Vilas do Saber/Cidade com níveis ilimitados e botão sobre construção, Pet 3D, Equipes e Ligas com contador de online, Loja, Carteira/Extrato e Fidelidade).
  - Aba 5: `Perfil` (Conta, Configurações completas como página, Modo Foco, Idioma, Acessibilidade e Inclusão, Notificações, Instituição, Planos, Cache offline, Privacidade e Sobre).
- [x] **Responsividade**: `TabBar` para telas < 768px, `NavigationRail` para telas de 768px a 1023px, `Sidebar` para telas ≥ 1024px.
- [x] **Busca Global Instantânea**: Ícone na TopBar e atalho `Ctrl+K` para busca em matérias, tarefas, flashcards e configurações com tolerância a acentos.
- [x] **Acessibilidade e Usabilidade**:
  - Termo "WCAG AAA" substituído por "Acessibilidade e Inclusão" (sem alegações não auditadas).
  - Tamanho de fonte ajustável até 200%.
  - Redução de movimento (prefers-reduced-motion).
  - Alto contraste e leitura por síntese de voz.
  - Alvos de toque ≥ 44x44px.
- [x] **Ações Destrutivas**: Snackbar de 8 segundos com opção "Desfazer".
- [x] **Design System Unificado**: Criado em `src/components/ui/` (`AppShell`, `TopBar`, `TabBar`, `NavigationRail`, `Button`, `Card`, `ListItem`, `Chip`, `Tabs`, `Badge`, `Avatar`, `Input`, `Switch`, `ProgressBar`, `Skeleton`, `EmptyState`, `Snackbar`, `BottomSheet`, `Dialog`).

---

## PARTE II · Tarefas, Extrato e Programa de Fidelidade

- [x] **Remoção de Recompensas das Tarefas**:
  - Recompensa desativada em `src/config/economia.config.ts` (`TAREFAS.recompensa = false`).
  - Removido crédito de moedas e XP ao alternar tarefas em `TasksTab.tsx`.
  - Exploit de farming eliminado definitivamente.
- [x] **Livro-Razão Contábil (Extrato de Moedas)**:
  - Coleção append-only `users/{uid}/extrato/{id}`.
  - Função atômica `movimentarMoedas()` em `extratoService.ts` com idempotência e suporte offline.
  - Função de auditoria matemática do saldo (`auditarExtrato`).
  - Componente de extrato interativo com filtros e métricas (`ExtratoMoedasView.tsx`).
- [x] **Programa de Fidelidade Acadêmica**:
  - Regras determinísticas em `src/config/fidelidade.config.js`.
  - Níveis por janela móvel de 30 dias (Bronze 1%, Prata 2%, Ouro 3%, Safira 4%, Diamante 5%).
  - Cofre de Retorno com teto de 500 moedas, resgate semanal máximo de 250 moedas e exigência de 1 missão diária no dia do resgate.
  - Concessão de selos de colecionador (1 a cada 100 moedas gastas) e catálogo de recompensas exclusivas.
  - Vales-desconto com teto combinado de 20% e máximo de 150 moedas de desconto.
  - Metas semanais de atividade (500->20, 1500->50, 3000->100 no cofre).
  - Semanas temáticas com bônus de +5% no cofre.
  - Componente visual do clube de fidelidade (`FidelidadeView.tsx`).
- [x] **Regras de Segurança Firestore**: Atualizado em `firestore.rules` com restrição append-only no extrato e bloqueio estrito contra criação de créditos com origem de tarefas.

---

## PARTE III · Autenticação Completa com Firebase Auth

- [x] **Cadastro com E-mail e Senha**:
  - `cadastrarComEmailESenha(email, senha, nome)` em `src/services/authService.ts`.
  - Atualização do perfil do Firebase Auth com `displayName`.
  - Criação automática e segura do perfil em `users/{uid}` no Firestore.
- [x] **Login com E-mail e Senha**:
  - `entrarComEmailESenha(email, senha)` com leitura segura do documento no Firestore.
  - Sincronização em tempo real via `monitorarEstadoAutenticacao(onAuthStateChanged)`.
- [x] **Redefinição de Senha**:
  - `enviarEmailRecuperacaoSenha(email)` com link seguro de recuperação via Firebase.
- [x] **Logout Seguro**:
  - `desconectarUsuario()` executa `signOut(auth)` e limpa storages locais.
- [x] **Interface Aprimorada no `AuthModal.tsx`**:
  - Modos Entrar, Cadastrar e Recuperar Senha com alternador fluido.
  - Indicador e confirmação de senha com opção de mostrar/ocultar.
  - Mensagens de erro contextualizadas e traduzidas em português.
  - Preservação da opção de identificação institucional pelo AVA IFES.
  - Resolução de colisões de chaves React em seletores de campus (`key={`auth-campus-${c.id}`}`).
- [x] **Conexão com a Conta do Google**:
  - `entrarComGoogle()` via `GoogleAuthProvider` e popup oficial no `src/services/authService.ts`.
  - Botão estilizado "Continuar com o Google" com logotipo oficial no `AuthModal.tsx`.
  - Sincronização automática do avatar (`photoURL`), nome e dados no Firestore `users/{uid}`.
- [x] **Envio Direto de E-mail de Confirmação**:
  - `enviarConfirmacaoPorEmail()` integrado ao `sendEmailVerification` do Firebase Auth tanto no login/cadastro por e-mail e senha quanto no login com a Conta Google.
  - Endpoint de auditoria e despacho no backend (`/api/auth/send-confirmation-notice` em `server.ts`).
  - Avisos visuais claros de confirmação na interface para o usuário.
- [x] **Artefato Criado**:
  - `guia_login_google_e_confirmacao_email.md` gerado na pasta de artefatos para referência e documentação.
- [x] **Correção de Erro de Sintaxe ('Unexpected token <')**:
  - Eliminado fallback indevido de HTML para scripts no Service Worker (`public/sw.js`).
  - Auto-limpeza de Service Workers legados em ambientes de desenvolvimento e teste (`index.html` e `main.tsx`).
  - Middleware de proteção de assets no `server.ts` devolvendo 404 text/plain para scripts inexistentes.

---

## EXECUÇÃO DO PROMPT MESTRE (ORDEM DOS BLOCOS)

### [x] BLOCO 1. ESTABILIZAÇÃO
- **1.1 Build e Duplicidade**: Unificada fonte única de verdade em `src/config/features.ts` (exportando `isFeatureEnabled` e o alias `isFeatureAtiva`). Removido `features.js` duplicado. Corrigido aviso de `__dirname` em `vite.config.ts` com `import.meta.dirname || process.cwd()`.
- **1.2 Prevenção CI/Lint**: Criado `.github/workflows/ci.yml` cobrindo lint, testes unitários e build de produção para impedir regressões.
- **1.3 Auditoria de Flags**: Todas as 19 flags auditadas e documentadas em `docs/FLAGS.md`.

### [x] BLOCO 1B. REMOÇÃO DE TUDO QUE ENVOLVE CHAMADAS
- **1B.1 Inventário**: Documentado em `docs/REMOCAO-CHAMADAS.md`.
- **1B.2 Remoção Completa**:
  - Excluído `ActiveCallModal.tsx` e `realtimeCallService.ts`.
  - Removidos botões de áudio/vídeo e listeners de chamadas em `WhatsAppChatModal.tsx`, `OnlineUsersDrawer.tsx`, `CourseWorkspaceView.tsx`, `SequenceTrackTab.tsx`, `GuildsBattlesTab.tsx`, `EstudarTab.tsx`, `JogoTab.tsx`, `App.tsx`.
  - Limpeza no `server.ts`: removidas sessões e rotas de sinalização WebRTC HTTP/WS.
  - Limpeza no `firestore.rules`: removida coleção `/chamadas/{callId}` e corrigida sintaxe em `/sistemas/{sistemaId}`.
  - Limpeza no `src/lib/firebase.ts`: removidas funções WebRTC, tipo `chamada_perdida` e atualizado status para `em_foco`.
  - Limpeza de traduções (`pt-BR.json`, `en.json`, `es.json`).
- **1B.3 Permissões**: Removidas permissões `CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS` de `android/app/src/main/AndroidManifest.xml` e limpo `requestFramePermissions` em `metadata.json`. Atualizado `index.html`.
- **1B.4 Sala de Foco em Grupo**: Transformada a antiga tela em `StudyRoomVirtualTab.tsx` com Pomodoro sincronizado, metas de estudo, colegas focando e chat colaborativo por texto.
- **1B.5 Critérios**: Sem chamadas ou captura de vídeo/áudio no app. Testes e build validados.

### [x] BLOCO 2. IDIOMAS: TEXTO INVERTIDO
- **2.1 Diagnóstico**: Registrado em `docs/DECISOES.md` (Decisão 11). Identificados seletores frágeis de CSS com `font-size: 0px` e `line-height: -3px`, ausência de pilha de fontes universais para múltiplos alfabetos e ausência de regras isoladas de espelhamento direcional.
- **2.2 Correções**:
  - Pilha de fontes declarada em `src/index.css` cobrindo Inter, Roboto, Noto Sans, Noto Sans Arabic, Noto Sans Hebrew, Noto Sans CJK, Devanagari e Thai.
  - Regras explícitas de RTL com `dir="rtl"` exclusivamente em `ar`, `he`, `fa` e `ur`; todos os outros 21 idiomas com `dir="ltr"`.
  - Espelhamento restrito exclusivamente a ícones direcionais via `.rtl-flip`, `[data-rtl-flip="true"]` e chevrons/setas, sem jamais aplicar transformações ao texto.
  - Sincronização de 100% dos 25 arquivos de tradução em `src/locales/` com as novas chaves da Sala de Foco e remoção de termos legados de chamada.
- **2.3 Validação Automatizada**: Criado `scripts/test-i18n-rtl.ts` validando 1.275 testes de direcionalidade, integridade de caracteres por alfabeto, ausência de bidi-override e fallback seguro. Integrado ao `npm test`.
- **2.4 Critérios**: 100% atendidos. Nenhum texto invertido, RTL funcionando estritamente nos 4 idiomas corretos, testes verdes.

### [x] BLOCO 3. EXTRATO DE MOEDAS E TRANSAÇÕES ATÔMICAS
- **3.1 Transação Atômica e Idempotente**: Implementada em `movimentarMoedas()` no `src/features/economia/services/extratoService.ts`. O cliente nunca escreve saldo diretamente. Validação contra saldo negativo. Teste de concorrência com 10 chamadas assíncronas simultâneas aprovado.
- **3.2 Extrato Completo**: `ExtratoMoedasView.tsx` exibe data/hora, tipo, valor colorido (+ verde, - vermelho), origem descritiva e saldo resultante. Filtros combinados por período (7 dias, 30 dias, tudo) e por tipo (todos, ganhos, gastos, cashback). Toque no saldo em qualquer tela abre a carteira/extrato via `TopBar.tsx` e `App.tsx`.
- **3.3 Migração de Saldo Legado**: `garantirSaldoInicialExtrato()` assegura lançamento de "Saldo anterior" com origem `historico` para usuários pré-existentes.
- **3.4 Reconciliação**: Criada `reconciliarSaldoExtrato()`, que recalcula a soma do extrato e corrige divergências com lançamento de ajuste contábil.
- **3.5 Validação Automatizada**: Criado `scripts/test-extrato-concorrencia.ts` com 28 assertions cobrindo concorrência, idempotência e reconciliação. Integrado ao `npm test`.

### [x] BLOCO 4. CENTRAL DE NOTIFICAÇÕES UNIFICADA
- **4.1 Unificação do Feed e Configurações**: Criada `CentralNotificacoesView.tsx` combinando em abas fluidas o Feed de Notificações (histórico completo de prazos, conquistas, equipe, pet, ofensiva e resumos) e a Central de Preferências Granulares. Descontinuado o modal legado `NotificationSettingsModal.tsx`.
- **4.2 Navegação Canônica**: O clique no ícone de sino da TopBar e o acesso via Perfil → Notificações direcionam confiavelmente para a mesma tela canônica (`setCanonicalTab("perfil"); setCanonicalSubView("notificacoes");`).
- **4.3 Persistência em Firestore e Local**: Implementado `src/services/notificationService.ts` com coleção em `users/{uid}/notificacoes/{id}` e fallback local instantâneo via LocalStorage. Atualizadas regras em `firestore.rules`.
- **4.4 Modo Não Perturbe e Preferências**: Controle de "Não Perturbe" (silenciar tudo), seleção de lead time dinâmico para prazos (24h e 1h antes), lembrete diário de ofensiva com seletor de horário, conquistas, equipe e pet. Desativação de categoria impede geração de novos avisos sem apagar histórico.
- **4.5 Notificações Nativas e Offline**: Integração com `@capacitor/local-notifications` para agendamento do lembrete diário de ofensiva localmente no dispositivo (ID 1001), funcionando mesmo quando o app estiver offline.
- **4.6 Contador em Tempo Real**: `AppShell` recebe `unreadNotificationsCount` e exibe o badge numérico no TopBar em tempo real.
- **4.7 Validação Automatizada**: Criado `scripts/test-notificacoes.ts` validando preferências, silenciamento, filtros de categoria, criação, marcação como lida e limpeza. Integrado ao `npm test`.

### [x] BLOCO 5. MATÉRIAS E AGENDA (E REMOÇÃO DE FUNDAMENTAÇÃO E CONCEITOS)
- **5.1 Gerenciamento Completo de Matérias**: Criado `src/components/courses/CourseManagerModal.tsx` permitindo criar novas matérias, renomear, reordenar, alterar cor (paleta com 10 cores) e ícone (15 presets), definir professor, sala/link das aulas, horário semanal, plano de ensino/ementa e anotações pessoais. Suporte a matérias sincronizadas com preservação do nome oficial e edição do nome de exibição. Controles de arquivamento e ocultação com filtros por aba ("Ativas", "Arquivadas", "Ocultas", "Todas").
- **5.2 Agenda e Calendário 12 Meses**: Criado `src/services/agendaService.ts` e atualizado `src/components/tabs/AgendaTab.tsx` com navegação nos 12 meses navegáveis por ano (com seletor rápido por pílulas). Implementadas 4 visões integradas: Mês (grade com 35/42 células), Semana (7 dias horizontais), Dia (cronograma de horários) e Lista (próximos 30 dias em ordem cronológica).
- **5.3 Integração Bidirecional com Tarefas e AVA**: Tarefas criadas no gerenciador de tarefas e atividades do AVA Moodle são exibidas como eventos na Agenda. A marcação de conclusão pelo checkbox na Agenda atualiza imediatamente a tarefa/entrega e vice-versa.
- **5.4 Feriados Brasileiros Oficiais e Locais**: Cálculo dinâmico de feriados nacionais do Brasil (fixos e móveis) e suporte para o estudante cadastrar feriados acadêmicos/locais.
- **5.5 Exportação e Importação RFC 5545 iCalendar (.ics)**: Exportação completa com formato iCalendar para Google Agenda, Apple Calendar e Outlook, e importador funcional com suporte a recorrência.
- **5.6 Remoção de 'Fundamentação e Conceitos'**: Termo removido dos geradores de módulos e aulas em `courseSync.ts` e `LessonModal.tsx`, substituído por "Introdução e Visão Geral da Matéria" e "Tópico Teórico". Registrado na Decisão 14 de `docs/DECISOES.md`.
- **5.7 Validação Automatizada**: Criado `scripts/test-agenda-materias.ts` com testes cobrindo feriados, matriz 12 meses, expansão de recorrência semanal, sincronização bidirecional e import/export .ics. Integrado ao `npm test`.

### [ ] BLOCO 5B. MÉTODOS DE ESTUDO EFICAZES
### [ ] BLOCO 6. EXCLUÍDOS
### [ ] BLOCO 7. ASSINATURAS E PLANOS
### [ ] BLOCO 8. CONEXÕES COM FUNÇÃO EXCLUSIVA
### [ ] BLOCO 9A. LUMINA SEM DEPENDÊNCIA DE MATÉRIA
### [ ] BLOCO 9B. PRECISÃO E CONFIABILIDADE DAS RESPOSTAS
### [ ] BLOCO 9. VELOCIDADE DA LUMINA E DICIONÁRIO
### [ ] BLOCO 10. DICIONÁRIO MULTILÍNGUE
### [ ] BLOCO 11. BIBLIOTECA COMPLETA
### [ ] BLOCO 12. SOBRE, SUPORTE, POLÍTICAS E TUTORIAL
### [ ] BLOCO 13. PROFISSIONALIZAÇÃO E ENTREGA FINAL

---

## Documentações Concluídas
- `docs/AUDITORIA-UX.md`
- `docs/DECISOES.md`
- `docs/NAVEGACAO.md`
- `docs/DESIGN-SYSTEM.md`
- `docs/QA-UX.md`
- `docs/FIDELIDADE.md`
- `docs/EXTRATO.md`
- `docs/QA-FIDELIDADE.md`
- `docs/FLAGS.md`
- `docs/REMOCAO-CHAMADAS.md`
- `docs/PROGRESSO.md`
- `docs/PENDENCIAS.md`


