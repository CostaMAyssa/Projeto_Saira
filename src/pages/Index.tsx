import React, { useState, useEffect } from 'react';
import ModuleManager from '@/components/modules/ModuleManager';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

const Index = () => {
  const [activePage, setActivePage] = useState('dashboard');
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
  
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          <ModuleManager activePage={activePage} />
        </div>
      </div>
    </div>
  );
};

export default Index;
