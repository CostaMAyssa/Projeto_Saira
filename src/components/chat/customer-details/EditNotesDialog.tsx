
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EditNotesDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialNotes: string;
  onSave: (notes: string) => void;
}

const EditNotesDialog: React.FC<EditNotesDialogProps> = ({ open, setOpen, initialNotes, onSave }) => {
  const [notes, setNotes] = useState(initialNotes);
  
  const handleSave = () => {
    onSave(notes);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-pharmacy-dark2 text-white border-pharmacy-dark1">
        <DialogHeader>
          <DialogTitle className="text-pharmacy-green2">Editar Observações</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="bg-pharmacy-dark1 border-pharmacy-green1 text-white resize-none w-full"
            placeholder="Adicione observações sobre o cliente..."
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="text-pharmacy-green2 border-pharmacy-green1 hover:bg-pharmacy-green1 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-pharmacy-accent hover:bg-pharmacy-green1"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditNotesDialog;
