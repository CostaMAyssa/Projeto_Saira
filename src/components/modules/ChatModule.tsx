
import React, { useEffect, useState } from 'react';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import CustomerDetails from '@/components/chat/CustomerDetails';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatModuleProps {
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
}

const ChatModule: React.FC<ChatModuleProps> = ({ 
  activeConversation, 
  setActiveConversation 
}) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    // Layout simplificado para mobile
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeConversation ? (
          <ConversationList 
            activeConversation={activeConversation} 
            setActiveConversation={setActiveConversation} 
          />
        ) : (
          <>
            <div className="flex-1">
              <ChatWindow activeConversation={activeConversation} />
            </div>
            <div className="h-1/4">
              <CustomerDetails activeConversation={activeConversation} />
            </div>
          </>
        )}
      </div>
    );
  } else {
    // Layout para desktop
    return (
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/4 h-full">
          <ConversationList 
            activeConversation={activeConversation} 
            setActiveConversation={setActiveConversation} 
          />
        </div>
        
        <div className="w-2/4 h-full">
          <ChatWindow activeConversation={activeConversation} />
        </div>
        
        <div className="w-1/4 h-full">
          <CustomerDetails activeConversation={activeConversation} />
        </div>
      </div>
    );
  }
};

export default ChatModule;
