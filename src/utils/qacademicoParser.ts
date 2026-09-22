import {
  QAcademicoGradeItem,
  QAcademicoScheduleItem,
  QAcademicoAccountInfo,
  IfesCourse,
  IfesClassSchedule,
} from "../types";

export interface ParsedQAcademicoResult {
  account: Partial<QAcademicoAccountInfo>;
  grades: QAcademicoGradeItem[];
  schedules: QAcademicoScheduleItem[];
  courses: IfesCourse[];
  classSchedules: IfesClassSchedule[];
  rawStats: {
    totalDisciplinas: number;
    aprovadas: number;
    cursando: number;
    emExame: number;
    reprovadas: number;
    mediaGeral: number;
    totalFaltas: number;
    cr?: number;
  };
}

/**
 * Normaliza textos removendo tags HTML e espaços repetidos
 */
function cleanHtmlText(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " | ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, "")
    .trim();
}

/**
 * Parser Inteligente de dados do Q-Acadêmico Web para IFES
 * Suporta o link oficial https://academico.ifes.edu.br/qacademico/index.asp?t=2000
 * e telas t=2071 (Boletim Escolar) e t=2010 (Horário de Aulas).
 */
export function parseQAcademicoContent(rawInput: string, defaultCampus: string = "IFES"): ParsedQAcademicoResult {
  const result: ParsedQAcademicoResult = {
    account: {
      connected: true,
      portalUrl: "https://academico.ifes.edu.br/qacademico/index.asp?t=2000",
      campus: defaultCampus,
      lastSync: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    grades: [],
    schedules: [],
    courses: [],
    classSchedules: [],
    rawStats: {
      totalDisciplinas: 0,
      aprovadas: 0,
      cursando: 0,
      emExame: 0,
      reprovadas: 0,
      mediaGeral: 0,
      totalFaltas: 0,
    },
  };

  if (!rawInput || !rawInput.trim()) {
    return result;
  }

  const raw = rawInput.trim();
  const isHtml = /<[a-z][\s\S]*>/i.test(raw);
  const cleanedText = isHtml ? cleanHtmlText(raw) : raw;
  const lines = cleanedText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  // 1. Extrair Metadados do Aluno (Nome, Matrícula, Curso, CR)
  const matriculaMatch = raw.match(/(?:matr[íi]cula|login)[:\s]+([0-9A-Za-z]+)/i);
  if (matriculaMatch) {
    result.account.matricula = matriculaMatch[1].trim();
  }

  const nomeMatch = raw.match(/(?:aluno|estudante|nome)[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ\s]{4,60})/i);
  if (nomeMatch) {
    const candidateName = nomeMatch[1].trim().replace(/\s+(?:matr[íi]cula|curso|cpf)[\s\S]*/i, "");
    if (candidateName.length > 3 && !candidateName.toLowerCase().includes("boletim")) {
      result.account.fullname = candidateName;
    }
  }

  const cursoMatch = raw.match(/(?:curso)[:\s]+([A-Za-zÀ-ÖØ-öø-ÿ0-9\s\-\.\(\)]+?)(?:\s*(?:matr[íi]cula|turma|turno|per[íi]odo|\n|<|$))/i);
  if (cursoMatch) {
    result.account.curso = cursoMatch[1].trim();
  }

  const crMatch = raw.match(/(?:coeficiente\s+de\s+rendimento|c\.r\.|cr)[:\s]+(\d{1,3}(?:[,\.]\d{1,2})?)/i);
  if (crMatch) {
    result.account.coeficienteRendimento = parseFloat(crMatch[1].replace(",", "."));
  }

  const periodoMatch = raw.match(/(?:ano\/per[íi]odo|per[íi]odo\s+letivo|ano\s+letivo)[:\s]+([0-9]{4}\s*[\/\.]\s*[1-2])/i);
  if (periodoMatch) {
    result.account.periodo = periodoMatch[1].replace(/\s+/g, "");
  }

  // 2. Extrair Boletim Escolar (Disciplinas, Etapas, Faltas, Médias)
  const parsedGrades: QAcademicoGradeItem[] = [];

  // 2.1 ESTRATÉGIA A: Parser nativo de tabelas HTML com Matriz 2D (rowspan/colspan)
  if (isHtml && typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(raw, "text/html");
      const tables = Array.from(doc.querySelectorAll("table"));

      for (const table of tables) {
        const grid: string[][] = [];
        const trs = Array.from(table.querySelectorAll("tr"));
        trs.forEach((tr, rIdx) => {
          if (!grid[rIdx]) grid[rIdx] = [];
          let colIdx = 0;
          const cells = Array.from(tr.querySelectorAll("th, td"));
          cells.forEach((cell) => {
            while (grid[rIdx][colIdx] !== undefined) {
              colIdx++;
            }
            const rowspan = parseInt(cell.getAttribute("rowspan") || "1", 10);
            const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
            const text = (cell.textContent || "").trim();

            for (let r = 0; r < rowspan; r++) {
              const targetRow = rIdx + r;
              if (!grid[targetRow]) grid[targetRow] = [];
              for (let c = 0; c < colspan; c++) {
                grid[targetRow][colIdx + c] = text;
              }
            }
            colIdx += colspan;
          });
        });

        if (grid.length < 2) continue;

        let headerRowIdx = -1;
        for (let r = 0; r < Math.min(4, grid.length); r++) {
          const rowText = grid[r].join(" ").toLowerCase();
          if (
            rowText.includes("disciplina") ||
            rowText.includes("componente") ||
            rowText.includes("matéria") ||
            rowText.includes("descrição")
          ) {
            headerRowIdx = r;
            break;
          }
        }

        if (headerRowIdx === -1) continue;

        const nextRow = grid[headerRowIdx + 1];
        const headerDepth =
          nextRow && nextRow.some((c) => /etapa|bim|n1|n2|1ª|2ª|3ª|4ª/i.test(c)) ? 2 : 1;

        const numCols = Math.max(...grid.map((row) => row.length));
        const headers: string[] = [];

        for (let c = 0; c < numCols; c++) {
          let combined = "";
          for (let d = 0; d < headerDepth; d++) {
            const val = grid[headerRowIdx + d]?.[c] || "";
            if (val && !combined.toLowerCase().includes(val.toLowerCase())) {
              combined += (combined ? " " : "") + val;
            }
          }
          headers.push(combined.toLowerCase().trim());
        }

        const colDisc = headers.findIndex((h) =>
          h.includes("disciplina") || h.includes("componente") || h.includes("matéria") || h.includes("descrição")
        );
        const colCh = headers.findIndex((h) => h === "ch" || h.includes("carga") || h.includes("c.h."));
        const colFaltas = headers.findIndex((h) => h === "faltas" || h.includes("falta"));
        const colN1 = headers.findIndex((h) => h.includes("1ª") || h.includes("1a") || h.includes("n1"));
        const colN2 = headers.findIndex((h) => h.includes("2ª") || h.includes("2a") || h.includes("n2"));
        const colN3 = headers.findIndex((h) => h.includes("3ª") || h.includes("3a") || h.includes("n3"));
        const colN4 = headers.findIndex((h) => h.includes("4ª") || h.includes("4a") || h.includes("n4"));
        const colMediaParcial = headers.findIndex((h) => h.includes("parcial") || h.includes("méd. parc"));
        const colExame = headers.findIndex((h) => h.includes("exame") || h.includes("prova final") || h.includes("recup"));
        const colMediaFinal = headers.findIndex((h) => h.includes("final") || h.includes("média final") || h.includes("méd. fin"));
        const colSit = headers.findIndex((h) => h.includes("situa") || h.includes("resultado"));

        if (colDisc !== -1) {
          for (let r = headerRowIdx + headerDepth; r < grid.length; r++) {
            const row = grid[r];
            const discText = (row[colDisc] || "").trim();

            if (
              !discText ||
              discText.toLowerCase().includes("disciplina") ||
              discText.toLowerCase().includes("componente") ||
              discText.toLowerCase().includes("total") ||
              discText.toLowerCase().includes("boletim") ||
              discText.length < 3
            ) {
              continue;
            }

            const cleanName = discText.replace(/^[0-9A-Za-z\-_]+\s*[\-–:]\s*/, "").trim();
            const codeMatch = discText.match(/^([0-9A-Za-z\-_]{4,12})/);
            const codigo = codeMatch ? codeMatch[1] : `QACAD-${parsedGrades.length + 1}`;

            let ch = 60;
            if (colCh !== -1 && row[colCh]) {
              const chVal = parseInt(row[colCh].replace(/[^0-9]/g, ""), 10);
              if (!isNaN(chVal) && chVal > 0) ch = chVal;
            }

            let faltas = 0;
            if (colFaltas !== -1 && row[colFaltas]) {
              const fVal = parseInt(row[colFaltas].replace(/[^0-9]/g, ""), 10);
              if (!isNaN(fVal)) faltas = fVal;
            }

            const etapas: QAcademicoGradeItem["etapas"] = [];
            const parseNum = (s?: string) => {
              if (!s) return undefined;
              const n = parseFloat(s.replace(",", "."));
              return isNaN(n) ? undefined : n;
            };

            const n1 = colN1 !== -1 ? parseNum(row[colN1]) : undefined;
            const n2 = colN2 !== -1 ? parseNum(row[colN2]) : undefined;
            const n3 = colN3 !== -1 ? parseNum(row[colN3]) : undefined;
            const n4 = colN4 !== -1 ? parseNum(row[colN4]) : undefined;

            if (n1 !== undefined) etapas.push({ etapa: "1ª Etapa", nota: n1 <= 10 && n1 > 0 ? n1 * 10 : n1, notaMax: 100 });
            if (n2 !== undefined) etapas.push({ etapa: "2ª Etapa", nota: n2 <= 10 && n2 > 0 ? n2 * 10 : n2, notaMax: 100 });
            if (n3 !== undefined) etapas.push({ etapa: "3ª Etapa", nota: n3 <= 10 && n3 > 0 ? n3 * 10 : n3, notaMax: 100 });
            if (n4 !== undefined) etapas.push({ etapa: "4ª Etapa", nota: n4 <= 10 && n4 > 0 ? n4 * 10 : n4, notaMax: 100 });

            const mParcial = colMediaParcial !== -1 ? parseNum(row[colMediaParcial]) : undefined;
            const mFinalCand = colMediaFinal !== -1 ? parseNum(row[colMediaFinal]) : mParcial;
            const mediaFinal = mFinalCand !== undefined ? (mFinalCand <= 10 ? mFinalCand * 10 : mFinalCand) : undefined;
            const mediaParcial = mParcial !== undefined ? (mParcial <= 10 ? mParcial * 10 : mParcial) : mediaFinal;

            let sit: QAcademicoGradeItem["situacao"] = "Cursando";
            if (colSit !== -1 && row[colSit]) {
              const s = row[colSit].toLowerCase();
              if (s.includes("aprov")) sit = "Aprovado";
              else if (s.includes("reprov")) sit = "Reprovado";
              else if (s.includes("exame") || s.includes("recup")) sit = "Em Exame";
              else if (s.includes("curs")) sit = "Cursando";
            } else if (mediaFinal !== undefined) {
              if (mediaFinal >= 60 && etapas.length >= 2) sit = "Aprovado";
              else if (mediaFinal < 60 && mediaFinal >= 20) sit = "Em Exame";
              else if (mediaFinal < 20 && etapas.length >= 3) sit = "Reprovado";
            }

            parsedGrades.push({
              id: `qacad-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}-${parsedGrades.length + 1}`,
              disciplina: cleanName,
              codigo,
              cargaHoraria: ch,
              faltas,
              etapas,
              mediaParcial,
              mediaFinal,
              situacao: sit,
            });
          }
        }
      }
    } catch (e) {
      console.warn("[Q-Acadêmico Client Parser] Erro no parsing de tabelas DOM:", e);
    }
  }

  // 2.2 ESTRATÉGIA B: Parser de texto limpo ou tabulado (se a estratégia A não capturou disciplinas)
  if (parsedGrades.length === 0) {
    const ignoredWords = [
      "q-acadêmico", "instituto federal", "ministério da educação", "boletim escolar",
      "horário de aulas", "etapa", "méd. parcial", "exame final", "média final", "situação",
      "carga horária", "aulas dadas", "faltas", "disciplina", "turma", "matrícula", "versão",
      "página", "imprimir", "todos os direitos reservados"
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      if (ignoredWords.some((w) => lower === w || (lower.startsWith(w) && line.length < 35))) {
        continue;
      }

      const parts = line.split(/[\|\t]+/).map((p) => p.trim()).filter(Boolean);

      let discName = "";
      let candidateNumbers: number[] = [];
      let situacao: QAcademicoGradeItem["situacao"] = "Cursando";
      let ch = 60;
      let faltas = 0;

      if (parts.length >= 3) {
        discName = parts[0];
        for (let j = 1; j < parts.length; j++) {
          const val = parts[j];
          const numMatch = val.match(/^(\d{1,3}(?:[,\.]\d{1,2})?)$/);
          if (numMatch) {
            candidateNumbers.push(parseFloat(numMatch[1].replace(",", ".")));
          } else if (/aprovado/i.test(val)) {
            situacao = "Aprovado";
          } else if (/reprovado/i.test(val)) {
            situacao = "Reprovado";
          } else if (/exame/i.test(val)) {
            situacao = "Em Exame";
          } else if (/cursando/i.test(val) || /matriculado/i.test(val)) {
            situacao = "Cursando";
          }
        }
      } else {
        const numberMatches = Array.from(line.matchAll(/\b(\d{1,3}(?:[,\.]\d{1,2})?)\b/g));
        if (numberMatches.length >= 2) {
          const firstNumIndex = line.indexOf(numberMatches[0][0]);
          discName = line.substring(0, firstNumIndex).trim();
          candidateNumbers = numberMatches.map((m) => parseFloat(m[1].replace(",", ".")));

          if (/aprovad[oa]/i.test(line)) situacao = "Aprovado";
          else if (/reprovad[oa]/i.test(line)) situacao = "Reprovado";
          else if (/exame/i.test(line)) situacao = "Em Exame";
          else situacao = "Cursando";
        }
      }

      discName = discName.replace(/^[0-9]+[\.\-\s]+/g, "").trim();

      if (
        discName.length >= 3 &&
        !ignoredWords.some((w) => discName.toLowerCase() === w) &&
        !discName.toLowerCase().includes("total de faltas") &&
        !discName.toLowerCase().includes("coeficiente")
      ) {
        let normalizedScores = candidateNumbers.map((s) => (s <= 10 && candidateNumbers.every((x) => x <= 10) ? Number((s * 10).toFixed(1)) : s));

        const etapas: QAcademicoGradeItem["etapas"] = [];
        let mediaFinal: number | undefined = undefined;
        let mediaParcial: number | undefined = undefined;

        if (normalizedScores.length > 0) {
          if (normalizedScores.length >= 5 && normalizedScores[0] >= 30 && normalizedScores[0] <= 400) {
            ch = normalizedScores[0];
            faltas = normalizedScores[2] < 50 ? normalizedScores[2] : 0;
            normalizedScores = normalizedScores.slice(3);
          }

          const etapaNames = ["1ª Etapa", "2ª Etapa", "3ª Etapa", "4ª Etapa"];
          for (let e = 0; e < Math.min(4, normalizedScores.length); e++) {
            etapas.push({
              etapa: etapaNames[e],
              nota: normalizedScores[e],
              notaMax: 100,
            });
          }

          if (normalizedScores.length >= 1) {
            mediaFinal = normalizedScores[normalizedScores.length - 1];
            mediaParcial = normalizedScores[Math.max(0, normalizedScores.length - 2)] || mediaFinal;
          }
        }

        if (situacao === "Cursando" && mediaFinal !== undefined) {
          if (mediaFinal >= 60 && etapas.length >= 2) situacao = "Aprovado";
          else if (mediaFinal < 60 && mediaFinal >= 20) situacao = "Em Exame";
          else if (mediaFinal < 20 && etapas.length >= 3) situacao = "Reprovado";
        }

        const id = `qacad-${discName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}-${parsedGrades.length + 1}`;

        parsedGrades.push({
          id,
          disciplina: discName,
          codigo: `QACAD-${parsedGrades.length + 1}`,
          cargaHoraria: ch,
          faltas,
          etapas,
          mediaParcial,
          mediaFinal,
          situacao,
        });
      }
    }
  }

  // 3. Extrair Horários de Aulas (`t=2010`)
  const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const parsedSchedules: QAcademicoScheduleItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    const matchedDay = DIAS_SEMANA.find((d) =>
      lower.includes(d.toLowerCase()) ||
      lower.includes(`${d.toLowerCase()}-feira`) ||
      lower.includes(`${d.toLowerCase()} feira`)
    );

    const timeMatch = line.match(/(\d{1,2}:\d{2})\s*(?:às|-|ate|até)\s*(\d{1,2}:\d{2})/);

    if (matchedDay && timeMatch) {
      const horario = `${timeMatch[1]} - ${timeMatch[2]}`;
      let rest = line.replace(new RegExp(matchedDay, "i"), "").replace(timeMatch[0], "").replace(/^[\|\s:\-]+/, "").trim();
      const salaMatch = rest.match(/(?:sala|lab|laboratório|aud|auditório)\s*[\w\d]+/i);
      const sala = salaMatch ? salaMatch[0] : undefined;
      const disc = rest.replace(/(?:sala|lab|laboratório|aud|auditório)\s*[\w\d]+/i, "").replace(/^[\|\s:\-]+/, "").trim();

      if (disc.length > 2) {
        parsedSchedules.push({
          id: `sched-${parsedSchedules.length + 1}`,
          diaSemana: matchedDay,
          horario,
          disciplina: disc,
          sala,
        });
      }
    }
  }

  result.grades = parsedGrades;
  result.schedules = parsedSchedules;

  // 4. Mapear para disciplinas do aplicativo (`IfesCourse`)
  result.courses = parsedGrades.map((g, idx) => ({
    id: `qacad-c-${idx + 1}-${Date.now()}`,
    name: g.disciplina,
    code: g.codigo || `Q-${idx + 1}`,
    professor: g.docente || "Docente IFES",
    campus: result.account.campus || defaultCampus,
    progressPercent: g.mediaFinal ? Math.min(100, Math.round(g.mediaFinal)) : 0,
  }));

  // Mapear para horários globais do IFES (`IfesClassSchedule`)
  result.classSchedules = parsedSchedules.map((s) => ({
    dayOfWeek: s.diaSemana,
    timeSlot: s.horario,
    courseName: s.disciplina,
    room: s.sala,
    professor: s.docente,
  }));

  // 5. Estatísticas Gerais
  const total = parsedGrades.length;
  const aprovadas = parsedGrades.filter((g) => g.situacao === "Aprovado").length;
  const cursando = parsedGrades.filter((g) => g.situacao === "Cursando").length;
  const emExame = parsedGrades.filter((g) => g.situacao === "Em Exame").length;
  const reprovadas = parsedGrades.filter((g) => g.situacao === "Reprovado").length;
  const totalFaltas = parsedGrades.reduce((acc, g) => acc + (g.faltas || 0), 0);

  const medias = parsedGrades.map((g) => g.mediaFinal).filter((m): m is number => typeof m === "number");
  const mediaGeral = medias.length > 0 ? Number((medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(1)) : 0;

  result.rawStats = {
    totalDisciplinas: total,
    aprovadas,
    cursando,
    emExame,
    reprovadas,
    mediaGeral,
    totalFaltas,
    cr: result.account.coeficienteRendimento,
  };

  return result;
}
