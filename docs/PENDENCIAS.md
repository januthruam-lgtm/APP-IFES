# Brain Studio - Ações Manuais e Pendências Externas (docs/PENDENCIAS.md)

Este documento lista ações que dependem de execução em consoles externos (Google Cloud, Firebase, Google Play) com instruções passo a passo simplificadas, utilizáveis diretamente do celular.

---

1. **Deploy de Regras de Segurança no Firebase**:
   - Quando for conveniente, no Console do Firebase (Firestore Database > Rules), colar o conteúdo de `firestore.rules` e clicar em **Publicar**.

2. **Chaves Opcionais em Produção (.env)**:
   - Em desenvolvimento e homologação local, chaves de teste ou fallback inteligente funcionam automaticamente. Para ativar geração com Gemini com cota dedicada em produção, adicionar `GEMINI_API_KEY` nas variáveis de ambiente do serviço de hospedagem.
