import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Layers,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  ChevronRight,
  Briefcase,
  AlertCircle,
  Building2,
  BarChart3,
} from "lucide-react";
import {
  INITIAL_RAW_MATERIALS,
  AVAILABLE_ROLES,
  MACRO_EVENTS_SERIES,
  INITIAL_PD_UPGRADES,
  RawMaterialItem,
  EmployeeProfile,
  PdUpgrade,
} from "../../data/businessScenarios";
import { gameAudio } from "../../audio";
import { SessionResultPayload } from "../../services/gamesService";

interface BusinessTycoonGameProps {
  userId: string;
  userName: string;
  sessionToken: string;
  onFinishGame: (payload: SessionResultPayload) => void;
  onExit: () => void;
}

export const BusinessTycoonGame: React.FC<BusinessTycoonGameProps> = ({
  sessionToken,
  onFinishGame,
  onExit,
}) => {
  const [month, setMonth] = useState<number>(1);
  const TOTAL_MONTHS = 12;

  // Caixa da Empresa (Fictício)
  const [caixaFicticio, setCaixaFicticio] = useState<number>(15000);
  const [estoqueMateriaPrima, setEstoqueMateriaPrima] = useState<number>(100);
  const [estoqueProdutosFinais, setEstoqueProdutosFinais] = useState<number>(0);

  // Precificação e Marketing
  const [precoVenda, setPrecoVenda] = useState<number>(75);
  const [verbaMarketing, setVerbaMarketing] = useState<number>(1500);

  // Equipe
  const [hiredEmployees, setHiredEmployees] = useState<{ roleId: string; count: number }[]>([
    { roleId: "emp_estagiario", count: 2 },
    { roleId: "emp_tecnico", count: 1 },
  ]);

  // P&D Upgrades
  const [upgrades, setUpgrades] = useState<PdUpgrade[]>(INITIAL_PD_UPGRADES);

  // Histórico Contábil do Último Mês
  const [lastMonthReport, setLastMonthReport] = useState<{
    receitaBruta: number;
    custoInsumos: number;
    salarios: number;
    marketing: number;
    lucroLiquido: number;
    unidadesVendidas: number;
  } | null>(null);

  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [valuationFinal, setValuationFinal] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(gameAudio.getMuted());

  // Evento macroeconômico do mês atual
  const currentMacroEvent = MACRO_EVENTS_SERIES.find((e) => e.month === month);

  // Capacidade produtiva total dos funcionários
  const calculateTotalCapacity = () => {
    return hiredEmployees.reduce((acc, h) => {
      const role = AVAILABLE_ROLES.find((r) => r.id === h.roleId);
      return acc + (role ? role.productionCapacity * h.count : 0);
    }, 0);
  };

  // Custo total da folha salarial
  const calculateTotalSalaries = () => {
    return hiredEmployees.reduce((acc, h) => {
      const role = AVAILABLE_ROLES.find((r) => r.id === h.roleId);
      return acc + (role ? role.monthlySalary * h.count : 0);
    }, 0);
  };

  const handleHire = (roleId: string) => {
    gameAudio.playClick();
    setHiredEmployees((prev) => {
      const existing = prev.find((p) => p.roleId === roleId);
      if (existing) {
        return prev.map((p) => (p.roleId === roleId ? { ...p, count: p.count + 1 } : p));
      }
      return [...prev, { roleId, count: 1 }];
    });
  };

  const handleDismiss = (roleId: string) => {
    gameAudio.playClick();
    setHiredEmployees((prev) => {
      return prev
        .map((p) => (p.roleId === roleId ? { ...p, count: Math.max(0, p.count - 1) } : p))
        .filter((p) => p.count > 0);
    });
  };

  const handleBuyRawMaterial = (amount: number, unitCost: number) => {
    const totalCost = amount * unitCost;
    if (caixaFicticio < totalCost) return;
    gameAudio.playClick();
    setCaixaFicticio((prev) => prev - totalCost);
    setEstoqueMateriaPrima((prev) => prev + amount);
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    const upg = upgrades.find((u) => u.id === upgradeId);
    if (!upg || upg.unlocked || caixaFicticio < upg.cost) return;

    gameAudio.playVictory();
    setCaixaFicticio((prev) => prev - upg.cost);
    setUpgrades((prev) =>
      prev.map((u) => (u.id === upgradeId ? { ...u, unlocked: true } : u))
    );
  };

  // Simulação do Mês
  const handleSimulateMonth = () => {
    gameAudio.playCardFlip();

    const capacity = calculateTotalCapacity();
    const productionUnits = Math.min(capacity, estoqueMateriaPrima);
    const remainingMateriaPrima = estoqueMateriaPrima - productionUnits;

    // Cálculo de Demanda do Mês
    const eventMult = currentMacroEvent ? currentMacroEvent.demandMultiplier : 1.0;
    const marketingBonus = Math.min(2.5, 1 + verbaMarketing / 3000);
    const priceElasticity = Math.max(0.2, 2.0 - precoVenda / 50); // Preço alto reduz demanda

    const estimatedMarketDemand = Math.round(100 * eventMult * marketingBonus * priceElasticity);
    const totalAvailableToSell = estoqueProdutosFinais + productionUnits;
    const soldUnits = Math.min(totalAvailableToSell, estimatedMarketDemand);
    const remainingFinished = totalAvailableToSell - soldUnits;

    const receitaBruta = soldUnits * precoVenda;
    const custoSalarios = calculateTotalSalaries();
    const custoInsumos = productionUnits * 20; // Custo de fabricação
    const lucroLiquido = receitaBruta - custoSalarios - verbaMarketing;

    const novoCaixa = Math.max(0, caixaFicticio + lucroLiquido);
    setCaixaFicticio(novoCaixa);
    setEstoqueMateriaPrima(remainingMateriaPrima);
    setEstoqueProdutosFinais(remainingFinished);

    setLastMonthReport({
      receitaBruta,
      custoInsumos,
      salarios: custoSalarios,
      marketing: verbaMarketing,
      lucroLiquido,
      unidadesVendidas: soldUnits,
    });

    if (month >= TOTAL_MONTHS) {
      // Fim do Ano Fiscal & Cálculo do Valuation
      const valMult = upgrades.reduce((acc, u) => acc * (u.unlocked ? u.valuationMultiplier : 1), 1);
      const computedValuation = Math.round((novoCaixa * 2.5 + receitaBruta * 4) * valMult);
      setValuationFinal(computedValuation);
      setIsFinished(true);
      gameAudio.playVictory();

      const gameScore = Math.min(1000, Math.round(computedValuation / 200));
      onFinishGame({
        sessionToken,
        gameId: "business_tycoon",
        score: gameScore,
        valuationFicticio: computedValuation,
        extraNote: `Ano fiscal encerrado! Valuation fictício: R$ ${computedValuation.toLocaleString()}`,
      });
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--app-border)] bg-[var(--app-card-secondary)]/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--app-text)] leading-tight">Business Tycoon</h3>
            <span className="text-xs text-[var(--app-text-muted)]">Nível 30 • Gestão Empresarial Fictícia & DRE</span>
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

      {/* Painel Financeiro e Estoque da Empresa */}
      <div className="px-6 py-3 border-b border-[var(--app-border)] bg-[var(--app-bg)]/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)]">
          <span className="text-[10px] text-[var(--app-text-muted)] uppercase block font-bold">Caixa da Empresa (Fictício)</span>
          <span className="font-mono font-black text-sm text-emerald-500 block mt-0.5">
            R$ {caixaFicticio.toLocaleString()}
          </span>
        </div>

        <div className="p-2.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)]">
          <span className="text-[10px] text-[var(--app-text-muted)] uppercase block font-bold">Matéria-Prima</span>
          <span className="font-mono font-black text-sm text-blue-500 block mt-0.5">
            {estoqueMateriaPrima} unid.
          </span>
        </div>

        <div className="p-2.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)]">
          <span className="text-[10px] text-[var(--app-text-muted)] uppercase block font-bold">Produtos Acabados</span>
          <span className="font-mono font-black text-sm text-purple-500 block mt-0.5">
            {estoqueProdutosFinais} unid.
          </span>
        </div>

        <div className="p-2.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)]">
          <span className="text-[10px] text-[var(--app-text-muted)] uppercase block font-bold">Capacidade Mensal</span>
          <span className="font-mono font-black text-sm text-orange-500 block mt-0.5">
            {calculateTotalCapacity()} unid./mês
          </span>
        </div>
      </div>

      {!isFinished ? (
        <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
          {/* Header do Mês e Evento Macroeconômico */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-lg font-black text-[var(--app-text)]">
                Mês {month} de {TOTAL_MONTHS} • Exercício Fiscal
              </h4>
              <p className="text-xs text-[var(--app-text-muted)]">
                Ajuste os parâmetros operacionais antes de fechar o mês contábil.
              </p>
            </div>
            {currentMacroEvent && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{currentMacroEvent.title}</span>
              </div>
            )}
          </div>

          {/* Abas e Painéis de Operação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Vendas & Precificação */}
            <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--app-text)]">
                <BarChart3 className="w-4 h-4 text-orange-500" />
                <span>Precificação & Marketing</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--app-text-muted)]">Preço por Unidade:</span>
                  <strong className="font-mono text-[var(--app-text)]">R$ {precoVenda}</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="160"
                  step="5"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--app-text-muted)]">Investimento Marketing:</span>
                  <strong className="font-mono text-[var(--app-text)]">R$ {verbaMarketing}</strong>
                </div>
                <input
                  type="range"
                  min="500"
                  max="6000"
                  step="500"
                  value={verbaMarketing}
                  onChange={(e) => setVerbaMarketing(Number(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
              </div>

              {/* Compra Rápida de Insumos */}
              <div className="pt-2 border-t border-[var(--app-border)]">
                <span className="text-[11px] font-bold text-[var(--app-text)] block mb-1.5">
                  Comprar Matéria-Prima:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleBuyRawMaterial(50, 20)}
                    disabled={caixaFicticio < 1000}
                    className="py-1.5 px-2 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold hover:border-orange-500 transition cursor-pointer disabled:opacity-40"
                  >
                    +50 (R$ 1.000)
                  </button>
                  <button
                    onClick={() => handleBuyRawMaterial(100, 20)}
                    disabled={caixaFicticio < 2000}
                    className="py-1.5 px-2 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs font-bold hover:border-orange-500 transition cursor-pointer disabled:opacity-40"
                  >
                    +100 (R$ 2.000)
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Equipe & Colaboradores */}
            <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text)]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Quadro de Funcionários</span>
                </div>
                <span className="font-mono text-[11px] text-[var(--app-text-muted)]">
                  Folha: R$ {calculateTotalSalaries()}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {AVAILABLE_ROLES.map((role) => {
                  const hiredCount = hiredEmployees.find((h) => h.roleId === role.id)?.count || 0;

                  return (
                    <div
                      key={role.id}
                      className="p-2 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-[var(--app-text)]">{role.role}</p>
                        <span className="text-[10px] text-[var(--app-text-muted)]">
                          R$ {role.monthlySalary}/mês • {role.productionCapacity} unid.
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDismiss(role.id)}
                          disabled={hiredCount === 0}
                          className="w-6 h-6 rounded-lg bg-[var(--app-border)]/60 hover:bg-red-500/20 text-xs font-bold cursor-pointer disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-4 text-center">{hiredCount}</span>
                        <button
                          onClick={() => handleHire(role.id)}
                          className="w-6 h-6 rounded-lg bg-[var(--app-border)]/60 hover:bg-emerald-500/20 text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Inovação & P&D */}
            <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)]/50 border border-[var(--app-border)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--app-text)]">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Upgrades de P&D & Marca</span>
              </div>

              <div className="space-y-2">
                {upgrades.map((upg) => (
                  <div
                    key={upg.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 transition ${
                      upg.unlocked
                        ? "bg-purple-500/10 border-purple-500/40 text-[var(--app-text)]"
                        : "bg-[var(--app-card)] border-[var(--app-border)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--app-text)]">{upg.title}</span>
                      {upg.unlocked ? (
                        <span className="text-[10px] font-bold text-purple-500 uppercase">Ativo</span>
                      ) : (
                        <button
                          onClick={() => handleBuyUpgrade(upg.id)}
                          disabled={caixaFicticio < upg.cost}
                          className="px-2 py-0.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold cursor-pointer disabled:opacity-40"
                        >
                          R$ {upg.cost.toLocaleString()}
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--app-text-muted)]">{upg.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DRE Sintética do Mês Anterior */}
          {lastMonthReport && (
            <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)]/40 border border-[var(--app-border)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-[var(--app-text-muted)]">Receita Mês Passado: </span>
                <strong className="text-emerald-500">R$ {lastMonthReport.receitaBruta.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[var(--app-text-muted)]">Unidades Vendidas: </span>
                <strong className="text-[var(--app-text)]">{lastMonthReport.unidadesVendidas}</strong>
              </div>
              <div>
                <span className="text-[var(--app-text-muted)]">Lucro Líquido: </span>
                <strong className={lastMonthReport.lucroLiquido >= 0 ? "text-emerald-500" : "text-red-500"}>
                  R$ {lastMonthReport.lucroLiquido.toLocaleString()}
                </strong>
              </div>
            </div>
          )}

          {/* Botão de Fechar Mês */}
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={handleSimulateMonth}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>{month < TOTAL_MONTHS ? `Simular e Fechar Mês ${month}` : "Encerrar Ano Fiscal"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* TELA DE VALUATION FINAL */
        <div className="p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h4 className="text-2xl font-black text-[var(--app-text)]">Ano Fiscal Encerrado!</h4>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              Auditoria financeira final concluiu o valuation e os resultados da sua empresa.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] max-w-sm mx-auto space-y-2">
            <span className="text-xs text-[var(--app-text-muted)] uppercase tracking-wider block font-bold">
              Valuation Final da Empresa
            </span>
            <div className="text-3xl font-black font-mono text-orange-500">
              R$ {valuationFinal.toLocaleString()}
            </div>
            <span className="text-[11px] text-[var(--app-text-muted)] block">
              Caixa Final: R$ {caixaFicticio.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setMonth(1);
                setCaixaFicticio(15000);
                setEstoqueMateriaPrima(100);
                setEstoqueProdutosFinais(0);
                setIsFinished(false);
                setLastMonthReport(null);
              }}
              className="px-4 py-2.5 rounded-xl border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] cursor-pointer"
            >
              Novo Ano Fiscal
            </button>
            <button
              onClick={onExit}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer"
            >
              Voltar ao Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
