# Matriz de Testes de Qualidade (QA) • Multi-Instituição

## 1. Casos de Teste Automatizados (`scripts/test-multi-instituicao.ts`)

| ID | Cenário de Teste | Resultado Esperado | Status |
| :--- | :--- | :--- | :--- |
| **TC-01** | Formatação de Notas 0 a 10 | "8,5" com vírgula padrão brasileira | APROVADO |
| **TC-02** | Formatação de Notas 0 a 100 | "75 pts" com sufixo oficial | APROVADO |
| **TC-03** | Formatação de Notas 0 a 20 | "14,0 val" para Portugal/França | APROVADO |
| **TC-04** | Formatação Letras A-F | Preserva letra maiúscula (ex: "A", "B+") | APROVADO |
| **TC-05** | Cálculo de Aprovação 0 a 10 | >= 6.0 aprovado, < 6.0 reprovado | APROVADO |
| **TC-06** | Cálculo de Aprovação 0 a 100 | >= 60 aprovado (IFES), < 60 reprovado | APROVADO |
| **TC-07** | Mapeamento de Níveis por País | BR traz Técnico Integrado; PT traz Ciclos e Licenciatura; US traz Bachelor | APROVADO |
| **TC-08** | Nomes de Países via Intl | Nomes gerados dinamicamente via `Intl.DisplayNames` | APROVADO |
| **TC-09** | Normalização Unicode | Acentos e cedilha removidos sem corromper caracteres | APROVADO |
| **TC-10** | SSRF: Bloqueio Localhost | `localhost` e `127.0.0.1` rejeitados com erro | APROVADO |
| **TC-11** | SSRF: Bloqueio Cloud Metadata | `169.254.169.254` e `metadata.google.internal` bloqueados | APROVADO |
| **TC-12** | SSRF: Bloqueio Redes RFC1918 | Faixas `10.x.x.x`, `172.16.x.x` e `192.168.x.x` bloqueadas | APROVADO |
| **TC-13** | Segurança de Tokens | Exceção gerada se objeto do Firestore contiver campo `token` ou `senha` | APROVADO |
| **TC-14** | Migração IFES em 1 Toque | Gera perfil canônico estável sem perda de matérias existentes | APROVADO |

## 2. Testes de Desempenho e SLA
- **Tempo de resposta da busca fuzzy local**: < 20 ms para bases com centenas de instituições.
- **Cache ROR do Servidor**: 24 horas de retenção em memória para evitar chamadas redundantes a APIs externas.
- **Rate Limit**: 30 requisições por minuto por IP com retorno HTTP 429 para prevenir abusos.
