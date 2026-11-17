import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Brain,
  CheckCircle2,
  Zap,
  Award,
  Layers,
  Search,
  ArrowRight,
  Sliders,
  Compass,
  FileText,
  Lightbulb,
  Check,
  X,
  Flame,
} from "lucide-react";
import { UserProfile, CourseTrack } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { METODOS_ESTUDO, NIVEIS_EVIDENCIA } from "../../config/metodos.config";
import confetti from "canvas-confetti";

interface StudyMethodsCentralTabProps {
  user: UserProfile;
  courses?: CourseTrack[];
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (amount: number) => void;
  onNavigateToTab?: (tabId: string) => void;
  onNavigateToFlashcards?: () => void;
  onOpenSocraticWithTopic?: (topic: string) => void;
}

export const StudyMethodsCentralTab: React.FC<StudyMethodsCentralTabProps> = ({
  user,
  courses = [],
  onRewardXp,
  onRewardCoins,
  onNavigateToTab,
  onNavigateToFlashcards,
  onOpenSocraticWithTopic,
}) => {
  const { t } = useTranslation();

  const [busca, setBusca] = useState("");
  const [filtroEvidencia, setFiltroEvidencia] = useState<string>("todas");
  const [metodoSelecionado, setMetodoSelecionado] = useState<any | null>(null);

  // Estados do Recomendador "Qual método usar?"
  const [objetivoEstudo, setObjetivoEstudo] = useState<string>("");
  const [tempoDisponivel, setTempoDisponivel] = useState<number>(25);
  const [recomendacoes, setRecomendacoes] = useState<any[]>([]);

  // Estados da Ferramenta Interativa: Pomodoro
  const [pomodoroDuracao, setPomodoroDuracao] = useState<number>(25);
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);
  const [pomodoroMode, setPomodoroMode] = useState<"focus" | "break">("focus");
  const [distracoes, setDistracoes] = useState<string[]>([]);
  const [novaDistracao, setNovaDistracao] = useState<string>("");

  // Estados da Ferramenta Interativa: Feynman
  const [feynmanTopic, setFeynmanTopic] = useState("");
  const [feynmanExplanation, setFeynmanExplanation] = useState("");
  const [feynmanSubmitted, setFeynmanSubmitted] = useState(false);

  // Estados da Ferramenta Interativa: Recordação Livre
  const [recallTopic, setRecallTopic] = useState("");
  const [recallContent, setRecallContent] = useState("");
  const [recallDone, setRecallDone] = useState(false);

  // Estados da Ferramenta Interativa: Se-Então
  const [seEntaoMomento, setSeEntaoMomento] = useState("");
  const [seEntaoAcao, setSeEntaoAcao] = useState("");
  const [seEntaoCriado, setSeEntaoCriado] = useState(false);

  // Efeito do Timer Pomodoro
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPomodoroRunning && pomodoroSeconds > 0) {
      timer = setInterval(() => {
        setPomodoroSeconds((s) => s - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0 && isPomodoroRunning) {
      setIsPomodoroRunning(false);
      if (pomodoroMode === "focus") {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        if (onRewardXp) onRewardXp(25);
        setPomodoroMode("break");
        setPomodoroSeconds(5 * 60);
      } else {
        setPomodoroMode("focus");
        setPomodoroSeconds(pomodoroDuracao * 60);
      }
    }
    return () => clearInterval(timer);
  }, [isPomodoroRunning, pomodoroSeconds, pomodoroMode, pomodoroDuracao, onRewardXp]);

  const handleMudarProtocoloPomodoro = (min: number) => {
    setIsPomodoroRunning(false);
    setPomodoroDuracao(min);
    setPomodoroSeconds(min * 60);
    setPomodoroMode("focus");
  };

  const handleAdicionarDistracao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaDistracao.trim()) return;
    setDistracoes((prev) => [novaDistracao.trim(), ...prev]);
    setNovaDistracao("");
  };

  // Motor do Recomendador "Qual método usar?"
  const handleGerarRecomendacoes = () => {
    if (!objetivoEstudo) return;

    let sugeridosIds: string[] = [];
    if (objetivoEstudo === "prova_proxima") {
      sugeridosIds = ["teste_recuperacao", "repeticao_espacada", "pratica_intercalada"];
    } else if (objetivoEstudo === "memorizacao") {
      sugeridosIds = ["repeticao_espacada", "teste_recuperacao", "anotacoes_cornell"];
    } else if (objetivoEstudo === "exatas_problemas") {
      sugeridosIds = ["pratica_intercalada", "teste_recuperacao", "calibracao_metacognitiva"];
    } else if (objetivoEstudo === "conceito_dificil") {
      sugeridosIds = ["feynman_autoexplicacao", "pre_teste", "mapas_topicos"];
    } else if (objetivoEstudo === "leitura_densa") {
      sugeridosIds = ["leitura_sq3r", "anotacoes_cornell", "teste_recuperacao"];
    } else if (objetivoEstudo === "procrastinacao") {
      sugeridosIds = ["plano_se_entao", "pomodoro_variacoes", "ciclo_semanal_estudos"];
    }

    const filtrados = METODOS_ESTUDO.filter((m) => sugeridosIds.includes(m.id));
    setRecomendacoes(filtrados);
  };

  const metodosFiltrados = METODOS_ESTUDO.filter((m) => {
    const matchEvidencia = filtroEvidencia === "todas" || m.evidencia === filtroEvidencia;
    const matchBusca =
      !busca.trim() ||
      m.nome.toLowerCase().includes(busca.toLowerCase().trim()) ||
      m.resumo.toLowerCase().includes(busca.toLowerCase().trim()) ||
      m.quandoUsar.toLowerCase().includes(busca.toLowerCase().trim());
    return matchEvidencia && matchBusca;
  });

  const minutes = Math.floor(pomodoroSeconds / 60);
  const seconds = pomodoroSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* 1. Top Banner Científico */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--app-text)] tracking-tight">
                Métodos Científicos de Estudo Eficaz
              </h2>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
                Baseado na metanálise de psicologia cognitiva (Dunlosky et al., 2013). Técnicas comprovadas por experimentos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
              Alta Evidência: Prática Ativa
            </span>
          </div>
        </div>

        {/* Níveis de Evidência Explicados com Honestidade */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {Object.entries(NIVEIS_EVIDENCIA).map(([chave, val]) => (
            <div
              key={chave}
              className={`p-3.5 rounded-2xl border text-xs space-y-1 ${val.badgeClass}`}
            >
              <h4 className="font-black text-xs uppercase tracking-wider">{val.rotulo}</h4>
              <p className="text-[11px] leading-relaxed opacity-90">{val.descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Recomendador "Qual método usar?" (Bloco 5B.3) */}
      <Card variant="elevated" padding="lg" className="space-y-5 bg-gradient-to-br from-[var(--app-card)] to-[var(--app-card-secondary)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[var(--app-text)]">
              Recomendador: Qual método devo usar agora?
            </h3>
            <p className="text-xs text-[var(--app-text-muted)]">
              Informe seu objetivo acadêmico imediato e receba as técnicas mais eficientes validadas pela ciência.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--app-text)]">Qual é seu objetivo principal?</label>
            <select
              value={objetivoEstudo}
              onChange={(e) => setObjetivoEstudo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-semibold cursor-pointer"
            >
              <option value="">Selecione seu objetivo...</option>
              <option value="prova_proxima">Tenho prova em poucos dias</option>
              <option value="memorizacao">Memorizar vocabulário, termos ou fórmulas</option>
              <option value="exatas_problemas">Aprender a resolver problemas de exatas</option>
              <option value="conceito_dificil">Entender um conceito abstrato difícil</option>
              <option value="leitura_densa">Leitura de apostila, artigo ou livro longo</option>
              <option value="procrastinacao">Vencer a preguiça e começar a estudar</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--app-text)]">Quanto tempo você tem disponível?</label>
            <select
              value={tempoDisponivel}
              onChange={(e) => setTempoDisponivel(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-semibold cursor-pointer"
            >
              <option value={15}>15 minutos (Sessão rápida)</option>
              <option value={25}>25 minutos (1 Bloco Pomodoro)</option>
              <option value={50}>50 minutos (Foco profundo)</option>
              <option value={90}>90 minutos (Ciclo ultradiano completo)</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="primary"
              fullWidth
              onClick={handleGerarRecomendacoes}
              disabled={!objetivoEstudo}
              className="flex items-center justify-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Ver Recomendações</span>
            </Button>
          </div>
        </div>

        {/* Resultados das Recomendações */}
        {recomendacoes.length > 0 && (
          <div className="pt-4 border-t border-[var(--app-border)] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--app-primary)]">
              Métodos ideais recomendados para o seu cenário:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recomendacoes.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setMetodoSelecionado(rec)}
                  className="p-4 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition cursor-pointer shadow-xs space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {rec.evidencia}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--app-text-muted)] group-hover:translate-x-1 transition" />
                  </div>
                  <h5 className="font-bold text-sm text-[var(--app-text)] group-hover:text-[var(--app-primary)] transition">
                    {rec.nome}
                  </h5>
                  <p className="text-xs text-[var(--app-text-muted)] line-clamp-2">{rec.resumo}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 3. Ferramentas Práticas em Destaque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FERRAMENTA 1: POMODORO CIENTÍFICO + BLOCO DE DISTRAÇÕES */}
        <Card variant="default" padding="lg" className="space-y-5 text-center flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-[var(--app-text)] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--app-primary)]" />
                <span>Timer de Hiperfoco & Pausa</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                {pomodoroMode === "focus" ? "Foco Ativo" : "Pausa Fisiológica"}
              </span>
            </div>

            {/* Variações de Protocolo */}
            <div className="flex items-center justify-center gap-2">
              {[
                { min: 25, label: "25/5 min" },
                { min: 50, label: "50/10 min" },
                { min: 90, label: "90/20 min" },
              ].map((proto) => (
                <button
                  key={proto.min}
                  type="button"
                  onClick={() => handleMudarProtocoloPomodoro(proto.min)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    pomodoroDuracao === proto.min
                      ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)]"
                      : "bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] border-[var(--app-border)]"
                  }`}
                >
                  {proto.label}
                </button>
              ))}
            </div>

            <div className="py-4">
              <div className="text-5xl sm:text-6xl font-black font-mono text-[var(--app-text)] tracking-wider">
                {timeFormatted}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant={isPomodoroRunning ? "destructive" : "primary"}
                size="md"
                onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}
                className="flex items-center gap-2 px-6"
              >
                {isPomodoroRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPomodoroRunning ? "Pausar Sessão" : "Iniciar Foco"}</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setIsPomodoroRunning(false);
                  setPomodoroSeconds(pomodoroDuracao * 60);
                  setPomodoroMode("focus");
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Bloco de Distrações (Elimina multitarefa) */}
          <div className="pt-4 border-t border-[var(--app-border)] text-left space-y-2">
            <h4 className="text-xs font-bold text-[var(--app-text)] flex items-center justify-between">
              <span>Bloco de Distrações (Anote e volte ao foco):</span>
              <span className="text-[10px] text-[var(--app-text-muted)] font-normal">{distracoes.length} anotadas</span>
            </h4>
            <form onSubmit={handleAdicionarDistracao} className="flex gap-2">
              <input
                type="text"
                value={novaDistracao}
                onChange={(e) => setNovaDistracao(e.target.value)}
                placeholder="Ex: Checar e-mail, responder WhatsApp..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none"
              />
              <Button type="submit" variant="secondary" size="sm" className="text-xs">
                Anotar
              </Button>
            </form>

            {distracoes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {distracoes.slice(0, 4).map((d, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-[var(--app-text-muted)]"
                  >
                    • {d}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* FERRAMENTA 2: MÉTODO FEYNMAN & AUTO-EXPLICAÇÃO */}
        <Card variant="default" padding="lg" className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-[var(--app-text)] flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <span>Método Feynman: Explicação Socrática</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600">
                Compreensão Real
              </span>
            </div>

            <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
              "Se você não consegue explicar de forma simples para alguém de 10 anos, você ainda não dominou o assunto."
            </p>

            <div className="space-y-3 pt-1">
              <Input
                label="Conceito a explicar"
                value={feynmanTopic}
                onChange={(e) => setFeynmanTopic(e.target.value)}
                placeholder="Ex: Recursividade, Lei de Ohm, Mitose..."
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--app-text)]">
                  Sua explicação em palavras simples (sem jargão vazio):
                </label>
                <textarea
                  rows={4}
                  value={feynmanExplanation}
                  onChange={(e) => setFeynmanExplanation(e.target.value)}
                  placeholder="Explique como se estivesse ensinando para um colega iniciante..."
                  className="w-full p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none focus:ring-2 focus:ring-[var(--app-primary)]/30"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <Button
              variant="primary"
              size="sm"
              disabled={!feynmanTopic.trim() || !feynmanExplanation.trim()}
              onClick={() => {
                setFeynmanSubmitted(true);
                confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
                if (onRewardXp) onRewardXp(35);
              }}
              className="flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Concluir Explicação (+35 XP)</span>
            </Button>

            {onOpenSocraticWithTopic && feynmanTopic && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenSocraticWithTopic(feynmanTopic)}
                className="text-xs"
              >
                Debater com a Lumina
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* 4. Catálogo Completo dos 14 Métodos de Estudo (Bloco 5B.1 / 5B.2) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[var(--app-text)] tracking-tight">
              Catálogo Completo de Técnicas ({metodosFiltrados.length})
            </h3>
            <p className="text-xs text-[var(--app-text-muted)]">
              Clique em qualquer método para ver a ficha detalhada, nível de evidência e passo a passo.
            </p>
          </div>

          {/* Filtro de Evidência e Busca */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] pointer-events-none" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Filtrar técnicas..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none"
              />
            </div>

            <select
              value={filtroEvidencia}
              onChange={(e) => setFiltroEvidencia(e.target.value)}
              className="p-1.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-card)] text-xs text-[var(--app-text)] font-bold cursor-pointer"
            >
              <option value="todas">Todas as Evidências</option>
              <option value="ALTA">Alta Utilidade</option>
              <option value="MODERADA">Utilidade Moderada</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metodosFiltrados.map((m) => {
            const nivel = NIVEIS_EVIDENCIA[m.evidencia as keyof typeof NIVEIS_EVIDENCIA] || NIVEIS_EVIDENCIA.MODERADA;

            return (
              <div
                key={m.id}
                onClick={() => setMetodoSelecionado(m)}
                className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/50 transition cursor-pointer shadow-xs flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${nivel.badgeClass}`}>
                      {nivel.rotulo}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--app-text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {m.tempoPadraoMinutos} min
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-[var(--app-text)] group-hover:text-[var(--app-primary)] transition">
                    {m.nome}
                  </h4>

                  <p className="text-xs text-[var(--app-text-muted)] leading-relaxed line-clamp-3">
                    {m.resumo}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    +{m.xpRecompensa} XP
                  </span>
                  <span className="text-[11px] font-bold text-[var(--app-primary)] group-hover:translate-x-1 transition flex items-center gap-1">
                    <span>Ver Ficha</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalhes da Técnica Selecionada */}
      {metodoSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[var(--app-border)]">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                  {metodoSelecionado.evidencia} UTILIDADE (Dunlosky 2013)
                </span>
                <h3 className="text-xl font-black text-[var(--app-text)] mt-1.5">
                  {metodoSelecionado.nome}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMetodoSelecionado(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--app-text-muted)] hover:bg-[var(--app-card-secondary)] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <h4 className="font-bold text-[var(--app-text)] uppercase tracking-wider text-[11px]">
                  O que é e como funciona:
                </h4>
                <p className="text-[var(--app-text-muted)] leading-relaxed">
                  {metodoSelecionado.resumo}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-1">
                <h4 className="font-bold text-[var(--app-text)] text-[11px] uppercase tracking-wider">
                  Quando usar esta técnica:
                </h4>
                <p className="text-[var(--app-text-muted)] text-xs leading-relaxed">
                  {metodoSelecionado.quandoUsar}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[var(--app-text)] uppercase tracking-wider text-[11px]">
                  Passo a Passo Prático:
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside text-[var(--app-text-muted)]">
                  {metodoSelecionado.passos.map((p: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="text-[var(--app-text)]">{p}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--app-border)] flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-[var(--app-text-muted)]">
                Tempo estimado: ~{metodoSelecionado.tempoPadraoMinutos} min
              </span>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setMetodoSelecionado(null);
                  if (metodoSelecionado.id === "repeticao_espacada" && onNavigateToFlashcards) {
                    onNavigateToFlashcards();
                  }
                }}
              >
                Fechar Ficha
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMethodsCentralTab;
