# Relatório de Remoção de Recursos de Chamadas (Bloco 1B)
**Projeto:** Brain Studio  
**Data:** 28 de Outubro de 2026  
**Status:** Concluído com Sucesso

---

## 1. Inventário Realizado (1B.1)
Foi realizada auditoria completa no código-fonte, rotas, componentes, regras do banco de dados, servidor backend, traduções e manifests para identificar todos os resquícios de chamadas de áudio e vídeo, WebRTC e captura de mídia:

1. **Componentes e Telas:**
   - `src/components/calls/ActiveCallModal.tsx`: Modal WebRTC 1:1 e em grupo com streams de vídeo, botões de ligar/desligar câmera/microfone, tela cheia, compartilhamento de tela. -> **REMOVIDO DEFINITIVAMENTE**.
   - `src/services/realtimeCallService.ts`: Serviço de gerenciamento de WebRTC nativo/browser, `RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`, servidores STUN/TURN (Google STUN). -> **REMOVIDO DEFINITIVAMENTE**.
   - `src/components/chat/WhatsAppChatModal.tsx`: Botões de cabeçalho `Phone` e `Video`, prop `onStartCall`. -> **REMOVIDOS**.
   - `src/components/users/OnlineUsersDrawer.tsx`: Ícones de chamada, estado `inCall`, botões de ligar áudio/vídeo por usuário. -> **REMOVIDOS** (mantido chat direto estilo WhatsApp).
   - `src/components/CourseWorkspaceView.tsx`: Botão "Chamada da Turma", ícones de telefone e vídeo na lista de membros, estados de seleção de turma para chamada. -> **REMOVIDOS**.
   - `src/components/tabs/SequenceTrackTab.tsx`: Props `onStartCallWithMember` e `onStartGroupCallWithCourse`. -> **REMOVIDOS**.
   - `src/components/tabs/GuildsBattlesTab.tsx`: Botões de chamada para membros de guilda. -> **REMOVIDOS**.
   - `src/components/tabs/canonical/EstudarTab.tsx`: Rota de "Sala de Estudo Virtual" com ícone de vídeo. -> **ATUALIZADO PARA "Sala de Foco em Grupo" com ícone de cronômetro (`Timer`)**.
   - `src/components/tabs/canonical/JogoTab.tsx`: Prop `onStartCallWithMember`. -> **REMOVIDA**.
   - `src/App.tsx`: Import e renderização de `ActiveCallModal`, listener de chamadas recebidas, estados de chamada. -> **REMOVIDOS**.

2. **Backend e WebSocket (`server.ts`):**
   - Interfaces `ActiveCallSession`, mapa `activeCallsStore`, rotas de sinalização HTTP (`/api/study-room/rooms/:roomId/signal`). -> **REMOVIDOS**.
   - Mensagens WebSocket de sinalização: `call-user`, `accept-call`, `reject-call`, `direct-signal`, `end-call`, `signal`, `media-state`, `speaking`. -> **REMOVIDOS**.
   - Objeto `StudyRoomPeer`: atualizado para focar em metadados acadêmicos (`goal`, `isFocusing`, `elapsedMinutes`).

3. **Banco de Dados Firestore & Regras de Segurança (`firestore.rules` & `src/lib/firebase.ts`):**
   - Coleção `/chamadas/{callId}` e subcoleção `/candidatos/{candidatoId}` removidas de `firestore.rules`.
   - Funções `createCallSession`, `subscribeIncomingCalls`, `updateCallStatus`, `subscribeCallSession`, `addCallIceCandidate`, `subscribeCallIceCandidates` removidas de `src/lib/firebase.ts`.
   - Tipo de notificação `chamada_perdida` removido da interface `AppNotification`.
   - Estado de presença `em_chamada` substituído por `em_foco`.

4. **Permissões Nativas e do PWA:**
   - `android/app/src/main/AndroidManifest.xml`: Removidas as permissões `CAMERA`, `RECORD_AUDIO`, `MODIFY_AUDIO_SETTINGS` e as tags `<uses-feature android:name="android.hardware.camera" />`.
   - `metadata.json`: Removidas permissões `"camera"` e `"microphone"` de `requestFramePermissions`.
   - `index.html`: Descrição e OpenGraph atualizados para destacar "salas de foco sincronizadas" no lugar de chamadas de áudio e vídeo.

5. **Traduções (`pt-BR.json`, `en.json`, `es.json`):**
   - Removidas chaves de chamada direta (`iniciar_chamada_voz`, `iniciar_chamada_video`).
   - Sessão `sala_estudo` completamente reformulada com termos de foco em grupo, pomodoro e metas.

---

## 2. Sala de Foco em Grupo (Transformação de 1B.4)
Em conformidade com a decisão registrada em `docs/DECISOES.md` (Decisão 10):
- A "Sala de Estudo Virtual" foi remodelada para a **Sala de Foco em Grupo**:
  - **Cronômetro Pomodoro Acadêmico:** Modos de 25 min (Foco), 5 min (Pausa Curta) e 15 min (Pausa Longa).
  - **Metas da Sessão:** O estudante define explicitamente o que está estudando no ciclo (ex.: "Terminar lista de Cálculo").
  - **Colegas Focando:** Lista ao vivo dos participantes conectados na sala, mostrando tempo focado e status em tempo real.
  - **Chat Colaborativo:** Canal de texto em tempo real (via `firestoreChatService`) para dúvidas e incentivos entre estudantes sem qualquer interrupção audiovisual.
  - **Zero Áudio / Zero Vídeo:** Sem nenhum consumo de WebRTC, sem câmeras, sem microfones e sem servidores de mídia.

---

## 3. Ajustes no Formulário de Segurança de Dados da Google Play
Com a remoção dessas permissões, a declaração da Play Console para a conta de desenvolvedor deve ser simplificada:
- **Câmera:** Declarar que o aplicativo **NÃO** acessa nem coleta dados de câmera.
- **Microfone / Áudio:** Declarar que o aplicativo **NÃO** grava áudio nem coleta dados de voz nativamente (o reconhecimento de voz opcional no chat utiliza unicamente a API de ditado Web Speech acessível pelo próprio navegador webview sem retenção em servidor).
- **Redução de Risco para Menores:** Como o Brain Studio é voltado também para estudantes secundaristas e menores de idade, a ausência total de vídeo e voz ao vivo elimina integralmente riscos de assédio audiovisual, exposição inadvertida e violações de privacidade COPPA / LGPD de menores.
