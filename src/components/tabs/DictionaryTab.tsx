import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Search,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Bookmark,
  Trash2,
  CheckCircle,
  HelpCircle,
  Award,
  Layers,
  Brain,
  History,
  RotateCcw,
  Lightbulb,
} from "lucide-react";
import { UserProfile } from "../../types";
import { VerbeteDicionario, ItemVocabularioSalvo } from "../../types/dictionary";
import {
  lookupDictionaryTerm,
  getWordOfTheDay,
  getSearchHistory,
  clearSearchHistory,
  getSavedVocabulary,
  saveToVocabulary,
  removeFromVocabulary,
} from "../../services/dictionaryService";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { speakText } from "../../lib/speech";

interface DictionaryTabProps {
  user: UserProfile;
  onOpenSocraticWithTerm?: (term: string) => void;
  onNavigateToFlashcards?: () => void;
  onRewardXp?: (xp: number) => void;
  onRewardCoins?: (coins: number) => void;
}

export const DictionaryTab: React.FC<DictionaryTabProps> = ({
  user,
  onOpenSocraticWithTerm,
  onNavigateToFlashcards,
  onRewardXp,
  onRewardCoins,
}) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentVerbete, setCurrentVerbete] = useState<VerbeteDicionario | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [savedVocab, setSavedVocab] = useState<ItemVocabularioSalvo[]>([]);

  // Mini-Quiz de Vocabulário
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Palavra do Dia
  const wordOfTheDay = getWordOfTheDay(i18n.language || "pt-BR");

  // Transcrição de Voz pelo Microfone
  const { isListening, isSupported: micSupported, startListening, stopListening } = useSpeechRecognition({
    onTranscriptChange: (text) => {
      setSearchTerm(text);
    },
    onFinalTranscript: (final) => {
      setSearchTerm(final);
      handleSearch(final);
    },
  });

  useEffect(() => {
    setHistory(getSearchHistory());
    setSavedVocab(getSavedVocabulary());
    setCurrentVerbete(wordOfTheDay);
  }, [i18n.language]);

  const handleSearch = async (termToSearch?: string) => {
    const term = (termToSearch || searchTerm).trim();
    if (!term) return;

    setIsSearching(true);
    try {
      const res = await lookupDictionaryTerm(term, i18n.language || "pt-BR");
      setCurrentVerbete(res);
      setHistory(getSearchHistory());
    } catch {
      console.warn("Termo não localizado no momento.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleSave = (verbete: VerbeteDicionario) => {
    const isAlready = savedVocab.some((i) => i.termo.toLowerCase() === verbete.termo.toLowerCase());
    if (isAlready) {
      const item = savedVocab.find((i) => i.termo.toLowerCase() === verbete.termo.toLowerCase());
      if (item) {
        removeFromVocabulary(item.id);
        setSavedVocab(getSavedVocabulary());
      }
    } else {
      const ok = saveToVocabulary(verbete);
      if (ok) {
        setSavedVocab(getSavedVocabulary());
        if (onRewardXp) onRewardXp(10);
      }
    }
  };

  const handleStartQuiz = () => {
    if (savedVocab.length < 2) return;
    setQuizActive(true);
    setQuizQuestionIndex(0);
    setQuizSelectedOption(null);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const handleAnswerQuiz = (optionIndex: number, isCorrect: boolean) => {
    setQuizSelectedOption(optionIndex);
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }

    setTimeout(() => {
      if (quizQuestionIndex + 1 < Math.min(savedVocab.length, 5)) {
        setQuizQuestionIndex((prev) => prev + 1);
        setQuizSelectedOption(null);
      } else {
        setQuizCompleted(true);
        if (onRewardXp) onRewardXp(25);
        if (onRewardCoins) onRewardCoins(5);
      }
    }, 1200);
  };

  const isSavedCurrent = currentVerbete
    ? savedVocab.some((i) => i.termo.toLowerCase() === currentVerbete.termo.toLowerCase())
    : false;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--app-text)]">
              {t("dicionario.titulo_pagina", "Dicionário Virtual Inteligente")}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              {t("dicionario.subtitulo_pagina", "Fontes abertas (Wiktionary, Dicionário Aberto), camada Lumina IA e vocabulário ativo")}
            </p>
          </div>
        </div>

        {/* Vocabulário Counter & Mini-Quiz trigger */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="px-3.5 py-2 rounded-2xl bg-[var(--app-card-hover)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-[var(--app-primary)]" />
            <span>{savedVocab.length} {t("dicionario.palavras_salvas", "palavras salvas")}</span>
          </div>

          {savedVocab.length >= 2 && (
            <button
              onClick={handleStartQuiz}
              className="px-4 py-2 rounded-2xl bg-[var(--app-primary)] text-white text-xs font-bold shadow-sm hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              {t("dicionario.revisar_quiz", "Revisar com Quiz (+XP)")}
            </button>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-2 shadow-xs focus-within:border-[var(--app-primary)] transition">
          <Search className="w-5 h-5 ml-2 text-[var(--app-text-muted)] shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={t("dicionario.placeholder_busca", "Digite qualquer palavra ou termo acadêmico (tolerante a acentos)...")}
            className="flex-1 bg-transparent px-2 py-2 text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none"
          />

          {/* Microfone de Transcrição */}
          {micSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2.5 rounded-xl transition cursor-pointer shrink-0 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
              title={isListening ? t("dicionario.parar_mic", "Ouvindo... Clique para parar") : t("dicionario.falar_mic", "Falar palavra no microfone")}
              aria-label={t("dicionario.falar_mic", "Falar no microfone")}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !searchTerm.trim()}
            className="px-4 py-2 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold hover:opacity-90 transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSearching ? t("geral.buscando", "Buscando...") : t("geral.buscar", "Buscar")}
          </button>
        </div>

        {/* Histórico rápido de buscas */}
        {history.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2 px-1 text-xs">
            <span className="text-[var(--app-text-muted)] flex items-center gap-1 font-semibold">
              <History className="w-3 h-3" />
              {t("dicionario.recentes", "Recentes:")}
            </span>
            {history.slice(0, 6).map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchTerm(item);
                  handleSearch(item);
                }}
                className="px-2.5 py-0.5 rounded-lg bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] transition cursor-pointer"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => {
                clearSearchHistory();
                setHistory([]);
              }}
              className="text-[10px] text-[var(--app-text-muted)] hover:text-red-500 underline ml-1 cursor-pointer"
            >
              {t("dicionario.limpar_historico", "limpar")}
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Verbete & Vocabulário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Verbete or Word of the Day */}
        <div className="lg:col-span-2 space-y-6">
          {currentVerbete ? (
            <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
              {/* Header: Term, Audio, Class, Save */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--app-text)] capitalize">
                    {currentVerbete.termo}
                  </h2>
                  {currentVerbete.pronunciaFonetica && (
                    <span className="text-xs sm:text-sm font-mono text-[var(--app-text-muted)] bg-[var(--app-border)]/50 px-2.5 py-1 rounded-lg">
                      {currentVerbete.pronunciaFonetica}
                    </span>
                  )}
                  <button
                    onClick={() => speakText(currentVerbete.termo, { lang: currentVerbete.idioma || i18n.language || "pt-BR" })}
                    className="p-2.5 rounded-xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] hover:bg-[var(--app-primary)]/20 transition cursor-pointer"
                    title={t("dicionario.ouvir_pronuncia", "Ouvir pronúncia")}
                    aria-label={t("dicionario.ouvir_pronuncia", "Ouvir pronúncia")}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSave(currentVerbete)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      isSavedCurrent
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-[var(--app-card-hover)] hover:bg-[var(--app-border)] text-[var(--app-text)]"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    {isSavedCurrent ? t("dicionario.salvo", "Salvo no Vocabulário") : t("dicionario.salvar_vocabulario", "Salvar no Vocabulário")}
                  </button>

                  {onOpenSocraticWithTerm && (
                    <button
                      onClick={() => onOpenSocraticWithTerm(currentVerbete.termo)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--app-primary)] text-white hover:opacity-90 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Brain className="w-4 h-4" />
                      {t("dicionario.perguntar_lumina", "Perguntar à Lumina")}
                    </button>
                  )}
                </div>
              </div>

              {/* Camada Inteligente: Explicação da Lumina */}
              <div className="bg-gradient-to-br from-amber-500/10 via-[var(--app-primary)]/10 to-orange-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      {t("dicionario.explicacao_lumina", "Explicação da Lumina")}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    {t("dicionario.nivel", "Nível")}: {currentVerbete.luminaInsight.nivelDificuldade}
                  </span>
                </div>

                <p className="text-base text-[var(--app-text)] leading-relaxed font-medium">
                  {currentVerbete.luminaInsight.definicaoSimples}
                </p>

                {/* 2 Frases Inéditas */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                    {t("dicionario.frases_ineditas", "2 Frases Inéditas no Contexto de Estudo:")}
                  </span>
                  <div className="space-y-1.5 text-xs sm:text-sm text-[var(--app-text)] italic">
                    {currentVerbete.luminaInsight.exemplosIneditos.map((ex, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white/40 dark:bg-black/20 p-2.5 rounded-xl">
                        <span className="text-[var(--app-primary)] font-bold">“</span>
                        <span className="flex-1">{ex}</span>
                        <span className="text-[var(--app-primary)] font-bold">”</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dica de Memorização & Comparação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-white/60 dark:bg-black/30 p-3 rounded-2xl border border-amber-500/20">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 mb-1">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      {t("dicionario.dica_memorizacao", "Dica de Memorização")}
                    </div>
                    <p className="text-[var(--app-text-muted)] leading-relaxed">
                      {currentVerbete.luminaInsight.dicaMemorizacao}
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-black/30 p-3 rounded-2xl border border-amber-500/20">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 mb-1">
                      <HelpCircle className="w-4 h-4 text-amber-500" />
                      {t("dicionario.palavras_parecidas", "Palavras Parecidas")}
                    </div>
                    <p className="text-[var(--app-text-muted)] leading-relaxed">
                      {currentVerbete.luminaInsight.comparacaoPalavras}
                    </p>
                  </div>
                </div>

                {currentVerbete.luminaInsight.isGeradoPorIa && (
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 italic pt-1">
                    ⚠️ {t("dicionario.aviso_ia", "Gíria, neologismo ou termo recente: definição gerada por IA, pode conter imprecisões.")}
                  </p>
                )}
              </div>

              {/* Definições Oficiais */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text-muted)]">
                  {t("dicionario.definicoes_oficiais", "Definições e Sentidos Formais")}
                </h3>
                <div className="space-y-2.5">
                  {currentVerbete.significados.map((sig, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[var(--app-card-hover)]/40 border border-[var(--app-border)] space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[var(--app-primary)] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-[var(--app-accent)]">{sig.classeGramatical}</span>
                      </div>
                      <p className="text-sm font-medium text-[var(--app-text)] pl-7">{sig.definicao}</p>
                      {sig.exemplos && sig.exemplos.length > 0 && (
                        <p className="text-xs text-[var(--app-text-muted)] pl-7 italic">
                          Ex.: {sig.exemplos[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sinônimos & Antônimos */}
              {(currentVerbete.sinonimosGerais.length > 0 || currentVerbete.antonimosGerais.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {currentVerbete.sinonimosGerais.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[var(--app-card-hover)]/30 border border-[var(--app-border)]">
                      <span className="font-bold text-[var(--app-text)] block mb-1.5">
                        {t("dicionario.sinonimos", "Sinônimos:")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentVerbete.sinonimosGerais.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSearchTerm(s);
                              handleSearch(s);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[var(--app-border)]/50 text-[var(--app-text)] hover:bg-[var(--app-primary)]/20 transition cursor-pointer"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentVerbete.antonimosGerais.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[var(--app-card-hover)]/30 border border-[var(--app-border)]">
                      <span className="font-bold text-[var(--app-text)] block mb-1.5">
                        {t("dicionario.antonimos", "Antônimos:")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentVerbete.antonimosGerais.map((a, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSearchTerm(a);
                              handleSearch(a);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[var(--app-border)]/50 text-[var(--app-text)] hover:bg-[var(--app-primary)]/20 transition cursor-pointer"
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Etimologia */}
              {currentVerbete.etimologia && (
                <div className="p-3.5 rounded-2xl bg-[var(--app-card-hover)]/20 border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
                  <strong className="text-[var(--app-text)]">{t("dicionario.etimologia", "Etimologia:")} </strong>
                  {currentVerbete.etimologia}
                </div>
              )}

              {/* Fonte & Atribuição Discreta */}
              <div className="pt-3 border-t border-[var(--app-border)] text-[11px] text-[var(--app-text-muted)] flex flex-wrap items-center justify-between gap-2">
                <span>
                  {t("dicionario.fonte", "Fonte:")} <strong className="text-[var(--app-text)]">{currentVerbete.fonteNome}</strong> ({currentVerbete.fonteLicenca})
                </span>
                <span>{t("dicionario.cache_info", "Atualizado e em cache local no navegador")}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-12 text-center text-[var(--app-text-muted)] space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-[var(--app-primary)] opacity-50" />
              <h3 className="text-base font-bold text-[var(--app-text)]">{t("dicionario.digite_palavra", "Pesquise uma palavra")}</h3>
              <p className="text-xs max-w-sm mx-auto">{t("dicionario.instrucao_busca", "Digite qualquer termo acima ou utilize o microfone para obter significado, etimologia e a camada de explicação inteligente da Lumina.")}</p>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Palavra do Dia & Vocabulário Salvo */}
        <div className="space-y-6">
          {/* Card: Palavra do Dia */}
          <div className="bg-gradient-to-br from-[var(--app-primary)]/10 via-[var(--app-accent)]/10 to-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--app-primary)]">
                ⭐ {t("dicionario.palavra_do_dia", "Palavra do Dia")}
              </span>
              <button
                onClick={() => speakText(wordOfTheDay.termo, { lang: wordOfTheDay.idioma || i18n.language || "pt-BR" })}
                className="p-1.5 rounded-lg bg-[var(--app-card)] hover:bg-[var(--app-border)] text-[var(--app-text)] transition cursor-pointer"
                title={t("dicionario.ouvir_pronuncia", "Ouvir pronúncia")}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-black text-[var(--app-text)]">{wordOfTheDay.termo}</h3>
              <p className="text-xs text-[var(--app-accent)] font-semibold">{wordOfTheDay.significados[0]?.classeGramatical}</p>
            </div>

            <p className="text-xs text-[var(--app-text)] line-clamp-3 leading-relaxed">
              {wordOfTheDay.luminaInsight.definicaoSimples}
            </p>

            <button
              onClick={() => setCurrentVerbete(wordOfTheDay)}
              className="w-full py-2 rounded-xl bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] transition cursor-pointer text-center"
            >
              {t("dicionario.ver_verbete_completo", "Ver Verbete Completo")}
            </button>
          </div>

          {/* Card: Meu Vocabulário Salvo */}
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[var(--app-primary)]" />
                <h3 className="text-sm font-black text-[var(--app-text)]">
                  {t("dicionario.meu_vocabulario", "Meu Vocabulário")}
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--app-border)]/50 text-[var(--app-text-muted)]">
                {savedVocab.length}
              </span>
            </div>

            {savedVocab.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--app-text-muted)] space-y-1">
                <p>{t("dicionario.sem_salvos", "Nenhuma palavra salva ainda.")}</p>
                <p className="text-[11px]">{t("dicionario.dica_salvar", "Toque em 'Salvar no Vocabulário' ao consultar uma palavra para criar seu banco de revisão.")}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {savedVocab.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[var(--app-card-hover)]/40 border border-[var(--app-border)] flex items-start justify-between gap-2 group hover:border-[var(--app-primary)]/40 transition"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setSearchTerm(item.termo);
                        handleSearch(item.termo);
                      }}
                    >
                      <h4 className="text-xs font-bold text-[var(--app-text)] capitalize">{item.termo}</h4>
                      <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-1">{item.definicaoCurta}</p>
                    </div>
                    <button
                      onClick={() => {
                        removeFromVocabulary(item.id);
                        setSavedVocab(getSavedVocabulary());
                      }}
                      className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                      title={t("geral.excluir", "Excluir")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini-Quiz Modal */}
      {quizActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-2xl space-y-5 text-[var(--app-text)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black">
                  {t("dicionario.quiz_titulo", "Quiz de Fixação do Vocabulário")}
                </h3>
              </div>
              <span className="text-xs font-bold text-[var(--app-text-muted)]">
                {quizQuestionIndex + 1} / {Math.min(savedVocab.length, 5)}
              </span>
            </div>

            {!quizCompleted ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[var(--app-card-hover)] border border-[var(--app-border)]">
                  <span className="text-xs uppercase font-bold text-[var(--app-text-muted)] block mb-1">
                    {t("dicionario.qual_definicao", "Qual é a definição correta de:")}
                  </span>
                  <h4 className="text-xl font-black text-[var(--app-primary)] capitalize">
                    {savedVocab[quizQuestionIndex]?.termo}
                  </h4>
                </div>

                <div className="space-y-2">
                  {/* Opção Correta e Distratores */}
                  {[
                    { text: savedVocab[quizQuestionIndex]?.definicaoCurta, correct: true },
                    { text: "Conceito antagônico secundário ou derivado de processos não lineares.", correct: false },
                    { text: "Propriedade física transitória que varia com a temperatura ambiente.", correct: false },
                  ]
                    .sort(() => (quizQuestionIndex % 2 === 0 ? 1 : -1))
                    .map((opt, i) => {
                      const isSelected = quizSelectedOption === i;
                      return (
                        <button
                          key={i}
                          disabled={quizSelectedOption !== null}
                          onClick={() => handleAnswerQuiz(i, opt.correct)}
                          className={`w-full p-3.5 rounded-2xl border text-xs text-left font-medium transition cursor-pointer ${
                            isSelected
                              ? opt.correct
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300"
                              : "bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border-[var(--app-border)] text-[var(--app-text)]"
                          }`}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 mx-auto flex items-center justify-center">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--app-text)]">
                    {t("dicionario.quiz_concluido", "Excelente Revisão!")}
                  </h3>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">
                    {t("dicionario.quiz_resultado", "Você acertou {{score}} de {{total}} palavras e ganhou +25 XP e +5 Moedas!", {
                      score: quizScore,
                      total: Math.min(savedVocab.length, 5),
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setQuizActive(false)}
                  className="px-6 py-2.5 rounded-2xl bg-[var(--app-primary)] text-white text-xs font-bold shadow hover:opacity-90 transition cursor-pointer"
                >
                  {t("geral.concluir", "Continuar")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryTab;
