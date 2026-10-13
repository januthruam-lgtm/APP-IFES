export interface IfesCampusOption {
  id: string;
  name: string;
  url: string;
  shortName: string;
  description: string;
  isPopular?: boolean;
  officialSiteUrl?: string;
}

export const IFES_CAMPUSES_LIST: IfesCampusOption[] = [
  {
    id: "guarapari",
    name: "IFES Campus Guarapari (Moodle AVA 3 Cefor / ava3.cefor.ifes.edu.br)",
    shortName: "Campus Guarapari",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://guarapari.ifes.edu.br",
    description: "Ambiente Moodle dos estudantes do Campus Guarapari (Portal: guarapari.ifes.edu.br)",
    isPopular: true,
  },
  {
    id: "cefor-ava3",
    name: "IFES Cefor AVA3 (Cursos Técnicos e Graduação EaD)",
    shortName: "Cefor AVA3",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://cefor.ifes.edu.br",
    description: "Ambiente virtual dos cursos técnicos integrados, subsequentes e superiores do Cefor",
    isPopular: true,
  },
  {
    id: "ava-geral",
    name: "IFES AVA Geral (Presencial e Híbrido Multicampi)",
    shortName: "AVA Geral",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://www.ifes.edu.br",
    description: "Ambiente virtual padrão para disciplinas presenciais e híbridas do IFES",
    isPopular: true,
  },
  {
    id: "serra",
    name: "IFES Campus Serra (Moodle AVA 3 Cefor)",
    shortName: "Campus Serra",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://serra.ifes.edu.br",
    description: "Cursos técnicos e engenharias do Campus Serra",
    isPopular: true,
  },
  {
    id: "vitoria",
    name: "IFES Campus Vitória (Moodle AVA 3 Cefor)",
    shortName: "Campus Vitória",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://vitoria.ifes.edu.br",
    description: "Cursos técnicos, tecnólogos e engenharias de Vitória",
    isPopular: true,
  },
  {
    id: "vilavelha",
    name: "IFES Campus Vila Velha (Moodle AVA 3 Cefor)",
    shortName: "Campus Vila Velha",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://vilavelha.ifes.edu.br",
    description: "Cursos de Química, Biotecnologia e Biomedicina",
  },
  {
    id: "cariacica",
    name: "IFES Campus Cariacica (Moodle AVA 3 Cefor)",
    shortName: "Campus Cariacica",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://cariacica.ifes.edu.br",
    description: "Cursos de Logística, Engenharia de Produção e Física",
  },
  {
    id: "colatina",
    name: "IFES Campus Colatina (Moodle AVA 3 Cefor)",
    shortName: "Campus Colatina",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://colatina.ifes.edu.br",
    description: "Cursos de Arquitetura, Edificações e Sistemas de Informação",
  },
  {
    id: "linhares",
    name: "IFES Campus Linhares (Moodle AVA 3 Cefor)",
    shortName: "Campus Linhares",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://linhares.ifes.edu.br",
    description: "Cursos de Administração e Engenharia de Controle e Automação",
  },
  {
    id: "saomateus",
    name: "IFES Campus São Mateus (Moodle AVA 3 Cefor)",
    shortName: "Campus São Mateus",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://saomateus.ifes.edu.br",
    description: "Cursos de Eletrotécnica, Mecânica e Engenharias",
  },
  {
    id: "cefor-ead",
    name: "IFES Cefor (EaD e Cursos Abertos)",
    shortName: "Cefor Aberto",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://cefor.ifes.edu.br",
    description: "Cursos abertos massivos (MOOCs) e capacitações",
  },
  {
    id: "pos",
    name: "IFES Pós-Graduação (Moodle AVA 3 Cefor)",
    shortName: "Pós-Graduação",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://pos.ifes.edu.br",
    description: "Especializações, Mestrados e Doutorados do IFES",
  },
  {
    id: "avaead",
    name: "IFES EaD Geral (Moodle AVA 3 Cefor)",
    shortName: "EaD Geral",
    url: "https://ava3.cefor.ifes.edu.br",
    officialSiteUrl: "https://www.ifes.edu.br",
    description: "Portal integrado de educação a distância do IFES",
  },
];
