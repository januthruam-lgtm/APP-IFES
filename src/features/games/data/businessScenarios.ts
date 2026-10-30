export interface RawMaterialItem {
  id: string;
  name: string;
  unitCost: number; // Ex: R$ 25 por lote de matéria-prima
  qualityBonus: number; // 0.05 a 0.20
}

export interface EmployeeProfile {
  id: string;
  role: "Estagiário" | "Desenvolvedor / Técnico" | "Gerente de Operações" | "Especialista em Vendas";
  monthlySalary: number; // Ex: R$ 800, R$ 2500, R$ 4000
  productionCapacity: number; // Unidades que produz/atende por mês
  qualityImpact: number;
}

export interface BusinessMacroEvent {
  id: string;
  month: number;
  title: string;
  description: string;
  demandMultiplier: number; // 0.7 (queda) a 1.5 (boom)
  rawMaterialCostMultiplier: number; // 1.0 a 1.3
}

export interface PdUpgrade {
  id: string;
  title: string;
  cost: number;
  description: string;
  unlocked: boolean;
  efficiencyBonus: number; // reduz custo por unidade
  valuationMultiplier: number;
}

export const INITIAL_RAW_MATERIALS: RawMaterialItem[] = [
  { id: "mat_padrao", name: "Insumo Tecnológico Padrão", unitCost: 20, qualityBonus: 0 },
  { id: "mat_premium", name: "Componentes Certificados ISO", unitCost: 35, qualityBonus: 0.15 },
  { id: "mat_eco", name: "Biomateriais Sustentáveis", unitCost: 45, qualityBonus: 0.25 },
];

export const AVAILABLE_ROLES: EmployeeProfile[] = [
  { id: "emp_estagiario", role: "Estagiário", monthlySalary: 900, productionCapacity: 40, qualityImpact: 0 },
  { id: "emp_tecnico", role: "Desenvolvedor / Técnico", monthlySalary: 2800, productionCapacity: 120, qualityImpact: 0.1 },
  { id: "emp_vendedor", role: "Especialista em Vendas", monthlySalary: 3200, productionCapacity: 80, qualityImpact: 0.2 },
  { id: "emp_gerente", role: "Gerente de Operações", monthlySalary: 4800, productionCapacity: 200, qualityImpact: 0.25 },
];

export const MACRO_EVENTS_SERIES: BusinessMacroEvent[] = [
  {
    month: 2,
    id: "evt_m2",
    title: "Queda de Juros & Expansão de Crédito",
    description: "Mercado aquecido! Consumidores e empresas aumentam compras em 25%.",
    demandMultiplier: 1.25,
    rawMaterialCostMultiplier: 1.0,
  },
  {
    month: 4,
    id: "evt_m4",
    title: "Gargalo Logístico Global",
    description: "Custo de fretes e insumos sobe 20% temporariamente no setor.",
    demandMultiplier: 0.95,
    rawMaterialCostMultiplier: 1.2,
  },
  {
    month: 6,
    id: "evt_m6",
    title: "Feira de Inovação do IFES",
    description: "Sua empresa foi destaque no estande tecnológico universitário! Demanda dispara 40%.",
    demandMultiplier: 1.4,
    rawMaterialCostMultiplier: 1.0,
  },
  {
    month: 8,
    id: "evt_m8",
    title: "Entrada de Novo Concorrente Regional",
    description: "Pressão sobre preços exige mais qualidade ou investimento em marketing.",
    demandMultiplier: 0.85,
    rawMaterialCostMultiplier: 1.05,
  },
  {
    month: 10,
    id: "evt_m10",
    title: "Temporada de Compras & Contratos Anuais",
    description: "Empresas parceiras fecham grandes encomendas para o final do ano.",
    demandMultiplier: 1.5,
    rawMaterialCostMultiplier: 1.1,
  },
  {
    month: 12,
    id: "evt_m12",
    title: "Avaliação Anual de Valuation de Mercado",
    description: "Auditoria final para consolidação do balanço e valuation da empresa.",
    demandMultiplier: 1.1,
    rawMaterialCostMultiplier: 1.0,
  },
];

export const INITIAL_PD_UPGRADES: PdUpgrade[] = [
  {
    id: "upg_automacao",
    title: "Automação de Linha com IA",
    cost: 5000,
    description: "Reduz custo de produção em 15% e previne defeitos.",
    unlocked: false,
    efficiencyBonus: 0.15,
    valuationMultiplier: 1.2,
  },
  {
    id: "upg_crm",
    title: "Plataforma Omnichannel & CRM",
    cost: 4000,
    description: "Aumenta retenção de clientes e conversão de vendas em 20%.",
    unlocked: false,
    efficiencyBonus: 0.1,
    valuationMultiplier: 1.15,
  },
  {
    id: "upg_esg",
    title: "Selo de Governança ESG & Carbono Zero",
    cost: 7000,
    description: "Permite vender a preços premium com grande reputação de marca.",
    unlocked: false,
    efficiencyBonus: 0.2,
    valuationMultiplier: 1.35,
  },
];
