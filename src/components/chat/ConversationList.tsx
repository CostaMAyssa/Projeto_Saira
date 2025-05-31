import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SearchFilters from './conversation-list/SearchFilters';
import ConversationItem from './conversation-list/ConversationItem';
import EmptyState from './conversation-list/EmptyState';
import { Conversation } from './types';
import { supabase } from '@/lib/supabase';

interface ConversationListProps {
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
}

interface UnifiedConversationData {
  id: string;
  phone_number: string;
  name: string;
  last_message_at: string;
  status: string;
  started_at: string;
  created_at: string;
}

interface LastMessageData {
  content: string;
  sent_at: string;
  sender: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  activeConversation, 
  setActiveConversation 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Buscar conversas da view unificada
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('unified_conversations')
          .select('*')
          .order('last_message_at', { ascending: false });

        if (conversationsError) {
          console.error('Erro ao buscar conversas:', conversationsError);
          return;
        }

        if (conversationsData) {
          // Buscar última mensagem para cada conversa
          const conversationsWithMessages = await Promise.all(
            (conversationsData as UnifiedConversationData[]).map(async (conv) => {
              const { data: lastMessage } = await supabase
                .from('messages')
                .select('content, sent_at, sender')
                .eq('conversation_id', conv.id)
                .order('sent_at', { ascending: false })
                .limit(1)
                .single();

              // Buscar contagem de mensagens não lidas (assumindo que mensagens do client são não lidas até serem marcadas)
              const { count: unreadCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .eq('sender', 'client');

              const lastMsg = lastMessage as LastMessageData | null;

              return {
                id: conv.id,
                name: conv.name || 'Cliente sem nome',
                phone: conv.phone_number || 'N/A',
                lastMessage: lastMsg?.content || 'Nenhuma mensagem',
                time: lastMsg 
                  ? new Date(lastMsg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : new Date(conv.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unread: unreadCount || 0,
                status: 'read' as const, // Por enquanto, sempre como lida
                tags: [], // Implementar tags futuramente se necessário
              };
            })
          );

          setConversations(conversationsWithMessages);
          setFilteredConversations(conversationsWithMessages);
        }
      } catch (error) {
        console.error('Erro ao buscar conversas:', error);
      }
    };

    fetchConversations();
  }, []);

  // Apply filters when search term or filter type changes
  useEffect(() => {
    let filtered = conversations;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        convo => 
          convo.name.toLowerCase().includes(term) || 
          convo.phone.toLowerCase().includes(term)
      );
    }
    
    // Apply read/unread filter
    if (filterType === 'unread') {
      filtered = filtered.filter(convo => convo.unread > 0);
    }
    
    setFilteredConversations(filtered);
  }, [searchTerm, filterType, conversations]);
  
  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col font-sans">
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
      />
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="pb-4">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversation === conversation.id}
                onClick={() => setActiveConversation(conversation.id)}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
