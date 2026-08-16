import { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';

import { ConversationResponse } from '../../services/Chats/chatService';

interface Props {
  loading: boolean;
  conversations: ConversationResponse[];
  selectedConversation?: ConversationResponse | null;
  onSelectConversation: (conversation: ConversationResponse) => void;
}

const ConversationsPanel = ({
  loading,
  conversations,
  selectedConversation,
  onSelectConversation,
}: Props) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const matchesSearch =
        !search.trim() ||
        conversation.participant_name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || conversation.unread_count > 0;
      return matchesSearch && matchesFilter;
    });
  }, [conversations, search, filter]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const formatTime = (date?: string | null) => {
    if (!date) return '';

    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="w-80 border-r bg-white p-4">
        <p className="text-center text-gray-500">Cargando conversaciones...</p>
      </div>
    );
  }

  return (
    <div className="flex w-[320px] flex-col border-r border-[#E1E8DC] bg-white">
      {/* Buscador */}

      <div className="p-4">
        <div className="flex items-center rounded-xl border border-[#E1E8DC] bg-[#FAFBF8] px-3">
          <FiSearch className="text-[#9AA396]" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#9AA396]"
            placeholder="Buscar conversación..."
          />
        </div>
      </div>

      {/* Filtros */}

      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-4 py-1 text-xs font-medium transition ${
            filter === 'all' ? 'bg-[#1F4D3A] text-white' : 'border border-[#E1E8DC] text-[#6D796C]'
          }`}
        >
          Todas
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={`rounded-full px-4 py-1 text-xs font-medium transition ${
            filter === 'unread'
              ? 'bg-[#1F4D3A] text-white'
              : 'border border-[#E1E8DC] text-[#6D796C]'
          }`}
        >
          No leídas
        </button>
      </div>

      {/* Lista */}

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 && (
          <div className="py-10 text-center text-sm text-[#9AA396]">No hay conversaciones</div>
        )}

        {filteredConversations.map((conversation) => {
          const isSelected = selectedConversation?.id === conversation.id;

          return (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`flex cursor-pointer gap-3 border-l-4 px-5 py-4 transition hover:bg-[#FAFBF8]
                            ${isSelected ? 'border-[#4C9A6A] bg-[#FAFBF8]' : 'border-transparent'}`}
            >
              {/* Avatar */}

              {conversation.participant_avatar ? (
                <img
                  src={conversation.participant_avatar}
                  alt={conversation.participant_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4C9A6A] to-[#1F4D3A] font-semibold text-white shadow-sm">
                  {getInitials(conversation.participant_name)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="truncate font-semibold text-[#1B241C]">
                    {conversation.participant_name}
                  </h3>

                  {conversation.unread_count > 0 && (
                    <span className="rounded-full bg-[#E5484D] px-2 py-0.5 text-[10px] font-medium text-white">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>

                <p className="truncate text-sm text-[#6D796C]">
                  {conversation.last_message ?? 'Sin mensajes'}
                </p>

                <span className="text-xs text-[#9AA396]">
                  {formatTime(conversation.last_message_time)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationsPanel;
