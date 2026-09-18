import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { CourseTrack, UserProfile } from "../../types";

interface StudyRoomVirtualTabProps {
  user: UserProfile;
  courses: CourseTrack[];
  onRewardXp: (xp: number) => void;
  targetCallPeer?: { id: string; name: string; isVideo?: boolean } | null;
  onClearTargetCallPeer?: () => void;
}

export const StudyRoomVirtualTab: React.FC<StudyRoomVirtualTabProps> = ({
  user,
  courses,
  onRewardXp,
  targetCallPeer,
  onClearTargetCallPeer,
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isInRoom, setIsInRoom] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [ambientSound, setAmbientSound] = useState<"none" | "chuva" | "foco" | "ondas">("none");
  const [roomTimer, setRoomTimer] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePeers, setActivePeers] = useState<Array<{ id: string; name: string; campus?: string }>>([]);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // 1. Iniciar ou atualizar Stream de Mídia Real (Câmera e Microfone)
  useEffect(() => {
    let isMounted = true;

    async function initMedia() {
      if (!isInRoom) {
        stopMedia();
        return;
      }

      try {
        setMediaError(null);
        // Se já houver stream ativo, ajusta os tracks
        if (streamRef.current) {
          streamRef.current.getVideoTracks().forEach((t) => (t.enabled = isVideoOn));
          streamRef.current.getAudioTracks().forEach((t) => (t.enabled = isMicOn));
          return;
        }

        // Tenta capturar vídeo e áudio reais
        const constraints: MediaStreamConstraints = {
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: true,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        stream.getVideoTracks().forEach((t) => (t.enabled = isVideoOn));
        stream.getAudioTracks().forEach((t) => (t.enabled = isMicOn));

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch((err) => {
            console.warn("Autoplay do vídeo prevenido:", err);
          });
        }
        setStreamActive(true);
      } catch (err: any) {
        console.warn("Aviso ao acessar dispositivos de mídia:", err);
        // Se falhar com ambos, tenta apenas áudio ou apenas vídeo
        try {
          const fallbackConstraints: MediaStreamConstraints = {
            video: true,
            audio: false,
          };
          const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          if (!isMounted) return;
          streamRef.current = fallbackStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = fallbackStream;
            localVideoRef.current.play().catch(() => {});
          }
          setStreamActive(true);
        } catch (fbErr: any) {
          if (isMounted) {
            setMediaError(
              "Permissão de câmera ou microfone não concedida ou dispositivo não encontrado. Você pode conceder a permissão no navegador para transmitir áudio e vídeo."
            );
            setStreamActive(false);
          }
        }
      }
    }

    initMedia();

    return () => {
      isMounted = false;
    };
  }, [isInRoom]);

  // Atualizar tracks de vídeo ao mudar o botão de câmera
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = isVideoOn));
    }
  }, [isVideoOn]);

  // Atualizar tracks de microfone ao mudar o botão de microfone
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => (t.enabled = isMicOn));
    }
  }, [isMicOn]);

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    return () => {
      stopMedia();
      stopAmbientSound();
    };
  }, []);

  // 2. Temporizador da Sala e XP contínuo
  useEffect(() => {
    let interval: any = null;
    if (isInRoom) {
      interval = setInterval(() => {
        setRoomTimer((t) => {
          if (t > 0 && t % 300 === 0) {
            onRewardXp(20);
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInRoom, onRewardXp]);

  // 3. Buscar apenas participantes REAIS online do curso/AVA
  useEffect(() => {
    let isMounted = true;
    async function fetchRealPeers() {
      try {
        const activeCourseId = courses[0]?.id || "gen";
        const res = await fetch(`/api/ava/participants/${activeCourseId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.participants)) {
            // Filtrar para não incluir o próprio usuário
            const filtered = data.participants.filter(
              (p: any) => p.name && p.name.toLowerCase() !== user.name.toLowerCase()
            );
            setActivePeers(filtered);
          }
        }
      } catch (err) {
        // Silencioso se offline
      }
    }

    fetchRealPeers();
    const interval = setInterval(fetchRealPeers, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [courses, user.name]);

  // 4. Gerador de Som Ambiente Sintético via Web Audio API (Chuva, Ondas, Ruído Branco)
  const stopAmbientSound = () => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    } catch {}
  };

  const playAmbientSound = (type: "none" | "chuva" | "foco" | "ondas") => {
    stopAmbientSound();
    setAmbientSound(type);

    if (type === "none") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Gerador de Ruído Rosa/Suave (Brownian/Pink Noise) para simular chuva ou foco
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = type === "chuva" ? "lowpass" : type === "foco" ? "bandpass" : "lowpass";
      filter.frequency.value = type === "chuva" ? 700 : type === "foco" ? 1000 : 400;

      const gain = ctx.createGain();
      gain.gain.value = 0.25;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
    } catch (e) {
      console.warn("Falha ao iniciar áudio sintetizado:", e);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const copyRoomLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
            <Users className="w-3.5 h-3.5" />
            <span>Chamadas & Sala de Estudos IFES</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--app-text)] tracking-tight">
            Transmissão de Vídeo & Áudio
          </h1>
          <p className="text-xs text-[var(--app-text-muted)]">
            Transmissão com câmera e microfone locais, temporizador de foco e integração com a Conferência Web RNP IFES.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-4 py-2 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] text-xs font-mono font-bold text-[var(--app-primary)] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTimer(roomTimer)}</span>
          </div>

          <button
            onClick={copyRoomLink}
            className="px-3.5 py-2 rounded-2xl bg-[var(--app-bg)] hover:bg-[var(--app-card)] text-[var(--app-text)] border border-[var(--app-border)] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Copiar link da sala para convidar colegas"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? "Link Copiado!" : "Convidar Aluno"}</span>
          </button>
        </div>
      </div>

      {mediaError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Aviso de Dispositivo de Mídia:</p>
            <p>{mediaError}</p>
            <p className="text-[11px] opacity-80">
              Dica: Certifique-se de autorizar o acesso à câmera e microfone nas permissões do navegador (ícone de cadeado na barra de endereços).
            </p>
          </div>
        </div>
      )}

      {/* Grid de Vídeo com Dispositivos Reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card de Vídeo do Próprio Usuário (Stream Real de Câmera) */}
        <div className="aspect-video rounded-3xl bg-neutral-900 border-2 border-[var(--app-primary)] shadow-lg relative overflow-hidden flex flex-col items-center justify-center group">
          {/* Elemento de vídeo real */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${
              isVideoOn && streamActive ? "block" : "hidden"
            }`}
          />

          {/* Overlay quando câmera está desligada ou indisponível */}
          {(!isVideoOn || !streamActive) && (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--app-primary)]/20 border border-[var(--app-primary)]/40 flex items-center justify-center text-white text-xl font-black shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1">
                  <VideoOff className="w-3.5 h-3.5" /> Câmera desligada
                </p>
              </div>
            </div>
          )}

          {/* Barra inferior de identificação do participante local */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs pointer-events-none">
            <span className="font-bold text-white bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-xs truncate max-w-[180px] border border-white/10 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              {user.name} (Você)
            </span>

            <div className="flex items-center gap-1.5">
              <span
                className={`p-1.5 rounded-lg text-white font-mono text-[10px] ${
                  isMicOn ? "bg-emerald-600/90" : "bg-rose-600/90"
                }`}
              >
                {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </span>
            </div>
          </div>
        </div>

        {/* Participante Alvo Específico (Caso tenha clicado em chamar alguém da equipe) */}
        {targetCallPeer && (
          <div className="aspect-video rounded-3xl bg-neutral-900 border border-[var(--app-border)] shadow-md relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl font-black animate-pulse">
              {targetCallPeer.name.charAt(0)}
            </div>

            <div className="mt-3 space-y-1">
              <h4 className="text-sm font-bold text-white">{targetCallPeer.name}</h4>
              <p className="text-xs text-neutral-400">Aguardando colega conectar o áudio/vídeo...</p>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="font-bold text-xs text-white bg-black/70 px-2.5 py-1 rounded-lg border border-white/10 truncate block">
                {targetCallPeer.name} (Chamando)
              </span>
            </div>
          </div>
        )}

        {/* Colegas Reais Online Detectados (Sem gerar dados fictícios) */}
        {activePeers.map((peer) => (
          <div
            key={peer.id}
            className="aspect-video rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-md relative overflow-hidden flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 flex items-center justify-center text-xl font-black">
              {peer.name.charAt(0)}
            </div>

            <div className="mt-2 space-y-0.5">
              <h4 className="text-xs font-bold text-[var(--app-text)]">{peer.name}</h4>
              <p className="text-[11px] text-[var(--app-text-muted)]">Conectado na plataforma</p>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="font-bold text-[11px] text-white bg-black/70 px-2 py-0.5 rounded-lg border border-white/10 truncate block">
                {peer.name}
              </span>
            </div>
          </div>
        ))}

        {/* Card Informativo Oficial da RNP Webconferência do IFES */}
        <div className="aspect-video rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[var(--app-primary)] font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Conferência Web RNP IFES</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--app-text)]">
              Salas Virtuais Oficiais do Instituto
            </h3>
            <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
              Para aulas oficiais, bancas e reuniões com professores do IFES, acesse diretamente o ambiente integrado da Rede Nacional de Pesquisa (RNP).
            </p>
          </div>

          <a
            href="https://conferenciaweb.rnp.br"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--app-primary)] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <span>Acessar Sala RNP IFES</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Barra de Controle de Chamada & Mídia */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--app-card)] border border-[var(--app-border)] shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Controles de Câmera e Microfone */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold cursor-pointer active:scale-95 ${
              isMicOn
                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
            }`}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            <span>{isMicOn ? "Microfone Ativo" : "Microfone Mudo"}</span>
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`px-4 py-2.5 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold cursor-pointer active:scale-95 ${
              isVideoOn
                ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                : "bg-[var(--app-bg)] text-[var(--app-text-muted)] border-[var(--app-border)]"
            }`}
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            <span>{isVideoOn ? "Câmera Ativa" : "Câmera Desligada"}</span>
          </button>
        </div>

        {/* Gerador de Som Ambiente Sintético de Foco */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[var(--app-text-muted)] font-medium">
            <Headphones className="w-4 h-4 text-[var(--app-primary)]" />
            <span>Som de Foco:</span>
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                ambientSound === s.id
                  ? "bg-[var(--app-primary)] text-white shadow-xs"
                  : "bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] border border-[var(--app-border)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Encerrar Chamada */}
        <button
          onClick={() => {
            stopMedia();
            stopAmbientSound();
            setIsInRoom(false);
            if (onClearTargetCallPeer) onClearTargetCallPeer();
          }}
          className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Encerrar Chamada</span>
        </button>
      </div>
    </div>
  );
};
