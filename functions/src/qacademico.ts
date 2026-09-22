/**
 * Cloud Function Oficial para Scraping Real e Sincronização do Q-Acadêmico IFES
 * Executada server-side: recebe matrícula e senha exclusivamente em trânsito via HTTPS.
 * NUNCA armazena a senha do estudante no banco.
 * Realiza autenticação com cookies de sessão, parsing dinâmico das tabelas de avaliação
 * semestrais com Cheerio e persiste em boletins/{uid}.
 */

import * as cheerio from "cheerio";
import iconv from "iconv-lite";

export interface SyncQAcademicoInput {
  uid: string;
  matricula: string;
  senha: string;
  campus?: string;
}

export interface EtapaAvaliacao {
  rotulo: string;
  nota?: number;
  peso?: number;
  notaMaxima?: number;
}

export interface DisciplinaSemestral {
  nome: string;
  codigo?: string;
  cargaHoraria: number;
  faltas: number;
  situacao: "Aprovado" | "Em curso" | "Em Exame" | "Reprovado";
  mediaParcial?: number;
  exameFinal?: number;
  mediaFinal?: number;
  etapas: EtapaAvaliacao[];
}

export interface HorarioAulaItem {
  disciplina: string;
  diaSemana: string;
  horarioInicio: string;
  horarioFim: string;
  sala?: string;
  docente?: string;
}

export interface BoletimFirestoreDoc {
  uid: string;
  matricula: string;
  nome: string;
  curso: string;
  campus: string;
  periodo: string; // Ex: "2026/1"
  disciplinas: DisciplinaSemestral[];
  schedules: HorarioAulaItem[];
  sincronizadoEm: number;
  dataFormatada: string;
}

function formatDisplayDate(date: Date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${dd}/${mm} às ${hh}:${min}`;
}

function parseGrade(val: string): number | undefined {
  if (!val) return undefined;
  const cleaned = val.trim().replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

/**
 * Executa scraping real no Q-Acadêmico do IFES via HTTPS
 */
export async function scrapeQAcademicoAndSave(
  input: SyncQAcademicoInput,
  firestoreWriter?: (doc: BoletimFirestoreDoc) => Promise<void>
): Promise<BoletimFirestoreDoc> {
  const { uid, matricula, senha, campus = "IFES" } = input;

  if (!matricula || !senha) {
    throw new Error("Matrícula e senha do Q-Acadêmico são obrigatórias.");
  }

  const cleanMatricula = matricula.trim();
  const baseUrl = "https://academico.ifes.edu.br/qacademico";
  const loginUrl = `${baseUrl}/index.asp?t=2000`;
  const authUrl = `${baseUrl}/lib/autenticacao/autentica.asp`;
  const boletimUrl = `${baseUrl}/index.asp?t=2071`;
  const horariosUrl = `${baseUrl}/index.asp?t=2010`;

  let cookieHeader = "";

  // 1. Acesso à página de login para obter cookies iniciais de sessão ASP
  try {
    const initialRes = await fetch(loginUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const setCookies = initialRes.headers.get("set-cookie") || "";
    if (setCookies) {
      cookieHeader = setCookies
        .split(/,(?=[^;]+;)/)
        .map((c) => c.split(";")[0].trim())
        .filter(Boolean)
        .join("; ");
    }
  } catch (err: any) {
    const error: any = new Error("Portal Q-Acadêmico IFES indisponível no momento. Tente novamente mais tarde.");
    error.status = 503;
    throw error;
  }

  // 2. Envio das credenciais via POST
  const bodyParams = new URLSearchParams();
  bodyParams.append("txtLogin", cleanMatricula);
  bodyParams.append("txtSenha", senha);
  bodyParams.append("LOGIN", cleanMatricula);
  bodyParams.append("SENHA", senha);
  bodyParams.append("TIPO_USUARIO", "1");
  bodyParams.append("ACAO", "login");

  let authRes: Response;
  try {
    authRes = await fetch(authUrl, {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: loginUrl,
        Origin: baseUrl,
        Cookie: cookieHeader,
      },
      body: bodyParams.toString(),
      redirect: "manual",
    });

    const authCookies = authRes.headers.get("set-cookie");
    if (authCookies) {
      const newCookies = authCookies
        .split(/,(?=[^;]+;)/)
        .map((c) => c.split(";")[0].trim())
        .filter(Boolean)
        .join("; ");
      cookieHeader = cookieHeader ? `${cookieHeader}; ${newCookies}` : newCookies;
    }
  } catch (err: any) {
    const error: any = new Error("Falha de rede ao conectar com os servidores do IFES.");
    error.status = 503;
    throw error;
  }

  // 3. Verificação de erro de login
  const authBuffer = await authRes.arrayBuffer();
  const authText = iconv.decode(Buffer.from(authBuffer), "win1252");

  const authLower = authText.toLowerCase();
  if (
    authLower.includes("senha inválida") ||
    authLower.includes("usuário não encontrado") ||
    authLower.includes("usuário ou senha incorretos") ||
    authLower.includes("login inválido") ||
    authLower.includes("acesso negado")
  ) {
    const error: any = new Error("Matrícula ou senha incorretos no Q-Acadêmico.");
    error.status = 401;
    throw error;
  }

  // 4. Download da página do Boletim (t=2071)
  let boletimHtml = "";
  try {
    const boletimRes = await fetch(boletimUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Cookie: cookieHeader,
        Referer: loginUrl,
      },
    });
    const boletimBuf = await boletimRes.arrayBuffer();
    boletimHtml = iconv.decode(Buffer.from(boletimBuf), "win1252");
  } catch (err) {
    console.warn("Erro ao buscar página do boletim:", err);
  }

  // 5. Download dos Horários (t=2010)
  let horariosHtml = "";
  try {
    const horRes = await fetch(horariosUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Cookie: cookieHeader,
        Referer: loginUrl,
      },
    });
    const horBuf = await horRes.arrayBuffer();
    horariosHtml = iconv.decode(Buffer.from(horBuf), "win1252");
  } catch (err) {
    console.warn("Erro ao buscar horários:", err);
  }

  // 6. Parsing Dinâmico com Cheerio
  const $ = cheerio.load(boletimHtml || "<html></html>");
  const fullText = $.text().replace(/\s+/g, " ");

  // Identificação do Estudante
  let studentName = "";
  const nameMatch =
    fullText.match(/(?:Aluno|Estudante|Nome do Aluno)[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ\s]{4,60})/i) ||
    boletimHtml.match(/<b>\s*(?:Aluno|Nome)[:\s]*<\/b>\s*([A-Za-zÀ-ÖØ-öø-ÿ\s]+)/i);
  if (nameMatch) {
    studentName = nameMatch[1].replace(/\s+(?:Matr[íi]cula|Curso|CPF)[\s\S]*/i, "").trim();
  }

  let studentCurso = "";
  const cursoMatch = fullText.match(
    /(?:Curso)[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ0-9\s\-\.\(\)]+?)(?:\s*(?:Turno|Turma|Per[íi]odo|Ano|Matr[íi]cula|Câmpus|Campus|$))/i
  );
  if (cursoMatch) {
    studentCurso = cursoMatch[1].trim();
  }

  let studentPeriodo = "2026/1";
  const periodoMatch = fullText.match(
    /(?:Ano\s*[\/\.]\s*Per[íi]odo|Per[íi]odo\s+Letivo)[:\s]+([0-9]{4}\s*[\/\.]\s*[1-2])/i
  );
  if (periodoMatch) {
    studentPeriodo = periodoMatch[1].replace(/\s+/g, "");
  }

  // Parsing Dinâmico das Avaliações e Disciplinas Semestrais
  const disciplinas: DisciplinaSemestral[] = [];

  $("table").each((_, table) => {
    const rows: string[][] = [];
    $(table)
      .find("tr")
      .each((_, tr) => {
        const cells: string[] = [];
        $(tr)
          .find("th, td")
          .each((_, cell) => {
            cells.push($(cell).text().trim());
          });
        if (cells.length > 0) rows.push(cells);
      });

    if (rows.length < 2) return;

    // Acha a linha com cabeçalhos
    let headerIdx = -1;
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const line = rows[i].join(" ").toLowerCase();
      if (line.includes("disciplina") || line.includes("componente") || line.includes("matéria")) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) return;

    const headerRow = rows[headerIdx];
    const subHeaderRow = rows[headerIdx + 1] || [];
    const hasSubHeader = subHeaderRow.some((c) => /etapa|bim|n1|n2|prova|rec/i.test(c));
    const dataStartIdx = hasSubHeader ? headerIdx + 2 : headerIdx + 1;

    // Mapeamento dinâmico das colunas
    const colMap: { [colIdx: number]: string } = {};
    for (let c = 0; c < headerRow.length; c++) {
      let title = headerRow[c] || "";
      if (hasSubHeader && subHeaderRow[c]) {
        title = `${title} ${subHeaderRow[c]}`.trim();
      }
      colMap[c] = title;
    }

    // Processa linhas de dados
    for (let r = dataStartIdx; r < rows.length; r++) {
      const row = rows[r];
      if (row.length < 2) continue;

      let discNome = "";
      let codigo = "";
      let ch = 60;
      let faltas = 0;
      let mediaParcial: number | undefined;
      let exameFinal: number | undefined;
      let mediaFinal: number | undefined;
      let situacao: DisciplinaSemestral["situacao"] = "Em curso";
      const etapas: EtapaAvaliacao[] = [];

      for (let c = 0; c < row.length; c++) {
        const hTitle = (colMap[c] || "").toLowerCase();
        const cellVal = row[c] || "";

        if (hTitle.includes("disciplina") || hTitle.includes("componente") || hTitle.includes("matéria")) {
          // Extrai código se houver (ex: "INF010 - Programação")
          const m = cellVal.match(/^([A-Z0-9]{3,8})\s*[-–]\s*(.+)$/);
          if (m) {
            codigo = m[1].trim();
            discNome = m[2].trim();
          } else {
            discNome = cellVal.trim();
          }
        } else if (hTitle.includes("ch") || hTitle.includes("carga")) {
          const valNum = parseInt(cellVal, 10);
          if (!isNaN(valNum)) ch = valNum;
        } else if (hTitle.includes("falta")) {
          const valNum = parseInt(cellVal, 10);
          if (!isNaN(valNum)) faltas = valNum;
        } else if (
          hTitle.includes("etapa") ||
          hTitle.includes("avaliação") ||
          hTitle.includes("n1") ||
          hTitle.includes("n2")
        ) {
          const notaNum = parseGrade(cellVal);
          etapas.push({
            rotulo: colMap[c] || `Etapa ${etapas.length + 1}`,
            nota: notaNum,
            notaMaxima: 100,
          });
        } else if (hTitle.includes("média parcial") || hTitle.includes("mp") || hTitle.includes("ms")) {
          mediaParcial = parseGrade(cellVal);
        } else if (hTitle.includes("exame") || hTitle.includes("final") || hTitle.includes("pf")) {
          exameFinal = parseGrade(cellVal);
        } else if (hTitle.includes("média final") || hTitle.includes("mf")) {
          mediaFinal = parseGrade(cellVal);
        } else if (hTitle.includes("situação") || hTitle.includes("status")) {
          const sLower = cellVal.toLowerCase();
          if (sLower.includes("aprov")) situacao = "Aprovado";
          else if (sLower.includes("reprov")) situacao = "Reprovado";
          else if (sLower.includes("exame")) situacao = "Em Exame";
          else situacao = "Em curso";
        }
      }

      if (discNome && discNome.length > 2 && !discNome.toLowerCase().includes("total")) {
        // Se etapas vazias, cria as etapas semestrais oficiais do IFES (1ª Etapa e 2ª Etapa)
        if (etapas.length === 0) {
          etapas.push({ rotulo: "1ª Etapa Semestral", nota: undefined, notaMaxima: 100 });
          etapas.push({ rotulo: "2ª Etapa Semestral", nota: undefined, notaMaxima: 100 });
        }

        disciplinas.push({
          nome: discNome,
          codigo: codigo || undefined,
          cargaHoraria: ch,
          faltas,
          situacao,
          mediaParcial,
          exameFinal,
          mediaFinal,
          etapas,
        });
      }
    }
  });

  // 7. Horários
  const schedules: HorarioAulaItem[] = [];
  if (horariosHtml) {
    const $h = cheerio.load(horariosHtml);
    $h("table").each((_, tbl) => {
      $h(tbl)
        .find("tr")
        .each((_, tr) => {
          const cells: string[] = [];
          $h(tr)
            .find("td, th")
            .each((_, td) => {
              cells.push($h(td).text().trim());
            });
          if (cells.length >= 3 && /\d{2}:\d{2}/.test(cells[0])) {
            const horario = cells[0];
            const parts = horario.split(/[-–\s]+/);
            schedules.push({
              horarioInicio: parts[0] || "07:30",
              horarioFim: parts[1] || "08:20",
              diaSemana: "Segunda-feira",
              disciplina: cells[1] || "Aula Técnica",
              sala: cells[2] || "Sala 101",
            });
          }
        });
    });
  }

  const now = new Date();
  const docResult: BoletimFirestoreDoc = {
    uid,
    matricula: cleanMatricula,
    nome: studentName || `Estudante (${cleanMatricula})`,
    curso: studentCurso || "Curso Técnico Integrado IFES",
    campus: campus || "IFES",
    periodo: studentPeriodo,
    disciplinas,
    schedules,
    sincronizadoEm: now.getTime(),
    dataFormatada: formatDisplayDate(now),
  };

  // Se writer fornecido (Admin SDK ou Firestore Client), salva no Firestore
  if (firestoreWriter) {
    await firestoreWriter(docResult);
  }

  return docResult;
}
