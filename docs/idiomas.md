# Sistema de Internacionalização (i18n) - Brain Studio

O Brain Studio possui arquitetura completa de suporte a múltiplos idiomas utilizando `i18next`, `react-i18next` e detecção automática via `i18next-browser-languagedetector`.

## Idiomas Suportados
- **pt-BR** (Português do Brasil - Padrão / Fallback)
- **en** (English - US)
- **es** (Español)

> **Nota de Revisão Linguística:** As traduções para inglês e espanhol foram estruturadas de forma natural para estudantes, mas devem passar por revisão e validação por um falante nativo antes de qualquer submissão de release à Google Play Store global.

## Estrutura de Arquivos
- Configuração central: `src/i18n.ts`
- Dicionários JSON: `src/locales/pt-BR.json`, `src/locales/en.json`, `src/locales/es.json`
- Seletor de Idioma: `src/components/LanguageSelector.tsx` (presente em Configurações e Tutorial Inicial)
- Script de Validação de Paridade: `scripts/check-i18n.ts`

## Como Adicionar um Novo Idioma (ex.: Francês - `fr`)
1. Crie o arquivo `src/locales/fr.json` duplicando as chaves de `src/locales/pt-BR.json`.
2. Em `src/i18n.ts`:
   - Importe `import fr from "./locales/fr.json";`
   - Adicione à lista `SUPPORTED_LANGUAGES`: `{ code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" }`
   - Adicione ao objeto `resources`: `fr: { translation: fr }`
3. Execute o script de validação de paridade de chaves:
   ```bash
   npx tsx scripts/check-i18n.ts
   ```
4. Verifique a renderização na interface e o comportamento do leitor de tela (atributo `lang="fr"` na tag `<html>`).

## Regras de Negócio e Conteúdo Original do IFES
Conforme diretriz pedagógica:
- Disciplinas, ementas, nomes de professores e conteúdos acadêmicos importados diretamente do AVA Moodle IFES são preservados no idioma original em que foram cadastrados pela instituição.
- Avisos contextuais informam ao estudante sobre a preservação dos dados originais quando o app estiver configurado em inglês ou espanhol.
