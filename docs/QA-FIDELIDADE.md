# Casos de Teste e Aceite • Fidelidade & Extrato de Moedas

Cenários de validação manual e automatizada para garantir integridade contábil e as regras de fidelidade.

---

## Cenário 1: Zero Recompensa e Anti-Farming em Tarefas
- **Ação**: Criar uma tarefa e marcar/desmarcar a caixa de seleção 10 vezes consecutivas.
- **Resultado Esperado**: O saldo de moedas permanece exatamente o mesmo; nenhum XP é concedido; nenhum lançamento é gerado no extrato.
- **Status**: Aprovado.

---

## Cenário 2: Cálculo dos Níveis por Janela Móvel (30 Dias)
- **Ação**: Simular gasto elegível de 0, 800, 2.000, 4.000 e 7.000 moedas.
- **Resultado Esperado**:
  - 0 moedas -> Nível Bronze (1% de retorno)
  - 800 moedas -> Nível Prata (2% de retorno)
  - 2.000 moedas -> Nível Ouro (3% de retorno)
  - 4.000 moedas -> Nível Safira (4% de retorno)
  - 7.000 moedas -> Nível Diamante (5% de retorno)
- **Status**: Aprovado.

---

## Cenário 3: Resgate do Cofre com Restrições Semanais
- **Ação**:
  1. Tentar resgatar sem ter concluído missão diária hoje -> O sistema bloqueia informando a necessidade de concluir 1 missão diária.
  2. Concluir 1 missão diária e solicitar resgate com saldo de 300 moedas no cofre -> O sistema resgata exatamente 250 moedas (teto semanal de 250 moedas), restando 50 moedas no cofre.
  3. Tentar efetuar um segundo resgate na mesma semana civil -> O sistema bloqueia informando que a cota da semana foi esgotada (máximo 1 resgate por semana).
- **Status**: Aprovado.

---

## Cenário 4: Geração e Acúmulo de Selos de Fidelidade
- **Ação**: Realizar gastos elegíveis de 250 moedas em obras da cidade.
- **Resultado Esperado**: Concessão de 2 selos de colecionador (1 selo a cada 100 moedas). As 50 moedas residuais permanecem acumuladas para o próximo selo.
- **Status**: Aprovado.

---

## Cenário 5: Teto Combinado de Descontos (20% e 150 moedas)
- **Ação**: Aplicar vale-desconto semanal de 10% cumulativo com desconto de vila de 15% em uma compra de 1.000 moedas.
- **Resultado Esperado**: A soma bruta seria 25%, mas o teto combinado trava em 20% (desconto máximo de 150 moedas). Valor final: 850 moedas.
- **Status**: Aprovado.

---

## Cenário 6: Auditoria Matemática do Livro-Razão
- **Ação**: Clicar em "Auditar Contas" no Extrato de Moedas.
- **Resultado Esperado**: O sistema processa o histórico de créditos e débitos e confirma: *"Seu livro-razão está 100% equilibrado e verificado!"*.
- **Status**: Aprovado.
