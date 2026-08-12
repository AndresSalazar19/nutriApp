import { useEffect, useRef, useState } from 'react';
import { FiSend } from 'react-icons/fi';

import { ConversationResponse, MessageResponse } from '../../services/Chats/chatService';

interface Props {
  conversation?: ConversationResponse | null;
  messages: MessageResponse[];
  loading?: boolean;
  connected?: boolean;
  otherTyping: boolean;
  otherOnline: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendError: string | null;
  notifyTyping: () => void;
  notifyStopTyping: () => void;
  notifyRead: () => void;
}

const ChatPanel = ({
  conversation,
  messages,
  loading,
  connected,
  otherTyping,
  otherOnline,
  sendMessage,
  sendError,
  notifyTyping,
  notifyStopTyping,
  notifyRead,
}: Props) => {
  const [message, setMessage] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const lastReadMessageRef = useRef<string | null>(null);
  const conversationId = conversation?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // Marcar mensajes como leídos cuando el chat está abierto
  useEffect(() => {
    if (!conversationId || !connected || loading) return;

    const lastUnread = [...messages]
      .reverse()
      .find((m) => m.sender_role === 'patient' && !m.read_at);

    if (!lastUnread) return;
    if (lastReadMessageRef.current === lastUnread.id) return;
    lastReadMessageRef.current = lastUnread.id;

    notifyRead();
  }, [conversationId, messages, connected, loading, notifyRead]);

  const handleChangeMessage = (value: string) => {
    setMessage(value);

    if (!value.trim()) {
      if (isTypingRef.current) {
        notifyStopTyping();
        isTypingRef.current = false;
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      return;
    }

    if (!isTypingRef.current) {
      notifyTyping();
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      notifyStopTyping();
      isTypingRef.current = false;
    }, 1000);
  };

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage(message);
    setMessage('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTypingRef.current) {
      notifyStopTyping();
      isTypingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return '';

    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      notifyStopTyping();
    };
  }, [notifyStopTyping]);

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#F4F7F1]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#1B241C]">Selecciona una conversación</h2>
          <p className="mt-2 text-[#6D796C]">Selecciona un paciente para comenzar a conversar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#F4F7F1]">
      <div className="flex items-center justify-between border-b border-[#E1E8DC] bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          {conversation.participant_avatar ? (
            <img
              src={conversation.participant_avatar}
              alt={conversation.participant_name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4C9A6A] to-[#1F4D3A] font-semibold text-white">
              {getInitials(conversation.participant_name)}
            </div>
          )}

          <div>
            <h2 className="font-semibold text-[#1B241C]">{conversation.participant_name}</h2>

            <span className="flex items-center gap-2 text-sm text-[#6D796C]">
              <span
                className={`h-2 w-2 rounded-full ${otherOnline ? 'bg-green-500' : 'bg-gray-400'}`}
              />

              {otherTyping ? 'Escribiendo...' : otherOnline ? 'En línea' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center text-sm text-[#9AA396]">Cargando mensajes...</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_role === 'nutritionist' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-lg rounded-2xl px-5 py-3 shadow-sm ${
                  msg.sender_role === 'nutritionist'
                    ? 'rounded-br-md bg-[#4C9A6A] text-white'
                    : 'rounded-bl-md border border-[#E1E8DC] bg-white text-[#1B241C]'
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>

                <div className="mt-2 flex justify-end gap-2 text-xs">
                  {formatTime(msg.sent_at)}

                  {msg.sender_role === 'nutritionist' && <span>{msg.read_at ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[#E1E8DC] bg-white p-5">
        {sendError && <p className="mb-2 text-sm text-red-600">{sendError}</p>}

        <div className="flex items-center gap-3 rounded-full border border-[#E1E8DC] bg-[#FAFBF8] px-4 py-2">
          <input
            value={message}
            onChange={(e) => handleChangeMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!connected}
            className="flex-1 bg-transparent outline-none placeholder:text-[#9AA396]"
            placeholder={connected ? 'Escribe un mensaje...' : 'Esperando conexión...'}
          />

          <button
            onClick={handleSend}
            disabled={!connected}
            className="rounded-full bg-[#1F4D3A] p-3 text-white transition hover:bg-[#173B2C] disabled:opacity-50"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
