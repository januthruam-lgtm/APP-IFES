import {
  IfesCourse,
  IfesAssignment,
  IfesClassSchedule,
  CourseTrack,
  TrackModule,
  LessonStep,
} from "../types";
import { filterActiveCourses } from "./courseTombstones";

export const DEFAULT_IFES_COURSES: IfesCourse[] = [
  {
    id: "ifes-tga202",
    name: "Teoria Geral da Administração II",
    code: "TGA202-CEFOR",
    professor: "Prof. Dr. Roberto Guimarães",
    campus: "Cefor / Serra",
    progressPercent: 68,
    shortname: "TGA II",
  },
  {
    id: "ifes-gp201",
    name: "Gestão de Pessoas & Comportamento Organizacional",
    code: "GP201-CEFOR",
    professor: "Profa. Dra. Mariana Siqueira",
    campus: "Cefor / Serra",
    progressPercent: 75,
    shortname: "Gestão Pessoas",
  },
  {
    id: "ifes-fin204",
    name: "Gestão Financeira e Orçamentária",
    code: "FIN204-CEFOR",
    professor: "Prof. Esp. Leonardo Ramos",
    campus: "Cefor / Serra",
    progressPercent: 55,
    shortname: "Financeira",
  },
  {
    id: "ifes-log203",
    name: "Gestão da Produção, Logística e Serviços",
    code: "LOG203-CEFOR",
    professor: "Profa. Ma. Camila Albuquerque",
    campus: "Cefor / Serra",
    progressPercent: 60,
    shortname: "Logística",
  },
  {
    id: "ifes-mkt205",
    name: "Marketing & Comunicação Empresarial",
    code: "MKT205-CEFOR",
    professor: "Profa. Dra. Juliana Silveira",
    campus: "Cefor / Serra",
    progressPercent: 82,
    shortname: "Marketing",
  },
  {
    id: "ifes-cont206",
    name: "Contabilidade Geral e Tributária",
    code: "CONT206-CEFOR",
    professor: "Prof. Dr. André Mendonça",
    campus: "Cefor / Serra",
    progressPercent: 45,
    shortname: "Contabilidade",
  },
  {
    id: "ifes-port201",
    name: "Língua Portuguesa e Literatura Aplicada II",
    code: "PORT201-CEFOR",
    professor: "Profa. Ma. Renata Valadão",
    campus: "Cefor / Serra",
    progressPercent: 70,
    shortname: "Português II",
  },
  {
    id: "ifes-inf202",
    name: "Informática Aplicada à Gestão",
    code: "INF202-CEFOR",
    professor: "Prof. Esp. Carlos Eduardo",
    campus: "Cefor / Serra",
    progressPercent: 88,
    shortname: "Informática",
  },
];

export interface IfesCurriculumPreset {
  id: string;
  name: string;
  description: string;
  campusDefault: string;
  courses: IfesCourse[];
}

export const IFES_CURRICULUM_PRESETS: IfesCurriculumPreset[] = [
  {
    id: "adm_2ano",
    name: "Técnico Integrado em Administração (2º Ano)",
    description: "Grade oficial do 2º ano de Administração no IFES Cefor / Serra",
    campusDefault: "IFES - Cefor / Campus Serra",
    courses: DEFAULT_IFES_COURSES,
  },
  {
    id: "info_integrado",
    name: "Técnico Integrado em Informática para Internet",
    description: "Grade com Programação Web, Algoritmos, Banco de Dados e Redes",
    campusDefault: "IFES - Campus Serra / Vitória",
    courses: [
      {
        id: "ifes-info-web",
        name: "Programação Web (Front-End & Back-End)",
        code: "WEB201-IFES",
        professor: "Prof. Dr. Fernando Vasconcelos",
        campus: "IFES - Campus Serra",
        progressPercent: 65,
        shortname: "Prog Web",
      },
      {
        id: "ifes-info-algo",
        name: "Algoritmos e Estrutura de Dados II",
        code: "EDD202-IFES",
        professor: "Profa. Dra. Patricia Neves",
        campus: "IFES - Campus Serra",
        progressPercent: 70,
        shortname: "Algoritmos II",
      },
      {
        id: "ifes-info-bd",
        name: "Banco de Dados I e Modelagem Relacional",
        code: "BDO203-IFES",
        professor: "Prof. Esp. Lucas Prado",
        campus: "IFES - Campus Serra",
        progressPercent: 80,
        shortname: "Banco de Dados",
      },
      {
        id: "ifes-info-redes",
        name: "Redes de Computadores e Protocolos de Internet",
        code: "RED204-IFES",
        professor: "Prof. Me. Rodrigo Meireles",
        campus: "IFES - Campus Serra",
        progressPercent: 55,
        shortname: "Redes",
      },
      {
        id: "ifes-info-engsoft",
        name: "Engenharia de Software e Metodologias Ágeis",
        code: "ESW205-IFES",
        professor: "Profa. Ma. Bianca Furtado",
        campus: "IFES - Campus Serra",
        progressPercent: 75,
        shortname: "Eng Software",
      },
      {
        id: "ifes-info-port",
        name: "Língua Portuguesa e Produção Textual II",
        code: "PORT202-IFES",
        professor: "Profa. Ma. Renata Valadão",
        campus: "IFES - Campus Serra",
        progressPercent: 68,
        shortname: "Português II",
      },
      {
        id: "ifes-info-mat",
        name: "Matemática Aplicada à Computação",
        code: "MAT202-IFES",
        professor: "Prof. Dr. Gabriel Moreira",
        campus: "IFES - Campus Serra",
        progressPercent: 60,
        shortname: "Matemática II",
      },
      {
        id: "ifes-info-fis",
        name: "Física e Circuitos Digitais",
        code: "FIS202-IFES",
        professor: "Prof. Dr. Sérgio Oliveira",
        campus: "IFES - Campus Serra",
        progressPercent: 50,
        shortname: "Física II",
      },
    ],
  },
  {
    id: "adm_1ano",
    name: "Técnico Integrado em Administração (1º Ano)",
    description: "Fundamentos de Gestão, Teoria da Administração I, Economia e Matemática Básica",
    campusDefault: "IFES - Cefor",
    courses: [
      {
        id: "ifes-tga101",
        name: "Teoria Geral da Administração I",
        code: "TGA101-CEFOR",
        professor: "Prof. Dr. Roberto Guimarães",
        campus: "IFES - Cefor",
        progressPercent: 80,
        shortname: "TGA I",
      },
      {
        id: "ifes-econ101",
        name: "Introdução à Economia e Mercados",
        code: "ECO101-CEFOR",
        professor: "Profa. Dra. Letícia Fontes",
        campus: "IFES - Cefor",
        progressPercent: 65,
        shortname: "Economia",
      },
      {
        id: "ifes-mat101",
        name: "Matemática Básica e Financeira I",
        code: "MAT101-CEFOR",
        professor: "Prof. Me. Fábio Antunes",
        campus: "IFES - Cefor",
        progressPercent: 70,
        shortname: "Matemática I",
      },
      {
        id: "ifes-port101",
        name: "Língua Portuguesa e Literatura I",
        code: "PORT101-CEFOR",
        professor: "Profa. Ma. Renata Valadão",
        campus: "IFES - Cefor",
        progressPercent: 85,
        shortname: "Português I",
      },
      {
        id: "ifes-inf101",
        name: "Informática Básica e Ferramentas Digitais",
        code: "INF101-CEFOR",
        professor: "Prof. Esp. Carlos Eduardo",
        campus: "IFES - Cefor",
        progressPercent: 90,
        shortname: "Informática I",
      },
      {
        id: "ifes-met101",
        name: "Metodologia do Trabalho Científico",
        code: "MET101-CEFOR",
        professor: "Profa. Dra. Mariana Siqueira",
        campus: "IFES - Cefor",
        progressPercent: 75,
        shortname: "Metodologia",
      },
    ],
  },
  {
    id: "eletro_integrado",
    name: "Técnico Integrado em Eletrotécnica",
    description: "Grade com Circuitos Elétricos, Eletrônica, Máquinas e Instalações",
    campusDefault: "IFES - Campus Vitória",
    courses: [
      {
        id: "ifes-elet-circ",
        name: "Circuitos Elétricos e Medidas",
        code: "ELET201-IFES",
        professor: "Prof. Dr. Marcos Vinícius",
        campus: "IFES - Campus Vitória",
        progressPercent: 60,
        shortname: "Circuitos",
      },
      {
        id: "ifes-elet-eletr",
        name: "Eletrônica Analógica e de Potência",
        code: "ELET202-IFES",
        professor: "Prof. Me. Cláudio Brandão",
        campus: "IFES - Campus Vitória",
        progressPercent: 70,
        shortname: "Eletrônica",
      },
      {
        id: "ifes-elet-instal",
        name: "Instalações Elétricas Prediais e Industriais",
        code: "ELET203-IFES",
        professor: "Prof. Esp. Rogério Dias",
        campus: "IFES - Campus Vitória",
        progressPercent: 65,
        shortname: "Instalações",
      },
      {
        id: "ifes-elet-maq",
        name: "Máquinas Elétricas e Acionamentos",
        code: "ELET204-IFES",
        professor: "Prof. Dr. Wagner Santos",
        campus: "IFES - Campus Vitória",
        progressPercent: 55,
        shortname: "Máquinas",
      },
      {
        id: "ifes-elet-seg",
        name: "Segurança no Trabalho e Normas NR-10",
        code: "SEG201-IFES",
        professor: "Profa. Ma. Danielle Peçanha",
        campus: "IFES - Campus Vitória",
        progressPercent: 85,
        shortname: "Segurança",
      },
      {
        id: "ifes-elet-mat",
        name: "Matemática Aplicada e Cálculo Básico",
        code: "MAT201-IFES",
        professor: "Prof. Dr. Roberto Almeida",
        campus: "IFES - Campus Vitória",
        progressPercent: 50,
        shortname: "Matemática",
      },
    ],
  },
  {
    id: "ensino_medio_geral",
    name: "Ensino Médio Integrado Geral (Base Comum IFES)",
    description: "Disciplinas regulares da Base Nacional Comum Curricular do IFES",
    campusDefault: "IFES - Geral",
    courses: [
      {
        id: "ifes-em-port",
        name: "Língua Portuguesa e Literatura Brasileira",
        code: "PORT-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 70,
        shortname: "Português",
      },
      {
        id: "ifes-em-mat",
        name: "Matemática e Suas Tecnologias",
        code: "MAT-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 65,
        shortname: "Matemática",
      },
      {
        id: "ifes-em-fis",
        name: "Física Geral e Experimental",
        code: "FIS-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 55,
        shortname: "Física",
      },
      {
        id: "ifes-em-qui",
        name: "Química Geral e Experimental",
        code: "QUI-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 60,
        shortname: "Química",
      },
      {
        id: "ifes-em-bio",
        name: "Biologia e Ciências da Natureza",
        code: "BIO-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 75,
        shortname: "Biologia",
      },
      {
        id: "ifes-em-hist",
        name: "História Geral e do Brasil",
        code: "HIST-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 80,
        shortname: "História",
      },
      {
        id: "ifes-em-geo",
        name: "Geografia e Geopolítica",
        code: "GEO-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 70,
        shortname: "Geografia",
      },
      {
        id: "ifes-em-filo",
        name: "Filosofia e Ética",
        code: "FIL-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 85,
        shortname: "Filosofia",
      },
      {
        id: "ifes-em-socio",
        name: "Sociologia e Cidadania",
        code: "SOC-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 80,
        shortname: "Sociologia",
      },
      {
        id: "ifes-em-ing",
        name: "Língua Inglesa Instrumental",
        code: "ING-EM",
        professor: "Corpo Docente IFES",
        campus: "IFES",
        progressPercent: 90,
        shortname: "Inglês",
      },
    ],
  },
  {
    id: "ads_graduacao",
    name: "Graduação - Análise e Desenvolvimento de Sistemas (ADS)",
    description: "Grade superior em Computação e Desenvolvimento de Sistemas",
    campusDefault: "IFES - Campus Serra",
    courses: [
      {
        id: "ifes-ads-poo",
        name: "Programação Orientada a Objetos",
        code: "ADS201-IFES",
        professor: "Prof. Dr. Hélio Castilho",
        campus: "IFES - Campus Serra",
        progressPercent: 65,
        shortname: "POO",
      },
      {
        id: "ifes-ads-banco",
        name: "Banco de Dados Avançado e NoSQL",
        code: "ADS202-IFES",
        professor: "Profa. Dra. Tatiana Silveira",
        campus: "IFES - Campus Serra",
        progressPercent: 75,
        shortname: "BD Avançado",
      },
      {
        id: "ifes-ads-es",
        name: "Engenharia de Requisitos e Modelagem",
        code: "ADS203-IFES",
        professor: "Prof. Me. André Luiz",
        campus: "IFES - Campus Serra",
        progressPercent: 70,
        shortname: "Eng Requisitos",
      },
      {
        id: "ifes-ads-web",
        name: "Desenvolvimento Web Full-Stack",
        code: "ADS204-IFES",
        professor: "Prof. Esp. Bruno Ferreira",
        campus: "IFES - Campus Serra",
        progressPercent: 85,
        shortname: "Web Full-Stack",
      },
      {
        id: "ifes-ads-so",
        name: "Sistemas Operacionais e Virtualização",
        code: "ADS205-IFES",
        professor: "Prof. Dr. Valmir Prado",
        campus: "IFES - Campus Serra",
        progressPercent: 55,
        shortname: "Sistemas Operacionais",
      },
    ],
  },
];

/**
 * Intelligent Client-Side Extractor for Text Copied from AVA IFES (Moodle)
 * Cleans out Moodle navigational junk and extracts real enrolled course names.
 */
export function extractCoursesFromAvaText(rawText: string, campusName = "IFES - AVA"): IfesCourse[] {
  if (!rawText || typeof rawText !== "string") return [];

  const noiseBlacklist = new Set([
    "página inicial",
    "painel",
    "meus cursos",
    "linha do tempo",
    "filtrar por",
    "ordem alfabética",
    "cartão",
    "lista",
    "resumo",
    "concluído",
    "em andamento",
    "futuros",
    "passados",
    "favoritos",
    "ocultos da visualização",
    "acessar",
    "visualizar",
    "administração",
    "mensagens",
    "notas",
    "preferências",
    "sair",
    "todos os cursos",
    "perfil",
    "detalhes do curso",
    "visão geral dos cursos",
    "participantes",
    "emblemas",
    "competências",
    "avaliações",
  ]);

  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      if (l.length < 3 || l.length > 120) return false;
      const lower = l.toLowerCase();
      if (noiseBlacklist.has(lower)) return false;
      if (lower.startsWith("http://") || lower.startsWith("https://")) return false;
      if (/^\d{1,3}%$/.test(l)) return false; // "75%"
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(l)) return false; // dates
      return true;
    });

  // Deduplicate preserving casing
  const uniqueNames: string[] = [];
  const seenLower = new Set<string>();

  for (const line of lines) {
    const cleanName = line.replace(/^(disciplina:|curso:|matéria:|componente curricular:)/i, "").trim();
    const lower = cleanName.toLowerCase();
    if (!seenLower.has(lower) && cleanName.length >= 4) {
      seenLower.add(lower);
      uniqueNames.push(cleanName);
    }
  }

  // Create authentic course objects
  return uniqueNames.slice(0, 18).map((name, idx) => {
    // Generate clean sigla code
    const words = name.split(/\s+/).filter((w) => w.length > 2 && !["dos", "das", "para", "com", "que"].includes(w.toLowerCase()));
    const sigla = words.slice(0, 3).map((w) => w[0].toUpperCase()).join("") || `DISC-${idx + 1}`;

    return {
      id: `ifes-custom-${idx}-${Date.now()}`,
      name: name,
      code: `${sigla}${idx + 1}-IFES`,
      professor: "Corpo Docente IFES",
      campus: campusName,
      progressPercent: 40 + (idx % 6) * 10,
      shortname: name.length > 18 ? name.slice(0, 18) + "..." : name,
    };
  });
}


export const DEFAULT_IFES_ASSIGNMENTS: IfesAssignment[] = [
  {
    id: "ass-1",
    courseId: "ifes-tga202",
    courseName: "Teoria Geral da Administração II",
    title: "Estudo de Caso: Aplicação dos Princípios de Fayol e Teoria Neoclássica",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    description: "Análise crítica sobre unidade de comando e divisão do trabalho em organizações contemporâneas.",
    status: "urgent",
    type: "tarefa",
    weight: "10 pts",
  },
  {
    id: "ass-2",
    courseId: "ifes-gp201",
    courseName: "Gestão de Pessoas & Comportamento Organizacional",
    title: "Pesquisa de Clima Organizacional e Motivação no Setor Público",
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
    description: "Desenvolvimento de instrumento de pesquisa avaliando liderança, engajamento e comunicação interna.",
    status: "pending",
    type: "projeto",
    weight: "15 pts",
  },
  {
    id: "ass-3",
    courseId: "ifes-log203",
    courseName: "Gestão da Produção, Logística e Serviços",
    title: "Mapeamento de Processo com Ciclo PDCA e Diagrama de Ishikawa",
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    description: "Montagem do Diagrama de Ishikawa identificando os 6Ms em um caso de gargalo produtivo logístico.",
    status: "pending",
    type: "tarefa",
    weight: "20 pts",
  },
  {
    id: "ass-4",
    courseId: "ifes-fin204",
    courseName: "Gestão Financeira e Orçamentária",
    title: "Exercício Prático: Ponto de Equilíbrio e Demonstração de Resultados (DRE)",
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split("T")[0],
    description: "Cálculo de margem de contribuição, custos fixos e variáveis em planilha orçamentária.",
    status: "pending",
    type: "tarefa",
    weight: "15 pts",
  },
  {
    id: "ass-5",
    courseId: "ifes-port201",
    courseName: "Língua Portuguesa e Literatura Aplicada II",
    title: "Fórum Temático: A Ética na Escrita de Relatórios e Pareceres Técnicos",
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
    description: "Intervenção obrigatória no fórum do AVA Moodle com pelo menos duas réplicas a colegas.",
    status: "submitted",
    type: "forum",
    weight: "5 pts",
  },
];

export const DEFAULT_IFES_SCHEDULES: IfesClassSchedule[] = [
  {
    dayOfWeek: "Segunda-feira",
    timeSlot: "07:30 - 09:10",
    courseName: "Teorias da Administração & Organizações",
    room: "Sala 204 - Bloco A",
    professor: "Prof. Dr. Roberto Guimarães",
  },
  {
    dayOfWeek: "Segunda-feira",
    timeSlot: "09:30 - 11:10",
    courseName: "Comunicação Técnica e Científica",
    room: "Sala 102 - Bloco B",
    professor: "Prof. Esp. Leonardo Ramos",
  },
  {
    dayOfWeek: "Quarta-feira",
    timeSlot: "13:30 - 16:00",
    courseName: "Algoritmos e Lógica de Programação",
    room: "Laboratório de Informática 3",
    professor: "Profa. Ma. Camila Albuquerque",
  },
  {
    dayOfWeek: "Quinta-feira",
    timeSlot: "08:20 - 10:00",
    courseName: "Gestão da Qualidade e Produtividade",
    room: "Auditório Setorial",
    professor: "Profa. Dra. Juliana Silveira",
  },
];

const STORAGE_KEYS = {
  COURSES: "brain_studio_ifes_courses_v2",
  ASSIGNMENTS: "brain_studio_ifes_assignments_v2",
  SCHEDULES: "brain_studio_ifes_schedules_v2",
};

const MOCK_CODES = new Set([
  "TGA202-CEFOR",
  "GP201-CEFOR",
  "FIN204-CEFOR",
  "LOG203-CEFOR",
  "MKT205-CEFOR",
  "CONT206-CEFOR",
  "PORT201-CEFOR",
  "INF202-CEFOR",
]);

export function isMockOrPlaceholderCourse(course: IfesCourse): boolean {
  if (!course || !course.name) return true;
  const name = course.name.toLowerCase().trim();
  return (
    name.includes("placeholder") ||
    name === "exemplo" ||
    name === "matéria de teste" ||
    name === "mock"
  );
}

export function loadSyncedCourses(): IfesCourse[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (saved) {
      const parsed: IfesCourse[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const clean = filterActiveCourses(parsed.filter((c) => !isMockOrPlaceholderCourse(c)));
        if (clean.length > 0) {
          return clean;
        }
      }
    }
  } catch (e) {
    console.warn("Failed to load courses from storage:", e);
  }
  return [];
}

export function saveSyncedCourses(courses: IfesCourse[]): void {
  try {
    const clean = (courses || []).filter((c) => !isMockOrPlaceholderCourse(c));
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(clean));
  } catch (e) {
    console.warn("Failed to save courses:", e);
  }
}

export function loadSyncedAssignments(): IfesAssignment[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (a: any) =>
            !a.courseId?.includes("tga202") &&
            !a.courseId?.includes("gp201") &&
            !a.courseName?.includes("Teoria Geral da Administração")
        );
      }
    }
  } catch (e) {
    console.warn("Failed to load assignments from storage:", e);
  }
  return [];
}

export function saveSyncedAssignments(assignments: IfesAssignment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  } catch (e) {
    console.warn("Failed to save assignments:", e);
  }
}

export function loadSyncedSchedules(): IfesClassSchedule[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load schedules from storage:", e);
  }
  return [];
}

export function saveSyncedSchedules(schedules: IfesClassSchedule[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  } catch (e) {
    console.warn("Failed to save schedules:", e);
  }
}

export function clearAllSyncedAcademicData(): void {
  localStorage.removeItem(STORAGE_KEYS.COURSES);
  localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
}

export function purgeAnyFictitiousCourses(): { courses: IfesCourse[] } {
  const current = loadSyncedCourses();
  const cleaned = current.filter((c) => !isMockOrPlaceholderCourse(c));
  saveSyncedCourses(cleaned);
  return { courses: cleaned };
}

function generateDefaultModulesForCourse(course: IfesCourse): TrackModule[] {
  const modTitles = [
    {
      title: "Introdução e Visão Geral da Matéria",
      subtitle: `Visão geral de ${course.name} e terminologia técnica`,
      summary: `Neste módulo introdutório, exploramos o escopo, os objetivos principais e a estrutura de tópicos de ${course.name}.`,
      concepts: ["Origens históricas", "Princípios basilares", "Aplicações práticas no mercado"],
    },
    {
      title: "Métodos de Análise e Instrumentalização",
      subtitle: "Ferramentas práticas e resolução de problemas estruturados",
      summary: `Aprofundamento técnico em métodos quantitativos e qualitativos aplicados a ${course.name}.`,
      concepts: ["Matriz de decisão", "Mapeamento sistemático", "Diagnóstico situacional"],
    },
    {
      title: "Estudos de Caso e Aplicação Integrada",
      subtitle: "Projetos reais e desafios multidisciplinares",
      summary: "Consolidação dos conhecimentos em cenários reais do mercado de trabalho capixaba e brasileiro.",
      concepts: ["Benchmarking", "Resolução de incidentes", "Relatório técnico conclusivo"],
    },
  ];

  return modTitles.map((item, idx) => {
    const moduleId = Math.abs(course.id.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0) + idx);
    const lessons: LessonStep[] = [
      {
        id: `step-${moduleId}-1`,
        title: "Abertura Reflexiva e Contexto",
        conceptText: `Compreender o papel de ${course.name} exige examinar o problema que ela veio solucionar. Na prática profissional, entender o porquê de cada processo previne erros sistêmicos.`,
        socraticPrompt: `Se você tivesse que explicar para um colega por que ${course.name} é crucial para o seu curso, qual exemplo real você usaria?`,
        quizQuestion: {
          question: `Qual é o objetivo primordial dos conceitos abordados em ${item.title}?`,
          options: [
            "Garantir a consistência teórica e a aplicação prática orientada a resultados mensuráveis.",
            "Apenas cumprir a grade curricular sem reflexão prática.",
            "Substituir totalmente a tomada de decisão humana por regras rígidas.",
            "Ignorar o contexto do ecossistema produtivo.",
          ],
          correctIndex: 0,
          explanation: "O domínio conceitual fornece a fundação necessária para tomar decisões sólidas em cenários incertos.",
        },
      },
      {
        id: `step-${moduleId}-2`,
        title: "Maiêutica Prática e Análise Crítica",
        conceptText: `Aprofundando os conceitos de ${item.concepts[1] || "análise estruturada"}, observamos como variáveis interdependentes influenciam a eficiência e o alcance de metas.`,
        socraticPrompt: `Diante de um conflito entre prazos curtos e máxima qualidade, quais critérios você ponderaria antes de agir?`,
        quizQuestion: {
          question: `Ao aplicar as diretrizes de ${item.title}, qual conduta assegura o melhor aproveitamento?`,
          options: [
            "Diagnosticar a causa raiz antes de implementar medidas corretivas.",
            "Aplicar soluções genéricas sem avaliar os requisitos específicos.",
            "Descartar dados históricos do processo.",
            "Centralizar todas as tarefas sem comunicação com a equipe.",
          ],
          correctIndex: 0,
          explanation: "O diagnóstico da causa raiz é a chave metodológica para intervenções efetivas e duradouras.",
        },
      },
    ];

    return {
      id: moduleId,
      title: item.title,
      subtitle: item.subtitle,
      category: course.campus || "IFES",
      status: idx === 0 ? "active" : "locked",
      xpReward: 60 + idx * 20,
      estimatedMinutes: 20 + idx * 5,
      summary: item.summary,
      keyConcepts: item.concepts,
      lessons,
    };
  });
}

export function convertIfesCoursesToTracks(courses: IfesCourse[]): CourseTrack[] {
  const palette = [
    { color: "#15803d", accent: "rgba(21, 128, 61, 0.15)", icon: "🌱" },
    { color: "#2563eb", accent: "rgba(37, 99, 235, 0.15)", icon: "💻" },
    { color: "#d97706", accent: "rgba(217, 119, 6, 0.15)", icon: "⚡" },
    { color: "#7c3aed", accent: "rgba(124, 58, 237, 0.15)", icon: "🔬" },
    { color: "#0891b2", accent: "rgba(8, 145, 178, 0.15)", icon: "📊" },
  ];

  return courses.map((course, idx) => {
    const style = palette[idx % palette.length];
    return {
      id: course.id,
      title: course.name,
      name: course.name,
      icon: style.icon,
      category: `Campus ${course.campus || "IFES"}`,
      description: `Disciplina acadêmica oficial ministrada por ${course.professor || "corpo docente do IFES"}.`,
      color: style.color,
      accentBg: style.accent,
      tags: [course.code || "IFES", course.campus || "Espírito Santo", "Moodle AVA"],
      modules: generateDefaultModulesForCourse(course),
    };
  });
}

export function calculateCourseProgress(
  courseOrId: string | CourseTrack | IfesCourse,
  assignmentsOrModules?: IfesAssignment[] | number[]
): number {
  if (
    typeof courseOrId !== "string" &&
    "progressPercent" in courseOrId &&
    typeof courseOrId.progressPercent === "number"
  ) {
    return courseOrId.progressPercent;
  }

  const courseId = typeof courseOrId === "string" ? courseOrId : courseOrId.id;

  if (Array.isArray(assignmentsOrModules) && assignmentsOrModules.length > 0 && typeof assignmentsOrModules[0] === "number") {
    const completedIds = assignmentsOrModules as number[];
    if (typeof courseOrId !== "string" && "modules" in courseOrId && Array.isArray(courseOrId.modules)) {
      const courseModIds = courseOrId.modules.map((m) => m.id);
      if (courseModIds.length === 0) return 0;
      const count = courseModIds.filter((id) => completedIds.includes(id)).length;
      return Math.round((count / courseModIds.length) * 100);
    }
    return Math.min(100, completedIds.length * 25);
  }

  const assignments = (assignmentsOrModules as IfesAssignment[]) || [];
  const courseAssignments = assignments.filter((a) => a.courseId === courseId);
  if (courseAssignments.length === 0) return 40;
  const completed = courseAssignments.filter((a) => a.status === "submitted" || a.status === "graded").length;
  return Math.round((completed / courseAssignments.length) * 100);
}

export function calculateOverallProgress(
  courses: (CourseTrack | IfesCourse)[],
  assignmentsOrCompleted?: IfesAssignment[] | number[]
): number {
  if (!courses || courses.length === 0) return 0;
  let total = 0;
  for (const c of courses) {
    const p = calculateCourseProgress(c, assignmentsOrCompleted);
    total += p;
  }
  return Math.round(total / courses.length);
}

/* ==========================================================================
 *  SISTEMA AVANÇADO DE LOGS DE DIAGNÓSTICO E SINCRONIZAÇÃO DO AVA IFES
 * ========================================================================== */

export interface SyncLogEntry {
  id: string;
  timestamp: string; // HH:mm:ss.SSS
  isoTime: string;
  level: "info" | "warn" | "error" | "success";
  step: "init" | "network" | "auth" | "moodle_api" | "parser" | "storage" | "summary";
  message: string;
  details?: string;
}

const STORAGE_DIAGNOSTIC_LOGS = "brain_studio_sync_diagnostics_v2";
const logListeners = new Set<(logs: SyncLogEntry[]) => void>();

let inMemoryLogs: SyncLogEntry[] = (() => {
  try {
    const saved = sessionStorage.getItem(STORAGE_DIAGNOSTIC_LOGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
})();

function formatTimeWithMs(date: Date = new Date()): string {
  const pad = (n: number, z = 2) => String(n).padStart(z, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
}

export function getSyncDiagnosticLogs(): SyncLogEntry[] {
  return [...inMemoryLogs];
}

export function clearSyncDiagnosticLogs(): void {
  inMemoryLogs = [];
  try {
    sessionStorage.removeItem(STORAGE_DIAGNOSTIC_LOGS);
  } catch {}
  notifyLogListeners();
}

function notifyLogListeners(): void {
  const copy = [...inMemoryLogs];
  logListeners.forEach((fn) => {
    try {
      fn(copy);
    } catch {}
  });
}

export function subscribeSyncDiagnosticLogs(callback: (logs: SyncLogEntry[]) => void): () => void {
  logListeners.add(callback);
  callback([...inMemoryLogs]);
  return () => {
    logListeners.delete(callback);
  };
}

export function addSyncDiagnosticLog(
  level: SyncLogEntry["level"],
  step: SyncLogEntry["step"],
  message: string,
  details?: any
): SyncLogEntry {
  const now = new Date();
  let formattedDetails: string | undefined = undefined;
  if (details !== undefined) {
    if (typeof details === "string") {
      formattedDetails = details;
    } else if (details instanceof Error) {
      formattedDetails = `${details.name}: ${details.message}\n${details.stack || ""}`;
    } else {
      try {
        formattedDetails = JSON.stringify(details, null, 2);
      } catch {
        formattedDetails = String(details);
      }
    }
  }

  const entry: SyncLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: formatTimeWithMs(now),
    isoTime: now.toISOString(),
    level,
    step,
    message,
    details: formattedDetails,
  };

  // Keep up to 300 entries
  inMemoryLogs = [...inMemoryLogs.slice(-299), entry];

  try {
    sessionStorage.setItem(STORAGE_DIAGNOSTIC_LOGS, JSON.stringify(inMemoryLogs));
  } catch {}

  // Console output formatado para inspeção técnica
  const prefix = `[AVA Sync][${entry.step.toUpperCase()}]`;
  if (level === "error") {
    console.error(prefix, message, formattedDetails || "");
  } else if (level === "warn") {
    console.warn(prefix, message, formattedDetails || "");
  } else {
    console.log(prefix, message, formattedDetails || "");
  }

  notifyLogListeners();
  return entry;
}

export function exportSyncLogsAsText(): string {
  const logs = getSyncDiagnosticLogs();
  if (logs.length === 0) return "Nenhum log de sincronização registrado.";

  return logs
    .map(
      (l) =>
        `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.step}] ${l.message}${
          l.details ? `\n   Detalhes: ${l.details.replace(/\n/g, "\n   ")}` : ""
        }`
    )
    .join("\n");
}

export interface SyncMoodleParams {
  campusUrl?: string;
  campusName?: string;
  username?: string;
  password?: string;
  token?: string;
  uid?: string;
  existingCourses?: IfesCourse[];
}

export interface SyncMoodleResult {
  success: boolean;
  courses: IfesCourse[];
  assignments: IfesAssignment[];
  account?: any;
  error?: string;
  logs: SyncLogEntry[];
  summary: string;
}

/**
 * Função Centralizada de Sincronização com Registro Detalhado de Diagnóstico (Moodle AVA IFES).
 * Captura e documenta minuciosamente cada requisição de rede, etapas de autenticação,
 * extração de dados e eventuais erros HTTP/sessão.
 */
export async function syncIfesMoodleCoursesWithDiagnostics(
  params: SyncMoodleParams = {}
): Promise<SyncMoodleResult> {
  const targetCampusUrl = (params.campusUrl || "https://ava3.cefor.ifes.edu.br").trim().replace(/\/+$/, "");
  const targetCampusName = (params.campusName || "IFES - Cefor (AVA3)").trim();
  const username = (params.username || "").trim();
  const hasPassword = Boolean(params.password && params.password.length > 0);
  const hasToken = Boolean(params.token && params.token.length > 0);

  addSyncDiagnosticLog(
    "info",
    "init",
    `Iniciando rotina de diagnóstico e sincronização com o AVA IFES.`,
    {
      campusUrl: targetCampusUrl,
      campusName: targetCampusName,
      username: username ? `${username.slice(0, 4)}***` : "(não informado)",
      hasPassword,
      hasToken,
      existingCoursesCount: params.existingCourses?.length || 0,
    }
  );

  // 1. Diagnóstico de Rede & Conectividade com o Host do AVA IFES
  addSyncDiagnosticLog("info", "network", `Testando conectividade e latência com ${targetCampusUrl}...`);
  try {
    const pingStart = performance.now();
    const pingRes = await fetch(`/api/ava/ping?campusUrl=${encodeURIComponent(targetCampusUrl)}`);
    const pingLatency = Math.round(performance.now() - pingStart);

    if (pingRes.ok) {
      const pingData = await pingRes.json();
      addSyncDiagnosticLog(
        "success",
        "network",
        `Conexão de rede estabelecida com sucesso. Latência de resposta: ${pingData.latencyMs || pingLatency} ms.`,
        pingData
      );
    } else {
      addSyncDiagnosticLog(
        "warn",
        "network",
        `Aviso: O endpoint de verificação retornou status HTTP ${pingRes.status}. Tentando prosseguir com a requisição principal.`
      );
    }
  } catch (netErr: any) {
    addSyncDiagnosticLog(
      "warn",
      "network",
      `Alerta de rede: Teste prévio de ping falhou (${netErr?.message || netErr}). Prosseguindo com o fluxo direto.`,
      netErr
    );
  }

  // 2. Verificação preliminar de credenciais
  if (!username) {
    const errDesc = "Nenhuma matrícula institucional foi informada para autenticação no AVA IFES.";
    addSyncDiagnosticLog("error", "auth", errDesc);
    const result: SyncMoodleResult = {
      success: false,
      courses: params.existingCourses || loadSyncedCourses(),
      assignments: loadSyncedAssignments(),
      error: errDesc,
      logs: getSyncDiagnosticLogs(),
      summary: "Falha na sincronização: informe sua matrícula e senha institucional do AVA IFES.",
    };
    return result;
  }

  // 3. Chamada da API de Sincronização /api/ava/sync
  addSyncDiagnosticLog(
    "info",
    "auth",
    `Enviando solicitação de sincronização institucional para /api/ava/sync com o perfil do AVA IFES...`
  );

  let syncRes: Response;
  try {
    syncRes = await fetch("/api/ava/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campusUrl: targetCampusUrl,
        campusName: targetCampusName,
        username,
        studentId: username,
        password: params.password,
        token: params.token,
        existingCourses: params.existingCourses || loadSyncedCourses(),
      }),
    });
  } catch (fetchErr: any) {
    const errText = `Erro crítico de rede ao contactar a API de sincronização: ${fetchErr?.message || "Falha na conexão"}`;
    addSyncDiagnosticLog("error", "network", errText, fetchErr);
    return {
      success: false,
      courses: params.existingCourses || loadSyncedCourses(),
      assignments: loadSyncedAssignments(),
      error: errText,
      logs: getSyncDiagnosticLogs(),
      summary: "Erro de conexão de rede ao comunicar com o servidor. Verifique sua conexão com a internet.",
    };
  }

  addSyncDiagnosticLog(
    "info",
    "auth",
    `Resposta HTTP recebida da API de sincronização: Status ${syncRes.status} (${syncRes.statusText})`
  );

  let syncData: any;
  try {
    syncData = await syncRes.json();
  } catch (jsonErr: any) {
    const parseErr = `Não foi possível interpretar a resposta JSON do servidor: ${jsonErr?.message}`;
    addSyncDiagnosticLog("error", "parser", parseErr, jsonErr);
    return {
      success: false,
      courses: params.existingCourses || loadSyncedCourses(),
      assignments: loadSyncedAssignments(),
      error: parseErr,
      logs: getSyncDiagnosticLogs(),
      summary: "Resposta inesperada do servidor do AVA. Tente novamente em instantes.",
    };
  }

  // 4. Análise do resultado da sincronização
  if (!syncRes.ok || syncData?.success === false) {
    const failureReason =
      syncData?.error ||
      `Falha na sincronização do AVA (Código HTTP ${syncRes.status}). Verifique se sua matrícula e senha estão corretas.`;
    addSyncDiagnosticLog("error", "auth", `Falha de autenticação/acesso no Moodle: ${failureReason}`, syncData);

    return {
      success: false,
      courses: params.existingCourses || loadSyncedCourses(),
      assignments: loadSyncedAssignments(),
      error: failureReason,
      logs: getSyncDiagnosticLogs(),
      summary: `Falha na autenticação: ${failureReason}`,
    };
  }

  // 5. Tratamento e Validação das Disciplinas Extraídas
  addSyncDiagnosticLog(
    "info",
    "moodle_api",
    `Payload recebido com sucesso. Processando disciplinas retornadas pelo perfil Moodle...`
  );

  const rawCourses: any[] = Array.isArray(syncData.courses) ? syncData.courses : [];
  addSyncDiagnosticLog(
    "info",
    "parser",
    `Disciplinas brutas encontradas no retorno: ${rawCourses.length}`
  );

  // Filtragem contra placeholders/mocks fictícios
  const authenticCourses: IfesCourse[] = rawCourses.filter((c) => !isMockOrPlaceholderCourse(c));

  for (const c of authenticCourses) {
    addSyncDiagnosticLog(
      "info",
      "parser",
      `Matéria validada: "${c.name}" (Código: ${c.code || "S/N"} | ID Moodle: ${c.moodleId || c.id})`
    );
  }

  if (authenticCourses.length === 0) {
    addSyncDiagnosticLog(
      "warn",
      "parser",
      `Aviso: O AVA IFES respondeu com sucesso à autenticação, porém nenhuma disciplina ativa foi encontrada nas páginas "/my/", "/my/courses.php" ou no perfil do usuário.`
    );
  } else {
    addSyncDiagnosticLog(
      "success",
      "parser",
      `Total de ${authenticCourses.length} disciplina(s) acadêmica(s) reais do seu perfil IFES extraídas com sucesso!`
    );
  }

  // 6. Tratamento das Atividades e Prazos
  const rawAssignments: any[] = Array.isArray(syncData.assignments) ? syncData.assignments : [];
  const authenticAssignments: IfesAssignment[] = rawAssignments;
  addSyncDiagnosticLog(
    "info",
    "moodle_api",
    `Atividades avaliativas / eventos de calendário identificados: ${authenticAssignments.length}`
  );

  // 7. Persistência Local Segura
  try {
    saveSyncedCourses(authenticCourses);
    saveSyncedAssignments(authenticAssignments);
    addSyncDiagnosticLog(
      "success",
      "storage",
      `Disciplinas e atividades salvas com sucesso no armazenamento local (localStorage).`
    );
  } catch (storageErr: any) {
    addSyncDiagnosticLog(
      "warn",
      "storage",
      `Aviso ao salvar no armazenamento local: ${storageErr?.message || storageErr}`
    );
  }

  const summary = authenticCourses.length > 0
    ? `Sincronização concluída com êxito! ${authenticCourses.length} matéria(s) e ${authenticAssignments.length} atividade(s) reais importadas diretamente do AVA IFES.`
    : `Autenticação bem-sucedida no AVA IFES, mas nenhuma matrícula ativa foi retornada no momento.`;

  addSyncDiagnosticLog("success", "summary", summary);

  return {
    success: true,
    courses: authenticCourses,
    assignments: authenticAssignments,
    account: syncData.account,
    logs: getSyncDiagnosticLogs(),
    summary,
  };
}
