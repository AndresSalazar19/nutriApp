import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatService, MessageResponse } from '../services/Chats/chatService';
import { ChatSocket, SocketMessage } from '../services/Chats/websocket';

interface UseChatReturn {
  messages: MessageResponse[];
  loading: boolean;
  connected: boolean;
  sendMessage: (content: string) => void;
  reloadMessages: () => Promise<void>;
}

export const useChat = (conversationId?: string): UseChatReturn => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<ChatSocket | null>(null);

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);

      const response = await ChatService.getMessages(conversationId);

      setMessages(response.messages);
    } catch (error) {
      console.error('Error cargando mensajes', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    loadMessages();

    const socket = new ChatSocket();

    socket.connect(
      conversationId,

      (event: SocketMessage) => {
        switch (event.type) {
          case 'message':
            setMessages((previous) => [...previous, event as MessageResponse]);
            break;

          case 'typing':
            console.log('El otro usuario está escribiendo...');
            break;

          case 'stop_typing':
            console.log('Dejó de escribir');
            break;

          case 'read':
            console.log('Mensajes leídos');
            break;

          case 'user_connected':
            console.log('Usuario conectado');
            break;

          case 'user_disconnected':
            console.log('Usuario desconectado');
            break;

          default:
            break;
        }
      },

      () => {
        setConnected(true);
      },

      () => {
        setConnected(false);
      },

      () => {
        setConnected(false);
      },
    );

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [conversationId, loadMessages]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    socketRef.current?.sendMessage(content);
  };

  return {
    messages,
    loading,
    connected,
    sendMessage,
    reloadMessages: loadMessages,
  };
};
