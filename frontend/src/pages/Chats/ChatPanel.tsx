import { useEffect, useRef, useState } from 'react';
import { FiMoreVertical, FiPaperclip, FiSend } from 'react-icons/fi';

import { ConversationResponse, MessageResponse } from '../../services/Chats/chatService';

interface Props {
  conversation?: ConversationResponse | null;
  messages: MessageResponse[];
  loading?: boolean;
  connected?: boolean;
  sendMessage: (content: string) => void;
}

const ChatPanel = ({ conversation, messages, loading, connected, sendMessage }: Props) => {
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage('');
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSend();
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
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#E1E8DC] bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          {conversation.participant_avatar_url ? (
            <img
              src={conversation.participant_avatar_url}
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
              <span className="h-2 w-2 rounded-full bg-[#3E8E5D]" />
              Conversación activa
            </span>
          </div>
        </div>
        <button className="rounded-full p-2 text-[#6D796C] hover:bg-[#F4F7F1]">
          <FiMoreVertical />
        </button>
      </div>

      {/* MENSAJES */}
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
                <div
                  className={`mt-2 flex justify-end gap-2 text-xs ${
                    msg.sender_role === 'nutritionist' ? 'text-white/70' : 'text-[#9AA396]'
                  }`}
                >
                  {formatTime(msg.sent_at)}

                  {msg.sender_role === 'nutritionist' && <span>{msg.read_at ? '✓✓' : '✓'}</span>}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-[#E1E8DC] bg-white p-5">
        <div className="flex items-center gap-3 rounded-full border border-[#E1E8DC] bg-[#FAFBF8] px-4 py-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!connected}
            className="flex-1 bg-transparent outline-none placeholder:text-[#9AA396]"
            placeholder={connected ? 'Escribe un mensaje...' : 'Esperando conexión...'}
          />

          <button className="text-[#6D796C]">
            <FiPaperclip />
          </button>

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
