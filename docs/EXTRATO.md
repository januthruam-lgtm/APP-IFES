# Livro-Razão Contábil & Extrato de Moedas • Brain Studio

O livro-razão contábil do Brain Studio garante total transparência financeira educacional, prevenindo manipulações indevidas e mantendo o saldo de moedas matematicamente comprovável.

---

## 1. Arquitetura de Dados

- **Coleção Firestore**: `users/{uid}/extrato/{id}`
- **Natureza Contábil**: **Append-only** (estritamente inclusão). Não é permitida a alteração (`update`) nem exclusão (`delete`) de nenhum lançamento existente.
- **Transação Atômica**: Toda e qualquer alteração de saldo passa obrigatoriamente pela função `movimentarMoedas()` em `src/features/economia/services/extratoService.ts`.

---

## 2. Estrutura do Lançamento Contábil (`LancamentoExtrato`)

```typescript
export interface LancamentoExtrato {
  id: string;               // Identificador único (Firestore ID)
  tipo: "ganho" | "gasto" | "cashback" | "ajuste";
  origem: OrigemLancamento; // "bau" | "missao" | "ofensiva" | "liga" | "cidade" | "loja" | "fidelidade"
  valor: number;            // Quantidade de moedas movimentadas (inteiro positivo)
  saldoApos: number;        // Saldo consolidado após a aplicação do delta
  descricao?: string;       // Descrição amigável para o estudante
  refId?: string;           // ID do objeto referenciado (ex: ID da obra, ID do item da loja)
  idempotencyKey: string;   // Chave para evitar duplicidade em requisições repetidas
  criadoEm: string;         // Data e hora ISO 8601
}
```

---

## 3. Regra de Eliminação de Exploit em Tarefas

- **Causa Raiz Anterior**: Marcar e desmarcar tarefas consecutivamente creditava 5 moedas e 20 XP repetidamente sem travas idempotentes.
- **Correção Definitiva**:
  1. Moedas e XP foram completamente desvinculados da conclusão de tarefas (`tarefas.recompensa = false` em `economia.config.ts`).
  2. As regras de segurança em `firestore.rules` proíbem explicitamente criações no extrato com origem de tarefas:
     ```
     request.resource.data.origem != 'tarefa'
     ```
  3. As tarefas agora cumprem sua missão pedagógica pura: organização e produtividade acadêmica do estudante.

---

## 4. Auditoria Matemática do Livro-Razão

A função `auditarExtrato(uid, saldoAtual)` percorre todos os lançamentos em ordem cronológica a partir do saldo inicial e valida a equação contábil:

$$\text{Saldo Inicial} + \sum \text{Ganhos} - \sum \text{Gastos} + \sum \text{Cashback} = \text{Saldo Atual}$$

Se qualquer discrepância for identificada, o sistema acusa a inconsistência com relatório detalhado.
