import React from "react";
import { MonumentoDefinicao } from "../types";

interface MonumentoVisualProps {
  monumento: MonumentoDefinicao;
  nivel: number; // 1 a 5 (ou 6+)
  emConstrucao: boolean;
}

export const MonumentoVisual: React.FC<MonumentoVisualProps> = ({
  monumento,
  nivel,
  emConstrucao,
}) => {
  const estagio = Math.min(5, Math.max(1, nivel));
  const isMestria = nivel > 5;
  const isConcluido = estagio >= 5;

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-500 select-none ${
        emConstrucao ? "scale-105" : "hover:scale-103"
      }`}
      style={{
        width: 140,
        height: 140,
      }}
    >
      {/* Sombra de Contato Natural com o Terreno (sem cartões ou caixas!) */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-950/40 rounded-full blur-md pointer-events-none" />

      {/* Brilho Dourado/Místico de Mestria */}
      {isMestria && (
        <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse pointer-events-none" />
      )}

      {/* Renderização Vetorial Temática Específica do Estágio */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {estagio === 1 && <VisualEstagio1Terreno categoria={monumento.categoria} />}
        {estagio === 2 && <VisualEstagio2Fundacao categoria={monumento.categoria} />}
        {estagio === 3 && <VisualEstagio3Estrutura id={monumento.id} categoria={monumento.categoria} />}
        {estagio === 4 && <VisualEstagio4Avancado id={monumento.id} categoria={monumento.categoria} />}
        {estagio >= 5 && <VisualEstagio5Finalizado id={monumento.id} isMestria={isMestria} />}
      </div>

      {/* Partículas Douradas Flutuantes quando o monumento está 100% Finalizado */}
      {isConcluido && !emConstrucao && (
        <div className="absolute -top-2 -right-1 pointer-events-none">
          <span className="inline-block animate-bounce text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">
            ✨
          </span>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   ESTÁGIO 1: TERRENO DEMARCADO & VAZIO
   Estacas de madeira, cordas de demarcação, planta de arquitetura aberta no chão.
   ========================================================================= */
const VisualEstagio1Terreno: React.FC<{ categoria: string }> = ({ categoria }) => (
  <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-md">
    {/* Terreno aplainado de terra batida / grama */}
    <ellipse cx="60" cy="85" rx="46" ry="18" fill="#5c4033" opacity="0.45" />
    <ellipse cx="60" cy="84" rx="42" ry="15" fill="#78553d" opacity="0.75" />

    {/* Estacas de madeira nos vértices com fitas de marcação */}
    <g stroke="#3e2723" strokeWidth="2.5" strokeLinecap="round">
      <line x1="28" y1="92" x2="28" y2="72" />
      <line x1="92" y1="92" x2="92" y2="72" />
      <line x1="42" y1="74" x2="42" y2="58" />
      <line x1="78" y1="74" x2="78" y2="58" />
    </g>

    {/* Fita de demarcação colorida unindo as estacas */}
    <polygon
      points="28,73 92,73 78,60 42,60"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="1.8"
      strokeDasharray="4 3"
    />

    {/* Fita zebrada/bandeirolas */}
    <circle cx="28" cy="72" r="3.5" fill="#ef4444" />
    <circle cx="92" cy="72" r="3.5" fill="#ef4444" />
    <circle cx="42" cy="58" r="3" fill="#ef4444" />
    <circle cx="78" cy="58" r="3" fill="#ef4444" />

    {/* Pedra com planta arquitetônica / pergaminho desenrolado */}
    <ellipse cx="60" cy="82" rx="14" ry="7" fill="#64748b" />
    <rect x="52" y="77" width="16" height="10" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
    <line x1="55" y1="80" x2="65" y2="80" stroke="#0284c7" strokeWidth="1" strokeDasharray="1.5" />
    <line x1="55" y1="83" x2="65" y2="83" stroke="#0284c7" strokeWidth="1" strokeDasharray="1.5" />
  </svg>
);

/* =========================================================================
   ESTÁGIO 2: PREPARAÇÃO DO TERRENO & FUNDAÇÃO
   Sapatas de concreto/pedra, valas, vergalhões de ferro, paletes de madeira.
   ========================================================================= */
const VisualEstagio2Fundacao: React.FC<{ categoria: string }> = ({ categoria }) => (
  <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-lg">
    {/* Base escavada */}
    <ellipse cx="60" cy="86" rx="48" ry="19" fill="#451a03" opacity="0.6" />

    {/* Blocos de fundação de pedra / concreto armado */}
    <rect x="32" y="76" width="56" height="14" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
    <rect x="38" y="70" width="44" height="10" rx="1.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />

    {/* Vergalhões de ferro / estacas de aço subindo da fundação */}
    <g stroke="#e11d48" strokeWidth="2" strokeLinecap="round">
      <line x1="42" y1="70" x2="42" y2="48" />
      <line x1="52" y1="70" x2="52" y2="44" />
      <line x1="68" y1="70" x2="68" y2="44" />
      <line x1="78" y1="70" x2="78" y2="48" />
    </g>

    {/* Pilhas de tábuas de madeira e sacos de argamassa */}
    <rect x="22" y="84" width="14" height="4" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
    <rect x="23" y="81" width="13" height="3.5" fill="#d97706" stroke="#78350f" strokeWidth="0.8" />
    <rect x="24" y="78" width="11" height="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />

    {/* Sacos de areia / argamassa à direita */}
    <ellipse cx="94" cy="87" rx="8" ry="4" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
    <ellipse cx="93" cy="83" rx="7" ry="3.5" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
  </svg>
);

/* =========================================================================
   ESTÁGIO 3: ESTRUTURA PRINCIPAL & VIGAMENTO
   Paredes em elevação, andaimes de bambu/madeira, vigamento superior.
   ========================================================================= */
const VisualEstagio3Estrutura: React.FC<{ id: string; categoria: string }> = ({ id, categoria }) => (
  <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-xl">
    {/* Base e piso térreo */}
    <rect x="34" y="72" width="52" height="20" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />

    {/* Vãos das portas/janelas em construção */}
    <rect x="52" y="78" width="16" height="14" rx="2" fill="#1e293b" />

    {/* Vigas verticais e horizontais em esqueleto */}
    <g stroke="#b45309" strokeWidth="3" strokeLinecap="round">
      <line x1="36" y1="72" x2="36" y2="38" />
      <line x1="84" y1="72" x2="84" y2="38" />
      <line x1="60" y1="72" x2="60" y2="32" />
      {/* Viga mestra superior */}
      <line x1="34" y1="42" x2="86" y2="42" />
      {/* Triângulo do telhado / viga de cumeeira */}
      <line x1="36" y1="42" x2="60" y2="28" />
      <line x1="84" y1="42" x2="60" y2="28" />
    </g>

    {/* Andaime lateral com escada */}
    <g stroke="#d97706" strokeWidth="1.5">
      <line x1="90" y1="88" x2="90" y2="36" />
      <line x1="98" y1="88" x2="98" y2="36" />
      <line x1="90" y1="48" x2="98" y2="48" />
      <line x1="90" y1="62" x2="98" y2="62" />
      <line x1="90" y1="76" x2="98" y2="76" />
      {/* Prancha de trabalho */}
      <rect x="76" y="46" width="26" height="3" fill="#f59e0b" />
    </g>

    {/* Balde de argamassa suspenso por corda */}
    <line x1="60" y1="28" x2="60" y2="46" stroke="#ca8a04" strokeWidth="1" strokeDasharray="1" />
    <path d="M 57 46 L 63 46 L 62 52 L 58 52 Z" fill="#64748b" />
  </svg>
);

/* =========================================================================
   ESTÁGIO 4: CONSTRUÇÃO AVANÇADA
   Paredes fechadas, telhado quase completo, janelas e detalhes instalados.
   ========================================================================= */
const VisualEstagio4Avancado: React.FC<{ id: string; categoria: string }> = ({ id, categoria }) => (
  <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-xl">
    {/* Paredes sólidas da edificação */}
    <rect x="32" y="56" width="56" height="36" rx="3" fill="#f8fafc" stroke="#334155" strokeWidth="2" />

    {/* Porta principal acabada */}
    <path d="M 50 92 L 50 72 Q 60 66 70 72 L 70 92 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
    <circle cx="66" cy="82" r="1.5" fill="#f59e0b" />

    {/* Janelas laterais com vidros azuis */}
    <rect x="36" y="64" width="10" height="14" rx="2" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" />
    <line x1="41" y1="64" x2="41" y2="78" stroke="#ffffff" strokeWidth="1" />
    <line x1="36" y1="71" x2="46" y2="71" stroke="#ffffff" strokeWidth="1" />

    <rect x="74" y="64" width="10" height="14" rx="2" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.2" />
    <line x1="79" y1="64" x2="79" y2="78" stroke="#ffffff" strokeWidth="1" />
    <line x1="74" y1="71" x2="84" y2="71" stroke="#ffffff" strokeWidth="1" />

    {/* Telhado quase pronto (telhas de barro ou painéis) */}
    <polygon points="26,56 60,30 94,56" fill="#ea580c" stroke="#9a3412" strokeWidth="2" />
    {/* Ripa / área de telha ainda sendo pregada */}
    <polygon points="60,30 94,56 78,56 60,42" fill="#f97316" />

    {/* Escada encostada na fachada com operário/capacete */}
    <line x1="40" y1="92" x2="48" y2="54" stroke="#d97706" strokeWidth="2" />
    <line x1="44" y1="92" x2="52" y2="54" stroke="#d97706" strokeWidth="2" />
    <line x1="41" y1="84" x2="45" y2="84" stroke="#d97706" strokeWidth="1.5" />
    <line x1="43" y1="74" x2="47" y2="74" stroke="#d97706" strokeWidth="1.5" />
    <line x1="46" y1="64" x2="50" y2="64" stroke="#d97706" strokeWidth="1.5" />

    {/* Capacete amarelo no telhado */}
    <ellipse cx="68" cy="38" rx="4.5" ry="3" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
  </svg>
);

/* =========================================================================
   ESTÁGIO 5 / 6: MONUMENTO FINALIZADO & RESPLANDECENTE
   Cada um dos monumentos tem seu desenho único e representativo!
   ========================================================================= */
const VisualEstagio5Finalizado: React.FC<{ id: string; isMestria: boolean }> = ({ id, isMestria }) => {
  // 1. Farol Náutico
  if (id === "litoranea_farol") {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xl">
        {/* Base de rocha marinha */}
        <ellipse cx="60" cy="94" rx="42" ry="12" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
        {/* Torre do farol com faixas vermelhas e brancas */}
        <polygon points="46,92 50,38 70,38 74,92" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
        <polygon points="48,76 72,76 71,62 49,62" fill="#dc2626" />
        <polygon points="50,48 70,48 69,38 51,38" fill="#dc2626" />
        {/* Lanterna do Farol */}
        <rect x="52" y="24" width="16" height="14" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        {/* Feixe de luz rotativo */}
        <polygon points="60,31 115,10 115,50" fill="url(#farolFeixe)" opacity="0.65" />
        {/* Cúpula e para-raios */}
        <path d="M 50 24 Q 60 14 70 24 Z" fill="#0f172a" />
        <line x1="60" y1="14" x2="60" y2="6" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="60" cy="5" r="2" fill="#f59e0b" />
        <defs>
          <linearGradient id="farolFeixe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 2. Aquário / Centro de Biologia Marinha
  if (id === "litoranea_aquario") {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xl">
        <ellipse cx="60" cy="90" rx="44" ry="14" fill="#0284c7" opacity="0.3" />
        {/* Domo de vidro azul com água e peixes */}
        <path d="M 28 84 Q 60 22 92 84 Z" fill="#38bdf8" opacity="0.85" stroke="#0369a1" strokeWidth="2" />
        <path d="M 38 84 Q 60 38 82 84 Z" fill="#0284c7" opacity="0.6" />
        {/* Silhueta de peixe/tartaruga dentro */}
        <ellipse cx="56" cy="65" rx="6" ry="3" fill="#f59e0b" />
        <polygon points="50,65 46,62 46,68" fill="#f59e0b" />
        {/* Entrada com portal de concha */}
        <rect x="52" y="74" width="16" height="16" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
        <circle cx="60" cy="52" r="3" fill="#ffffff" opacity="0.8" />
        <circle cx="68" cy="45" r="2" fill="#ffffff" opacity="0.7" />
      </svg>
    );
  }

  // 3. Pier & Caravela
  if (id === "litoranea_pier") {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xl">
        {/* Tablado de madeira sobre a água */}
        <polygon points="18,88 102,88 92,72 28,72" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
        {/* Pilares no mar */}
        <line x1="26" y1="88" x2="26" y2="102" stroke="#451a03" strokeWidth="3" />
        <line x1="50" y1="88" x2="50" y2="102" stroke="#451a03" strokeWidth="3" />
        <line x1="74" y1="88" x2="74" y2="102" stroke="#451a03" strokeWidth="3" />
        <line x1="94" y1="88" x2="94" y2="102" stroke="#451a03" strokeWidth="3" />
        {/* Barco à vela atracado */}
        <path d="M 52 74 Q 68 86 88 74 L 84 66 L 56 66 Z" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
        <line x1="70" y1="66" x2="70" y2="34" stroke="#451a03" strokeWidth="2" />
        <polygon points="70,36 88,48 70,54" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        {/* Lampião no píer */}
        <line x1="32" y1="72" x2="32" y2="52" stroke="#0f172a" strokeWidth="1.8" />
        <circle cx="32" cy="50" r="3" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      </svg>
    );
  }

  // 4. Convento Histórico (Colonial)
  if (id === "historica_convento") {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xl">
        {/* Morro de pedra */}
        <ellipse cx="60" cy="94" rx="46" ry="12" fill="#334155" />
        {/* Fachada colonial caiada com telhados de barro */}
        <rect x="36" y="52" width="48" height="38" rx="2" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
        <polygon points="32,52 60,32 88,52" fill="#c2410c" stroke="#9a3412" strokeWidth="2" />
        {/* Portal barroco */}
        <path d="M 54 90 L 54 74 Q 60 70 66 74 L 66 90 Z" fill="#15803d" stroke="#14532d" strokeWidth="1.5" />
        {/* Janelas coloniais verdes com arcos */}
        <rect x="42" y="60" width="8" height="12" rx="1.5" fill="#15803d" />
        <rect x="70" y="60" width="8" height="12" rx="1.5" fill="#15803d" />
        {/* Torre sineira central com sino de ouro */}
        <rect x="52" y="24" width="16" height="16" rx="2" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" />
        <circle cx="60" cy="32" r="3" fill="#f59e0b" />
        {/* Cruz no topo */}
        <line x1="60" y1="24" x2="60" y2="12" stroke="#b45309" strokeWidth="2" />
        <line x1="56" y1="16" x2="64" y2="16" stroke="#b45309" strokeWidth="2" />
      </svg>
    );
  }

  // 5. Chafariz Imperial
  if (id === "historica_chafariz") {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xl">
        <ellipse cx="60" cy="92" rx="44" ry="14" fill="#38bdf8" opacity="0.4" />
        {/* Bacia octogonal de cantaria */}
        <ellipse cx="60" cy="88" rx="38" ry="11" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
        <ellipse cx="60" cy="86" rx="34" ry="9" fill="#0284c7" />
        {/* Coluna barroca central */}
        <rect x="54" y="56" width="12" height="30" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.8" />
        {/* Prato superior */}
        <ellipse cx="60" cy="56" rx="18" ry="6" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="60" cy="55" rx="15" ry="4.5" fill="#38bdf8" />
        {/* Pináculo e jatos d'água */}
        <path d="M 58 55 Q 60 38 60 34 Q 60 38 62 55 Z" fill="#94a3b8" />
        {/* Jatos de água cristalina caindo */}
        <path d="M 60 34 Q 46 44 46 56" fill="none" stroke="#e0f2fe" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 60 34 Q 74 44 74 56" fill="none" stroke="#e0f2fe" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 46 56 Q 36 68 36 86" fill="none" stroke="#bae6fd" strokeWidth="1.5" />
        <path d="M 74 56 Q 84 68 84 86" fill="none" stroke="#bae6fd" strokeWidth="1.5" />
      </svg>
    );
  }

  // 6. Biocúpula Geodésica (Tech)
  if (id === "tech_domo") {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xl">
        <ellipse cx="60" cy="90" rx="45" ry="13" fill="#10b981" opacity="0.35" />
        {/* Semiesfera geodésica brilhante */}
        <path d="M 24 84 Q 60 18 96 84 Z" fill="#064e3b" opacity="0.6" stroke="#10b981" strokeWidth="2.5" />
        {/* Linhas da treliça triangular */}
        <g stroke="#34d399" strokeWidth="1.2" opacity="0.8">
          <line x1="60" y1="24" x2="36" y2="58" />
          <line x1="60" y1="24" x2="84" y2="58" />
          <line x1="36" y1="58" x2="84" y2="58" />
          <line x1="36" y1="58" x2="28" y2="84" />
          <line x1="84" y1="58" x2="92" y2="84" />
          <line x1="60" y1="58" x2="60" y2="84" />
        </g>
        {/* Portal de entrada oval fluorescente */}
        <ellipse cx="60" cy="82" rx="10" ry="12" fill="#047857" stroke="#6ee7b7" strokeWidth="2" />
        <circle cx="60" cy="78" r="4" fill="#a7f3d0" />
      </svg>
    );
  }

  // 7. Torres de Hiperconexão (Tech)
  if (id === "tech_torres") {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xl">
        <ellipse cx="60" cy="92" rx="42" ry="12" fill="#0284c7" opacity="0.3" />
        {/* Torre Esquerda */}
        <path d="M 32 90 L 36 44 Q 44 40 48 48 L 48 90 Z" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.8" />
        {/* Torre Central (Mais Alta) */}
        <path d="M 48 90 L 52 24 Q 64 18 68 28 L 68 90 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
        {/* Torre Direita */}
        <path d="M 68 90 L 72 40 Q 80 36 84 44 L 84 90 Z" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.8" />
        {/* Painéis solares fotovoltaicos no teto */}
        <ellipse cx="60" cy="24" rx="7" ry="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
        {/* Feixe laser vertical conectando ao espaço */}
        <line x1="60" y1="21" x2="60" y2="4" stroke="#67e8f9" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="4" r="3" fill="#cffafe" />
      </svg>
    );
  }

  // 8. Moinho Hidráulico (Montanha)
  if (id === "montanha_moinho") {
    return (
      <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xl">
        <ellipse cx="60" cy="92" rx="42" ry="12" fill="#0284c7" opacity="0.4" />
        {/* Casa do moinho em madeira */}
        <rect x="28" y="52" width="44" height="38" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="2" />
        <polygon points="24,54 50,30 76,54" fill="#9a3412" stroke="#431407" strokeWidth="1.8" />
        <rect x="42" y="68" width="14" height="22" fill="#451a03" />
        {/* Roda d'água grande à direita girando */}
        <g transform="translate(84, 72)">
          <circle cx="0" cy="0" r="20" fill="none" stroke="#b45309" strokeWidth="4" />
          <circle cx="0" cy="0" r="5" fill="#451a03" />
          <line x1="-19" y1="0" x2="19" y2="0" stroke="#78350f" strokeWidth="2.5" />
          <line x1="0" y1="-19" x2="0" y2="19" stroke="#78350f" strokeWidth="2.5" />
          <line x1="-14" y1="-14" x2="14" y2="14" stroke="#78350f" strokeWidth="2" />
          <line x1="-14" y1="14" x2="14" y2="-14" stroke="#78350f" strokeWidth="2" />
          {/* Gotas de água espirrando da roda */}
          <circle cx="-12" cy="18" r="2" fill="#38bdf8" />
          <circle cx="8" cy="22" r="2.5" fill="#bae6fd" />
        </g>
      </svg>
    );
  }

  // Fallback padrão elegante: Monumento da Sabedoria Arquitetônico
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28 drop-shadow-2xl">
      <ellipse cx="60" cy="92" rx="44" ry="13" fill="#0f172a" opacity="0.35" />
      {/* Colunas clássicas e frontão greco-romano */}
      <rect x="30" y="86" width="60" height="8" rx="1.5" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
      <g fill="#cbd5e1" stroke="#475569" strokeWidth="1.5">
        <rect x="36" y="52" width="8" height="34" rx="1" />
        <rect x="50" y="52" width="8" height="34" rx="1" />
        <rect x="62" y="52" width="8" height="34" rx="1" />
        <rect x="76" y="52" width="8" height="34" rx="1" />
      </g>
      {/* Frontão triangular com medalhão */}
      <polygon points="26,52 60,26 94,52" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
      <circle cx="60" cy="42" r="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
      {/* Bandeira triunfante */}
      <line x1="60" y1="26" x2="60" y2="12" stroke="#334155" strokeWidth="2" />
      <polygon points="60,13 74,18 60,23" fill="#e11d48" />
    </svg>
  );
};
