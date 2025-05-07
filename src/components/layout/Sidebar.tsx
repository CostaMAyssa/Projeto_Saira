import React from 'react';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Package, 
  Bell, 
  BarChart, 
  Settings, 
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LogoImage from '@/lib/assets/Logo.png';

interface SidebarProps {
  activePage?: string;
  setActivePage?: (page: string) => void;
}

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

const Sidebar = ({ activePage = 'dashboard', setActivePage }: SidebarProps) => {
  const handleSetPage = (page: string) => {
    if (setActivePage) {
      setActivePage(page);
    }
  };

  return (
    <div className="h-screen bg-pharmacy-dark1 w-20 flex flex-col items-center py-6 border-r border-pharmacy-dark2">
      <div className="mb-8 flex flex-col items-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 bg-gradient-to-br from-pharmacy-accent via-pharmacy-green1 to-pharmacy-green2 rounded-full opacity-40 blur-md"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={LogoImage}
              alt="Logo Sairá"
              className="w-full h-full rounded-full object-cover drop-shadow-[0_0_8px_rgba(145,146,92,0.6)]"
            />
          </div>
        </div>
        <div className="mt-1 text-xs font-bold tracking-tight logo-text">
          <span className="text-pharmacy-green2">Saíra</span>
        </div>
      </div>

      <div className="flex-1 w-full">
        <SidebarItem 
          icon={Home} 
          label="Dashboard" 
          active={activePage === 'dashboard'} 
          onClick={() => handleSetPage('dashboard')}
        />
        <SidebarItem 
          icon={MessageSquare} 
          label="WhatsApp" 
          active={activePage === 'chats'} 
          onClick={() => handleSetPage('chats')}
        />
        <SidebarItem 
          icon={Users} 
          label="Clientes" 
          active={activePage === 'clients'} 
          onClick={() => handleSetPage('clients')}
        />
        <SidebarItem 
          icon={Package} 
          label="Produtos" 
          active={activePage === 'products'} 
          onClick={() => handleSetPage('products')}
        />
        <SidebarItem 
          icon={Bell} 
          label="Campanhas" 
          active={activePage === 'campaigns'} 
          onClick={() => handleSetPage('campaigns')}
        />
        <SidebarItem 
          icon={BarChart} 
          label="Relatórios" 
          active={activePage === 'reports'} 
          onClick={() => handleSetPage('reports')}
        />
        <SidebarItem 
          icon={FileText} 
          label="Formulários" 
          active={activePage === 'forms'} 
          onClick={() => handleSetPage('forms')}
        />
      </div>

      <div className="mt-auto w-full">
        <SidebarItem 
          icon={Settings} 
          label="Config." 
          active={activePage === 'settings'} 
          onClick={() => handleSetPage('settings')}
        />
      </div>
    </div>
  );
};

export default Sidebar;
