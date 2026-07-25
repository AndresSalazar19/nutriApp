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

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const data = await AssistantService.getMessages();
            setMessages(data);
        } catch (e) {
            console.error(e);
        }
    };

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        setLoading(true);

        try {
            // mensaje del usuario (optimista)
            const userMessage: AssistantChatMessage = {
                id: Date.now().toString(),
                sender_role: "patient",
                content,
                sent_at: new Date().toISOString(),
                pending: true,
            };

            setMessages(prev => [...prev, userMessage]);

            const assistantMessage =
                await AssistantService.sendMessage(content);

            setMessages(prev => [...prev, assistantMessage]);
        } finally {
            setLoading(false);
        }
    };

    return {
        messages,
        loading,
        sendMessage,
        reload: loadMessages,
    };
}