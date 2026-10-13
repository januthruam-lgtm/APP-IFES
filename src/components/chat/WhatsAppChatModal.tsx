import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Phone,
  Video,
  Send,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Mic,
  MoreVertical,
  ArrowLeft,
  BookOpen,
  Volume2,
  Sparkles,
} from "lucide-react";
import {
  firestoreChatService,
  DirectMessageItem,
  getDirectChatId,
} from "../../services/firestoreChatService";

interface WhatsAppChatModalProps {
  currentUserId: string;
  currentUserName: string;
  targetUser: {
    id: string;
    name: string;
    avatar?: string;
    campus?: string;
    isOnline?: boolean;
  };
  onClose: () => void;
  onStartCall: (targetUser: any, isVideo: boolean) => void;
}

const QUICK_EMOJIS = ["📚", "💡", "✍️", "👍", "🎯", "🚀", "⭐", "🔥", "🎓", "🧠"];
const STUDY_PROMPTS = [
  "📚 Vamos revisar a matéria juntos?",
  "📝 Você já fez o questionário do AVA?",
  "💡 Tem dúvidas sobre o trabalho?",
  "⏰ Quando é o prazo final de entrega?",
];

export const WhatsAppChatModal: React.FC<WhatsAppChatModalProps> = ({
  currentUserId,
  currentUserName,
  targetUser,
  onClose,
  onStartCall,
}) => {
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [isTargetTyping, setIsTargetTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  const chatId = getDirectChatId(currentUserId, targetUser.id);

  // 1. Escuta mensagens em tempo real no Firestore e marca automaticamente como lidas ("Visto")
  useEffect(() => {
    if (!currentUserId || !targetUser?.id) return;

    const unsubscribeMessages = firestoreChatService.subscribeDirectMessages(
      currentUserId,
      targetUser.id,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    // 2. Escuta indicador de digitação ("digitando...") do interlocutor
    const unsubscribeTyping = firestoreChatService.subscribeTypingStatus(
      chatId,
      currentUserId,
      (isTyping) => {
        setIsTargetTyping(isTyping);
      }
    );

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      // Reseta estado de digitação do usuário ao fechar
      firestoreChatService.setTypingStatus(chatId, currentUserId, currentUserName, false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [currentUserId, targetUser.id, chatId, currentUserName]);

  // Scroll suave até a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTargetTyping]);

  // Envia status de digitação quando o usuário digita
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    // Atualiza status "digitando..." no Firestore
    firestoreChatService.setTypingStatus(chatId, currentUserId, currentUserName, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      firestoreChatService.setTypingStatus(chatId, currentUserId, currentUserName, false);
    }, 2200);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setShowEmojiPicker(false);
    setShowPrompts(false);
    setIsSending(true);

    // Cancela status digitando
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    firestoreChatService.setTypingStatus(chatId, currentUserId, currentUserName, false);

    try {
      await firestoreChatService.sendDirectMessage({
        senderId: currentUserId,
        senderName: currentUserName,
        receiverId: targetUser.id,
        text: textToSend,
      });
    } catch (err) {
      console.warn("Erro ao enviar mensagem no Firestore:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  const handleAddPrompt = (prompt: string) => {
    setInputText(prompt);
    setShowPrompts(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#efeae2] dark:bg-[#0b141a] rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full h-[640px] max-h-[92vh] flex flex-col border border-[var(--app-border)] relative">
        {/* WhatsApp Top Header Bar */}
        <div className="bg-[#075e54] dark:bg-[#202c33] text-white px-4 py-3 flex items-center justify-between shadow-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition cursor-pointer text-white sm:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm text-sm">
                {targetUser.name ? targetUser.name[0].toUpperCase() : "U"}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#075e54] dark:border-[#202c33] ${
                  isTargetTyping ? "bg-emerald-300 animate-pulse" : "bg-emerald-400"
                }`}
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs">
                {targetUser.name}
              </h3>
              <p className="text-[11px] font-medium flex items-center gap-1">
                {isTargetTyping ? (
                  <span className="text-emerald-300 font-bold animate-pulse flex items-center gap-1">
                    <span>digitando</span>
                    <span className="inline-flex gap-0.5">
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                      <span className="animate-bounce delay-300">.</span>
                    </span>
                  </span>
                ) : (
                  <span className="text-emerald-200 dark:text-neutral-400">
                    online {targetUser.campus && `• ${targetUser.campus}`}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Call & Close Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onStartCall(targetUser, true)}
              className="p-2 rounded-full hover:bg-white/15 text-white transition cursor-pointer"
              title="Fazer chamada de vídeo"
            >
              <Video className="w-4 h-4" />
            </button>

            <button
              onClick={() => onStartCall(targetUser, false)}
              className="p-2 rounded-full hover:bg-white/15 text-white transition cursor-pointer"
              title="Fazer chamada de áudio"
            >
              <Phone className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/15 text-white transition cursor-pointer ml-1"
              title="Fechar conversa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WhatsApp Background Pattern & Message List */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-2.5 relative"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(0,0,0,0.035) 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
          }}
        >
          {/* Day Divider Pill */}
          <div className="flex justify-center my-1.5">
            <span className="px-3 py-0.5 rounded-lg bg-white/85 dark:bg-[#182229] text-[10px] font-bold text-neutral-600 dark:text-neutral-300 shadow-2xs border border-neutral-200/50 dark:border-neutral-700/50 uppercase tracking-wider">
              Criptografia de Ponta a Ponta via Firestore
            </span>
          </div>

          {/* Messages */}
          {messages.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-[#00a884]/15 text-[#00a884] flex items-center justify-center mx-auto shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Inicie uma conversa de estudos com {targetUser.name}!
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                Tire dúvidas de matérias, organize grupos e estude em equipe com confirmação de visualização em tempo real.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === currentUserId;
              const isRead = m.status === "read";

              return (
                <div
                  key={m.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-150`}
                >
                  <div
                    className={`max-w-[78%] sm:max-w-[72%] rounded-2xl px-3.5 py-2 text-xs shadow-xs relative break-words leading-relaxed ${
                      isMe
                        ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                        : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none border border-neutral-200/40 dark:border-neutral-700/40"
                    }`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-extrabold text-[#00a884] dark:text-emerald-400 block mb-0.5">
                        {m.senderName}
                      </span>
                    )}

                    <p className="text-[13px] whitespace-pre-wrap">{m.text}</p>

                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-neutral-500 dark:text-neutral-400 float-right ml-3 select-none">
                      <span>{m.timeFormatted || "agora"}</span>

                      {/* Status de Entrega e Visto (Checkmarks estilo WhatsApp) */}
                      {isMe && (
                        <span>
                          {isRead ? (
                            // Duplo Check Azul (VISTO)
                            <span title="Visualizado (Visto)">
                              <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                            </span>
                          ) : m.status === "delivered" ? (
                            // Duplo Check Cinza (ENTREGUE)
                            <span title="Entregue">
                              <CheckCheck className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                            </span>
                          ) : (
                            // Check Único Cinza (ENVIADO)
                            <span title="Enviado">
                              <Check className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Floating Typing Indicator Bubble */}
          {isTargetTyping && (
            <div className="flex justify-start animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#202c33] text-neutral-600 dark:text-neutral-300 rounded-2xl rounded-tl-none px-4 py-2 text-xs shadow-xs border border-neutral-200/40 dark:border-neutral-700/40 flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {targetUser.name.split(" ")[0]} está digitando
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-75" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-300" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Study Prompts Drawer */}
        {showPrompts && (
          <div className="bg-white dark:bg-[#202c33] border-t border-[var(--app-border)] p-2.5 space-y-1.5 animate-in slide-in-from-bottom-2 duration-150">
            <span className="text-[10px] font-bold uppercase text-[var(--app-text-muted)] px-1">
              Sugestões Rápidas de Estudo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STUDY_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleAddPrompt(prompt)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold transition cursor-pointer border border-emerald-500/20"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Emojis Drawer */}
        {showEmojiPicker && (
          <div className="bg-white dark:bg-[#202c33] border-t border-[var(--app-border)] p-2 flex items-center justify-around gap-1 animate-in slide-in-from-bottom-2 duration-150">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="text-lg hover:scale-125 transition p-1 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* WhatsApp Footer Input Bar */}
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-2 sm:p-2.5 border-t border-neutral-200/50 dark:border-neutral-700/50 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowPrompts(false);
              }}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white transition cursor-pointer"
              title="Emojis rápidos"
            >
              <Smile className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPrompts(!showPrompts);
                setShowEmojiPicker(false);
              }}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white transition cursor-pointer"
              title="Atalhos acadêmicos"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={isTargetTyping ? `${targetUser.name.split(" ")[0]} está digitando...` : "Mensagem..."}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef] rounded-full text-xs outline-none shadow-xs border border-transparent focus:border-emerald-500 transition"
            />

            {inputText.trim() ? (
              <button
                type="submit"
                disabled={isSending}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center transition shadow-md cursor-pointer shrink-0 disabled:opacity-50"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setInputText("👍 Entendido!")}
                className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 text-neutral-700 dark:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                title="Enviar confirmação rápida"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppChatModal;
