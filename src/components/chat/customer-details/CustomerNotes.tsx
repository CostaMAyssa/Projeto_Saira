
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
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
        <FileText className="h-4 w-4 text-pharmacy-green2" />
        <h3 className="font-medium text-white">Observações</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">{notes}</p>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white mt-3"
        onClick={() => setIsEditNotesDialogOpen(true)}
      >
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
