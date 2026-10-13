import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Trophy,
  Swords,
  Zap,
  Gift,
  Plus,
  MessageSquare,
  Send,
  CheckCircle2,
  Trash2,
  Phone,
  Video,
  Sparkles,
  ArrowRight,
  Smile,
  X,
  Check,
  CheckCheck,
} from "lucide-react";
import { UserProfile, TeamInfo, TeamMember } from "../../types";
import confetti from "canvas-confetti";
import { firestoreChatService, TeamMessageItem } from "../../services/firestoreChatService";

interface GuildsBattlesTabProps {
  user: UserProfile;
  onRewardXp?: (xp: number) => void;
  onConsumeEnergy?: (amount: number) => boolean;
  onAddEnergy?: (amount: number) => void;
  onUpdateUserTeam?: (teamId: string | null) => void;
  onStartCallWithMember?: (member: { id: string; name: string; avatar?: string }, isVideo: boolean) => void;
  onOpenPrivateChatWithMember?: (member: { id: string; name: string; avatar?: string }) => void;
}

export const GuildsBattlesTab: React.FC<GuildsBattlesTabProps> = ({
  user,
  onRewardXp,
  onConsumeEnergy,
  onAddEnergy,
  onUpdateUserTeam,
  onStartCallWithMember,
  onOpenPrivateChatWithMember,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"teams" | "battles">("teams");
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // Modal to create real team
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamTag, setNewTeamTag] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [newTeamEmoji, setNewTeamEmoji] = useState("🛡️");

  // Chat message state
  const [chatMessage, setChatMessage] = useState("");

  // Battle State
  const [isBattling, setIsBattling] = useState(false);
  const [battleQuestionIdx, setBattleQuestionIdx] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [battleFinished, setBattleFinished] = useState(false);

  // Fetch real teams from server
  const fetchTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        if (data.teams && Array.isArray(data.teams)) {
          setTeams(data.teams);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch teams:", e);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    const interval = setInterval(fetchTeams, 10000);
    return () => clearInterval(interval);
  }, []);

  const currentTeam = teams.find((t) => t.id === user.teamId);

  // Firestore Real-time Team Chat & Typing Indicators
  const [teamFirestoreMessages, setTeamFirestoreMessages] = useState<TeamMessageItem[]>([]);
  const [teamTypers, setTeamTypers] = useState<string[]>([]);
  const teamTypingTimerRef = React.useRef<any>(null);

  useEffect(() => {
    if (!currentTeam?.id) return;

    const unsubMsgs = firestoreChatService.subscribeTeamMessages(currentTeam.id, (msgs) => {
      setTeamFirestoreMessages(msgs);
    });

    const unsubTyping = firestoreChatService.subscribeTeamTypingStatus(
      currentTeam.id,
      user.name || "user",
      (typers) => {
        setTeamTypers(typers);
      }
    );

    return () => {
      unsubMsgs();
      unsubTyping();
      if (teamTypingTimerRef.current) clearTimeout(teamTypingTimerRef.current);
    };
  }, [currentTeam?.id, user.name]);

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeamName.trim(),
          tag: newTeamTag.trim().toUpperCase() || newTeamName.slice(0, 4).toUpperCase(),
          description: newTeamDesc.trim() || "Equipe de estudos colaborativos.",
          badgeIcon: newTeamEmoji,
          badgeColor: "#10b981",
          type: "open",
          creatorName: user.name || "Estudante",
          creatorId: user.email || user.name || "user-id",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsCreateModalOpen(false);
        setNewTeamName("");
        setNewTeamTag("");
        setNewTeamDesc("");
        if (onUpdateUserTeam) {
          onUpdateUserTeam(data.team.id);
        }
        fetchTeams();
        confetti({ particleCount: 70, spread: 60 });
      }
    } catch (e) {
      console.warn("Failed to create team:", e);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.email || user.name || "user-id",
          userName: user.name || "Estudante",
          userLevel: user.level || 1,
        }),
      });

      if (res.ok) {
        if (onUpdateUserTeam) {
          onUpdateUserTeam(teamId);
        }
        fetchTeams();
      }
    } catch (e) {
      console.warn("Failed to join team:", e);
    }
  };

  const handleLeaveTeam = async () => {
    if (!currentTeam) return;
    try {
      await fetch(`/api/teams/${currentTeam.id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.email || user.name || "user-id",
        }),
      });
      if (onUpdateUserTeam) {
        onUpdateUserTeam(null);
      }
      fetchTeams();
    } catch (e) {
      console.warn("Failed to leave team:", e);
    }
  };

  const handleDeleteTeam = async () => {
    if (!currentTeam) return;
    try {
      await fetch(`/api/teams/${currentTeam.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.email || user.name || "user-id",
          userName: user.name || "Estudante",
        }),
      });
      if (onUpdateUserTeam) {
        onUpdateUserTeam(null);
      }
      fetchTeams();
    } catch (e) {
      console.warn("Failed to delete team:", e);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !currentTeam) return;

    const textToSend = chatMessage.trim();
    setChatMessage("");

    if (teamTypingTimerRef.current) clearTimeout(teamTypingTimerRef.current);
    firestoreChatService.setTeamTypingStatus(
      currentTeam.id,
      user.email || user.name || "user",
      user.name || "Estudante",
      false
    );

    try {
      await firestoreChatService.sendTeamMessage({
        teamId: currentTeam.id,
        autorId: user.email || user.name || "user",
        autorName: user.name || "Estudante",
        conteudo: textToSend,
      });
    } catch (err) {
      console.warn("Erro ao enviar mensagem da equipe no Firestore:", err);
    }
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setChatMessage(val);
    if (!currentTeam) return;

    firestoreChatService.setTeamTypingStatus(
      currentTeam.id,
      user.email || user.name || "user",
      user.name || "Estudante",
      true
    );

    if (teamTypingTimerRef.current) clearTimeout(teamTypingTimerRef.current);
    teamTypingTimerRef.current = setTimeout(() => {
      firestoreChatService.setTeamTypingStatus(
        currentTeam.id,
        user.email || user.name || "user",
        user.name || "Estudante",
        false
      );
    }, 2500);
  };

  const battleQuestions = [
    {
      q: "Qual autor é o expoente da Teoria das Relações Humanas?",
      opts: ["Elton Mayo", "Henry Ford", "Max Weber", "Frederick Taylor"],
      correct: 0,
    },
    {
      q: "Em Lógica, qual a negação de 'Todos os estudantes foram aprovados'?",
      opts: [
        "Pelo menos um estudante não foi aprovado",
        "Nenhum estudante foi aprovado",
        "Todos os estudantes foram reprovados",
        "Metade dos estudantes foi reprovada",
      ],
      correct: 0,
    },
  ];

  const handleStartBattle = () => {
    if (onConsumeEnergy && !onConsumeEnergy(5)) {
      console.warn("Energia insuficiente para iniciar a batalha! Recarregue na Loja.");
      return;
    }
    setIsBattling(true);
    setBattleQuestionIdx(0);
    setPlayerScore(0);
    setRivalScore(0);
    setBattleFinished(false);
  };

  const handleAnswerBattle = (optIdx: number) => {
    const isCorrect = optIdx === battleQuestions[battleQuestionIdx].correct;
    if (isCorrect) setPlayerScore((s) => s + 50);

    const rivalCorrect = Math.random() > 0.4;
    if (rivalCorrect) setRivalScore((s) => s + 50);

    if (battleQuestionIdx + 1 < battleQuestions.length) {
      setBattleQuestionIdx((i) => i + 1);
    } else {
      setBattleFinished(true);
      if (onRewardXp) {
        onRewardXp(isCorrect ? 50 : 20);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Tab Switcher & Energy Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--app-border)] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab("teams")}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "teams"
                ? "bg-[var(--app-primary)] text-white shadow-xs"
                : "bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Equipes de Estudo</span>
          </button>

          <button
            onClick={() => setActiveSubTab("battles")}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === "battles"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-[var(--app-card)] border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Batalhas 1v1</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black">
            <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{user.energy} Energia</span>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Equipe</span>
          </button>
        </div>
      </div>

      {activeSubTab === "teams" ? (
        currentTeam ? (
          /* USER IS IN A TEAM */
          <div className="space-y-6">
            {/* Team Banner */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-3xl shadow-md">
                  {currentTeam.badgeIcon || "🛡️"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[var(--app-text)]">{currentTeam.name}</h2>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[var(--app-bg)] text-[var(--app-primary)] border border-[var(--app-border)]">
                      [{currentTeam.tag}]
                    </span>
                  </div>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1">{currentTeam.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLeaveTeam}
                  className="px-3.5 py-1.5 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-bg)] text-[var(--app-text)] text-xs font-bold transition cursor-pointer"
                >
                  Sair
                </button>
                <button
                  onClick={handleDeleteTeam}
                  className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>

            {/* Team Chest Progress */}
            <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-[var(--app-text)]">
                    Baú de Estudos da Equipe • Nível {currentTeam.chestLevel || 1}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500">
                  {currentTeam.chestProgress || 0} / {currentTeam.chestTarget || 500} XP
                </span>
              </div>

              <div className="h-3 w-full bg-[var(--app-bg)] rounded-full overflow-hidden border border-[var(--app-border)]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((currentTeam.chestProgress || 0) / (currentTeam.chestTarget || 500)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Team Chat & Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WhatsApp-Style Team Chat */}
              <div className="bg-[#efeae2] dark:bg-[#0b141a] border border-[var(--app-border)] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between h-96">
                <div className="bg-[#075e54] dark:bg-[#202c33] text-white px-4 py-2.5 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{currentTeam.badgeIcon || "🛡️"}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{currentTeam.name}</h4>
                      <p className="text-[10px] text-emerald-200 dark:text-neutral-400">
                        {teamTypers.length > 0 ? (
                          <span className="text-emerald-300 font-bold animate-pulse">
                            {teamTypers.join(", ")} digitando...
                          </span>
                        ) : (
                          "Fórum da equipe • Sincronizado via Firestore"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto space-y-2 p-3 flex-1">
                  {(() => {
                    const activeMsgs =
                      teamFirestoreMessages.length > 0
                        ? teamFirestoreMessages.map((m) => ({
                            id: m.id,
                            senderName: m.autorName,
                            text: m.conteudo,
                            timestamp: m.timeFormatted || "agora",
                            status: m.status,
                          }))
                        : (currentTeam.chatMessages || []).map((m) => ({
                            id: m.id,
                            senderName: m.senderName,
                            text: m.text,
                            timestamp: m.timestamp,
                            status: "delivered",
                          }));

                    if (activeMsgs.length === 0) {
                      return (
                        <div className="text-center py-10 text-xs text-neutral-500">
                          Nenhuma mensagem enviada ainda. Inicie o diálogo de estudos com o grupo!
                        </div>
                      );
                    }

                    return activeMsgs.map((msg) => {
                      const isMe = msg.senderName === user.name;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-100`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-1.5 text-xs shadow-2xs ${
                              isMe
                                ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                                : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none border border-neutral-200/40 dark:border-neutral-700/40"
                            }`}
                          >
                            {!isMe && (
                              <span className="text-[10px] font-bold text-[#00a884] block mb-0.5">
                                {msg.senderName}
                              </span>
                            )}
                            <p className="text-xs break-words">{msg.text}</p>
                            <div className="flex items-center justify-end gap-1 text-[9px] text-neutral-500 dark:text-neutral-400 float-right ml-2 mt-0.5">
                              <span>{msg.timestamp}</span>
                              {isMe && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}

                  {/* Team typing indicator balloon */}
                  {teamTypers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-[#202c33] text-neutral-600 dark:text-neutral-300 rounded-2xl rounded-tl-none px-3 py-1 text-[11px] shadow-2xs border border-neutral-200/40 dark:border-neutral-700/40 flex items-center gap-1.5">
                        <span className="text-emerald-500 font-bold">{teamTypers.join(", ")} digitando</span>
                        <span className="inline-flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce delay-75" />
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce delay-150" />
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce delay-300" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleSendChatMessage}
                  className="bg-[#f0f2f5] dark:bg-[#202c33] p-2 flex gap-2 border-t border-neutral-200/50 dark:border-neutral-700/50"
                >
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={handleChatInputChange}
                    placeholder={
                      teamTypers.length > 0
                        ? `${teamTypers.join(", ")} está digitando...`
                        : "Mensagem para a equipe..."
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-full bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef] outline-none shadow-xs"
                  />
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center transition cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </form>
              </div>

              {/* Members List with Call and Private Message beside EVERY member */}
              <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-5 shadow-sm space-y-3 h-96 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-2">
                  <h4 className="text-xs font-black uppercase text-[var(--app-text-muted)] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[var(--app-primary)]" />
                    Membros ({currentTeam.members?.length || 1})
                  </h4>
                  <span className="text-[10px] text-emerald-500 font-bold">Ao Vivo</span>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {(currentTeam.members || []).map((m) => {
                    const isSelf = m.name.includes("Você") || m.name === user.name;
                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {m.name ? m.name[0].toUpperCase() : "M"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--app-text)] truncate">{m.name}</p>
                            <span className="text-[10px] text-[var(--app-text-muted)]">{m.role}</span>
                          </div>
                        </div>

                        {/* Action buttons (Ligar e Mensagem) beside each member */}
                        {!isSelf ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                if (onStartCallWithMember) {
                                  onStartCallWithMember(m, false);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] border border-[var(--app-border)] transition cursor-pointer"
                              title={`Ligar para ${m.name}`}
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            </button>

                            <button
                              onClick={() => {
                                if (onStartCallWithMember) {
                                  onStartCallWithMember(m, true);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                              title={`Vídeo com ${m.name}`}
                            >
                              <Video className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (onOpenPrivateChatWithMember) {
                                  onOpenPrivateChatWithMember(m);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-[#00a884] hover:bg-[#008f6f] text-white transition cursor-pointer"
                              title={`Conversar no WhatsApp com ${m.name}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-500">Líder</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* LIST OF REAL TEAMS TO JOIN OR CREATE */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--app-text)]">
                  Equipes de Estudo
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Crie ou entre em uma equipe para trocar materiais e estudar em grupo.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Equipe</span>
              </button>
            </div>

            {teams.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-[var(--app-text)]">
                  Nenhuma equipe criada no momento
                </h4>
                <p className="text-xs text-[var(--app-text-muted)] max-w-sm mx-auto">
                  Seja o primeiro a formar uma equipe de estudos da sua turma! Você poderá convidar colegas, conversar e fazer chamadas em grupo.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold cursor-pointer"
                >
                  Criar Primeira Equipe
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 flex items-center justify-center text-2xl shadow-xs">
                          {t.badgeIcon || "🛡️"}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-[var(--app-text)]">{t.name}</h4>
                          <span className="text-[10px] font-mono font-bold text-[var(--app-primary)]">
                            [{t.tag}] • {t.membersCount || 1} membro(s)
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">{t.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--app-border)]">
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> Ativa
                      </span>
                      <button
                        onClick={() => handleJoinTeam(t.id)}
                        className="px-4 py-2 rounded-xl bg-[var(--app-primary)] hover:bg-[var(--app-primary-hover)] text-white text-xs font-bold transition cursor-pointer"
                      >
                        Ingressar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        /* KNOWLEDGE BATTLES 1v1 */
        <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {!isBattling ? (
            <div className="text-center py-8 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center mx-auto text-white shadow-lg">
                <Swords className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[var(--app-text)]">Batalha de Conhecimento 1v1</h3>
              <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
                Desafie outros estudantes ou a IA do IFES em duelos rápidos de 2 perguntas. Custo: 5 energias.
              </p>
              <button
                onClick={handleStartBattle}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs inline-flex items-center gap-2 shadow-md transition cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Encontrar Oponente (5 ⚡)</span>
              </button>
            </div>
          ) : !battleFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[var(--app-bg)] rounded-2xl border border-[var(--app-border)]">
                <div className="text-left">
                  <p className="text-xs font-bold text-[var(--app-text)]">{user.name}</p>
                  <p className="text-lg font-black text-purple-500">{playerScore} pts</p>
                </div>
                <span className="text-xl font-black text-[var(--app-text-muted)]">VS</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-[var(--app-text)]">Adversário IFES</p>
                  <p className="text-lg font-black text-red-500">{rivalScore} pts</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-bold text-[var(--app-text)]">
                  {battleQuestions[battleQuestionIdx].q}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {battleQuestions[battleQuestionIdx].opts.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswerBattle(i)}
                      className="p-3.5 rounded-2xl bg-[var(--app-bg)] hover:border-purple-500 border border-[var(--app-border)] text-left text-xs font-medium text-[var(--app-text)] transition cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <h3 className="text-2xl font-black text-[var(--app-text)]">
                {playerScore >= rivalScore ? "Vitória Esmagadora! 🏆" : "Bom Combate! ⚔️"}
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                Você finalizou com {playerScore} pontos contra {rivalScore} do rival.
              </p>
              <button
                onClick={() => setIsBattling(false)}
                className="px-5 py-2.5 rounded-xl bg-[var(--app-primary)] text-white text-xs font-bold cursor-pointer"
              >
                Voltar à Arena
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE TEAM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[var(--app-text)]">Criar Nova Equipe</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--app-text)]">Nome da Equipe</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Ex: Grupo de Estudos ADM 2º Ano"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--app-text)]">Sigla / Tag</label>
                  <input
                    type="text"
                    value={newTeamTag}
                    onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                    placeholder="Ex: ADM2"
                    maxLength={5}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--app-text)]">Ícone / Emoji</label>
                  <select
                    value={newTeamEmoji}
                    onChange={(e) => setNewTeamEmoji(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none"
                  >
                    <option value="🛡️">🛡️ Escudo</option>
                    <option value="⚡">⚡ Raio</option>
                    <option value="📚">📚 Livros</option>
                    <option value="🧠">🧠 Cérebro</option>
                    <option value="🎯">🎯 Alvo</option>
                    <option value="🚀">🚀 Foguete</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--app-text)]">Descrição da Equipe</label>
                <textarea
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Objetivos e matérias de foco do grupo..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Salvar Equipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
