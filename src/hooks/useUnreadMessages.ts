import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useUnreadMessages = () => {
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .is('read_at', null)
          .eq('sender', 'client');

        if (error) {
          console.error('Erro ao buscar contagem de não lidas:', error);
          return;
        }

        setTotalUnread(data?.length || 0);
      } catch (error) {
        console.error('Erro ao processar contagem:', error);
      }
    };

    fetchUnreadCount();

    // Subscription para atualizações em tempo real
    const subscription = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const markConversationAsRead = async (conversationId: string) => {
    try {
      await supabase.rpc('mark_messages_as_read', {
        conversation_id_param: conversationId
      });
    } catch (error) {
      console.error('Erro ao marcar conversa como lida:', error);
    }
  };

  return {
    totalUnread,
    markConversationAsRead
  };
};