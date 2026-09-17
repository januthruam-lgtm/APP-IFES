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
  // Estrutura Q-Acadêmico clássica: Linhas com nome de matéria, notas de etapas e situação
  const cleanedText = isHtml ? cleanHtmlText(raw) : raw;
  const lines = cleanedText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  const ignoredWords = [
    "q-acadêmico", "instituto federal", "ministério da educação", "boletim escolar",
    "horário de aulas", "etapa", "méd. parcial", "exame final", "média final", "situação",
    "carga horária", "aulas dadas", "faltas", "disciplina", "turma", "matrícula", "versão",
    "página", "imprimir", "todos os direitos reservados"
  ];

  const parsedGrades: QAcademicoGradeItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (ignoredWords.some((w) => lower === w || (lower.startsWith(w) && line.length < 35))) {
      continue;
    }

    // Procura padrão de notas: números com vírgula ou ponto (ex: 80,0  75,5  90,0 ou 8.0 7.5)
    // No Q-Acadêmico do IFES, notas normalmente vão de 0 a 100 (ou 0 a 10)
    // Linha com delimitador de coluna "|" ou múltiplos espaços
    const parts = line.split(/[\|\t]+/).map((p) => p.trim()).filter(Boolean);

    let discName = "";
    let candidateNumbers: number[] = [];
    let situacao: QAcademicoGradeItem["situacao"] = "Cursando";
    let ch = 60;
    let faltas = 0;

    if (parts.length >= 3) {
      // Formato tabular (ex: de HTML limpo ou tabela copiada com tabulações)
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
      // Formato corrido por linha única
      // Ex: "LÍNGUA PORTUGUESA II 80 80 0 75,0 80,0 85,0 90,0 82,5 Aprovado"
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

    // Limpar nome da disciplina
    discName = discName.replace(/^[0-9]+[\.\-\s]+/g, "").trim();

    if (
      discName.length >= 3 &&
      !ignoredWords.some((w) => discName.toLowerCase() === w) &&
      !discName.toLowerCase().includes("total de faltas") &&
      !discName.toLowerCase().includes("coeficiente")
    ) {
      // Normalizar notas para escala 0 a 100 se vierem em escala 0 a 10
      let normalizedScores = candidateNumbers.map((s) => (s <= 10 && candidateNumbers.every((x) => x <= 10) ? Number((s * 10).toFixed(1)) : s));

      // Extrair etapas
      const etapas: QAcademicoGradeItem["etapas"] = [];
      let mediaFinal: number | undefined = undefined;
      let mediaParcial: number | undefined = undefined;

      if (normalizedScores.length > 0) {
        // As primeiras podem ser Carga Horária e Faltas se forem inteiros típicos
        if (normalizedScores.length >= 5 && normalizedScores[0] >= 30 && normalizedScores[0] <= 400) {
          ch = normalizedScores[0];
          // Próximo pode ser aulas dadas e faltas
          faltas = normalizedScores[2] < 50 ? normalizedScores[2] : 0;
          normalizedScores = normalizedScores.slice(3);
        }

        // Atribui às etapas N1, N2, N3, N4
        const etapaNames = ["1ª Etapa", "2ª Etapa", "3ª Etapa", "4ª Etapa"];
        for (let e = 0; e < Math.min(4, normalizedScores.length); e++) {
          etapas.push({
            etapa: etapaNames[e],
            nota: normalizedScores[e],
            notaMax: 100,
          });
        }

        // Último número geralmente é a Média Final
        if (normalizedScores.length >= 1) {
          mediaFinal = normalizedScores[normalizedScores.length - 1];
          mediaParcial = normalizedScores[Math.max(0, normalizedScores.length - 2)] || mediaFinal;
        }
      }

      // Inferir situação caso ainda esteja neutro
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
    progressPercent: g.mediaFinal ? Math.min(100, Math.round(g.mediaFinal)) : 75,
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
    cr: result.account.coeficienteRendimento || mediaGeral,
  };

  return result;
}
