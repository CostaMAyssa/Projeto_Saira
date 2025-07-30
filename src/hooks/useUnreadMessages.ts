import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useUnreadMessages = () => {
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        console.log('🔍 useUnreadMessages: Iniciando busca de mensagens não lidas');
        
        const { data, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .is('read_at', null)
          .eq('sender', 'client');

        if (error) {
          console.error('❌ useUnreadMessages: Erro ao buscar contagem de não lidas:', error);
          return;
        }

        const unreadCount = data?.length || 0;
        console.log(`📊 useUnreadMessages: Encontradas ${unreadCount} mensagens não lidas`);
        setTotalUnread(unreadCount);
      } catch (error) {
        console.error('❌ useUnreadMessages: Erro ao processar contagem:', error);
      }
    };

    console.log('🚀 useUnreadMessages: Inicializando hook');
    fetchUnreadCount();

    // Subscription para atualizações em tempo real
    console.log('📡 useUnreadMessages: Configurando subscription para mensagens');
    const subscription = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('🔔 useUnreadMessages: Mudança detectada na tabela messages:', {
            eventType: payload.eventType,
            table: payload.table,
            schema: payload.schema,
            new: payload.new,
            old: payload.old
          });
          
          // Recarregar contagem quando houver mudanças
          console.log('🔄 useUnreadMessages: Recarregando contagem de não lidas');
          fetchUnreadCount();
        }
      )
      .subscribe((status) => {
        console.log('📡 useUnreadMessages: Status da subscription:', status);
      });

    return () => {
      console.log('🔌 useUnreadMessages: Desconectando subscription');
      subscription.unsubscribe();
    };
  }, []);

  const markConversationAsRead = async (conversationId: string) => {
    try {
      console.log(`📖 useUnreadMessages: Marcando conversa ${conversationId} como lida`);
      
      await supabase.rpc('mark_messages_as_read', {
        conversation_id_param: conversationId
      });
      
      console.log(`✅ useUnreadMessages: Conversa ${conversationId} marcada como lida`);
    } catch (error) {
      console.error('❌ useUnreadMessages: Erro ao marcar conversa como lida:', error);
    }
  };

  return {
    totalUnread,
    markConversationAsRead
  };
};