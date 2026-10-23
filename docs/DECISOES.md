# Brain Studio - Registro de Decisões de Arquitetura e Engenharia (docs/DECISOES.md)

Este documento registra todas as decisões técnicas tomadas durante a execução autônoma, fundamentadas em simplicidade, estabilidade, ausência de custos inesperados de servidor e conformidade com o ECA Digital e LGPD.

---

## 1. Decisões da Fase 0 (Fundação)
- **Centralização de Parâmetros**: Todos os parâmetros e tabelas de jogo foram isolados em `src/config/` (`features.ts`, `economia.config.ts`, `planos.config.ts`, `cidade.config.ts`, `cosmeticos.config.ts`), garantindo zero números mágicos no código.
- **Tipagem Estrita sem Importação Circular**: Definidas as tipagens de Feature Flags em `features.ts` diretamente com TypeScript `Record<FeatureKey, boolean>`, eliminando qualquer dependência circular no empacotador Vite.

## 2. Decisões da Fase 1 (Idiomas)
- **Eliminação de Dependência de Tradução em Tempo Real no Servidor**: O erro 429 de quota do Gemini no bundle de tradução ocorria porque requisições de tradução dinâmica eram feitas ao servidor em tempo de execução. A arquitetura foi convertida para **100% estática e offline-first**: os arquivos de tradução ficam no cliente (`src/locales/`), com fallback garantido para Inglês (`en.json`) sem nunca exibir código ou lançar erro 429.
- **Script Node para Tradução Pré-compilada**: Script `scripts/gerar-traducoes.mjs` preparado para execução local via CLI com proteção de marcadores e marcas protegidas.

## 3. Decisões da Fase 2 e 3 (Temas, Matérias Excluídas e Menu Lateral)
- **Centralização de Controles no Sidebar**: Em conformidade com a solicitação direta do usuário, os componentes de medição e recarga de energia (`Zap`), alternador de tema claro/escuro (`Sun`/`Moon`), atalho de ajustes/configurações (`Settings`), seletor de idioma, notificações, acessibilidade, status de conexão AVA e contagem de usuários online foram todos transferidos do cabeçalho principal (`Header.tsx`) exclusivamente para a barra lateral (`Sidebar.tsx`).
- **Cabeçalho Principal Limpo & Focado**: O cabeçalho foi simplificado para exibir apenas o título da aba ativa, sua categoria acadêmica e o acionador do menu lateral em telas móveis, proporcionando uma experiência de leitura e foco limpa e sem distrações.
- **Drawer Unificado no Mobile**: A visualização em dispositivos móveis abre a barra lateral completa como gaveta lateral sobreposta, mantendo total paridade funcional entre desktop e celular.

## 4. Decisões da Fase 7 (Multi-Instituição e Conexões Globais)
- **Zero Gravação da Base Global no Firestore**: Para manter custos de nuvem estritamente zero para o usuário e permitir funcionamento offline, a base de instituições é distribuída em arquivos estáticos compactos em `public/instituicoes/{PAIS}.json`, indexados pelo Service Worker e pesquisáveis via fuzzy search local em menos de 20 ms.
- **Tokens Estritamente no Dispositivo**: Senhas de portais nunca são coletadas. Tokens de Moodle e Canvas são criptografados com AES-GCM-256 no IndexedDB do dispositivo do usuário através da WebCrypto API. O método `validarSegurancaPayloadFirestore` e regras no `firestore.rules` rejeitam formalmente qualquer documento contendo `token` ou `senha`.
- **Prevenção de SSRF**: O validador `validarUrlSegura` restringe URLs institucionais estritamente ao protocolo HTTPS, bloqueando esquemas maliciosos (`javascript:`, `data:`), endereços de loopback (`localhost`, `127.0.0.1`), instâncias de metadados de nuvem (`169.254.169.254`) e blocos de rede privada RFC1918.
- **Intl.DisplayNames Dinâmico**: Países são exibidos dinamicamente de acordo com o idioma corrente do aplicativo, evitando listas manuais estáticas.
- **Migração Não Destrutiva do IFES**: Usuários com histórico no IFES recebem um cartão no topo do Dashboard com opção de confirmação em 1 toque, garantindo que matérias, notas, XP, mascote e moedas continuem 100% preservados.

