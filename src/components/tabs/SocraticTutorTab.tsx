import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Award,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { UserProfile, CourseTrack, SocraticMessage } from "../../types";
import { speakText, stopSpeaking } from "../../utils/speech";
import confetti from "canvas-confetti";

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
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || user.selectedCourseId || "general"
  );
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: "msg-init",
      role: "lumina",
      text: `Olá, ${user.name.split(" ")[0]}! Sou Lumina, sua tutora socrática no Brain Studio. Em vez de apenas entregar respostas prontas, vou guiá-lo pelo método da maiêutica — fazendo perguntas pontuais para você descobrir o conceito com sua própria razão. Sobre o que vamos refletir hoje em ${
        selectedCourse?.title || "seus estudos"
      }?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const quickPrompts = [
    "Explique o princípio fundamental desta disciplina",
    "Qual a diferença prática entre os dois métodos principais?",
    "Como isso se aplica a um problema real do mercado capixaba?",
    "Me faça uma pergunta instigante para testar meu raciocínio!",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: SocraticMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.role === "lumina" ? "assistant" : "user",
        content: m.text,
      }));

      const res = await fetch("/api/socratic/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          courseName: selectedCourse?.title || "Geral",
          currentModule: selectedCourse?.title || "Geral",
          learningGoal: "Compreensão conceitual profunda e autonomia analítica",
        }),
      });

      if (!res.ok) {
        throw new Error("Erro na comunicação com a Lumina");
      }

      const data = await res.json();
      const replyText = data.reply || data.text || "Pense bem sobre isso: que fator determinante estamos esquecendo nesta premissa?";

      const aiMsg: SocraticMessage = {
        id: `lumina-${Date.now()}`,
        role: "lumina",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (voiceEnabled) {
        speakText(replyText);
      }

      if (onRewardXp) {
        onRewardXp(15);
      }
    } catch {
      const fallbackMsg: SocraticMessage = {
        id: `lumina-err-${Date.now()}`,
        role: "lumina",
        text: "Uma excelente questão! Vamos quebrar essa ideia em partes menores: quando você observa esse cenário, qual é a primeira variável que parece entrar em conflito com o resultado esperado?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (voiceEnabled) {
        speakText(fallbackMsg.text);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        role: "lumina",
        text: `Conversa reiniciada para ${selectedCourse?.title || "seus estudos"}. Qual hipótese ou dilema você gostaria de investigar juntos agora?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      {/* Top Header Card */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-[var(--app-text)]">
                Lumina • Tutora Socrática
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Maiêutica Profunda
              </span>
            </div>
            <p className="text-xs text-[var(--app-text-muted)]">
              Desenvolva pensamento crítico e autonomia através do questionamento guiado.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {courses.length > 0 && (
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] font-semibold cursor-pointer outline-none focus:ring-1 focus:ring-[var(--app-primary)]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={onToggleVoice}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              voiceEnabled
                ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-xs"
                : "bg-[var(--app-bg)] text-[var(--app-text-muted)] border-[var(--app-border)] hover:text-[var(--app-text)]"
            }`}
            title={voiceEnabled ? "Desativar Leitura em Voz Alta" : "Ativar Leitura em Voz Alta"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
            title="Reiniciar diálogo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-6 overflow-y-auto space-y-4 min-h-[380px] shadow-sm">
        {messages.map((m) => {
          const isLumina = m.role === "lumina";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isLumina ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isLumina
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-[var(--app-primary)] text-white"
                }`}
              >
                {isLumina ? "🦉" : user.name.slice(0, 1).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isLumina
                      ? "bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] shadow-xs"
                      : "bg-[var(--app-primary)] text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <div
                  className={`text-[10px] text-[var(--app-text-muted)] px-1 ${
                    isLumina ? "text-left" : "text-right"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              🦉
            </div>
            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
              <span className="text-xs text-[var(--app-text-muted)] font-medium pl-1">
                Lumina está formulando uma provocação maiêutica...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3 h-3 text-amber-500" /> Sugestões:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-full text-xs bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] border border-[var(--app-border)] text-[var(--app-text)] shrink-0 transition cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-[var(--app-primary)] transition"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Reflita ou faça uma pergunta sobre ${selectedCourse?.title || "sua matéria"}...`}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-transparent text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-40 cursor-pointer"
        >
          <span>Investigar</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
