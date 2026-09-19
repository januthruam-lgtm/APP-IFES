import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Users,
  Headphones,
  PhoneOff,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Radio,
  Monitor,
  MonitorOff,
  MessageSquare,
  Send,
  Volume2,
  Sparkles,
  SwitchCamera,
  Play,
  Pause,
  RotateCcw,
  X,
  Lock,
} from "lucide-react";
import { CourseTrack, UserProfile } from "../../types";

interface StudyRoomVirtualTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onRewardXp: (xp: number) => void;
  targetCallPeer?: { id: string; name: string; isVideo?: boolean } | null;
  onClearTargetCallPeer?: () => void;
}

interface PeerInfo {
  peerId: string;
  peerName: string;
  campus?: string;
  matricula?: string;
  isVideo?: boolean;
  isAudio?: boolean;
  isScreenSharing?: boolean;
  isSpeaking?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type?: "text" | "link" | "pomodoro";
}

interface PomodoroState {
  isRunning: boolean;
  mode: "focus" | "shortBreak" | "longBreak";
  timeLeftSeconds: number;
}

const DEFAULT_ROOMS = [
  { id: "sala-geral-ifes", name: "Sala Geral de Estudos IFES", tag: "Todos os Cursos" },
  { id: "sala-exatas", name: "Sala de Apoio - Exatas & Cálculo", tag: "Cálculo & Física" },
  { id: "sala-ti", name: "Lab Virtual - Programação & Redes", tag: "TI & Computação" },
  { id: "sala-gestao", name: "Sala de Estudos - Administração & Gestão", tag: "Administração" },
];

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const StudyRoomVirtualTab: React.FC<StudyRoomVirtualTabProps> = ({
  user,
  courses,
  onRewardXp,
  targetCallPeer,
  onClearTargetCallPeer,
}) => {
  const [currentRoomId, setCurrentRoomId] = useState<string>("sala-geral-ifes");
  const [customRoomInput, setCustomRoomInput] = useState<string>("");
  const [showCustomRoomInput, setShowCustomRoomInput] = useState(false);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);

  const [isInRoom, setIsInRoom] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [ambientSound, setAmbientSound] = useState<"none" | "chuva" | "foco" | "ondas">("none");
  const [roomTimer, setRoomTimer] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Peers and streams
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<{ [peerId: string]: MediaStream }>({});

  // Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Synchronized Pomodoro
  const [pomodoro, setPomodoro] = useState<PomodoroState>({
    isRunning: false,
    mode: "focus",
    timeLeftSeconds: 25 * 60,
  });

  // Media Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localScreenRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // WebRTC & WebSocket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<{ [peerId: string]: RTCPeerConnection }>({});
  const localPeerIdRef = useRef<string>(
    `peer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  );

  const currentRoomName =
    DEFAULT_ROOMS.find((r) => r.id === currentRoomId)?.name || `Sala ${currentRoomId}`;

  // 1. Play Gentle Study Chime via Web Audio API (No external file needed)
  const playChime = useCallback((frequency = 520, duration = 0.8) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  // 2. Local Media Capture (Camera & Microphone)
  const initLocalMedia = useCallback(async () => {
    if (!isInRoom) return;

    try {
      setMediaError(null);

      // Stop existing tracks before switching camera if needed
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: facingMode,
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      stream.getVideoTracks().forEach((t) => (t.enabled = isVideoOn));
      stream.getAudioTracks().forEach((t) => (t.enabled = isMicOn));

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }
      setStreamActive(true);

      // Replace tracks in existing RTCPeerConnections if already connected
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const senders = pc.getSenders();
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack).catch(() => {});
        }
        const audioSender = senders.find((s) => s.track?.kind === "audio");
        if (audioSender && audioTrack) {
          audioSender.replaceTrack(audioTrack).catch(() => {});
        }
      });

      // Initialize local speaking detection
      setupSpeakingDetector(stream);
    } catch (err: any) {
      console.warn("Dispositivos completos não puderam ser acessados, tentando apenas vídeo ou áudio:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = fallbackStream;
          localVideoRef.current.play().catch(() => {});
        }
        setStreamActive(true);
      } catch {
        setMediaError(
          "Permissão de câmera ou microfone não concedida. Você pode autorizar no ícone de cadeado do navegador para interagir ao vivo."
        );
        setStreamActive(false);
      }
    }
  }, [isInRoom, facingMode, isVideoOn, isMicOn]);

  useEffect(() => {
    initLocalMedia();
    return () => {
      stopLocalMedia();
    };
  }, [initLocalMedia]);

  const stopLocalMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  // 3. Speaking Detector via AnalyserNode
  const setupSpeakingDetector = (stream: MediaStream) => {
    try {
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      let wasSpeaking = false;

      const checkAudio = () => {
        if (!analyserRef.current || !streamRef.current) return;
        analyserRef.current.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const isSpeaking = avg > 18 && isMicOn;

        if (isSpeaking !== wasSpeaking) {
          wasSpeaking = isSpeaking;
          setIsSpeakingLocal(isSpeaking);
          // Broadcast speaking state
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "speaking",
                roomId: currentRoomId,
                peerId: localPeerIdRef.current,
                isSpeaking,
              })
            );
          }
        }
        requestAnimationFrame(checkAudio);
      };
      requestAnimationFrame(checkAudio);
    } catch {}
  };

  // 4. WebRTC Peer Connection Helper
  const createPeerConnection = (targetPeerId: string): RTCPeerConnection => {
    if (peerConnectionsRef.current[targetPeerId]) {
      return peerConnectionsRef.current[targetPeerId];
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current[targetPeerId] = pc;

    // Add local tracks (camera or screen)
    const activeStream = isScreenSharing && screenStreamRef.current ? screenStreamRef.current : streamRef.current;
    if (activeStream) {
      activeStream.getTracks().forEach((track) => {
        pc.addTrack(track, activeStream);
      });
    }

    // Handle remote track arrival
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Track remoto recebido de ${targetPeerId}:`, event.track.kind);
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetPeerId]: remoteStream,
        }));
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "signal",
            roomId: currentRoomId,
            targetPeerId,
            signal: { candidate: event.candidate },
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Estado de conexão com ${targetPeerId}:`, pc.connectionState);
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[targetPeerId];
          return next;
        });
      }
    };

    return pc;
  };

  // 5. Connect and Join WebSocket Room
  useEffect(() => {
    if (!isInRoom) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/study-room`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[StudyRoom WS] Conectado ao servidor de sinalização em tempo real");
      ws.send(
        JSON.stringify({
          type: "join",
          roomId: currentRoomId,
          peerId: localPeerIdRef.current,
          peerName: user.name || "Estudante IFES",
          campus: user.ifesAccount?.campusName || "IFES",
          matricula: user.ifesAccount?.matricula || user.qacademicoAccount?.matricula || "",
          isVideo: isVideoOn,
          isAudio: isMicOn,
          isScreenSharing,
        })
      );
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type } = data;

        if (type === "room-state") {
          console.log("[StudyRoom WS] Estado inicial da sala recebido:", data);
          setPeers(data.peers || []);
          setChatMessages(data.messages || []);
          if (data.pomodoro) setPomodoro(data.pomodoro);

          // For each existing peer in the room, create an offer
          for (const p of data.peers || []) {
            const pc = createPeerConnection(p.peerId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(
              JSON.stringify({
                type: "signal",
                roomId: currentRoomId,
                targetPeerId: p.peerId,
                signal: { sdp: offer },
              })
            );
          }
        } else if (type === "peer-joined") {
          console.log("[StudyRoom WS] Novo colega entrou na sala:", data.peer);
          setPeers((prev) => {
            const exists = prev.some((p) => p.peerId === data.peer.peerId);
            return exists ? prev : [...prev, data.peer];
          });
          playChime(660, 0.3);
        } else if (type === "peer-left") {
          console.log("[StudyRoom WS] Colega saiu da sala:", data.peerId);
          setPeers((prev) => prev.filter((p) => p.peerId !== data.peerId));
          setRemoteStreams((prev) => {
            const next = { ...prev };
            delete next[data.peerId];
            return next;
          });
          if (peerConnectionsRef.current[data.peerId]) {
            peerConnectionsRef.current[data.peerId].close();
            delete peerConnectionsRef.current[data.peerId];
          }
        } else if (type === "signal") {
          const { senderId, signal } = data;
          if (!senderId || !signal) return;
          const pc = createPeerConnection(senderId);

          if (signal.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            if (signal.sdp.type === "offer") {
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(
                JSON.stringify({
                  type: "signal",
                  roomId: currentRoomId,
                  targetPeerId: senderId,
                  signal: { sdp: answer },
                })
              );
            }
          } else if (signal.candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            } catch (err) {
              console.warn("Erro ao adicionar ICE candidate:", err);
            }
          }
        } else if (type === "peer-media-state") {
          const { peerId, isVideo, isAudio, isScreenSharing: remoteScreen } = data;
          setPeers((prev) =>
            prev.map((p) =>
              p.peerId === peerId
                ? {
                    ...p,
                    isVideo: typeof isVideo === "boolean" ? isVideo : p.isVideo,
                    isAudio: typeof isAudio === "boolean" ? isAudio : p.isAudio,
                    isScreenSharing: typeof remoteScreen === "boolean" ? remoteScreen : p.isScreenSharing,
                  }
                : p
            )
          );
        } else if (type === "peer-speaking") {
          const { peerId, isSpeaking } = data;
          setPeers((prev) =>
            prev.map((p) => (p.peerId === peerId ? { ...p, isSpeaking } : p))
          );
        } else if (type === "chat-message") {
          setChatMessages((prev) => [...prev, data.message]);
          if (!isChatOpen) {
            setUnreadChatCount((c) => c + 1);
            playChime(780, 0.2);
          }
        } else if (type === "pomodoro-updated") {
          setPomodoro(data.pomodoro);
        }
      } catch (err) {
        console.warn("[StudyRoom WS] Erro ao processar mensagem do servidor:", err);
      }
    };

    ws.onerror = (e) => {
      console.warn("[StudyRoom WS] Erro na conexão WebSocket:", e);
    };

    ws.onclose = () => {
      console.log("[StudyRoom WS] Conexão fechada");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave", roomId: currentRoomId }));
        ws.close();
      }
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      peerConnectionsRef.current = {};
    };
  }, [isInRoom, currentRoomId]);

  // 6. Camera Toggle
  const toggleVideo = () => {
    const nextState = !isVideoOn;
    setIsVideoOn(nextState);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = nextState));
    }
    broadcastMediaState({ isVideo: nextState });
  };

  // 7. Microphone Toggle
  const toggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = nextState));
    }
    broadcastMediaState({ isAudio: nextState });
  };

  // 8. Flip Camera (Mobile)
  const flipCamera = async () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
  };

  // 9. Screen Sharing (Desktop & Supported Mobile)
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("O compartilhamento de tela não é suportado pelo seu navegador neste dispositivo móvel.");
        return;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      if (localScreenRef.current) {
        localScreenRef.current.srcObject = screenStream;
        localScreenRef.current.play().catch(() => {});
      }

      // Replace video track in peer connections
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender && screenTrack) {
          videoSender.replaceTrack(screenTrack);
        }
      });

      setIsScreenSharing(true);
      broadcastMediaState({ isScreenSharing: true });

      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn("Compartilhamento de tela cancelado pelo usuário ou indisponível:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (localScreenRef.current) {
      localScreenRef.current.srcObject = null;
    }

    // Restore camera video track
    const cameraTrack = streamRef.current?.getVideoTracks()[0];
    if (cameraTrack) {
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(cameraTrack);
        }
      });
    }

    setIsScreenSharing(false);
    broadcastMediaState({ isScreenSharing: false });
  };

  const broadcastMediaState = (partial: { isVideo?: boolean; isAudio?: boolean; isScreenSharing?: boolean }) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "media-state",
          roomId: currentRoomId,
          peerId: localPeerIdRef.current,
          ...partial,
        })
      );
    }
  };

  // 10. Synchronized Pomodoro Actions
  const handlePomodoroAction = (action: "start" | "pause" | "reset" | "switch-mode", mode?: "focus" | "shortBreak" | "longBreak") => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "pomodoro-action",
          roomId: currentRoomId,
          action,
          mode,
        })
      );
    }
  };

  // Local Pomodoro Ticking
  useEffect(() => {
    if (!pomodoro.isRunning) return;

    const interval = setInterval(() => {
      setPomodoro((prev) => {
        if (prev.timeLeftSeconds <= 1) {
          playChime(880, 1.2);
          if (prev.mode === "focus") {
            onRewardXp(30);
          }
          return {
            ...prev,
            isRunning: false,
            timeLeftSeconds: prev.mode === "focus" ? 5 * 60 : 25 * 60,
            mode: prev.mode === "focus" ? "shortBreak" : "focus",
          };
        }
        return { ...prev, timeLeftSeconds: prev.timeLeftSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoro.isRunning, onRewardXp, playChime]);

  // 11. In-Room Chat Handlers
  const handleSendChat = (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : chatInput;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: localPeerIdRef.current,
      senderName: user.name || "Estudante",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat",
          roomId: currentRoomId,
          message: newMsg,
        })
      );
    } else {
      setChatMessages((prev) => [...prev, newMsg]);
    }

    setChatInput("");
  };

  // 12. Room Timer & XP Generation
  useEffect(() => {
    if (!isInRoom) return;
    const interval = setInterval(() => {
      setRoomTimer((t) => {
        const next = t + 1;
        if (next % 300 === 0) {
          onRewardXp(15);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isInRoom, onRewardXp]);

  // 13. Ambient Sound Synthesizer (White noise & Bandpass offline generator)
  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop?.();
      } catch {}
      noiseNodeRef.current = null;
    }
    setAmbientSound("none");
  };

  const playAmbientSound = (type: "none" | "chuva" | "foco" | "ondas") => {
    stopAmbientSound();
    if (type === "none") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.2;
        output[i] = (b0 + b1 + b2) * 0.4;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === "chuva" ? "lowpass" : type === "foco" ? "bandpass" : "lowpass";
      filter.frequency.value = type === "chuva" ? 650 : type === "foco" ? 950 : 380;

      const gain = ctx.createGain();
      gain.gain.value = 0.18;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
      setAmbientSound(type);
    } catch (e) {
      console.warn("Falha ao iniciar som sintetizado:", e);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${currentRoomId}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleSwitchRoom = (roomId: string) => {
    if (roomId === currentRoomId) return;
    setRemoteStreams({});
    setPeers([]);
    setCurrentRoomId(roomId);
  };

  const handleCreateCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomInput.trim()) return;
    const sanitizedId = customRoomInput
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-");
    handleSwitchRoom(sanitizedId);
    setShowCustomRoomInput(false);
    setCustomRoomInput("");
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 animate-in fade-in">
      {/* Top Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              <span>Sala Virtual IFES em Tempo Real</span>
            </span>

            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)] font-medium">
              {currentRoomName}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[var(--app-text)] tracking-tight">
            Estudos em Grupo & Vídeo Chamada
          </h1>
          <p className="text-xs text-[var(--app-text-muted)] max-w-2xl">
            Comunicação direta com áudio, vídeo e compartilhamento de tela entre alunos do IFES.
          </p>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Synchronized Pomodoro Clock */}
          <div className="px-3.5 py-2 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-mono font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-[var(--app-text)]">
              {pomodoro.mode === "focus" ? "Foco:" : "Pausa:"} {formatTimer(pomodoro.timeLeftSeconds)}
            </span>
            <button
              onClick={() => handlePomodoroAction(pomodoro.isRunning ? "pause" : "start")}
              className="p-1 rounded-lg bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-primary)] transition"
              title={pomodoro.isRunning ? "Pausar Foco" : "Iniciar Foco Coletivo"}
            >
              {pomodoro.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handlePomodoroAction("reset")}
              className="p-1 rounded-lg bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] transition"
              title="Resetar Pomodoro"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Session Timer */}
          <div className="px-3 py-2 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-mono font-bold text-[var(--app-text-muted)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            <span>{formatTimer(roomTimer)}</span>
          </div>

          {/* Invite Button */}
          <button
            onClick={copyRoomLink}
            className="px-3 py-2 rounded-2xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] border border-[var(--app-border)] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Copiar link para convidar colegas"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? "Copiado!" : "Convidar"}</span>
          </button>

          {/* Toggle Chat Drawer */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              if (!isChatOpen) setUnreadChatCount(0);
            }}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95 relative ${
              isChatOpen
                ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)]"
                : "bg-[var(--app-bg)] text-[var(--app-text)] border-[var(--app-border)] hover:bg-[var(--app-card-hover)]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat ({chatMessages.length})</span>
            {unreadChatCount > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadChatCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Room Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DEFAULT_ROOMS.map((room) => {
          const isSelected = room.id === currentRoomId;
          return (
            <button
              key={room.id}
              onClick={() => handleSwitchRoom(room.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? "bg-[var(--app-primary)] text-white border-[var(--app-primary)] shadow-xs"
                  : "bg-[var(--app-card)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border-[var(--app-border)] hover:bg-[var(--app-card-secondary)]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{room.name}</span>
            </button>
          );
        })}

        <button
          onClick={() => setShowCustomRoomInput(!showCustomRoomInput)}
          className="px-3 py-2 rounded-2xl text-xs font-bold text-[var(--app-primary)] bg-[var(--app-primary)]/10 hover:bg-[var(--app-primary)]/20 border border-[var(--app-primary)]/30 transition shrink-0 cursor-pointer"
        >
          + Outra Sala
        </button>
      </div>

      {/* Custom Room Creation Box */}
      {showCustomRoomInput && (
        <form
          onSubmit={handleCreateCustomRoom}
          className="p-3.5 rounded-2xl bg-[var(--app-card)] border border-[var(--app-border)] flex items-center gap-2 max-w-md animate-in fade-in"
        >
          <input
            type="text"
            value={customRoomInput}
            onChange={(e) => setCustomRoomInput(e.target.value)}
            placeholder="Nome ou código da sala (ex: calculo-turma-b)"
            className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[var(--app-primary)] text-white font-bold text-xs cursor-pointer active:scale-95"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setShowCustomRoomInput(false)}
            className="p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Media Permission or Device Alert */}
      {mediaError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Aviso de Dispositivo de Mídia:</p>
            <p>{mediaError}</p>
            <p className="text-[11px] opacity-80">
              Dica: Certifique-se de autorizar a câmera e microfone no ícone de cadeado do navegador.
            </p>
          </div>
        </div>
      )}

      {/* Screen Sharing Active Banner */}
      {isScreenSharing && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 animate-pulse" />
            <span>Você está compartilhando sua tela com a sala de estudos.</span>
          </div>
          <button
            onClick={stopScreenShare}
            className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Parar Transmissão
          </button>
        </div>
      )}

      {/* Main Grid & Chat Container */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Video Tiles Grid */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* User's Local Video Tile */}
          <div
            className={`aspect-video rounded-3xl bg-neutral-900 shadow-md relative overflow-hidden flex flex-col items-center justify-center border-2 transition-all duration-300 ${
              isSpeakingLocal
                ? "border-emerald-500 ring-4 ring-emerald-500/40"
                : "border-[var(--app-primary)]"
            }`}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                isVideoOn && streamActive ? "block" : "hidden"
              }`}
            />

            {/* Offline/Disabled Camera Overlay */}
            {(!isVideoOn || !streamActive) && (
              <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-[var(--app-primary)]/20 border border-[var(--app-primary)]/40 flex items-center justify-center text-white text-xl font-black">
                  {user.name.charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
                    <VideoOff className="w-3 h-3" /> Câmera desligada
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Tag */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs pointer-events-none">
              <span className="font-bold text-white bg-black/75 px-2.5 py-1 rounded-xl backdrop-blur-xs text-[11px] border border-white/10 flex items-center gap-1.5 truncate max-w-[180px]">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                {user.name} (Você)
              </span>

              <div className="flex items-center gap-1">
                {isSpeakingLocal && (
                  <span className="p-1 rounded-lg bg-emerald-600/90 text-white animate-pulse" title="Falando">
                    <Volume2 className="w-3 h-3" />
                  </span>
                )}
                <span
                  className={`p-1.5 rounded-lg text-white text-[10px] ${
                    isMicOn ? "bg-emerald-600/90" : "bg-rose-600/90"
                  }`}
                >
                  {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                </span>
              </div>
            </div>
          </div>

          {/* Local Screen Preview Tile (if sharing) */}
          {isScreenSharing && (
            <div className="aspect-video rounded-3xl bg-neutral-900 border-2 border-emerald-500 shadow-md relative overflow-hidden flex flex-col items-center justify-center">
              <video
                ref={localScreenRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain bg-black"
              />
              <div className="absolute bottom-2.5 left-2.5 bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5">
                <Monitor className="w-3 h-3 text-emerald-400" />
                <span>Sua Tela Transmitida</span>
              </div>
            </div>
          )}

          {/* Remote Connected Peers (Real Students) */}
          {peers.map((peer) => {
            const remoteStream = remoteStreams[peer.peerId];
            return (
              <RemotePeerTile
                key={peer.peerId}
                peer={peer}
                stream={remoteStream}
              />
            );
          })}

          {/* Target Call Peer placeholder if waiting */}
          {targetCallPeer && !peers.some((p) => p.peerId === targetCallPeer.id) && (
            <div className="aspect-video rounded-3xl bg-neutral-900 border border-[var(--app-border)] shadow-md relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl font-black animate-pulse">
                {targetCallPeer.name.charAt(0)}
              </div>
              <div className="mt-2 space-y-0.5">
                <h4 className="text-xs font-bold text-white">{targetCallPeer.name}</h4>
                <p className="text-[10px] text-neutral-400">Aguardando colega conectar o áudio/vídeo...</p>
              </div>
              <div className="absolute bottom-2.5 left-2.5">
                <span className="font-bold text-[10px] text-white bg-black/70 px-2 py-0.5 rounded-lg border border-white/10">
                  {targetCallPeer.name} (Chamando)
                </span>
              </div>
            </div>
          )}

          {/* Official RNP Webconferência Card */}
          <div className="aspect-video rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm p-4 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[var(--app-primary)] font-bold text-[11px] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Conferência Web RNP IFES</span>
              </div>
              <h3 className="text-xs font-bold text-[var(--app-text)]">
                Salas Oficiais do Instituto Federal
              </h3>
              <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed line-clamp-3">
                Para bancas, defesas e reuniões institucionais oficiais com professores do IFES, acesse o portal institucional da RNP.
              </p>
            </div>

            <a
              href="https://conferenciaweb.rnp.br"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <span>Acessar Sala RNP IFES</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Real-time In-Room Chat Drawer */}
        {isChatOpen && (
          <div className="w-full lg:w-80 h-[500px] rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-md flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
            {/* Chat Header */}
            <div className="p-3.5 border-b border-[var(--app-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--app-primary)]" />
                <h3 className="text-xs font-bold text-[var(--app-text)]">Chat da Sala</h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
              {chatMessages.length === 0 && (
                <div className="text-center py-10 text-[var(--app-text-muted)] space-y-1">
                  <p className="font-bold">Nenhuma mensagem ainda.</p>
                  <p className="text-[11px]">Tire dúvidas ou compartilhe notas de estudo!</p>
                </div>
              )}

              {chatMessages.map((msg) => {
                const isMine = msg.senderId === localPeerIdRef.current;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-[var(--app-text-muted)] mb-0.5">
                      <span className="font-bold">{isMine ? "Você" : msg.senderName}</span>
                      <span>• {msg.timestamp}</span>
                    </div>
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[85%] break-words ${
                        isMine
                          ? "bg-[var(--app-primary)] text-white"
                          : "bg-[var(--app-bg)] text-[var(--app-text)] border border-[var(--app-border)]"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fast Study Chips */}
            <div className="p-2 border-t border-[var(--app-border)] bg-[var(--app-bg)] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                "💡 Resolvi!",
                "❓ Dúvida na questão",
                "☕ Pausa 5 min",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendChat(chip)}
                  className="px-2 py-1 rounded-lg bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border border-[var(--app-border)] text-[10px] font-medium shrink-0 cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="p-2.5 border-t border-[var(--app-border)] flex items-center gap-2 bg-[var(--app-card)]"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Enviar mensagem para os colegas..."
                className="flex-1 px-3 py-2 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 rounded-xl bg-[var(--app-primary)] disabled:opacity-40 text-white cursor-pointer active:scale-95 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Control Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Audio & Video Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleMic}
            className={`px-3.5 py-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold cursor-pointer active:scale-95 ${
              isMicOn
                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span>{isMicOn ? "Microfone Ativo" : "Microfone Mudo"}</span>
          </button>

          <button
            onClick={toggleVideo}
            className={`px-3.5 py-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold cursor-pointer active:scale-95 ${
              isVideoOn
                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : "bg-[var(--app-bg)] text-[var(--app-text-muted)] border-[var(--app-border)]"
            }`}
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            <span>{isVideoOn ? "Câmera Ativa" : "Câmera Desligada"}</span>
          </button>

          {/* Flip Camera on Mobile */}
          <button
            onClick={flipCamera}
            className="p-2.5 rounded-2xl bg-[var(--app-bg)] hover:bg-[var(--app-card-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)] transition cursor-pointer"
            title="Alternar Câmera Frontal / Traseira"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>

          {/* Screen Sharing Toggle */}
          <button
            onClick={toggleScreenShare}
            className={`px-3.5 py-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold cursor-pointer active:scale-95 ${
              isScreenSharing
                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : "bg-[var(--app-bg)] text-[var(--app-text)] border-[var(--app-border)] hover:bg-[var(--app-card-hover)]"
            }`}
          >
            {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            <span>{isScreenSharing ? "Parar Tela" : "Compartilhar Tela"}</span>
          </button>
        </div>

        {/* Ambient Sound Focus Generator */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs text-[var(--app-text-muted)] font-medium mr-1">
            <Headphones className="w-3.5 h-3.5 text-[var(--app-primary)]" />
            <span className="hidden sm:inline">Som:</span>
          </div>
          {(
            [
              { id: "none", label: "Mudo" },
              { id: "chuva", label: "🌧️ Chuva" },
              { id: "foco", label: "🧠 Ruído Foco" },
              { id: "ondas", label: "🌊 Ondas" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              onClick={() => playAmbientSound(s.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                ambientSound === s.id
                  ? "bg-[var(--app-primary)] text-white shadow-xs"
                  : "bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border border-[var(--app-border)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Leave Room Button */}
        <button
          onClick={() => {
            stopLocalMedia();
            stopScreenShare();
            stopAmbientSound();
            setIsInRoom(false);
            if (onClearTargetCallPeer) onClearTargetCallPeer();
          }}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Sair da Sala</span>
        </button>
      </div>
    </div>
  );
};

// Subcomponent: Remote Peer Video Tile with real WebRTC MediaStream
const RemotePeerTile: React.FC<{
  peer: PeerInfo;
  stream?: MediaStream | null;
}> = ({ peer, stream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  const hasLiveVideoTrack =
    stream &&
    stream.getVideoTracks().some((t) => t.enabled && t.readyState === "live") &&
    peer.isVideo !== false;

  return (
    <div
      className={`aspect-video rounded-3xl bg-neutral-900 shadow-md relative overflow-hidden flex flex-col items-center justify-center border-2 transition-all duration-300 ${
        peer.isSpeaking
          ? "border-emerald-500 ring-4 ring-emerald-500/40"
          : "border-[var(--app-border)]"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full ${peer.isScreenSharing ? "object-contain bg-black" : "object-cover"} ${
          hasLiveVideoTrack ? "block" : "hidden"
        }`}
      />

      {/* When camera is off */}
      {!hasLiveVideoTrack && (
        <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xl font-black">
            {peer.peerName.charAt(0)}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white">{peer.peerName}</h4>
            <p className="text-[10px] text-neutral-400">{peer.campus || "IFES"}</p>
          </div>
        </div>
      )}

      {/* Bottom identification tag */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs pointer-events-none">
        <span className="font-bold text-white bg-black/75 px-2.5 py-1 rounded-xl backdrop-blur-xs text-[11px] border border-white/10 truncate max-w-[180px] flex items-center gap-1.5">
          {peer.isScreenSharing && <Monitor className="w-3 h-3 text-emerald-400" />}
          {peer.peerName}
        </span>

        <div className="flex items-center gap-1">
          {peer.isSpeaking && (
            <span className="p-1 rounded-lg bg-emerald-600/90 text-white animate-pulse" title="Falando">
              <Volume2 className="w-3 h-3" />
            </span>
          )}
          <span
            className={`p-1.5 rounded-lg text-white text-[10px] ${
              peer.isAudio !== false ? "bg-emerald-600/90" : "bg-rose-600/90"
            }`}
          >
            {peer.isAudio !== false ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
          </span>
        </div>
      </div>
    </div>
  );
};
