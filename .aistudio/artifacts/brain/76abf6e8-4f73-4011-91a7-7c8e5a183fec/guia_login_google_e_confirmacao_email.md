# Guia de Configuração: Conexão com Conta Google e E-mail de Confirmação • Brain Studio

Este documento apresenta a arquitetura e as instruções completas para o login com a **Conta Google** e o envio direto de **e-mails de confirmação** no Brain Studio.

---

## 1. Visão Geral da Funcionalidade

Para simplificar a entrada dos estudantes e garantir a autenticidade das contas acadêmicas, foram implementados dois pilares essenciais:

1. **Login Rápido com a Conta Google (1 Clique)**:
   - Utilização do `GoogleAuthProvider` nativo do Firebase Authentication via janela popup segura.
   - Criação ou sincronização automática do perfil do estudante no Cloud Firestore (`users/{uid}`).
   - Importação imediata do nome completo e foto de perfil do Google.
   - Preservação intacta de moedas, nível, ofensiva (streak) e dados do pet.

2. **Envio Direto de E-mail de Confirmação**:
   - Tanto no **login/cadastro por e-mail e senha** quanto no **login pela Conta Google**, o sistema aciona o serviço `sendEmailVerification` do Firebase Auth e o canal seguro de notificação da aplicação.
   - O estudante recebe na sua caixa de entrada um e-mail oficial com link criptografado para confirmar e validar o endereço de e-mail.
   - A interface exibe aviso imediato com o e-mail de destino e oferece a opção de reenviar o e-mail caso necessário.

---

## 2. Fluxo de Experiência do Usuário (UX)

### A. Login com Conta Google
1. Na tela de login (`AuthModal`), o estudante clica no botão em destaque **"Continuar com o Google"**.
2. A janela popup oficial do Google é exibida para seleção da conta Gmail ou Google Workspace institucional.
3. Após consentimento:
   - A sessão é autenticada no Firebase Authentication.
   - O documento em `users/{uid}` é sincronizado.
   - O e-mail de confirmação é despachado diretamente para a conta Google do estudante.
   - O modal exibe confirmação visual de sucesso e redireciona para a central de estudos.

### B. Login ou Cadastro com E-mail e Senha
1. O estudante digita seu e-mail e senha.
2. No cadastro ou login:
   - A credencial é validada.
   - O e-mail de confirmação é disparado automaticamente.
   - O usuário é informado na interface sobre o envio do e-mail.

---

## 3. Configuração de Domínios Autorizados no Firebase e Google Cloud

Para que o popup de login com o Google opere sem bloqueios de segurança do navegador, os domínios da aplicação devem constar na lista de **Domínios Autorizados** no console do Firebase:

### Domínios do Ambiente:
- `total-melody-g6rpq.firebaseapp.com` *(Padrão do Firebase)*
- `total-melody-g6rpq.web.app` *(Padrão de hospedagem)*
- `ais-dev-pzvdq3wll2wmaa436tu5nt-801563813870.us-east1.run.app` *(Container de Desenvolvimento)*
- `ais-pre-pzvdq3wll2wmaa436tu5nt-801563813870.us-east1.run.app` *(Container de Compartilhamento/Preview)*

### Passos de Verificação no Firebase Console (Caso necessário ajuste externo):
1. Acesse o **Firebase Console** no projeto `total-melody-g6rpq`.
2. Vá em **Authentication** > aba **Settings** (Configurações) > **Authorized domains** (Domínios autorizados).
3. Verifique se os domínios do AI Studio estão listados.

---

## 4. Tratamento de Exceções e Resiliência

- **Pop-up Bloqueado pelo Navegador (`auth/popup-blocked`)**:
  - A interface detecta o bloqueio e instrui o usuário: *"A janela pop-up foi bloqueada pelo navegador. Permita pop-ups para este site para fazer login com o Google."*
- **Janela Fechada pelo Usuário (`auth/popup-closed-by-user`)**:
  - Trata como cancelamento não destrutivo, sem quebrar o fluxo da tela.
- **Limite de E-mails (`auth/too-many-requests`)**:
  - Evita spam avisando que o e-mail de confirmação já foi enviado recentemente.
- **Acesso Offline**:
  - Credenciais e perfis validados utilizam cache criptografado em `localStorage` para garantir funcionamento contínuo.

---

## 5. Arquivos e Componentes Envolvidos

- `src/services/authService.ts`: Funções `entrarComGoogle()`, `enviarConfirmacaoPorEmail()`, `cadastrarComEmailESenha()`, `entrarComEmailESenha()`.
- `src/components/AuthModal.tsx`: Botão de login com Google, divisores visuais, status de e-mail de confirmação e tratamento de erros.
- `server.ts`: Endpoint `/api/auth/send-confirmation-notice` para auditoria e despacho de notificações de segurança no backend.
- `src/App.tsx`: Sincronização do estado de login e persistência do perfil de usuário com avatar do Google.
