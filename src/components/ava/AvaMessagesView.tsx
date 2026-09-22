import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Bell,
  CheckCircle2,
  Calendar,
  AlertCircle,
  User,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { avaApiClient } from "../../utils/avaApi";

interface AvaMessagesViewProps {
  campusName: string;
}

export const AvaMessagesView: React.FC<AvaMessagesViewProps> = ({ campusName }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await avaApiClient.getMessages(campusName);
      if (Array.isArray(data) && data.length > 0) {
        setMessages(data);
      }
    } catch (e) {
      console.warn("Erro ao buscar avisos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [campusName]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--app-primary)]/15 text-[var(--app-primary)] flex items-center justify-center border border-[var(--app-primary)]/30">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--app-text)]">Mural de Avisos & Comunicados</h3>
            <p className="text-xs text-[var(--app-text-muted)]">
              Notificações oficiais da coordenação e mensagens do AVA ({campusName})
            </p>
          </div>
        </div>

        <button
          onClick={fetchMessages}
          disabled={isLoading}
          className="px-3 py-1.5 bg-[var(--app-card-secondary)] hover:bg-[var(--app-card-hover)] text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] rounded-xl transition border border-[var(--app-border)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[var(--app-primary)]" : ""}`} />
          <span>Atualizar Avisos</span>
        </button>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="p-8 text-center bg-[var(--app-card)] border border-[var(--app-border)] rounded-2xl space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[var(--app-success)] mx-auto" />
            <p className="text-sm font-bold text-[var(--app-text)]">Nenhum novo comunicado no momento</p>
            <p className="text-xs text-[var(--app-text-muted)]">Você está atualizado com todos os avisos do seu campus!</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className="bg-[var(--app-card)] border border-[var(--app-border)] hover:border-[var(--app-primary)]/30 rounded-2xl p-5 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--app-card-secondary)] flex items-center justify-center text-xs font-bold text-[var(--app-text)] border border-[var(--app-border)]">
                    <User className="w-4 h-4 text-[var(--app-primary)]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--app-text)] block">{m.author}</span>
                    <span className="text-[10px] text-[var(--app-text-muted)]">{m.date}</span>
                  </div>
                </div>
                {m.priority === "high" && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Importante
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-[var(--app-text)]">{m.subject}</h4>
              <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">{m.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
