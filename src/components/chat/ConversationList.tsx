import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SearchFilters from './conversation-list/SearchFilters';
import ConversationItem from './conversation-list/ConversationItem';
import EmptyState from './conversation-list/EmptyState';
import { Conversation } from './types';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/contexts/SupabaseContext';
import { formatMessageTimestamp } from '@/lib/utils';

interface ConversationListProps {
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
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

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (!user) return;

        // Voltar para a estrutura original que funcionava
        let query = supabase
          .from('conversations')
          .select(`
            id,
            last_message_at,
            assigned_to,
            clients (
              id,
              name,
              phone
            )
          `)
          .eq('assigned_to', user.id)
          .order('last_message_at', { ascending: false });

        const { data: conversationsData, error } = await query;

        if (error) {
          console.error('Erro ao buscar conversas:', error);
          return;
        }

        if (conversationsData) {
          // Buscar última mensagem e contagem de não lidas para cada conversa
          const conversationsWithDetails = await Promise.all(
            conversationsData.map(async (conv: any) => {
              // Buscar última mensagem
              const { data: lastMessage } = await supabase
                .from('messages')
                .select('content, sent_at, sender')
                .eq('conversation_id', conv.id)
                .order('sent_at', { ascending: false })
                .limit(1)
                .single();

              // Contar mensagens não lidas (apenas de clientes)
              const { count: unreadCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .eq('sender', 'client')
                .is('read_at', null);

              return {
                id: conv.id,
                name: conv.clients?.name || 'Cliente sem nome',
                phone: conv.clients?.phone || 'N/A',
                lastMessage: lastMessage?.content || 'Nenhuma mensagem ainda',
                time: lastMessage?.sent_at 
                  ? formatMessageTimestamp(lastMessage.sent_at)
                  : '',
                unread: unreadCount || 0,
                status: (unreadCount || 0) > 0 ? 'unread' as const : 'read' as const,
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

    // Configurar subscription para atualizações em tempo real
    const subscription = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Recarregar conversas quando houver mudanças nas mensagens
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

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

  // Função para marcar mensagens como lidas quando uma conversa é selecionada
  const handleConversationClick = async (conversationId: string) => {
    setActiveConversation(conversationId);
    
    // Marcar mensagens como lidas se a função existir
    try {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        conversation_id_param: conversationId
      });
      
      if (!error) {
        // Atualizar o estado local para refletir a mudança imediatamente
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unread: 0, status: 'read' as const }
              : conv
          )
        );
      }
    } catch (error) {
      // Se a função não existir, apenas continuar sem marcar como lida
      console.log('Função mark_messages_as_read não disponível ainda');
    }
  };
  
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
                onClick={() => handleConversationClick(conversation.id)}
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
