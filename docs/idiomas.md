# Sistema de Internacionalização e Localização (i18n) - Brain Studio (Fase 1)

## 1. Diagnóstico da Causa Raiz do Erro de Tradução (Erro 429)

### Diagnóstico Técnico
Anteriormente, o seletor de idioma tentava invocar o endpoint `POST /api/i18n/translate-bundle` em `server.ts` sempre que um idioma não-padrão era ativado. Este endpoint enviava o arquivo JSON inteiro com centenas de chaves para a API Gemini (`gemini-3.8-flash`).
No plano gratuito ou em contas com limites de taxa, isso esgotava imediatamente o limite diário de requisições (`RESOURCE_EXHAUSTED` / HTTP 429), travando o cliente e impedindo a tradução.

### Solução Arquitetural Definitiva (Sem Servidor / Offline-first)
1. **Pacotes Estáticos no Cliente**: Todos os idiomas principais (`pt-BR`, `pt-PT`, `en`, `en-GB`, `es`, `fr`) estão pré-compilados e são empacotados diretamente no bundle do Vite (`src/locales/`).
2. **Fallback Garantido em Inglês (`fallbackLng: "en"`)**:
   - Conforme especificação inegociável da Fase 1, se um idioma secundário ou chave específica faltar, o sistema recai obrigatoriamente no **Inglês** (nunca em português misturado).
3. **Indicação no Seletor**: O componente `LanguageSelector.tsx` identifica visualmente cada idioma como **"Completo"** (revisado e integrado) ou **"Tradução Automática"**.
4. **Zero Chamadas de IA em Tempo de Execução para UI**: Nenhuma requisição à API do Gemini é realizada durante a navegação normal no aplicativo para tradução de telas, garantindo estabilidade 100% offline e custo zero de tradução no servidor.

---

## 2. Idiomas Nativos Integrados

| Código | Idioma | Status | Direção |
|---|---|---|---|
| `pt-BR` | Português (Brasil) | ✅ Completo (Matriz) | LTR |
| `pt-PT` | Português (Portugal) | ✅ Completo (Variante Regional) | LTR |
| `en` | English (US) | ✅ Completo | LTR |
| `en-GB` | English (UK) | ✅ Completo (Variante Regional) | LTR |
| `es` | Español | ✅ Completo | LTR |
| `fr` | Français | ✅ Completo | LTR |
| `ar` | العربية (Árabe) | 🤖 Tradução Automática | **RTL** |
| `he` | עברית (Hebraico) | 🤖 Tradução Automática | **RTL** |
| `fa` | فارسی (Persa) | 🤖 Tradução Automática | **RTL** |
| `ur` | اردو (Urdu) | 🤖 Tradução Automática | **RTL** |
| `ja`, `zh`, `ko`, `de`, `it`, `ru`... | 110+ outros idiomas | 🤖 Tradução Automática | LTR |

---

## 3. Suporte a RTL (Right-to-Left) e Tipografia Internacional

- Atributo dinâmico: a função `updateDocumentLanguage(langCode)` define automaticamente `document.documentElement.dir = "rtl"` para idiomas como Árabe, Hebraico, Persa e Urdu, e `"ltr"` para os demais.
- Tag meta: Inclusão de `<meta name="google" content="notranslate" />` no `index.html` para prevenir sobreposições indesejadas do Google Translate automático nos navegadores.

---

## 4. Script de Tradução Pré-Compilada em Lotes

Para compilar novos idiomas offline no computador do desenvolvedor com chave própria:
```bash
node scripts/gerar-traducoes.mjs
```
O script lê `src/locales/pt-BR.json`, protege marcas ("Brain Studio", "Lumina", "Moodle", "Anki", etc.) e placeholders (`{{count}}`, `{nome}`, tags), grava checkpoints e gera o relatório `docs/COBERTURA_IDIOMAS.md`.

Para verificar a paridade de 100% das chaves:
```bash
npm run check:i18n
```
