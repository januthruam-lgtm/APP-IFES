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

### [ ] BLOCO 2. IDIOMAS: TEXTO INVERTIDO (Em andamento)
### [ ] BLOCO 3. EXTRATO DE MOEDAS E TRANSAÇÕES ATÔMICAS
### [ ] BLOCO 4. CENTRAL DE NOTIFICAÇÕES UNIFICADA
### [ ] BLOCO 5. MATÉRIAS E AGENDA
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


