import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPhoneNumber } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { AvatarWithProfile } from '@/components/ui/avatar-with-profile';
import ConnectionStatus from './ConnectionStatus';

interface ChatHeaderProps {
  activeConversation: string;
  onBackClick?: () => void;
  isMobile: boolean;
  websocketStatus?: 'disconnected' | 'connecting' | 'connected' | 'error';
  realtimeStatus?: 'connected' | 'disconnected';
  onFinalizeConversation?: () => void;
  onFinalizeMessage?: (message: string) => void; // Nova prop para passar a mensagem
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
  realtimeStatus = 'disconnected',
  onFinalizeConversation,
  onFinalizeMessage
}) => {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

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

  const handleFinalizeConversation = async () => {
    if (!activeConversation || isFinalizing) return;

    setIsFinalizing(true);

    try {
      // Mensagem de agradecimento
      const thankYouMessage = "Obrigado pela preferência! Foi um prazer atendê-lo. Até a próxima! 😊";

      // Passar a mensagem para a área de digitação
      if (onFinalizeMessage) {
        console.log('📝 Gerando mensagem de finalização na área de digitação:', thankYouMessage);
        onFinalizeMessage(thankYouMessage);
      }

      console.log('✅ Conversa finalizada com sucesso');
      
      // Chamar callback se fornecido
      if (onFinalizeConversation) {
        onFinalizeConversation();
      }
    } catch (error) {
      console.error('Erro ao finalizar conversa:', error);
    } finally {
      setIsFinalizing(false);
    }
  };

  const name = conversationData?.clients?.name || 'Carregando...';
  const phone = conversationData?.clients?.phone || '';
  
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
          <AvatarWithProfile 
            contactNumber={phone}
            contactName={name}
            size="md"
            className="mr-3"
          />
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            {phone && <span className="text-xs text-gray-600">{formatPhoneNumber(phone)}</span>}
          </div>
        </div>
        
        {/* Botão Finalizar Conversa */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleFinalizeConversation}
          disabled={isFinalizing}
          className="ml-2 px-3 py-1 rounded border border-pharmacy-accent text-pharmacy-accent bg-[#F0F2F5] text-sm hover:bg-pharmacy-accent hover:text-white transition-colors"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          {isFinalizing ? 'Finalizando...' : 'Finalizar Conversa'}
        </Button>
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
