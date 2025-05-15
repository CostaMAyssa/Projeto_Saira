
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
      <DialogContent className="bg-white border border-gray-200 text-gray-900 rounded-xl p-4 sm:p-6 shadow-md w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">Editar Observações</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2 resize-none w-full"
            placeholder="Adicione observações sobre o cliente..."
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#A7A45F] text-white hover:bg-[#A7A45F]/90"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditNotesDialog;
