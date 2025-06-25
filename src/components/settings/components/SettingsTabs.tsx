import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Phone, Bell, Lock, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SettingsTabsProps {
  defaultValue: string;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ defaultValue }) => {
  const isMobile = useIsMobile();
  
  return (
    <TabsList className={`bg-white border border-pharmacy-border1 rounded-lg mb-4 md:mb-6 ${isMobile ? 'flex flex-wrap gap-1 p-1' : ''}`}>
      <TabsTrigger value="profile" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
        <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
        {!isMobile && "Perfil"}
      </TabsTrigger>
      <TabsTrigger value="whatsapp" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
        <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
        {!isMobile && "WhatsApp"}
      </TabsTrigger>
      {/* TODO: Implementar funcionalidade de notificações
      <TabsTrigger value="notifications" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
        <Bell className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
        {!isMobile && "Notificações"}
      </TabsTrigger>
      */}
      <TabsTrigger value="security" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
        <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
        {!isMobile && "Segurança"}
      </TabsTrigger>
      {/* TODO: Implementar funcionalidade de usuários e permissões
      <TabsTrigger value="users" className="data-[state=active]:bg-pharmacy-accent data-[state=active]:text-white text-pharmacy-text1 text-xs md:text-sm">
        <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
        {!isMobile && "Usuários e Permissões"}
      </TabsTrigger>
      */}
    </TabsList>
  );
};

export default SettingsTabs;
