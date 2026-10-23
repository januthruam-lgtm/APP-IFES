# Guia de Migração Suave e Não Destrutiva • Alunos IFES

## 1. Objetivo
Garantir que a transição de um app estritamente voltado ao IFES para um produto educacional global ocorra de forma transparente, sem perda de dados históricos, moedas, XP, mascote, notas ou progresso de trilhas.

## 2. Experiência do Aluno do IFES Existente
1. Ao atualizar o aplicativo e abrir a tela inicial, o sistema detecta os registros prévios do IFES (`user.ifesAccount`, matrícula ou campus).
2. O aplicativo exibe no topo do Dashboard o componente **`CardConfirmacaoIfes`**:
   - Mensagem: *"Detectamos que você estuda no Instituto Federal do Espírito Santo (IFES). Confirme com 1 toque para manter suas notas, matérias e tarefas perfeitamente sincronizadas."*
   - Botões: `Confirmar IFES` e `Trocar instituição`.
3. Ao tocar em `Confirmar IFES`:
   - Um registro canônico é atribuído: `id: "br-ifes-cefor"`, `sigla: "IFES"`, `sistemaNotaId: "0_a_100"` (média 60).
   - O aviso é dispensado permanentemente.
   - Nenhuma matéria ou histórico é sobrescrito ou apagado.

## 3. Gestão em Configurações
O estudante pode, a qualquer momento, acessar **Configurações > Instituição & Conexões**:
- Visualizar o nome da instituição e curso atual.
- Editar o nome do curso/série.
- Trocar de instituição de ensino.
- Remover a instituição com aviso garantindo que o progresso de estudos, moedas e pets permanecem intocados.
