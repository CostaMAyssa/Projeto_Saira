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
      {/* Botão Editar removido daqui, pois será controlado pelo CustomerDetails */}
    </div>
  );
};

export default CustomerHeader;
