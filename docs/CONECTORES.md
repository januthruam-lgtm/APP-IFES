# Conectores Institucionais e Segurança • Brain Studio

## 1. Princípios Inegociáveis de Segurança
1. **ZERO Armazenamento de Senhas**: O Brain Studio **NUNCA** solicita, armazena, transmite ou processa senhas de portais estudantis.
2. **Tokens Estritamente Locais**: Tokens pessoais (Moodle Web Service, Canvas Personal Token, OAuth tokens) ficam **SOMENTE NO DISPOSITIVO** do estudante, protegidos por chave criptográfica AES-GCM-256 gerada nativamente pela WebCrypto API no IndexedDB.
3. **Barreira contra Envio ao Firestore**: O método `validarSegurancaPayloadFirestore` bloqueia no cliente qualquer objeto contendo chaves como `token`, `password`, `senha` ou `secret`. Regras do `firestore.rules` aplicam a mesma restrição no servidor.

## 2. Catálogo Oficial de Conectores (`CATALOGO_CONECTORES`)

| Conector | Autenticação | Importação | Detalhes & Limitações |
| :--- | :--- | :--- | :--- |
| **Moodle** | Token Pessoal Web Service | Disciplinas, Tarefas, Notas, Calendário | Token gerado pelo aluno em *Preferências > Chaves de Segurança*. Enviado via POST no corpo da requisição. |
| **Google Classroom** | OAuth 2.0 (Leitura Mínima) | Cursos, Atividades, Prazos | Somente leitura de turmas e tarefas. |
| **Microsoft Teams** | OAuth Graph (Leitura Mínima) | Equipes de aula, Tarefas | Requer aprovação de TI da instituição para tenants corporativos. |
| **Canvas LMS** | Token Pessoal de API | Cursos, Atribuições, Notas | Token pessoal gerado no perfil do Canvas. |
| **Calendário ICS** | Link ICS Seguro | Eventos e Prazos | Link gerado pelo portal escolar, Moodle ou Google Agenda. |
| **Atalhos Web** | Navegação Segura | Acesso em 1 clique | Até 30 links categorizados (Portal, Biblioteca, etc.). |

## 3. Proteção contra Server-Side Request Forgery (SSRF)
Todas as URLs fornecidas para conexões e atalhos passam por `validarUrlSegura(url)`:
- Protocolo estritamente `https:`.
- Rejeição de schemes perigosos (`javascript:`, `data:`, `file:`, `blob:`).
- Bloqueio de hosts de loopback (`localhost`, `127.0.0.1`, `[::1]`).
- Bloqueio de IPs de metadados de nuvem (`169.254.169.254`, `metadata.google.internal`).
- Bloqueio de intervalos de rede privada RFC1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`).
