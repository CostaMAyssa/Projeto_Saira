
import React, { useState, useEffect } from 'react';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import CustomerDetails from '@/components/chat/CustomerDetails';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronRight, UserCircle } from 'lucide-react';

interface ChatModuleProps {
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
}

const ChatModule: React.FC<ChatModuleProps> = ({ 
  activeConversation, 
  setActiveConversation 
}) => {
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  const [saleMessage, setSaleMessage] = useState<string>(''); // Estado para mensagem de venda
  const { totalUnread, markConversationAsRead } = useUnreadMessages();
  
  // Reset details panel state when changing conversations on mobile
  useEffect(() => {
    if (isMobile) {
      setShowDetails(false);
    }
  }, [activeConversation, isMobile]);

  // Função para capturar mensagem de venda
  const handleSaleMessage = (message: string) => {
    console.log('📥 ChatModule recebeu mensagem de venda:', message);
    setSaleMessage(message);
  };

  // Limpar mensagem de venda quando a conversa mudar
  useEffect(() => {
    setSaleMessage('');
  }, [activeConversation]);

  // Marcar conversa como lida quando selecionada
  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    markConversationAsRead(conversationId);
  };

  // FORÇAR LAYOUT DESKTOP SE NÃO FOR MOBILE
  if (!isMobile) {
    // Desktop layout with três colunas fixas - AJUSTADO PARA SER MAIS ROBUSTO
    return (
      <div className="flex-1 flex overflow-hidden h-full font-sans">
        {/* Coluna da lista de conversas - LARGURA FIXA */}
        <div className="w-80 min-w-80 max-w-80 h-full border-r border-gray-200">
          <ConversationList 
            activeConversation={activeConversation} 
            setActiveConversation={handleConversationSelect} 
          />
        </div>
        
        {/* Coluna do chat - FLEXÍVEL MAS COM LARGURA MÍNIMA */}
        <div className="flex-1 min-w-0 h-full">
          <ChatWindow 
            activeConversation={activeConversation} 
            isMobile={false}
            saleMessage={saleMessage}
          />
        </div>
        
        {/* Coluna de detalhes do cliente - LARGURA FIXA */}
        <div className="w-80 min-w-80 max-w-80 h-full border-l border-gray-200">
          <CustomerDetails 
            activeConversation={activeConversation} 
            onSaleMessage={handleSaleMessage}
          />
        </div>
      </div>
    );
  }

  // Layout para mobile
  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {!activeConversation ? (
        // Mobile conversation list view
        <div className="flex-1 flex flex-col h-full">
          <ConversationList 
            activeConversation={activeConversation} 
            setActiveConversation={handleConversationSelect} 
          />
        </div>
      ) : (
        // Mobile chat view with slide-out customer details
        <div className="flex-1 flex flex-col h-full">
          <ChatWindow 
            activeConversation={activeConversation} 
            onBackClick={() => setActiveConversation(null)}
            isMobile={true}
            saleMessage={saleMessage}
          />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline"
                className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-md bg-[#00A884] hover:bg-[#008069] text-white z-50"
              >
                <UserCircle className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[85vw] sm:max-w-md">
              <CustomerDetails 
                activeConversation={activeConversation} 
                onSaleMessage={handleSaleMessage}
              />
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};

export default ChatModule;
