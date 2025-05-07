import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import CustomerDetails from '@/components/chat/CustomerDetails';
import ClientsModule from '@/components/clients/ClientsModule';
import ProductsModule from '@/components/products/ProductsModule';
import CampaignsModule from '@/components/campaigns/CampaignsModule';
import ReportsModule from '@/components/reports/ReportsModule';
import FormsModule from '@/components/forms/FormsModule';
import SettingsModule from '@/components/settings/SettingsModule';
import Dashboard from '@/components/dashboard/Dashboard';

const Index = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Verifica se a tela é mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar na inicialização
    checkIfMobile();
    
    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  const renderActiveModule = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'chats':
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
      case 'clients':
        return <ClientsModule />;
      case 'products':
        return <ProductsModule />;
      case 'campaigns':
        return <CampaignsModule />;
      case 'reports':
        return <ReportsModule />;
      case 'forms':
        return <FormsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-pharmacy-accent">
                Módulo em Desenvolvimento
              </h2>
              <p className="text-base sm:text-lg text-pharmacy-green2">Esta seção está em construção.</p>
              <p className="text-pharmacy-green2 mt-2">Por favor, escolha outro módulo no menu lateral.</p>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 flex overflow-hidden">
          {renderActiveModule()}
        </div>
      </div>
    </div>
  );
};

export default Index;
