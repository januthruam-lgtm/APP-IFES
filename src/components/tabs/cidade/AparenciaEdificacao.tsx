import React from "react";
import {
  Sparkles,
  Award,
} from "lucide-react";

export interface InfoAparencia {
  rotulo: string;
  descricao: string;
  emoji: string;
  corPrimaria: string;
}

export function obterInfoAparencia(chave: string, nivel: number): InfoAparencia {
  const niv = Math.max(1, nivel || 1);

  const LORE_EDIFICACOES: Record<
    string,
    Record<number, { rotulo: string; descricao: string; emoji: string }>
  > = {
    biblioteca: {
      1: {
        rotulo: "Fundação de Papiro",
        descricao: "Pedras fundamentais, estacas de demarcação e pergaminho da planta arquitetônica.",
        emoji: "📜",
      },
      2: {
        rotulo: "Tenda do Escriba",
        descricao: "Tenda de lona com estantes de carvalho, lamparina a óleo e fogueira de estudos.",
        emoji: "⛺",
      },
      3: {
        rotulo: "Pavilhão dos Tomos",
        descricao: "Casa de pedra com telhado vermelho, vitrais iluminados e chaminé acolhedora.",
        emoji: "🏡",
      },
      4: {
        rotulo: "Colégio Universitário",
        descricao: "Academia clássica de 3 andares com colunas jônicas, relógio e estátuas dos sábios.",
        emoji: "🏛️",
      },
      5: {
        rotulo: "Monumento da Sabedoria",
        descricao: "Catedral dourada do saber com cúpula de ouro, águas límpidas e orbe iluminado.",
        emoji: "🏰",
      },
    },
    laboratorio: {
      1: {
        rotulo: "Bancada Mineral",
        descricao: "Mesa ao ar livre com almofariz, frascos de ensaio e amostras minerais.",
        emoji: "🧪",
      },
      2: {
        rotulo: "Tenda Alquímica",
        descricao: "Alambique de vidro, serpentinas de condensação e fogo brando de destilação.",
        emoji: "⚗️",
      },
      3: {
        rotulo: "Oficina Mecânica",
        descricao: "Edifício com forjas, engrenagens de bronze e chaminé com vapor contínuo.",
        emoji: "⚙️",
      },
      4: {
        rotulo: "Instituto Experimental",
        descricao: "Complexo com bobinas elétricas, estufa de botânica e telescópio espectral.",
        emoji: "🔬",
      },
      5: {
        rotulo: "Colisor Quântico",
        descricao: "Monumento de ciência com esfera de plasma flutuante e giroscópio de energia cósmica.",
        emoji: "⚛️",
      },
    },
    observatorio: {
      1: {
        rotulo: "Tripé Celeste",
        descricao: "Tripé rústico com astrolábio de latão e cartas celestes sob as estrelas.",
        emoji: "🧭",
      },
      2: {
        rotulo: "Torreta Estelar",
        descricao: "Torre de vigia em madeira com luneta refratora de bronze e bússola.",
        emoji: "🔭",
      },
      3: {
        rotulo: "Torre de Pedra",
        descricao: "Cúpula de cobre rotativa com quadrante mural e telescópio duplo.",
        emoji: "🌌",
      },
      4: {
        rotulo: "Observatório Astral",
        descricao: "Cúpula dupla com lentes refratoras gigantes e biblioteca de constelações.",
        emoji: "🪐",
      },
      5: {
        rotulo: "Cúpula do Cosmos",
        descricao: "Santuário estelar com prisma celestial flutuante e aurora boreal perpétua.",
        emoji: "🌠",
      },
    },
    dormitorio: {
      1: {
        rotulo: "Rede sob as Copas",
        descricao: "Esteiras de palha e rede trançada entre as árvores com fogueira simples.",
        emoji: "🛏️",
      },
      2: {
        rotulo: "Cabana de Toras",
        descricao: "Cabana acolhedora com camas rústicas de feno, mantas e caneca de chá.",
        emoji: "🪵",
      },
      3: {
        rotulo: "Chalé dos Estudantes",
        descricao: "Residência com varanda florida, lareira e janelas aquecidas de carvalho.",
        emoji: "🏠",
      },
      4: {
        rotulo: "Residência Acadêmica",
        descricao: "Prédio de dormitórios com sacadas floridas, salão de jogos e biblioteca interna.",
        emoji: "🏢",
      },
      5: {
        rotulo: "Palácio dos Mascotes",
        descricao: "Paraíso com fontes termais aquecidas, camas de plumas douradas e arco-íris.",
        emoji: "🌈",
      },
    },
    auditorio: {
      1: {
        rotulo: "Círculo de Toras",
        descricao: "Círculo de pedras e toras de madeira para reuniões e rodas de conversa.",
        emoji: "🪵",
      },
      2: {
        rotulo: "Coreto de Madeira",
        descricao: "Estrado de madeira com coreto, bancos alinhados e mastros com bandeiras.",
        emoji: "🎭",
      },
      3: {
        rotulo: "Anfiteatro Rústico",
        descricao: "Anfiteatro semicircular com concha acústica e degraus de tijolos.",
        emoji: "🎪",
      },
      4: {
        rotulo: "Teatro Acadêmico",
        descricao: "Grande auditório com cortinas escarlates, balcões de mármore e lustre.",
        emoji: "🏛️",
      },
      5: {
        rotulo: "Ágora Magna Imperial",
        descricao: "Colunata monumental com tochas perpétuas, estátuas douradas e tribuna magna.",
        emoji: "👑",
      },
    },
    praca: {
      1: {
        rotulo: "Clareira do Encontro",
        descricao: "Gramado aparado com trilhas de terra batida e marcos de pedra polida.",
        emoji: "🌿",
      },
      2: {
        rotulo: "Jardim Comunitário",
        descricao: "Canteiros de flores coloridas, bancos de praça e arbustos podados.",
        emoji: "🌸",
      },
      3: {
        rotulo: "Praça do Chafariz",
        descricao: "Calçamento de pedra portuguesa com chafariz central e postes de luz.",
        emoji: "⛲",
      },
      4: {
        rotulo: "Alameda dos Mestres",
        descricao: "Pérgolas de glicínias, relógio de sol monumental e estátuas comemorativas.",
        emoji: "🌳",
      },
      5: {
        rotulo: "Praça Imperial da Glória",
        descricao: "Mosaicos dourados, cascatas luminosas e estátua alada dos campeões acadêmicos.",
        emoji: "🌟",
      },
    },
  };

  const lista = LORE_EDIFICACOES[chave] || LORE_EDIFICACOES.biblioteca;
  if (niv <= 5) {
    const item = lista[niv] || lista[1];
    return {
      rotulo: item.rotulo,
      descricao: item.descricao,
      emoji: item.emoji,
      corPrimaria: niv === 5 ? "from-amber-400 to-yellow-500" : "from-slate-700 to-slate-800",
    };
  }

  // Nível > 5: Estágios de Mestria
  const grau = niv - 5;
  const algarismo = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][Math.min(9, grau - 1)] || `${grau}`;
  return {
    rotulo: `Monumento de Mestria ${algarismo}`,
    descricao: `Estrutura lendária com aura celestial de nível ${niv}, irradiando bônus acadêmicos contínuos.`,
    emoji: "💎",
    corPrimaria: "from-cyan-400 via-blue-500 to-indigo-600",
  };
}

interface AparenciaEdificacaoProps {
  chave: string;
  nivel: number;
  tamanho?: "sm" | "md" | "lg";
  destaque?: boolean;
}

export const AparenciaEdificacao: React.FC<AparenciaEdificacaoProps> = ({
  chave,
  nivel,
  tamanho = "md",
  destaque = false,
}) => {
  const info = obterInfoAparencia(chave, nivel);
  const isMonumento = nivel >= 5;
  const isMestria = nivel > 5;

  const dimensoes = {
    sm: "w-10 h-10 text-xl",
    md: "w-14 h-14 text-3xl",
    lg: "w-20 h-20 text-4xl",
  }[tamanho];

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl border-2 transition-all duration-300 select-none ${dimensoes} ${
        isMestria
          ? "bg-gradient-to-tr from-cyan-950 via-slate-900 to-indigo-950 border-cyan-400 shadow-xl shadow-cyan-500/30"
          : isMonumento
          ? "bg-gradient-to-tr from-amber-950 via-slate-900 to-yellow-950 border-amber-400 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400/40"
          : "bg-slate-900/90 border-slate-700 shadow-md"
      } ${destaque ? "scale-110" : ""}`}
    >
      {/* Emojis e Silhuetas Variadas */}
      <span className="filter drop-shadow-md transform transition-transform duration-300 hover:scale-115">
        {info.emoji}
      </span>

      {/* Brilho Especial para Monumentos de Nível 5+ */}
      {isMonumento && (
        <div className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 shadow-md animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Ícone de Mestria Celestial para Nível 6+ */}
      {isMestria && (
        <div className="absolute -bottom-1 -right-1 px-1 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-black shadow-md">
          +{nivel - 5}
        </div>
      )}
    </div>
  );
};
