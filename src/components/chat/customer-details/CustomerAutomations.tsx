import React, { useState } from 'react';
import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/components/products/types';

interface Automation {
  type: 'lembrete' | 'aniversario';
  productName: string;
  reminderDate: string;
}

interface CustomerAutomationsProps {
  products: Product[];
  onNovaAutomacaoClick: () => void;
}

const CustomerAutomations: React.FC<CustomerAutomationsProps> = ({ products, onNovaAutomacaoClick }) => {
  const [automations, setAutomations] = useState<Automation[]>([{
    type: 'lembrete',
    productName: 'Losartana 50mg',
    reminderDate: '25/05/2023'
  }]);
  
  const handleAddAutomation = (automation: Automation) => {
    setAutomations([...automations, automation]);
  };
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <h3 className="font-medium text-pharmacy-text1">Automações Ativas</h3>
      </div>
      
      {automations.map((automation, index) => (
        <div key={index} className="mb-2 p-2 bg-pharmacy-light2 rounded-xl">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-pharmacy-text1">
              {automation.type === 'lembrete' ? 'Lembrete de Recompra' : 'Lembrete de Aniversário'}
            </span>
          </div>
          <div className="text-xs text-pharmacy-text2">
            {automation.productName} - Próximo lembrete: {automation.reminderDate}
          </div>
        </div>
      ))}
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-pharmacy-whatsapp-primary border-pharmacy-border1 hover:bg-pharmacy-whatsapp-primary hover:text-white"
        onClick={onNovaAutomacaoClick}
      >
        <Plus className="h-4 w-4 mr-2" />
        Nova Automação
      </Button>
    </div>
  );
};

export default CustomerAutomations;
