# Diretrizes e Comportamento do Fluxo de Login - Brain Studio

## 1. Inicialização com Campos Vazios
- Ao abrir a tela de autenticação (`AuthModal`), os campos de e-mail, nome, matrícula e senha iniciam **estritamente vazios**.
- Não são injetados valores padrão, contas de demonstração, e-mails de exemplo ou placeholders que imitem endereços reais de e-mail (são usados textos genéricos como "Seu e-mail" e "Sua matrícula").
- Qualquer registro de "último e-mail utilizado" em `localStorage` ou `sessionStorage` é limpo na montagem da tela de login, ao efetuar logout e ao alternar de conta.

## 2. Preenchimento Automático e Gerenciadores de Senha no Android
- Os inputs utilizam os atributos `autoComplete="off"` (para campos de texto/e-mail) e `autoComplete="new-password"` (para campos de senha).
- **Importante:** Em dispositivos Android, sistemas operacionais e gerenciadores de senhas externos (como Google Autofill, Samsung Pass, Bitwarden, 1Password) operam no nível da acessibilidade do sistema ou do WebView. O aplicativo instrui explicitamente o navegador/WebView a não autocompletar através dos padrões web, mas o preenchimento automático acionado deliberadamente pelo usuário através do teclado nativo do sistema operacional só pode ser controlado em parte pelo código da aplicação web.

## 3. Opção "Lembrar minhas credenciais"
- A opção de persistência de credenciais para conexão permanente inicia **sempre desmarcada** por padrão.
- Quando desmarcada, nenhuma credencial de acesso é persistida em armazenamento permanente.

## 4. Roteiro de Teste do Fluxo de Login
1. **Primeira Abertura**: Abra a aplicação. A tela de identificação exibe os campos de matrícula, nome, e-mail e senha completamente em branco.
2. **Entrada**: Preencha as credenciais e clique em "Entrar no Brain Studio".
3. **Logout**: No menu lateral ou no cabeçalho, clique em "Sair da Conta".
4. **Reabertura**: Ao retornar à tela de login, todos os campos devem estar novamente 100% vazios, sem resquício dos dados digitados anteriormente.
