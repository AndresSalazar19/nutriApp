import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ChatService,
    ConversationResponse,
    MessageResponse,
} from '../services/chatService';
import { ChatSocket, SocketMessage } from '../services/websocket';

export interface UseDoctorChatParams {
    nutritionistId: string;
}

export interface UseDoctorChatResult {
    conversation: ConversationResponse | null;
    messages: MessageResponse[];
    loading: boolean;
    error: string | null;
    otherTyping: boolean;
    otherOnline: boolean;
    sendMessage: (content: string) => Promise<void>;
    notifyTyping: () => void;
    notifyStopTyping: () => void;
    notifyRead: () => void;
}

/**
 * Busca (o crea) la conversación con el nutricionista, carga el historial,
 * conecta el WebSocket para tiempo real y expone todo lo que necesita la screen.
 */
export function useDoctorChat({ nutritionistId }: UseDoctorChatParams): UseDoctorChatResult {
    const [conversation, setConversation] = useState<ConversationResponse | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [otherTyping, setOtherTyping] = useState(false);
    const [otherOnline, setOtherOnline] = useState(false);
    const socketRef = useRef<ChatSocket | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            setLoading(true);
            setError(null);
            setOtherOnline(false);
            setOtherTyping(false);

            if (!nutritionistId) {
                setLoading(false);
                setError('Aún no tienes un nutricionista asignado.');
                return;
            }

            try {
                // 1. Reutiliza la conversación si ya existe, si no la crea
                const existing = await ChatService.getConversations().catch(() => []);
                let conv = existing.find(
                    (c) => c.conversation_type === 'human' && c.nutritionist_id === nutritionistId,
                );

                if (!conv) {
                    conv = await ChatService.createConversation({ participant_id: nutritionistId });
                }

                if (cancelled) return;
                setConversation(conv);

                // 2. Carga el historial por REST
                const { messages: history } = await ChatService.getMessages(conv.id);
                if (cancelled) return;
                setMessages(history);

                // 3. Conecta el WebSocket para lo que llegue después
                const socket = new ChatSocket();
                const convId = conv.id;

                await socket.connect(convId, (data: SocketMessage) => {
                    if (cancelled) return;

                    if (data.type === 'message' && data.id) {
                        setMessages((prev) => {
                            if (prev.some((m) => m.id === data.id)) return prev;
                            // Reemplaza el mensaje optimista propio si coincide en contenido reciente
                            const optimisticIdx = prev.findIndex(
                                (m) => m.id.startsWith('local-') && m.content === data.content,
                            );
                            const next = [...prev];
                            const realMessage: MessageResponse = {
                                id: data.id!,
                                conversation_id: data.conversation_id ?? convId,
                                sender_id: data.sender_id ?? '',
                                sender_role: data.sender_role ?? 'nutritionist',
                                content: data.content ?? '',
                                sent_at: data.sent_at ?? new Date().toISOString(),
                                read_at: data.read_at ?? null,
                            };
                            if (optimisticIdx !== -1) {
                                next[optimisticIdx] = realMessage;
                                return next;
                            }
                            const updated = [...next, realMessage];

                            updated.sort(
                                (a, b) =>
                                    new Date(a.sent_at).getTime() -
                                    new Date(b.sent_at).getTime(),
                            );

                            return updated;
                        });
                    }

                    if (data.type === 'typing' && data.user_id === nutritionistId) {
                        setOtherTyping(true);
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000);
                    }

                    if (data.type === 'stop_typing' && data.user_id === nutritionistId) {
                        setOtherTyping(false);
                    }

                    if (data.type === "user_connected" && data.user_id === nutritionistId) {
                        setOtherOnline(true);
                    }

                    if (data.type === "user_disconnected" && data.user_id === nutritionistId) {
                        setOtherOnline(false);
                    }

                    if (data.type === "read") {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.sender_role === "patient" && !m.read_at
                                    ? {
                                        ...m,
                                        read_at: new Date().toISOString(),
                                    }
                                    : m,
                            ),
                        );
                    }
                });

                if (cancelled) {
                    socket.disconnect();
                    return;
                }

                socketRef.current = socket;
            } catch (err: any) {
                if (!cancelled) setError(err?.message ?? 'No se pudo cargar la conversación');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void init();

        return () => {
            cancelled = true;
            socketRef.current?.disconnect();
            socketRef.current = null;
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [nutritionistId]);

    const sendMessage = useCallback(
        async (content: string) => {
            const trimmed = content.trim();
            if (!trimmed || !conversation) return;

            const localId = `local-${Date.now()}`;
            const optimistic: MessageResponse = {
                id: localId,
                conversation_id: conversation.id,
                sender_id: 'me',
                sender_role: 'patient',
                content: trimmed,
                sent_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, optimistic]);
            setError(null);

            if (socketRef.current?.isConnected()) {
                socketRef.current.sendMessage(trimmed);
                return;
            }

            // Socket caído: se envía por REST y el backend hace broadcast
            try {
                const saved = await ChatService.sendMessage(conversation.id, trimmed);
                setMessages((prev) => prev.map((m) => (m.id === localId ? saved : m)));
            } catch {
                setMessages((prev) => prev.filter((m) => m.id !== localId));
                setError('No se pudo enviar el mensaje. Revisa tu conexión.');
            }
        },
        [conversation],
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
        conversation,
        messages,
        loading,
        error,
        otherTyping,
        sendMessage,
        notifyTyping,
        notifyStopTyping,
        otherOnline,
        notifyRead,
    };
}