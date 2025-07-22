import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SearchFilters from './conversation-list/SearchFilters';
import ConversationItem from './conversation-list/ConversationItem';
import EmptyState from './conversation-list/EmptyState';
import { Conversation } from './types';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/contexts/SupabaseContext';

interface ConversationListProps {
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
}

// Interfaces para tipar os dados vindos do Supabase
interface DbConversation {
  id: string;
  client_id: string;
  status: 'active' | 'closed' | 'waiting';
  last_message_at: string;
  // Assumindo que podemos fazer um JOIN para pegar o nome do cliente
  clients: {
    name: string;
    phone: string;
  } | null;
}

interface LastMessageData {
  content: string;
  sent_at: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  activeConversation, 
  setActiveConversation 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const { user } = useSupabase();
  const userRole = user?.user_metadata?.role || 'atendente';

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        let query = supabase
          .from('conversations')
          .select(`
            id,
            last_message_at,
            assigned_to,
            clients (
              name,
              phone
            )
          `)
          .order('last_message_at', { ascending: false });

        if (userRole !== 'admin' && user) {
          query = query.eq('assigned_to', user.id);
        }

        const { data: conversationsData, error: conversationsError } = await query;

        if (conversationsError) {
          console.error('Erro ao buscar conversas:', conversationsError);
          return;
        }

        if (conversationsData) {
          // 2. Mapear os dados para o formato do frontend
          const conversationsWithDetails = await Promise.all(
            (conversationsData as unknown as DbConversation[]).map(async (conv) => {
              // 3. Buscar a última mensagem para cada conversa
              const { data: lastMessage } = await supabase
                .from('messages')
                .select('content, sent_at')
                .eq('conversation_id', conv.id)
                .order('sent_at', { ascending: false })
                .limit(1);

              const lastMsg = lastMessage && lastMessage[0] as LastMessageData | undefined;

              return {
                id: conv.id,
                name: conv.clients?.name || 'Cliente sem nome',
                phone: conv.clients?.phone || 'N/A',
                lastMessage: lastMsg?.content || 'Nenhuma mensagem ainda',
                time: lastMsg
                  ? new Date(lastMsg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unread: 0, // Lógica de não lidas pode ser implementada depois
                status: 'read' as const,
                tags: [],
              };
            })
          );

          setConversations(conversationsWithDetails);
          setFilteredConversations(conversationsWithDetails);
        }
      } catch (error) {
        console.error('Erro ao processar conversas:', error);
      }
    };

    fetchConversations();
  }, [user, userRole]);

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
    <div className="h-full bg-white border-r border-gray-200 flex flex-col font-sans min-w-0 overflow-hidden">
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
      />
      
      <ScrollArea className="flex-1 overflow-y-auto min-w-0">
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
