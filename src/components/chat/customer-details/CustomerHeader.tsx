
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import CustomerEditDialog from './CustomerEditDialog';
import { CustomerDetails } from './types';

interface CustomerHeaderProps {
  customer: CustomerDetails;
  onSave: (customer: CustomerDetails) => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ customer, onSave }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-medium text-white">Detalhes do Cliente</h3>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white"
        onClick={() => setIsEditDialogOpen(true)}
      >
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
