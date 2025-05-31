import React, { useState, useEffect } from 'react';
import { Phone, Info, MoreVertical, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPhoneNumber } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface ChatHeaderProps {
  activeConversation: string;
  onBackClick?: () => void;
  isMobile: boolean;
}

interface ConversationData {
  name: string;
  phone_number: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  activeConversation, 
  onBackClick,
  isMobile 
}) => {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);

  useEffect(() => {
    const fetchConversationData = async () => {
      if (!activeConversation) return;

      try {
        const { data, error } = await supabase
          .from('unified_conversations')
          .select('name, phone_number')
          .eq('id', activeConversation)
          .single();

        if (error) {
          console.error('Erro ao buscar dados da conversa:', error);
          return;
        }

        if (data) {
          setConversationData(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados da conversa:', error);
      }
    };

    fetchConversationData();
  }, [activeConversation]);

  const name = conversationData?.name || 'Carregando...';
  const phone = conversationData?.phone_number || '';
  const initial = name.charAt(0).toUpperCase();
  
  return (
    <div className="bg-[#F0F2F5] p-2 border-b border-gray-200 flex items-center justify-between">
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
  );
};

export default ChatHeader;
