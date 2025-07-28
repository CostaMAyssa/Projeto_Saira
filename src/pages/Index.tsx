import React, { useState, useEffect } from 'react';
import ModuleManager from '@/components/modules/ModuleManager';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

const Index = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const { totalUnread } = useUnreadMessages();
  
  // Atualizar título da página com contagem de mensagens não lidas
  useEffect(() => {
    const baseTitle = 'Green Pharmacy Chat';
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [totalUnread]);

  // Função para navegar para o chat com uma conversa específica
  const navigateToChat = (conversationId: string) => {
    setActiveConversation(conversationId);
    setActivePage('chats');
  };
  
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <ModuleManager 
            activePage={activePage} 
            activeConversation={activeConversation}
            setActiveConversation={setActiveConversation}
            navigateToChat={navigateToChat}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
