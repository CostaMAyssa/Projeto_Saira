import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UnreadMessagesContextType {
  totalUnread: number;
  markConversationAsRead: (conversationId: string) => Promise<void>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

export const UnreadMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

    // Subscription para atualizações em tempo real - ÚNICA INSTÂNCIA
    const subscription = supabase
      .channel('unread-messages-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'sender=eq.client'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: 'sender=eq.client'
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

  return (
    <UnreadMessagesContext.Provider value={{ totalUnread, markConversationAsRead }}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (context === undefined) {
    throw new Error('useUnreadMessages deve ser usado dentro de um UnreadMessagesProvider');
  }
  return context;
}; 