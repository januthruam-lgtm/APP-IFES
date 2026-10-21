import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  MessageSquare,
  Sparkles,
  Send,
  ScreenShare,
  ArrowLeft,
  ShieldCheck,
  Phone,
  Smile,
  Check,
  CheckCheck,
} from "lucide-react";
import { UserProfile, CourseTrack } from "../../types";
import {
  realtimeCallService,
  CallPeerInfo,
} from "../../services/realtimeCallService";
import {
  firestoreChatService,
  TeamMessageItem,
} from "../../services/firestoreChatService";

interface StudyRoomVirtualTabProps {
  user: UserProfile;
  courses?: CourseTrack[];
  onRewardXp?: (amount: number) => void;
  targetPeer?: { id: string; name: string; isVideo?: boolean } | null;
  targetCallPeer?: { id: string; name: string; isVideo?: boolean } | null;
  onClearTargetPeer?: () => void;
  onClearTargetCallPeer?: () => void;
  onNavigate?: (tab: string) => void;
  onStartCallWithMember?: (member: { id: string; name: string; avatar?: string }, isVideo: boolean) => void;
  onOpenPrivateChatWithMember?: (member: { id: string; name: string; avatar?: string }) => void;
}

export const StudyRoomVirtualTab: React.FC<StudyRoomVirtualTabProps> = ({
  user,
  courses = [],
  targetPeer,
  targetCallPeer,
  onClearTargetPeer,
  onClearTargetCallPeer,
  onNavigate,
  onStartCallWithMember,
  onOpenPrivateChatWithMember,
}) => {
  const { t } = useTranslation();
  const activePeer = targetPeer || targetCallPeer;
  const clearPeer = onClearTargetPeer || onClearTargetCallPeer;

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<CallPeerInfo[]>([]);

  const roomId = user.teamId || "sala-estudo-ifes";
  const [firestoreMessages, setFirestoreMessages] = useState<TeamMessageItem[]>([]);
  const [roomTypers, setRoomTypers] = useState<string[]>([]);
  const roomTypingTimeoutRef = useRef<any>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const [chatInput, setChatInput] = useState("");

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);

  // Escuta mensagens da sala de estudo em tempo real com persistência no Firestore
  useEffect(() => {
    const unsubMsgs = firestoreChatService.subscribeTeamMessages(roomId, (msgs) => {
      setFirestoreMessages(msgs);
    });

    const unsubTyping = firestoreChatService.subscribeTeamTypingStatus(
      roomId,
      user.name || "user",
      (typers) => {
        setRoomTypers(typers);
      }
    );

    return () => {
      unsubMsgs();
      unsubTyping();
      if (roomTypingTimeoutRef.current) clearTimeout(roomTypingTimeoutRef.current);
    };
  }, [roomId, user.name]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [firestoreMessages, roomTypers]);

  // Initialize camera and local media on mount
  useEffect(() => {
    let localStream: MediaStream | null = null;

    const startLocalMedia = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: { echoCancellation: true, noiseSuppression: true },
          });
          localStream = stream;
          camStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localVideoRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        console.warn("Could not capture camera in StudyRoom:", err);
      }
    };

    startLocalMedia();

    // Listen to real-time remote stream if in a direct call
    const unsubRemote = realtimeCallService.onRemoteStreamChange((stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch(() => {});
      }
    });

    // If activePeer passed, start or ensure call
    if (activePeer) {
      setConnectedPeers([
        {
          id: activePeer.id,
          name: activePeer.name,
          isVideo: activePeer.isVideo,
        },
      ]);
    }

    return () => {
      unsubRemote();
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [activePeer]);

  // Mic toggle
  const handleToggleMic = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // Video toggle
  const handleToggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  // Screen share toggle (Cross-platform Android Chrome & Desktop compatible)
  const handleToggleScreenShare = async () => {
    setScreenShareError(null);

    if (isScreenSharing) {
      // Revert to camera stream
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);

      if (camStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = camStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      } else {
        try {
          const freshCam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          camStreamRef.current = freshCam;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = freshCam;
            localVideoRef.current.play().catch(() => {});
          }
        } catch {}
      }
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setScreenShareError("Compartilhamento de tela não suportado neste navegador. Use o Google Chrome atualizado.");
      setTimeout(() => setScreenShareError(null), 5000);
      return;
    }

    try {
      // Android Chrome requires video only (audio: true throws on mobile)
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
      } catch (err1: any) {
        // Fallback for browsers with no argument requirements
        stream = await (navigator.mediaDevices as any).getDisplayMedia();
      }

      if (stream) {
        screenStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
        setIsScreenSharing(true);

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            setIsScreenSharing(false);
            screenStreamRef.current = null;
            if (camStreamRef.current && localVideoRef.current) {
              localVideoRef.current.srcObject = camStreamRef.current;
              localVideoRef.current.play().catch(() => {});
            }
          };
        }
      }
    } catch (err: any) {
      console.warn("Screen share error:", err);
      if (err.name !== "NotAllowedError" && err.name !== "AbortError") {
        setScreenShareError("Aviso de tela: " + (err.message || "Permissão necessária"));
        setTimeout(() => setScreenShareError(null), 5000);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const textToSend = chatInput.trim();
    setChatInput("");

    if (roomTypingTimeoutRef.current) clearTimeout(roomTypingTimeoutRef.current);
    firestoreChatService.setTeamTypingStatus(
      roomId,
      user.email || user.name || "user",
      user.name || "Estudante",
      false
    );

    try {
      await firestoreChatService.sendTeamMessage({
        teamId: roomId,
        autorId: user.email || user.name || "user",
        autorName: user.name || "Estudante",
        conteudo: textToSend,
      });
    } catch (err) {
      console.warn("Erro ao enviar mensagem no Firestore:", err);
    }
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setChatInput(val);

    firestoreChatService.setTeamTypingStatus(
      roomId,
      user.email || user.name || "user",
      user.name || "Estudante",
      true
    );

    if (roomTypingTimeoutRef.current) clearTimeout(roomTypingTimeoutRef.current);
    roomTypingTimeoutRef.current = setTimeout(() => {
      firestoreChatService.setTeamTypingStatus(
        roomId,
        user.email || user.name || "user",
        user.name || "Estudante",
        false
      );
    }, 2200);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      {/* Call Header */}
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-[var(--app-text)]">
                {activePeer ? `Chamada com ${activePeer.name}` : t("sala_estudo.titulo", "Grupo de Estudos Virtual ao Vivo")}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Câmera & Áudio Ativos
              </span>
            </div>
            <p className="text-xs text-[var(--app-text-muted)] flex items-center gap-2 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t("sala_estudo.subtitulo", "Videoconferência acadêmica, compartilhamento de tela e chat colaborativo")}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activePeer && clearPeer && (
            <button
              onClick={clearPeer}
              className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition cursor-pointer"
            >
              Encerrar Chamada Direta
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate("ifes")}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-xs font-bold text-[var(--app-text)] border border-[var(--app-border)] transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao AVA IFES</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Video Streams & WhatsApp-style Room Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[460px]">
        {/* Video Streams Container */}
        <div className="lg:col-span-2 bg-neutral-950 rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden border border-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {/* Peer / Remote Video */}
            <div className="bg-neutral-900 rounded-2xl overflow-hidden relative border border-neutral-800 flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-2">
                <span>{activePeer ? activePeer.name : "Colega Conectado"}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {!activePeer && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2 pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center text-xl font-bold">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-neutral-300">
                    Aguardando colega entrar
                  </p>
                  <p className="text-[11px] text-neutral-500 max-w-xs">
                    Compartilhe o app para iniciar chamadas de áudio e vídeo com sua turma.
                  </p>
                </div>
              )}
            </div>

            {/* Local Video Stream (Camera / Screen) */}
            <div className="bg-neutral-900 rounded-2xl overflow-hidden relative border border-neutral-800 flex flex-col justify-between min-h-[220px]">
              <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-2">
                <span>{user.name} (Você)</span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  {isScreenSharing ? "Compartilhando Tela" : isVideoOn ? "Câmera On" : "Câmera Off"}
                </span>
              </div>

              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOn || isScreenSharing ? "block" : "hidden"}`}
              />

              {!(isVideoOn || isScreenSharing) && (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-neutral-800 py-12">
                  <VideoOff className="w-8 h-8 text-neutral-500" />
                  <span className="text-xs font-semibold">Câmera desativada</span>
                </div>
              )}

              <div className="absolute bottom-3 left-3 z-10 text-[10px] text-neutral-300 flex items-center gap-1.5 font-semibold bg-black/60 px-2 py-0.5 rounded">
                {isMicOn ? (
                  <>
                    <Mic className="w-3 h-3 text-emerald-400" />
                    <span>Microfone ligado</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-3 h-3 text-red-400" />
                    <span>Silenciado</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Screen Share Feedback Banner */}
          {screenShareError && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs text-center font-bold animate-in fade-in">
              {screenShareError}
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-neutral-800/80 mt-3">
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                isMicOn
                  ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
              title={isMicOn ? t("sala_estudo.desligar_mic", "Desligar Microfone") : t("sala_estudo.ligar_mic", "Ligar Microfone")}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={handleToggleVideo}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                isVideoOn
                  ? "bg-neutral-800 hover:bg-neutral-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
              title={isVideoOn ? t("sala_estudo.desligar_video", "Desligar Câmera") : t("sala_estudo.ligar_video", "Ligar Câmera")}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={handleToggleScreenShare}
              className={`p-3 rounded-2xl transition cursor-pointer ${
                isScreenSharing
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-neutral-800 hover:bg-neutral-700 text-white"
              }`}
              title={isScreenSharing ? t("sala_estudo.parar_compartilhamento", "Parar Compartilhamento") : t("sala_estudo.compartilhar_tela", "Compartilhar Tela")}
            >
              <ScreenShare className="w-5 h-5" />
            </button>

            {activePeer && clearPeer && (
              <button
                onClick={clearPeer}
                className="p-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                title="Desconectar"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* WhatsApp-Style Study Room Chat */}
        <div className="bg-[#efeae2] dark:bg-[#0b141a] border border-[var(--app-border)] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between h-[460px]">
          <div className="bg-[#075e54] dark:bg-[#202c33] text-white px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <h4 className="text-xs font-bold text-white">{t("sala_estudo.chat_ao_vivo", "Chat ao Vivo da Sala")}</h4>
            </div>
            <span className="text-[10px] text-emerald-200">Tempo Real</span>
          </div>

          <div className="overflow-y-auto space-y-2 p-3 flex-1">
            {firestoreMessages.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-500 space-y-1">
                <p className="font-bold text-neutral-600 dark:text-neutral-400">Nenhuma mensagem enviada ainda na sala.</p>
                <p className="text-[11px] opacity-75">Envie uma mensagem abaixo para colaborar com os colegas de estudo!</p>
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
                          : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none border border-neutral-200/40 dark:border-neutral-700/40"
                      }`}
                    >
                      {!isMe && (
                        <span className="text-[10px] font-bold text-[#00a884] block mb-0.5">
                          {m.autorName}
                        </span>
                      )}
                      <p className="text-xs">{m.conteudo}</p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-neutral-500 dark:text-neutral-400 float-right ml-2 mt-0.5 select-none">
                        <span>{m.timeFormatted || "agora"}</span>
                        {isMe && (
                          <span title="Entregue / Visto">
                            <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Balão flutuante de digitação ("digitando...") */}
            {roomTypers.length > 0 && (
              <div className="flex justify-start animate-in fade-in duration-150">
                <div className="bg-white dark:bg-[#202c33] text-neutral-600 dark:text-neutral-300 rounded-2xl rounded-tl-none px-3.5 py-1.5 text-[11px] shadow-xs border border-neutral-200/40 dark:border-neutral-700/40 flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">
                    {roomTypers.join(", ")} {roomTypers.length === 1 ? "está digitando" : "estão digitando"}
                  </span>
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

          <form
            onSubmit={handleSendMessage}
            className="bg-[#f0f2f5] dark:bg-[#202c33] p-2 flex gap-2 border-t border-neutral-200/50 dark:border-neutral-700/50"
          >
            <input
              type="text"
              value={chatInput}
              onChange={handleChatInputChange}
              placeholder={
                roomTypers.length > 0
                  ? `${roomTypers.join(", ")} digitando...`
                  : t("sala_estudo.enviar_mensagem", "Enviar mensagem para o grupo...")
              }
              className="flex-1 px-3.5 py-2 text-xs rounded-full bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef] outline-none shadow-xs"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center transition cursor-pointer shrink-0"
              title={t("chat_direto.enviar", "Enviar mensagem")}
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
