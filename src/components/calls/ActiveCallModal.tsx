import React, { useEffect, useRef, useState } from "react";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  ScreenShare,
  Maximize2,
  Minimize2,
  ShieldCheck,
  User,
  Sparkles,
} from "lucide-react";
import {
  realtimeCallService,
  CallPeerInfo,
  CallStatus,
  IncomingCallEvent,
} from "../../services/realtimeCallService";

interface ActiveCallModalProps {
  currentUserId: string;
  currentUserName: string;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  currentUserId,
  currentUserName,
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [targetPeer, setTargetPeer] = useState<CallPeerInfo | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallEvent | null>(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize service on mount
  useEffect(() => {
    if (currentUserId) {
      realtimeCallService.init(currentUserId, currentUserName);
    }

    const unsubIncoming = realtimeCallService.onIncomingCall((call) => {
      setIncomingCall(call);
    });

    const unsubStatus = realtimeCallService.onCallStatusChange((status, peer) => {
      setCallStatus(status);
      if (peer) setTargetPeer(peer);
      if (status === "idle" || status === "ended") {
        setIncomingCall(null);
        setCallSeconds(0);
        setIsScreenSharing(false);
      }
    });

    const unsubLocal = realtimeCallService.onLocalStreamChange((stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    });

    const unsubRemote = realtimeCallService.onRemoteStreamChange((stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    const unsubScreen = realtimeCallService.onScreenShareChange((sharing) => {
      setIsScreenSharing(sharing);
    });

    return () => {
      unsubIncoming();
      unsubStatus();
      unsubLocal();
      unsubRemote();
      unsubScreen();
    };
  }, [currentUserId, currentUserName]);

  // Call duration counter
  useEffect(() => {
    let interval: any = null;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAccept = () => {
    if (incomingCall) {
      realtimeCallService.acceptCall(incomingCall.callId, {
        id: incomingCall.callerId,
        name: incomingCall.callerName,
        avatar: incomingCall.callerAvatar,
        isVideo: incomingCall.isVideo,
      });
      setIncomingCall(null);
    }
  };

  const handleReject = () => {
    if (incomingCall) {
      realtimeCallService.rejectCall(incomingCall.callId, incomingCall.callerId);
      setIncomingCall(null);
    }
  };

  const handleEndCall = () => {
    realtimeCallService.endCall();
  };

  const handleToggleMic = () => {
    const enabled = realtimeCallService.toggleAudio();
    setIsMicOn(enabled);
  };

  const handleToggleVideo = () => {
    const enabled = realtimeCallService.toggleVideo();
    setIsVideoOn(enabled);
  };

  const handleToggleScreenShare = async () => {
    const sharing = await realtimeCallService.toggleScreenShare();
    setIsScreenSharing(sharing);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // If there's an incoming call ringing
  if (incomingCall && callStatus === "ringing") {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-[var(--app-card)] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Pulsing ring aura */}
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none animate-pulse" />

          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-lg relative z-10 border-2 border-white/20">
              {incomingCall.callerName ? incomingCall.callerName[0].toUpperCase() : "C"}
            </div>
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-lg font-black text-[var(--app-text)]">
              {incomingCall.callerName}
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5">
              <Video className="w-3.5 h-3.5 animate-bounce" />
              <span>Chamada de vídeo recebida...</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 relative z-10">
            <button
              onClick={handleReject}
              className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Recusar</span>
            </button>

            <button
              onClick={handleAccept}
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/30 animate-pulse cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Atender</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If in calling, connected, or ended state
  if (callStatus === "idle") return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between text-white z-20 bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white shadow-md">
            {targetPeer?.name ? targetPeer.name[0].toUpperCase() : "C"}
          </div>
          <div>
            <h4 className="text-sm font-bold truncate max-w-[200px] sm:max-w-md">
              {targetPeer?.name || "Colega IFES"}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-neutral-300">
              {callStatus === "calling" ? (
                <span className="text-amber-400 font-semibold animate-pulse">Chamando...</span>
              ) : callStatus === "connected" ? (
                <span className="text-emerald-400 font-mono font-bold">{formatTimer(callSeconds)}</span>
              ) : (
                <span className="text-neutral-400">Chamada encerrada</span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> WebRTC P2P
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
            title="Tela cheia"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative my-3 rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
        {/* Remote Video Stream (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-contain ${callStatus === "connected" ? "block" : "hidden"}`}
        />

        {/* Remote Video Placeholder when video is off or calling */}
        {callStatus === "calling" && (
          <div className="text-center space-y-4 p-6">
            <div className="relative mx-auto w-28 h-28">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="w-28 h-28 rounded-full bg-neutral-800 border-2 border-emerald-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl relative z-10">
                {targetPeer?.name ? targetPeer.name[0].toUpperCase() : "C"}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Chamando {targetPeer?.name}...</h3>
              <p className="text-xs text-neutral-400">Aguardando atendimento...</p>
            </div>
          </div>
        )}

        {/* Local Video Stream (Picture-in-Picture) */}
        <div className="absolute bottom-4 right-4 w-36 sm:w-56 aspect-video bg-neutral-900 border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl z-20 group">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoOn || isScreenSharing ? "block" : "hidden"}`}
          />
          {!(isVideoOn || isScreenSharing) && (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1 bg-neutral-800">
              <VideoOff className="w-5 h-5 text-neutral-500" />
              <span className="text-[10px] font-semibold">Câmera desativada</span>
            </div>
          )}
          <div className="absolute bottom-1.5 left-2 text-[9px] font-bold text-white/90 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
            Você
          </div>
        </div>
      </div>

      {/* Floating Bottom Controls Toolbar */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 z-20 bg-black/50 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-white/10 max-w-lg mx-auto w-full">
        <button
          onClick={handleToggleMic}
          className={`p-3.5 sm:p-4 rounded-2xl font-bold transition flex items-center justify-center cursor-pointer ${
            isMicOn
              ? "bg-neutral-800 hover:bg-neutral-700 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          title={isMicOn ? "Silenciar microfone" : "Ativar microfone"}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={handleToggleVideo}
          className={`p-3.5 sm:p-4 rounded-2xl font-bold transition flex items-center justify-center cursor-pointer ${
            isVideoOn
              ? "bg-neutral-800 hover:bg-neutral-700 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
          title={isVideoOn ? "Desativar câmera" : "Ligar câmera"}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={handleToggleScreenShare}
          className={`p-3.5 sm:p-4 rounded-2xl font-bold transition flex items-center justify-center cursor-pointer ${
            isScreenSharing
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30"
              : "bg-neutral-800 hover:bg-neutral-700 text-white"
          }`}
          title={isScreenSharing ? "Parar compartilhamento" : "Compartilhar tela"}
        >
          <ScreenShare className="w-5 h-5" />
        </button>

        <button
          onClick={handleEndCall}
          className="p-3.5 sm:p-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center justify-center shadow-lg shadow-red-600/30 cursor-pointer"
          title="Encerrar ligação"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
