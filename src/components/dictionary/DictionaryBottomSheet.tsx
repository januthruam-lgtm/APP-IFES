import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Brain,
  Sparkles,
  Layers,
  ExternalLink,
  Loader2,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { VerbeteDicionario } from "../../types/dictionary";
import { lookupDictionaryTerm, saveToVocabulary, getSavedVocabulary } from "../../services/dictionaryService";
import { speakText } from "../../lib/speech";

interface DictionaryBottomSheetProps {
  word: string | null;
  onClose: () => void;
  onAskLumina?: (word: string, context?: string) => void;
  onCreateFlashcard?: (front: string, back: string) => void;
  onRewardXp?: (xp: number) => void;
}

export const DictionaryBottomSheet: React.FC<DictionaryBottomSheetProps> = ({
  word,
  onClose,
  onAskLumina,
  onCreateFlashcard,
  onRewardXp,
}) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [verbete, setVerbete] = useState<VerbeteDicionario | null>(null);
  const [saved, setSaved] = useState(false);
  const [createdCard, setCreatedCard] = useState(false);

  useEffect(() => {
    if (!word) {
      setVerbete(null);
      return;
    }

    let active = true;
    setLoading(true);
    setCreatedCard(false);

    lookupDictionaryTerm(word, i18n.language || "pt-BR")
      .then((res) => {
        if (active) {
          setVerbete(res);
          const savedList = getSavedVocabulary();
          setSaved(savedList.some((i) => i.termo.toLowerCase() === res.termo.toLowerCase()));
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [word, i18n.language]);

  if (!word) return null;

  const handlePlayAudio = () => {
    if (!verbete) return;
    speakText(verbete.termo, { lang: verbete.idioma || i18n.language || "pt-BR" });
  };

  const handleSaveVocab = () => {
    if (!verbete) return;
    const ok = saveToVocabulary(verbete);
    if (ok) {
      setSaved(true);
      if (onRewardXp) onRewardXp(10);
    }
  };

  const handleCreateAnki = () => {
    if (!verbete || createdCard) return;
    const front = `O que significa "${verbete.termo}"?`;
    const back = `${verbete.luminaInsight.definicaoSimples}\n\nExemplo: ${verbete.luminaInsight.exemplosIneditos[0] || ""}`;
    if (onCreateFlashcard) {
      onCreateFlashcard(front, back);
    }
    setCreatedCard(true);
    if (onRewardXp) onRewardXp(15);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[var(--app-card)] border-t sm:border border-[var(--app-border)] rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden text-[var(--app-text)]"
        role="dialog"
        aria-label={t("dicionario.titulo_modal", "Verbete do Dicionário")}
      >
        {/* Header Handle */}
        <div className="w-12 h-1.5 bg-[var(--app-border)] rounded-full mx-auto mt-3 sm:hidden" />

        <div className="p-4 sm:p-5 border-b border-[var(--app-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[var(--app-text-muted)] font-bold">
                {t("dicionario.rotulo_dicionario", "Dicionário Inteligente")}
              </span>
              <h3 className="text-lg font-black">{word}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--app-card-hover)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
            aria-label={t("geral.fechar", "Fechar")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-[var(--app-text-muted)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--app-primary)]" />
              <p className="text-sm font-semibold">{t("dicionario.carregando_verbete", "Consultando fontes abertas e preparando explicação da Lumina...")}</p>
            </div>
          ) : verbete ? (
            <>
              {/* Term Title & Pronunciation */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-[var(--app-text)] capitalize">
                    {verbete.termo}
                  </h2>
                  {verbete.pronunciaFonetica && (
                    <span className="text-sm font-mono text-[var(--app-text-muted)] bg-[var(--app-border)]/50 px-2 py-0.5 rounded-lg">
                      {verbete.pronunciaFonetica}
                    </span>
                  )}
                  <button
                    onClick={handlePlayAudio}
                    className="p-2 rounded-xl bg-[var(--app-primary)]/10 text-[var(--app-primary)] hover:bg-[var(--app-primary)]/20 transition cursor-pointer"
                    title={t("dicionario.ouvir_pronuncia", "Ouvir pronúncia")}
                    aria-label={t("dicionario.ouvir_pronuncia", "Ouvir pronúncia")}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Grammar class badge */}
                {verbete.significados[0]?.classeGramatical && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--app-accent)]/15 text-[var(--app-accent)] border border-[var(--app-accent)]/20">
                    {verbete.significados[0].classeGramatical}
                  </span>
                )}
              </div>

              {/* Camada Inteligente: Explicação da Lumina */}
              <div className="bg-gradient-to-br from-amber-500/10 via-[var(--app-primary)]/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                      {t("dicionario.explicacao_lumina", "Explicação da Lumina")}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300">
                    {t("dicionario.nivel", "Nível")}: {verbete.luminaInsight.nivelDificuldade}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-[var(--app-text)] font-medium">
                  {verbete.luminaInsight.definicaoSimples}
                </p>

                {/* 2 Frases Inéditas */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-bold text-[var(--app-text-muted)]">
                    {t("dicionario.frases_ineditas", "Exemplos inéditos nos estudos:")}
                  </span>
                  <ul className="text-xs space-y-1 text-[var(--app-text)] italic">
                    {verbete.luminaInsight.exemplosIneditos.map((ex, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[var(--app-primary)] font-bold">"</span>
                        <span>{ex}</span>
                        <span className="text-[var(--app-primary)] font-bold">"</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dica mnemônica e comparação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-xs">
                  <div className="bg-white/50 dark:bg-black/20 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 mb-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      {t("dicionario.dica_memorizacao", "Dica de Memorização")}
                    </div>
                    <p className="text-[var(--app-text-muted)]">{verbete.luminaInsight.dicaMemorizacao}</p>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 mb-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {t("dicionario.palavras_parecidas", "Palavras Parecidas")}
                    </div>
                    <p className="text-[var(--app-text-muted)]">{verbete.luminaInsight.comparacaoPalavras}</p>
                  </div>
                </div>

                {verbete.luminaInsight.isGeradoPorIa && (
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80 italic">
                    ⚠️ {t("dicionario.aviso_ia", "Gíria, neologismo ou termo recente: definição gerada por IA, pode conter imprecisões.")}
                  </p>
                )}
              </div>

              {/* Definições das fontes tradicionais */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                  {t("dicionario.definicoes_oficiais", "Definições e Sentidos")}
                </h4>
                <div className="space-y-2">
                  {verbete.significados.map((sig, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[var(--app-card-hover)]/40 border border-[var(--app-border)] space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[var(--app-primary)] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-[var(--app-accent)]">{sig.classeGramatical}</span>
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
              {(verbete.sinonimosGerais.length > 0 || verbete.antonimosGerais.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {verbete.sinonimosGerais.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[var(--app-card-hover)]/30 border border-[var(--app-border)]">
                      <span className="font-bold text-[var(--app-text)] block mb-1.5">
                        {t("dicionario.sinonimos", "Sinônimos:")}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {verbete.sinonimosGerais.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--app-border)]/50 text-[var(--app-text)]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {verbete.antonimosGerais.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[var(--app-card-hover)]/30 border border-[var(--app-border)]">
                      <span className="font-bold text-[var(--app-text)] block mb-1.5">
                        {t("dicionario.antonimos", "Antônimos:")}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {verbete.antonimosGerais.map((a, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--app-border)]/50 text-[var(--app-text)]">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Etimologia */}
              {verbete.etimologia && (
                <div className="p-3 rounded-2xl bg-[var(--app-card-hover)]/20 border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
                  <span className="font-bold text-[var(--app-text)]">{t("dicionario.etimologia", "Etimologia:")} </span>
                  {verbete.etimologia}
                </div>
              )}

              {/* Atribuição da Fonte */}
              <div className="pt-2 text-[11px] text-[var(--app-text-muted)] flex flex-wrap items-center justify-between gap-2 border-t border-[var(--app-border)]">
                <span>
                  {t("dicionario.fonte", "Fonte:")} <strong className="text-[var(--app-text)]">{verbete.fonteNome}</strong> ({verbete.fonteLicenca})
                </span>
                <span>Brain Studio Open Lexicon</span>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-[var(--app-text-muted)]">
              {t("dicionario.nao_encontrado", "Não foi possível carregar o verbete para este termo.")}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {verbete && (
          <div className="p-4 border-t border-[var(--app-border)] bg-[var(--app-card)] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveVocab}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  saved
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-[var(--app-card-hover)] hover:bg-[var(--app-border)] text-[var(--app-text)]"
                }`}
              >
                {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                {saved ? t("dicionario.salvo", "Salvo no Vocabulário") : t("dicionario.salvar_vocabulario", "Salvar no meu vocabulário")}
              </button>

              <button
                onClick={handleCreateAnki}
                disabled={createdCard}
                className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[var(--app-card-hover)] hover:bg-[var(--app-border)] text-[var(--app-text)] transition cursor-pointer disabled:opacity-60"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-500" />
                {createdCard ? t("dicionario.card_criado", "Flashcard Criado!") : t("dicionario.criar_flashcard", "Criar flashcard (Anki)")}
              </button>
            </div>

            {onAskLumina && (
              <button
                onClick={() => {
                  onAskLumina(verbete.termo);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[var(--app-primary)] text-white hover:opacity-90 shadow-sm transition cursor-pointer"
              >
                <Brain className="w-3.5 h-3.5" />
                {t("dicionario.perguntar_lumina", "Perguntar à Lumina")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DictionaryBottomSheet;
