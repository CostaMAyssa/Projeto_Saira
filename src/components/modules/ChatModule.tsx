
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
  
  // Reset details panel state when changing conversations on mobile
  useEffect(() => {
    if (isMobile) {
      setShowDetails(false);
    }
  }, [activeConversation, isMobile]);
  
  if (isMobile) {
    // Layout for mobile devices
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
            />
            
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline"
                  className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-md bg-pharmacy-whatsapp-primary hover:bg-pharmacy-whatsapp-primary/90 text-white z-10"
                >
                  <UserCircle className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-[85vw] sm:max-w-md">
                <CustomerDetails activeConversation={activeConversation} />
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    );
  } else {
    // Desktop layout with three columns
    return (
      <div className="flex-1 flex overflow-hidden h-full">
        <div className="w-1/4 h-full">
          <ConversationList 
            activeConversation={activeConversation} 
            setActiveConversation={setActiveConversation} 
          />
        </div>
        
        <div className="w-2/4 h-full">
          <ChatWindow 
            activeConversation={activeConversation} 
            isMobile={false}
          />
        </div>
        
        <div className="w-1/4 h-full">
          <CustomerDetails activeConversation={activeConversation} />
        </div>
      </div>
    );
  }
};

export default ChatModule;
