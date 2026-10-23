/**
 * Brain Studio - Mapeamento de Níveis de Ensino e Períodos Acadêmicos (Fase 7)
 * Adaptação por país (Brasil, Portugal, EUA e Internacional).
 */

export interface NivelEnsino {
  id: string;
  nome: string;
  descricao?: string;
  sugestoesSeries?: string[];
}

export interface PeriodoAcademicoConfig {
  id: "bimestre" | "trimestre" | "semestre" | "quadrimestre" | "anual";
  nome: string;
  divisoesPorAno: number;
  rotulosPadrao: string[];
}

export const PERIODOS_ACADEMICOS: Readonly<Record<string, PeriodoAcademicoConfig>> = Object.freeze({
  bimestre: {
    id: "bimestre",
    nome: "Bimestral (4 bimestres)",
    divisoesPorAno: 4,
    rotulosPadrao: ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"],
  },
  trimestre: {
    id: "trimestre",
    nome: "Trimestral (3 trimestres)",
    divisoesPorAno: 3,
    rotulosPadrao: ["1º Trimestre", "2º Trimestre", "3º Trimestre"],
  },
  semestre: {
    id: "semestre",
    nome: "Semestral (2 semestres)",
    divisoesPorAno: 2,
    rotulosPadrao: ["1º Semestre", "2º Semestre"],
  },
  quadrimestre: {
    id: "quadrimestre",
    nome: "Quadrimestral / Quarter (3 ou 4 termos)",
    divisoesPorAno: 4,
    rotulosPadrao: ["1º Termo", "2º Termo", "3º Termo", "4º Termo"],
  },
  anual: {
    id: "anual",
    nome: "Anual (Termo único)",
    divisoesPorAno: 1,
    rotulosPadrao: ["Ano Letivo"],
  },
});

export const NIVEIS_BRASIL: NivelEnsino[] = [
  {
    id: "br_fundamental_1",
    nome: "Ensino Fundamental I",
    descricao: "1º ao 5º ano",
    sugestoesSeries: ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano"],
  },
  {
    id: "br_fundamental_2",
    nome: "Ensino Fundamental II",
    descricao: "6º ao 9º ano",
    sugestoesSeries: ["6º ano", "7º ano", "8º ano", "9º ano"],
  },
  {
    id: "br_medio",
    nome: "Ensino Médio",
    descricao: "1º ao 3º ano",
    sugestoesSeries: ["1ª série / ano", "2ª série / ano", "3ª série / ano"],
  },
  {
    id: "br_tecnico_integrado",
    nome: "Ensino Técnico Integrado ao Médio",
    descricao: "Cursos técnicos concomitantes ou integrados (ex: IFES, CEFET)",
    sugestoesSeries: ["1º ano técnico", "2º ano técnico", "3º ano técnico", "4º ano técnico"],
  },
  {
    id: "br_tecnico_subsequente",
    nome: "Ensino Técnico Subsequente / Concomitante",
    descricao: "Pós-médio ou turno inverso",
    sugestoesSeries: ["1º módulo / semestre", "2º módulo / semestre", "3º módulo / semestre", "4º módulo / semestre"],
  },
  {
    id: "br_graduacao",
    nome: "Graduação (Bacharelado, Licenciatura, Tecnólogo)",
    descricao: "Ensino superior universitário",
    sugestoesSeries: ["1º período", "2º período", "3º período", "4º período", "5º período", "6º período", "7º período", "8º período", "9º período", "10º período"],
  },
  {
    id: "br_pos_graduacao",
    nome: "Pós-Graduação (Especialização, Mestrado, Doutorado)",
    descricao: "Lato sensu e Stricto sensu",
    sugestoesSeries: ["Especialização / MBA", "Mestrado", "Doutorado", "Pós-Doutorado"],
  },
  {
    id: "br_cursos_livres",
    nome: "Idiomas e Cursos Livres",
    descricao: "Escolas de idiomas, preparatórios e cursos livres",
    sugestoesSeries: ["Básico / Iniciante", "Intermediário", "Avançado", "Fluente"],
  },
];

export const NIVEIS_PORTUGAL: NivelEnsino[] = [
  {
    id: "pt_ciclo_1",
    nome: "1º Ciclo do Ensino Básico",
    descricao: "1º ao 4º ano",
    sugestoesSeries: ["1º ano", "2º ano", "3º ano", "4º ano"],
  },
  {
    id: "pt_ciclo_2",
    nome: "2º Ciclo do Ensino Básico",
    descricao: "5º e 6º ano",
    sugestoesSeries: ["5º ano", "6º ano"],
  },
  {
    id: "pt_ciclo_3",
    nome: "3º Ciclo do Ensino Básico",
    descricao: "7º ao 9º ano",
    sugestoesSeries: ["7º ano", "8º ano", "9º ano"],
  },
  {
    id: "pt_secundario",
    nome: "Ensino Secundário",
    descricao: "10º ao 12º ano",
    sugestoesSeries: ["10º ano", "11º ano", "12º ano"],
  },
  {
    id: "pt_profissional",
    nome: "Ensino Profissional / Cursos Técnicos",
    descricao: "Qualificação vocacional e técnica",
    sugestoesSeries: ["1º ano", "2º ano", "3º ano"],
  },
  {
    id: "pt_licenciatura",
    nome: "Licenciatura (Ensino Superior)",
    descricao: "1º ciclo de Bolonha",
    sugestoesSeries: ["1º ano", "2º ano", "3º ano"],
  },
  {
    id: "pt_mestrado",
    nome: "Mestrado",
    descricao: "2º ciclo de Bolonha",
    sugestoesSeries: ["1º ano", "2º ano"],
  },
  {
    id: "pt_doutoramento",
    nome: "Doutoramento",
    descricao: "3º ciclo de Bolonha",
    sugestoesSeries: ["1º ano", "2º ano", "3º ano", "4º ano"],
  },
];

export const NIVEIS_INTERNACIONAL: NivelEnsino[] = [
  {
    id: "int_elementary",
    nome: "Elementary / Primary School",
    descricao: "Grades K-5",
    sugestoesSeries: ["Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"],
  },
  {
    id: "int_middle",
    nome: "Middle School / Junior High",
    descricao: "Grades 6-8",
    sugestoesSeries: ["Grade 6", "Grade 7", "Grade 8"],
  },
  {
    id: "int_high",
    nome: "High School / Secondary",
    descricao: "Grades 9-12",
    sugestoesSeries: ["Freshman (9th)", "Sophomore (10th)", "Junior (11th)", "Senior (12th)"],
  },
  {
    id: "int_associate",
    nome: "Associate Degree / Community College",
    descricao: "2-year undergraduate",
    sugestoesSeries: ["Year 1", "Year 2"],
  },
  {
    id: "int_bachelor",
    nome: "Bachelor's Degree",
    descricao: "Undergraduate university",
    sugestoesSeries: ["Freshman (Year 1)", "Sophomore (Year 2)", "Junior (Year 3)", "Senior (Year 4)"],
  },
  {
    id: "int_master",
    nome: "Master's Degree / Graduate",
    descricao: "Postgraduate education",
    sugestoesSeries: ["Year 1", "Year 2"],
  },
  {
    id: "int_doctorate",
    nome: "Doctorate / Ph.D.",
    descricao: "Doctoral research",
    sugestoesSeries: ["Year 1", "Year 2", "Year 3", "Year 4+"],
  },
  {
    id: "int_other",
    nome: "Other / Vocational / Self-Taught",
    descricao: "Cursos livres ou autodidata",
    sugestoesSeries: ["Iniciante", "Intermediário", "Avançado"],
  },
];

/**
 * Retorna os níveis de ensino recomendados de acordo com o país.
 */
export function getNiveisPorPais(paisIso?: string): NivelEnsino[] {
  if (!paisIso) return NIVEIS_BRASIL;
  const code = paisIso.toUpperCase();
  if (code === "BR") return NIVEIS_BRASIL;
  if (code === "PT") return NIVEIS_PORTUGAL;
  return NIVEIS_INTERNACIONAL;
}
