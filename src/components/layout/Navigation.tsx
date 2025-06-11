import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Activity, 
  Settings, 
  BarChart3,
  Home
} from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/chat',
      label: 'Chat',
      icon: MessageSquare,
      description: 'Sistema de atendimento'
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Monitor de eventos'
    },
    {
      path: '/configuracoes',
      label: 'Configurações',
      icon: Settings,
      description: 'Configurar integrações'
    }
  ];

  return (
    <nav className="bg-white border-b border-pharmacy-border1 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-pharmacy-accent" />
          <h1 className="text-xl font-bold text-pharmacy-text1">Green Pharmacy Chat</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`flex items-center space-x-2 ${
                    isActive 
                      ? 'bg-pharmacy-accent hover:bg-pharmacy-accent/90 text-white' 
                      : 'hover:bg-pharmacy-light1'
                  }`}
                  size="sm"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 