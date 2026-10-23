# Brain Studio - Ações Manuais e Pendências Externas (docs/PENDENCIAS.md)

Este documento lista ações que dependem de execução em consoles externos (Google Cloud, Firebase, Google Play) com instruções passo a passo simplificadas, utilizáveis diretamente do celular.

---

1. **Deploy de Regras de Segurança no Firebase**:
   - Quando for conveniente, no Console do Firebase (Firestore Database > Rules), colar o conteúdo de `firestore.rules` e clicar em **Publicar**.

2. **Chaves Opcionais em Produção (.env)**:
   - Em desenvolvimento e homologação local, chaves de teste ou fallback inteligente funcionam automaticamente. Para ativar geração com Gemini com cota dedicada em produção, adicionar `GEMINI_API_KEY` nas variáveis de ambiente do serviço de hospedagem.

3. **Geração e Atualização de Arquivos Estáticos de Instituições**:
   - Os arquivos de instituições já estão pré-gerados e ativos para o Brasil (`public/instituicoes/BR.json`) e Portugal (`public/instituicoes/PT.json`).
   - Para processar ou adicionar outros países pelo celular via GitHub Codespaces ou terminal:
     `node scripts/importar-instituicoes.mjs --pais=US`

4. **Configuração de OAuth para Google Classroom e Microsoft Teams (Opcional)**:
   - **Google Classroom**: No Google Cloud Console, criar credencial OAuth 2.0 (Aplicativo Web) e habilitar o escopo somente leitura `https://www.googleapis.com/auth/classroom.courses.readonly` e `https://www.googleapis.com/auth/classroom.coursework.me.readonly`.
   - **Microsoft Teams**: No portal Microsoft Entra ID (Azure), registrar aplicativo com permissão delegada de leitura do Microsoft Graph (`User.Read`, `EduRoster.Read.All`).
   - Usuários podem usar normalmente links ICS, Moodle ou Atalhos Web sem necessidade dessas configurações externas.

