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
} from "lucide-react";
import { UserProfile, CourseTrack, SocraticMessage } from "../../types";
import { speakText, stopSpeaking, isSpeaking } from "../../lib/speech";
import { useLuminaQuota } from "../../hooks/useLuminaQuota";
import { useAccessibility } from "../../lib/accessibility";
import PaywallModal from "../PaywallModal";
import { recordStudyActivity } from "../../utils/streakCalculator";

interface SocraticTutorTabProps {
  user: UserProfile;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onRewardXp?: (xp: number) => void;
  courses: CourseTrack[];
}

export const SocraticTutorTab: React.FC<SocraticTutorTabProps> = ({
  user,
  voiceEnabled,
  onToggleVoice,
  onRewardXp,
  courses,
}) => {
  const { t, i18n } = useTranslation();
  const { settings } = useAccessibility();
  const { canAsk, remaining, limit, used, consume } = useLuminaQuota();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || user.selectedCourseId || "general"
  );
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: "msg-init",
      role: "lumina",
      text: `Olá, ${user.name.split(" ")[0]}! Sou Lumina, sua tutora acadêmica no Brain Studio. Estou pronta para explicar conceitos, resolver exercícios passo a passo e tirar dúvidas sobre ${
        selectedCourse?.title || "suas matérias"
      }. Sobre o que vamos estudar hoje?`,
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const quickPrompts = [
    "Explique o princípio fundamental desta matéria",
    "Resolva um exemplo prático passo a passo",
    "Como esse conceito cai nas provas do IFES?",
    "Me dê um resumo direto para revisar hoje",
  ];

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (textToSend?: string, isRetry = false) => {
    const text = (textToSend || inputText).trim();
    if (!text || (isLoading && !isRetry)) return;

    if (!canAsk && !isRetry) {
      setShowPaywall(true);
      return;
    }

    if (!isRetry) {
      const userMsg: SocraticMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      consume();
    }

    setIsLoading(true);

    // Registra atividade real de estudo para o cálculo estrito da ofensiva
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
    // Adiciona placeholder da Lumina
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
          plainLanguage: settings.plainLanguage,
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

      // Leitura em voz alta se ativado
      if (voiceEnabled || settings.screenReaderAuto) {
        speakText(accumulatedText, { rate: settings.speechRate });
      }

      if (onRewardXp) {
        onRewardXp(20);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        return; // Interrompido intencionalmente pelo aluno
      }

      // Retry automático uma vez se ainda não tentou
      if (!isRetry) {
        console.warn("Tentando reconexão com Lumina...");
        setMessages((prev) => prev.filter((m) => m.id !== aiMsgId));
        return handleSendMessage(text, true);
      }

      const friendlyMsg = t("lumina.erro_amigavel");
      setMessages((prev) =>
        prev.map((m) => (m.id === aiMsgId ? { ...m, text: friendlyMsg } : m))
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    handleStopStream();
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: "lumina",
        text: `Conversa reiniciada para ${selectedCourse?.title || "seus estudos"}. Qual pergunta ou exercício gostaria de resolver agora?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleSpeakMessage = (msg: SocraticMessage) => {
    if (readingId === msg.id && isSpeaking()) {
      stopSpeaking();
      setReadingId(null);
    } else {
      speakText(msg.text, { rate: settings.speechRate });
      setReadingId(msg.id);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Top Header Card */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Brain className="w-6 h-6 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-[var(--app-text)]">
                {t("lumina.titulo")}
              </h1>
              {settings.plainLanguage && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Linguagem Simples
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--app-text-muted)] line-clamp-1">
              {t("lumina.descricao")}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {courses.length > 0 && (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              aria-label="Selecionar disciplina para tutoria"
              className="px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold cursor-pointer outline-none focus:ring-2 focus:ring-[var(--app-primary)] min-h-[44px]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={onToggleVoice}
            aria-label={voiceEnabled ? "Desativar leitura de respostas" : "Ativar leitura de respostas"}
            className={`w-11 h-11 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
              voiceEnabled
                ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-xs"
                : "bg-[var(--app-bg)] text-[var(--app-text-muted)] border-[var(--app-border)] hover:text-[var(--app-text)]"
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            aria-label={t("lumina.reiniciar_chat")}
            className="w-11 h-11 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition flex items-center justify-center cursor-pointer"
            title={t("lumina.reiniciar_chat")}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Log com Região Aria Live */}
      <div
        className="flex-1 bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[380px] shadow-xs"
        role="log"
        aria-live="polite"
        aria-label="Histórico de mensagens com a tutora Lumina"
      >
        {messages.map((m) => {
          const isLumina = m.role === "lumina";
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
                      ? "bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] shadow-xs"
                      : "bg-[var(--app-primary)] text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text || (isLoading ? "..." : "")}</p>
                </div>

                {/* Ações da Mensagem */}
                <div
                  className={`flex items-center gap-2 text-[10px] text-[var(--app-text-muted)] px-2 ${
                    isLumina ? "justify-start" : "justify-end"
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {isLumina && m.text && (
                    <>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(m)}
                        className="hover:text-[var(--app-primary)] font-bold flex items-center gap-1 cursor-pointer"
                        aria-label="Ouvir resposta em áudio"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{readingId === m.id ? "Pausar" : "Ouvir"}</span>
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(m.text, m.id)}
                        className="hover:text-[var(--app-primary)] font-bold flex items-center gap-1 cursor-pointer"
                        aria-label="Copiar texto da resposta"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === m.id ? t("lumina.resposta_copiada") : t("lumina.copiar_resposta")}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicador de Digitação com Botão Parar */}
        {isLoading && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] max-w-md mr-auto animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-semibold text-[var(--app-text-muted)]">
                {t("lumina.digitando")}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStopStream}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1 cursor-pointer transition min-h-[36px]"
              aria-label={t("lumina.parar_resposta")}
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t("lumina.parar_resposta")}</span>
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Sugestões Rápidas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="toolbar" aria-label="Sugestões de perguntas rápidas">
        <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
          <span>Sugestões:</span>
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-2xl text-xs bg-[var(--app-card)] hover:bg-[var(--app-card-secondary)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold shrink-0 transition cursor-pointer disabled:opacity-50 min-h-[36px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Barra de Entrada de Chat */}
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
          placeholder={t("lumina.placeholder_input")}
          disabled={isLoading}
          aria-label={t("lumina.placeholder_input")}
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none min-h-[44px]"
        />

        {isLoading ? (
          <button
            type="button"
            onClick={handleStopStream}
            className="px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer min-h-[48px]"
            aria-label={t("lumina.parar_resposta")}
          >
            <Square className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">{t("lumina.parar_resposta")}</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-3 rounded-2xl bg-[var(--app-primary)] hover:opacity-90 text-white font-black text-xs flex items-center gap-2 shadow-xs transition disabled:opacity-40 cursor-pointer min-h-[48px]"
            aria-label={t("lumina.enviar")}
          >
            <span>{t("lumina.enviar")}</span>
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Paywall Modal para plano Pro */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUnlocked={() => {
          setShowPaywall(false);
        }}
      />
    </div>
  );
};
