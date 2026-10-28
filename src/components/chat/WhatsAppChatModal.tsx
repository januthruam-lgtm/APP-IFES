import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Send,
  Smile,
  Paperclip,
  Check,
  CheckCheck,
  Mic,
  ArrowLeft,
  Volume2,
} from "lucide-react";
import {
  firestoreChatService,
  DirectMessageItem,
  getDirectChatId,
} from "../../services/firestoreChatService";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

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
}

const QUICK_EMOJIS = ["📚", "💡", "✍️", "👍", "🎯", "🚀", "⭐", "🔥", "🎓", "🧠"];

export const WhatsAppChatModal: React.FC<WhatsAppChatModalProps> = ({
  currentUserId,
  currentUserName,
  targetUser,
  onClose,
}) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [isTargetTyping, setIsTargetTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  const chatId = getDirectChatId(currentUserId, targetUser.id);

  // Microfone e transcrição de voz no idioma selecionado
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onTranscriptChange: (text) => {
      setInputText(text);
    },
    onFinalTranscript: (text) => {
      setInputText(text);
    },
  });

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

  const STUDY_PROMPTS = [
    t("chat_direto.atalhos_estudo", "Atalhos Acadêmicos"),
    "📚 Vamos revisar a matéria juntos?",
    "📝 Você já fez o questionário do AVA?",
    "💡 Tem dúvidas sobre o trabalho?",
    "⏰ Quando é o prazo final de entrega?",
  ];

  return (
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#efeae2] dark:bg-[#0b141a] rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full h-[640px] max-h-[92vh] flex flex-col border border-[var(--app-border)] relative">
        {/* WhatsApp Top Header Bar */}
        <div className="bg-[#075e54] dark:bg-[#202c33] text-white px-4 py-3 flex items-center justify-between shadow-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
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
                    <span>{t("chat_direto.digitando", { name: targetUser.name.split(" ")[0], defaultValue: `${targetUser.name.split(" ")[0]} está digitando...` })}</span>
                  </span>
                ) : (
                  <span className="text-emerald-200 dark:text-neutral-400">
                    online {targetUser.campus && `• ${targetUser.campus}`}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Close Button */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/15 transition cursor-pointer text-white"
              title={t("comum.fechar", "Fechar")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-60">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                💬
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {t("chat_direto.titulo", "Chat Acadêmico")} • {targetUser.name}
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[82%] sm:max-w-[70%] p-3 rounded-2xl text-xs shadow-xs relative ${
                      isMe
                        ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none"
                        : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none border border-neutral-200/40 dark:border-neutral-700/40"
                    }`}
                  >
                    <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-neutral-500 dark:text-neutral-400 mt-1">
                      <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {isMe && (
                        <span>
                          {msg.status === "read" ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-neutral-400 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Selector Bar */}
        {showEmojiPicker && (
          <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-2 border-t border-neutral-200/50 dark:border-neutral-700/50 flex items-center gap-2 overflow-x-auto">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="text-lg p-1 hover:scale-125 transition cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Footer Input Bar */}
        <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-2 sm:p-2.5 border-t border-neutral-200/50 dark:border-neutral-700/50 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowPrompts(false);
              }}
              className="p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white transition cursor-pointer"
              title="Emojis"
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
              title={t("chat_direto.atalhos_estudo", "Atalhos acadêmicos")}
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Microfone de Transcrição no Idioma Selecionado */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-full transition cursor-pointer shrink-0 ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
              }`}
              title={isListening ? t("chat_direto.ouvindo", "Ouvindo... Fale sua mensagem") : t("chat_direto.falar_mic", "Falar mensagem no microfone")}
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder={isTargetTyping ? `${targetUser.name.split(" ")[0]} está digitando...` : t("chat_direto.placeholder_msg", "Mensagem...")}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef] rounded-full text-xs outline-none shadow-xs border border-transparent focus:border-emerald-500 transition"
            />

            {inputText.trim() ? (
              <button
                type="submit"
                disabled={isSending}
                className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center transition shadow-md cursor-pointer shrink-0 disabled:opacity-50"
                title={t("chat_direto.enviar", "Enviar")}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setInputText("👍 Entendido!")}
                className="w-10 h-10 rounded-full bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 text-neutral-700 dark:text-white flex items-center justify-center transition cursor-pointer shrink-0"
                title={t("chat_direto.confirmacao_rapida", "Enviar confirmação rápida")}
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
