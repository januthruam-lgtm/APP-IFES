# Modelo de Dados e Segurança do Banco de Dados - Brain Studio (Fase 0)

Este documento descreve a estrutura de coleções do Firebase Firestore, armazenamento no cliente (localStorage / IndexedDB) e a análise das regras de segurança atuais (`firestore.rules`).

---

## 1. Estrutura de Coleções do Firestore

### 1.1 `/users/{uid}` (Documento Principal do Usuário)
- `email`: string - Endereço de e-mail do estudante.
- `nome`: string - Nome completo ou apelido acadêmico.
- `instituicao`: object - Dados da instituição (ID, nome, campus/UF, sistema).
- `plano`: string - `'gratuito' | 'lite' | 'pro_semanal' | 'pro_mensal' | 'pro_semestral' | 'pro_anual'`.
- `nivelPlano`: number - Nível numérico de acesso: `0 (Gratuito)`, `1 (Lite)`, `2 (Pro)`. *(Nota de Segurança: Escrita controlada exclusivamente pelo servidor/webhooks, nunca pelo cliente)*.
- `expiraEm`: timestamp | null - Data de expiração da assinatura.
- `criadoEm`: timestamp - Data de cadastro.
- `atualizadoEm`: timestamp - Última alteração.

#### Subcoleção `/users/{uid}/luminaMemoria/{memoriaId}` (Fase 8)
- `categoria`: `'nivel_explicacao' | 'curso' | 'dificuldade' | 'materia' | 'estilo'`.
- `texto`: string - Texto conciso do fato acadêmico memorizado (máximo 50 itens por usuário).
- `criadoEm`: timestamp.
- *Regra*: Leitura e exclusão restritas exclusivamente ao próprio usuário autenticado (`isOwner(uid)`). Dados sensíveis (saúde, orientação, documentos, política) são proibidos por contrato técnico.

#### Subcoleção `/users/{uid}/cidade` (Fase 6)
- `cidadeAtual`: number - ID da cidade ativa (1 a 10).
- `construcoes`: map - `{ [construcaoKey]: estagioNivel (1 a 5) }`.
- `selos`: array - Selos acadêmicos conquistados por mérito de estudo.
- `ajudasRecebidas`: number - Ajudas em obras recebidas no dia (máx. 3).
- `atualizadoEm`: timestamp.

#### Subcoleção `/users/{uid}/pet/guardaRoupa` (Fase 12)
- `itensDesbloqueados`: array de IDs de cosméticos.
- `lookAtivo`: map de slots (`{ skin, cabeca, rosto, pescoco, corpo, costas, fundo }`).
- `looksSalvos`: array de combinações salvas (respeitando cotas do plano).

### 1.2 `/saldos/{uid}` (Contabilidade Gamificada)
- `moedas`: number - Saldo atual de moedas acadêmicas.
- `xp`: number - Pontos de experiência individuais acumulados.
- `nivel`: number - Nível acadêmico do estudante.
- `ofensiva`: map:
  - `dias`: number - Dias consecutivos de estudo.
  - `ultimaAtividade`: string - Data YYYY-MM-DD em `America/Sao_Paulo`.
  - `maiorOfensiva`: number - Recorde histórico.
  - `congelamentos`: number - Estoque de congelamento (máx. 2).
- `moedasGanhasHoje`: number - Contador diário para aplicação do freio anti-inflação.
- `atualizadoEm`: timestamp.

### 1.3 `/equipes/{equipeId}` (Equipes de Estudo e Baú Comunitário)
- `nome`: string - Nome da equipe.
- `descricao`: string - Propósito de estudo da equipe.
- `membros`: array de UIDs dos participantes.
- `liderUid`: string.
- `xpTotal`: number - XP somado de todos os membros.
- `nivelEquipe`: number - Nível da equipe determinando o bônus de moedas.
- `bau`: map:
  - `xpAcumulado`: number - XP disponível para conversão em baús (50 XP por baú).
  - `bausAbertosHoje`: map `{ [uid]: contador (1 a 15) }`.
  - `dataReferencia`: string - Data do fechamento diário.

#### Subcoleção `/equipes/{equipeId}/mensagens/{msgId}`
- `remetenteId`: string.
- `remetenteNome`: string.
- `texto`: string.
- `criadoEm`: timestamp.

### 1.4 `/directChats/{chatId}` (Mensagens Diretas 1-on-1)
- `participantes`: array de 2 UIDs ordenados lexicograficamente.
- `ultimaMensagem`: string.
- `atualizadoEm`: timestamp.

#### Subcoleção `/directChats/{chatId}/messages/{msgId}`
- `senderId`: string.
- `receiverId`: string.
- `content`: string.
- `timestamp`: timestamp.
- `isRead`: boolean - Indicador de mensagem lida ("visto").

### 1.5 `/biblioteca/{obraId}` (Biblioteca Virtual em Domínio Público)
- `titulo`: string.
- `autor`: string.
- `anoMorteAutor`: number.
- `pdBR`: boolean - Verdadeiro se `anoAtual - anoMorteAutor >= 71`.
- `pdFonte`: boolean - Verdadeiro se a edição/tradução é de domínio público ou licença aberta.
- `fonteNome`: string - Ex.: "Domínio Público (MEC)", "Project Gutenberg", "SciELO".
- `fonteUrl`: string - URL oficial verificada com HTTP 200.
- `ativo`: boolean - Somente obras com `pdBR == true` e `pdFonte == true` são exibidas aos estudantes.
- `licenca`: string - Ex.: `'CC0' | 'CC BY' | 'CC BY-SA' | 'Dominio Publico'`.

---

## 2. Armazenamento Local no Cliente

| Armazenamento | Propósito | Chave / Estrutura | Expiração / Validade |
|---|---|---|---|
| `localStorage` | Preferência de tema | `'brain_theme'` (`'claro'` ou `'escuro'`) | Permanente |
| `localStorage` | Idioma selecionado | `'i18nextLng'` | Permanente |
| `localStorage` | Feature flags override | `'brain_feature_*'` | Desenvolvimento / Teste |
| `localStorage` | Tokens de sessão do Moodle / AVA | `'moodle_token'` | Isolado no aparelho do estudante (nunca transmitido ao Firestore) |
| `IndexedDB` | Cache do Dicionário Inteligente | `db: brain_dictionary`, store: `entries` | Validade de 30 dias com revalidação em segundo plano |
| `CacheStorage` | Cache do Service Worker PWA | `brain-studio-v1` | Recursos estáticos e manifestos |

---

## 3. Avaliação das Regras de Segurança (`firestore.rules`)

### Pontos Fortes:
1. **Regra de Propriedade (`isOwner(uid)`)**: Garante que dados pessoais, memórias da Lumina e credenciais sejam acessíveis unicamente pelo respectivo proprietário.
2. **Biblioteca Pública com Escrita Restrita**: Permite leitura pública por estudantes e exige autenticação e autorização para cadastro ou alteração de acervos.
3. **Isolamento de Credenciais**: Credenciais institucionais armazenadas em `/users/{uid}/credentials` não contêm senhas de portais externos (apenas URLs de serviço e identificadores públicos).

### Vulnerabilidades Identificadas e Plano de Mitigação:
1. **Escrita em `/saldos/{uid}`**:
   - *Risco*: Atualmente `/saldos/{uid}` permite escrita ampla pelo cliente para prototipação. Em um app de produção comercial, transações de moedas devem ser validadas por transações idempotentes estritas ou via endpoints de servidor autenticados com verificação de limites diários.
   - *Ação Fase 4*: Implementar validação nas regras que impeça alteração arbitrária de saldos sem comprovação de atividade de estudo.
2. **Controle de Plano (`plano`, `expiraEm`)**:
   - *Risco*: O cliente nunca deve poder conceder o plano Pro a si mesmo.
   - *Ação Fase 5*: Proibir alteração dos campos `plano` e `expiraEm` no documento `/users/{uid}` via regras de segurança (`!request.resource.data.diff(resource.data).affectedKeys().hasAny(['plano', 'expiraEm', 'nivelPlano'])`).
