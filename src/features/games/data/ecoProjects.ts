export interface EcoIndicatorDeltas {
  orcamento: number; // Ex: -15000 (custo) ou +5000 (retorno)
  energiaLimpa: number; // Ex: +15%
  meioAmbiente: number; // Ex: +10%
  transporte: number; // Ex: +8%
  qualidadeVida: number; // Ex: +5%
}

export interface EcoProjectChoice {
  id: string;
  title: string;
  tag: string;
  description: string;
  cost: number;
  deltas: EcoIndicatorDeltas;
  carbonReducedTons: number;
}

export interface EcoCrisisEvent {
  id: string;
  title: string;
  description: string;
  impactDeltas: Partial<EcoIndicatorDeltas>;
  recommendedAction: string;
}

export const ECO_PROJECTS_POOL: EcoProjectChoice[] = [
  {
    id: "proj_solar",
    title: "Usina Solar Fotovoltaica no Campus",
    tag: "Energia",
    description: "Instalação de painéis solares em todos os telhados dos blocos de salas e laboratórios.",
    cost: 18000,
    deltas: {
      orcamento: -18000,
      energiaLimpa: 25,
      meioAmbiente: 10,
      transporte: 0,
      qualidadeVida: 5,
    },
    carbonReducedTons: 120,
  },
  {
    id: "proj_ciclovias",
    title: "Malha de Ciclovias & Bicicletários Elétricos",
    tag: "Transporte",
    description: "Construção de ciclovias seguras interligando os bairros universitários com estações de recarga.",
    cost: 12000,
    deltas: {
      orcamento: -12000,
      energiaLimpa: 5,
      meioAmbiente: 8,
      transporte: 22,
      qualidadeVida: 15,
    },
    carbonReducedTons: 85,
  },
  {
    id: "proj_reflorestamento",
    title: "Parque Linear & Reflorestamento de Mata Nativa",
    tag: "Meio Ambiente",
    description: "Plantio de 15.000 mudas de árvores nativas em áreas degradadas para recomposição de nascentes.",
    cost: 10000,
    deltas: {
      orcamento: -10000,
      energiaLimpa: 0,
      meioAmbiente: 28,
      transporte: 0,
      qualidadeVida: 18,
    },
    carbonReducedTons: 200,
  },
  {
    id: "proj_onibus_eletrico",
    title: "Eletrificação do Transporte Coletivo",
    tag: "Transporte",
    description: "Substituição gradual da frota municipal a diesel por ônibus elétricos modernos e silenciosos.",
    cost: 25000,
    deltas: {
      orcamento: -25000,
      energiaLimpa: 15,
      meioAmbiente: 18,
      transporte: 25,
      qualidadeVida: 12,
    },
    carbonReducedTons: 310,
  },
  {
    id: "proj_coleta_inteligente",
    title: "Logística Reversa & Coleta Seletiva 100%",
    tag: "Resíduos",
    description: "Instalação de ecopontos com sensores de volume e cooperativas de reciclagem apoiadas pelo IFES.",
    cost: 8000,
    deltas: {
      orcamento: -8000,
      energiaLimpa: 5,
      meioAmbiente: 20,
      transporte: 4,
      qualidadeVida: 14,
    },
    carbonReducedTons: 95,
  },
  {
    id: "proj_reuso_agua",
    title: "Estação Avançada de Tratamento e Reúso de Água",
    tag: "Recursos Hídricos",
    description: "Captação pluvial e reciclagem de águas cinzas para irrigação de jardins e limpeza pública.",
    cost: 14000,
    deltas: {
      orcamento: -14000,
      energiaLimpa: 2,
      meioAmbiente: 22,
      transporte: 0,
      qualidadeVida: 16,
    },
    carbonReducedTons: 60,
  },
  {
    id: "proj_hortas_comunitarias",
    title: "Rede de Hortas Urbanas Agroecológicas",
    tag: "Alimentação & Saúde",
    description: "Espaços comunitários de cultivo orgânico que fornecem alimentos frescos aos restaurantes populares.",
    cost: 6000,
    deltas: {
      orcamento: -6000,
      energiaLimpa: 0,
      meioAmbiente: 15,
      transporte: 0,
      qualidadeVida: 20,
    },
    carbonReducedTons: 40,
  },
  {
    id: "proj_eficiencia_predial",
    title: "Modernização com Iluminação LED & Sensores IoT",
    tag: "Eficiência",
    description: "Retrofit predial que reduz o consumo elétrico nos horários de pico e otimiza a climatização.",
    cost: 9000,
    deltas: {
      orcamento: -9000,
      energiaLimpa: 12,
      meioAmbiente: 8,
      transporte: 0,
      qualidadeVida: 10,
    },
    carbonReducedTons: 110,
  },
];

export const ECO_CRISIS_EVENTS: EcoCrisisEvent[] = [
  {
    id: "cr_seca",
    title: "Período Prolongado de Estiagem",
    description: "Falta de chuvas atinge os mananciais hídricos e encarece a geração de energia.",
    impactDeltas: { energiaLimpa: -8, meioAmbiente: -12, qualidadeVida: -6 },
    recommendedAction: "Priorizar projetos hídricos e energia solar alternativa.",
  },
  {
    id: "cr_onda_calor",
    title: "Onda de Calor Extremo na Região",
    description: "Altas temperaturas elevam o consumo elétrico de refrigeração e demandam áreas verdes.",
    impactDeltas: { meioAmbiente: -6, qualidadeVida: -10, orcamento: -4000 },
    recommendedAction: "Ampliar cobertura vegetal urbana para amenizar ilhas de calor.",
  },
  {
    id: "cr_emenda_verde",
    title: "Aporte Financeiro de Fundo Internacional do Clima",
    description: "Reconhecimento das boas práticas sustentáveis rende um repasse extraordinário para o município!",
    impactDeltas: { orcamento: 15000, qualidadeVida: 5 },
    recommendedAction: "Aproveite o bônus para investir em projetos de alta tecnologia limpa.",
  },
];
