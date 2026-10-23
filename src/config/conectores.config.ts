/**
 * Brain Studio - Catálogo Oficial de Conectores e Sistemas Institucionais (Fase 7)
 * Especificação e políticas de segurança para conexão com Moodle, Classroom, Teams, Canvas, ICS e Portais.
 * Zero tokens no Firestore, zero scraping de senha.
 */

export type MetodoAutenticacao =
  | "token_pessoal"
  | "oauth2_leitura"
  | "link_ics"
  | "atalho_manual";

export interface ConectorConfig {
  id: string;
  nome: string;
  tipo: "moodle" | "google_classroom" | "microsoft_teams" | "canvas" | "calendario_ics" | "sigaa" | "q_academico" | "atalho_web";
  metodoAutenticacao: MetodoAutenticacao;
  oQueImporta: string[];
  limitacoes: string[];
  comoConfigurar: string;
  icone: string;
  permiteSincronizacaoAutomatica: boolean;
  requerUrl: boolean;
}

export const CATALOGO_CONECTORES: Readonly<Record<string, ConectorConfig>> = Object.freeze({
  moodle: {
    id: "moodle",
    nome: "Moodle (Qualquer Instituição)",
    tipo: "moodle",
    metodoAutenticacao: "token_pessoal",
    oQueImporta: ["Disciplinas", "Tarefas e Prazos", "Boletim de Notas", "Calendário Acadêmico"],
    limitacoes: [
      "Requer que o Web Service esteja habilitado na sua instituição",
      "O token deve ser gerado pelo próprio estudante nas preferências do Moodle",
      "Bloqueios de CORS no PWA requerem o app APK/Capacitor ou uso de ICS",
    ],
    comoConfigurar: "Acesse seu Moodle > Perfil > Preferências > Chaves de Segurança / Tokens e copie sua chave pessoal.",
    icone: "GraduationCap",
    permiteSincronizacaoAutomatica: true,
    requerUrl: true,
  },
  google_classroom: {
    id: "google_classroom",
    nome: "Google Classroom",
    tipo: "google_classroom",
    metodoAutenticacao: "oauth2_leitura",
    oQueImporta: ["Turmas ativas", "Trabalhos atribuídos", "Prazos de entrega", "Anúncios"],
    limitacoes: [
      "Acesso somente leitura aos cursos e tarefas",
      "Contas institucionais Google Workspace podem exigir aprovação do administrador escolar",
    ],
    comoConfigurar: "Conecte sua conta Google institucional com permissão exclusiva de leitura de turmas e tarefas.",
    icone: "BookOpen",
    permiteSincronizacaoAutomatica: true,
    requerUrl: false,
  },
  microsoft_teams: {
    id: "microsoft_teams",
    nome: "Microsoft Teams / Education",
    tipo: "microsoft_teams",
    metodoAutenticacao: "oauth2_leitura",
    oQueImporta: ["Equipes de aula", "Tarefas atribuídas", "Prazos do calendário"],
    limitacoes: [
      "Acesso somente leitura via Microsoft Graph",
      "Pode requerer consentimento do administrador do domínio Microsoft 365 da escola",
    ],
    comoConfigurar: "Faça login com sua conta Microsoft escolar e autorize a leitura de atribuições acadêmicas.",
    icone: "Users",
    permiteSincronizacaoAutomatica: true,
    requerUrl: false,
  },
  canvas: {
    id: "canvas",
    nome: "Canvas LMS (Instructure)",
    tipo: "canvas",
    metodoAutenticacao: "token_pessoal",
    oQueImporta: ["Cursos matriculados", "Tarefas e quizzes", "Notas", "Calendário"],
    limitacoes: [
      "Requer geração de Token de Acesso pessoal nas configurações da conta Canvas",
      "Apenas leitura das suas disciplinas",
    ],
    comoConfigurar: "No Canvas, vá em Conta > Configurações > Tokens de Acesso Aprovados > Novo Token de Acesso.",
    icone: "Layers",
    permiteSincronizacaoAutomatica: true,
    requerUrl: true,
  },
  calendario_ics: {
    id: "calendario_ics",
    nome: "Calendário ICS (iCal)",
    tipo: "calendario_ics",
    metodoAutenticacao: "link_ics",
    oQueImporta: ["Datas de provas", "Entregas de trabalhos", "Feriados e eventos escolares"],
    limitacoes: [
      "Somente eventos com data e hora; não importa boletins de notas ou arquivos",
    ],
    comoConfigurar: "Copie o link de inscrição ICS/iCal do calendário do seu portal acadêmico, Moodle ou Google Agenda.",
    icone: "Calendar",
    permiteSincronizacaoAutomatica: true,
    requerUrl: true,
  },
  sigaa: {
    id: "sigaa",
    nome: "SIGAA / SIGA",
    tipo: "sigaa",
    metodoAutenticacao: "atalho_manual",
    oQueImporta: ["Atalho direto para o portal", "Importação de grade e tarefas via arquivo/texto"],
    limitacoes: [
      "O SIGAA não disponibiliza API pública; não solicitamos nem armazenamos sua senha",
      "A importação é feita colando a grade horária ou enviando o PDF de matrícula",
    ],
    comoConfigurar: "Defina o endereço seguro (HTTPS) do SIGAA da sua universidade e utilize a importação de texto/PDF.",
    icone: "ExternalLink",
    permiteSincronizacaoAutomatica: false,
    requerUrl: true,
  },
  q_academico: {
    id: "q_academico",
    nome: "Q-Acadêmico",
    tipo: "q_academico",
    metodoAutenticacao: "atalho_manual",
    oQueImporta: ["Atalho seguro para consulta", "Importação de boletim e grade via PDF ou texto"],
    limitacoes: [
      "Sem API REST pública oficial; proibida raspagem com credenciais",
      "Atualização das notas e faltas via envio do extrato acadêmico",
    ],
    comoConfigurar: "Insira a URL do portal Q-Acadêmico da sua instituição para acesso rápido e seguro.",
    icone: "ExternalLink",
    permiteSincronizacaoAutomatica: false,
    requerUrl: true,
  },
  atalho_web: {
    id: "atalho_web",
    nome: "Atalho para Site Institucional",
    tipo: "atalho_web",
    metodoAutenticacao: "atalho_manual",
    oQueImporta: ["Acesso rápido direto ao portal, biblioteca, e-mail institucional ou cardápio"],
    limitacoes: [
      "Não realiza sincronização de dados; apenas abre a página em ambiente isolado e seguro",
    ],
    comoConfigurar: "Cole o link HTTPS oficial do portal ou serviço da sua instituição.",
    icone: "Globe",
    permiteSincronizacaoAutomatica: false,
    requerUrl: true,
  },
});

export const MAX_ATALHOS_POR_USUARIO = 30;

/**
 * Validação rigorosa de URL contra SSRF e vetores maliciosos.
 * Permite apenas HTTPS e bloqueia esquemas inseguros, localhost, IPs privados e metadados.
 */
export function validarUrlSegura(urlRaw?: string): {
  valida: boolean;
  erro?: string;
  urlLimpa?: string;
  dominio?: string;
} {
  if (!urlRaw || typeof urlRaw !== "string") {
    return { valida: false, erro: "URL não informada." };
  }

  const trimmed = urlRaw.trim();
  if (trimmed.length > 2000) {
    return { valida: false, erro: "A URL informada é excessivamente longa." };
  }

  // 1. Bloqueia esquemas perigosos explicitamente
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("blob:")
  ) {
    return { valida: false, erro: "Esquema de URL inseguro ou proibido." };
  }

  // 2. Deve ser estritamente HTTPS
  if (!lower.startsWith("https://")) {
    return { valida: false, erro: "Apenas conexões criptografadas com HTTPS são permitidas." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valida: false, erro: "Formato de URL inválido." };
  }

  if (parsed.protocol !== "https:") {
    return { valida: false, erro: "O protocolo deve ser exclusivamente https:" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 3. Bloqueio estrito de Localhost
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "0.0.0.0"
  ) {
    return { valida: false, erro: "Endereços locais (localhost) não são permitidos." };
  }

  // 4. Bloqueio de Metadados de Nuvem (AWS/GCP/Azure)
  if (
    hostname === "169.254.169.254" ||
    hostname === "metadata.google.internal" ||
    hostname.endsWith(".internal")
  ) {
    return { valida: false, erro: "Endereços de metadados internos são estritamente bloqueados." };
  }

  // 5. Bloqueio de Redes Privadas (RFC 1918 e Link-Local)
  // 10.0.0.0/8
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { valida: false, erro: "Endereços IP de rede privada não são permitidos." };
  }
  // 172.16.0.0 - 172.31.255.255
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { valida: false, erro: "Endereços IP de rede privada não são permitidos." };
  }
  // 192.168.0.0/16
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { valida: false, erro: "Endereços IP de rede privada não são permitidos." };
  }
  // 169.254.0.0/16
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    return { valida: false, erro: "Endereços de link-local não são permitidos." };
  }

  // 6. Deve possuir ao menos um ponto no domínio (exceto testes qualificados)
  if (!hostname.includes(".") && hostname !== "localhost") {
    return { valida: false, erro: "O nome de domínio deve ser qualificado (ex: campus.edu.br)." };
  }

  return {
    valida: true,
    urlLimpa: parsed.toString(),
    dominio: hostname,
  };
}

export default CATALOGO_CONECTORES;
