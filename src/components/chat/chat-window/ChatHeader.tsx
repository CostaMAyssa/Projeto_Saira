import React, { useState, useEffect } from 'react';
import { Phone, Info, MoreVertical, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPhoneNumber } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import ConnectionStatus from './ConnectionStatus';

interface ChatHeaderProps {
  activeConversation: string;
  onBackClick?: () => void;
  isMobile: boolean;
  websocketStatus?: 'disconnected' | 'connecting' | 'connected' | 'error';
  realtimeStatus?: 'connected' | 'disconnected';
}

interface ConversationData {
  clients: {
    name: string;
    phone: string;
  } | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  activeConversation, 
  onBackClick,
  isMobile,
  websocketStatus = 'disconnected',
  realtimeStatus = 'disconnected'
}) => {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);

  useEffect(() => {
    const fetchConversationData = async () => {
      if (!activeConversation) return;

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            clients (
              name,
              phone
            )
          `)
          .eq('id', activeConversation)
          .single();

        if (error) {
          console.error('Erro ao buscar dados da conversa:', error);
          return;
        }

        if (data) {
          const clientInfo = Array.isArray(data.clients) ? data.clients[0] : data.clients;
          setConversationData({ clients: clientInfo });
        }
      } catch (error) {
        console.error('Erro ao buscar dados da conversa:', error);
      }
    };

    fetchConversationData();
  }, [activeConversation]);

  const name = conversationData?.clients?.name || 'Carregando...';
  const phone = conversationData?.clients?.phone || '';
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <div className="bg-[#F0F2F5] p-2 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isMobile && onBackClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              className="text-gray-600 hover:bg-gray-200 rounded-full h-9 w-9 mr-1"
            >
              <ChevronLeft size={20} />
            </Button>
          )}
          <div className="w-10 h-10 rounded-full bg-[#DFE5E7] flex items-center justify-center text-gray-600 font-medium mr-3">
            {initial}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            {phone && <span className="text-xs text-gray-600">{formatPhoneNumber(phone)}</span>}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-200 rounded-full h-9 w-9">
            <Phone size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-200 rounded-full h-9 w-9">
            <Info size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-200 rounded-full h-9 w-9">
            <MoreVertical size={20} />
          </Button>
        </div>
      </div>
      
      {/* Status de conexão */}
      <div className="mt-2 flex justify-center">
        <ConnectionStatus 
          websocketStatus={websocketStatus}
          realtimeStatus={realtimeStatus}
        />
      </div>
    </div>
  );
};

export default ChatHeader;
