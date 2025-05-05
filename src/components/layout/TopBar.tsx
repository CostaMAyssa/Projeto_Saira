
import React from 'react';
import { Bell, Search, User, MessageSquare, Users, Package, FileText, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TopBar = () => {
  return (
    <div className="h-16 bg-pharmacy-dark2 border-b border-pharmacy-dark1 flex items-center justify-between px-4">
      <div className="flex-1">
        <h1 className="text-xl font-medium text-white">Green Pharmacy CRM</h1>
      </div>
      
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, produto ou número..."
            className="pl-8 bg-pharmacy-dark1 border-pharmacy-green1 focus:border-pharmacy-green2"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="h-5 w-5 text-pharmacy-green2 cursor-pointer hover:text-pharmacy-accent transition-colors" />
          <span className="absolute -top-1 -right-1 bg-pharmacy-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
        </div>
        
        <Button size="sm" variant="outline" className="text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white hidden sm:flex">
          <MessageSquare className="h-4 w-4 mr-2" />
          Nova Mensagem
        </Button>
        
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-pharmacy-green1 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <span className="text-white text-sm hidden md:inline">Maria Farmacêutica</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
