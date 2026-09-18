import React, { useState } from "react";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Bot,
  User,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { CourseTrack, UserProfile } from "../../types";
import { speakText, stopSpeaking } from "../../utils/speech";

interface SocraticTutorTabProps {
  user: UserProfile;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onRewardXp: (xp: number) => void;
  courses: CourseTrack[];
}

interface Message {
  id: string;
  sender: "user" | "lumina";
  text: string;
  timestamp: string;
}

export const SocraticTutorTab: React.FC<SocraticTutorTabProps> = ({
  user,
  voiceEnabled,
  onToggleVoice,
  onRewardXp,
  courses,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro-1",
      sender: "lumina",
      text: "Olá! Eu sou Lumina, sua tutora inteligente de estudos. Estou aqui para ajudá-lo a tirar dúvidas, aprofundar conceitos e estruturar seu aprendizado com as matérias do IFES. O que vamos estudar hoje?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.title || "Geral");
  const [isLoading, setIsLoading] = useState(false);

  const promptSuggestions = [
    "Por que a busca binária requer que o vetor esteja ordenado?",
    "O que significa dizer que a derivada de uma função mede sua taxa de variação instantânea?",
    "Qual é a relação entre a camada de transporte e a garantia de integridade de pacotes?",
    "Como a recursão consome a pilha de chamadas (call stack)?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/lumina/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          courseContext: selectedCourse,
          userLevel: user.level,
        }),
      });

      let replyText = "";
      if (res.ok) {
        const data = await res.json();
        replyText = data.reply || data.response || "Excelente reflexão. Como você relacionaria isso ao conceito fundamental da matéria?";
      } else {
        replyText = `Uma pergunta instigante sobre ${selectedCourse}! Considere: se analisarmos os primeiros princípios desse conceito, o que aconteceria se a condição inicial fosse invertida?`;
      }

      const luminaMsg: Message = {
        id: `lumina-${Date.now()}`,
        sender: "lumina",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, luminaMsg]);
      onRewardXp(15);

      if (voiceEnabled) {
        speakText(replyText);
      }
    } catch (e) {
      const fallbackText = "Interessante ponto de vista! Que evidência prática ou experimento mental você usaria para validar essa hipótese?";
      const luminaMsg: Message = {
        id: `lumina-${Date.now()}`,
        sender: "lumina",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, luminaMsg]);
      if (voiceEnabled) {
        speakText(fallbackText);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 flex flex-col h-[calc(100vh-6rem)] animate-in fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--text-primary,#f8fafc)] flex items-center gap-2">
              Lumina • Tutora Inteligente
            </h1>
            <p className="text-xs text-[var(--text-muted,#94a3b8)]">
              Tutoria e acompanhamento pedagógico para compreensão profunda de conceitos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-xs text-[var(--text-primary,#f8fafc)] rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="Geral">Contexto: Todas as Matérias</option>
            {courses.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (voiceEnabled) stopSpeaking();
              onToggleVoice();
            }}
            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
              voiceEnabled
                ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                : "bg-[var(--bg-card-secondary,#334155)] text-[var(--text-muted,#94a3b8)] border-[var(--border-color,rgba(255,255,255,0.1))]"
            }`}
            title={voiceEnabled ? "Desativar Leitura por Voz" : "Ativar Leitura por Voz"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-[var(--bg-card,#1e293b)]/70 border border-[var(--border-color,rgba(255,255,255,0.1))]">
        {messages.map((msg) => {
          const isLumina = msg.sender === "lumina";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isLumina ? "justify-start" : "justify-end"}`}
            >
              {isLumina && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isLumina
                    ? "bg-[var(--bg-card-secondary,#334155)] text-[var(--text-primary,#f8fafc)] border border-white/5 shadow-md"
                    : "bg-indigo-600 text-white shadow-md rounded-tr-none"
                }`}
              >
                <p>{msg.text}</p>
                <span className="block text-[10px] opacity-60 text-right mt-1.5">
                  {msg.timestamp}
                </span>
              </div>
              {!isLumina && (
                <div className="w-8 h-8 rounded-xl bg-neutral-700 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-secondary,#334155)] text-xs text-[var(--text-muted,#94a3b8)]">
              Lumina analisando e formulando a explicação...
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[var(--text-muted,#94a3b8)] flex items-center gap-1 font-bold shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Sugestões:
        </span>
        {promptSuggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s)}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-card,#1e293b)] hover:bg-[var(--bg-card-secondary,#334155)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-[var(--text-muted,#94a3b8)] hover:text-white shrink-0 text-xs transition truncate max-w-xs"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Faça uma pergunta sobre a matéria ou elabore seu raciocínio..."
          className="flex-1 bg-[var(--bg-card,#1e293b)] border border-[var(--border-color,rgba(255,255,255,0.1))] text-xs sm:text-sm text-[var(--text-primary,#f8fafc)] placeholder-neutral-500 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 shadow-md"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Perguntar</span>
        </button>
      </form>
    </div>
  );
};
