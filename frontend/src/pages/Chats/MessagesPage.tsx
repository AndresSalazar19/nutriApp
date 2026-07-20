import { NutritionistLayout } from '../../components/layout/NutritionistLayout';
import { useEffect, useState } from 'react';
import { ChatService, ConversationResponse } from '../../services/Chats/chatService';
import { useChat } from '../../hooks/useChat';
import ConversationsPanel from './ConversationsPanel';
import ChatPanel from './ChatPanel';

const MessagesPage = () => {
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse>();

  const {
    messages,
    loading,
    connected,
    otherTyping,
    otherOnline,
    sendMessage,
    notifyTyping,
    notifyStopTyping,
    notifyRead,
  } = useChat(selectedConversation?.id);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);

      const data = await ChatService.getConversations();

      setConversations(data);

      if (data.length > 0) {
        setSelectedConversation(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleSelectConversation = (conversation: ConversationResponse) => {
    setSelectedConversation(conversation);
  };

  return (
    <NutritionistLayout>
      <div className="flex h-full flex-col bg-gray-100">
        <div className="border-b bg-white px-8 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-800">Centro de Mensajería</h1>

          <p className="mt-1 text-gray-500">Gestiona las conversaciones con tus pacientes.</p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <ConversationsPanel
            loading={loadingConversations}
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
          />

          <ChatPanel
            conversation={selectedConversation}
            messages={messages}
            loading={loading}
            connected={connected}
            otherTyping={otherTyping}
            otherOnline={otherOnline}
            sendMessage={sendMessage}
            notifyTyping={notifyTyping}
            notifyStopTyping={notifyStopTyping}
            notifyRead={notifyRead}
          />
        </div>
      </div>
    </NutritionistLayout>
  );
};

export default MessagesPage;
