# Brain Studio - Acompanhamento do Progresso de Execução (Fases 0 a 13)

| Fase | Título | Status | Arquivos Criados / Modificados | Pendências / Observações |
|---|---|---|---|---|
| **Fase 0** | Fundação, Auditoria e Configuração Central | ✅ CONCLUÍDO | `src/config/*`, `docs/AUDITORIA.md`, `docs/DADOS.md`, `scripts/test-regras.ts`, `package.json` | Nenhuma. Build limpo, lint 0 erros, testes 100%. |
| **Fase 1** | Sistema Universal de Idiomas (Sem Servidor / Fallback) | ✅ CONCLUÍDO | `src/i18n.ts`, `src/locales/*.json`, `scripts/check-i18n.ts`, `scripts/gerar-traducoes.mjs`, `docs/idiomas.md`, `docs/COBERTURA_IDIOMAS.md` | Tradução sem servidor, fallback estrito para en, paridade de 493 chaves 100%, sem quota 429. |
| **Fase 2** | Temas Restritos (Somente Claro e Escuro) | ✅ CONCLUÍDO | `src/utils/themeManager.ts`, `src/index.css`, `index.html`, `src/components/Header.tsx`, `docs/temas.md` | Apenas Claro e Escuro, contraste WCAG AAA (12.5:1 / 13.4:1), zero flash ao carregar, atalho no cabeçalho. |
| **Fase 3** | Matérias Excluídas (Soft-delete e Tombstones) | ✅ CONCLUÍDO | `src/utils/courseTombstones.ts`, `src/utils/courseSync.ts`, `src/components/tabs/IfesAvaTab.tsx`, `scripts/test-tombstones.ts` | Soft-delete com tombstones imunes à ressuscitação pelo Moodle, sub-abas Ativas/Excluídas, restauração e exclusão definitiva. |
| **Fase 4** | Economia Acadêmica (Baú, Missões, Ofensiva, Ligas, Loja) | 🔄 EM ANDAMENTO | `src/config/economia.config.ts`, `src/utils/streakManager.ts` | Integrando 4A (Baú), 4B (Missões & Ofensiva), 4C (Ligas), 4D (Loja e Sumidouros). |
| **Fase 5** | Estrutura de Planos (Gratuito, Lite, Pro) | ⏳ PENDENTE | | |
| **Fase 6** | Cidade do Conhecimento (10 Cidades, Cooperativa) | ⏳ PENDENTE | | |
| **Fase 7** | Suporte Multi-Instituição (Base Estática, Inep/e-MEC/ROR) | ⏳ PENDENTE | | |
| **Fase 8** | Lumina IA (Tutora Humanizada, Memória, Segurança) | ⏳ PENDENTE | | |
| **Fase 9** | Gerador de Quiz por Arquivo (Validação Binária e Cotas) | ⏳ PENDENTE | | |
| **Fase 10**| Cursos Preparatórios Originais | ⏳ PENDENTE | | |
| **Fase 11**| Biblioteca Virtual (Domínio Público) e Dicionário | ⏳ PENDENTE | | |
| **Fase 12**| Guarda-Roupa dos Mascotes (Apenas Estético) | ⏳ PENDENTE | | |
| **Fase 13**| Profissionalização, Segurança e Pacote Play Store | ⏳ PENDENTE | | |
