
import React from 'react';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Package, 
  Bell, 
  BarChart, 
  Settings, 
  FileText,
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: React.ElementType; 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-4 cursor-pointer text-pharmacy-green2 hover:text-pharmacy-accent transition-colors",
        active && "text-pharmacy-accent"
      )}
      onClick={onClick}
    >
      <Icon size={24} />
      <span className="text-xs mt-1">{label}</span>
    </div>
  );
};

const Sidebar = ({ activePage, setActivePage }: { activePage: string; setActivePage: (page: string) => void }) => {
  return (
    <div className="h-screen bg-pharmacy-dark1 w-20 flex flex-col items-center py-6 border-r border-pharmacy-dark2">
      <div className="mb-8">
        <div className="w-12 h-12 rounded-full bg-pharmacy-accent flex items-center justify-center text-white font-bold text-lg">
          GP
        </div>
      </div>

      <div className="flex-1 w-full">
        <SidebarItem 
          icon={Home} 
          label="Dashboard" 
          active={activePage === 'dashboard'} 
          onClick={() => setActivePage('dashboard')}
        />
        <SidebarItem 
          icon={MessageSquare} 
          label="WhatsApp" 
          active={activePage === 'chats'} 
          onClick={() => setActivePage('chats')}
        />
        <SidebarItem 
          icon={Users} 
          label="Clientes" 
          active={activePage === 'clients'} 
          onClick={() => setActivePage('clients')}
        />
        <SidebarItem 
          icon={Package} 
          label="Produtos" 
          active={activePage === 'products'} 
          onClick={() => setActivePage('products')}
        />
        <SidebarItem 
          icon={Bell} 
          label="Campanhas" 
          active={activePage === 'campaigns'} 
          onClick={() => setActivePage('campaigns')}
        />
        <SidebarItem 
          icon={BarChart} 
          label="Relatórios" 
          active={activePage === 'reports'} 
          onClick={() => setActivePage('reports')}
        />
        <SidebarItem 
          icon={FileText} 
          label="Formulários" 
          active={activePage === 'forms'} 
          onClick={() => setActivePage('forms')}
        />
      </div>

      <div className="mt-auto w-full">
        <SidebarItem 
          icon={Settings} 
          label="Config." 
          active={activePage === 'settings'} 
          onClick={() => setActivePage('settings')}
        />
        <SidebarItem icon={LogOut} label="Sair" />
      </div>
    </div>
  );
};

export default Sidebar;
