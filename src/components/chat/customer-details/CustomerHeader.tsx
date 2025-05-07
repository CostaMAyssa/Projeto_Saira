
import React from 'react';
import { Button } from '@/components/ui/button';

interface CustomerHeaderProps {
  name: string;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ name }) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-medium text-white">Detalhes do Cliente</h3>
      <Button variant="outline" size="sm" className="text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white">
        Editar
      </Button>
    </div>
  );
};

export default CustomerHeader;
