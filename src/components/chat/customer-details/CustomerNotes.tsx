import React, { useState } from 'react';
import { FileText, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditNotesDialog from './EditNotesDialog';

interface CustomerNotesProps {
  notes: string;
  onSaveNotes: (notes: string) => void;
}

const CustomerNotes: React.FC<CustomerNotesProps> = ({ notes, onSaveNotes }) => {
  const [isEditNotesDialogOpen, setIsEditNotesDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-pharmacy-whatsapp-primary" />
        <h3 className="font-medium text-pharmacy-text1">Observações</h3>
      </div>
      
      <p className="text-sm text-pharmacy-text2 p-2 bg-pharmacy-light2 rounded-xl min-h-[60px]">{notes}</p>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-pharmacy-whatsapp-primary border-pharmacy-border1 hover:bg-pharmacy-whatsapp-primary hover:text-white mt-3"
        onClick={() => setIsEditNotesDialogOpen(true)}
      >
        <Edit className="h-3.5 w-3.5 mr-1" />
        Editar Observações
      </Button>
      
      <EditNotesDialog 
        open={isEditNotesDialogOpen}
        setOpen={setIsEditNotesDialogOpen}
        initialNotes={notes}
        onSave={onSaveNotes}
      />
    </div>
  );
};

export default CustomerNotes;
