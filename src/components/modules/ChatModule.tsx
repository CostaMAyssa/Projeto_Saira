
import React, { useState, useEffect } from 'react';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import CustomerDetails from '@/components/chat/CustomerDetails';
import { useIsMobile } from '@/hooks/use-mobile';
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

  // FORÇAR LAYOUT DESKTOP SE NÃO FOR MOBILE
  if (!isMobile) {
    // Desktop layout with três colunas fixas
    return (
      <div className="flex-1 flex overflow-hidden h-full font-sans">
        <div className="basis-1/4 min-w-0 h-full">
          <ConversationList 
            activeConversation={activeConversation} 
            setActiveConversation={setActiveConversation} 
          />
        </div>
        
        <div className="basis-2/4 min-w-0 h-full">
          <ChatWindow 
            activeConversation={activeConversation} 
            isMobile={false}
            saleMessage={saleMessage}
          />
        </div>
        
        <div className="basis-1/4 min-w-0 h-full">
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
            setActiveConversation={setActiveConversation} 
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
