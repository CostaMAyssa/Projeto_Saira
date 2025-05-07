
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerNotesProps {
  notes: string;
}

const CustomerNotes: React.FC<CustomerNotesProps> = ({ notes }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-pharmacy-green2" />
        <h3 className="font-medium text-white">Observações</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">{notes}</p>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white mt-3"
      >
        Editar Observações
      </Button>
    </div>
  );
};

export default CustomerNotes;
