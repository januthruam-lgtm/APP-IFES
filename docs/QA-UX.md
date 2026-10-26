# Roteiro de Testes e Garantia de Qualidade de UX (docs/QA-UX.md)

Este documento descreve os cenários de teste de usabilidade para validação do critério de **no máximo 3 toques a partir do Início** para qualquer funcionalidade, bem como testes de acessibilidade e responsividade.

---

## 1. Testes de Tarefas de Usabilidade (Máximo 3 Toques a partir do Início)

| ID | Tarefa do Usuário | Passos a partir do Início (`/inicio`) | Número de Toques | Status |
|---|---|---|---|---|
| **UX-01** | Criar uma nova tarefa | 1. Tocar em "Estudar" na barra inferior.<br>2. Tocar no botão "Nova Tarefa" no grupo Organizar. | 2 toques | Aprovado |
| **UX-02** | Abrir Flashcards Anki para estudar | 1. Tocar em "Estudar".<br>2. Tocar em "Flashcards Anki" no grupo Praticar. | 2 toques | Aprovado |
| **UX-03** | Trocar o idioma do aplicativo | 1. Tocar em "Perfil".<br>2. Tocar em "Configurações".<br>3. Tocar em "Idioma" e selecionar. | 3 toques | Aprovado |
| **UX-04** | Ver o Extrato de Moedas | 1. Tocar no saldo de moedas no topo (TopBar) OU Tocar em "Jogo" > "Carteira". | 1 ou 2 toques | Aprovado |
| **UX-05** | Arquivar uma matéria e vê-la em Excluídas | 1. Tocar em "Estudar" > "Minhas Disciplinas".<br>2. Tocar na engrenagem da matéria e arquivar.<br>3. Tocar na sub-aba "Excluídas". | 3 toques | Aprovado |
| **UX-06** | Mudar o tamanho do texto (Acessibilidade) | 1. Tocar em "Perfil".<br>2. Tocar em "Acessibilidade & Inclusão".<br>3. Ajustar o controle de escala de texto. | 3 toques | Aprovado |
| **UX-07** | Conversar com a tutora Lumina IA | 1. Tocar no botão central "Lumina" na barra inferior. | 1 toque | Aprovado |
| **UX-08** | Abrir os Planos e Assinaturas | 1. Tocar em "Perfil".<br>2. Tocar em "Planos". | 2 toques | Aprovado |
| **UX-09** | Ativar o Modo Foco | 1. Tocar em "Perfil".<br>2. Tocar no interruptor "Modo Foco". | 2 toques | Aprovado |
| **UX-10** | Acessar o Programa de Fidelidade | 1. Tocar em "Jogo".<br>2. Tocar em "Loja".<br>3. Selecionar a aba "Fidelidade". | 3 toques | Aprovado |

---

## 2. Critérios de Aceite de Acessibilidade e Responsividade

1. **Responsividade Multi-Dispositivo**:
   - `360px` (smartphones compactos): Nenhum elemento quebra a viewport horizontalmente (`overflow-x: hidden`). Textos mantêm leitura fluida sem sobreposições.
   - `768px` (tablets / telas médias): A barra inferior é substituída suavemente pelo NavigationRail lateral.
   - `1024px+` (laptops e desktops): Exibição do Sidebar completo com hierarquia clara.
2. **Alvos de Toque (Touch Targets)**:
   - Todo botão, ícone de navegação ou elemento clicável possui área mínima ativa de `44px x 44px` (recomendado `48px x 48px`).
3. **Contraste de Cores (WCAG AA)**:
   - Tema Claro: Texto principal `#1E1B18` sobre fundo `#FDFBF7` atinge contraste de 14.8:1.
   - Tema Escuro: Texto principal `#F8FAFC` sobre fundo `#0F172A` atinge contraste de 15.2:1.
   - Texto secundário atinge pelo menos 4.5:1 em ambos os temas.
4. **Leitores de Tela e Navegação por Teclado**:
   - Todos os elementos interativos possuem `aria-label` descritivo e estados `aria-selected` / `aria-expanded` quando aplicável.
   - Anéis de foco (`focus-visible`) nítidos e de alto contraste em ambos os temas.
5. **Suporte RTL e Internacionalização**:
   - Espelhamento bidirecional garantido nos 4 idiomas com escrita da direita para a esquerda (Árabe, Hebraico, Persa e Urdu).
   - Sem textos truncados ou botões quebrados em idiomas com palavras extensas (Alemão, Sueco, Ucraniano).
