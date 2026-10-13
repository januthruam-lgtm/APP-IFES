import React, { useEffect, useState } from "react";
import {
  Users,
  X,
  Phone,
  Video,
  MessageSquare,
  Sparkles,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import { UserProfile } from "../../types";

export interface RealOnlineUser {
  id: string;
  name: string;
  level?: number;
  matricula?: string;
  campus?: string;
  courseName?: string;
  inCall?: boolean;
  isOnline: boolean;
  lastAccess: string;
}

interface OnlineUsersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onStartCall: (targetUser: RealOnlineUser, isVideo: boolean) => void;
  onOpenPrivateChat: (targetUser: RealOnlineUser) => void;
}

export const OnlineUsersDrawer: React.FC<OnlineUsersDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartCall,
  onOpenPrivateChat,
}) => {
  const [onlineUsers, setOnlineUsers] = useState<RealOnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOnlineUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/online-status");
      if (res.ok) {
        const data = await res.json();
        if (data.activeUsers && Array.isArray(data.activeUsers)) {
          // Filter to ensure only real names are displayed
          const cleanUsers = data.activeUsers.filter(
            (u: any) => u.name && u.name.trim() !== "" && u.name !== "Estudante"
          );
          setOnlineUsers(cleanUsers);
        }
      }
    } catch (e) {
      console.warn("Error fetching online status:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOnlineUsers();
      const interval = setInterval(fetchOnlineUsers, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="bg-[var(--app-card)] text-[var(--app-text)] w-full max-w-md h-full shadow-2xl border-l border-[var(--app-border)] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--app-border)] flex items-center justify-between bg-[var(--app-card-secondary)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[var(--app-text)]">
                  Conectados Agora
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineUsers.length}
                </span>
              </div>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Colegas do IFES ativos na plataforma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchOnlineUsers}
              className={`p-2 rounded-xl hover:bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer ${
                isLoading ? "animate-spin" : ""
              }`}
              title="Atualizar lista"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--app-bg)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {onlineUsers.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--app-card-secondary)] text-[var(--app-text-muted)] flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-[var(--app-text)]">
                Nenhum outro colega conectado no momento.
              </p>
              <p className="text-[11px] text-[var(--app-text-muted)] max-w-xs mx-auto">
                Assim que seus colegas abrirem o aplicativo, eles aparecerão aqui com status de presença e opções de chamada.
              </p>
            </div>
          ) : (
            onlineUsers.map((member) => {
              const isSelf =
                member.id === currentUser.id ||
                member.name.toLowerCase() === (currentUser.name || "").toLowerCase() ||
                (currentUser.ifesAccount?.matricula &&
                  member.matricula === currentUser.ifesAccount.matricula);

              return (
                <div
                  key={member.id}
                  className="p-3.5 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)]/60 hover:bg-[var(--app-card-secondary)] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {member.name ? member.name[0].toUpperCase() : "U"}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--app-card)]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--app-text)] truncate max-w-[140px] sm:max-w-[170px]">
                          {member.name}
                        </span>
                        {isSelf && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--app-primary)]/10 text-[var(--app-primary)] border border-[var(--app-primary)]/20">
                            Você
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--app-text-muted)] block truncate">
                        {member.campus || "IFES"} {member.matricula ? `• ${member.matricula}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons (Ligar e Mensagem Privada) beside EVERY user */}
                  {!isSelf && (
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => onStartCall(member, false)}
                        className="py-1.5 px-2.5 rounded-xl bg-[var(--app-card)] hover:bg-[var(--app-card-hover)] text-[var(--app-text)] border border-[var(--app-border)] text-[11px] font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        title={`Fazer chamada de voz com ${member.name}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Áudio</span>
                      </button>

                      <button
                        onClick={() => onStartCall(member, true)}
                        className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs shadow-emerald-600/20 cursor-pointer"
                        title={`Fazer chamada de vídeo com ${member.name}`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Vídeo</span>
                      </button>

                      <button
                        onClick={() => onOpenPrivateChat(member)}
                        className="py-1.5 px-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-xs shadow-[#00a884]/20 cursor-pointer"
                        title={`Enviar mensagem privada no estilo WhatsApp para ${member.name}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[var(--app-border)] bg-[var(--app-card-secondary)] text-[11px] text-[var(--app-text-muted)] text-center">
          Conexão ponto-a-ponto de alta fidelidade para estudo colaborativo.
        </div>
      </div>
    </div>
  );
};
