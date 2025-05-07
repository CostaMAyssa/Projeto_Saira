import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomerEditDialog from './CustomerEditDialog';
import { CustomerDetails } from './types';
import { Edit } from 'lucide-react';

interface CustomerHeaderProps {
  customer: CustomerDetails;
  onSave: (customer: CustomerDetails) => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customer, onSave }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-medium text-pharmacy-text1">Detalhes do Cliente</h3>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-pharmacy-whatsapp-primary border-pharmacy-border1 hover:bg-pharmacy-whatsapp-primary hover:text-white"
        onClick={() => setIsEditDialogOpen(true)}
      >
        <Edit className="h-3.5 w-3.5 mr-1" />
        Editar
      </Button>
      
      <CustomerEditDialog 
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        customer={customer}
        onSave={onSave}
      />
    </div>
  );
};

export default CustomerHeader;
