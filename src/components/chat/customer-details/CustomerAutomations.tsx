
import React from 'react';
import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CustomerAutomations: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-pharmacy-green2" />
        <h3 className="font-medium text-white">Automações Ativas</h3>
      </div>
      
      <div className="mb-2 p-2 bg-pharmacy-dark2 rounded-xl">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-white">Lembrete de Recompra</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Losartana 50mg - Próximo lembrete: 25/05/2023
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nova Automação
      </Button>
    </div>
  );
};

export default CustomerAutomations;
