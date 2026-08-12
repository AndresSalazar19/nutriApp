import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatService, MessageResponse } from '../services/Chats/chatService';
import { ChatSocket, SocketMessage } from '../services/Chats/websocket';

interface UseChatReturn {
  messages: MessageResponse[];
  loading: boolean;
  connected: boolean;
  otherTyping: boolean;
  otherOnline: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendError: string | null;
  notifyTyping: () => void;
  notifyStopTyping: () => void;
  notifyRead: () => void;
  reloadMessages: () => Promise<void>;
}

export const useChat = (
  conversationId?: string,
  otherParticipantId?: string,
  handleIncomingMessage?: (message: MessageResponse) => void,
): UseChatReturn => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const socketRef = useRef<ChatSocket | null>(null);
  const otherParticipantIdRef = useRef(otherParticipantId);
  useEffect(() => {
    otherParticipantIdRef.current = otherParticipantId;
  }, [otherParticipantId]);

  const handleIncomingMessageRef = useRef(handleIncomingMessage);
  useEffect(() => {
    handleIncomingMessageRef.current = handleIncomingMessage;
  }, [handleIncomingMessage]);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);

      const response = await ChatService.getMessages(conversationId);

      setMessages(response.messages);
      socketRef.current?.sendRead();
    } catch (error) {
      console.error('Error cargando mensajes', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    setOtherOnline(false);
    setOtherTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    const socket = new ChatSocket();
    socketRef.current = socket;

    socket.connect(
      conversationId,

      (event: SocketMessage) => {
        switch (event.type) {
          case 'message': {
            const message = event as MessageResponse;
            setMessages((prev) => {
              if (prev.some((m) => m.id === event.id)) {
                return prev;
              }

              const optimisticIndex = prev.findIndex(
                (m) => m.id.startsWith('local-') && m.content === event.content,
              );

              const next = [...prev];

              if (optimisticIndex !== -1) {
                next[optimisticIndex] = event as MessageResponse;
                return next;
              }

              return [...next, event as MessageResponse];
            });

            if (message.sender_role === 'patient') {
              socketRef.current?.sendRead();
            }

            handleIncomingMessageRef.current?.(message);
            break;
          }

          case 'typing':
            if (event.user_id !== otherParticipantIdRef.current) break;

            setOtherTyping(true);
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
              setOtherTyping(false);
            }, 3000);
            break;

          case 'stop_typing':
            if (event.user_id !== otherParticipantIdRef.current) break;
            setOtherTyping(false);
            break;

          case 'read':
            setMessages((prev) =>
              prev.map((m) =>
                m.sender_role === 'nutritionist' && !m.read_at
                  ? {
                      ...m,
                      read_at: new Date().toISOString(),
                    }
                  : m,
              ),
            );
            break;

          case 'user_connected':
            if (event.user_id === otherParticipantIdRef.current) {
              setOtherOnline(true);
            }
            break;

          case 'user_disconnected':
            if (event.user_id === otherParticipantIdRef.current) {
              setOtherOnline(false);
            }
            break;

          default:
            break;
        }
      },

      () => {
        setConnected(true);
        loadMessages();
      },

      () => {
        setConnected(false);
      },

      () => {
        setConnected(false);
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, loadMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !conversationId) return;

      const localId = `local-${Date.now()}`;
      const optimistic: MessageResponse = {
        id: localId,
        conversation_id: conversationId,
        sender_id: 'me',
        sender_role: 'nutritionist',
        content: trimmed,
        sent_at: new Date().toISOString(),
        read_at: null,
      };

      setMessages((prev) => [...prev, optimistic]);
      handleIncomingMessageRef.current?.(optimistic);
      setSendError(null);

      if (socketRef.current?.isConnected()) {
        socketRef.current.sendMessage(trimmed);
        return;
      }

      // Socket caído: se envía por REST. El backend hace broadcast igual,
      // así que el otro lado lo recibe en tiempo real.
      try {
        const saved = await ChatService.sendMessage(conversationId, trimmed);
        setMessages((prev) => prev.map((m) => (m.id === localId ? saved : m)));
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== localId));
        setSendError('No se pudo enviar el mensaje. Revisa tu conexión.');
      }
    },
    [conversationId],
  );

  const notifyTyping = useCallback(() => {
    socketRef.current?.sendTyping();
  }, []);

  const notifyStopTyping = useCallback(() => {
    socketRef.current?.sendStopTyping();
  }, []);

  const notifyRead = useCallback(() => {
    socketRef.current?.sendRead();
  }, []);

  return {
    messages,
    loading,
    connected,
    otherTyping,
    otherOnline,
    sendMessage,
    sendError,
    notifyTyping,
    notifyStopTyping,
    reloadMessages: loadMessages,
    notifyRead,
  };
};
