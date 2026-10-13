// src/services/realtimeCallService.ts
//
// Serviço Oficial de Chamadas em Tempo Real (WebRTC + WebSockets)
// Conexão direta entre navegadores com vídeo estável, áudio, compartilhamento de tela e chat privado.

export interface CallPeerInfo {
  id: string;
  name: string;
  avatar?: string;
  campus?: string;
  matricula?: string;
  isVideo?: boolean;
}

export interface IncomingCallEvent {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  isVideo: boolean;
}

export interface PrivateChatMessageItem {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: number;
  time: string;
  status: "sent" | "delivered" | "read";
}

export type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

class RealtimeCallService {
  private ws: WebSocket | null = null;
  private currentUserId: string = "";
  private currentUserName: string = "";
  private currentCampus: string = "";
  private currentMatricula: string = "";

  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private cameraStreamBackup: MediaStream | null = null;
  private screenStream: MediaStream | null = null;

  public activeCallId: string | null = null;
  public activeTargetPeer: CallPeerInfo | null = null;
  public callStatus: CallStatus = "idle";
  public isScreenSharing: boolean = false;
  public isAudioEnabled: boolean = true;
  public isVideoEnabled: boolean = true;

  // Listeners
  private incomingCallListeners: Set<(call: IncomingCallEvent) => void> = new Set();
  private callStatusListeners: Set<(status: CallStatus, peer?: CallPeerInfo | null) => void> = new Set();
  private localStreamListeners: Set<(stream: MediaStream | null) => void> = new Set();
  private remoteStreamListeners: Set<(stream: MediaStream | null) => void> = new Set();
  private screenShareListeners: Set<(isSharing: boolean) => void> = new Set();
  private privateMessageListeners: Set<(msg: PrivateChatMessageItem) => void> = new Set();
  private ringtoneInterval: any = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    // Lazy initialization
  }

  public init(userId: string, userName: string, campus: string = "IFES", matricula: string = "") {
    if (!userId) return;
    this.currentUserId = userId;
    this.currentUserName = userName;
    this.currentCampus = campus;
    this.currentMatricula = matricula;
    this.connectWebSocket();
  }

  private connectWebSocket() {
    if (typeof window === "undefined") return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/study-room`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        if (this.currentUserId) {
          this.sendWs({
            type: "register",
            userId: this.currentUserId,
            userName: this.currentUserName,
            campus: this.currentCampus,
            matricula: this.currentMatricula,
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWsMessage(data);
        } catch (e) {
          console.warn("[RealtimeCallService] WS parse error:", e);
        }
      };

      this.ws.onclose = () => {
        // Auto-reconnect with safety delay
        setTimeout(() => {
          this.connectWebSocket();
        }, 3000);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch (e) {
      console.warn("[RealtimeCallService] WS connection failed:", e);
    }
  }

  private sendWs(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private handleWsMessage(data: any) {
    const { type } = data;

    if (type === "incoming-call") {
      const { call } = data;
      this.startRingtone();
      this.callStatus = "ringing";
      this.activeCallId = call.callId;
      this.activeTargetPeer = {
        id: call.callerId,
        name: call.callerName,
        avatar: call.callerAvatar,
        isVideo: call.isVideo,
      };
      this.notifyCallStatus(this.callStatus, this.activeTargetPeer);
      this.notifyIncomingCall(call);
    } else if (type === "call-accepted") {
      this.stopRingtone();
      this.callStatus = "connected";
      this.notifyCallStatus(this.callStatus, this.activeTargetPeer);
      // Once call is accepted, create and send WebRTC offer
      this.createOfferAndSend();
    } else if (type === "call-rejected") {
      this.stopRingtone();
      this.callStatus = "ended";
      this.notifyCallStatus(this.callStatus, this.activeTargetPeer);
      this.cleanupMedia();
      setTimeout(() => {
        this.callStatus = "idle";
        this.activeCallId = null;
        this.activeTargetPeer = null;
        this.notifyCallStatus("idle", null);
      }, 2000);
    } else if (type === "direct-signal") {
      const { signal } = data;
      this.handleIncomingSignal(signal);
    } else if (type === "call-ended") {
      this.stopRingtone();
      this.callStatus = "ended";
      this.notifyCallStatus(this.callStatus, this.activeTargetPeer);
      this.cleanupMedia();
      setTimeout(() => {
        this.callStatus = "idle";
        this.activeCallId = null;
        this.activeTargetPeer = null;
        this.notifyCallStatus("idle", null);
      }, 1500);
    } else if (type === "new-private-message") {
      const { message } = data;
      this.notifyPrivateMessage(message);
    }
  }

  // Ringtone synthesizer via Web Audio API (Reliable in all browsers without external audio asset dependency)
  public startRingtone() {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      this.stopRingtone();
      const playChime = () => {
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;

        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(440, now); // A4
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.2);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(554.37, now); // C#5
        osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.2);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.6);
        osc2.stop(now + 0.6);
      };

      playChime();
      this.ringtoneInterval = setInterval(playChime, 2200);
    } catch {}
  }

  public stopRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  // INITIATE CALL
  public async startCall(targetPeer: CallPeerInfo, isVideo: boolean = true): Promise<string> {
    this.stopRingtone();
    this.cleanupMedia();

    const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    this.activeCallId = callId;
    this.activeTargetPeer = targetPeer;
    this.callStatus = "calling";
    this.isVideoEnabled = isVideo;
    this.isAudioEnabled = true;
    this.isScreenSharing = false;

    this.notifyCallStatus(this.callStatus, this.activeTargetPeer);

    // Initialize local media
    await this.setupLocalMedia(isVideo);

    // Setup peer connection
    this.setupPeerConnection();

    // Send call-user via WebSocket
    this.sendWs({
      type: "call-user",
      callId,
      callerId: this.currentUserId,
      callerName: this.currentUserName,
      targetUserId: targetPeer.id,
      isVideo,
    });

    // Also notify HTTP API as fallback
    try {
      fetch("/api/calls/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerId: this.currentUserId,
          callerName: this.currentUserName,
          receiverId: targetPeer.id,
          receiverName: targetPeer.name,
          isVideo,
        }),
      }).catch(() => {});
    } catch {}

    return callId;
  }

  // ACCEPT INCOMING CALL
  public async acceptCall(callId: string, caller: CallPeerInfo) {
    this.stopRingtone();
    this.activeCallId = callId;
    this.activeTargetPeer = caller;
    this.callStatus = "connected";
    this.isAudioEnabled = true;
    this.isVideoEnabled = caller.isVideo !== false;

    this.notifyCallStatus(this.callStatus, this.activeTargetPeer);

    // Setup local camera & mic
    await this.setupLocalMedia(this.isVideoEnabled);

    // Setup Peer Connection
    this.setupPeerConnection();

    // Send accept notification
    this.sendWs({
      type: "accept-call",
      callId,
      callerId: caller.id,
      targetUserId: this.currentUserId,
    });

    try {
      fetch("/api/calls/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, accept: true }),
      }).catch(() => {});
    } catch {}
  }

  // REJECT INCOMING CALL
  public rejectCall(callId: string, callerId: string, reason: string = "Ocupado") {
    this.stopRingtone();
    this.sendWs({
      type: "reject-call",
      callId,
      callerId,
      targetUserId: this.currentUserId,
      reason,
    });

    try {
      fetch("/api/calls/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, accept: false }),
      }).catch(() => {});
    } catch {}

    this.cleanupMedia();
    this.callStatus = "idle";
    this.activeCallId = null;
    this.activeTargetPeer = null;
    this.notifyCallStatus("idle", null);
  }

  // END ACTIVE CALL
  public endCall() {
    this.stopRingtone();
    if (this.activeCallId && this.activeTargetPeer) {
      this.sendWs({
        type: "end-call",
        callId: this.activeCallId,
        targetUserId: this.activeTargetPeer.id,
      });

      try {
        fetch("/api/calls/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callId: this.activeCallId }),
        }).catch(() => {});
      } catch {}
    }

    this.cleanupMedia();
    this.callStatus = "idle";
    this.activeCallId = null;
    this.activeTargetPeer = null;
    this.notifyCallStatus("idle", null);
  }

  // Local Media Capture
  private async setupLocalMedia(withVideo: boolean = true) {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: withVideo ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });

        this.localStream = stream;
        this.cameraStreamBackup = stream.clone();
        this.notifyLocalStream(stream);
      }
    } catch (err) {
      console.warn("[RealtimeCallService] getUserMedia error (camera/mic permission or headless):", err);
      // Create empty mock stream fallback so UI still renders smoothly without throwing
      const dummyCanvas = document.createElement("canvas");
      dummyCanvas.width = 640;
      dummyCanvas.height = 480;
      const ctx = dummyCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, 640, 480);
      }
      const stream = (dummyCanvas as any).captureStream ? (dummyCanvas as any).captureStream(10) : new MediaStream();
      this.localStream = stream;
      this.notifyLocalStream(stream);
    }
  }

  // Peer Connection Setup
  private setupPeerConnection() {
    if (typeof RTCPeerConnection === "undefined") return;

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Handle remote track
    this.remoteStream = new MediaStream();
    this.notifyRemoteStream(this.remoteStream);

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.notifyRemoteStream(this.remoteStream);
      } else {
        event.track.onunmute = () => {
          this.remoteStream?.addTrack(event.track);
          this.notifyRemoteStream(this.remoteStream);
        };
      }
    };

    // Handle ICE Candidate
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.activeTargetPeer && this.activeCallId) {
        this.sendWs({
          type: "direct-signal",
          callId: this.activeCallId,
          targetUserId: this.activeTargetPeer.id,
          signal: { type: "candidate", candidate: event.candidate },
        });

        fetch("/api/calls/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callId: this.activeCallId,
            targetUserId: this.activeTargetPeer.id,
            signal: { type: "candidate", candidate: event.candidate },
          }),
        }).catch(() => {});
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection?.connectionState === "connected") {
        this.callStatus = "connected";
        this.notifyCallStatus(this.callStatus, this.activeTargetPeer);
      } else if (
        this.peerConnection?.connectionState === "disconnected" ||
        this.peerConnection?.connectionState === "failed" ||
        this.peerConnection?.connectionState === "closed"
      ) {
        if (this.callStatus === "connected") {
          this.endCall();
        }
      }
    };
  }

  // Create WebRTC Offer
  private async createOfferAndSend() {
    if (!this.peerConnection || !this.activeTargetPeer || !this.activeCallId) return;

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.peerConnection.setLocalDescription(offer);

      this.sendWs({
        type: "direct-signal",
        callId: this.activeCallId,
        targetUserId: this.activeTargetPeer.id,
        signal: { type: "offer", sdp: offer },
      });

      fetch("/api/calls/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId: this.activeCallId,
          targetUserId: this.activeTargetPeer.id,
          signal: { type: "offer", sdp: offer },
        }),
      }).catch(() => {});
    } catch (e) {
      console.warn("[RealtimeCallService] Failed to create offer:", e);
    }
  }

  // Handle incoming signaling (Offer, Answer, ICE Candidate)
  private async handleIncomingSignal(signal: any) {
    if (!this.peerConnection || !signal) return;

    try {
      if (signal.type === "offer") {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        if (this.activeTargetPeer && this.activeCallId) {
          this.sendWs({
            type: "direct-signal",
            callId: this.activeCallId,
            targetUserId: this.activeTargetPeer.id,
            signal: { type: "answer", sdp: answer },
          });

          fetch("/api/calls/signal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callId: this.activeCallId,
              targetUserId: this.activeTargetPeer.id,
              signal: { type: "answer", sdp: answer },
            }),
          }).catch(() => {});
        }
      } else if (signal.type === "answer") {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === "candidate" && signal.candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (e) {
      console.warn("[RealtimeCallService] Error applying signal:", e);
    }
  }

  // Toggle Mute Audio
  public toggleAudio(): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isAudioEnabled = audioTrack.enabled;
      return this.isAudioEnabled;
    }
    return false;
  }

  // Toggle Video Camera
  public toggleVideo(): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.isVideoEnabled = videoTrack.enabled;
      return this.isVideoEnabled;
    }
    return false;
  }

  // Toggle Screen Sharing
  public async toggleScreenShare(): Promise<boolean> {
    if (this.isScreenSharing) {
      // Revert back to camera stream
      if (this.screenStream) {
        this.screenStream.getTracks().forEach((t) => t.stop());
        this.screenStream = null;
      }

      if (this.cameraStreamBackup) {
        const cameraVideoTrack = this.cameraStreamBackup.getVideoTracks()[0];
        if (cameraVideoTrack && this.peerConnection) {
          const senders = this.peerConnection.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(cameraVideoTrack);
          }
          this.localStream = this.cameraStreamBackup;
          this.notifyLocalStream(this.localStream);
        }
      }

      this.isScreenSharing = false;
      this.notifyScreenShare(false);
      return false;
    } else {
      // Start Screen Capture
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          console.warn("[RealtimeCallService] Compartilhamento de tela não suportado neste navegador.");
          return false;
        }

        let screenStream: MediaStream;
        try {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
        } catch {
          screenStream = await (navigator.mediaDevices as any).getDisplayMedia();
        }

        this.screenStream = screenStream;
        const screenVideoTrack = screenStream.getVideoTracks()[0];

        // Replace track on RTCPeerConnection sender
        if (this.peerConnection && screenVideoTrack) {
          const senders = this.peerConnection.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(screenVideoTrack);
          }
        }

        this.notifyLocalStream(screenStream);
        this.isScreenSharing = true;
        this.notifyScreenShare(true);

        // When user clicks the browser's native "Stop sharing" button
        screenVideoTrack.onended = () => {
          this.toggleScreenShare();
        };

        return true;
      } catch (err) {
        console.warn("[RealtimeCallService] Screen share canceled or failed:", err);
        return false;
      }
    }
  }

  // Send Private WhatsApp Message
  public async sendPrivateMessage(receiverId: string, text: string): Promise<PrivateChatMessageItem> {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const msg: PrivateChatMessageItem = {
      id: `pmsg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      chatId: [this.currentUserId, receiverId].sort().join("__"),
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      receiverId,
      text: text.trim(),
      timestamp: Date.now(),
      time: formattedTime,
      status: "sent",
    };

    // Emit via WebSocket
    this.sendWs({
      type: "send-private-message",
      message: msg,
    });

    // Fallback HTTP POST
    try {
      fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      }).catch(() => {});
    } catch {}

    return msg;
  }

  // Cleanup all media resources
  private cleanupMedia() {
    this.stopRingtone();
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.cameraStreamBackup) {
      this.cameraStreamBackup.getTracks().forEach((t) => t.stop());
      this.cameraStreamBackup = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.isScreenSharing = false;

    this.notifyLocalStream(null);
    this.notifyRemoteStream(null);
    this.notifyScreenShare(false);
  }

  // Subscribe methods
  public onIncomingCall(cb: (call: IncomingCallEvent) => void) {
    this.incomingCallListeners.add(cb);
    return () => this.incomingCallListeners.delete(cb);
  }

  public onCallStatusChange(cb: (status: CallStatus, peer?: CallPeerInfo | null) => void) {
    this.callStatusListeners.add(cb);
    return () => this.callStatusListeners.delete(cb);
  }

  public onLocalStreamChange(cb: (stream: MediaStream | null) => void) {
    this.localStreamListeners.add(cb);
    return () => this.localStreamListeners.delete(cb);
  }

  public onRemoteStreamChange(cb: (stream: MediaStream | null) => void) {
    this.remoteStreamListeners.add(cb);
    return () => this.remoteStreamListeners.delete(cb);
  }

  public onScreenShareChange(cb: (isSharing: boolean) => void) {
    this.screenShareListeners.add(cb);
    return () => this.screenShareListeners.delete(cb);
  }

  public onPrivateMessage(cb: (msg: PrivateChatMessageItem) => void) {
    this.privateMessageListeners.add(cb);
    return () => this.privateMessageListeners.delete(cb);
  }

  private notifyIncomingCall(call: IncomingCallEvent) {
    this.incomingCallListeners.forEach((cb) => cb(call));
  }

  private notifyCallStatus(status: CallStatus, peer?: CallPeerInfo | null) {
    this.callStatusListeners.forEach((cb) => cb(status, peer));
  }

  private notifyLocalStream(stream: MediaStream | null) {
    this.localStreamListeners.forEach((cb) => cb(stream));
  }

  private notifyRemoteStream(stream: MediaStream | null) {
    this.remoteStreamListeners.forEach((cb) => cb(stream));
  }

  private notifyScreenShare(isSharing: boolean) {
    this.screenShareListeners.forEach((cb) => cb(isSharing));
  }

  private notifyPrivateMessage(msg: PrivateChatMessageItem) {
    this.privateMessageListeners.forEach((cb) => cb(msg));
  }
}

export const realtimeCallService = new RealtimeCallService();
