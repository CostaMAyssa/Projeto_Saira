
import React, { useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddAutomationDialog from './AddAutomationDialog';
import { Product } from './types';

interface CustomerAutomationsProps {
  products: Product[];
}

const CustomerAutomations: React.FC<CustomerAutomationsProps> = ({ products }) => {
  const [isAddAutomationDialogOpen, setIsAddAutomationDialogOpen] = useState(false);
  const [automations, setAutomations] = useState<any[]>([{
    type: 'lembrete',
    productName: 'Losartana 50mg',
    reminderDate: '25/05/2023'
  }]);
  
  const handleAddAutomation = (automation: any) => {
    setAutomations([...automations, automation]);
  };
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-pharmacy-green2" />
        <h3 className="font-medium text-white">Automações Ativas</h3>
      </div>
      
      {automations.map((automation, index) => (
        <div key={index} className="mb-2 p-2 bg-pharmacy-dark2 rounded-xl">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-white">
              {automation.type === 'lembrete' ? 'Lembrete de Recompra' : 'Lembrete de Aniversário'}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {automation.productName} - Próximo lembrete: {automation.reminderDate}
          </div>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white"
        onClick={() => setIsAddAutomationDialogOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Nova Automação
      </Button>
      
      <AddAutomationDialog 
        open={isAddAutomationDialogOpen}
        setOpen={setIsAddAutomationDialogOpen}
        onAddAutomation={handleAddAutomation}
        products={products.map(p => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
};

export default CustomerAutomations;
