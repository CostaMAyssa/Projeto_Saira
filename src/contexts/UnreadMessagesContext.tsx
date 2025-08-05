import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UnreadMessagesContextType {
  totalUnread: number;
  markConversationAsRead: (conversationId: string) => Promise<void>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

export const UnreadMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      console.log('🔄 Buscando contagem de mensagens não lidas...');
      
      const { data, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .is('read_at', null)
        .eq('sender', 'client');

      if (error) {
        console.error('Erro ao buscar contagem de não lidas:', error);
        return;
      }

      const newCount = data?.length || 0;
      console.log('📊 Nova contagem de não lidas:', newCount);
      setTotalUnread(newCount);
    } catch (error) {
      console.error('Erro ao processar contagem:', error);
    }
  };

  useEffect(() => {
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
      console.log('🔍 Marcando conversa como lida:', conversationId);
      
      // Usar query direta em vez da função RPC
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .is('read_at', null)
        .eq('sender', 'client');

      if (error) {
        console.error('❌ Erro ao marcar conversa como lida:', error);
        return;
      }

      console.log('✅ Conversa marcada como lida com sucesso');
      
      // Aguardar um pouco antes de atualizar o contador para garantir que o banco foi atualizado
      setTimeout(async () => {
        console.log('🔄 Atualizando contador após marcar como lida...');
        await fetchUnreadCount();
      }, 100);
      
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