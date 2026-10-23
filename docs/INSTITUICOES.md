# Arquitetura Global de Instituições de Ensino • Brain Studio

## 1. Visão Geral
O Brain Studio foi concebido originalmente com foco nos estudantes do IFES e agora opera como uma plataforma de produtividade e estudos voltada a estudantes de **qualquer instituição de ensino do mundo**, bem como estudantes autodidatas.

## 2. Modelo de Dados de Instituições
Cada instituição na plataforma possui um identificador canônico e metadados oficiais:
```typescript
interface Instituicao {
  id: string; // Ex: "br-ifes-cefor", "pt-ulisboa"
  nome: string;
  nomesAlternativos?: string[];
  sigla?: string;
  tipo: "basica" | "tecnica" | "superior" | "idiomas" | "outra";
  rede: "federal" | "estadual" | "municipal" | "privada" | "publica" | "outra" | null;
  pais: string; // ISO 3166-1 alfa-2 (ex: BR, PT, US)
  regiao?: string; // UF, Estado ou Província
  cidade?: string;
  site?: string; // HTTPS auditado
  codigos?: { inep?: string; emec?: string; ror?: string };
  fonte: "Inep/MEC" | "e-MEC" | "ROR" | "Manual";
  importadoEm: string;
}
```

## 3. Fontes de Dados e Atribuição
1. **Educação Básica (Brasil)**: Catálogo Oficial de Escolas do Inep (Ministério da Educação). Apenas escolas em atividade.
2. **Educação Superior (Brasil)**: Cadastro Nacional do e-MEC.
3. **Mundial / Internacional**: ROR (Research Organization Registry) — Licença Aberta CC0 1.0 Universal (Public Domain Dedication).
4. **Localidades e Municípios**: IBGE (Instituto Brasileiro de Geografia e Estatística).

## 4. Estratégia de Armazenamento e Desempenho
- **Zero Custo de Banco de Dados**: A base completa não é gravada no Firestore para evitar custos excessivos de leitura e armazenamento.
- **Arquivos Estáticos Particionados**: Arquivos leves armazenados em `public/instituicoes/{PAIS}.json`.
- **Cache Local & Busca Fuzzy**: No dispositivo, os arquivos são cacheados em memória e no Service Worker. A busca por nome, sigla e cidade com remoção de acentos responde em menos de 15 ms após carregada.
- **Proxy Dinâmico com ROR**: Quando um país não possui arquivo estático pré-gerado, o servidor Node.js consulta a API do ROR com cache em memória de 24 horas e proteção contra sobrecarga (rate limit de 30 req/min por IP).

## 5. Cadastro Manual e Moderação
- Estudantes cuja instituição não constar na lista oficial podem adicioná-la com o formulário "Minha instituição não está na lista".
- Limite estrito de 3 envios por dia por usuário.
- Validação contra ataques de injeção e checagem de similaridade para evitar duplicatas.
- A instituição fica ativa imediatamente para o usuário criador, mantendo status `pendente` no Firestore até revisão por administradores via painel interno.
- Instituições aprovadas passam para `instituicoesAprovadas` e integram as buscas globais.
