# Relatório de Cobertura de Idiomas (Brain Studio - Fase 1)

Data de verificação: 2026-10-22T11:46:16.550Z
Idiomas compilados localmente e disponíveis offline: 6

| Código | Arquivo | Status | Tipo |
|---|---|---|---|
| `en-GB` | `en-GB.json` | ✅ Pronto | Completo / Revisado |
| `en` | `en.json` | ✅ Pronto | Completo / Revisado |
| `es` | `es.json` | ✅ Pronto | Completo / Revisado |
| `fr` | `fr.json` | ✅ Pronto | Completo / Revisado |
| `pt-BR` | `pt-BR.json` | ✅ Pronto | Completo / Revisado |
| `pt-PT` | `pt-PT.json` | ✅ Pronto | Completo / Revisado |

### Garantia de Estabilidade (Zero Erro 429)
- O aplicativo web e mobile **nunca** dispara chamadas dinâmicas de tradução para a API do Gemini durante a navegação do estudante.
- Qualquer chave ausente recai com segurança no **Inglês (`en.json`)**, preservando a usabilidade sem misturar textos truncados em português.