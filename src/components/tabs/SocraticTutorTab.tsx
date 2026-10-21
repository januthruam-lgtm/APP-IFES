import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Brain,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Lightbulb,
  Copy,
  Check,
  Square,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Mic,
  MicOff,
  ThumbsUp,
  ThumbsDown,
  Upload,
  BookOpen,
  Lock,
  Layers,
  FileText,
  Sliders,
} from "lucide-react";
import { UserProfile, CourseTrack, SocraticMessage } from "../../types";
import { LuminaExplanationLevel } from "../../types/lumina";
import { speakText, stopSpeaking, isSpeaking } from "../../lib/speech";
import { useLuminaQuota } from "../../hooks/useLuminaQuota";
import { useAccessibility } from "../../lib/accessibility";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import PaywallModal from "../PaywallModal";
import LuminaMemoryModal from "../lumina/LuminaMemoryModal";
import FileQuizGeneratorModal from "../quiz/FileQuizGeneratorModal";
import DictionaryBottomSheet from "../dictionary/DictionaryBottomSheet";
import { recordStudyActivity } from "../../utils/streakCalculator";

interface SocraticTutorTabProps {
  user: UserProfile;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onRewardXp?: (xp: number) => void;
  courses: CourseTrack[];
  onNavigateToGames?: (quizData?: any) => void;
}

export const SocraticTutorTab: React.FC<SocraticTutorTabProps> = ({
  user,
  voiceEnabled,
  onToggleVoice,
  onRewardXp,
  courses,
  onNavigateToGames,
}) => {
  const { t, i18n } = useTranslation();
  const { settings } = useAccessibility();
  const { canAsk, remaining, limit, used, consume } = useLuminaQuota();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || user.selectedCourseId || "general"
  );
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Nível da explicação preferido
  const [explanationLevel, setExplanationLevel] = useState<LuminaExplanationLevel>(() => {
    try {
      const saved = localStorage.getItem("brain_lumina_level");
      if (saved === "simple" || saved === "normal" || saved === "technical") return saved;
    } catch {}
    return "normal";
  });

  // Modo Conversa Temporária (sem ler nem gravar memória)
  const [isTemporaryChat, setIsTemporaryChat] = useState(false);

  // Memória Opt-in
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("brain_lumina_memory_enabled");
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showQuizFileModal, setShowQuizFileModal] = useState(false);
  const [dictionaryWord, setDictionaryWord] = useState<string | null>(null);

  // Feedback 👍/👎 state
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 1 | -1>>({});
  const [feedbackPromptId, setFeedbackPromptId] = useState<string | null>(null);
  const [feedbackReason, setFeedbackReason] = useState("");

  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: "msg-init",
      role: "lumina",
      text: t("lumina.boas_vindas", {
        name: user.name.split(" ")[0] || "Estudante",
        course: selectedCourse?.title || t("lumina.boas_vindas_padrao_materia", "suas matérias"),
        defaultValue: `Olá, ${user.name.split(" ")[0]}! Sou Lumina, sua tutora acadêmica no Brain Studio. Estou pronta para explicar conceitos, resolver exercícios passo a passo e tirar dúvidas sobre ${selectedCourse?.title || "suas matérias"}. Sobre o que vamos estudar hoje?`,
      }),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Microfone e Transcrição em Tempo Real (Sincronizado dinamicamente com o idioma selecionado)
  const {
    isListening,
    isSupported: micSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onTranscriptChange: (text) => {
      setInputText(text);
    },
    onFinalTranscript: (final) => {
      setInputText(final);
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleLevelChange = (level: LuminaExplanationLevel) => {
    setExplanationLevel(level);
    try {
      localStorage.setItem("brain_lumina_level", level);
    } catch {}
  };

  const handleToggleMemoryEnabled = (enabled: boolean) => {
    setMemoryEnabled(enabled);
    try {
      localStorage.setItem("brain_lumina_memory_enabled", JSON.stringify(enabled));
    } catch {}
  };

  const quickPrompts = [
    t("lumina.prompt_principio", "Explique o princípio fundamental desta matéria"),
    t("lumina.prompt_exemplo", "Resolva um exemplo prático passo a passo"),
    t("lumina.prompt_provas", "Como esse conceito cai nas provas do IFES?"),
    t("lumina.prompt_resumo", "Me dê um resumo direto para revisar hoje"),
  ];

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (textToSend?: string, isRetry = false, customPromptAddition?: string) => {
    const rawText = (textToSend || inputText).trim();
    if (!rawText || (isLoading && !isRetry)) return;

    if (!canAsk && !isRetry) {
      setShowPaywall(true);
      return;
    }

    const text = customPromptAddition ? `${rawText}\n\n[Instrução: ${customPromptAddition}]` : rawText;

    if (!isRetry) {
      const userMsg: SocraticMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text: rawText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      consume();
    }

    setIsLoading(true);

    try {
      const updatedStreak = recordStudyActivity({
        lastActiveDate: user.lastActiveDate,
        currentStreak: user.streakDays,
        longestStreak: user.streakDays,
      });
      user.streakDays = updatedStreak.currentStreak;
      user.lastActiveDate = updatedStreak.lastActiveDate || "";
    } catch {}

    const aiMsgId = `lumina-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        role: "lumina",
        text: "",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const history = messages.slice(-12).map((m) => ({
        role: m.role === "lumina" ? "model" : "user",
        content: m.text,
      }));

      const res = await fetch("/api/socratic/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          history,
          courseName: selectedCourse?.title || "Geral",
          currentModule: selectedCourse?.category || "Tópico Geral",
          courseSummary: selectedCourse?.description || "",
          userId: user.id || user.uid || user.email || "aluno-ifes",
          language: i18n.language || "pt-BR",
          plainLanguage: explanationLevel === "simple" || settings.plainLanguage,
          explanationLevel,
          isTemporaryChat,
          memoryEnabled,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro na comunicação");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const rawChunk = decoder.decode(value, { stream: true });
            const lines = rawChunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.chunk) {
                    accumulatedText += data.chunk;
                    setMessages((prev) =>
                      prev.map((m) => (m.id === aiMsgId ? { ...m, text: accumulatedText } : m))
                    );
                  }
                  if (data.done) {
                    done = true;
                  }
                } catch {}
              }
            }
          }
        }
      }

      if (!accumulatedText.trim()) {
        throw new Error("Resposta vazia");
      }

      if (voiceEnabled || settings.screenReaderAuto) {
        speakText(accumulatedText, {
          rate: settings.speechRate,
          lang: i18n.language || "pt-BR",
        });
      }

      if (onRewardXp) {
        onRewardXp(20);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }

      if (!isRetry) {
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
        return handleSendMessage(text, true);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? {
                ...m,
                text: t(
                  "lumina.erro_resposta",
                  "Tivemos uma oscilação na conexão com a Lumina. Por favor, tente enviar novamente."
                ),
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakMessage = (msg: SocraticMessage) => {
    if (readingId === msg.id) {
      stopSpeaking();
      setReadingId(null);
    } else {
      speakText(msg.text, {
        rate: settings.speechRate,
        lang: i18n.language || "pt-BR",
        onEnd: () => setReadingId(null),
      });
      setReadingId(msg.id);
    }
  };

  const handleSendFeedback = async (msgId: string, rating: 1 | -1, reason?: string) => {
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: rating }));
    setFeedbackPromptId(null);
    setFeedbackReason("");

    try {
      await fetch("/api/feedback/lumina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: msgId,
          rating,
          reason,
          explanationLevel,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}
  };

  const handleResetChat = () => {
    stopSpeaking();
    setReadingId(null);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: "lumina",
        text: t("lumina.boas_vindas", {
          name: user.name.split(" ")[0] || "Estudante",
          course: selectedCourse?.title || t("lumina.boas_vindas_padrao_materia", "suas matérias"),
          defaultValue: `Chat reiniciado! Estou pronta para te apoiar em ${selectedCourse?.title || "seus estudos"}. O que vamos explorar?`,
        }),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-80px)] space-y-4">
      {/* Top Banner Card: Tutora Lumina, Controles de Nível & Memória */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md text-xl">
            🦉
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--app-text)]">
                {t("lumina.titulo", "Lumina • Tutora Socrática & Acadêmica")}
              </h1>
              {isTemporaryChat && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {t("lumina.chat_temporario_badge", "Conversa Temporária")}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              {t("lumina.subtitulo", "Explicações acolhedoras passo a passo, rigor conceitual e paciência ilimitada")}
            </p>
          </div>
        </div>

        {/* Level Selector, Memory & Tools Bar */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          {/* Seletor do Nível de Explicação */}
          <div className="flex items-center bg-[var(--app-card-hover)] p-1 rounded-2xl border border-[var(--app-border)] text-xs font-semibold">
            <button
              onClick={() => handleLevelChange("simple")}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                explanationLevel === "simple"
                  ? "bg-[var(--app-primary)] text-white shadow-xs font-bold"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
              title={t("lumina.nivel_simples_desc", "Explicações com analogias simples e frases curtas")}
            >
              {t("lumina.nivel_simples", "Bem simples")}
            </button>
            <button
              onClick={() => handleLevelChange("normal")}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                explanationLevel === "normal"
                  ? "bg-[var(--app-primary)] text-white shadow-xs font-bold"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              {t("lumina.nivel_normal", "Normal")}
            </button>
            <button
              onClick={() => handleLevelChange("technical")}
              className={`px-2.5 py-1 rounded-xl transition cursor-pointer ${
                explanationLevel === "technical"
                  ? "bg-[var(--app-primary)] text-white shadow-xs font-bold"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
              title={t("lumina.nivel_tecnico_desc", "Termos acadêmicos e rigor matemático integral")}
            >
              {t("lumina.nivel_tecnico", "Técnico")}
            </button>
          </div>

          {/* Toggle Conversa Temporária */}
          <button
            onClick={() => setIsTemporaryChat(!isTemporaryChat)}
            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              isTemporaryChat
                ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300"
                : "bg-[var(--app-card-hover)] border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
            title={t("lumina.temporario_tooltip", "Ativar conversa temporária (não lê nem grava na memória)")}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("lumina.modo_temporario", "Temporário")}</span>
          </button>

          {/* Botão O que a Lumina sabe sobre mim */}
          <button
            onClick={() => setShowMemoryModal(true)}
            className="p-2 rounded-xl bg-[var(--app-card-hover)] hover:bg-[var(--app-border)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] transition flex items-center gap-1.5 cursor-pointer"
            title={t("lumina.gerenciar_memoria", "O que a Lumina sabe sobre mim (Memória & LGPD)")}
          >
            <Brain className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            <span className="hidden sm:inline">{t("lumina.memoria_btn", "Memória")}</span>
          </button>

          {/* Botão Gerar Quiz de Arquivo */}
          <button
            onClick={() => setShowQuizFileModal(true)}
            className="p-2 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold shadow-sm hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
            title={t("quiz_arquivo.botao_top", "Gerar quiz a partir de arquivo (PDF, DOCX, TXT, Imagem)")}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("quiz_arquivo.gerar_btn_curto", "Quiz de Arquivo")}</span>
          </button>

          {/* TTS & Reset */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
              voiceEnabled
                ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-xs"
                : "bg-[var(--app-card-hover)] text-[var(--app-text-muted)] border-[var(--app-border)] hover:text-[var(--app-text)]"
            }`}
            title={voiceEnabled ? "Desativar leitura em áudio" : "Ativar leitura em áudio"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition flex items-center justify-center cursor-pointer"
            title={t("lumina.reiniciar_chat", "Reiniciar conversa")}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xs"
        role="log"
        aria-live="polite"
        aria-label="Histórico de mensagens com a tutora Lumina"
      >
        {messages.map((m) => {
          const isLumina = m.role === "lumina";
          const rating = feedbackGiven[m.id];

          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                isLumina ? "mr-auto" : "ml-auto flex-row-reverse"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${
                  isLumina
                    ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xs"
                    : "bg-[var(--app-primary)] text-white shadow-xs"
                }`}
                aria-hidden="true"
              >
                {isLumina ? "🦉" : user.name.slice(0, 1).toUpperCase()}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div
                  className={`p-4 rounded-3xl text-sm leading-relaxed ${
                    isLumina
                      ? "bg-[var(--app-card-hover)]/50 border border-[var(--app-border)] text-[var(--app-text)] shadow-xs"
                      : "bg-[var(--app-primary)] text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text || (isLoading ? "..." : "")}</p>
                </div>

                {/* Message Actions */}
                <div
                  className={`flex flex-wrap items-center gap-2 text-[10px] text-[var(--app-text-muted)] px-2 ${
                    isLumina ? "justify-start" : "justify-end"
                  }`}
                >
                  <span>{m.timestamp}</span>

                  {isLumina && m.text && (
                    <>
                      <span>•</span>
                      {/* Botão Explique mais simples */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSendMessage(
                            undefined,
                            false,
                            "Explique de forma ainda mais simples, usando uma metáfora visual e zero jargões difíceis."
                          )
                        }
                        className="hover:text-[var(--app-primary)] font-bold flex items-center gap-1 cursor-pointer text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{t("lumina.explique_mais_simples", "Explique mais simples")}</span>
                      </button>

                      <span>•</span>
                      {/* Ouvir Mensagem */}
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(m)}
                        className="hover:text-[var(--app-primary)] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{readingId === m.id ? t("biblioteca.pausar", "Pausar") : t("biblioteca.ouvir", "Ouvir")}</span>
                      </button>

                      <span>•</span>
                      {/* Copiar */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(m.text, m.id)}
                        className="hover:text-[var(--app-primary)] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === m.id ? t("lumina.resposta_copiada", "Copiado") : t("lumina.copiar_resposta", "Copiar")}</span>
                      </button>

                      <span>•</span>
                      {/* Feedback 👍 / 👎 */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSendFeedback(m.id, 1)}
                          className={`p-1 rounded-md transition cursor-pointer ${
                            rating === 1 ? "text-emerald-500 bg-emerald-500/15" : "hover:text-emerald-500"
                          }`}
                          title="Resposta útil e clara"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFeedbackPromptId(m.id);
                          }}
                          className={`p-1 rounded-md transition cursor-pointer ${
                            rating === -1 ? "text-red-500 bg-red-500/15" : "hover:text-red-500"
                          }`}
                          title="Resposta insatisfatória ou confusa"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Sub-painel opcional para motivo de feedback negativo */}
                {feedbackPromptId === m.id && (
                  <div className="p-3 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] space-y-2 text-xs">
                    <p className="font-bold text-[var(--app-text)]">{t("lumina.feedback_pergunta", "O que faltou nesta resposta para te ajudar melhor?")}</p>
                    <input
                      type="text"
                      value={feedbackReason}
                      onChange={(e) => setFeedbackReason(e.target.value)}
                      placeholder={t("lumina.feedback_placeholder", "Ex: Ficou muito teórica, faltou exemplo prático...")}
                      className="w-full px-3 py-1.5 rounded-xl bg-[var(--app-card-hover)] border border-[var(--app-border)] outline-none text-[var(--app-text)]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setFeedbackPromptId(null)}
                        className="px-2.5 py-1 text-[var(--app-text-muted)] cursor-pointer"
                      >
                        {t("geral.cancelar", "Cancelar")}
                      </button>
                      <button
                        onClick={() => handleSendFeedback(m.id, -1, feedbackReason)}
                        className="px-3 py-1 rounded-lg bg-[var(--app-primary)] text-white font-bold cursor-pointer"
                      >
                        {t("geral.enviar", "Enviar")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--app-card-hover)] border border-[var(--app-border)] max-w-md mr-auto animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-semibold text-[var(--app-text-muted)]">
                {t("lumina.digitando", "Lumina está formulando uma resposta didática e acolhedora...")}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStopStream}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1 cursor-pointer transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t("lumina.parar_resposta", "Parar")}</span>
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="toolbar">
        <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{t("lumina.sugestoes_rotulo", "Sugestões:")}</span>
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-2xl text-xs bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold shrink-0 transition cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Form with Real-time Speech-to-Text Transcription */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-2 shadow-xs focus-within:ring-2 focus-within:ring-[var(--app-primary)] transition"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t("lumina.placeholder_input", "Tire dúvidas, envie exercícios ou peça explicações...")}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none min-h-[44px]"
        />

        {/* Microfone de Transcrição no idioma selecionado */}
        {micSupported && (
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`p-3 rounded-2xl transition cursor-pointer shrink-0 ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
            title={isListening ? "Ouvindo... Clique para parar" : "Falar no microfone (transcrição ao vivo)"}
            aria-label="Falar no microfone"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        {isLoading ? (
          <button
            type="button"
            onClick={handleStopStream}
            className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer min-h-[48px]"
          >
            <Square className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">{t("lumina.parar_resposta", "Parar")}</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-3 rounded-2xl bg-[var(--app-primary)] hover:opacity-90 text-white font-black text-xs flex items-center gap-2 shadow-xs transition disabled:opacity-40 cursor-pointer min-h-[48px]"
          >
            <span>{t("lumina.enviar", "Enviar")}</span>
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Modal Paywall */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlocked={() => setShowPaywall(false)}
      />

      {/* Modal O que a Lumina sabe sobre mim */}
      <LuminaMemoryModal
        user={user}
        isOpen={showMemoryModal}
        onClose={() => setShowMemoryModal(false)}
        memoryEnabled={memoryEnabled}
        onToggleMemoryEnabled={handleToggleMemoryEnabled}
      />

      {/* Modal Gerar Quiz a partir de Arquivo */}
      <FileQuizGeneratorModal
        user={user}
        isOpen={showQuizFileModal}
        onClose={() => setShowQuizFileModal(false)}
        onQuizGenerated={(quizData) => {
          if (onNavigateToGames) onNavigateToGames(quizData);
        }}
        onOpenPaywall={() => setShowPaywall(true)}
      />

      {/* Bottom Sheet Dicionário */}
      {dictionaryWord && (
        <DictionaryBottomSheet
          word={dictionaryWord}
          onClose={() => setDictionaryWord(null)}
          onAskLumina={(w) => handleSendMessage(`Explique o conceito de "${w}" na nossa disciplina de ${selectedCourse?.title || "estudos"}.`)}
        />
      )}
    </div>
  );
};

export default SocraticTutorTab;
