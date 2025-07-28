
import React, { useState } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import ChatModule from '@/components/modules/ChatModule';
import ClientsModule from '@/components/clients/ClientsModule';
import ProductsModule from '@/components/products/ProductsModule';
import CampaignsModule from '@/components/campaigns/CampaignsModule';
import ReportsModule from '@/components/reports/ReportsModule';
import FormsModule from '@/components/forms/FormsModule';
import SettingsModule from '@/components/settings/SettingsModule';

interface ModuleManagerProps {
  activePage: string;
  activeConversation: string | null;
  setActiveConversation: (id: string | null) => void;
  navigateToChat: (conversationId: string) => void;
}

const ModuleManager: React.FC<ModuleManagerProps> = ({ 
  activePage, 
  activeConversation, 
  setActiveConversation, 
  navigateToChat 
}) => {
  
  const renderActiveModule = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'chats':
        return (
          <ChatModule 
            activeConversation={activeConversation} 
            setActiveConversation={setActiveConversation} 
          />
        );
      case 'clients':
        return <ClientsModule navigateToChat={navigateToChat} />;
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
    <>
      {renderActiveModule()}
    </>
  );
};

export default ModuleManager;
