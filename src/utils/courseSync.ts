import { CourseTrack, IfesCourse, IfesAssignment, IfesClassSchedule, TrackModule } from "../types";
import { COURSES_CATALOG } from "../data/initialData";

export const LOCAL_STORAGE_COURSES_KEY = "brainstudio_ifes_custom_courses";
export const LOCAL_STORAGE_ASSIGNMENTS_KEY = "brainstudio_ifes_assignments";
export const LOCAL_STORAGE_SCHEDULES_KEY = "brainstudio_ifes_schedules";

// Empty defaults: only courses actually belonging to the student's real AVA IFES profile are displayed
export const DEFAULT_IFES_ADM_2ANO_COURSES: IfesCourse[] = [];
export const DEFAULT_IFES_ASSIGNMENTS: IfesAssignment[] = [];
export const DEFAULT_IFES_SCHEDULES: IfesClassSchedule[] = [];

export const isMockOrPlaceholderCourse = (c: any): boolean => {
  if (!c) return true;
  const id = String(c.id || "").toLowerCase().trim();
  const name = String(c.name || "").toLowerCase().trim();
  const code = String(c.code || "").toLowerCase().trim();

  // Known mock ID patterns
  if (
    id.startsWith("ifes-adm-") ||
    id.startsWith("em2-") ||
    id.startsWith("ti-") ||
    id.startsWith("cefor-") ||
    id.startsWith("mock-")
  ) {
    return true;
  }

  if ([
    "ifes-port2", "ifes-mat2", "ifes-fis2", "ifes-qui2", "ifes-bio2",
    "ifes-hist2", "ifes-geo2", "ifes-fil2", "ifes-soc2", "ifes-ing2",
    "ifes-edf2", "ifes-c1", "ifes-c2", "ifes-c3", "ifes-c4", "ifes-c5",
    "ifes-c6", "ifes-c12"
  ].includes(id)) {
    return true;
  }

  // Exact mock names from old default sets and presets
  const mockNames = [
    "teoria geral da administração",
    "gestão de pessoas",
    "gestão financeira",
    "gestão da produção",
    "marketing e gestão comercial",
    "contabilidade geral",
    "legislação aplicada",
    "língua portuguesa ii",
    "matemática ii",
    "física ii",
    "química ii",
    "biologia ii",
    "história ii",
    "geografia ii",
    "filosofia ii",
    "sociologia ii",
    "língua inglesa ii",
    "educação física ii",
    "programação web ii",
    "banco de dados e modelagem sql",
    "estruturas de dados",
    "redes de computadores",
    "engenharia de software",
    "lógica e linguagem de programação",
    "tecnologias digitais na educação",
    "introdução à programação em python",
    "letramento digital",
    "inteligência artificial aplicada"
  ];

  if (mockNames.some((m) => name.includes(m))) {
    return true;
  }

  const mockCodes = [
    "adm-tga", "adm-gp", "adm-fin", "adm-log", "adm-mkt", "adm-cont", "adm-dir",
    "port-ii", "mat-ii", "fis-ii", "qui-ii", "bio-ii", "hist-ii", "geo-ii",
    "fil-ii", "soc-ii", "ing-ii", "edf-ii", "inf-web2", "inf-bd", "inf-eda",
    "inf-redes", "inf-es", "inf-log", "cefor-tde", "cefor-py", "cefor-ldc", "cefor-ia"
  ];

  if (mockCodes.some((mc) => code.includes(mc))) {
    return true;
  }

  return false;
};

export const getSubjectIconEmoji = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("teoria geral") || n.includes("tga") || n.includes("gestão organizacional") || n.includes("planejamento")) return "📊";
  if (n.includes("pessoas") || n.includes("recursos humanos") || n.includes("rh") || n.includes("talentos")) return "👥";
  if (n.includes("financeira") || n.includes("finanças") || n.includes("custos") || n.includes("orçamento") || n.includes("dre")) return "💰";
  if (n.includes("produção") || n.includes("logística") || n.includes("materiais") || n.includes("estoque") || n.includes("supply")) return "📦";
  if (n.includes("marketing") || n.includes("comercial") || n.includes("vendas") || n.includes("branding") || n.includes("mercado")) return "🎯";
  if (n.includes("contabilidade") || n.includes("balanço") || n.includes("patrimônio") || n.includes("contábil")) return "📑";
  if (n.includes("legislação") || n.includes("direito empresarial") || n.includes("trabalhista") || n.includes("jurídica") || n.includes("clt")) return "⚖️";
  if (n.includes("administração") || n.includes("administracao") || n.includes("negócios")) return "💼";
  if (n.includes("português") || n.includes("portuguesa") || n.includes("literatura") || n.includes("redação")) return "📖";
  if (n.includes("matemática") || n.includes("cálculo") || n.includes("estatística")) return "📐";
  if (n.includes("física") || n.includes("eletricidade") || n.includes("termodinâmica")) return "⚡";
  if (n.includes("química") || n.includes("bioquímica")) return "🧪";
  if (n.includes("biologia") || n.includes("genética") || n.includes("ecologia")) return "🧬";
  if (n.includes("história") || n.includes("historia")) return "🏛️";
  if (n.includes("geografia") || n.includes("geopolítica")) return "🗺️";
  if (n.includes("filosofia") || n.includes("ética") || n.includes("epistemologia")) return "🏛️";
  if (n.includes("sociologia") || n.includes("ciências sociais")) return "👥";
  if (n.includes("inglês") || n.includes("inglesa") || n.includes("idioma") || n.includes("espanhol")) return "🌐";
  if (n.includes("educação física") || n.includes("saúde") || n.includes("esporte")) return "🏃";
  if (n.includes("programação") || n.includes("web") || n.includes("software") || n.includes("código") || n.includes("computador") || n.includes("informática") || n.includes("dados")) return "💻";
  return "📚";
};

export const getSubjectCategory = (name: string): string => {
  const n = name.toLowerCase();
  if (
    n.includes("administração") ||
    n.includes("tga") ||
    n.includes("pessoas") ||
    n.includes("recursos humanos") ||
    n.includes("rh") ||
    n.includes("financeira") ||
    n.includes("custos") ||
    n.includes("logística") ||
    n.includes("produção") ||
    n.includes("marketing") ||
    n.includes("contabilidade") ||
    n.includes("direito") ||
    n.includes("legislação")
  ) {
    return "Técnico em Administração IFES";
  }
  if (n.includes("português") || n.includes("inglês") || n.includes("espanhol") || n.includes("artes")) return "Linguagens & Códigos IFES";
  if (n.includes("matemática") || n.includes("cálculo") || n.includes("estatística")) return "Ciências Exatas IFES";
  if (n.includes("física") || n.includes("química") || n.includes("biologia")) return "Ciências da Natureza IFES";
  if (n.includes("história") || n.includes("geografia") || n.includes("filosofia") || n.includes("sociologia")) return "Ciências Humanas IFES";
  if (n.includes("educação física")) return "Linguagens & Saúde IFES";
  if (n.includes("programação") || n.includes("web") || n.includes("redes") || n.includes("banco") || n.includes("informática")) return "Formação Técnica IFES";
  return "Formação Geral IFES";
};

export const convertIfesCoursesToTracks = (courses: IfesCourse[]): CourseTrack[] => {
  if (!courses || courses.length === 0) {
    return [];
  }

  return courses.map((c, index) => {
    // Preserve any real modules if provided by syllabus or AVA, otherwise keep modules empty (do NOT invent fake modules)
    const realModules: TrackModule[] = Array.isArray((c as any).modules) ? (c as any).modules : [];

    return {
      id: c.id || `course-track-${index}`,
      name: c.name,
      title: c.name,
      icon: getSubjectIconEmoji(c.name),
      category: getSubjectCategory(c.name),
      description: `Disciplina oficial do IFES (${c.code || "IFES"}). Docente: ${c.professor || "Prof. IFES"}.`,
      color: "#10b981",
      accentBg: "rgba(16, 185, 129, 0.15)",
      tags: [c.name, c.code || "IFES", "Oficial IFES", (c as any).room || c.campus || "Campus IFES"],
      modules: realModules,
    };
  });
};

export const calculateCourseProgress = (
  course: CourseTrack | IfesCourse,
  completedModuleIds: number[] = []
): number => {
  if (!course) return 0;
  
  if ("modules" in course && Array.isArray(course.modules) && course.modules.length > 0) {
    const completedCount = course.modules.filter(
      (m) => m.status === "completed" || completedModuleIds.includes(m.id)
    ).length;
    return Math.round((completedCount / course.modules.length) * 100);
  }

  if ("progressPercent" in course && typeof (course as any).progressPercent === "number") {
    return (course as any).progressPercent;
  }

  return 0;
};

export const calculateOverallProgress = (
  courses: (CourseTrack | IfesCourse)[],
  completedModuleIds: number[] = []
): number => {
  if (!courses || courses.length === 0) return 0;
  
  let totalModules = 0;
  let totalCompleted = 0;

  for (const c of courses) {
    if ("modules" in c && Array.isArray(c.modules) && c.modules.length > 0) {
      totalModules += c.modules.length;
      totalCompleted += c.modules.filter(
        (m) => m.status === "completed" || completedModuleIds.includes(m.id)
      ).length;
    }
  }

  if (totalModules === 0) return 0;
  return Math.round((totalCompleted / totalModules) * 100);
};

export const deleteSingleCourse = (courseId: string): IfesCourse[] => {
  const current = loadSyncedCourses();
  const updated = current.filter((c) => c.id !== courseId && c.code !== courseId);
  saveSyncedCourses(updated);
  return updated;
};

export const loadSyncedCourses = (): IfesCourse[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COURSES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strictly filter out any mock/sample courses that don't belong to the user's real AVA profile
        const realCourses = parsed.filter((c) => !isMockOrPlaceholderCourse(c));
        if (realCourses.length !== parsed.length) {
          localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify(realCourses));
        }
        return realCourses;
      }
    }
  } catch (e) {
    console.warn("Erro ao ler matérias do localStorage:", e);
  }
  return [];
};

export const saveSyncedCourses = (courses: IfesCourse[]): void => {
  try {
    const realCourses = courses.filter((c) => !isMockOrPlaceholderCourse(c));
    localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify(realCourses));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("brainstudio:courses-updated", { detail: { courses: realCourses } }));
    }, 0);
  } catch (e) {
    console.warn("Erro ao salvar matérias no localStorage:", e);
  }
};

export const isMockOrPlaceholderAssignment = (a: any): boolean => {
  if (!a) return true;
  const id = String(a.id || "").toLowerCase();
  const courseId = String(a.courseId || "").toLowerCase();
  const title = String(a.title || "").toLowerCase();

  // Old mock assignments
  if (
    id.startsWith("assign-tga") ||
    id.startsWith("assign-fin") ||
    id.startsWith("assign-gp") ||
    id.startsWith("assign-port") ||
    id.startsWith("ifes-a1") ||
    id.startsWith("ifes-a2") ||
    id.startsWith("ifes-a3") ||
    id.startsWith("ifes-a4") ||
    id.startsWith("ifes-a5") ||
    id.startsWith("ifes-a6")
  ) {
    return true;
  }

  if (courseId.startsWith("ifes-adm-") || courseId.startsWith("em2-") || courseId.startsWith("ti-")) {
    return true;
  }

  if (
    title.includes("estudo de caso tga") ||
    title.includes("análise dre") ||
    title.includes("dinâmica de recrutamento")
  ) {
    return true;
  }

  return false;
};

/**
 * Purges any fictitious courses or assignments directly from localStorage and memory
 */
export const purgeAnyFictitiousCourses = (): { courses: IfesCourse[]; assignments: IfesAssignment[] } => {
  let cleanedCourses: IfesCourse[] = [];
  let cleanedAssignments: IfesAssignment[] = [];

  try {
    const rawC = localStorage.getItem(LOCAL_STORAGE_COURSES_KEY);
    if (rawC) {
      const parsed = JSON.parse(rawC);
      if (Array.isArray(parsed)) {
        cleanedCourses = parsed.filter((c) => !isMockOrPlaceholderCourse(c));
        localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify(cleanedCourses));
      }
    }
    localStorage.removeItem("brainstudio_ifes_courses");
  } catch (e) {
    console.warn("Erro ao purgar matérias:", e);
  }

  try {
    const rawA = localStorage.getItem(LOCAL_STORAGE_ASSIGNMENTS_KEY);
    if (rawA) {
      const parsed = JSON.parse(rawA);
      if (Array.isArray(parsed)) {
        cleanedAssignments = parsed.filter((a) => !isMockOrPlaceholderAssignment(a));
        localStorage.setItem(LOCAL_STORAGE_ASSIGNMENTS_KEY, JSON.stringify(cleanedAssignments));
      }
    }
  } catch (e) {
    console.warn("Erro ao purgar tarefas:", e);
  }

  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("brainstudio:courses-updated", { detail: { courses: cleanedCourses } }));
    window.dispatchEvent(new CustomEvent("brainstudio:assignments-updated", { detail: { assignments: cleanedAssignments } }));
  }, 0);

  return { courses: cleanedCourses, assignments: cleanedAssignments };
};

export const loadSyncedAssignments = (): IfesAssignment[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ASSIGNMENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const realAssignments = parsed.filter((a) => !isMockOrPlaceholderAssignment(a));
        if (realAssignments.length !== parsed.length) {
          localStorage.setItem(LOCAL_STORAGE_ASSIGNMENTS_KEY, JSON.stringify(realAssignments));
        }
        return realAssignments;
      }
    }
  } catch (e) {
    console.warn("Erro ao ler tarefas do localStorage:", e);
  }
  return [];
};

export const saveSyncedAssignments = (assignments: IfesAssignment[]): void => {
  try {
    const realAssignments = assignments.filter((a) => !isMockOrPlaceholderAssignment(a));
    localStorage.setItem(LOCAL_STORAGE_ASSIGNMENTS_KEY, JSON.stringify(realAssignments));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("brainstudio:assignments-updated", { detail: { assignments: realAssignments } }));
    }, 0);
  } catch (e) {
    console.warn("Erro ao salvar tarefas no localStorage:", e);
  }
};

export const loadSyncedSchedules = (): IfesClassSchedule[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SCHEDULES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Erro ao ler horários do localStorage:", e);
  }
  return [];
};

export const saveSyncedSchedules = (schedules: IfesClassSchedule[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_SCHEDULES_KEY, JSON.stringify(schedules));
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("brainstudio:schedules-updated", { detail: { schedules } }));
    }, 0);
  } catch (e) {
    console.warn("Erro ao salvar horários no localStorage:", e);
  }
};

export const clearAllSyncedAcademicData = (): void => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_COURSES_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ASSIGNMENTS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SCHEDULES_KEY);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("brainstudio:courses-updated", { detail: { courses: [] } }));
      window.dispatchEvent(new CustomEvent("brainstudio:assignments-updated", { detail: { assignments: [] } }));
      window.dispatchEvent(new CustomEvent("brainstudio:schedules-updated", { detail: { schedules: [] } }));
    }, 0);
  } catch (e) {
    console.warn("Erro ao limpar dados acadêmicos:", e);
  }
};
