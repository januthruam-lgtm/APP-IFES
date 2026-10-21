# Relatório de Auditoria Técnica e Arquitetural - Brain Studio (Fase 0)

## 1. Visão Geral e Stack Tecnológica
- **Front-end SPA**: React 19.0.1, TypeScript 5.8 (ES2022 / bundler), Vite 8.3.0.
- **Estilização**: Tailwind CSS v4.3.3 (`@import "tailwindcss";` global em `src/index.css`), suporte a temas CSS customizados via variáveis e acessibilidade (OpenDyslexic, alto contraste).
- **Gamificação e 3D**: Three.js 0.186.1, React Three Fiber 9.8.2 e React Three Drei 10.7.9 para renderização procedural de pets e cenários.
- **Backend / Proxy Seguro**: Express 4.21.2 rodando via `tsx` no dev e empacotado em `dist/server.cjs` no build. Chaves sensíveis de IA (Gemini API) e Web Push ficam restritas exclusivamente ao servidor (`server.ts`).
- **Banco de Dados & Auth**: Firebase Firestore NoSQL e Firebase Authentication (com regras de segurança estritas e isolamento por UID).
- **Mobilidade Híbrida**: Capacitor 8.5.3 com plugins Android oficiais (StatusBar, SplashScreen, Keyboard, App).

---

## 2. Achados de Auditoria Priorizados por Severidade

### [CRÍTICO]
1. **Regras de Segurança do Firestore e Storage (Acesso a Coleções Não Isoladas)**:
   - *Diagnóstico*: Documentos de usuário devem ficar obrigatoriamente restritos a `/users/{uid}/*` para garantir que um usuário autenticado não possa sobrescrever saldo de moedas, ofensiva ou plano de terceiros.
   - *Status Atual*: `firestore.rules` foi estruturado com `deny-by-default` e validação estrita de UID do proprietário para subcoleções (`/users/{uid}/luminaMemoria`, `/users/{uid}/pet`, `/users/{uid}/tasks`, etc.).
   - *Ação de Mitigação*: Manter testes automatizados no emulador e bloqueio absoluto de escrita de `plano` e `expiraEm` no front-end.

2. **Segurança de Chaves e Credenciais de IA**:
   - *Diagnóstico*: Nenhuma chave de API privada (Gemini, VAPID private) pode estar no cliente.
   - *Auditoria do Código*: Todas as chamadas para `@google/genai` estão restritas a endpoints `/api/*` em `server.ts`. O arquivo `.env.example` fornece modelos sem segredos e o `.gitignore` bloqueia `.env*`.

### [ALTO]
3. **Acoplamento Específico com IFES (Instituto Federal do Espírito Santo)**:
   - *Diagnóstico*: Múltiplos componentes possuem textos fixos citando "AVA IFES" e "Q-Acadêmico IFES".
   - *Impacto*: Dificulta a expansão do Brain Studio para outras instituições do Brasil e do mundo (Fase 7).
   - *Plano de Correção*: Na Fase 7, migrar referências institucionais para o modelo multi-instituição agnóstico (`/public/instituicoes/`), tornando o sistema configurável por instituição do aluno.

4. **Gerenciamento de Cotas e Upload de Arquivos**:
   - *Diagnóstico*: Quotas de geração de quiz por arquivo devem ser validadas no servidor com validação de magic bytes reais (PDF, DOCX, PNG, JPG, TXT) e contadores por plano.
   - *Status*: Implementada validação de magic bytes (`validateRealFileMimeType`) e controle de cotas mensal em `/api/quiz/generate-from-file` em `server.ts`.

### [MÉDIO]
5. **Arquivos Extensos com Responsabilidades Múltiplas**:
   - *Diagnóstico*: `server.ts` e `CourseWorkspaceView.tsx` ultrapassavam 1.500 linhas.
   - *Ação*: Criação de módulos específicos em `src/config/` (`features.ts`, `economia.config.ts`, `planos.config.ts`, `cidade.config.ts`, `cosmeticos.config.ts`) e `src/lib/` (`firestoreService.ts`, `speech.ts`) desacoplando lógica de apresentação e regras de negócio.

6. **Consistência de I18n e Síntese de Voz / Reconhecimento**:
   - *Diagnóstico*: Browsers modernos (Chrome, Safari, WebView Android) descartam códigos de 2 letras (ex: `en`, `es`) na Web Speech API e recaem no idioma nativo do SO.
   - *Solução Aplicada*: Módulo `normalizeSpeechLang()` normaliza todas as tags de idioma para BCP-47 com variantes regionais completas (`pt-BR`, `en-US`, `es-ES`, etc.).

### [BAIXO]
7. **Limpeza de Build e Logs em Produção**:
   - *Diagnóstico*: Scripts de build configurados para remover artefatos temporários (`clean`). Verificado que `console.log` de depuração foi substituído por tratamentos estruturados e `console.warn` em exceções esperadas.

---

## 3. Estrutura Modular Proposta e Adotada

```
/
├── src/
│   ├── config/              # Parâmetros centrais do jogo (zero números mágicos)
│   │   ├── features.js      # Feature flags centrais para ativação progressiva
│   │   ├── features.ts      # Tipagens TypeScript estritas de features
│   │   ├── economia.config.ts # Parâmetros do Baú, Ligas, Anti-inflação, Tetos de XP
│   │   ├── planos.config.ts # Array PLANOS, benefícios, limites e temAcesso()
│   │   ├── cidade.config.ts # 10 cidades, pesos de estágios, tetos e custos
│   │   ├── cosmeticos.config.ts # Catálogo oficial, raridades e oficina
│   │   └── index.ts         # Exportação unificada
│   ├── lib/                 # Utilitários globais e camada única de dados
│   │   ├── firestoreService.ts # Camada centralizada do Firestore
│   │   ├── speech.ts        # TTS e audiodescrição reativa
│   │   └── firebase.ts      # Inicialização segura do SDK Firebase
│   ├── components/
│   │   ├── common/          # Componentes reutilizáveis de estado
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorState.tsx
│   │   └── ...
│   └── locales/             # Arquivos i18n sincronizados (pt-BR, en, es)
└── docs/                    # Documentação técnica e planos de fase
```

---

## 4. Conclusão da Auditoria de Fundação
O projeto atende a todos os requisitos de compilação limpa (`npm run build`), validação de tipos estrita (`tsc --noEmit`), integridade de chaves i18n (`npm run check:i18n`) e testes unitários de streak (`npm test`).
