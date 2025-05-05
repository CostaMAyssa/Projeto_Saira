
import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import CustomerDetails from '@/components/chat/CustomerDetails';

const Index = () => {
  const [activePage, setActivePage] = useState('chats');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <div className="flex-1 flex overflow-hidden">
          {activePage === 'chats' && (
            <>
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
            </>
          )}
          
          {activePage !== 'chats' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4 text-pharmacy-accent">
                  {activePage === 'home' ? 'Dashboard' : 
                  activePage === 'clients' ? 'Clientes' : 
                  activePage === 'products' ? 'Produtos' : 
                  activePage === 'campaigns' ? 'Campanhas' : 
                  activePage === 'schedule' ? 'Agenda' : 'Configurações'}
                </h2>
                <p className="text-lg text-pharmacy-green2">Esta seção está em construção.</p>
                <p className="text-pharmacy-green2 mt-2">Por favor, acesse a seção de Chats para visualizar a funcionalidade disponível.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
