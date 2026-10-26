# Programa de Fidelidade Acadêmica • Brain Studio

O Programa de Fidelidade Acadêmica do Brain Studio recompensa a regularidade, dedicação e aquisição de materiais educacionais pelos estudantes, incentivando hábitos consistentes sem práticas predatórias.

---

## 1. Parâmetros Centrais

- **Fuso Horário Oficial**: `America/Sao_Paulo` (Semana civil: Segunda-feira 00:00:00 a Domingo 23:59:59).
- **Janela de Nível**: Móvel, calculada sobre os gastos elegíveis dos **últimos 30 dias**.
- **Arquivo de Configuração**: `src/config/fidelidade.config.js`.

---

## 2. Níveis de Cliente (Janela Móvel de 30 Dias)

| Nível | Gasto Elegível Mínimo (30 dias) | % Retorno no Cofre (Cashback) | Benefícios Adicionais |
| :--- | :--- | :--- | :--- |
| **Bronze** | 0 moedas | 1% | Acesso ao Cofre e Loja de Selos |
| **Prata** | 800 moedas | 2% | Vale-desconto semanal de 5% |
| **Ouro** | 2.000 moedas | 3% | Vale-desconto semanal de 5% + Insígnia Dourada |
| **Safira** | 4.000 moedas | 4% | Vale-desconto semanal de 10% + Moldura Safira |
| **Diamante** | 7.000 moedas | 5% | Vale-desconto semanal de 10% + Itens Ultra Raros |

---

## 3. Cofre de Retorno de Moedas

1. **Capacidade Máxima**: 500 moedas acumuladas. Moedas que excederem a capacidade são descartadas para evitar inflação artificial.
2. **Teto de Resgate Semanal**: Máximo de 250 moedas resgatadas por semana civil.
3. **Frequência de Resgate**: No máximo 1 resgate por semana civil (reseta toda segunda-feira).
4. **Condição Ativa**: O estudante deve ter concluído pelo menos **1 missão diária de estudo** no dia em que solicitar o resgate do cofre.

---

## 4. Selos de Fidelidade e Catálogo Exclusivo

- **Regra de Concessão**: 1 selo a cada **100 moedas** de gasto elegível acumulado.
- Os selos são independentes do nível e nunca expiram.
- Itens exclusivos resgatáveis com selos:
  - Título *"Cliente Fiel"* (10 selos)
  - Moldura *"Folhas Calmas"* (25 selos)
  - Laço *"Estrela de Fidelidade"* (40 selos)
  - Fundo *"Biblioteca Dourada"* (80 selos)
  - Moldura *"Constelação"* (100 selos)
  - Título *"Mestre Colecionador"* (150 selos)
  - Capa *"Manto Estrelado"* (200 selos)
  - Pelagem *"Brilho de Prata"* (300 selos)

---

## 5. Vales-Desconto Semanais

- Disponíveis para níveis **Prata**, **Ouro**, **Safira** e **Diamante**.
- Compra mínima: 300 moedas.
- Desconto máximo: 150 moedas por transação.
- **Teto Combinado**: O desconto combinado (Desconto de Vila/Cidade + Vale de Fidelidade) nunca ultrapassa **20%** do valor original do item.

---

## 6. Metas Semanais de Atividade

Gasto na semana civil contabilizado em tempo real:
- **500 moedas gastas**: +20 moedas injetadas no Cofre.
- **1.500 moedas gastas**: +50 moedas injetadas no Cofre.
- **3.000 moedas gastas**: +100 moedas injetadas no Cofre.

---

## 7. Semanas Temáticas

Semanas promocionais temáticas rotativas concedem **+5% adicional** de retorno no cofre para a categoria da semana (ex: Semana da Construção em *obras_cidade*, Semana do Mascote em *loja_pets*).
