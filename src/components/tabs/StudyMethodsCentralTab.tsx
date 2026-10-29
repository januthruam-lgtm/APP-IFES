/**
 * Brain Studio - Central dos 14 Métodos de Estudo Eficazes (Bloco 5B)
 * Conteúdo completo, evidência científica (Dunlosky et al., 2013),
 * quando usar, quando NÃO usar e ferramenta interativa funcional para cada um dos 14 métodos.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Brain,
  Layers,
  Repeat,
  CheckCircle2,
  Clock,
  Shuffle,
  HelpCircle,
  FileText,
  Target,
  Split,
  Zap,
  Search,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { UserProfile, CourseTrack } from "../../types";
import {
  METODOS_ESTUDO,
  MetodoEstudoInfo,
  CategoriaMetodo,
  NivelEvidencia,
} from "../../data/metodosEstudoData";
import {
  ToolRecuperacaoAtiva,
  ToolRepeticaoEspacada,
  ToolEntrelacamento,
  ToolFeynman,
  ToolElaboracaoInterrogativa,
  ToolCornell,
  ToolMapasConceituais,
  ToolTestesPraticos,
  ToolPomodoro,
  ToolDualCoding,
  ToolPreTeste,
  ToolResumoEstruturado,
  ToolEstudoIntercalado,
  ToolSQ3R,
} from "../study-methods/MetodosInterativos";

interface StudyMethodsCentralTabProps {
  user: UserProfile;
  courses?: CourseTrack[];
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (amount: number) => void;
  onNavigateToTab?: (tabId: string, subView?: string) => void;
  onNavigateToFlashcards?: () => void;
  onOpenSocraticWithTopic?: (topic: string) => void;
}

export const StudyMethodsCentralTab: React.FC<StudyMethodsCentralTabProps> = ({
  user,
  courses,
  onRewardXp,
  onRewardCoins,
  onNavigateToTab,
}) => {
  const { t } = useTranslation();
  const [metodoSelecionadoId, setMetodoSelecionadoId] = useState<string>("recuperacao_ativa");
  const [categoriaAtiva, setCategoriaAtiva] = useState<"todas" | CategoriaMetodo>("todas");
  const [busca, setBusca] = useState("");

  const metodoAtivo = METODOS_ESTUDO.find((m) => m.id === metodoSelecionadoId) || METODOS_ESTUDO[0];

  // Filtros
  const metodosFiltrados = METODOS_ESTUDO.filter((m) => {
    const matchCat = categoriaAtiva === "todas" || m.categoria === categoriaAtiva;
    const matchBusca =
      m.nome.toLowerCase().includes(busca.toLowerCase()) ||
      m.nomeIngles.toLowerCase().includes(busca.toLowerCase()) ||
      m.explicacao.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const getCorEvidencia = (nivel: NivelEvidencia) => {
    switch (nivel) {
      case "Alta Utilidade":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Moderada Utilidade":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Utilidade Específica":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    }
  };

  // Renderiza a ferramenta interativa funcional de acordo com o método
  const renderFerramentaInterativa = (metodo: MetodoEstudoInfo) => {
    const props = {
      metodo,
      onRewardXp,
      onNavigateToTab,
    };

    switch (metodo.id) {
      case "recuperacao_ativa":
        return <ToolRecuperacaoAtiva {...props} />;
      case "repeticao_espacada":
        return <ToolRepeticaoEspacada {...props} />;
      case "entrelacamento":
        return <ToolEntrelacamento {...props} />;
      case "feynman":
        return <ToolFeynman {...props} />;
      case "elaboracao_interrogativa":
        return <ToolElaboracaoInterrogativa {...props} />;
      case "cornell":
        return <ToolCornell {...props} />;
      case "mapas_conceituais":
        return <ToolMapasConceituais {...props} />;
      case "testes_praticos":
        return <ToolTestesPraticos {...props} />;
      case "pomodoro":
        return <ToolPomodoro {...props} />;
      case "dual_coding":
        return <ToolDualCoding {...props} />;
      case "pre_teste":
        return <ToolPreTeste {...props} />;
      case "resumo_estruturado":
        return <ToolResumoEstruturado {...props} />;
      case "estudo_intercalado":
        return <ToolEstudoIntercalado {...props} />;
      case "sq3r":
        return <ToolSQ3R {...props} />;
      default:
        return <ToolRecuperacaoAtiva {...props} />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner Científico */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase">
              Neurociência da Aprendizagem
            </span>
            <span className="text-xs text-[var(--app-text-muted)] font-bold">• Dunlosky et al. (2013)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[var(--app-text)] tracking-tight">
            Os 14 Métodos Científicos de Estudo
          </h1>

          <p className="text-xs sm:text-sm text-[var(--app-text-muted)] max-w-3xl leading-relaxed">
            Metodologias validadas em estudos empíricos para maximizar a retenção e a compreensão,
            eliminando a ilusão de competência e a releitura passiva ineficaz.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-center p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)]">
            <p className="text-xl font-black text-[var(--app-primary)]">14</p>
            <p className="text-[10px] uppercase font-bold text-[var(--app-text-muted)]">Ferramentas</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)]">
            <p className="text-xl font-black text-emerald-400">100%</p>
            <p className="text-[10px] uppercase font-bold text-[var(--app-text-muted)]">Evidência Real</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {(
            [
              { id: "todas", label: "Todos (14)" },
              { id: "memorizacao", label: "Memorização" },
              { id: "compreensao", label: "Compreensão" },
              { id: "organizacao", label: "Organização" },
              { id: "foco", label: "Foco" },
            ] as const
          ).map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoriaAtiva(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                categoriaAtiva === c.id
                  ? "bg-[var(--app-primary)] text-white shadow-xs"
                  : "bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border border-[var(--app-border)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[var(--app-text-muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar método..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
          />
        </div>
      </div>

      {/* Grid Principal: Seletor à Esquerda (ou Carrossel) e Painel Detalhado à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lista Lateral de Métodos (4 colunas) */}
        <div className="lg:col-span-4 space-y-2 max-h-[780px] overflow-y-auto pr-1">
          {metodosFiltrados.map((m) => {
            const isSelected = m.id === metodoAtivo.id;
            return (
              <div
                key={m.id}
                onClick={() => setMetodoSelecionadoId(m.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? "bg-[var(--app-card)] border-[var(--app-primary)] ring-2 ring-[var(--app-primary)]/30 shadow-xs"
                    : "bg-[var(--app-card)] border-[var(--app-border)] hover:border-[var(--app-primary)]/40 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[var(--app-text)] line-clamp-1">{m.nome}</span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${getCorEvidencia(
                      m.nivelEvidencia
                    )}`}
                  >
                    {m.nivelEvidencia.split(" ")[0]}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-1 italic">{m.nomeIngles}</p>
              </div>
            );
          })}
        </div>

        {/* Painel do Método Ativo com Ferramenta Interativa (8 colunas) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            {/* Cabeçalho do Método */}
            <div className="space-y-2 pb-4 border-b border-[var(--app-border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${getCorEvidencia(
                    metodoAtivo.nivelEvidencia
                  )}`}
                >
                  Nível de Evidência: {metodoAtivo.nivelEvidencia}
                </span>
                <span className="text-xs font-mono font-bold text-[var(--app-text-muted)]">
                  {metodoAtivo.nomeIngles}
                </span>
              </div>

              <h2 className="text-2xl font-black text-[var(--app-text)] tracking-tight">
                {metodoAtivo.nome}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--app-text)] leading-relaxed">
                {metodoAtivo.explicacao}
              </p>
            </div>

            {/* Referência e Evidência Científica */}
            <div className="p-4 rounded-2xl bg-[var(--app-card-secondary)] border border-[var(--app-border)] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--app-primary)]">
                <ShieldCheck className="w-4 h-4" />
                <span>Base Científica & Literatura:</span>
              </div>
              <p className="text-xs font-mono text-[var(--app-text)]">{metodoAtivo.referenciaCientifica}</p>
              <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed pt-1">
                {metodoAtivo.resumoEvidencia}
              </p>
            </div>

            {/* Quando Usar e Quando NÃO Usar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <h4 className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Quando Usar:
                </h4>
                <ul className="space-y-1.5 text-[var(--app-text-muted)] text-[11px]">
                  {metodoAtivo.quandoUsar.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <h4 className="font-extrabold text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Quando NÃO Usar:
                </h4>
                <ul className="space-y-1.5 text-[var(--app-text-muted)] text-[11px]">
                  {metodoAtivo.quandoNaoUsar.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Dica Prática de Aplicação */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-300">
              <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-extrabold block">Dica Prática:</span>
                <span className="text-[11px] text-amber-200/90 leading-relaxed">
                  {metodoAtivo.dicaPratica}
                </span>
              </div>
            </div>

            {/* Ferramenta Interativa Correspondente do Brain Studio */}
            <div className="pt-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)] mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[var(--app-primary)]" />
                Ferramenta Interativa Prática no App
              </h3>
              {renderFerramentaInterativa(metodoAtivo)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
