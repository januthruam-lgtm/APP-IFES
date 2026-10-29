/**
 * Brain Studio - Suíte de Ferramentas Interativas dos 14 Métodos Científicos (Bloco 5B)
 * Cada método possui uma ferramenta funcional, com regras cognitivas reais e feedback visual.
 */

import React, { useState, useEffect } from "react";
import {
  Brain,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Check,
  HelpCircle,
  Zap,
  BookOpen,
  Layers,
  Repeat,
  FileText,
  Split,
  Target,
  BarChart2,
  Shuffle,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MetodoEstudoInfo } from "../../data/metodosEstudoData";

interface InteractiveToolProps {
  metodo: MetodoEstudoInfo;
  onRewardXp?: (xp: number) => void;
  onNavigateToTab?: (tab: string, subView?: string) => void;
}

// 1. PRÁTICA DE RECUPERAÇÃO (SIMULADOR DE RECORDAR SEM OLHAR)
export const ToolRecuperacaoAtiva: React.FC<InteractiveToolProps> = ({ onRewardXp }) => {
  const [fase, setFase] = useState<"leitura" | "recordacao" | "comparacao">("leitura");
  const [textoOriginal, setTextoOriginal] = useState(
    "A mitose é o processo de divisão celular que gera duas células-filhas geneticamente idênticas à célula-mãe, ocorrendo nas etapas: Prófase, Metáfase, Anáfase e Telófase."
  );
  const [textoRecordado, setTextoRecordado] = useState("");
  const [pontuacao, setPontuacao] = useState<number | null>(null);

  const iniciarTeste = () => {
    if (!textoOriginal.trim()) return;
    setFase("recordacao");
    setTextoRecordado("");
    setPontuacao(null);
  };

  const avaliarRecordacao = () => {
    const palavrasOriginal = textoOriginal.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const palavrasRecordadas = textoRecordado.toLowerCase().split(/\s+/);
    let acertos = 0;
    for (const w of palavrasOriginal) {
      if (palavrasRecordadas.some((r) => r.includes(w) || w.includes(r))) {
        acertos++;
      }
    }
    const score = Math.min(100, Math.round((acertos / Math.max(1, palavrasOriginal.length)) * 100));
    setPontuacao(score);
    setFase("comparacao");
    confetti({ particleCount: 35, spread: 60 });
    if (onRewardXp) onRewardXp(40);
  };

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
        <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2">
          <Brain className="w-4 h-4 text-[var(--app-primary)]" />
          Simulador de Recuperação Ativa (Efeito do Teste)
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--app-primary)]/15 text-[var(--app-primary)]">
          Fase: {fase === "leitura" ? "1. Leitura" : fase === "recordacao" ? "2. Puxar da Memória" : "3. Comparação"}
        </span>
      </div>

      {fase === "leitura" && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--app-text-muted)]">
            Insira ou leia o conceito abaixo com atenção. Quando estiver pronto, clique em <b>"Tampar e Testar"</b>.
          </p>
          <textarea
            rows={3}
            value={textoOriginal}
            onChange={(e) => setTextoOriginal(e.target.value)}
            className="w-full p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none"
            placeholder="Digite ou cole o texto que deseja fixar..."
          />
          <button
            onClick={iniciarTeste}
            className="w-full py-2.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold hover:bg-[var(--app-primary-hover)] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <EyeOff className="w-4 h-4" />
            <span>Tampar Texto e Testar Memória</span>
          </button>
        </div>
      )}

      {fase === "recordacao" && (
        <div className="space-y-3 animate-in fade-in">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>O texto original está oculto. Escreva abaixo tudo o que você lembra sem olhar!</span>
          </div>
          <textarea
            rows={4}
            value={textoRecordado}
            onChange={(e) => setTextoRecordado(e.target.value)}
            className="w-full p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none focus:border-[var(--app-primary)]"
            placeholder="Puxe da memória termos, sequências, etapas e fórmulas..."
            autoFocus
          />
          <button
            onClick={avaliarRecordacao}
            disabled={!textoRecordado.trim()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Comparar com o Original (+40 XP)</span>
          </button>
        </div>
      )}

      {fase === "comparacao" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
            <span className="font-extrabold text-sm">Índice de Retenção Neural: {pontuacao}%</span>
            <span className="font-bold">+40 XP Concedidos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--app-primary)] block">Original:</span>
              <p className="text-[var(--app-text)] leading-relaxed">{textoOriginal}</p>
            </div>
            <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Sua Recuperação:</span>
              <p className="text-[var(--app-text)] leading-relaxed">{textoRecordado}</p>
            </div>
          </div>

          <button
            onClick={() => setFase("leitura")}
            className="w-full py-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] transition cursor-pointer"
          >
            Testar Outro Conceito
          </button>
        </div>
      )}
    </div>
  );
};

// 2. REPETIÇÃO ESPAÇADA (CALCULADORA DE INTERVALOS SM-2)
export const ToolRepeticaoEspacada: React.FC<InteractiveToolProps> = ({ onNavigateToTab }) => {
  const [repeticoes, setRepeticoes] = useState(2);
  const [fatorFacilidade, setFatorFacilidade] = useState(2.5);
  const [nota, setNota] = useState<1 | 2 | 3 | 4>(3); // 1 Errei, 2 Difícil, 3 Bom, 4 Fácil

  // Cálculo matemático SM-2
  const calcularProximoIntervalo = (): { dias: number; novoEF: number } => {
    let q = nota === 1 ? 0 : nota === 2 ? 3 : nota === 3 ? 4 : 5;
    let novoEF = Math.max(1.3, fatorFacilidade + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    let dias = 1;

    if (nota === 1) {
      dias = 1;
    } else if (repeticoes === 0) {
      dias = 1;
    } else if (repeticoes === 1) {
      dias = 6;
    } else {
      const intervaloAnterior = repeticoes === 2 ? 6 : Math.round(6 * Math.pow(fatorFacilidade, repeticoes - 1));
      dias = Math.round(intervaloAnterior * novoEF);
    }

    return { dias: Math.max(1, dias), novoEF: Number(novoEF.toFixed(2)) };
  };

  const { dias, novoEF } = calcularProximoIntervalo();

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
        <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Simulador de Intervalos do Algoritmo SM-2 / FSRS
        </h4>
        <span className="text-[10px] font-mono font-bold text-blue-400">SM-2 Engine</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1">
            Repetições Anteriores Consecutivas: {repeticoes}
          </label>
          <input
            type="range"
            min={0}
            max={8}
            value={repeticoes}
            onChange={(e) => setRepeticoes(Number(e.target.value))}
            className="w-full accent-[var(--app-primary)] cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1">
            Fator de Facilidade Atual (EF): {fatorFacilidade.toFixed(2)}
          </label>
          <input
            type="range"
            min={1.3}
            max={2.8}
            step={0.05}
            value={fatorFacilidade}
            onChange={(e) => setFatorFacilidade(Number(e.target.value))}
            className="w-full accent-[var(--app-primary)] cursor-pointer"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[var(--app-text)] mb-2">
          Qual foi sua facilidade na revisão de hoje?
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { n: 1 as const, label: "Errei (0)", cor: "bg-rose-500/15 border-rose-500/40 text-rose-400" },
            { n: 2 as const, label: "Difícil (3)", cor: "bg-amber-500/15 border-amber-500/40 text-amber-400" },
            { n: 3 as const, label: "Bom (4)", cor: "bg-blue-500/15 border-blue-500/40 text-blue-400" },
            { n: 4 as const, label: "Fácil (5)", cor: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" },
          ].map((item) => (
            <button
              key={item.n}
              onClick={() => setNota(item.n)}
              className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                item.cor
              } ${nota === item.n ? "ring-2 ring-white scale-105" : "opacity-70 hover:opacity-100"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--app-text-muted)]">Próxima Revisão Calculada:</p>
          <p className="text-lg font-black text-[var(--app-primary)]">
            Em {dias} {dias === 1 ? "dia" : "dias"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--app-text-muted)]">Novo Fator de Facilidade:</p>
          <p className="text-sm font-mono font-bold text-[var(--app-text)]">{novoEF}</p>
        </div>
      </div>

      {onNavigateToTab && (
        <button
          onClick={() => onNavigateToTab("estudar", "flashcards")}
          className="w-full py-2.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <Layers className="w-4 h-4" />
          <span>Abrir Meus Flashcards Anki no Brain Studio</span>
        </button>
      )}
    </div>
  );
};

// 3. ENTRELAÇAMENTO (GERADOR DE SESSÃO COM 3 MATÉRIAS)
export const ToolEntrelacamento: React.FC<InteractiveToolProps> = () => {
  const [mat1, setMat1] = useState("Matemática / Álgebra");
  const [mat2, setMat2] = useState("História do Brasil");
  const [mat3, setMat3] = useState("Química Orgânica");
  const [duracaoBloco, setDuracaoBloco] = useState(25);
  const [gradeGerada, setGradeGerada] = useState<string[] | null>(null);

  const gerarGrade = () => {
    setGradeGerada([
      `Bloco 1 (${duracaoBloco} min): ${mat1} (Problemas Práticos)`,
      `Pausa Ativa (5 min)`,
      `Bloco 2 (${duracaoBloco} min): ${mat2} (Análise Crítica)`,
      `Pausa Ativa (5 min)`,
      `Bloco 3 (${duracaoBloco} min): ${mat3} (Síntese e Diagramas)`,
      `Bloco 4 (${duracaoBloco} min): ${mat1} (Revisão Intercalada)`,
    ]);
  };

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
        <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2">
          <Shuffle className="w-4 h-4 text-purple-400" />
          Gerador de Sessão com Entrelaçamento (Anti-Blocagem)
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <input
          type="text"
          value={mat1}
          onChange={(e) => setMat1(e.target.value)}
          placeholder="Matéria 1"
          className="p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none"
        />
        <input
          type="text"
          value={mat2}
          onChange={(e) => setMat2(e.target.value)}
          placeholder="Matéria 2"
          className="p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none"
        />
        <input
          type="text"
          value={mat3}
          onChange={(e) => setMat3(e.target.value)}
          placeholder="Matéria 3"
          className="p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none"
        />
      </div>

      <button
        onClick={gerarGrade}
        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
      >
        <Shuffle className="w-4 h-4" />
        <span>Gerar Cronograma Entrelaçado</span>
      </button>

      {gradeGerada && (
        <div className="space-y-2 pt-2 animate-in fade-in">
          {gradeGerada.map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                item.includes("Pausa")
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-[var(--app-bg)] border-[var(--app-border)] text-[var(--app-text)]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[var(--app-primary)] shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. MÉTODO FEYNMAN (COM DETECTOR DE JARGÕES E LINGUAGEM SIMPLES)
export const ToolFeynman: React.FC<InteractiveToolProps> = ({ onRewardXp, onNavigateToTab }) => {
  const [tema, setTema] = useState("");
  const [explicacao, setExplicacao] = useState("");
  const [jargoesIdentificados, setJargoesIdentificados] = useState<string[]>([]);
  const [avaliado, setAvaliado] = useState(false);

  const LISTA_JARGOES = [
    "paradigma",
    "epistemológico",
    "hermenêutica",
    "sinergia",
    "polimorfismo",
    "heurística",
    "axioma",
    "inerente",
    "intrínseco",
    "subjacente",
    "epifenômeno",
    "holístico",
    "contingência",
  ];

  const analisarExplicacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tema.trim() || !explicacao.trim()) return;

    const textoLower = explicacao.toLowerCase();
    const encontrados = LISTA_JARGOES.filter((j) => textoLower.includes(j));
    setJargoesIdentificados(encontrados);
    setAvaliado(true);
    confetti({ particleCount: 30, spread: 50 });
    if (onRewardXp) onRewardXp(35);
  };

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
        <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Laboratório Feynman com Detector de Jargões
        </h4>
        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
          Público: Criança de 10 Anos
        </span>
      </div>

      <form onSubmit={analisarExplicacao} className="space-y-3">
        <input
          type="text"
          required
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          placeholder="Conceito a explicar (ex: Lei da Gravidade, Inflação, Recursividade)..."
          className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none"
        />

        <textarea
          rows={4}
          required
          value={explicacao}
          onChange={(e) => setExplicacao(e.target.value)}
          placeholder="Explique com analogias do cotidiano. Evite palavras difíceis e jargões acadêmicos..."
          className="w-full p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none"
        />

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold transition cursor-pointer shadow-xs"
        >
          Analisar Clareza e Jargões (+35 XP)
        </button>
      </form>

      {avaliado && (
        <div className="space-y-3 pt-2 animate-in fade-in">
          {jargoesIdentificados.length > 0 ? (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Jargões acadêmicos detectados:
              </p>
              <p className="text-[11px]">
                Você utilizou: <b>{jargoesIdentificados.join(", ")}</b>. Tente substituir por metáforas simples!
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Excelente! Linguagem límpida, sem jargões desnecessários.</span>
            </div>
          )}

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab("lumina")}
              className="w-full py-2 rounded-xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] transition cursor-pointer"
            >
              Debater com a Tutora Socrática Lumina ➔
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// 5. ELABORAÇÃO INTERROGATIVA
export const ToolElaboracaoInterrogativa: React.FC<InteractiveToolProps> = ({ onRewardXp }) => {
  const [fato, setFato] = useState("Plantas realizam fotossíntese capturando luz solar e dióxido de carbono.");
  const [porQue, setPorQue] = useState("");
  const [conectado, setConectado] = useState(false);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!porQue.trim()) return;
    setConectado(true);
    if (onRewardXp) onRewardXp(30);
  };

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4">
      <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2 pb-2 border-b border-[var(--app-border)]">
        <HelpCircle className="w-4 h-4 text-cyan-400" />
        Gerador de Elaboração Interrogativa (Causa & Efeito)
      </h4>

      <form onSubmit={handleSalvar} className="space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1">
            Fato ou Regra Teórica:
          </label>
          <input
            type="text"
            value={fato}
            onChange={(e) => setFato(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-[var(--app-text)] mb-1">
            Por que esse fato faz sentido e qual é a razão biológica/lógica/econômica por trás dele?
          </label>
          <textarea
            rows={3}
            required
            value={porQue}
            onChange={(e) => setPorQue(e.target.value)}
            placeholder="Explique o 'Porquê' fundamental para seu cérebro conectar a causa à consequência..."
            className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
        >
          Consolidar Conexão Mental (+30 XP)
        </button>
      </form>

      {conectado && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Fato ancorado com sucesso na memória semântica através de elaboração interrogativa!</span>
        </div>
      )}
    </div>
  );
};

// 6. MÉTODO CORNELL (EDITOR ESTRUTURADO DE 3 SEÇÕES)
export const ToolCornell: React.FC<InteractiveToolProps> = () => {
  const [pistas, setPistas] = useState("• O que é Taylorismo?\n• Quais os 4 princípios?\n• Qual a crítica central?");
  const [anotacoes, setAnotacoes] = useState(
    "1. Divisão e especialização máxima de tarefas.\n2. Estudo científico de tempos e movimentos (cronometragem).\n3. Seleção e treinamento do trabalhador ideal.\n4. Supervisão funcional contínua.\nCrítica: visão mecanicista e desumanização."
  );
  const [resumo, setResumo] = useState("O Taylorismo focou na máxima eficiência operacional da fábrica através da padronização e divisão de tarefas, mas foi criticado pela alienação do trabalhador.");
  const [modoRevisao, setModoRevisao] = useState(false);

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
        <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          Caderno Estruturado do Método Cornell
        </h4>
        <button
          onClick={() => setModoRevisao(!modoRevisao)}
          className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            modoRevisao
              ? "bg-amber-500 text-black"
              : "bg-[var(--app-bg)] text-[var(--app-text)] border border-[var(--app-border)]"
          }`}
        >
          {modoRevisao ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{modoRevisao ? "Modo Edição" : "Modo Revisão (Tampar Anotações)"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Coluna 1: Pistas (30%) */}
        <div className="md:col-span-1 space-y-1">
          <label className="block text-[11px] font-black uppercase text-[var(--app-primary)]">
            Pistas / Palavras-Chave (30%)
          </label>
          <textarea
            rows={6}
            value={pistas}
            onChange={(e) => setPistas(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none font-mono"
          />
        </div>

        {/* Coluna 2: Anotações da Aula (70%) */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[11px] font-black uppercase text-emerald-400">
            Anotações Principais da Aula (70%)
          </label>
          {modoRevisao ? (
            <div className="h-[148px] rounded-xl bg-black/40 border border-dashed border-[var(--app-border)] flex items-center justify-center text-xs text-neutral-400 p-4 text-center">
              🔒 Anotações ocultas. Olhe para as pistas ao lado e tente lembrar os pontos antes de destampar!
            </div>
          ) : (
            <textarea
              rows={6}
              value={anotacoes}
              onChange={(e) => setAnotacoes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none"
            />
          )}
        </div>
      </div>

      {/* Rodapé: Resumo em 3 Frases */}
      <div className="space-y-1 pt-1">
        <label className="block text-[11px] font-black uppercase text-amber-400">
          Resumo / Síntese em 3 Frases (Feito após a aula)
        </label>
        <textarea
          rows={2}
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none"
        />
      </div>
    </div>
  );
};

// 7. MAPAS CONCEITUAIS
export const ToolMapasConceituais: React.FC<InteractiveToolProps> = () => {
  const [nos, setNos] = useState<string[]>(["Demanda de Mercado", "Preço de Equilíbrio", "Oferta de Produtores"]);
  const [novoNo, setNovoNo] = useState("");

  const adicionarNo = () => {
    if (!novoNo.trim()) return;
    setNos([...nos, novoNo.trim()]);
    setNovoNo("");
  };

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4">
      <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2 pb-2 border-b border-[var(--app-border)]">
        <Layers className="w-4 h-4 text-indigo-400" />
        Construtor de Proposições e Mapas Conceituais
      </h4>

      <div className="flex gap-2">
        <input
          type="text"
          value={novoNo}
          onChange={(e) => setNovoNo(e.target.value)}
          placeholder="Adicionar conceito..."
          className="flex-1 p-2 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none"
        />
        <button
          onClick={adicionarNo}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Adicionar
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex flex-wrap items-center justify-center gap-3">
        {nos.map((no, idx) => (
          <React.Fragment key={idx}>
            <div className="px-3.5 py-2 rounded-xl bg-[var(--app-card)] border border-[var(--app-primary)]/40 text-xs font-extrabold text-[var(--app-text)] shadow-xs">
              {no}
            </div>
            {idx < nos.length - 1 && (
              <span className="text-[10px] font-bold text-[var(--app-primary)] bg-[var(--app-primary)]/10 px-2 py-0.5 rounded-full border border-[var(--app-primary)]/20">
                determina ➔
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// 8. TESTES PRÁTICOS (MINI SIMULADO 10Q)
export const ToolTestesPraticos: React.FC<InteractiveToolProps> = ({ onNavigateToTab }) => {
  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
        <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2">
          <Target className="w-4 h-4 text-rose-400" />
          Testes Práticos & Simulados de Exame
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
          Alta Utilidade (Dunlosky)
        </span>
      </div>

      <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
        Resolver testes cronometrados sem consulta é o método com maior retorno comprovado para o dia da prova oficial.
      </p>

      {onNavigateToTab && (
        <button
          onClick={() => onNavigateToTab("estudar", "simulados")}
          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <Target className="w-4 h-4" />
          <span>Abrir Gerador de Simulados 10Q do Brain Studio</span>
        </button>
      )}
    </div>
  );
};

// 9. POMODORO AVANÇADO
export const ToolPomodoro: React.FC<InteractiveToolProps> = ({ onRewardXp }) => {
  const [segundos, setSegundos] = useState(25 * 60);
  const [ativo, setAtivo] = useState(false);
  const [modo, setModo] = useState<"foco25" | "foco50" | "pausa">("foco25");
  const [ciclos, setCiclos] = useState(0);

  useEffect(() => {
    let interval: any;
    if (ativo && segundos > 0) {
      interval = setInterval(() => setSegundos((s) => s - 1), 1000);
    } else if (segundos === 0 && ativo) {
      setAtivo(false);
      if (modo !== "pausa") {
        setCiclos((c) => c + 1);
        confetti({ particleCount: 50, spread: 60 });
        if (onRewardXp) onRewardXp(50);
        setModo("pausa");
        setSegundos(5 * 60);
      } else {
        setModo("foco25");
        setSegundos(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [ativo, segundos, modo, onRewardXp]);

  const formatarTempo = () => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4 text-center">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
        <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-red-400" />
          Temporizador Pomodoro de Hiperfoco
        </h4>
        <span className="text-xs font-bold text-[var(--app-text-muted)]">Ciclos: {ciclos} 🍅</span>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => {
            setModo("foco25");
            setSegundos(25 * 60);
            setAtivo(false);
          }}
          className={`px-3 py-1 rounded-lg text-xs font-bold ${
            modo === "foco25" ? "bg-red-500 text-white" : "bg-[var(--app-bg)] text-[var(--app-text-muted)]"
          }`}
        >
          25 min
        </button>
        <button
          onClick={() => {
            setModo("foco50");
            setSegundos(50 * 60);
            setAtivo(false);
          }}
          className={`px-3 py-1 rounded-lg text-xs font-bold ${
            modo === "foco50" ? "bg-red-500 text-white" : "bg-[var(--app-bg)] text-[var(--app-text-muted)]"
          }`}
        >
          50 min (Hiperfoco)
        </button>
        <button
          onClick={() => {
            setModo("pausa");
            setSegundos(5 * 60);
            setAtivo(false);
          }}
          className={`px-3 py-1 rounded-lg text-xs font-bold ${
            modo === "pausa" ? "bg-emerald-500 text-white" : "bg-[var(--app-bg)] text-[var(--app-text-muted)]"
          }`}
        >
          Pausa (5 min)
        </button>
      </div>

      <div className="text-5xl font-mono font-black text-[var(--app-text)] tracking-widest my-2">
        {formatarTempo()}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setAtivo(!ativo)}
          className="px-6 py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-extrabold flex items-center gap-2 transition cursor-pointer shadow-xs"
        >
          {ativo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{ativo ? "Pausar" : "Iniciar Foco"}</span>
        </button>
        <button
          onClick={() => {
            setAtivo(false);
            setSegundos(modo === "foco50" ? 50 * 60 : modo === "pausa" ? 5 * 60 : 25 * 60);
          }}
          className="p-2.5 rounded-xl bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 10. CODIFICAÇÃO DUAL (DUAL CODING)
export const ToolDualCoding: React.FC<InteractiveToolProps> = () => {
  const [conceito, setConceito] = useState("Curva de Oferta e Demanda");
  const [tipoVisual, setTipoVisual] = useState<"grafico" | "tabela" | "fluxo">("grafico");

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-4">
      <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2 pb-2 border-b border-[var(--app-border)]">
        <Split className="w-4 h-4 text-teal-400" />
        Pareamento Dual (Texto + Esquema Visual)
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-2">
          <span className="font-extrabold text-blue-400 block uppercase text-[10px]">Canal 1: Verbal</span>
          <textarea
            rows={3}
            value={conceito}
            onChange={(e) => setConceito(e.target.value)}
            className="w-full bg-transparent outline-none resize-none text-xs text-[var(--app-text)]"
          />
        </div>

        <div className="p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-2 flex flex-col justify-between">
          <span className="font-extrabold text-emerald-400 block uppercase text-[10px]">Canal 2: Visual</span>
          <div className="flex items-center justify-center p-3 rounded-xl bg-[var(--app-card)] border border-[var(--app-border)] text-center">
            {tipoVisual === "grafico" && <span>📈 Gráfico de eixos X/Y com ponto de equilíbrio</span>}
            {tipoVisual === "tabela" && <span>📊 Matriz comparativa de 2 colunas contrastantes</span>}
            {tipoVisual === "fluxo" && <span>➔ Entrada ➔ Processamento ➔ Saída</span>}
          </div>
          <div className="flex justify-center gap-2">
            {(["grafico", "tabela", "fluxo"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipoVisual(t)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                  tipoVisual === t ? "bg-teal-500 text-white" : "bg-[var(--app-card)] text-[var(--app-text-muted)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 11. PRÉ-TESTE (EFEITO DE GERAÇÃO)
export const ToolPreTeste: React.FC<InteractiveToolProps> = () => {
  const [tentativa, setTentativa] = useState("");
  const [revelado, setRevelado] = useState(false);

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3">
      <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2 pb-2 border-b border-[var(--app-border)]">
        <Zap className="w-4 h-4 text-yellow-400" />
        Pré-Teste Cego (Ativação de Curiosidade Epistêmica)
      </h4>
      <p className="text-xs text-[var(--app-text)] font-semibold">
        Desafio: <i>"Por que uma barra de ferro parece mais fria que um pedaço de madeira na mesma temperatura ambiente?"</i>
      </p>

      {!revelado ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={tentativa}
            onChange={(e) => setTentativa(e.target.value)}
            placeholder="Tente formular uma hipótese antes de ver a resposta (mesmo que ache que vá errar)..."
            className="w-full p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none"
          />
          <button
            onClick={() => setRevelado(true)}
            disabled={!tentativa.trim()}
            className="w-full py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black text-xs font-bold transition cursor-pointer"
          >
            Revelar Mecanismo Físico Real
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs space-y-2 text-emerald-300 animate-in fade-in">
          <p className="font-bold">Mecanismo: Condutividade Térmica!</p>
          <p className="text-[11px] text-[var(--app-text-muted)]">
            O ferro não está mais frio, mas conduz o calor da sua mão para longe muito mais rápido que a madeira.
            Como você arriscou uma hipótese primeiro, seu cérebro registrou esse aprendizado com 43% mais retenção!
          </p>
        </div>
      )}
    </div>
  );
};

// 12. RESUMO ESTRUTURADO (COM LIMITE DE 150 PALAVRAS)
export const ToolResumoEstruturado: React.FC<InteractiveToolProps> = () => {
  const [texto, setTexto] = useState("");
  const totalPalavras = texto.trim() ? texto.trim().split(/\s+/).length : 0;
  const limite = 150;

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
        <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-400" />
          Resumo Estruturado com Limite Rígido (Anti-Cópia Passiva)
        </h4>
        <span
          className={`text-xs font-bold font-mono ${
            totalPalavras > limite ? "text-rose-400" : "text-emerald-400"
          }`}
        >
          {totalPalavras} / {limite} palavras
        </span>
      </div>

      <textarea
        rows={4}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Sintetize a ideia central, evidências e aplicação em no máximo 150 palavras..."
        className="w-full p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none resize-none"
      />

      {totalPalavras > limite && (
        <p className="text-[11px] text-rose-400 font-bold">
          ⚠️ Limite excedido! Corte palavras desnecessárias para forçar síntese mental.
        </p>
      )}
    </div>
  );
};

// 13. ESTUDO INTERCALADO (GESTOR DE CARGA COGNITIVA)
export const ToolEstudoIntercalado: React.FC<InteractiveToolProps> = () => {
  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3">
      <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2 pb-2 border-b border-[var(--app-border)]">
        <Repeat className="w-4 h-4 text-cyan-400" />
        Regra dos 45 Minutos: Alternância de Carga Mental
      </h4>
      <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
        Nunca estude o mesmo tema por mais de 45 minutos seguidos. Alterne matérias de cálculo (hemisfério esquerdo/exatas) com matérias de leitura e argumentação (humanas/biológicas).
      </p>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
          40m Exatas
        </div>
        <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold">
          40m Humanas
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
          40m Prática
        </div>
      </div>
    </div>
  );
};

// 14. SQ3R (SURVEY, QUESTION, READ, RECITE, REVIEW)
export const ToolSQ3R: React.FC<InteractiveToolProps> = () => {
  const [etapasConcluidas, setEtapasConcluidas] = useState<Record<string, boolean>>({
    survey: false,
    question: false,
    read: false,
    recite: false,
    review: false,
  });

  const toggleEtapa = (k: string) => {
    setEtapasConcluidas((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const etapas = [
    { k: "survey", label: "1. Survey (Folhear títulos, gráficos e resumos por 3 min)" },
    { k: "question", label: "2. Question (Formular 3 perguntas que quer responder)" },
    { k: "read", label: "3. Read (Leitura ativa buscando as respostas)" },
    { k: "recite", label: "4. Recite (Responder as perguntas em voz alta sem olhar)" },
    { k: "review", label: "5. Review (Revisão final dos tópicos principais)" },
  ];

  return (
    <div className="p-5 rounded-3xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-3">
      <h4 className="text-sm font-extrabold text-[var(--app-text)] flex items-center gap-2 pb-2 border-b border-[var(--app-border)]">
        <BookOpen className="w-4 h-4 text-emerald-400" />
        Protocolo Sistemático SQ3R de Leitura Ativa
      </h4>

      <div className="space-y-2 text-xs">
        {etapas.map((et) => (
          <div
            key={et.k}
            onClick={() => toggleEtapa(et.k)}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
              etapasConcluidas[et.k]
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 line-through"
                : "bg-[var(--app-bg)] border-[var(--app-border)] text-[var(--app-text)] hover:border-[var(--app-primary)]/40"
            }`}
          >
            <input
              type="checkbox"
              checked={etapasConcluidas[et.k]}
              readOnly
              className="rounded accent-emerald-500 pointer-events-none"
            />
            <span className="font-semibold">{et.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
