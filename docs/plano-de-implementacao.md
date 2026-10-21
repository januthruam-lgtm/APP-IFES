# Plano de Implementação - Brain Studio

## Visão Geral
Este documento estabelece o plano detalhado e a ordem de execução das melhorias solicitadas no aplicativo Brain Studio (React 19, TypeScript, Vite 8, Tailwind v4, Capacitor 8, Firebase e Express).

---

## Ordem de Trabalho

### Parte 1: Login Vazio e Instalação PWA/APK
1. **Login com campos vazios (`AuthModal.tsx`, `initialData.ts`)**:
   - Remover valores iniciais fixos, e-mails de exemplo e placeholders com padrão de e-mail.
   - Limpar cache de último e-mail em montagem, logout e troca de conta.
   - `autoComplete="off"` no e-mail e `autoComplete="new-password"` na senha.
   - Checkbox "Lembrar de mim" inicia desmarcado.
   - Criar `docs/login.md`.
2. **Instalação (`src/utils/pwaInstall.ts`, `NativeAppButton.tsx`, `NativeAppModal.tsx`)**:
   - Função utilitária `isInstalledApp()` cobrindo Capacitor nativo, display-mode (standalone, fullscreen, minimal-ui), `navigator.standalone`, `document.referrer` android-app, flag de `appinstalled` e `navigator.getInstalledRelatedApps`.
   - Se instalado: ocultar permanentemente botão, banner e tutorial de instalação.
   - No APK Capacitor: elementos nunca aparecem.

### Parte 2: Configurações, Temas e Paleta Personalizada
1. **Aba Configurações própria (`SettingsModal.tsx` e tela dedicada)**:
   - Seções: Conta, Aparência, Idioma e acessibilidade, AVA IFES (único lugar do link do AVA), Matérias excluídas, Notificações, Privacidade e dados, Assinatura (com flag) e Sobre.
2. **Remoção de temas fora de Configurações**:
   - Remover aba "Menu de Cores / theme" da Sidebar, Header, Dashboard e tutorial.
   - O painel de temas existe EXCLUSIVAMENTE em Configurações > Aparência.
3. **Montador de Paleta Avançado (`src/components/settings/AppearanceSection.tsx`)**:
   - 5 cores-base: fundo, superfície, texto, destaque primário, destaque secundário (picker, hex e HSL).
   - Derivação automática exata de hover, bordas, texto secundário, sucesso, erro, aviso.
   - 8 presets prontos (Índigo, Oceano, Floresta, Pôr do Sol, Rosa, Grafite, Alto Contraste, Seguro para Daltonismo).
   - Combinações sugeridas (complementar, análoga, tríade).
   - Pré-visualização com componentes reais.
   - Salvar até 10 paletas com nome (aplicar, renomear, duplicar, excluir, importar/exportar JSON).
   - Cálculo e validação de contraste WCAG AA com botão "Corrigir automaticamente".
   - Persistência local e Firestore por usuário, sincronizando meta theme-color e status bar nativa.
   - Criar `docs/temas.md`.

### Parte 3: Matérias (Semanas/Dias Contraíveis e Exclusão Lógica)
1. **Agrupamento por Semana e Dia (`src/utils/courseGrouping.ts`, `CourseWorkspaceView.tsx`)**:
   - Função pura `groupByCourseWeek(items, courseStart, timezone)`.
   - Semana 1 = semana da data de início (Moodle startdate ou primeira atividade), iniciando na segunda-feira em `America/Sao_Paulo`.
   - Subdivisão em dias ("seg., 14 de out."), itens "Sem data" e "Antes do início".
   - Semana atual aberta por padrão; botões de expandir/recolher tudo.
   - Acessibilidade: buttons com aria-expanded e aria-controls, 48px touch target.
2. **Exclusão Lógica de Matérias (`src/hooks/useSubjects.ts`, `docs/materias-excluidas.md`)**:
   - Campo `deletedAt`. Ocultação instantânea de Dashboard, trilhas, biblioteca, flashcards, Lumina, equipes e notificações.
   - Seção "Matérias excluídas" SOMENTE em Configurações > Matérias excluídas com botões "Restaurar" e "Excluir definitivamente".
   - Sincronização Moodle preserva marca de exclusão (id externo bloqueado).

### Parte 4: Pets e Cenários de Fundo
1. **Diagnóstico e Correção dos Pets 3D (`docs/pet-3d-diagnostico.md`)**:
   - Limite de no máximo 2 contextos WebGL vivos simultaneamente.
   - Renderização estática / 2D em cards secundários e grades; 3D no pet em destaque.
   - ErrorBoundary com fallback em emoji e botão de retry; tratamento de `webglcontextlost` e `webglcontextrestored`.
2. **Cenários de Fundo na Loja (`src/components/tabs/StoreTab.tsx`, `src/components/pet3d/PetEnvironment.tsx`)**:
   - Dois escopos: "Fundo do app" e "Fundo da área dos pets".
   - 8 cenários SVG/CSS gradientes leves (Praia de Guarapari, Floresta, Espaço, Biblioteca, Cidade à noite, Montanha, Campo ao amanhecer, Fundo do mar).
   - Controle de intensidade e escurecimento preservando contraste WCAG AA.
   - Compra com moedas validada e persistência em Firestore/local.

### Parte 5: Gerador de Questões a Partir de Arquivos
1. **Upload Robusto (`PdfGameGeneratorTab.tsx`, `server.ts`)**:
   - Envio de até 5 arquivos, 15MB cada (PDF, TXT, MD, DOCX, PNG, JPG).
   - Suporte a drag-and-drop e input compatível com WebView Android.
2. **Extração e Processamento Server-side (`server.ts`)**:
   - Leitura de DOCX, TXT, MD e envio de PDF/imagens ao Gemini.
3. **Formatos Variados de Questões**:
   - Múltipla escolha única, múltipla escolha ("marque todas"), verdadeiro/falso com justificativa, lacunas, associação de colunas, ordenação, resposta curta com correção socrática, assertivas I, II, III.
4. **Distribuição Equilibrada das Respostas Corretas**:
   - Resposta armazenada por ID da alternativa.
   - Embaralhamento criptográfico garantindo que nenhuma letra ultrapasse 35% e no máximo 2 consecutivas.

### Parte 6: Catálogo Completo de Idiomas (180+ ISO 639-1, Tradução Integral e RTL)
1. **Diagnóstico da Limitação (`docs/i18n-auditoria.md`)**:
   - Mapeamento e remoção de restrições a 3 idiomas em código, whitelist e Firestore.
2. **Catálogo `src/i18n/languages.ts`**:
   - Todos os 180+ idiomas ISO 639-1, variantes regionais, suporte a RTL (árabe, hebraico, urdu, persa, etc.), scripts e vozes.
   - Campo "Outro idioma" validado com `Intl.getCanonicalLocales`.
3. **Serviço de Tradução Server-side e Fallback**:
   - `GET /api/i18n/:lang` gerando dicionário sob demanda com cache compartilhado.
   - `POST /api/translate` para tradução de conteúdo dinâmico (disciplinas, tópicos, flashcards).
   - Suporte completo a RTL (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`, inversão de setas, `dir="rtl"`).
   - Atualização de `scripts/check-i18n.ts` e documentação `docs/idiomas.md`.

### Parte 7: Garantia de Funcionamento
1. Adicionar `vitest` e script `test` em `package.json`.
2. Testes unitários para `groupByCourseWeek`, exclusão de matérias, distribuição de letras, `isInstalledApp`, contraste de paleta e integridade de i18n.
3. Validação dos 10 critérios de aceitação.
4. `docs/testes-manuais.md`.

### Parte 8: Relatório de Entrega
- Diagnósticos, arquivos modificados, status dos critérios de aceitação, passos de teste, manual de permissões Android e notas de revisão.
