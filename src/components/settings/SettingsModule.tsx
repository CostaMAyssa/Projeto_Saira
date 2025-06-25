import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import SettingsTabs from './components/SettingsTabs';
import ProfileTab from './tabs/ProfileTab';
import WhatsAppTab from './tabs/WhatsAppTab';
// TODO: Implementar funcionalidades antes de descomentar
// import NotificationsTab from './tabs/NotificationsTab';
import SecurityTab from './tabs/SecurityTab';
// import UsersTab from './tabs/UsersTab';

const SettingsModule = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex-1 p-3 md:p-6 overflow-y-auto bg-white">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-pharmacy-text1">Configurações</h1>
      
      <Tabs defaultValue="profile">
        <SettingsTabs defaultValue="profile" />
        
        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <WhatsAppTab />
        </TabsContent>
        
        {/* TODO: Implementar funcionalidade de notificações
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
        */}
        
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
        
        {/* TODO: Implementar funcionalidade de usuários e permissões
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        */}
      </Tabs>
    </div>
  );
};

export default SettingsModule;
