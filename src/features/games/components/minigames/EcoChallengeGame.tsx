import React, { useState, useEffect } from "react";
import {
  Leaf,
  DollarSign,
  Zap,
  Bus,
  Heart,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  ChevronRight,
  AlertTriangle,
  Building,
  CheckCircle2,
} from "lucide-react";
import {
  ECO_PROJECTS_POOL,
  ECO_CRISIS_EVENTS,
  EcoProjectChoice,
  EcoCrisisEvent,
} from "../../data/ecoProjects";
import { gameAudio } from "../../audio";
import { SessionResultPayload } from "../../services/gamesService";

interface EcoChallengeGameProps {
  userId: string;
  userName: string;
  sessionToken: string;
  onFinishGame: (payload: SessionResultPayload) => void;
  onExit: () => void;
}

interface CityIndicators {
  orcamento: number; // R$
  energiaLimpa: number; // 0 a 100%
  meioAmbiente: number; // 0 a 100%
  transporte: number; // 0 a 100%
  qualidadeVida: number; // 0 a 100%
}

export const EcoChallengeGame: React.FC<EcoChallengeGameProps> = ({
  sessionToken,
  onFinishGame,
  onExit,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(1);
  const TOTAL_YEARS = 10;

  const [indicators, setIndicators] = useState<CityIndicators>({
    orcamento: 65000,
    energiaLimpa: 30,
    meioAmbiente: 40,
    transporte: 25,
    qualidadeVida: 45,
  });

  const [yearlyProjects, setYearlyProjects] = useState<EcoProjectChoice[]>([]);
  const [selectedProjectsThisYear, setSelectedProjectsThisYear] = useState<string[]>([]);
  const [currentCrisis, setCurrentCrisis] = useState<EcoCrisisEvent | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());
  const [carbonSavedTotal, setCarbonSavedTotal] = useState<number>(0);

  const generateYearProjects = () => {
    const shuffled = [...ECO_PROJECTS_POOL].sort(() => Math.random() - 0.5);
    setYearlyProjects(shuffled.slice(0, 3));
    setSelectedProjectsThisYear([]);

    // Chance de 35% de evento climático a cada 2 anos
    if (Math.random() < 0.45 && currentYear > 1 && currentYear < 9) {
      const crisis = ECO_CRISIS_EVENTS[Math.floor(Math.random() * ECO_CRISIS_EVENTS.length)];
      setCurrentCrisis(crisis);
    } else {
      setCurrentCrisis(null);
    }
  };

  useEffect(() => {
    generateYearProjects();
  }, [currentYear]);

  const handleToggleProject = (proj: EcoProjectChoice) => {
    gameAudio.playClick();
    if (selectedProjectsThisYear.includes(proj.id)) {
      setSelectedProjectsThisYear((prev) => prev.filter((id) => id !== proj.id));
    } else {
      if (selectedProjectsThisYear.length >= 2) return; // Limite de 2 por ano
      if (indicators.orcamento < proj.cost) return; // Saldo insuficiente
      setSelectedProjectsThisYear((prev) => [...prev, proj.id]);
    }
  };

  const handleAdvanceYear = () => {
    gameAudio.playVictory();

    // Aplica os projetos aprovados
    let deltaOrcamento = 18000; // Receita anual de impostos/taxas sustentáveis do município
    let deltaEnergia = 0;
    let deltaMeioAmbiente = 0;
    let deltaTransporte = 0;
    let deltaQualidade = 0;
    let carbonAdded = 0;

    yearlyProjects.forEach((proj) => {
      if (selectedProjectsThisYear.includes(proj.id)) {
        deltaOrcamento += proj.deltas.orcamento;
        deltaEnergia += proj.deltas.energiaLimpa;
        deltaMeioAmbiente += proj.deltas.meioAmbiente;
        deltaTransporte += proj.deltas.transporte;
        deltaQualidade += proj.deltas.qualidadeVida;
        carbonAdded += proj.carbonReducedTons;
      }
    });

    // Aplica crise se ativa
    if (currentCrisis) {
      if (currentCrisis.impactDeltas.orcamento) deltaOrcamento += currentCrisis.impactDeltas.orcamento;
      if (currentCrisis.impactDeltas.energiaLimpa) deltaEnergia += currentCrisis.impactDeltas.energiaLimpa;
      if (currentCrisis.impactDeltas.meioAmbiente) deltaMeioAmbiente += currentCrisis.impactDeltas.meioAmbiente;
      if (currentCrisis.impactDeltas.qualidadeVida) deltaQualidade += currentCrisis.impactDeltas.qualidadeVida;
    }

    const nextIndicators: CityIndicators = {
      orcamento: Math.max(0, indicators.orcamento + deltaOrcamento),
      energiaLimpa: Math.min(100, Math.max(0, indicators.energiaLimpa + deltaEnergia)),
      meioAmbiente: Math.min(100, Math.max(0, indicators.meioAmbiente + deltaMeioAmbiente)),
      transporte: Math.min(100, Math.max(0, indicators.transporte + deltaTransporte)),
      qualidadeVida: Math.min(100, Math.max(0, indicators.qualidadeVida + deltaQualidade)),
    };

    setIndicators(nextIndicators);
    setCarbonSavedTotal((prev) => prev + carbonAdded);

    if (currentYear >= TOTAL_YEARS) {
      // Conclui simulação
      setIsFinished(true);
      const avgIndicators = (nextIndicators.energiaLimpa + nextIndicators.meioAmbiente + nextIndicators.transporte + nextIndicators.qualidadeVida) / 4;
      const finalScore = Math.round(avgIndicators * 6 + (nextIndicators.orcamento / 500));

      onFinishGame({
        sessionToken,
        gameId: "eco_challenge",
        score: finalScore,
        accuracyPercent: Math.round(avgIndicators),
        extraNote: `Mandato de 10 anos concluído! Média verde: ${Math.round(avgIndicators)}%`,
      });
    } else {
      setCurrentYear((prev) => prev + 1);
    }
  };

  const getIndicatorColor = (val: number) => {
    if (val >= 70) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
    if (val >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-red-500 bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--app-text)] leading-tight">Eco Challenge</h3>
            <span className="text-xs text-[var(--app-text-muted)]">Nível 22 • Gestão Urbana e Campus Sustentável</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = gameAudio.toggleMute();
              setIsAudioMuted(muted);
            }}
            className="p-2 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-border)]/50 transition cursor-pointer"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onExit}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Painel de Indicadores Vitais da Cidade */}
      <div className="px-6 py-3 border-b border-[var(--app-border)] bg-[var(--app-bg)]/50 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="p-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)]">
          <div className="flex items-center gap-1.5 text-[var(--app-text-muted)] text-[11px]">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>Orçamento</span>
          </div>
          <span className="font-mono font-black text-xs text-[var(--app-text)] block mt-0.5">
            R$ {indicators.orcamento.toLocaleString()}
          </span>
        </div>

        <div className={`p-2 rounded-xl border ${getIndicatorColor(indicators.energiaLimpa)}`}>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Zap className="w-3.5 h-3.5" />
            <span>Energia Limpa</span>
          </div>
          <span className="font-mono font-black text-xs block mt-0.5">{indicators.energiaLimpa}%</span>
        </div>

        <div className={`p-2 rounded-xl border ${getIndicatorColor(indicators.meioAmbiente)}`}>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Leaf className="w-3.5 h-3.5" />
            <span>Biodiversidade</span>
          </div>
          <span className="font-mono font-black text-xs block mt-0.5">{indicators.meioAmbiente}%</span>
        </div>

        <div className={`p-2 rounded-xl border ${getIndicatorColor(indicators.transporte)}`}>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Bus className="w-3.5 h-3.5" />
            <span>Transporte</span>
          </div>
          <span className="font-mono font-black text-xs block mt-0.5">{indicators.transporte}%</span>
        </div>

        <div className={`p-2 rounded-xl border ${getIndicatorColor(indicators.qualidadeVida)} col-span-2 sm:col-span-1`}>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Heart className="w-3.5 h-3.5" />
            <span>Qualidade de Vida</span>
          </div>
          <span className="font-mono font-black text-xs block mt-0.5">{indicators.qualidadeVida}%</span>
        </div>
      </div>

      {!isFinished ? (
        <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
          {/* Header do Ano */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-black text-[var(--app-text)]">
                Ano {currentYear} de {TOTAL_YEARS} de Governança
              </h4>
              <p className="text-xs text-[var(--app-text-muted)]">
                Aprove até 2 projetos prioritários para investir neste ciclo.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-600 bg-teal-500/10 border border-teal-500/30 px-3 py-1 rounded-full">
              CO₂ Evitado: {carbonSavedTotal} ton
            </span>
          </div>

          {/* Evento Climático Se Houver */}
          {currentCrisis && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold text-xs sm:text-sm text-[var(--app-text)]">{currentCrisis.title}</h5>
                <p className="text-xs text-[var(--app-text-muted)]">{currentCrisis.description}</p>
              </div>
            </div>
          )}

          {/* Cards dos 3 Projetos Disponíveis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {yearlyProjects.map((proj) => {
              const isSelected = selectedProjectsThisYear.includes(proj.id);
              const canAfford = indicators.orcamento >= proj.cost;

              return (
                <div
                  key={proj.id}
                  onClick={() => canAfford && handleToggleProject(proj)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? "bg-teal-500/10 border-teal-500 shadow-md ring-2 ring-teal-500/20"
                      : canAfford
                      ? "bg-[var(--app-card-secondary)]/50 border-[var(--app-border)] hover:border-teal-500/50"
                      : "opacity-40 bg-[var(--app-card-secondary)]/30 border-[var(--app-border)] cursor-not-allowed"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text-muted)]">
                        {proj.tag}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-500" />}
                    </div>
                    <h5 className="font-bold text-sm text-[var(--app-text)] leading-snug">
                      {proj.title}
                    </h5>
                    <p className="text-xs text-[var(--app-text-muted)] line-clamp-3">
                      {proj.description}
                    </p>
                  </div>

                  {/* Impactos */}
                  <div className="pt-2 border-t border-[var(--app-border)]/50 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-[var(--app-text)]">
                      <span>Custo:</span>
                      <strong className="text-red-500">-R$ {proj.cost.toLocaleString()}</strong>
                    </div>
                    <div className="flex flex-wrap gap-1 text-[10px] text-teal-600 dark:text-teal-400 font-bold">
                      {proj.deltas.energiaLimpa > 0 && <span>+Energia</span>}
                      {proj.deltas.meioAmbiente > 0 && <span>+Verde</span>}
                      {proj.deltas.transporte > 0 && <span>+Mobilidade</span>}
                      {proj.deltas.qualidadeVida > 0 && <span>+Saúde</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botão de Avançar Ano */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[var(--app-text-muted)]">
              Projetos selecionados: <strong>{selectedProjectsThisYear.length}/2</strong>
            </span>
            <button
              onClick={handleAdvanceYear}
              className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>{currentYear < TOTAL_YEARS ? "Concluir Ano & Avançar" : "Finalizar Mandato"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* TELA DE FIM DE JOGO */
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-2xl font-black text-[var(--app-text)]">Mandato Sustentável Concluído!</h4>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Você completou os 10 anos de administração com saldo final e redução de {carbonSavedTotal} toneladas de carbono.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
            <div className="p-3 rounded-xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase block">Energia</span>
              <strong className="text-emerald-500 font-mono text-sm">{indicators.energiaLimpa}%</strong>
            </div>
            <div className="p-3 rounded-xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase block">Verde</span>
              <strong className="text-emerald-500 font-mono text-sm">{indicators.meioAmbiente}%</strong>
            </div>
            <div className="p-3 rounded-xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase block">Transporte</span>
              <strong className="text-emerald-500 font-mono text-sm">{indicators.transporte}%</strong>
            </div>
            <div className="p-3 rounded-xl bg-[var(--app-card-secondary)] border border-[var(--app-border)]">
              <span className="text-[10px] text-[var(--app-text-muted)] uppercase block">Vida</span>
              <strong className="text-emerald-500 font-mono text-sm">{indicators.qualidadeVida}%</strong>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setCurrentYear(1);
                setIndicators({
                  orcamento: 65000,
                  energiaLimpa: 30,
                  meioAmbiente: 40,
                  transporte: 25,
                  qualidadeVida: 45,
                });
                setIsFinished(false);
                setCarbonSavedTotal(0);
              }}
              className="px-4 py-2.5 rounded-xl border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
            >
              Nova Simulação
            </button>
            <button
              onClick={onExit}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
            >
              Voltar ao Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
