# Design System Brain Studio (docs/DESIGN-SYSTEM.md)

Este documento define os tokens visuais, convenções tipográficas, regras de contraste e catálogo de componentes primitivos em `src/components/ui/`.

---

## 1. Tokens Fundamentais

### Temas Oficiais (Estritamente 2 Temas)
- **Tema Claro (Creme & Laranja)**:
  - Fundo principal (`--app-bg`): `#FDFBF7` (Creme aconchegante para leitura prolongada).
  - Fundo de cartões (`--app-card`): `#FFFFFF` (Branco puro com borda sutil).
  - Borda (`--app-border`): `#E9E3D8` (Bege suave neutro).
  - Texto principal (`--app-text`): `#1E1B18` (Cinza escuro orgânico, contraste ≥ 12:1).
  - Texto secundário (`--app-text-muted`): `#6A6359` (Cinza médio neutro, contraste ≥ 4.8:1).
  - Primária / Acento (`--app-primary`): `#E85D04` (Laranja queimado vibrante).
  - Secundária (`--app-accent`): `#D97706` (Âmbar acadêmico).
  - Sucesso (`--app-success`): `#10B981` (Esmeralda).
- **Tema Escuro (Slate Profundo & Laranja Néon)**:
  - Fundo principal (`--app-bg`): `#0F172A` (Slate escuro).
  - Fundo de cartões (`--app-card`): `#1E293B` (Slate médio).
  - Borda (`--app-border`): `#334155` (Slate suave).
  - Texto principal (`--app-text`): `#F8FAFC` (Branco gelo, contraste ≥ 13:1).
  - Texto secundário (`--app-text-muted`): `#94A3B8` (Cinza slate claro, contraste ≥ 5:1).
  - Primária (`--app-primary`): `#F97316` (Laranja elétrico).
  - Sucesso (`--app-success`): `#34D399` (Esmeralda néon).

### Espaçamento Padronizado
- `4px` (`p-1` / `gap-1`): Espaçamento micrométrico interno.
- `8px` (`p-2` / `gap-2`): Espaçamento compacto de chips e listas.
- `12px` (`p-3` / `gap-3`): Espaçamento padrão de controles e cartões pequenos.
- `16px` (`p-4` / `gap-4`): Padding mínimo externo de cartões e telas.
- `24px` (`p-6` / `gap-6`): Separação de seções principais.
- `32px` (`p-8` / `gap-8`): Margem de respiro de containers amplos no desktop.

### Raios de Borda (Border Radius)
- `12px` (`rounded-xl`): Botões, inputs, chips e itens de lista.
- `20px` (`rounded-2xl`): Cartões de conteúdo, diálogos e painéis.
- `9999px` (`rounded-full`): Avatares e botões circulares de ação rápida.

### Tipografia e Escala
- **Corpo Regular**: `16px`, altura de linha `1.5` (`leading-relaxed`), peso `400` ou `500`.
- **Subtítulos / Destaques**: `20px`, altura de linha `1.4`, peso `700`.
- **Títulos de Seção**: `24px`, altura de linha `1.3`, peso `800`.
- **Títulos Hero**: `28px` a `32px`, altura de linha `1.2`, peso `900`.
- **Fonte do Sistema**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`.

---

## 2. Catálogo de Componentes de Interface (`src/components/ui/`)

1. **`AppShell`**: Estrutura geral da aplicação com roteador responsivo (TabBar inferior em telas menores que 768px, NavigationRail em telas médias, Sidebar em telas grandes).
2. **`TopBar`**: Cabeçalho enxuto e unificado contendo botão voltar contextual, título da tela, atalhos de energia e moedas (leva à Carteira), notificações e botão de busca global.
3. **`TabBar`**: Barra de navegação inferior com as 5 abas canônicas (Início, Estudar, Lumina, Jogo, Perfil) com rótulos acessíveis, alvo de toque ≥ 44x44px e espelhamento RTL.
4. **`Card`**: Container de superfície padrão com elevação sutil, borda adaptativa e padding de 16px ou 24px.
5. **`ListItem`**: Linha de lista interativa com ícone/avatar, título, subtítulo e ação final.
6. **`Button`**: Botão primário (laranja), secundário (outline), de texto ou destrutivo (vermelho), com alvo de toque ≥ 44px e foco visível.
7. **`Chip`**: Controle interativo de filtro e seleção de estado (não utilizado como pílula estática de metadado).
8. **`Tabs`**: Segmented control acessível para alternância de abas locais sem perda de estado.
9. **`BottomSheet`**: Folha deslizante inferior acessível para ações contextuais móveis sem empilhar modais.
10. **`Dialog`**: Modal acessível com foco gerenciado para ações de confirmação de exclusão definitiva.
11. **`Snackbar`**: Alerta flutuante com temporizador de 8 segundos e botão "Desfazer" para reversão imediata de ações.
12. **`Skeleton`**: Estado de carregamento com animação de pulso neutra, mantendo a geometria da tela final.
13. **`EmptyState`**: Estado vazio com ilustração minimalista, título claro, mensagem explicativa e botão de ação primária.
14. **`ProgressBar`**: Barra de progresso com porcentagem acessível (atributos `aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
15. **`Badge`**: Indicador numérico de notificações ou conquistas.
16. **`Avatar`**: Foto de perfil com inicial de fallback e indicador de status.
17. **`Input`**: Campo de texto com rótulo descritivo permanente, mensagem de erro e acessibilidade por leitor de tela.
18. **`Switch`**: Alternador booleano acessível para preferências e configurações.
19. **`GlobalSearchModal`**: Painel de busca global unificado com filtro por texto, atalhos recentes e navegação por teclado.
20. **`DesignSystemGallery`**: Página de demonstração interna para visualização e teste de todos os componentes da biblioteca.
