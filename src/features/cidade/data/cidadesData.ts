import { CidadeTema } from "../types";

// Importações dos cenários de alta resolução gerados exclusivamente para o APP-IFES
import imgLitoranea from "../../../assets/images/cidade_litoranea_cenario_1793377133509.jpg";
import imgHistorica from "../../../assets/images/cidade_historica_cenario_1793377146781.jpg";
import imgFuturista from "../../../assets/images/cidade_futurista_cenario_1793377159007.jpg";
import imgMontanha from "../../../assets/images/cidade_montanha_cenario_1793377171723.jpg";

export const CIDADES_DATA: CidadeTema[] = [
  {
    id: 1,
    nome: "Vila Litorânea",
    subtitulo: "Costa Oceânica & Biologia Marinha",
    inspiracao: "Litoral Capixaba & Ilha de Vitória",
    bioma: "Marinho & Mata Atlântica Costeira",
    cenarioImg: imgLitoranea,
    cenarioAlt: "Cenário panorâmico da Vila Litorânea com oceano turquesa, praia e pier",
    baseCusto: 30,
    recompensaConclusao: {
      moedas: 250,
      xp: 400,
      titulo: "Navegador dos Mares do Conhecimento",
    },
    monumentos: [
      {
        id: "litoranea_farol",
        nome: "Farol Náutico do Saber",
        subtitulo: "Luz de orientação para as expedições acadêmicas oceânicas",
        categoria: "ciencia",
        posicao: { x: 88, y: 52 }, // No píer à direita
        escala: 1.05,
        materiaisPrincipais: ["Pedra de Cantaria", "Lente Fresnel de Latão", "Mármore Branco"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Terreno Demarcado",
            descricao: "Estacas de madeira e boias náuticas demarcam a base rochosa à beira-mar.",
            materiais: ["Estacas de madeira", "Cordas marinhas", "Planta náutica"],
          },
          2: {
            nivel: 2,
            nome: "Alicerces de Pedra",
            descricao: "Blocos de granito marinho assentados com argamassa resistente à maresia.",
            materiais: ["Blocos de granito", "Argamassa impermeável", "Vergalhões"],
          },
          3: {
            nivel: 3,
            nome: "Torre Cilindrica",
            descricao: "Estrutura vertical com escada em caracol interna e janelas vigia.",
            materiais: ["Paredes de pedra curva", "Andaimes de bambu", "Vigas de aço"],
          },
          4: {
            nivel: 4,
            nome: "Cúpula & Mirante",
            descricao: "Plataforma de observação com guarda-corpo de ferro forjado e teto cônico.",
            materiais: ["Varanda panorâmica", "Vidros marítimos", "Luminária"],
          },
          5: {
            nivel: 5,
            nome: "Farol Resplandecente",
            descricao: "Lente rotativa acesa emitindo feixes de luz sobre o oceano azul.",
            materiais: ["Lente giratória", "Bandeira náutica", "Iluminação dourada"],
          },
        },
      },
      {
        id: "litoranea_aquario",
        nome: "Centro de Biologia Marinha",
        subtitulo: "Pesquisa oceanográfica, corais vivos e preservação de tartarugas",
        categoria: "ciencia",
        posicao: { x: 26, y: 68 }, // Lado esquerdo da praia
        escala: 1.15,
        materiaisPrincipais: ["Vidro Temperado", "Pedra Coral", "Madeira Tratada"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Terreno Litorâneo",
            descricao: "Faixa de areia nivelada com estacas demarcatórias e rede de proteção.",
            materiais: ["Estacas e fitas", "Medidores de maré"],
          },
          2: {
            nivel: 2,
            nome: "Fundações dos Tanques",
            descricao: "Escavação dos reservatórios com canaletas de água do mar conectadas.",
            materiais: ["Concreto marinho", "Tubulações de filtragem"],
          },
          3: {
            nivel: 3,
            nome: "Domo Panorâmico",
            descricao: "Arcos estruturais de madeira laminada sustentando a abóbada central.",
            materiais: ["Arcadas de madeira", "Paredes de alvenaria"],
          },
          4: {
            nivel: 4,
            nome: "Aquários & Laboratório",
            descricao: "Instalação dos tanques envidraçados com espécies marinhas e bancadas.",
            materiais: ["Placas de vidro grosso", "Bancadas científicas"],
          },
          5: {
            nivel: 5,
            nome: "Instituto Marinho Completo",
            descricao: "Centro oceanográfico ativo com recife de corais e visitantes estudando.",
            materiais: ["Cúpula envidraçada", "Jardim aquático", "Faíscas do saber"],
          },
        },
      },
      {
        id: "litoranea_pier",
        nome: "Atracadouro das Caravelas",
        subtitulo: "Pier de madeira de lei para ancoragem das caravelas de expedição",
        categoria: "historia",
        posicao: { x: 62, y: 58 }, // No píer de madeira
        escala: 1.0,
        materiaisPrincipais: ["Madeira de Lei", "Pinos de Bronze", "Cordas de Sisal"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Pilares Iniciais",
            descricao: "Troncos de eucalipto cravados no leito marinho com amarrações.",
            materiais: ["Troncos estaqueados", "Flutuadores"],
          },
          2: {
            nivel: 2,
            nome: "Vigas do Tablado",
            descricao: "Vigas longitudinais de madeira reforçada ligando a praia ao canal marinho.",
            materiais: ["Vigas de sustentação", "Travessas de madeira"],
          },
          3: {
            nivel: 3,
            nome: "Passarela Concluída",
            descricao: "Pranchas de madeira ajustadas com corrimão e cabeços de amarração de barcos.",
            materiais: ["Pranchões de convés", "Guarda-corpos"],
          },
          4: {
            nivel: 4,
            nome: "Galpão dos Pescadores",
            descricao: "Oficina náutica com ferramentas de calafetagem e guindaste de carga.",
            materiais: ["Cabana de madeira", "Guincho de cordas"],
          },
          5: {
            nivel: 5,
            nome: "Porto de Pesquisa Ativo",
            descricao: "Pier movimentado com veleiro científico ancorado e mastros com bandeiras.",
            materiais: ["Caravela científica", "Lampiões a óleo", "Bandeirolas"],
          },
        },
      },
      {
        id: "litoranea_gazebo",
        nome: "Mirante das Palmeiras",
        subtitulo: "Refúgio de leitura à beira-mar com telhado de piaçava e brisa fresca",
        categoria: "natureza",
        posicao: { x: 12, y: 78 }, // Canto inferior esquerdo
        escala: 1.2,
        materiaisPrincipais: ["Palha de Piaçava", "Troncos Rústicos", "Pedra Branca"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Clareira na Areia",
            descricao: "Demarcação circular sob a sombra dos coqueiros com pedras de base.",
            materiais: ["Pedras demarcatórias", "Varas de bambu"],
          },
          2: {
            nivel: 2,
            nome: "Deque de Madeira",
            descricao: "Plataforma elevada de tábuas de cedro para isolar da areia úmida.",
            materiais: ["Tablado de cedro", "Degraus de acesso"],
          },
          3: {
            nivel: 3,
            nome: "Colunas de Eucalipto",
            descricao: "Quatro pilares rústicos sustentando a armação octogonal do telhado.",
            materiais: ["Colunas polidas", "Estrutura do teto"],
          },
          4: {
            nivel: 4,
            nome: "Cobertura de Piaçava",
            descricao: "Trançado tradicional impermeável com floreiras tropicais nas laterais.",
            materiais: ["Palha trançada", "Vasos de orquídeas"],
          },
          5: {
            nivel: 5,
            nome: "Mirante Paradisiaco",
            descricao: "Espaço completo com redes de descanso, estante de livros e vista livre ao mar.",
            materiais: ["Rede trançada", "Estante de leitura", "Lampião solar"],
          },
        },
      },
      {
        id: "litoranea_igreja",
        nome: "Capela da Enseada",
        subtitulo: "Pequeno templo histórico caiado de branco com sino de bronze e praça de pedra",
        categoria: "cultura",
        posicao: { x: 50, y: 40 }, // Na colina média atrás da vila
        escala: 0.92,
        materiaisPrincipais: ["Alvenaria Caiada", "Telhas Coloniais", "Bronze"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Platô na Colina",
            descricao: "Nivelamento do terreno elevado com vista para toda a enseada da vila.",
            materiais: ["Terraplenagem", "Estacas"],
          },
          2: {
            nivel: 2,
            nome: "Alvenaria Inicial",
            descricao: "Paredes espessas de pedra e cal subindo com portal em arco.",
            materiais: ["Pedra e cal", "Portal de madeira"],
          },
          3: {
            nivel: 3,
            nome: "Frontão e Telhado",
            descricao: "Telhado de barro em duas águas e frontispício barroco colonial.",
            materiais: ["Telhas cerâmicas", "Vigas de peroba"],
          },
          4: {
            nivel: 4,
            nome: "Torre Sineira",
            descricao: "Campanário elevado com relógio e sino de bronze artesanal.",
            materiais: ["Sino de bronze", "Cruzeiro de ferro"],
          },
          5: {
            nivel: 5,
            nome: "Capela Histórica Radiante",
            descricao: "Capela caiada impecável com sino soando, praça florida e cruz iluminada.",
            materiais: ["Pintura branca impecável", "Jardim de hibiscos", "Sino ativo"],
          },
        },
      },
    ],
  },
  {
    id: 2,
    nome: "Vila Histórica",
    subtitulo: "Patrimônio Colonial & Letras Barrocas",
    inspiracao: "Sítio Histórico de Vila Velha & Ouro Preto",
    bioma: "Colinas Verdes & Arquitetura Colonial Brasileira",
    cenarioImg: imgHistorica,
    cenarioAlt: "Cenário panorâmico da Vila Histórica com convento no topo, ruas de pedra e casarios",
    baseCusto: 50,
    recompensaConclusao: {
      moedas: 400,
      xp: 650,
      titulo: "Guardião da Memória Histórica",
    },
    monumentos: [
      {
        id: "historica_convento",
        nome: "Convento Monumental do Saber",
        subtitulo: "Santuário no topo da colina com vista para as águas e sinos seculares",
        categoria: "historia",
        posicao: { x: 33, y: 28 }, // Topo da colina à esquerda
        escala: 0.95,
        materiaisPrincipais: ["Cantaria de Pedra", "Madeira de Jacarandá", "Sinos Barrocos"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Acesso no Rochedo",
            descricao: "Escavação do caminho de pedras e assentamento das primeiras sapatas.",
            materiais: ["Pedras brutas", "Cimento de cal"],
          },
          2: {
            nivel: 2,
            nome: "Claustro & Alicerces",
            descricao: "Paredes de pedra de 1 metro de largura formando o pátio interno.",
            materiais: ["Blocos aparelhados", "Pilares de sustentação"],
          },
          3: {
            nivel: 3,
            nome: "Nave & Arcadas",
            descricao: "Arcadas em arco pleno com colunas toscanas e abóbada de madeira.",
            materiais: ["Arcos de cantaria", "Teto em abóbada"],
          },
          4: {
            nivel: 4,
            nome: "Torres Gêmeas",
            descricao: "Torres sineiras barrocas com cúpulas bulbosas e vitrais decorados.",
            materiais: ["Cúpulas barrocas", "Sinos afinados"],
          },
          5: {
            nivel: 5,
            nome: "Santuário Histórico Pleno",
            descricao: "Complexo conventual imponente com iluminação noturna e sinos triunfantes.",
            materiais: ["Bandeira imperial", "Fachada iluminada", "Estrelas douradas"],
          },
        },
      },
      {
        id: "historica_chafariz",
        nome: "Chafariz Imperial de Cantaria",
        subtitulo: "Fonte barroca esculpida em pedra sabão com bicas de bronze e águas cristalinas",
        categoria: "cultura",
        posicao: { x: 62, y: 72 }, // No largo da praça central
        escala: 1.15,
        materiaisPrincipais: ["Pedra Sabão", "Bronze Esculpido", "Mosaico Português"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Tanque Subterrâneo",
            descricao: "Canalização de água da nascente da colina e bacia de contenção.",
            materiais: ["Tubulação cerâmica", "Valas de pedra"],
          },
          2: {
            nivel: 2,
            nome: "Bacia de Cantaria",
            descricao: "Borda octogonal de cantaria de pedra lavrada com degraus em volta.",
            materiais: ["Blocos lavrados", "Argamassa hidráulica"],
          },
          3: {
            nivel: 3,
            nome: "Coluna Central",
            descricao: "Pilar central esculpido com quatro máscaras de bronze por onde fluirá a água.",
            materiais: ["Pedra esculpida", "Bicas de bronze"],
          },
          4: {
            nivel: 4,
            nome: "Coroamento Escultórico",
            descricao: "Pináculo barroco no topo do chafariz com volutas e brasão histórico.",
            materiais: ["Brasão em relevo", "Fitas de água"],
          },
          5: {
            nivel: 5,
            nome: "Chafariz Monumental Vivo",
            descricao: "Água cristalina jorrando continuamente sob o sol com calçamento em mosaico.",
            materiais: ["Água límpida", "Calçamento português", "Flores nas bordas"],
          },
        },
      },
      {
        id: "historica_biblioteca",
        nome: "Casa dos Manuscritos",
        subtitulo: "Casarão colonial com biblioteca de livros raros, balcões de ferro e azulejos",
        categoria: "historia",
        posicao: { x: 24, y: 48 }, // Casarão colonial à esquerda
        escala: 1.05,
        materiaisPrincipais: ["Azulejos Portugueses", "Ferro Batido", "Telhas Coloniais"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Base do Casarão",
            descricao: "Estrutura de pau-a-pique e alicerces de pedra com porão ventilado.",
            materiais: ["Madeiramento de lei", "Base de pedra"],
          },
          2: {
            nivel: 2,
            nome: "Dois Pavimentos",
            descricao: "Elevação do sobrado com vigas mestras de ipê e divisórias de taipa.",
            materiais: ["Vigas de ipê", "Taipa de mão"],
          },
          3: {
            nivel: 3,
            nome: "Varandas & Balcões",
            descricao: "Instalação dos balcões sacados de ferro forjado e portas balcão almofadadas.",
            materiais: ["Guarda-corpo de ferro", "Janelas coloniais azuis"],
          },
          4: {
            nivel: 4,
            nome: "Estantes de Carvalho",
            descricao: "Acervo de manuscritos antigos, mapas imperiais e globos terrestres.",
            materiais: ["Estantes do chão ao teto", "Lamparinas"],
          },
          5: {
            nivel: 5,
            nome: "Palacete dos Manuscritos",
            descricao: "Biblioteca viva com fachada adornada em azulejos azuis e pergaminhos seculares.",
            materiais: ["Painel de azulejos", "Brasão de ouro", "Luz dourada interior"],
          },
        },
      },
      {
        id: "historica_ponte",
        nome: "Ponte Imperial dos Arcos",
        subtitulo: "Ponte em arcos de pedra sobre o riacho que corta a cidade histórica",
        categoria: "historia",
        posicao: { x: 30, y: 78 }, // Ponte de pedra no riacho em primeiro plano
        escala: 1.2,
        materiaisPrincipais: ["Granito Rolado", "Lampiões de Gás", "Guarda-corpo de Cantaria"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Pilares do Rio",
            descricao: "Ensecadeiras e fundação dos encontros da ponte nas duas margens do riacho.",
            materiais: ["Pedras de leito de rio", "Ensecadeiras"],
          },
          2: {
            nivel: 2,
            nome: "Cimbramento dos Arcos",
            descricao: "Fôrmas de madeira semicirculares para assentamento das aduelas de pedra.",
            materiais: ["Cimbres de madeira", "Pedras aparelhadas"],
          },
          3: {
            nivel: 3,
            nome: "Travessia Pavimentada",
            descricao: "Fechamento da chave dos arcos e colocação do leito de pedras pés-de-moleque.",
            materiais: ["Chave de abóbada", "Calçamento de pedra"],
          },
          4: {
            nivel: 4,
            nome: "Parapeitos & Lampiões",
            descricao: "Parapeito maciço de cantaria com suportes de ferro para lampiões coloniais.",
            materiais: ["Guarda-corpo maciço", "Postes de ferro"],
          },
          5: {
            nivel: 5,
            nome: "Ponte Imperial Radiante",
            descricao: "Ponte histórica imponente com pedestres atravessando e riacho límpido correndo.",
            materiais: ["Lampiões iluminados", "Bandeira comemorativa", "Cravos dourados"],
          },
        },
      },
      {
        id: "historica_torre",
        nome: "Torre Sineira da Vila",
        subtitulo: "Torre do relógio municipal que dita os horários dos estudos e solenidades",
        categoria: "cultura",
        posicao: { x: 88, y: 75 }, // Canto inferior direito
        escala: 1.15,
        materiaisPrincipais: ["Alvenaria de Tijolos", "Mostrador de Latão", "Telhado em Agulha"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Sapata Quadrada",
            descricao: "Fundação profunda para suportar a esbelteza da torre do relógio.",
            materiais: ["Fundação quadrada", "Armaduras de ferro"],
          },
          2: {
            nivel: 2,
            nome: "Corpo da Torre",
            descricao: "Subida dos quatro panos de parede de tijolo maciço com frisos em pedra.",
            materiais: ["Tijolos maciços", "Frisos de cantaria"],
          },
          3: {
            nivel: 3,
            nome: "Mecanismo Horário",
            descricao: "Instalação das engrenagens de latão, pesos e pêndulo regulador.",
            materiais: ["Engrenagens de bronze", "Mostrador de esmalte"],
          },
          4: {
            nivel: 4,
            nome: "Agulha Cônica",
            descricao: "Cobertura piramidal de cobre com catavento em forma de galo estilizado.",
            materiais: ["Chapas de cobre", "Catavento direcional"],
          },
          5: {
            nivel: 5,
            nome: "Torre do Tempo Celestial",
            descricao: "Relógio com ponteiros dourados marcando o tempo dos sábios e badaladas solenes.",
            materiais: ["Ponteiros dourados", "Sino ressoante", "Bandeira da vila"],
          },
        },
      },
    ],
  },
  {
    id: 3,
    nome: "Metrópole Tech",
    subtitulo: "Inovação, Robótica & Energia Limpa",
    inspiracao: "Campus de Inovação & Tecnológico",
    bioma: "Cidade Inteligente Sustentável com Áreas Verdes",
    cenarioImg: imgFuturista,
    cenarioAlt: "Cenário panorâmico da Metrópole Tech com domo geodésico, torres solares e monotrilho",
    baseCusto: 80,
    recompensaConclusao: {
      moedas: 650,
      xp: 1000,
      titulo: "Arquiteto da Era Quântica",
    },
    monumentos: [
      {
        id: "tech_domo",
        nome: "Biocúpula Geodésica",
        subtitulo: "Complexo de pesquisa botânica e biotecnológica em ambiente controlado",
        categoria: "ciencia",
        posicao: { x: 70, y: 40 }, // Domo geodésico à direita
        escala: 1.1,
        materiaisPrincipais: ["Painéis Polímeros ETFE", "Armação de Titânio", "Irrigação Automatizada"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Anel Perimetral",
            descricao: "Base de concreto ecológico reforçado com sensores de umidade do solo.",
            materiais: ["Anel de fundação", "Sensores IoT"],
          },
          2: {
            nivel: 2,
            nome: "Treliça Triangular",
            descricao: "Estrutura de vértices esféricos e tubos de titânio formando a semiesfera.",
            materiais: ["Nós estruturais", "Tubos de titânio"],
          },
          3: {
            nivel: 3,
            nome: "Membrana Translúcida",
            descricao: "Fechamento com almofadas de filme polimérico transparente de alta eficiência.",
            materiais: ["Filmes de ETFE", "Válvulas pneumáticas"],
          },
          4: {
            nivel: 4,
            nome: "Jardins Verticais Internos",
            descricao: "Torres aeropônicas e iluminação biológica fotossintética programável.",
            materiais: ["Módulos hidropônicos", "Iluminação espectral"],
          },
          5: {
            nivel: 5,
            nome: "Biocúpula Viva e Radiante",
            descricao: "Ecossistema sustentável ativo com árvores florescendo e energia autônoma.",
            materiais: ["Circuito luminoso verde", "Domo pulsante", "Holograma botânico"],
          },
        },
      },
      {
        id: "tech_torres",
        nome: "Torres de Hiperconexão",
        subtitulo: "Conjunto curvilíneo com painéis solares integrados e processamento em nuvem",
        categoria: "tecnologia",
        posicao: { x: 42, y: 32 }, // Três torres curvas no centro-traseiro
        escala: 1.05,
        materiaisPrincipais: ["Vidro Fotovoltaico", "Ligas de Alumínio Aeroespacial", "Fibra Óptica"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Radier de Alta Carga",
            descricao: "Bloco maciço de fundação com dutos centrais para cabeamento de ultra velocidade.",
            materiais: ["Radier estrutural", "Galerias de fibra óptica"],
          },
          2: {
            nivel: 2,
            nome: "Núcleos de Concreto & Aço",
            descricao: "Subida dos poços de elevadores magnéticos e vigamento dos pavimentos.",
            materiais: ["Pilares metálicos", "Pisos de composite"],
          },
          3: {
            nivel: 3,
            nome: "Fachada Solar Curva",
            descricao: "Instalação do vidro aerodinâmico que converte luz solar em eletricidade.",
            materiais: ["Vidros fotovoltaicos", "Perfis aerodinâmicos"],
          },
          4: {
            nivel: 4,
            nome: "Antenas de Conectividade",
            descricao: "Arranjo de matrizes em fase 6G e nós de computação distribuída no topo.",
            materiais: ["Antenas de micro-ondas", "Data center interno"],
          },
          5: {
            nivel: 5,
            nome: "Centro de Dados Global",
            descricao: "Arranha-céus tecnológicos operando com feixes de dados azuis e luzes fluindo.",
            materiais: ["Laser de dados", "Painéis solares ativos", "Giroscópio quântico"],
          },
        },
      },
      {
        id: "tech_monotrilho",
        nome: "Estação Maglev Ecotrans",
        subtitulo: "Estação suspensa de transporte por levitação magnética e baixo ruído",
        categoria: "tecnologia",
        posicao: { x: 25, y: 62 }, // Estação do monotrilho à esquerda
        escala: 1.1,
        materiaisPrincipais: ["Trilhos Magnéticos", "Pórticos de Concreto Branco", "Painéis Solares"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Pilares do Trilho",
            descricao: "Pilares esbeltos de sustentação ao longo do anel de transporte do campus.",
            materiais: ["Pilares pré-moldados", "Bases de amortecimento"],
          },
          2: {
            nivel: 2,
            nome: "Vigas Guia Magnéticas",
            descricao: "Vigas curvas com bobinas eletromagnéticas de levitação instaladas.",
            materiais: ["Bobinas magnéticas", "Sensores de alinhamento"],
          },
          3: {
            nivel: 3,
            nome: "Plataforma de Embarque",
            descricao: "Plataforma coberta com portas de plataforma automatizadas e totens interativos.",
            materiais: ["Piso emborrachado", "Portas de vidro deslizantes"],
          },
          4: {
            nivel: 4,
            nome: "Composição Maglev",
            descricao: "Vagão aerodinâmico colocado na linha para calibração de levitação e frenagem.",
            materiais: ["Trem aerodinâmico", "Motores lineares"],
          },
          5: {
            nivel: 5,
            nome: "Circuito Maglev em Operação",
            descricao: "Trem veloz flutuando silenciosamente sobre os trilhos transportando estudantes.",
            materiais: ["Feixe magnético azul", "Trem ativo", "Placas de LED em tempo real"],
          },
        },
      },
      {
        id: "tech_drones",
        nome: "Porto Aéreo de Drones",
        subtitulo: "Plataforma circular com helipontos inteligentes para entrega de material didático",
        categoria: "tecnologia",
        posicao: { x: 50, y: 18 }, // No céu superior acima das torres
        escala: 0.9,
        materiaisPrincipais: ["Fibra de Carbono", "Leds de Pouso", "Carregadores por Indução"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Plataforma de Lançamento",
            descricao: "Pistas circulares com demarcação luminescente e radar meteorológico.",
            materiais: ["Piso antiderrapante", "Balizas ópticas"],
          },
          2: {
            nivel: 2,
            nome: "Hangares de Recarga",
            descricao: "Baias automatizadas com carregamento rápido de baterias para a frota.",
            materiais: ["Módulos de recarga indutiva", "Braços robóticos"],
          },
          3: {
            nivel: 3,
            nome: "Torre de Controle Aéreo",
            descricao: "Software autônomo com rotas seguras e prevenção de colisões para os drones.",
            materiais: ["Antenas de telemetria", "Servidor de tráfego aéreo"],
          },
          4: {
            nivel: 4,
            nome: "Frota de Entrega",
            descricao: "Quadcópteros ecológicos calibrados e prontos para distribuição de livros e kits.",
            materiais: ["Drones de entrega", "Compartimentos climatizados"],
          },
          5: {
            nivel: 5,
            nome: "Céu Inteligente Ativo",
            descricao: "Drones sobrevoando em harmonia com pacotes de estudo e rotas luminosas.",
            materiais: ["Trilhas de voo luminosas", "Drones em formação", "Farol de tráfego"],
          },
        },
      },
      {
        id: "tech_praca",
        nome: "Ágora da Conectividade",
        subtitulo: "Praça circular central com espelho d'água ecológico e árvores solares",
        categoria: "cultura",
        posicao: { x: 52, y: 65 }, // No centro da praça moderna
        escala: 1.15,
        materiaisPrincipais: ["Piso Fotocatalítico", "Árvores Solares de Aço", "Espelho D'Água"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Traçado dos Caminhos",
            descricao: "Caminhos radiais traçados no gramado integrando todas as edificações.",
            materiais: ["Guarnições de alumínio", "Sub-base permeável"],
          },
          2: {
            nivel: 2,
            nome: "Espelho D'Água Central",
            descricao: "Lago geométrico com sistema biológico de filtragem por macrófitas aquáticas.",
            materiais: ["Bacia de contenção", "Filtros biológicos"],
          },
          3: {
            nivel: 3,
            nome: "Árvores Solares",
            descricao: "Esculturas metálicas ramificadas sustentando células fotovoltaicas e bancos.",
            materiais: ["Aço corten polido", "Tomadas de recarga USB-C"],
          },
          4: {
            nivel: 4,
            nome: "Fonte Holográfica",
            descricao: "Jatos laminares de água iluminados por LEDs RGB sincronizados com áudio.",
            materiais: ["Bocais laminares", "Projetores aquáticos"],
          },
          5: {
            nivel: 5,
            nome: "Ágora Futurista Plena",
            descricao: "Ponto de encontro vibrante com estudantes debatendo ideias e chafariz ativo.",
            materiais: ["Luzes holográficas", "Bancos inteligentes", "Gemas de inovação"],
          },
        },
      },
    ],
  },
  {
    id: 4,
    nome: "Vila da Montanha",
    subtitulo: "Agroecologia, Araucárias & Cachoeiras",
    inspiracao: "Região Serrana do Espírito Santo (Pedra Azul & Domingos Martins)",
    bioma: "Mata Atlântica de Altitude, Araucárias & Maciços Graníticos",
    cenarioImg: imgMontanha,
    cenarioAlt: "Cenário panorâmico da Vila da Montanha com cachoeira, maciço da Pedra Azul e chalés",
    baseCusto: 120,
    recompensaConclusao: {
      moedas: 1000,
      xp: 1500,
      titulo: "Sábio da Montanha & Protetor das Águas",
    },
    monumentos: [
      {
        id: "montanha_moinho",
        nome: "Moinho Hidráulico das Araucárias",
        subtitulo: "Moinho de madeira com grande roda d'água aproveitando a força do riacho",
        categoria: "natureza",
        posicao: { x: 50, y: 78 }, // Perto da ponte e riacho
        escala: 1.2,
        materiaisPrincipais: ["Cedro Escovado", "Pedra de Moinho de Quartzo", "Roda Hidráulica"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Canal de Derivação",
            descricao: "Construção de comporta e calha de madeira para desviar água limpa do riacho.",
            materiais: ["Comporta de cedro", "Pedras de contenção"],
          },
          2: {
            nivel: 2,
            nome: "Base de Cantaria",
            descricao: "Fundação robusta no leito do rio capaz de resistir às cheias da primavera.",
            materiais: ["Blocos de pedra lavrada", "Encaixes de carvalho"],
          },
          3: {
            nivel: 3,
            nome: "Roda D'Água Gigante",
            descricao: "Roda de pás de madeira com eixo de ferro forjado e mancais lubrificados.",
            materiais: ["Roda com pás de madeira", "Eixo de ferro"],
          },
          4: {
            nivel: 4,
            nome: "Chalé da Moenda",
            descricao: "Cabana de dois andares com pedras de moinho, engrenagens e sacos de cereais.",
            materiais: ["Mós de pedra", "Telhado de telha colonial de barro"],
          },
          5: {
            nivel: 5,
            nome: "Moinho em Pleno Giro",
            descricao: "Roda d'água girando alegremente respingando gotas cristalinas sob o sol da serra.",
            materiais: ["Roda em movimento", "Gotículas de água", "Flores nas janelas"],
          },
        },
      },
      {
        id: "montanha_mirante",
        nome: "Observatório da Pedra Azul",
        subtitulo: "Mirante suspenso sobre as rochas com vista para o imponente monólito de granito",
        categoria: "natureza",
        posicao: { x: 58, y: 22 }, // Perto do topo da montanha rochosa
        escala: 0.9,
        materiaisPrincipais: ["Tirantes de Aço", "Guarda-corpo de Vidro", "Telescópio Óptico"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Fixação nos Penhascos",
            descricao: "Perfuração da rocha de granito azul e instalação de chumbadores químicos.",
            materiais: ["Chumbadores de titânio", "Cabos de segurança"],
          },
          2: {
            nivel: 2,
            nome: "Vigas em Balanço",
            descricao: "Vigas de aço corten estendendo-se além do abismo para a plataforma suspensa.",
            materiais: ["Perfis de aço estrutural", "Tirantes de sustentação"],
          },
          3: {
            nivel: 3,
            nome: "Piso de Vidro Laminado",
            descricao: "Placas triplas de vidro temperado permitindo visualizar o vale verde sob os pés.",
            materiais: ["Vidros estruturais", "Proteções laterais"],
          },
          4: {
            nivel: 4,
            nome: "Lunetas Astronômicas",
            descricao: "Telescópios de longo alcance para observação da fauna silvestre e das estrelas.",
            materiais: ["Lunetas de latão", "Painel de identificação de aves"],
          },
          5: {
            nivel: 5,
            nome: "Mirante nas Nuvens",
            descricao: "Plataforma panorâmica completada com névoa fresca da montanha e vista infinita.",
            materiais: ["Bandeira no mastro", "Reflexo no vidro", "Névoa alpina"],
          },
        },
      },
      {
        id: "montanha_cachoeira",
        nome: "Santuário das Águas Cristalinas",
        subtitulo: "Passarela de madeira e mirante ao lado da grande cascata de água pura",
        categoria: "natureza",
        posicao: { x: 26, y: 55 }, // Ao lado da queda d'água
        escala: 1.05,
        materiaisPrincipais: ["Madeira Rústica Tratada", "Musgo Nativo", "Pedras Roladas"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Trilha na Encosta",
            descricao: "Abertura de degraus de terra e pedra na mata ciliar ao lado da queda d'água.",
            materiais: ["Degraus de contenção", "Corrimão de cipó"],
          },
          2: {
            nivel: 2,
            nome: "Pilares no Riacho",
            descricao: "Encaixe de troncos roliços de eucalipto tratado entre as pedras do córrego.",
            materiais: ["Troncos roliços", "Grampos metálicos"],
          },
          3: {
            nivel: 3,
            nome: "Passarela Suspensa",
            descricao: "Tablado de madeira com corrimão firme levando até o poço da cascata.",
            materiais: ["Pranchões ranhurados antiderrapantes"],
          },
          4: {
            nivel: 4,
            nome: "Balcão das Bromélias",
            descricao: "Pérgula de madeira coberta por orquídeas e bromélias nativas da serra.",
            materiais: ["Bromélias floridas", "Bancos de tora esculpidos"],
          },
          5: {
            nivel: 5,
            nome: "Cascata & Arco-íris",
            descricao: "Espaço deslumbrante com arco-íris permanente na névoa da queda d'água.",
            materiais: ["Arco-íris na névoa", "Água cristalina", "Flores montanhesas"],
          },
        },
      },
      {
        id: "montanha_agroecologia",
        nome: "Centro de Agroecologia da Serra",
        subtitulo: "Complexo com estufas, hortas em curvas de nível e colmeias de abelhas nativas",
        categoria: "ciencia",
        posicao: { x: 46, y: 52 }, // No meio dos terraços agrícolas
        escala: 1.0,
        materiaisPrincipais: ["Terra Cota", "Compostagem Orgânica", "Telhado Verde Vivo"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Terraços em Curvas de Nível",
            descricao: "Modelagem do relevo para conservação da água e solo fértil da serra.",
            materiais: ["Curvas de nível", "Adubação verde"],
          },
          2: {
            nivel: 2,
            nome: "Canteiros Agroflorestais",
            descricao: "Plantio consorciado de espécies nativas, frutíferas e plantas medicinais.",
            materiais: ["Mudas de araucária", "Sementes crioulas"],
          },
          3: {
            nivel: 3,
            nome: "Estufa com Telhado Verde",
            descricao: "Galpão rústico de pedra com telhado plantado de gramíneas e flores.",
            materiais: ["Manta impermeável", "Substrato orgânico"],
          },
          4: {
            nivel: 4,
            nome: "Meliponário das Abelhas sem Ferrão",
            descricao: "Caixas racionais de jataí, uruçu e mandaçaia para polinização do vale.",
            materiais: ["Caixas de abelha jataí", "Fontes de água com pedras"],
          },
          5: {
            nivel: 5,
            nome: "Fazenda Sustentável Modelo",
            descricao: "Centro agroecológico de excelência gerando alimentos puros e preservação.",
            materiais: ["Flores polinizadas", "Cestas de colheita", "Gemas da terra"],
          },
        },
      },
      {
        id: "montanha_chale",
        nome: "Chalé Suíço dos Mestres",
        subtitulo: "Residência de montanha em estilo alpino com varanda florida e lareira de pedra",
        categoria: "cultura",
        posicao: { x: 80, y: 72 }, // Chalé à direita em primeiro plano
        escala: 1.18,
        materiaisPrincipais: ["Toras Aparelhadas", "Vidros Térmicos", "Chaminé de Granito"],
        estagios: {
          1: {
            nivel: 1,
            nome: "Platô Gramado",
            descricao: "Assentamento de pedras de base para proteger a madeira da umidade do solo.",
            materiais: ["Alvenaria de pedra", "Drenos de brita"],
          },
          2: {
            nivel: 2,
            nome: "Estrutura de Madeira Entalhada",
            descricao: "Encaixe de toras maciças no método clássico sem pregos aparentes.",
            materiais: ["Toras encaixadas", "Pisos de pinho"],
          },
          3: {
            nivel: 3,
            nome: "Telhado Alpino Inclinado",
            descricao: "Telhado de alta inclinação para escoamento das chuvas serranas com beirais largos.",
            materiais: ["Telhas de barro", "Beirais esculpidos"],
          },
          4: {
            nivel: 4,
            nome: "Floreiras & Chaminé",
            descricao: "Caixas de gerânios nas janelas e lareira acolhedora com chaminé de pedra.",
            materiais: ["Gerânios vermelhos", "Chaminé de pedra"],
          },
          5: {
            nivel: 5,
            nome: "Chalé Serrano Acolhedor",
            descricao: "Refúgio alpino impecável com fumaça mansa na chaminé e luzes quentes acesas.",
            materiais: ["Lareira acesa", "Luzes douradas", "Bandeira da serra"],
          },
        },
      },
    ],
  },
];

export function obterCidadePorId(id: number): CidadeTema {
  const encontrada = CIDADES_DATA.find((c) => c.id === id);
  return encontrada || CIDADES_DATA[0];
}

export function obterCustoEstagio(cidadeId: number, estagioNivel: number): number {
  const cidade = obterCidadePorId(cidadeId);
  const peso = [1, 1.5, 2.5, 4.0, 6.0][Math.min(4, Math.max(0, estagioNivel - 1))] || 8.0;
  return Math.round(cidade.baseCusto * peso);
}
