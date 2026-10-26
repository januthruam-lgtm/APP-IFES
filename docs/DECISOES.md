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
