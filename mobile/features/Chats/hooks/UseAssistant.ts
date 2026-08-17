import { useEffect, useState } from "react";
import { AssistantService } from "../services/assistantService";

export interface AssistantChatMessage {
    id: string;
    conversation_id?: string;
    sender_id?: string;
    sender_role: 'patient' | 'assistant';
    content: string;
    sent_at: string;
    media_url?: string | null;
    read_at?: string | null;
    pending?: boolean;
}

export function useAssistant() {
    const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await AssistantService.getMessages();
            setMessages(data);
        } catch (e) {
            console.error(e);
            setError('No se pudo cargar el historial.');
        }
    };

    const sendMessage = async (content: string) => {
        const trimmed = content.trim();
        if (!trimmed || loading) return;

        setError(null);
        setLoading(true);

        const localId = `local-${Date.now()}`;
        const userMessage: AssistantChatMessage = {
            id: localId,
            sender_role: 'patient',
            content: trimmed,
            sent_at: new Date().toISOString(),
            pending: true,
        };

        setMessages((prev) => [...prev, userMessage]);

        try {
            const assistantMessage = await AssistantService.sendMessage(trimmed);
            setMessages((prev) => [
                ...prev.map((m) => (m.id === localId ? { ...m, pending: false } : m)),
                assistantMessage,
            ]);
        } catch (e: any) {
            setMessages((prev) => prev.filter((m) => m.id !== localId));
            setError(e?.message ?? 'El asistente no respondió. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return { messages, loading, error, sendMessage, reload: loadMessages };
}