/**
 * Brain Studio - Serviço Oficial de Localidades do Brasil (IBGE)
 * Fonte: API de Serviços de Dados do IBGE (Dados Abertos / Governo Federal)
 * Cache local persistente (7 dias) e lista estática de reserva para funcionamento 100% offline.
 */

export interface IbgeMunicipio {
  id: number;
  nome: string;
}

// Fallback estático de municípios estratégicos dos estados mais populosos e do ES (sede do IFES)
export const MUNICIPIOS_FALLBACK_BR: Record<string, string[]> = {
  ES: [
    "Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim",
    "Linhares", "Colatina", "São Mateus", "Guarapari", "Aracruz",
    "Viana", "Nova Venécia", "Barra de São Francisco", "Marataízes", "Castelo",
    "Santa Maria de Jetibá", "Afonso Cláudio", "Alegre", "Iúna", "Domingos Martins"
  ],
  SP: [
    "São Paulo", "Campinas", "Guarulhos", "São Bernardo do Campo", "Santo André",
    "Osasco", "São José dos Campos", "Ribeirão Preto", "Sorocaba", "Santos",
    "São José do Rio Preto", "Mogi das Cruzes", "Jundiaí", "Piracicaba", "Bauru"
  ],
  RJ: [
    "Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói",
    "Belford Roxo", "Campos dos Goytacazes", "São João de Meriti", "Petrópolis", "Volta Redonda"
  ],
  MG: [
    "Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim",
    "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga"
  ],
  BA: [
    "Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Juazeiro",
    "Itabuna", "Lauro de Freitas", "Ilhéus", "Jequié", "Teixeira de Freitas"
  ],
  PR: [
    "Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel",
    "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá"
  ],
  RS: [
    "Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria",
    "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande"
  ],
  SC: [
    "Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó",
    "Itajaí", "Criciúma", "Jaraguá do Sul", "Palhoça", "Lages"
  ],
  PE: [
    "Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina",
    "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão"
  ],
  CE: [
    "Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral",
    "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá"
  ],
  DF: ["Brasília"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás"],
  PA: ["Belém", "Ananindeua", "Santarém", "Marabá", "Parauapebas", "Castanhal"],
  AM: ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari"],
  MA: ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias"],
  PB: ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux"],
  RN: ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba"],
  AL: ["Maceió", "Arapiraca", "Rio Largo", "Palmeira dos Índios", "União dos Palmares"],
  PI: ["Teresina", "Parnaíba", "Picos", "Toritama", "Floriano"],
  MT: ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra"],
  MS: ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã"],
  SE: ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "São Cristóvão"],
  RO: ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal"],
  TO: ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins"],
  AC: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá", "Feijó"],
  AP: ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque", "Mazagão"],
  RR: ["Boa Vista", "Rorainópolis", "Caracaraí", "Pacaraima", "Cantá"],
};

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

/**
 * Busca municípios de uma UF específica no IBGE com fallback offline e cache seguro.
 * @param uf Sigla da Unidade Federativa (ex: 'ES', 'SP', 'RJ')
 */
export async function buscarMunicipiosIbge(uf: string): Promise<string[]> {
  const siglaUf = uf.trim().toUpperCase();
  if (!siglaUf || siglaUf.length !== 2) return [];

  const cacheKey = `brain_ibge_municipios_${siglaUf}`;

  // 1. Verificar cache local no cliente
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS && Array.isArray(parsed.data) && parsed.data.length > 0) {
          return parsed.data;
        }
      }
    } catch {}
  }

  // 2. Tentar API oficial do IBGE com timeout estrito de 3 segundos
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(siglaUf)}/municipios?orderBy=nome`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data: IbgeMunicipio[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const nomes = data.map((m) => m.nome.trim()).filter(Boolean);
        nomes.sort((a, b) => a.localeCompare(b, "pt-BR"));

        // Salvar em cache
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: nomes }));
          } catch {}
        }
        return nomes;
      }
    }
  } catch {
    // Falha de rede ou timeout: recai transparentemente na lista de reserva
  }

  // 3. Fallback Estático Offline
  const fallback = MUNICIPIOS_FALLBACK_BR[siglaUf] || [];
  return [...fallback].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/**
 * Retorna lista combinada e ordenada de municípios com base em UF ou termo de busca.
 */
export async function obterMunicipiosPorTermo(uf: string, termo?: string): Promise<string[]> {
  const lista = await buscarMunicipiosIbge(uf);
  if (!termo || !termo.trim()) return lista;

  const normalizado = termo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  return lista.filter((cidade) => {
    const cNorm = cidade
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return cNorm.includes(normalizado);
  });
}
