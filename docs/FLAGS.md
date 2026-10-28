# Documentação de Feature Flags • Brain Studio

Este documento registra o estado auditado de cada **Feature Flag** do sistema comercial (`src/config/features.ts`).

---

## Princípio Geral
As Feature Flags no Brain Studio servem exclusivamente para liberar fases e recursos progressivamente sem quebrar a estabilidade de produção. Conforme as regras inegociáveis, **nenhuma funcionalidade pronta e esperada pelo estudante pode ficar oculta por flag `false` sem justificativa formal**.

A fonte única da verdade para todas as flags do sistema é:
📁 `src/config/features.ts`

---

## Matriz de Feature Flags e Estado de Produção

| Chave da Flag | Estado | Descrição e Escopo | Justificativa / Validação |
| :--- | :---: | :--- | :--- |
| `fase0_fundacao` | **`true`** | Arquitetura modular, Design System e Casca da Aplicação | Fundação estável do AppShell, TopBar e TabBar. |
| `fase1_idiomas` | **`true`** | Sistema i18n com 25 idiomas catalogados e offline | Tradução completa com fallback seguro para inglês. |
| `fase2_temas` | **`true`** | Temas estritamente Claro e Escuro | Eliminação de temas ruidosos; contraste e acessibilidade. |
| `fase3_materias_excluidas` | **`true`** | Exclusão persistente (soft-delete) e aba Excluídos | Restauração e exclusão definitiva funcional. |
| `fase4_economia` | **`true`** | Economia acadêmica e livro-razão (extrato de moedas) | Função transacional append-only `movimentarMoedas`. |
| `fase4a_bau_equipe` | **`true`** | Baú coletivo de colaboração entre estudantes | Desbloqueio e progresso semanal de equipe. |
| `fase4b_missoes_ofensiva` | **`true`** | 3 Missões diárias e Ofensiva (Streak) | Incentivo diário de estudo contínuo. |
| `fase4c_ligas_semanais` | **`true`** | Ligas acadêmicas com promoção e rebaixamento | Gamificação ética sem pressão predatória. |
| `fase4d_loja_sumidouros` | **`true`** | Loja acadêmica, itens e clube de fidelidade | Compras com cashback, vales e selos colecionáveis. |
| `fase5_planos` | **`true`** | Sistema de Planos (Gratuito, Bronze, Prata, Ouro, Diamante) | Configuração em `planos.config.js` e motor de cotas. |
| `fase6_cidade` | **`true`** | Cidades do Conhecimento (10 vilas + procedurais) | Construções em 5 estágios + maestria. |
| `fase7_multi_instituicao` | **`true`** | Suporte multi-instituição (IFES, ROR, MEC, globais) | Conectores agnósticos sem SSRF. |
| `multiInstituicao` | **`true`** | Alias de compatibilidade com versões legadas | Mantém compatibilidade com seletores antigos. |
| `fase8_lumina` | **`true`** | Tutora inteligente Lumina com histórico e foco | Atendimento socrático sem exigência de matéria. |
| `fase9_quiz_arquivo` | **`true`** | Gerador de Quiz a partir de PDFs/documentos | Extração segura com limite de tamanho. |
| `fase10_cursos` | **`true`** | Trilhas e cursos de formação complementar | Módulos com progresso passo a passo. |
| `fase11_biblioteca_dicionario`| **`true`** | Biblioteca Virtual de clássicos e Dicionário | Leitor com capítulos reais e busca rápida. |
| `fase12_guarda_roupa` | **`true`** | Guarda-roupa estético dos Mascotes 3D | Customização cosmética sem vantagem mecânica. |
| `fase13_lancamento` | **`true`** | Pacote e conformidade comercial para publicação | Validações finais e observabilidade do produto. |

---

## Funções Utilitárias Exportadas

- `isFeatureEnabled(featureKey: FeatureKey | string): boolean`: Valida se a flag está ativa, respeitando overrides em `localStorage` para testes de homologação.
- `isFeatureAtiva(featureKey: FeatureKey | string): boolean`: Alias em português para interoperabilidade com o motor de navegação.
