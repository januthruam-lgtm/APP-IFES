import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Target,
  Users,
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  Coffee,
  Brain,
  Smile,
  ShieldCheck,
  CheckCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { UserProfile, CourseTrack } from "../../types";
import {
  firestoreChatService,
  TeamMessageItem,
} from "../../services/firestoreChatService";

interface StudyRoomVirtualTabProps {
  user: UserProfile;
  courses?: CourseTrack[];
  onRewardXp?: (amount: number) => void;
  onRewardCoins?: (amount: number) => void;
  onNavigate?: (tab: string) => void;
  onOpenPrivateChatWithMember?: (member: { id: string; name: string; avatar?: string }) => void;
}

interface FocusingPeer {
  id: string;
  name: string;
  campus?: string;
  goal?: string;
  isFocusing: boolean;
  timeStudiedMinutes: number;
}

const PRESET_ROOMS = [
  { id: "sala-geral-ifes", name: "Sala Geral de Estudos IFES", desc: "Ambiente aberto para todas as matérias e cursos" },
  { id: "sala-exatas", name: "Sala Exatas & Cálculo", desc: "Foco intensivo em matemática, física e estatística" },
  { id: "sala-ti", name: "Lab Informática & Programação", desc: "Sessões de código, algoritmos e engenharia" },
  { id: "sala-gestao", name: "Sala Administração & Gestão", desc: "Leituras, estudos de caso e redações técnicas" },
];

export const StudyRoomVirtualTab: React.FC<StudyRoomVirtualTabProps> = ({
  user,
  courses = [],
  onRewardXp,
  onRewardCoins,
  onNavigate,
  onOpenPrivateChatWithMember,
}) => {
  const { t } = useTranslation();

  // Seleção de sala
  const [selectedRoomId, setSelectedRoomId] = useState("sala-geral-ifes");

  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);

  // Meta da sessão
  const [sessionGoal, setSessionGoal] = useState<string>(() => {
    try {
      return localStorage.getItem("brain_studio_session_goal") || "";
    } catch {
      return "";
    }
  });
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [goalDraft, setGoalDraft] = useState<string>("");

  // Chat e participantes
  const [activeSideTab, setActiveSideTab] = useState<"chat" | "focusers">("chat");
  const [firestoreMessages, setFirestoreMessages] = useState<TeamMessageItem[]>([]);
  const [roomTypers, setRoomTypers] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const roomTypingTimeoutRef = useRef<any>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Colegas simulados/reais em foco
  const [focusingPeers, setFocusingPeers] = useState<FocusingPeer[]>([
    {
      id: "peer-1",
      name: "Camila Rocha (IFES Serra)",
      campus: "Campus Serra",
      goal: "Revisar exercícios de Álgebra Linear",
      isFocusing: true,
      timeStudiedMinutes: 45,
    },
    {
      id: "peer-2",
      name: "Lucas Vasconcelos (IFES Vitória)",
      campus: "Campus Vitória",
      goal: "Finalizar relatório de Sistemas Operacionais",
      isFocusing: true,
      timeStudiedMinutes: 70,
    },
    {
      id: "peer-3",
      name: "Mariana Dias (IFES Cefor)",
      campus: "Campus Cefor",
      goal: "Leitura do Módulo 3 de Gestão de Pessoas",
      isFocusing: false,
      timeStudiedMinutes: 25,
    },
  ]);

  // Cronômetro local com tick a cada 1 segundo
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Conclusão de ciclo
      setIsRunning(false);
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}

      if (timerMode === "focus") {
        setCompletedSessionsCount((c) => c + 1);
        if (onRewardXp) onRewardXp(40);
        if (onRewardCoins) onRewardCoins(10);
        // Sugere pausa curta
        setTimerMode("shortBreak");
        setTimeLeft(5 * 60);
      } else {
        // Retorna ao foco
        setTimerMode("focus");
        setTimeLeft(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, timerMode, onRewardXp, onRewardCoins]);

  // Escuta mensagens do Firestore para a sala selecionada
  useEffect(() => {
    const unsubMsgs = firestoreChatService.subscribeTeamMessages(selectedRoomId, (msgs) => {
      setFirestoreMessages(msgs);
    });

    const unsubTyping = firestoreChatService.subscribeTeamTypingStatus(
      selectedRoomId,
      user.name || "Você",
      (typers) => {
        setRoomTypers(typers);
      }
    );

    return () => {
      unsubMsgs();
      unsubTyping();
      if (roomTypingTimeoutRef.current) clearTimeout(roomTypingTimeoutRef.current);
    };
  }, [selectedRoomId, user.name]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [firestoreMessages, roomTypers]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    if (timerMode === "focus") setTimeLeft(25 * 60);
    else if (timerMode === "shortBreak") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleSwitchMode = (newMode: "focus" | "shortBreak" | "longBreak") => {
    setIsRunning(false);
    setTimerMode(newMode);
    if (newMode === "focus") setTimeLeft(25 * 60);
    else if (newMode === "shortBreak") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalDraft.trim()) {
      setSessionGoal(goalDraft.trim());
      try {
        localStorage.setItem("brain_studio_session_goal", goalDraft.trim());
      } catch {}
      setIsEditingGoal(false);
    }
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setChatInput(text);

    firestoreChatService.setTeamTypingStatus(
      selectedRoomId,
      user.name || "Você",
      true
    );

    if (roomTypingTimeoutRef.current) clearTimeout(roomTypingTimeoutRef.current);
    roomTypingTimeoutRef.current = setTimeout(() => {
      firestoreChatService.setTeamTypingStatus(
        selectedRoomId,
        user.name || "Você",
        false
      );
    }, 2200);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput("");

    await firestoreChatService.sendTeamMessage({
      teamId: selectedRoomId,
      autorId: user.email || user.name || "user-id",
      autorName: user.name || "Estudante IFES",
      autorAvatar: user.avatar,
      conteudo: text,
      tipo: "texto",
    });

    firestoreChatService.setTeamTypingStatus(
      selectedRoomId,
      user.name || "Você",
      false
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const activeRoom = PRESET_ROOMS.find((r) => r.id === selectedRoomId) || PRESET_ROOMS[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in-50">
      {/* Header com seleção de salas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--app-card)] p-5 rounded-3xl border border-[var(--app-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[var(--app-text)] flex items-center gap-2">
              <Timer className="w-6 h-6 text-[var(--app-primary)]" />
              <span>{t("sala_estudo.titulo", "Sala de Foco em Grupo")}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-black border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sincronizado</span>
            </span>
          </div>
          <p className="text-xs text-[var(--app-text-muted)] mt-1">
            {t("sala_estudo.subtitulo", "Foco compartilhado com método Pomodoro, metas da sessão e chat em tempo real.")}
          </p>
        </div>

        {/* Seletor de Sala */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {PRESET_ROOMS.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                selectedRoomId === room.id
                  ? "bg-[var(--app-primary)] text-white shadow-xs"
                  : "bg-[var(--app-bg)] text-[var(--app-text)] border border-[var(--app-border)] hover:bg-[var(--app-card-secondary)]"
              }`}
            >
              {room.name.replace("Sala ", "").replace("Lab ", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Principal: Bloco de Foco (Esquerda) + Bloco Social (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LADO ESQUERDO: CRONÔMETRO POMODORO & METAS (7 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card do Cronômetro Pomodoro */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm text-center space-y-6">
            {/* Seletor de modo Pomodoro */}
            <div className="inline-flex p-1 bg-[var(--app-bg)] rounded-2xl border border-[var(--app-border)]">
              <button
                onClick={() => handleSwitchMode("focus")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  timerMode === "focus"
                    ? "bg-[var(--app-primary)] text-white shadow-xs"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Foco (25m)</span>
              </button>

              <button
                onClick={() => handleSwitchMode("shortBreak")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  timerMode === "shortBreak"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Pausa Curta (5m)</span>
              </button>

              <button
                onClick={() => handleSwitchMode("longBreak")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  timerMode === "longBreak"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Pausa Longa (15m)</span>
              </button>
            </div>

            {/* Display do Relógio */}
            <div className="py-4">
              <span className="text-6xl sm:text-7xl font-black tracking-tight text-[var(--app-text)] tabular-nums block font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className="text-xs font-bold text-[var(--app-text-muted)] mt-2 block uppercase tracking-wider">
                {timerMode === "focus"
                  ? isRunning ? "Em sessão de foco intensivo" : "Pronto para focar"
                  : "Momento de descanso"}
              </span>
            </div>

            {/* Ações do Cronômetro */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleStartPause}
                className={`px-7 py-3 rounded-2xl text-white font-black text-sm transition flex items-center gap-2 shadow-sm cursor-pointer active:scale-95 ${
                  isRunning
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)]"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{t("sala_estudo.pausar_foco", "Pausar")}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{t("sala_estudo.iniciar_foco", "Iniciar Foco")}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetTimer}
                className="p-3 rounded-2xl bg-[var(--app-bg)] hover:bg-[var(--app-card-secondary)] text-[var(--app-text)] border border-[var(--app-border)] transition cursor-pointer active:scale-95"
                title={t("sala_estudo.reiniciar_foco", "Reiniciar cronômetro")}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Contador de Ciclos Concluídos */}
            <div className="pt-4 border-t border-[var(--app-border)] flex items-center justify-center gap-2 text-xs font-semibold text-[var(--app-text-muted)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                Ciclos de foco concluídos hoje:{" "}
                <strong className="text-[var(--app-text)] font-black">{completedSessionsCount}</strong> (+{completedSessionsCount * 40} XP)
              </span>
            </div>
          </div>

          {/* Card de Meta da Sessão Atual */}
          <div className="p-6 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--app-text)] flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--app-primary)]" />
                <span>Meta da Sessão de Estudo</span>
              </h3>
              {!isEditingGoal && sessionGoal && (
                <button
                  onClick={() => {
                    setGoalDraft(sessionGoal);
                    setIsEditingGoal(true);
                  }}
                  className="text-xs text-[var(--app-primary)] font-bold hover:underline cursor-pointer"
                >
                  Alterar Meta
                </button>
              )}
            </div>

            {isEditingGoal || !sessionGoal ? (
              <form onSubmit={handleSaveGoal} className="space-y-2">
                <input
                  type="text"
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  placeholder="Ex: Resolver 10 exercícios da lista de Cálculo ou ler módulo de Redes"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
                  autoFocus
                />
                <div className="flex items-center gap-2 justify-end">
                  {sessionGoal && (
                    <button
                      type="button"
                      onClick={() => setIsEditingGoal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-[var(--app-text-muted)] hover:bg-[var(--app-bg)] cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold cursor-pointer hover:bg-[var(--app-primary-hover)] transition"
                  >
                    Definir Meta
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {sessionGoal}
                  </p>
                </div>
                <span className="text-[10px] uppercase font-black text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                  Em Andamento
                </span>
              </div>
            )}
          </div>
        </div>

        {/* LADO DIREITO: CHAT DA SALA & COLEGAS EM FOCO (5 colunas) */}
        <div className="lg:col-span-5 bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl shadow-sm flex flex-col h-[560px] overflow-hidden">
          {/* Top Bar com Navegação entre Chat e Colegas */}
          <div className="p-3 bg-[var(--app-bg)] border-b border-[var(--app-border)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSideTab("chat")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSideTab === "chat"
                    ? "bg-[var(--app-card)] text-[var(--app-text)] shadow-xs border border-[var(--app-border)]"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => setActiveSideTab("focusers")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeSideTab === "focusers"
                    ? "bg-[var(--app-card)] text-[var(--app-text)] shadow-xs border border-[var(--app-border)]"
                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Colegas ({focusingPeers.length + 1})</span>
              </button>
            </div>

            <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 rounded-full bg-emerald-500/15">
              {activeRoom.name.replace("Sala ", "")}
            </span>
          </div>

          {/* CONTEÚDO: CHAT EM TEMPO REAL */}
          {activeSideTab === "chat" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {firestoreMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 space-y-2">
                    <MessageSquare className="w-8 h-8 opacity-40 text-[var(--app-primary)]" />
                    <p className="text-xs font-bold text-[var(--app-text)]">
                      Nenhuma mensagem enviada nesta sala ainda.
                    </p>
                    <p className="text-[11px] text-[var(--app-text-muted)] max-w-xs">
                      Envie uma mensagem abaixo para cumprimentar os colegas e compartilhar seu foco de estudos!
                    </p>
                  </div>
                ) : (
                  firestoreMessages.map((m) => {
                    const isMe = m.autorName === user.name || m.autorId === (user.email || user.name);
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-100`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs break-words leading-relaxed ${
                            isMe
                              ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                              : "bg-[var(--app-bg)] text-[var(--app-text)] rounded-tl-none border border-[var(--app-border)]"
                          }`}
                        >
                          {!isMe && (
                            <span className="text-[10px] font-bold text-[#00a884] block mb-0.5">
                              {m.autorName}
                            </span>
                          )}
                          <p className="text-xs">{m.conteudo}</p>
                          <div className="flex items-center justify-end gap-1 text-[9px] text-[var(--app-text-muted)] float-right ml-2 mt-0.5 select-none">
                            <span>{m.timeFormatted || "agora"}</span>
                            {isMe && (
                              <span title="Entregue">
                                <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing indicator */}
                {roomTypers.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--app-bg)] text-xs text-[var(--app-text-muted)] rounded-2xl rounded-tl-none px-3 py-1 border border-[var(--app-border)] flex items-center gap-1.5">
                      <span className="text-emerald-500 font-bold">{roomTypers.join(", ")} digitando</span>
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-75" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-150" />
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-300" />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Input Form do Chat */}
              <form
                onSubmit={handleSendMessage}
                className="bg-[var(--app-bg)] p-2.5 flex items-center gap-2 border-t border-[var(--app-border)]"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={handleChatInputChange}
                  placeholder={
                    roomTypers.length > 0
                      ? `${roomTypers.join(", ")} digitando...`
                      : "Mensagem para o grupo de foco..."
                  }
                  className="flex-1 px-4 py-2 text-xs rounded-full bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] outline-none focus:border-[var(--app-primary)] shadow-2xs"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                  title="Enviar mensagem"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          )}

          {/* CONTEÚDO: LISTA DE COLEGAS EM FOCO */}
          {activeSideTab === "focusers" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Seu próprio status */}
              <div className="p-3.5 rounded-2xl bg-[var(--app-primary)]/10 border border-[var(--app-primary)]/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[var(--app-primary)] text-white font-black text-xs flex items-center justify-center shrink-0">
                    Você
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--app-text)] truncate">{user.name || "Você"}</p>
                    <span className="text-[10px] text-[var(--app-text-muted)] block truncate">
                      {sessionGoal || "Nenhuma meta definida ainda"}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isRunning ? "bg-emerald-500/15 text-emerald-600" : "bg-neutral-500/15 text-neutral-600"}`}>
                  {isRunning ? "Focando 🎯" : "Pausado ⏸️"}
                </span>
              </div>

              {/* Colegas da sala */}
              {focusingPeers.map((peer) => (
                <div
                  key={peer.id}
                  className="p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between gap-3 hover:border-[var(--app-primary)]/30 transition"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {peer.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--app-text)] truncate">{peer.name}</p>
                      <p className="text-[10px] text-[var(--app-text-muted)] truncate">
                        {peer.goal || "Foco em disciplinas acadêmicas"}
                      </p>
                      <span className="text-[9px] text-[var(--app-primary)] font-semibold mt-0.5 block">
                        {peer.timeStudiedMinutes} min em foco hoje
                      </span>
                    </div>
                  </div>

                  {onOpenPrivateChatWithMember && (
                    <button
                      onClick={() => onOpenPrivateChatWithMember({ id: peer.id, name: peer.name })}
                      className="p-2 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                      title={`Conversar com ${peer.name}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
